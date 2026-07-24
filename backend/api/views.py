from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
import datetime
from .eld_engine import simulate_eld_events
from rest_framework import generics, permissions
from django.contrib.auth.models import User
from .models import Trip
from .serializers import RegisterSerializer, TripListSerializer, TripDetailSerializer
from .eld_formatter import generate_daily_logs

from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({"status": "healthy"})

class RouteCalculateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        start_time = request.data.get('start_time')
        if not start_time:
            start_time = datetime.datetime.now().isoformat()
        current_cycle_used = float(request.data.get('current_cycle_used', 0))
        cycle_limit = int(request.data.get('cycle_limit', 70))  # 60 or 70
        if cycle_limit not in (60, 70):
            cycle_limit = 70
        
        current_loc = request.data.get('current', [])
        pickup_loc = request.data.get('pickup', [])
        dropoff_loc = request.data.get('dropoff', [])
        
        if not (current_loc and pickup_loc and dropoff_loc):
            return Response({"error": "Missing locations"}, status=400)
            
        import requests
        
        # OSRM expects: {lon},{lat};{lon},{lat}...
        coords_str = f"{current_loc[0]},{current_loc[1]};{pickup_loc[0]},{pickup_loc[1]};{dropoff_loc[0]},{dropoff_loc[1]}"
        osrm_url = f"http://router.project-osrm.org/route/v1/driving/{coords_str}?steps=true&geometries=geojson&annotations=true"
        
        try:
            resp = requests.get(osrm_url)
            resp.raise_for_status()
            osrm_data = resp.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 400:
                return Response({"error": "No driving route found between these locations. They may be too far apart or separated by an ocean."}, status=400)
            return Response({"error": f"Routing service returned an error ({e.response.status_code}). Please try again later."}, status=500)
        except requests.exceptions.RequestException:
            return Response({"error": "Failed to connect to the routing service. Please check your connection and try again."}, status=500)
        except Exception as e:
            return Response({"error": "An unexpected error occurred while calculating the route."}, status=500)
            
        if osrm_data.get("code") != "Ok":
            return Response({"error": "OSRM returned no route"}, status=400)
            
        # Pass legs to ELD engine so we can distinguish Current -> Pickup and Pickup -> Dropoff
        legs = osrm_data['routes'][0]['legs']
        events_list = simulate_eld_events(legs, start_time, current_cycle_used, cycle_limit)
        daily_logs = generate_daily_logs(events_list, start_time)
        
        return Response({
            "events": events_list,
            "routeGeoJSON": osrm_data,
            "dailyLogs": daily_logs
        })

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class TripListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TripDetailSerializer
        return TripListSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TripDetailSerializer

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)

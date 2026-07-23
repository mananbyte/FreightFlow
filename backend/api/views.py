import requests
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
def health_check(request):
    return Response({'status': 'healthy', 'message': 'API is running'})

@api_view(['POST'])
def calculate_route(request):
    data = request.data
    current = data.get('current')
    pickup = data.get('pickup')
    dropoff = data.get('dropoff')

    if not current or not pickup or not dropoff:
        return Response({'error': 'Missing coordinates'}, status=status.HTTP_400_BAD_REQUEST)

    def to_lon_lat(coord):
        return f"{coord[1]},{coord[0]}"

    coords_str = ";".join([
        to_lon_lat(current),
        to_lon_lat(pickup),
        to_lon_lat(dropoff)
    ])

    osrm_url = f'http://router.project-osrm.org/route/v1/driving/{coords_str}?geometries=geojson&overview=full'

    try:
        resp = requests.get(osrm_url)
        resp.raise_for_status()
        data = resp.json()
        
        # OSRM returns {"routes": [{"geometry": ...}]}, but frontend expects {"features": [{"geometry": ...}]}
        if data.get('code') == 'Ok' and len(data.get('routes', [])) > 0:
            formatted_response = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": data['routes'][0]['geometry'],
                        "properties": {}
                    }
                ]
            }
            return Response(formatted_response)
        else:
            return Response({'error': 'No route found'}, status=status.HTTP_404_NOT_FOUND)
            
    except requests.exceptions.RequestException as e:
        return Response({
            'error': str(e),
            'details': resp.text if 'resp' in locals() and hasattr(resp, 'text') else ''
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

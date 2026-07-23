from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('routes/calculate/', views.RouteCalculateView.as_view(), name='calculate_route'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('trips/', views.TripListCreateView.as_view(), name='trip-list-create'),
    path('trips/<int:pk>/', views.TripDetailView.as_view(), name='trip-detail'),
]

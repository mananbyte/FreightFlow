from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('routes/calculate/', views.RouteCalculateView.as_view(), name='calculate_route'),
]

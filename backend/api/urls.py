from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('routes/calculate/', views.calculate_route, name='calculate_route'),
]

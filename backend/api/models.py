from django.db import models
from django.contrib.auth.models import User

class Trip(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    current_location = models.CharField(max_length=255)
    pickup = models.CharField(max_length=255)
    dropoff = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    cycle_hours_used = models.FloatField(default=0.0)
    cycle_limit = models.IntegerField(default=70)
    events_json = models.JSONField(default=list)
    daily_logs_json = models.JSONField(default=list)
    route_geojson = models.JSONField(default=dict)
    is_completed = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

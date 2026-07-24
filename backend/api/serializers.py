from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Trip

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        if 'name' in validated_data and validated_data['name']:
            user.first_name = validated_data['name']
            user.save()
        return user

class TripListSerializer(serializers.ModelSerializer):
    log_days = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = ('id', 'name', 'pickup', 'dropoff', 'current_location', 'created_at', 'log_days', 'cycle_hours_used', 'is_completed')

    def get_log_days(self, obj):
        return len(obj.daily_logs_json) if obj.daily_logs_json else 0

class TripDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

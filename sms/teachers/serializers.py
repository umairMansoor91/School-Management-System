from .models import Teacher, TeacherPay, GenerateTeacherPay
from rest_framework import serializers

class TeacherSerializer (serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'

class TeacherPaySerializer (serializers.ModelSerializer):
    class Meta:
        model = TeacherPay
        fields = '__all__'

class GenTeachersPaySerializer (serializers.ModelSerializer):
    class Meta:
        model = GenerateTeacherPay
        fields = '__all__'

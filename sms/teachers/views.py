from django.shortcuts import render
from rest_framework import generics
from .serializers import TeacherSerializer, TeacherPaySerializer, GenTeachersPaySerializer
from .models import Teacher, TeacherPay, GenerateTeacherPay

# Create your views here.
class TeacherApiView (generics.ListCreateAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

class TeacherPayApiView (generics.ListCreateAPIView):
    queryset = TeacherPay.objects.all()
    serializer_class = TeacherPaySerializer

class GenTeacherPayApiView (generics.ListCreateAPIView):
    queryset = GenerateTeacherPay.objects.all()
    serializer_class = GenTeachersPaySerializer

class TeacherRetrieveUpdateDestroyApiView (generics.RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer

class TeacherPayRetrieveUpdateDestroyApiView (generics.RetrieveUpdateDestroyAPIView):
    queryset = TeacherPay.objects.all()
    serializer_class = TeacherPaySerializer

class GenTeacherPayRetrieveUpdateDelete (generics.RetrieveUpdateDestroyAPIView):
    queryset = GenerateTeacherPay.objects.all()
    serializer_class = GenTeachersPaySerializer

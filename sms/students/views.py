from rest_framework import  generics
from .models import Student, StudentFee, FeeGeneration
from .serializers import StudentFeeSerializer, StudentSerializer, StudentFeeUpdateSerializer, FeeGenSerializer
# Create your views here.

class StudentFeeListCreateView (generics.ListCreateAPIView):
    queryset = StudentFee.objects.all()
    serializer_class = StudentFeeSerializer

class StudentFeeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentFee.objects.all()
    serializer_class = StudentFeeSerializer


class StudentListCreateView (generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class StudentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class FeeUpdateRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentFee.objects.all()
    serializer_class = StudentFeeUpdateSerializer

class FeeGenListCreateView (generics.ListCreateAPIView):
    queryset = FeeGeneration.objects.all()
    serializer_class = FeeGenSerializer
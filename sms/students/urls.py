from django.urls import path
from .views import StudentFeeListCreateView, StudentFeeRetrieveUpdateDestroyView, FeeGenListCreateView,StudentListCreateView, StudentRetrieveUpdateDestroyView, FeeUpdateRetrieveUpdateDestroyView

urlpatterns = [
    path('api/studentfees/', StudentFeeListCreateView.as_view(), name='studentfee-list'),
    path('api/studentfees/<int:pk>/', StudentFeeRetrieveUpdateDestroyView.as_view(), name='studentfee-detail'),
    path('api/students/', StudentListCreateView.as_view(), name='studend-list'),
    path('api/students/<int:pk>/', StudentRetrieveUpdateDestroyView.as_view(), name='student-detail'),
    path('api/feeupdate/<int:pk>/', FeeUpdateRetrieveUpdateDestroyView.as_view(), name='fee-detail'),
    path('api/feegen/', FeeGenListCreateView.as_view(), name='fee-gen')
]

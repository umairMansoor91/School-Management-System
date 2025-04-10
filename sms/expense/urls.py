from django.urls import path
from .views import ExpenseListCreateAPIView, ExpenseRetrieveUpdateDestroyAPIView

urlpatterns = [
    path('api/expenses/', ExpenseListCreateAPIView.as_view(), name='expense-list-create'),
    path('api/expenses/<int:pk>/', ExpenseRetrieveUpdateDestroyAPIView.as_view(), name='expense-detail'),
]
from rest_framework import generics
from .models import Expense
from .serializers import ExpenseSerializer

# List all expenses or create a new one
class ExpenseListCreateAPIView(generics.ListCreateAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

# Retrieve, update, or delete a specific expense by ID
class ExpenseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
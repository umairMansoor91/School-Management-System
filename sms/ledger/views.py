from .models import Ledger
from rest_framework import generics
from .serializers import LedgerSerializer

# Create your views here.

class LedgerListCreateApiView (generics.ListCreateAPIView):
    queryset = Ledger.objects.all()
    serializer_class = LedgerSerializer

class LedgerRetrieveUpdateDestroyApiView (generics.RetrieveUpdateDestroyAPIView):
    queryset = Ledger.objects.all()
    serializer_class = LedgerSerializer

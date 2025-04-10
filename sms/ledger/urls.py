from django.urls import path
from .views import LedgerListCreateApiView, LedgerRetrieveUpdateDestroyApiView

urlpatterns = [
    path('api/ledger/', LedgerListCreateApiView.as_view(), name='ledger-list'),
    path('api/ledger/<int:pk>/', LedgerRetrieveUpdateDestroyApiView.as_view(), name='ledger-detail'),
]
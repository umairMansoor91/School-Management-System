from django.core.management.base import BaseCommand
from sms.utils import calculate_monthly_profit  # Ensure this import is correct

class Command(BaseCommand):
    help = 'Populate the Ledger table with monthly profit data'

    def handle(self, *args, **kwargs):
        # Call the function to populate the ledger
        calculate_monthly_profit()
        self.stdout.write(self.style.SUCCESS('Ledger populated successfully'))

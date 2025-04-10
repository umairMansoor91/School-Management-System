from django.contrib import admin
from .models import Ledger

@admin.register(Ledger)
class LedgerAdmin(admin.ModelAdmin):
    list_display = ('formatted_month', 'MonthlyStudentFees', 'MonthlyTeacherPays', 'MonthlyExpenses', 'MonthlyProfit')

    def formatted_month(self, obj):
        # Format the month to display the full month name (e.g., "April")
        return obj.month.strftime('%B')  
    formatted_month.short_description = 'Month'  
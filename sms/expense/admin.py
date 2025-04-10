from django.contrib import admin
from .models import Expense

# Register your models here.
@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("id", "category", "description", "amount", "date")
    list_filter = ("category", "date")
    search_fields = ("description",)
    ordering = ("-date",)

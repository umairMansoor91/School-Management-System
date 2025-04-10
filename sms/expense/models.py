from django.db import models

# Create your models here.
class Expense(models.Model):
    class ExpenseCategory(models.TextChoices):
        SALARIES = 'SALARIES', 'Salaries'
        RENT = 'RENT', 'Rent'
        UTILITY_BILLS = 'UTILITY_BILLS', 'Utility Bills'
        ACADEMIC_EXPENSES = 'ACADEMIC_EXPENSES', 'Academic Expenses'
        ADMIN_GEN_EXPENSES = 'ADMIN_GEN_EXPENSES', 'Adm/ Gen Expenses'

    id = models.AutoField(primary_key=True)
    category = models.CharField(
        max_length=30,
        choices=ExpenseCategory.choices
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()

    def __str__(self):
        return f"{self.category} - {self.amount}"
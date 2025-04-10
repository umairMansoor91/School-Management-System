from django.db import models

class Ledger(models.Model):
    month = models.DateField(unique=True)  # Ensure that each month has only one entry
    MonthlyStudentFees = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    MonthlyTeacherPays = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    MonthlyExpenses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    MonthlyProfit = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Ledger for {self.month.strftime('%B %Y')}"

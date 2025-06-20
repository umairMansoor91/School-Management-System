# Generated by Django 5.2 on 2025-04-05 09:15

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Expense',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('category', models.CharField(choices=[('SALARIES', 'Salaries'), ('RENT', 'Rent'), ('UTILITY_BILLS', 'Utility Bills'), ('ACADEMIC_EXPENSES', 'Academic Expenses'), ('ADMIN_GEN_EXPENSES', 'Adm/ Gen Expenses')], max_length=30)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('description', models.TextField(blank=True, null=True)),
                ('date', models.DateField(auto_now_add=True)),
            ],
        ),
    ]

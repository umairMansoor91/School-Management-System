from django.db.models import Sum
from django.db.models.functions import TruncMonth
from students.models import StudentFee
from teachers.models import TeacherPay
from expense.models import Expense
from ledger.models import Ledger

def calculate_monthly_profit():
    # 1. Calculate total student fees by month
    student_fees = (
        StudentFee.objects
        .annotate(annotated_month=TruncMonth('month'))  # Renamed annotation
        .values('annotated_month')  # Use the new name
        .annotate(total_student_fees=Sum('total_fee'))
    )

    # 2. Calculate total teacher salaries by month
    teacher_salaries = (
        TeacherPay.objects
        .annotate(annotated_month=TruncMonth('month'))  # Renamed annotation
        .values('annotated_month')  # Use the new name
        .annotate(total_teacher_salaries=Sum('pay'))
        .order_by('annotated_month')  # Add ordering to fix the issue
    )

    # 3. Calculate total expenses by month
    expenses = (
        Expense.objects
        .annotate(annotated_month=TruncMonth('date'))  # Renamed annotation
        .values('annotated_month')  # Use the new name
        .annotate(total_expenses=Sum('amount'))
        .order_by('annotated_month')  # Add ordering to fix the issue
    )

    # Combine all data
    monthly_data = []

    for month in student_fees:
        # Initialize a dictionary to store the month data
        month_data = {
            'month': month['annotated_month'],  # Use the renamed annotation
            'total_student_fees': month['total_student_fees'],
            'total_teacher_salaries': 0,
            'total_expenses': 0,
            'monthly_profit': 0,
        }

        # Get teacher salaries for the same month
        teacher_salary = teacher_salaries.filter(annotated_month=month['annotated_month']).first()  # Use the renamed annotation
        if teacher_salary:
            month_data['total_teacher_salaries'] = teacher_salary['total_teacher_salaries']

        # Get expenses for the same month
        expense = expenses.filter(annotated_month=month['annotated_month']).first()  # Use the renamed annotation
        if expense:
            month_data['total_expenses'] = expense['total_expenses']

        # Calculate monthly profit
        month_data['monthly_profit'] = (
            month_data['total_student_fees'] 
            - month_data['total_teacher_salaries'] 
            - month_data['total_expenses']
        )

        # Create or update the Ledger entry for the month
        ledger_entry, created = Ledger.objects.update_or_create(
            month=month_data['month'],
            defaults={
                'MonthlyStudentFees': month_data['total_student_fees'],
                'MonthlyTeacherPays': month_data['total_teacher_salaries'],
                'MonthlyExpenses': month_data['total_expenses'],
                'MonthlyProfit': month_data['monthly_profit'],
            }
        )

        # Add the data to the result list
        monthly_data.append(month_data)

    return monthly_data

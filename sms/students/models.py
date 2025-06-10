from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum
from datetime import date


class Alumni(models.Model):
    roll_no = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=50)
    grade = models.IntegerField()
    father_name = models.CharField(max_length=50)
    contact = models.CharField(max_length=50)
    DOB = models.DateField(null=True, blank=True)
    admission_date = models.DateField(null=True, blank=True)
    address = models.TextField()
    graduated_on = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (Roll no: {self.roll_no})"


class Student(models.Model):
    roll_no = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    grade = models.IntegerField()
    father_name = models.CharField(max_length=50)
    contact = models.CharField(max_length=50)
    DOB = models.DateField(null=True, blank=True)
    admission_date = models.DateField(null=True, blank=True)
    address = models.TextField()
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    security_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    admission_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pending_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    scanned_doc = models.FileField(upload_to='scanned_docs/', null=True, blank=True)
    enrolled = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} (Roll no: {self.roll_no})"

    def save(self, *args, **kwargs):
        is_refund = False
        if self.pk:
            old = Student.objects.get(pk=self.pk)
            is_refund = old.enrolled and not self.enrolled

        super().save(*args, **kwargs)

        if is_refund:
            if not StudentFee.objects.filter(student=self, description="Security refund").exists():
                StudentFee.objects.create(
                    student=self,
                    tuition_fee=0,
                    exam_fee=0,
                    ac_charges=0,
                    stationary_charges=0,
                    admission_fee=0,
                    lab_charges=0,
                    security_fee=-self.security_fee,
                    misc=0,
                    amount_paid=-self.security_fee,
                    balance=0,
                    description="Security refund",
                    paid=True
                )


class StudentFee(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    month = models.DateField(default=date.today)
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, default=6500)
    exam_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    ac_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stationary_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    admission_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lab_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    security_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    misc = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(max_length=100, null=True, blank=True)
    pending = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_fee = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.name} - {self.month.strftime('%B %Y')}"

    def save(self, *args, **kwargs):
        # 1. Compute total fee including carried pending
        self.total_fee = (
            self.tuition_fee + self.exam_fee + self.ac_charges + self.stationary_charges +
            self.security_fee + self.admission_fee + self.lab_charges + self.misc + self.pending
        )

        # 2. Compute balance and mark as paid regardless of amount
        self.balance = max(self.total_fee - self.amount_paid, 0)
        if self.amount_paid != 0:
            self.paid = True

        else:
            self.paid = False

        super().save(*args, **kwargs)

        # 3. Update total pending fee for the student
        latest_fee = StudentFee.objects.filter(student=self.student).order_by('-month', '-id').first()

        if latest_fee:
            Student.objects.filter(pk=self.student.pk).update(pending_fee=latest_fee.balance)


class FeeGeneration(models.Model):
    serial = models.AutoField(primary_key=True)
    month = models.DateField()
    exam_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    ac_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stationary_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lab_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Fee Generated for: {self.month.strftime('%B %Y')}"


# Signal: Create StudentFee when a new student is added
@receiver(post_save, sender=Student)
def create_student_fee(sender, instance, created, **kwargs):
    if created:
        StudentFee.objects.create(
            student=instance,
            tuition_fee=instance.tuition_fee,
            admission_fee=instance.admission_fee,
            security_fee=instance.security_fee,
            exam_fee=0,
            ac_charges=0,
            stationary_charges=0,
            misc=0
        )


# Signal: Generate monthly fees for all enrolled students
@receiver(post_save, sender=FeeGeneration)
def generate_fees_for_students(sender, instance, created, **kwargs):
    if created:
        students = Student.objects.filter(enrolled=True)

        for student in students:
            StudentFee.objects.create(
                student=student,
                month=instance.month,
                tuition_fee=student.tuition_fee,
                pending=student.pending_fee,
                exam_fee=instance.exam_fee,
                ac_charges=instance.ac_charges,
                stationary_charges=instance.stationary_charges,
                admission_fee=0,
                lab_charges=instance.lab_charges,
                security_fee=0
            )

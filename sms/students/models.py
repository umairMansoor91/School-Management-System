from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import datetime

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
    tution_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    security_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    admission_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    scanned_doc = models.ImageField(upload_to='scanned_docs/', null=True, blank=True)
    enrolled = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} (Roll no: {self.roll_no})"
    
    def save(self, *args, **kwargs):
        is_refund = not self.enrolled and self.pk is not None
        super().save(*args, **kwargs)

        if is_refund:
            StudentFee.objects.create(
                student=self,
                # Do not pass 'month' because it's auto_now_add
                tuition_fee=0,
                exam_fee=0,
                ac_charges=0,  # contact is string, so pass 0 instead
                stationary_charges=0,  # DOB is date, pass 0
                admission_fee=0,  # admission_date is date, pass 0
                lab_charges=0,  # address is string, pass 0
                security_fee=-self.security_fee,
                misc=0,
                description="Security refund",
                total_fee=-self.security_fee,
                paid=True
            )
            

class StudentFee(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    month = models.DateField(auto_now_add=True)  
    tuition_fee = models.DecimalField(max_digits=10, decimal_places=2, default=6500)
    exam_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    ac_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stationary_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    admission_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lab_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    security_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    misc = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(max_length=100, null=True, blank=True)
    total_fee = models.DecimalField(max_digits=10, decimal_places=2)
    paid = models.BooleanField(default=False)


    def save(self, *args, **kwargs):
        # Automatically calculate total fee
        self.total_fee = self.tuition_fee + self.exam_fee + self.ac_charges + self.stationary_charges + self.security_fee + self.admission_fee + self.lab_charges + self.misc
        super().save(*args, **kwargs)

class FeeGeneration(models.Model):
    serial = models.AutoField(primary_key=True)
    month = models.DateField()
    exam_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    ac_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stationary_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lab_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"(Fee Generated for : {self.month})"
    
    


# Signal to create StudentFee when a new Student is created
@receiver(post_save, sender=Student)
def create_student_fee(sender, instance, created, **kwargs):
    if created:
        StudentFee.objects.create(
            student=instance,
            tuition_fee=instance.tution_fee,  
            admission_fee=instance.admission_fee,  
            security_fee=instance.security_fee,  
            exam_fee=0,
            ac_charges=0,
            stationary_charges=0,
            misc = 0,
        )

@receiver(post_save, sender=FeeGeneration)
def generate_fees_for_students(sender, instance, created, **kwargs):
    if created:  # Only generate fees when a new FeeGeneration entry is created
        students = Student.objects.filter(enrolled=True)  # Get all enrolled students

        for student in students:
            total_fee = (
                student.tution_fee +  # Student's tuition fee
                instance.exam_fee +
                instance.ac_charges +
                instance.stationary_charges +
                instance.lab_charges 
            )

            # Create StudentFee record for each student
            StudentFee.objects.create(
                student=student,
                tuition_fee=student.tution_fee,  # Use the student's tuition fee
                exam_fee=instance.exam_fee,
                ac_charges=instance.ac_charges,
                stationary_charges=instance.stationary_charges,
                admission_fee=0,  # Only required at admission
                lab_charges=instance.lab_charges,
                security_fee=0,  # Only required at admission
                total_fee=total_fee
            )




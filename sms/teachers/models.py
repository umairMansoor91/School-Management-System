from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class Teacher(models.Model):
    name = models.CharField(max_length=50)
    contact = models.CharField(max_length=20)
    cnic = models.CharField(max_length=50)
    qualification = models.CharField(max_length=20)
    pay = models.IntegerField(default=0)
    joining_date = models.DateField(auto_now_add=True)
    enrolled = models.BooleanField(default=True)
    teacher_doc = models.FileField(upload_to='scanned_docs_teachers/', null=True, blank=True)

    def __str__(self):
        return f"Mr. {self.name}"


class TeacherPay(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    month = models.DateField()
    pay = models.IntegerField(default=0)
    paid = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.teacher.name} - {self.month}"


class GenerateTeacherPay(models.Model):
    month = models.DateField()

    def __str__(self):
        return f"Pay for month: {self.month}"


@receiver(post_save, sender=GenerateTeacherPay)
def generate_pay_for_teachers(sender, instance, created, **kwargs):
    if created:
        active_teachers = Teacher.objects.filter(enrolled=True)
        for teacher in active_teachers:
            TeacherPay.objects.create(
                teacher=teacher,
                pay=teacher.pay,
                month=instance.month
            )


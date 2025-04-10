from django.contrib import admin
from teachers.models import Teacher, TeacherPay, GenerateTeacherPay

# Register your models here.
@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "contact", "cnic", "qualification", "pay", "joining_date", "enrolled")
    list_filter = ("enrolled",)


@admin.register(TeacherPay)
class TeacherPayAdmin(admin.ModelAdmin):
    list_display = ("teacher", "month", "pay", "paid")
    list_filter = ("paid", "month")


@admin.register(GenerateTeacherPay)
class GenerateTeacherPayAdmin(admin.ModelAdmin):
    list_display = ("id", "month")
    list_filter = ("month",)


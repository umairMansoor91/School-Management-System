from django.contrib import admin
from students.models import Student, StudentFee, Alumni, FeeGeneration

# Register your models here.
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("roll_no", "name", "father_name", "grade", 'contact', "DOB", 'admission_date',  "address", "tution_fee", "security_fee","scanned_doc", "enrolled")
    search_fields = ("name", "roll_number", "grade")
    list_filter = ("grade",)

@admin.register(StudentFee)
class StudentFeeAdmin(admin.ModelAdmin):
    list_display = ('student', 'month', 'tuition_fee', 'exam_fee', 'ac_charges', 'stationary_charges', 'security_fee', 'admission_fee','total_fee', 'paid')
    search_fields = ('student__name', 'month', 'paid')
    list_filter = ('month', 'student__grade', 'paid')

@admin.register(Alumni)
class AlumniAdmin(admin.ModelAdmin):
    list_display = ("roll_no", "name", "father_name", 'contact', "grade", "DOB", "address", 'admission_date', "graduated_on")
    search_fields = ("name", "roll_number", "grade")
    list_filter = ("grade",)

@admin.register(FeeGeneration)
class FeeGenerationAdmin(admin.ModelAdmin):
    list_display = ('serial', 'formatted_month')
    search_fields = ("serial",) 

    def formatted_month(self, obj):
        return obj.month.strftime('%d %b %Y')  # e.g., "12 Mar 2025"
    formatted_month.short_description = 'Month'
    
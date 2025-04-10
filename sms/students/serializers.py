from rest_framework import serializers
from students.models import Student, StudentFee, FeeGeneration

class StudentSerializer (serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class FeeGenSerializer (serializers.ModelSerializer):
    class Meta:
        model = FeeGeneration
        fields = '__all__'

class StudentFeeUpdateSerializer (serializers.ModelSerializer):
    class Meta:
        model = StudentFee
        fields = '__all__'

class StudentInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['roll_no', 'name', 'grade']

class StudentFeeSerializer(serializers.ModelSerializer):
    student_info = StudentInfoSerializer(source='student')
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), write_only=True)

    class Meta:
        model = StudentFee
        fields = [
            'id', 'student', 'student_info', 'month', 'tuition_fee', 'exam_fee', 'ac_charges',
            'stationary_charges', 'admission_fee', 'lab_charges', 'security_fee', 'misc', 'description',
            'total_fee', 'paid'
        ]
        read_only_fields = ['total_fee']

    def update(self, instance, validated_data):
        # Extract and update nested student info
        student_data = validated_data.pop('student', None)
        student_info_data = self.initial_data.get('student_info')

        if student_info_data:
            student = instance.student
            for attr, value in student_info_data.items():
                if hasattr(student, attr):
                    setattr(student, attr, value)
            student.save()

        # Update other fields in StudentFee
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

from django.urls import path
from .views import TeacherApiView, TeacherPayApiView, GenTeacherPayApiView, TeacherRetrieveUpdateDestroyApiView, TeacherPayRetrieveUpdateDestroyApiView, GenTeacherPayRetrieveUpdateDelete

urlpatterns = [
    path("api/teacher/", TeacherApiView.as_view(), name="teacher-list" ),
    path("api/teacherpay/", TeacherPayApiView.as_view(), name="teacher-pay-list" ),
    path("api/genteacherpay/", GenTeacherPayApiView.as_view(), name="gen-teacher-pay-list" ),
    path("api/teacher/<int:pk>/", TeacherRetrieveUpdateDestroyApiView.as_view(), name="teacher-detail" ),
    path("api/teacherpay/<int:pk>/", TeacherPayRetrieveUpdateDestroyApiView.as_view(), name="teacher-pay-detail" ),
    path("api/genteacherpay/<int:pk>/", GenTeacherPayRetrieveUpdateDelete.as_view(), name="gen-teacher-pay-detail" ),
]

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from . import views

from penguin_mail.api import api

urlpatterns = [
    path('admin/', admin.site.urls),
#<<<<<<< HEAD
#    path('api/emails/', views.create_email, name='api_create_email'),
#]
#=======
    path('api/v1/', api.urls),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

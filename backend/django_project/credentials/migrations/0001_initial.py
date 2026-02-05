from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Users',
            fields=[
                ('UserID', models.BigAutoField(primary_key=True, serialize=False)),
                ('UserName', models.CharField(max_length=150)),
            ],
        ),
        migrations.CreateModel(
            name='UserEmail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('userEmails', models.EmailField(max_length=254)),
                ('Password', models.CharField(max_length=128)),
                ('EmailID', models.CharField(blank=True, max_length=255, null=True)),
                ('EmailMsg', models.TextField(blank=True, null=True)),
                ('To', models.TextField(blank=True, null=True)),
                ('From', models.EmailField(blank=True, max_length=254, null=True)),
                ('CC', models.TextField(blank=True, null=True)),
                ('BCC', models.TextField(blank=True, null=True)),
                ('Msg', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('UID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='emails', to='credentials.users')),
            ],
        ),
    ]

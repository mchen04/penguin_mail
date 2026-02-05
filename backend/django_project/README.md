Setup
-----

1. Create virtualenv and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run migrations:

```bash
cd django_project
python manage.py migrate
```

3. Create superuser to access admin:

```bash
python manage.py createsuperuser
```

4. Run server:

```bash
python manage.py runserver
```

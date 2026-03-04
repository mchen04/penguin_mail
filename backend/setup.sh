#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt -q

# Generate .env from .env.example if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Generating .env file..."
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
    cat > .env <<EOF
SECRET_KEY=${SECRET_KEY}
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
EOF
    echo "Created .env with a random SECRET_KEY."
else
    echo ".env already exists, skipping."
fi

echo "Running migrations..."
python manage.py migrate --verbosity 0

# Create superuser if none exists
echo "Checking for existing superuser..."
HAS_SUPERUSER=$(python manage.py shell -c "from penguin_mail.models import User; print(User.objects.filter(is_superuser=True).exists())")

if [ "$HAS_SUPERUSER" = "False" ]; then
    echo "Creating default superuser (admin / admin)..."
    python manage.py shell -c "
from penguin_mail.models import User
User.objects.create_superuser(username='admin', email='admin@penguin.mail', password='admin')
print('Superuser created: admin@penguin.mail / admin')
"
else
    echo "Superuser already exists, skipping."
fi

echo ""
echo "Setup complete! Run the server with:"
echo "  source venv/bin/activate && python manage.py runserver"

import json
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt

from .models import Email


@csrf_exempt
def create_email(request):
    if request.method != 'POST':
        return HttpResponseBadRequest('Only POST supported')

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except Exception:
        return HttpResponseBadRequest('Invalid JSON')

    # Expected fields: sender, to, cc, bcc, subject, body
    sender = payload.get('sender') or payload.get('from') or ''
    subject = payload.get('subject', '')
    body = payload.get('body', '')
    to = payload.get('to', [])
    cc = payload.get('cc', [])
    bcc = payload.get('bcc', [])

    # Create Email record
    email = Email.objects.create(
        subject=subject,
        message=body,
        sender=sender,
        to=to,
        cc=cc,
        bcc=bcc,
    )

    # Return created email info
    data = {
        'id': str(email.email_id),
        'subject': email.subject,
        'body': email.message,
        'sender': email.sender,
        'to': email.to,
        'cc': email.cc,
        'bcc': email.bcc,
        'timestamp': email.timestamp.isoformat(),
    }

    # Allow CORS for development (adjust for production)
    response = JsonResponse(data)
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

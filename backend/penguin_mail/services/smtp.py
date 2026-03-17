import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, make_msgid, formatdate


def send_email(
    account,
    recipients_to: list[str],
    recipients_cc: list[str],
    recipients_bcc: list[str],
    subject: str,
    body_html: str,
) -> str:
    """Send an email via SMTP. Returns the Message-ID."""
    import re
    plaintext = re.sub(r'<[^>]+>', '', body_html)
    plaintext = re.sub(r'\s+', ' ', plaintext).strip()

    msg = MIMEMultipart('alternative')
    msg['From'] = formataddr((account.display_name or account.name, account.email))
    msg['To'] = ', '.join(recipients_to)
    if recipients_cc:
        msg['Cc'] = ', '.join(recipients_cc)
    msg['Subject'] = subject
    msg['Date'] = formatdate(localtime=True)
    message_id = make_msgid()
    msg['Message-ID'] = message_id

    msg.attach(MIMEText(plaintext, 'plain', 'utf-8'))
    msg.attach(MIMEText(body_html, 'html', 'utf-8'))

    all_recipients = recipients_to + recipients_cc + recipients_bcc

    password = account.get_smtp_password()
    context = ssl.create_default_context()

    if account.smtp_security == 'ssl':
        with smtplib.SMTP_SSL(account.smtp_host, account.smtp_port, context=context, timeout=30) as server:
            server.login(account.email, password)
            server.sendmail(account.email, all_recipients, msg.as_string())
    else:
        with smtplib.SMTP(account.smtp_host, account.smtp_port, timeout=30) as server:
            server.starttls(context=context)
            server.login(account.email, password)
            server.sendmail(account.email, all_recipients, msg.as_string())

    return message_id


def test_smtp_connection(host: str, port: int, security: str, email: str, password: str) -> None:
    """Test SMTP connection. Raises on failure."""
    context = ssl.create_default_context()

    if security == 'ssl':
        with smtplib.SMTP_SSL(host, port, context=context, timeout=10) as server:
            server.login(email, password)
    else:
        with smtplib.SMTP(host, port, timeout=10) as server:
            server.starttls(context=context)
            server.login(email, password)

# Reference: https://www.geeksforgeeks.org/data-science/how-to-send-automated-email-messages-in-python/

# Import libraries

# Compose should output into a json format?
# Draft and sent emails should be stored in a database and stored locally in a json format

# grab all this data from frontend compose feature (via and HTTP post request)

# Choose email account (source of email), grab credentials from credentials manager (credentials.py)

# To[], CC[], BCC[]

# subject, body

# Attachments[]

# Then actually send the email via SMTP server

# Include error handling for invalid email addresses, failed connections, authentication errors, etc.
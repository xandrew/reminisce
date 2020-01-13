import base64
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileType, FileName, Disposition, ContentId

def send(full_name, img):
    message = Mail(
        from_email='andras.nemeth@electrocuted-snail.com',
        to_emails='xxandreww@gmail.com',
        subject='Sending you a great picture!',
        html_content=f'<strong>Dear {full_name}, I hope you love this image!</strong>')
    message.attachment = Attachment(FileContent(base64.b64encode(img).decode("utf-8")),
                                    FileName('image.jpg'),
                                    FileType('image/jpeg'),
                                    Disposition('attachment'),
                                    ContentId('Attached Image'))
    try:
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        print(e.message)

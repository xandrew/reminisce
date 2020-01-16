import base64
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileType, FileName, Disposition, ContentId

def send(email, full_name, img, ocr_text):
    message = Mail(
        from_email='andras.nemeth@electrocuted-snail.com',
        to_emails=email,
        subject='Electrocuted document',
        html_content=f'Document ID BLABLA electrocuted!<BR>Find original attached. OCRed text for searchability:<BR>{ocr_text}')
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

import base64
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileType, FileName, Disposition, ContentId

def send(email, notes, files, ocr_texts):
    id = 'BLA'
    html_content = f'Document ID {id} electrocuted!<BR>Find originals attached.'
    if notes:
        html_content += 'Notes:<BR>\n{notes}<BR>\n'

    if ocr_texts:
        html_content += 'OCRed texts for searchability:<BR>'
    for ocr_text in ocr_texts:
        html_content += ocr_text + ' <BR>'
    message = Mail(
        from_email='andras.nemeth@electrocuted-snail.com',
        to_emails=email,
        subject=f'Electrocuted document {id}',
        html_content=html_content)
    message.attachment = [Attachment(FileContent(base64.b64encode(data).decode("utf-8")),
                                     FileName(file.filename),
                                     FileType(file.content_type),
                                     Disposition('attachment'),
                                     ContentId('Attached File')) for (file, data) in files]
    try:
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    except Exception as e:
        print(e.message)

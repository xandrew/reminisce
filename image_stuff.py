from google.cloud import vision

client = vision.ImageAnnotatorClient()
def do_OCR(img):
    try:
        image = vision.types.Image(content=img)
        response = client.document_text_detection(image=image)
        return response.full_text_annotation.text
    except Exception as e:
        print(f'OCR error happened: {e}')
        return ''

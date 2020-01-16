from google.cloud import vision

client = vision.ImageAnnotatorClient()
def do_OCR(img):
    image = vision.types.Image(content=img)
    response = client.document_text_detection(image=image)
    return response.full_text_annotation.text

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch

def create_resume_pdf(text_file, output_pdf):
    c = canvas.Canvas(output_pdf, pagesize=letter)
    width, height = letter
    
    # Read the text file
    with open(text_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    y_position = height - 0.75 * inch
    x_position = 0.75 * inch
    line_height = 14
    
    for line in lines:
        line = line.rstrip()
        if y_position < 0.75 * inch:
            c.showPage()
            y_position = height - 0.75 * inch
        
        c.drawString(x_position, y_position, line)
        y_position -= line_height
    
    c.save()
    print(f'PDF created: {output_pdf}')

if __name__ == '__main__':
    create_resume_pdf('test-resume.txt', 'test-resume.pdf')

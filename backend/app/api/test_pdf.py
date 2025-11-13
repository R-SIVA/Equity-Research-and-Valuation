from fastapi import APIRouter
from fastapi.responses import FileResponse
from reportlab.pdfgen import canvas
import tempfile, os

router = APIRouter(prefix="/api/test", tags=["TestPDF"])

@router.get("/pdf")
def get_test_pdf():
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    filename = tmp.name
    tmp.close()

    c = canvas.Canvas(filename)
    c.setFont("Helvetica", 14)
    c.drawString(72, 750, "✅ PDF generation test works!")
    c.showPage()
    c.save()

    if os.path.getsize(filename) == 0:
        raise RuntimeError("Empty PDF file generated")

    return FileResponse(filename, filename="test_report.pdf", media_type="application/pdf")

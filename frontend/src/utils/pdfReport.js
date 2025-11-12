import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Capture the dashboard section and generate a PDF file.
 * @param {string} elementId - The DOM id of the dashboard container.
 */
export const downloadDashboardReport = async (elementId = "dashboard-container") => {
  const input = document.getElementById(elementId);
  if (!input) {
    alert("Dashboard container not found!");
    return;
  }

  // Scroll to top to ensure full render
  window.scrollTo(0, 0);

  // Increase quality by setting scale > 2
  const canvas = await html2canvas(input, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  // If content is taller than one page, split it automatically
  let position = 0;
  let heightLeft = pdfHeight;

  while (heightLeft > 0) {
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();
    if (heightLeft > 0) {
      pdf.addPage();
      position = -pdf.internal.pageSize.getHeight();
    }
  }

  pdf.save("Equity_Research_Report.pdf");
};




import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BLUE = [37, 99, 235];
const DARK = [15, 23, 42];
const SLATE = [71, 85, 105];
const LIGHT_BLUE = [219, 234, 254];
const WHITE = [255, 255, 255];
const BORDER = [226, 232, 240];

export const generateApplicationPDF = async (scheme, user) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = 0;

  
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, pageW, 38, 'F');

  
  doc.setFillColor(255, 255, 255, 0.15);
  doc.circle(margin + 10, 19, 10, 'S'); 
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('GOVT.', margin + 10, 17, { align: 'center' });
  doc.text('KERALA', margin + 10, 21, { align: 'center' });

  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SMART PANCHAYAT WELFARE SCHEME', pageW / 2, 14, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Application Form · Kerala Panchayati Raj', pageW / 2, 21, { align: 'center' });

  
  doc.setFillColor(30, 58, 138); 
  doc.rect(0, 38, pageW, 9, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`SCHEME: ${scheme.title.toUpperCase()}`, pageW / 2, 44, { align: 'center' });

  y = 58;

  
  doc.setFillColor(...LIGHT_BLUE);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, 'F');
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentW, 22, 3, 3, 'S');

  doc.setTextColor(...BLUE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CATEGORY', margin + 5, y + 7);
  doc.text('DATE GENERATED', margin + contentW / 3, y + 7);
  doc.text('FORM REF NO.', margin + (contentW * 2) / 3, y + 7);

  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(scheme.category, margin + 5, y + 15);
  doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }), margin + contentW / 3, y + 15);
  doc.text(`PW-${Date.now().toString().slice(-8)}`, margin + (contentW * 2) / 3, y + 15);

  y += 30;

  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BLUE);
  doc.text('PART A: APPLICANT INFORMATION', margin, y);
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, pageW - margin, y + 2);

  y += 8;

  const applicantRows = [
    ['Full Name', user?.name || '____________________________'],
    ['Email Address', user?.email || '____________________________'],
    ['Age', user?.age ? `${user.age} Years` : '______ Years'],
    ['Annual Household Income', (user?.annualIncome !== null && user?.annualIncome !== undefined && user?.annualIncome !== '') ? `₹ ${Number(user.annualIncome).toLocaleString('en-IN')}` : '₹ __________'],
    ['Occupation / Profession', user?.occupation || '____________________________'],
    ['Social Category', user?.category || '______ (General / OBC / SC / ST)'],
    ['Aadhaar Number', '______ ______ ______'],
    ['Mobile Number', '+91 ___________'],
    ['Postal Address', '___________________________________________________'],
    ['', '___________________________________________________'],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: applicantRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 } },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: SLATE, cellWidth: 65 },
      1: { textColor: DARK }
    },
    theme: 'grid',
    tableLineColor: BORDER,
    tableLineWidth: 0.3,
  });

  y = doc.lastAutoTable.finalY + 10;

  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BLUE);
  doc.text('PART B: SCHEME ELIGIBILITY CRITERIA', margin, y);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, pageW - margin, y + 2);

  y += 8;

  const criteria = scheme.eligibilityCriteria || {};
  const criteriaRows = [
    ['Age Bracket', `${criteria.minAge || 0} – ${criteria.maxAge || 150} Years`],
    ['Maximum Annual Income', criteria.maxIncome ? `₹ ${criteria.maxIncome.toLocaleString('en-IN')}` : 'No Upper Limit'],
    ['Eligible Occupations', criteria.allowedOccupations?.length > 0 ? criteria.allowedOccupations.join(', ') : 'All Occupations Eligible'],
    ['Eligible Social Categories', criteria.allowedCategories?.length > 0 ? criteria.allowedCategories.join(', ') : 'All Categories Eligible'],
    ['Scheme Category', scheme.category],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: criteriaRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 } },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: SLATE, cellWidth: 65 },
      1: { textColor: DARK }
    },
    theme: 'grid',
    tableLineColor: BORDER,
    tableLineWidth: 0.3,
  });

  y = doc.lastAutoTable.finalY + 10;

  
  
  if (y > pageH - 100) { doc.addPage(); y = 20; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BLUE);
  doc.text('PART C: REQUIRED DOCUMENT ENCLOSURES', margin, y);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, pageW - margin, y + 2);

  y += 10;

  const docs = scheme.requiredDocuments?.length > 0 ? scheme.requiredDocuments : ['Aadhaar Card'];
  docs.forEach((docName, i) => {
    
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(0.4);
    doc.rect(margin, y - 3.5, 4.5, 4.5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...DARK);
    doc.text(`${i + 1}.  ${docName}`, margin + 7, y);
    y += 8;
  });

  y += 6;

  
  if (y > pageH - 80) { doc.addPage(); y = 20; }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BLUE);
  doc.text('PART D: SCHEME DESCRIPTION', margin, y);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, pageW - margin, y + 2);

  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE);
  const descLines = doc.splitTextToSize(scheme.description, contentW);
  doc.text(descLines, margin, y);

  y += descLines.length * 5 + 10;

  
  if (y > pageH - 70) { doc.addPage(); y = 20; }

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentW, 32, 3, 3, 'F');
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 32, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text('CITIZEN DECLARATION', margin + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  const declaration = 'I hereby declare that all information provided above is true, correct and complete to the best of my knowledge and belief. I understand that any false statement or misrepresentation may result in rejection of this application and legal action as per applicable law.';
  const declLines = doc.splitTextToSize(declaration, contentW - 8);
  doc.text(declLines, margin + 4, y + 14);

  y += 42;

  
  if (y > pageH - 40) { doc.addPage(); y = 20; }

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);

  
  doc.line(margin, y + 15, margin + 55, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...SLATE);
  doc.text('Signature of Applicant', margin, y + 19);

  
  doc.line(margin + 70, y + 15, margin + 120, y + 15);
  doc.text('Date: ____/____/________', margin + 70, y + 19);

  
  doc.setDrawColor(...BORDER);
  doc.rect(pageW - margin - 35, y, 35, 22, 'S');
  doc.setFontSize(7);
  doc.setTextColor(196, 181, 253);
  doc.text('Office Seal &', pageW - margin - 17, y + 10, { align: 'center' });
  doc.text('Signature', pageW - margin - 17, y + 15, { align: 'center' });

  y += 30;

  
  const footerY = pageH - 16;
  doc.setFillColor(...DARK);
  doc.rect(0, footerY, pageW, 16, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Smart Panchayat Welfare Portal · Kerala Panchayati Raj · Submit this form at the Panchayat Office Counter', pageW / 2, footerY + 7, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')} · This is a system-generated document.`, pageW / 2, footerY + 12, { align: 'center' });

  
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin, footerY + 7, { align: 'right' });
  }

  
  const filename = `PW_Application_${scheme.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}_${Date.now()}.pdf`;
  doc.save(filename);
};

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Visitor } from "@shared/schema";

export function exportToPDF(visitors: Visitor[], filename: string = "visitor-log") {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(22, 163, 74); // Green color
  doc.text('Tourist Log Book System', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(102, 102, 102); // Gray color
  doc.text('Visitor Registration Report', 105, 30, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 40, { align: 'center' });

  // Add statistics box
  const todayVisitors = visitors.filter(v => 
    new Date(v.createdAt).toDateString() === new Date().toDateString()
  ).length;
  
  const totalDays = new Set(visitors.map(v => 
    new Date(v.createdAt).toDateString()
  )).size;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Visitors: ${visitors.length}`, 20, 55);
  doc.text(`Today's Visitors: ${todayVisitors}`, 20, 65);
  doc.text(`Total Days with Visitors: ${totalDays}`, 20, 75);

  // Prepare table data
  const tableData = visitors.map(visitor => {
    const date = new Date(visitor.createdAt);
    const contact = visitor.phone || visitor.email || 'N/A';
    const purpose = visitor.purpose ? visitor.purpose.replace('_', ' ').toUpperCase() : 'N/A';
    return [
      visitor.controlNumber,
      visitor.name,
      contact,
      purpose,
      date.toLocaleDateString(),
      date.toLocaleTimeString()
    ];
  });

  // Add table
  autoTable(doc, {
    head: [['Control Number', 'Full Name', 'Contact Info', 'Purpose', 'Date', 'Time']],
    body: tableData,
    startY: 85,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [22, 163, 74], // Green background
      textColor: 255, // White text
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 249, 249], // Light gray
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [22, 163, 74] }, // Control number in green
    },
  });

  // Add footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(102, 102, 102);
  doc.text(`This report contains ${visitors.length} visitor records.`, 105, pageHeight - 20, { align: 'center' });
  doc.text('© Tourist Log Book System - Confidential Document', 105, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save(`${filename}.pdf`);
}

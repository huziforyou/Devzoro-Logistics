import LetterheadTemplate from '../assets/letterhead-template.pdf';
import AmiriRegular from '../assets/fonts/Amiri-Regular.ttf';
import AmiriBold from '../assets/fonts/Amiri-Bold.ttf';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';
import ArabicReshaper from 'arabic-reshaper';
import BidiJS from 'bidi-js';

const bidi = BidiJS();

/**
 * Helper to handle Arabic text shaping and RTL
 */
export const formatArabicText = (text) => {
  if (!text) return '';
  const str = String(text);
  
  // Comprehensive Arabic character range check
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (!arabicPattern.test(str)) return str;

  try {
    // Shape the Arabic characters
    const reshaped = ArabicReshaper.reshape(str);
    // Reorder for RTL display
    const bidiText = bidi.getReorderedText(reshaped);
    return bidiText;
  } catch (error) {
    console.error('Error shaping Arabic text:', error);
    return str;
  }
};

/**
 * Loads and adds custom fonts to jsPDF instance
 */
const setupFonts = async (doc) => {
  const loadFont = async (url, name, style) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      // Using a more modern way to convert ArrayBuffer to Base64
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      
      doc.addFileToVFS(`${name}-${style}.ttf`, base64);
      doc.addFont(`${name}-${style}.ttf`, name, style);
    } catch (error) {
      console.error(`Error loading font ${name} ${style}:`, error);
    }
  };

  await Promise.all([
    loadFont(AmiriRegular, "Amiri", "normal"),
    loadFont(AmiriBold, "Amiri", "bold")
  ]);
  
  doc.setFont("Amiri", "normal");
};

/**
 * Helper to apply the PDF letterhead template to a jsPDF document.
 */
export const applyTemplate = async (doc) => {
  try {
    const jspdfBytes = doc.output('arraybuffer');
    const templateResponse = await fetch(LetterheadTemplate);
    const templateBytes = await templateResponse.arrayBuffer();
    
    const templateDoc = await PDFDocument.load(templateBytes);
    const contentDoc = await PDFDocument.load(jspdfBytes);
    const mergedDoc = await PDFDocument.create();

    const [templatePage] = await mergedDoc.copyPages(templateDoc, [0]);
    const contentPages = await mergedDoc.copyPages(contentDoc, contentDoc.getPageIndices());
    
    for (const contentPage of contentPages) {
      const { width, height } = templatePage.getSize();
      const newPage = mergedDoc.addPage([width, height]);
      
      const embeddedTemplate = await mergedDoc.embedPage(templatePage);
      newPage.drawPage(embeddedTemplate, { x: 0, y: 0, width, height });

      const embeddedContent = await mergedDoc.embedPage(contentPage);
      newPage.drawPage(embeddedContent, { x: 0, y: 0, width, height });
    }

    return await mergedDoc.save();
  } catch (error) {
    console.error("Error applying template:", error);
    return new Uint8Array(doc.output('arraybuffer'));
  }
};

/**
 * Downloads a Uint8Array as a PDF file.
 */
export const downloadPDF = (pdfBytes, filename) => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

/**
 * Generates a general table-based PDF report with the letterhead.
 */
export const generatePDFReport = async (title, columns, data, filename) => {
  const doc = new jsPDF();
  await setupFonts(doc);
  
  const startY = 70;

  doc.setFontSize(18);
  doc.setFont("Amiri", "bold");
  doc.setTextColor(0, 51, 102);
  
  // Don't uppercase if it contains Arabic
  const formattedTitle = /[\u0600-\u06FF]/.test(title) ? title : title.toUpperCase();
  doc.text(formatArabicText(formattedTitle), 14, 60);

  const formattedColumns = columns.map(col => formatArabicText(String(col)));
  const formattedData = data.map(row => row.map(cell => formatArabicText(String(cell || 'N/A'))));

  autoTable(doc, {
    startY: startY,
    head: [formattedColumns],
    body: formattedData,
    theme: 'striped',
    headStyles: { 
      fillColor: [0, 51, 102], 
      textColor: [255, 255, 255], 
      fontSize: 10, 
      font: "Amiri",
      fontStyle: 'bold'
    },
    styles: { 
      fontSize: 9, 
      cellPadding: 3, 
      font: "Amiri",
      fontStyle: 'normal'
    },
    margin: { bottom: 30 }
  });

  const pdfBytes = await applyTemplate(doc);
  downloadPDF(pdfBytes, filename);
};

/**
 * Generates a specific Dispatch Order PDF with bold labels and regular values.
 */
export const generateDispatchOrderPDF = async (order, filename) => {
  const doc = new jsPDF();
  await setupFonts(doc);
  
  const startY = 70;

  doc.setFontSize(18);
  doc.setFont("Amiri", "bold");
  doc.setTextColor(0, 51, 102);
  doc.text(formatArabicText("DISPATCH ORDER"), 14, 60);

  const fields = [
    [formatArabicText("Order ID (DN):"), formatArabicText(order.deliveryNoteNumber || 'N/A')],
    [formatArabicText("Date:"), formatArabicText(order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString())],
    [formatArabicText("Driver Name:"), formatArabicText(order.assignedDriver?.name || 'N/A')],
    [formatArabicText("Vehicle Number:"), formatArabicText(order.vehiclePlateNumber || 'N/A')],
    [formatArabicText("Vehicle Name:"), formatArabicText(order.assignedVehicle?.name || 'N/A')],
    [formatArabicText("Loading Point:"), formatArabicText(order.loadingFrom || 'N/A')],
    [formatArabicText("Unloading Point:"), formatArabicText(order.offloadingTo || 'N/A')],
  ];

  autoTable(doc, {
    startY: startY,
    body: fields,
    theme: 'plain',
    styles: { 
      fontSize: 11, 
      cellPadding: 4, 
      textColor: [40, 40, 40], 
      font: "Amiri",
      fontStyle: 'normal'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, font: "Amiri" },
      1: { fontStyle: 'normal', font: "Amiri" }
    }
  });

  const pdfBytes = await applyTemplate(doc);
  downloadPDF(pdfBytes, filename);
  return pdfBytes;
};

/**
 * Generates a specific Dispatch Order PDF with detailed information and optionally an attached image.
 */
export const generateDetailedDispatchOrderPDF = async (order, filename) => {
  const doc = new jsPDF();
  await setupFonts(doc);
  
  const startY = 70;

  doc.setFontSize(18);
  doc.setFont("Amiri", "bold");
  doc.setTextColor(0, 51, 102);
  doc.text(formatArabicText("DISPATCH ORDER DETAIL"), 14, 60);

  const details = [
    [formatArabicText("Order ID (DN):"), formatArabicText(order.deliveryNoteNumber || 'N/A')],
    [formatArabicText("Client Name:"), formatArabicText(order.customerName || 'N/A')],
    [formatArabicText("Vehicle Name:"), formatArabicText(order.assignedVehicle?.name || 'N/A')],
    [formatArabicText("Material:"), formatArabicText(order.materialDescription || 'N/A')],
    [formatArabicText("Quantity:"), formatArabicText(order.materialQuantity || '0')],
    [formatArabicText("Route:"), formatArabicText(`${order.loadingFrom} to ${order.offloadingTo}`)],
    [formatArabicText("Driver:"), formatArabicText(order.assignedDriver?.name || 'N/A')],
    [formatArabicText("Vehicle Plate:"), formatArabicText(order.vehiclePlateNumber || 'N/A')],
    [formatArabicText("Status:"), formatArabicText(order.status)],
  ];

  if (order.outForDeliveryTime) {
    details.push([formatArabicText("Out for Delivery:"), formatArabicText(new Date(order.outForDeliveryTime).toLocaleString())]);
  }

  if (order.status === 'Delivered') {
    details.push([formatArabicText("Received Qty:"), formatArabicText(order.receivedQuantity || '0')]);
    details.push([formatArabicText("Qty Status:"), formatArabicText(`${order.quantityStatus} (Diff: ${order.quantityDifference || '0'})`)]);
    details.push([formatArabicText("Delivered At:"), formatArabicText(`${new Date(order.deliveredDate).toLocaleDateString()} ${order.deliveredTime || ''}`)]);
    details.push([formatArabicText("Notes:"), formatArabicText(order.deliveryNotes || 'No notes')]);
  }

  autoTable(doc, {
    body: details,
    startY: startY,
    theme: 'plain',
    styles: { 
      fontSize: 10, 
      cellPadding: 3, 
      textColor: [40, 40, 40], 
      font: "Amiri",
      fontStyle: 'normal'
    },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 45, font: "Amiri" } 
    }
  });

  if (order.deliveryNoteData && order.deliveryNoteType && order.deliveryNoteType.startsWith('image/')) {
    doc.addPage();
    doc.setFontSize(18);
    doc.setFont("Amiri", "bold");
    doc.setTextColor(0, 51, 102);
    doc.text(formatArabicText("ATTACHED DELIVERY NOTE"), 14, 60);
    
    doc.addImage(
      `data:${order.deliveryNoteType};base64,${order.deliveryNoteData}`, 
      order.deliveryNoteType.split('/')[1].toUpperCase(), 
      14, 75, 180, 200
    );
  }

  const pdfBytes = await applyTemplate(doc);
  downloadPDF(pdfBytes, filename);
  return pdfBytes;
};

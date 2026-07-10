import PDFDocument from 'pdfkit';
import { env } from '../config/env.js';

const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return `${env.business.currency} ${value.toFixed(2)}`;
};

const formatDate = (date) =>
  new Date(date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

/**
 * Renders a receipt document to a PDF buffer.
 *
 * The receipt argument is expected to be a plain object (a lean Mongoose
 * document is fine) containing receiptNumber, orderNumber, issuedAt, items,
 * subtotal, tax, total, paymentMethod and optional customer details.
 *
 * @param {object} receipt
 * @returns {Promise<Buffer>}
 */
export const generateReceiptPdf = (receipt) =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text(env.business.name, { align: 'center' });
      doc.moveDown(0.2);
      doc.fontSize(9).font('Helvetica').fillColor('#555555');
      if (env.business.address) {
        doc.text(env.business.address, { align: 'center' });
      }
      if (env.business.phone) {
        doc.text(env.business.phone, { align: 'center' });
      }
      doc.fillColor('#000000');
      doc.moveDown(0.8);

      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor('#cccccc')
        .stroke();
      doc.moveDown(0.8);

      // Meta
      doc.fontSize(14).font('Helvetica-Bold').text('Official Receipt');
      doc.moveDown(0.4);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Receipt No: ${receipt.receiptNumber}`);
      doc.text(`Order No:   ${receipt.orderNumber}`);
      doc.text(`Issued:     ${formatDate(receipt.issuedAt)}`);
      if (receipt.orderType) {
        doc.text(`Order Type: ${receipt.orderType}`);
      }
      if (receipt.paymentMethod) {
        doc.text(`Payment:    ${receipt.paymentMethod}`);
      }
      if (receipt.customerName) {
        doc.text(`Customer:   ${receipt.customerName}`);
      }
      doc.moveDown(0.8);

      // Items table header
      const tableTop = doc.y;
      const columns = {
        item: 50,
        qty: 320,
        price: 380,
        total: 470,
      };

      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Item', columns.item, tableTop);
      doc.text('Qty', columns.qty, tableTop, { width: 40, align: 'right' });
      doc.text('Price', columns.price, tableTop, { width: 70, align: 'right' });
      doc.text('Total', columns.total, tableTop, { width: 75, align: 'right' });

      doc.moveDown(0.3);
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor('#cccccc')
        .stroke();
      doc.moveDown(0.3);

      // Items
      doc.font('Helvetica').fontSize(10);
      (receipt.items || []).forEach((item) => {
        const y = doc.y;
        doc.text(item.name, columns.item, y, { width: 260 });
        doc.text(String(item.quantity), columns.qty, y, { width: 40, align: 'right' });
        doc.text(formatCurrency(item.price), columns.price, y, { width: 70, align: 'right' });
        doc.text(formatCurrency(item.subtotal), columns.total, y, { width: 75, align: 'right' });
        doc.moveDown(0.5);
      });

      doc.moveDown(0.3);
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .strokeColor('#cccccc')
        .stroke();
      doc.moveDown(0.5);

      // Totals
      const totalsX = columns.price;
      const printTotal = (label, value, bold = false) => {
        const y = doc.y;
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 12 : 10);
        doc.text(label, totalsX - 90, y, { width: 90, align: 'right' });
        doc.text(formatCurrency(value), totalsX, y, { width: 145, align: 'right' });
        doc.moveDown(0.4);
      };

      printTotal('Subtotal', receipt.subtotal);
      printTotal('Tax', receipt.tax);
      printTotal('Total', receipt.total, true);

      doc.moveDown(1.5);
      doc
        .font('Helvetica-Oblique')
        .fontSize(10)
        .fillColor('#555555')
        .text('Thank you for your visit!', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });

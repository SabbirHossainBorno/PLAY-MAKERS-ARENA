// lib/generateInvoice.js
import { PDFDocument, rgb } from 'pdf-lib';
import * as fontkit from 'fontkit';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

const FONT_REGULAR = path.join(process.cwd(), 'public/fonts/RobotoSlab-Regular.ttf');
const FONT_BOLD = path.join(process.cwd(), 'public/fonts/RobotoSlab-Bold.ttf');

const generateInvoice = async (bookingData, memberInfo, transactionInfo) => {
  try {
    // Verify font files exist
    if (!fs.existsSync(FONT_REGULAR) || !fs.existsSync(FONT_BOLD)) {
      throw new Error('Roboto Slab font files not found in /public/fonts');
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size

    // Register fontkit first
    pdfDoc.registerFontkit(fontkit.default);

    // Embed custom fonts
    const fontRegularBytes = fs.readFileSync(FONT_REGULAR);
    const fontBoldBytes = fs.readFileSync(FONT_BOLD);
    const customFont = await pdfDoc.embedFont(fontRegularBytes);
    const customFontBold = await pdfDoc.embedFont(fontBoldBytes);

    // Load images
    const bgImage = await pdfDoc.embedJpg(fs.readFileSync(path.join(process.cwd(), 'public/images/invoice_bg.jpg')));
    const logoImage = await pdfDoc.embedPng(fs.readFileSync(path.join(process.cwd(), 'public/images/logo.png')));
    const signatureImage = await pdfDoc.embedPng(fs.readFileSync(path.join(process.cwd(), 'public/images/invoice_sig.png')));

    // Draw background with glass effect
    page.drawImage(bgImage, {
      x: 0, y: 0, width: 595, height: 842,
      opacity: 0.1
    });

    // Header Section
    page.drawImage(logoImage, {
      x: 50, y: 770, width: 60, height: 60
    });
    
    page.drawText('PLAY MAKERS ARENA', {
      x: 250, y: 790,
      size: 24,
      font: customFontBold,
      color: rgb(0.2, 0.2, 0.2),
      align: 'center'
    });
    
    page.drawText('Ultimate Futsal Experience', {
      x: 250, y: 760,
      size: 14,
      font: customFont,
      color: rgb(0.4, 0.4, 0.4),
      align: 'center'
    });

    // Invoice Info Columns
    let yPos = 700;
    const invoiceId = `INV${bookingData.booking_id.match(/\d+/)[0]}PMA`;

    // Left Column
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 50, y: yPos, font: customFont });
    page.drawText(`PMA ID: ${memberInfo.pma_id}`, { x: 50, y: yPos - 25, font: customFont });
    page.drawText(`Invoice ID: ${invoiceId}`, { x: 50, y: yPos - 50, font: customFontBold });

    // Right Column
    page.drawText('Payment Information:', { x: 350, y: yPos, font: customFontBold });
    page.drawText(`Method: ${transactionInfo.payment_method}`, { x: 350, y: yPos - 25, font: customFont });
    page.drawText(`Card: ${transactionInfo.card_no}`, { x: 350, y: yPos - 50, font: customFont });
    page.drawText(`Transaction ID: ${transactionInfo.transaction_id}`, { x: 350, y: yPos - 75, font: customFont });

    // Welcome Message
    yPos -= 100;
    page.drawText('Thank you for your booking!', {
      x: 50, y: yPos,
      size: 16,
      font: customFontBold,
      color: rgb(0, 0.4, 0.6)
    });

    // Slot Details Box
    yPos -= 50;
    page.drawRectangle({
      x: 40, y: yPos - 160,
      width: 515, height: 180,
      borderWidth: 1,
      borderColor: rgb(0.7, 0.7, 0.7),
      color: rgb(1, 1, 1),
      opacity: 0.1
    });

    // Table Header
    page.drawText('Slot', { x: 60, y: yPos - 30, font: customFontBold });
    page.drawText('Timing', { x: 200, y: yPos - 30, font: customFontBold });
    page.drawText('Price', { x: 350, y: yPos - 30, font: customFontBold });
    page.drawText('Total', { x: 490, y: yPos - 30, font: customFontBold });

    // Table Rows
    let rowY = yPos - 50;
    let subTotal = 0;
    
    bookingData.slots.forEach(slot => {
      const price = slot.offer_price || slot.price;
      subTotal += price;

      page.drawText(slot.name, { x: 60, y: rowY, font: customFont });
      page.drawText(slot.timing, { x: 200, y: rowY, font: customFont });
      page.drawText(`৳${slot.price.toFixed(2)}`, { x: 350, y: rowY, font: customFont });
      page.drawText(`৳${price.toFixed(2)}`, { x: 490, y: rowY, font: customFont });
      rowY -= 20;
    });

    // Totals
    const vat = subTotal * 0.05;
    const grandTotal = subTotal + vat;
    rowY -= 40;

    page.drawText(`Subtotal: ৳${subTotal.toFixed(2)}`, { x: 420, y: rowY, font: customFontBold });
    page.drawText(`VAT (5%): ৳${vat.toFixed(2)}`, { x: 420, y: rowY - 20, font: customFontBold });
    page.drawText(`Total: ৳${grandTotal.toFixed(2)}`, { x: 420, y: rowY - 40, font: customFontBold });

    // Rules Section
    yPos = rowY - 100;
    page.drawText('Important Rules:', { x: 50, y: yPos, font: customFontBold });
    page.drawText('- Arrive 15 minutes before slot time', { x: 60, y: yPos - 20, font: customFont });
    page.drawText('- Bring valid government-issued ID', { x: 60, y: yPos - 40, font: customFont });
    page.drawText('- No cancellations within 24 hours', { x: 60, y: yPos - 60, font: customFont });

    // Signature & QR Code
    yPos -= 100;
    page.drawImage(signatureImage, {
      x: 50, y: yPos,
      width: 100, height: 40
    });

    const qrUrl = `${process.env.BASE_URL}/invoice/${invoiceId}`;
    const qrImage = await pdfDoc.embedPng(await QRCode.toBuffer(qrUrl));
    page.drawImage(qrImage, {
      x: 250, y: yPos,
      width: 80, height: 80
    });

    // Footer
    yPos -= 100;
    page.drawText('Play Makers Arena | 123 Futsal Street, Dhaka', {
      x: 50, y: yPos,
      size: 10,
      font: customFont,
      color: rgb(0.4, 0.4, 0.4)
    });
    page.drawText('Contact: +880 1234-567890 | Email: info@playmakersarena.com', {
      x: 50, y: yPos - 15,
      size: 10,
      font: customFont,
      color: rgb(0.4, 0.4, 0.4)
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `${bookingData.booking_id}_${invoiceId}.pdf`;
    const storagePath = path.join('/home/play-makers-arena/public/storage/invoice', fileName);
    
    fs.mkdirSync(path.dirname(storagePath), { recursive: true });
    fs.writeFileSync(storagePath, pdfBytes);

    return { path: storagePath, invoiceId };
  } catch (error) {
    console.error('Invoice generation failed:', error);
    throw error;
  }
};

export default generateInvoice;
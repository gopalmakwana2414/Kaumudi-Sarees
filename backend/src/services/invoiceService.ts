import PDFDocument from "pdfkit";
import { Response } from "express";

const GOLD = "#b8860b";
const DARK = "#222222";
const GRAY = "#888888";
const LIGHT_BG = "#fff8e7";

interface InvoiceOrder {
  _id: any;
  items: {
    product: { name?: string; sku?: string } | any;
    quantity: number;
    price: number;
  }[];
  totalItems: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: Date;
  shippingAddress: {
    fullName: string;
    mobileNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  user: { name: string; email: string };
}

/**
 * Streams a branded PDF invoice for the given order directly to the
 * HTTP response. Designed to be called from an Express route handler.
 */
export const generateInvoicePDF = (order: InvoiceOrder, res: Response) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const orderId = order._id.toString().slice(-8).toUpperCase();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Suhagan-Invoice-${orderId}.pdf`
  );

  doc.pipe(res);

  // ===== HEADER =====
  doc
    .rect(0, 0, doc.page.width, 110)
    .fill(GOLD);

  doc
    .fillColor("#ffffff")
    .fontSize(28)
    .font("Helvetica-Bold")
    .text("SUHAGAN", 50, 35);

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor("#fdf3d8")
    .text("Premium Handcrafted Sarees from Surat", 50, 68);

  doc
    .fontSize(20)
    .font("Helvetica-Bold")
    .fillColor("#ffffff")
    .text("INVOICE", 0, 40, { align: "right", width: doc.page.width - 50 });

  doc.fillColor(DARK).y = 140;

  // ===== ORDER META =====
  const metaTop = 140;
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(GRAY)
    .text("INVOICE NUMBER", 50, metaTop)
    .fontSize(13)
    .fillColor(DARK)
    .text(`#${orderId}`, 50, metaTop + 14);

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(GRAY)
    .text("ORDER DATE", 220, metaTop)
    .fontSize(13)
    .font("Helvetica")
    .fillColor(DARK)
    .text(
      new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      220,
      metaTop + 14
    );

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(GRAY)
    .text("PAYMENT STATUS", 400, metaTop)
    .fontSize(13)
    .font("Helvetica")
    .fillColor(order.paymentStatus === "paid" ? "#16a34a" : "#d97706")
    .text(order.paymentStatus.toUpperCase(), 400, metaTop + 14);

  // ===== BILL TO / SHIP TO =====
  const addrTop = metaTop + 60;

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(GRAY)
    .text("BILLED TO", 50, addrTop);

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor(DARK)
    .text(order.user?.name || order.shippingAddress.fullName, 50, addrTop + 16);

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor(GRAY)
    .text(order.user?.email || "", 50, addrTop + 32);

  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(GRAY)
    .text("SHIPPING ADDRESS", 320, addrTop);

  const addr = order.shippingAddress;
  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor(DARK)
    .text(addr.fullName, 320, addrTop + 16)
    .text(
      `${addr.addressLine1}${addr.addressLine2 ? ", " + addr.addressLine2 : ""}`,
      320,
      addrTop + 30,
      { width: 220 }
    )
    .text(`${addr.city}, ${addr.state} - ${addr.postalCode}`, 320, addrTop + 58)
    .text(`Phone: ${addr.mobileNumber}`, 320, addrTop + 72);

  // ===== ITEMS TABLE =====
  let tableTop = addrTop + 110;

  doc.rect(50, tableTop, 495, 26).fill(LIGHT_BG);
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .fillColor(GOLD)
    .text("ITEM", 60, tableTop + 8)
    .text("QTY", 330, tableTop + 8, { width: 50, align: "center" })
    .text("PRICE", 390, tableTop + 8, { width: 70, align: "right" })
    .text("TOTAL", 470, tableTop + 8, { width: 65, align: "right" });

  let rowY = tableTop + 26;

  order.items.forEach((item, idx) => {
    const name =
      (typeof item.product === "object" && item.product?.name) || "Saree Product";
    const lineTotal = item.price * item.quantity;

    if (idx % 2 === 1) {
      doc.rect(50, rowY, 495, 24).fill("#fafafa");
    }

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(DARK)
      .text(name, 60, rowY + 7, { width: 260 })
      .text(String(item.quantity), 330, rowY + 7, { width: 50, align: "center" })
      .text(`Rs. ${item.price.toLocaleString()}`, 390, rowY + 7, {
        width: 70,
        align: "right",
      })
      .text(`Rs. ${lineTotal.toLocaleString()}`, 470, rowY + 7, {
        width: 65,
        align: "right",
      });

    rowY += 24;
  });

  doc
    .moveTo(50, rowY + 5)
    .lineTo(545, rowY + 5)
    .strokeColor("#e5e5e5")
    .stroke();

  // ===== TOTALS =====
  let totalsY = rowY + 20;

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor(GRAY)
    .text("Subtotal", 380, totalsY, { width: 100, align: "right" })
    .fillColor(DARK)
    .text(`Rs. ${order.totalAmount.toLocaleString()}`, 470, totalsY, {
      width: 65,
      align: "right",
    });

  totalsY += 18;

  doc
    .fontSize(10)
    .font("Helvetica")
    .fillColor(GRAY)
    .text("Payment Method", 380, totalsY, { width: 100, align: "right" })
    .fillColor(DARK)
    .text(
      order.paymentMethod === "COD" ? "Cash on Delivery" : "Online",
      470,
      totalsY,
      { width: 65, align: "right" }
    );

  totalsY += 26;

  doc.rect(370, totalsY - 6, 175, 32).fill(GOLD);
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .fillColor("#ffffff")
    .text("GRAND TOTAL", 380, totalsY + 3, { width: 100, align: "right" })
    .text(`Rs. ${order.totalAmount.toLocaleString()}`, 470, totalsY + 3, {
      width: 65,
      align: "right",
    });

  // ===== FOOTER =====
  const footerY = doc.page.height - 120;

  doc
    .moveTo(50, footerY)
    .lineTo(545, footerY)
    .strokeColor("#e5e5e5")
    .stroke();

  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor(GRAY)
    .text(
      "Thank you for shopping with Suhagan! For any queries regarding this order, contact us at g91652251@gmail.com or +91 89594 65264.",
      50,
      footerY + 14,
      { width: 495, align: "center" }
    );

  doc
    .fontSize(8)
    .fillColor("#bbbbbb")
    .text(
      "Suhagan Sarees, Ring Road, Surat, Gujarat - 395002",
      50,
      footerY + 40,
      { width: 495, align: "center" }
    );

  doc.end();
};

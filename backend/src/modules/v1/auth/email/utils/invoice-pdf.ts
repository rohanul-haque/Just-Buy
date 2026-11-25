import PDFDocument from "pdfkit";

export interface IInvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  itemSubtotal: number;
  size?: string;
}

export interface IInvoiceData {
  invoiceNumber: string;
  orderId: string;
  transactionNumber?: string;
  paidAt: Date;
  currency: string;
  paymentMethod: string;
  buyerName: string;
  buyerEmail: string;
  shippingAddress?: {
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  items: IInvoiceItem[];
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
}

export const generateInvoicePdfBuffer = (
  data: IInvoiceData,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    const currency = (data.currency || "USD").toUpperCase();
    const formatMoney = (val: number) => `$${val.toFixed(2)}`;
    const dateStr = new Date(data.paidAt).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Top Orange Accent Bar
    doc.rect(0, 0, doc.page.width, 8).fill("#ff6200");

    // Brand & Invoice Title
    doc
      .fillColor("#171717")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("JustBuy", 48, 36);

    doc
      .fillColor("#ff6200")
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("INVOICE", 0, 36, { align: "right", width: doc.page.width - 48 });

    doc
      .fillColor("#6b7280")
      .fontSize(9.5)
      .font("Helvetica")
      .text("Payment Receipt & Order Invoice", 48, 64);

    // Invoice Metadata
    const metaTop = 96;
    doc
      .fillColor("#171717")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text("Billed To:", 48, metaTop);

    doc
      .fillColor("#374151")
      .fontSize(9.5)
      .font("Helvetica")
      .text(data.shippingAddress?.fullName || data.buyerName, 48, metaTop + 16)
      .text(data.buyerEmail, 48, metaTop + 30);

    if (data.shippingAddress?.address) {
      const addressLine = [
        data.shippingAddress.address,
        data.shippingAddress.city,
        data.shippingAddress.postalCode,
        data.shippingAddress.country,
      ]
        .filter(Boolean)
        .join(", ");
      doc.text(addressLine, 48, metaTop + 44, { width: 240 });
    }

    const rightX = 330;
    doc
      .fillColor("#6b7280")
      .fontSize(9.5)
      .font("Helvetica")
      .text("Invoice No:", rightX, metaTop)
      .text("Order No:", rightX, metaTop + 16)
      .text("Payment Date:", rightX, metaTop + 32)
      .text("Payment Method:", rightX, metaTop + 48)
      .text("Status:", rightX, metaTop + 64);

    const displayOrderNo = data.transactionNumber
      ? `#${data.transactionNumber}`
      : `#${data.orderId.slice(-7).toUpperCase()}`;

    doc
      .fillColor("#171717")
      .font("Helvetica-Bold")
      .text(data.invoiceNumber, rightX + 95, metaTop)
      .text(displayOrderNo, rightX + 95, metaTop + 16)
      .font("Helvetica")
      .text(dateStr, rightX + 95, metaTop + 32)
      .text(data.paymentMethod, rightX + 95, metaTop + 48)
      .fillColor("#059669")
      .font("Helvetica-Bold")
      .text(`PAID (${currency})`, rightX + 95, metaTop + 64);

    // Table Header
    const tableTop = 205;
    doc
      .rect(48, tableTop, doc.page.width - 96, 26)
      .fill("#ff6200");

    doc
      .fillColor("#ffffff")
      .fontSize(9.5)
      .font("Helvetica-Bold")
      .text("Item", 58, tableTop + 8)
      .text("Qty", 315, tableTop + 8, { width: 45, align: "right" })
      .text("Unit Price", 375, tableTop + 8, { width: 70, align: "right" })
      .text("Subtotal", 460, tableTop + 8, { width: 75, align: "right" });

    // Table Rows
    let y = tableTop + 34;
    data.items.forEach((item, index) => {
      if (y > doc.page.height - 150) {
        doc.addPage();
        y = 50;
      }

      if (index % 2 === 1) {
        doc.rect(48, y - 5, doc.page.width - 96, 22).fill("#f9fafb");
      }

      const itemTitle = item.size ? `${item.name} (${item.size})` : item.name;
      doc
        .fillColor("#171717")
        .fontSize(9.5)
        .font("Helvetica")
        .text(itemTitle, 58, y, { width: 245, ellipsis: true })
        .text(String(item.quantity), 315, y, { width: 45, align: "right" })
        .text(formatMoney(item.unitPrice), 375, y, {
          width: 70,
          align: "right",
        })
        .font("Helvetica-Bold")
        .text(formatMoney(item.itemSubtotal), 460, y, {
          width: 75,
          align: "right",
        });

      y += 24;
    });

    // Divider
    y += 8;
    doc
      .moveTo(48, y)
      .lineTo(doc.page.width - 48, y)
      .strokeColor("#e5e7eb")
      .stroke();

    // Totals
    y += 16;
    doc
      .fillColor("#6b7280")
      .fontSize(10)
      .font("Helvetica")
      .text("Subtotal:", 360, y, { width: 95, align: "right" })
      .fillColor("#171717")
      .text(formatMoney(data.subtotal), 460, y, { width: 75, align: "right" });

    y += 18;
    doc
      .fillColor("#6b7280")
      .text("Shipping:", 360, y, { width: 95, align: "right" })
      .fillColor("#171717")
      .text(formatMoney(data.shippingCharge), 460, y, {
        width: 75,
        align: "right",
      });

    y += 22;
    doc
      .fillColor("#ff6200")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Total Paid:", 350, y, { width: 105, align: "right" })
      .text(formatMoney(data.totalAmount), 460, y, {
        width: 75,
        align: "right",
      });

    // Footer
    doc
      .fillColor("#9ca3af")
      .fontSize(8.5)
      .font("Helvetica")
      .text(
        "Thank you for shopping with JustBuy. This is a computer-generated invoice.",
        48,
        doc.page.height - 60,
        { align: "center", width: doc.page.width - 96 },
      );

    doc.end();
  });
};

import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    resendInstance = new Resend(key);
  }
  return resendInstance;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const FROM = "Tavern Creative <orders@taverncreative.co.uk>";
const REPLY_TO = "hello@taverncreative.co.uk";

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const resend = getResend();

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    replyTo: REPLY_TO,
  });

  if (error) {
    console.error("Email send error:", error);
    throw new Error("Failed to send email");
  }
}

// ——— Shared styles ———

const layout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Nunito',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px 32px;border-bottom:1px solid #f3f4f6;">
              <div style="font-family:'Figtree',Georgia,serif;font-size:18px;font-weight:600;color:#1a1a1a;letter-spacing:-0.01em;">
                Tavern Creative
              </div>
              <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin-top:2px;">
                Award-winning wedding stationery
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;font-size:12px;color:#9ca3af;line-height:1.6;">
              Questions? Reply to this email and we'll get back to you personally.<br/>
              &copy; Tavern Creative, Kent UK &middot; <a href="https://taverncreative.co.uk" style="color:#a3b18a;text-decoration:none;">taverncreative.co.uk</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const h1 = (text: string) =>
  `<h1 style="margin:0 0 12px 0;font-family:'Figtree',Georgia,serif;font-size:22px;font-weight:600;color:#1a1a1a;line-height:1.3;">${text}</h1>`;

const paragraph = (text: string) =>
  `<p style="margin:0 0 16px 0;font-size:14px;color:#4b5563;line-height:1.7;">${text}</p>`;

const summaryBox = (rows: Array<[string, string]>) => `
  <div style="margin:24px 0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${rows
        .map(
          ([label, value]) => `
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#6b7280;">${label}</td>
          <td style="padding:6px 0;font-size:13px;color:#1a1a1a;font-weight:500;text-align:right;">${value}</td>
        </tr>
      `
        )
        .join("")}
    </table>
  </div>
`;

const ctaButton = (label: string, url: string) => `
  <div style="margin:24px 0;">
    <a href="${url}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
      ${label}
    </a>
  </div>
`;

// ——— Templates ———

export interface OrderConfirmationData {
  orderNumber: string;
  productName: string;
  quantity: number;
  totalPence: number;
  dashboardUrl?: string;
}

export function orderConfirmationEmail(
  orderNumberOrData: string | OrderConfirmationData,
  productName?: string
): string {
  // Back-compat with the old 2-arg signature
  const data: OrderConfirmationData =
    typeof orderNumberOrData === "string"
      ? {
          orderNumber: orderNumberOrData,
          productName: productName || "",
          quantity: 0,
          totalPence: 0,
        }
      : orderNumberOrData;

  const rows: Array<[string, string]> = [
    ["Order", data.orderNumber],
    ["Product", data.productName],
  ];
  if (data.quantity) rows.push(["Quantity", `${data.quantity}`]);
  if (data.totalPence) rows.push(["Total", formatPrice(data.totalPence)]);

  const dashboardUrl =
    data.dashboardUrl ||
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/orders`;

  return layout(`
    ${h1("Your order is confirmed")}
    ${paragraph("Thank you for choosing Tavern Creative. We're getting your stationery ready for print — you'll hear from us again once it's dispatched.")}
    ${summaryBox(rows)}
    ${ctaButton("View your order", dashboardUrl)}
    ${paragraph("We typically dispatch within 1 working day of order confirmation. UK delivery takes 1–4 working days depending on the service you chose at checkout.")}
  `);
}

export interface OrderShippedData {
  orderNumber: string;
  trackingUrl?: string;
  dashboardUrl?: string;
}

export function orderShippedEmail(
  orderNumberOrData: string | OrderShippedData,
  trackingUrl?: string
): string {
  const data: OrderShippedData =
    typeof orderNumberOrData === "string"
      ? { orderNumber: orderNumberOrData, trackingUrl }
      : orderNumberOrData;

  const dashboardUrl =
    data.dashboardUrl ||
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/orders`;

  return layout(`
    ${h1("Your order is on its way")}
    ${paragraph("Good news — your stationery has been dispatched and is winging its way to you.")}
    ${summaryBox([["Order", data.orderNumber]])}
    ${data.trackingUrl ? ctaButton("Track your delivery", data.trackingUrl) : ctaButton("View your order", dashboardUrl)}
    ${paragraph("Once you receive your order, we'd love to hear what you think. Reply to this email with any feedback, or if something isn't right we'll make it right.")}
  `);
}

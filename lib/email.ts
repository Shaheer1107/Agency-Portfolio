import nodemailer from "nodemailer";

const recipients = [
  "bilal.shakeel732@gmail.com",
  "m.shaheerkhan280@gmail.com",
];

function getTransporter() {
  const user = process.env.EMAIL_HOST_USER;
  const password = process.env.EMAIL_HOST_PASSWORD;
  if (!user || !password) throw new Error("Email credentials are not configured.");

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: password },
  });
}

export async function sendInquiryNotification(inquiry: {
  email: string;
  company_size?: string | null;
  process?: string | null;
  message?: string | null;
}) {
  await getTransporter().sendMail({
    from: `AutomateIQ website <${process.env.EMAIL_HOST_USER}>`,
    to: recipients,
    replyTo: inquiry.email,
    subject: `New workflow audit request from ${inquiry.email}`,
    text: [
      `Email: ${inquiry.email}`,
      `Company size: ${inquiry.company_size || "Not provided"}`,
      `Process: ${inquiry.process || "Not provided"}`,
      `Message: ${inquiry.message || "Not provided"}`,
    ].join("\n"),
  });
}

export async function sendInquiryReply(to: string, reply: string) {
  await getTransporter().sendMail({
    from: `AutomateIQ <${process.env.EMAIL_HOST_USER}>`,
    to,
    subject: "Re: Your AutomateIQ workflow audit request",
    text: reply,
  });
}
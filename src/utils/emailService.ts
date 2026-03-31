import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { TransactionType } from "../entity/Transaction";

dotenv.config();

// -------------------- Validate SMTP configuration --------------------
const requiredEnvVars = [
  "SMTP_EMAIL",
  "SMTP_PASSWORD",
  "SMTP_HOST",
  "SMTP_PORT",
];

const missingVars = requiredEnvVars.filter(
  (varName) => !process.env[varName] || process.env[varName]?.trim() === ""
);
if (missingVars.length > 0) {
  console.warn(`⚠️ Missing SMTP env vars: ${missingVars.join(", ")}. Email disabled.`);

  process.exit(1);
}

console.log("SMTP config loaded:", `${process.env.SMTP_EMAIL} (validated)`);

const smtpHost = process.env.SMTP_HOST?.trim();
const smtpPort = Number(process.env.SMTP_PORT);
const smtpUser = process.env.SMTP_EMAIL?.trim();
const rawSmtpPass = process.env.SMTP_PASSWORD || "";
const smtpPass = rawSmtpPass.trim().replace(/\s+/g, "");
if (rawSmtpPass !== smtpPass) {
  console.warn("SMTP password contained spaces; normalized for auth.");
}

// -------------------- Create transporter --------------------
export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

// -------------------- Verify SMTP connection --------------------
transporter.verify((error: Error | null, success: boolean) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

/**
 * Shared Styles for the "Medium Box" Layout
 */
const BOX_LAYOUT_START = `
  <div style="background-color: #f3f4f6; padding: 40px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
      <div style="padding: 30px;">
`;

const BOX_LAYOUT_END = `
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} BankPro Inc. All rights reserved.</p>
      </div>
    </div>
  </div>
`;

// -------------------- VERIFICATION EMAIL --------------------
// -------------------- VERIFICATION EMAIL --------------------
export const sendVerificationEmail = async (
  email: string,
  code: string,
  userName?: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"BankPro" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `🔐 Password Reset Verification - BankPro`,
      html: `
      ${BOX_LAYOUT_START}
        <h2 style="color:#10b981; margin-top:0;">BankPro Verification</h2>
        <p>Hello <strong>${userName || "User"}</strong>,</p>
        <p>Use the verification code below to reset your password:</p>

        <div style="background:#059669; color:white; padding:25px; border-radius:10px; text-align:center; margin: 30px 0;">
          <span style="font-size:36px; font-weight:bold; letter-spacing:6px; padding:15px 25px; border: 2px dashed #ffffff; border-radius:10px; display:inline-block;">
            ${code}
          </span>
        </div>

        <p style="font-size:14px; color:#6b7280; text-align:center; margin-bottom:30px;">
          This code will expire in 10 minutes. If you did not request a password reset, you can safely ignore this email.
        </p>
        <p style="font-size:12px; color:#999; text-align:center; margin-top:40px;">
          &copy; ${new Date().getFullYear()} BankPro. All rights reserved.
        </p>
      ${BOX_LAYOUT_END}
      `,
      text: `Hello ${userName || "User"},\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request a password reset, please ignore this email.\n\n- BankPro Team`,
    });

    return true;
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    return false;
  }
};

// -------------------- WELCOME EMAIL --------------------
export const sendWelcomeEmail = async (
  email: string,
  userName: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"BankPro" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Welcome to BankPro",
      html: `
      ${BOX_LAYOUT_START}
       <h2 style="color:#10b981; margin-top:0;">BankPro Verification</h2>
        <h2 style="color:#1976d2; margin-top:0;">Welcome, ${userName}!</h2>
        <p>We're excited to have you on board. With BankPro, you can manage your accounts, apply for loans, and handle transfers with ease.</p>
        <div style="margin-top: 20px; padding: 20px; background-color: #eff6ff; border-radius: 8px; color: #1e40af;">
          <strong>Ready to start?</strong> Log in to your dashboard to explore your new features.
        </div>
      ${BOX_LAYOUT_END}
      `,
    });
    return true;
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    return false;
  }
};

// -------------------- TRANSACTION EMAIL --------------------
export const sendTransactionEmail = async (
  email: string,
  transaction: {
    type: TransactionType;
    amount: number;
    balanceAfter: number;
    referenceNumber: string;
    description: string;
    createdAt: string;
  },
  isIncoming?: boolean
): Promise<boolean> => {
  try {
    let typeIcon = "💰";
    let action = "processed";

    const displayLabel: string = (() => {
      switch (transaction.type) {
        case TransactionType.DEPOSIT:
          typeIcon = "📥"; action = "credited"; return "Deposit";
        case TransactionType.WITHDRAW:
          typeIcon = "📤"; action = "debited"; return "Withdraw";
        case TransactionType.TRANSFER_IN:
          typeIcon = "📥"; action = "credited"; return isIncoming ? "Funds Received" : "Transfer In";
        case TransactionType.TRANSFER_OUT:
          typeIcon = "📤"; action = "debited"; return isIncoming ? "Funds Sent" : "Transfer Out";
        case TransactionType.LOAN_DISBURSEMENT:
          typeIcon = "💵"; action = "credited"; return "Loan Disbursed";
        case TransactionType.LOAN_PAYMENT:
          typeIcon = "💳"; action = "debited"; return "Loan Payment";
        default: return transaction.type;
      }
    })();

    await transporter.sendMail({
      from: `"BankPro" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `Transaction Confirmation - Ref# ${transaction.referenceNumber}`,
      html: `
      ${BOX_LAYOUT_START}
      
        <h2 style="color:#10b981; margin-top:0;">BankPro Transaction Alert</h2>
        <p>Your account has been <strong>${action}</strong>:</p>

        <div style="background:#059669; color:white; padding:20px; border-radius:10px; text-align:center; margin: 20px 0;">
          <h3 style="margin:0;">${typeIcon} ${displayLabel}</h3>
          <p style="font-size:28px; font-weight:bold; margin: 10px 0;">৳ ${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <p style="margin:0; opacity:0.9; font-size: 14px;">Ref#: ${transaction.referenceNumber}</p>
        </div>

        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td style="padding:10px 0; color:#6b7280; border-bottom:1px solid #f3f4f6;">New Balance</td>
            <td style="padding:10px 0; text-align:right; font-weight:bold; border-bottom:1px solid #f3f4f6;">৳ ${transaction.balanceAfter.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; color:#6b7280; border-bottom:1px solid #f3f4f6;">Description</td>
            <td style="padding:10px 0; text-align:right; border-bottom:1px solid #f3f4f6;">${transaction.description}</td>
          </tr>
          <tr>
            <td style="padding:10px 0; color:#6b7280;">Date</td>
            <td style="padding:10px 0; text-align:right;">${new Date(transaction.createdAt).toLocaleString()}</td>
          </tr>
        </table>
      ${BOX_LAYOUT_END}
      `,
    });
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to send transaction email:`, error.message);
    return false;
  }
};

// -------------------- LOAN DISBURSED EMAIL --------------------
export const sendLoanDisbursedEmail = async (
  email: string,
  loanData: {
    loanId: string;
    amount: number;
    referenceNumber: string;
    description: string;
    disbursedDate: string;
  },
  userName?: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"BankPro" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `🎉 Loan Disbursed - ${loanData.loanId}`,
      html: `
      ${BOX_LAYOUT_START}
       
        <h2 style="color:#10b981; margin-top:0;">BankPro Loan Approved!</h2>
        <p>Hello ${userName || "Customer"}, your funds have been disbursed.</p>
        
        <div style="background:#059669; color:white; padding:25px; border-radius:10px; text-align:center; margin:20px 0;">
          <h3 style="margin:0;">💵 Loan ${loanData.loanId}</h3>
          <p style="font-size:32px; font-weight:bold; margin: 10px 0;">৳ ${loanData.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          <p style="margin:0; opacity:0.8;">Ref#: ${loanData.referenceNumber}</p>
        </div>

        <ul style="list-style:none; padding:0; background:#f9fafb; border-radius:8px; padding: 15px;">
          <li style="padding: 5px 0;"><strong>Loan ID:</strong> ${loanData.loanId}</li>
          <li style="padding: 5px 0;"><strong>Description:</strong> ${loanData.description}</li>
          <li style="padding: 5px 0;"><strong>Date:</strong> ${new Date(loanData.disbursedDate).toLocaleString()}</li>
        </ul>
      ${BOX_LAYOUT_END}
      `,
    });
    return true;
  } catch (error: any) { return false; }
};

// -------------------- LOAN PAYMENT EMAIL --------------------
export const sendLoanPaymentEmail = async (
  email: string,
  paymentData: {
    loanId: string;
    amountPaid: number;
    remainingBalance: number;
    referenceNumber: string;
    description: string;
    paymentDate: string;
  },
  userName?: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"BankPro" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `💳 Loan Payment Received - ${paymentData.loanId}`,
      html: `
      ${BOX_LAYOUT_START}
       <h2 style="color:#10b981; margin-top:0;">BankPro</h2>
        <h2 style="color:#10b981; margin-top:0;">Payment Received</h2>
        <p>Hello ${userName || "Customer"}, we've successfully processed your payment.</p>
        
        <div style="background:#059669; color:white; padding:20px; border-radius:10px; text-align:center; margin:20px 0;">
          <h3 style="margin:0;">💳 Payment for ${paymentData.loanId}</h3>
          <p style="font-size:24px; font-weight:bold; margin:10px 0;">৳ ${paymentData.amountPaid.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
        </div>

        <div style="padding:15px; border: 1px solid #e5e7eb; border-radius:8px;">
          <p style="margin: 5px 0;"><strong>Remaining Balance:</strong> ৳ ${paymentData.remainingBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          <p style="margin: 5px 0;"><strong>Reference:</strong> ${paymentData.referenceNumber}</p>
        </div>

        ${paymentData.remainingBalance <= 0 ? '<p style="color:#10b981; text-align:center;"><strong>🎉 Your loan is now fully paid!</strong></p>' : ''}
      ${BOX_LAYOUT_END}
      `,
    });
    return true;
  } catch (error: any) { return false; }
};

// -------------------- LOAN REJECTED EMAIL --------------------
export const sendLoanRejectedEmail = async (
  email: string,
  rejectionData: {
    loanId: string;
    amount: number;
    rejectedDate: string;
  },
  userName?: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"BankPro" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `Loan Application Update - ${rejectionData.loanId}`,
      html: `
      ${BOX_LAYOUT_START}
      
        <h2 style="color:#ef4444; margin-top:0;">BankPro Application Status</h2>
        <p>Hello ${userName || "Customer"},</p>
        
        <div style="background:#fee2e2; color:#dc2626; padding:20px; border-radius:10px; text-align:center; margin:20px 0; border: 1px solid #fecaca;">
          <h3 style="margin:0;">❌ Loan Rejected</h3>
          <p style="font-size:20px; margin: 10px 0;">৳ ${rejectionData.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
        </div>

        <p style="font-size:14px; color:#6b7280;">We are unable to approve your application at this time. You can view specific feedback in your dashboard or contact our support team.</p>
      ${BOX_LAYOUT_END}
      `,
    });
    return true;
  } catch (error: any) { return false; }
};

export default transporter;

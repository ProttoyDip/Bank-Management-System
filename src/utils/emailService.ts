import nodemailer from "nodemailer";
import "dotenv/config";

// Create transporter using environment variables
// Configure these in your .env file
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});

/**
 * Send a verification code email to the user
 * @param email - Recipient email address
 * @param code - Verification code to send
 * @param userName - Optional user name for personalization
 */
export const sendVerificationEmail = async (
    email: string, 
    code: string, 
    userName?: string
): Promise<boolean> => {
    try {
        const mailOptions = {
            from: `"BankPro" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Password Reset Verification Code - BankPro",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f5f5f5;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #1976d2 0%, #06b6d4 100%);
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            color: #ffffff;
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .content p {
                            color: #333333;
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 20px;
                        }
                        .verification-code {
                            display: inline-block;
                            background: linear-gradient(135deg, #1976d2 0%, #06b6d4 100%);
                            color: #ffffff;
                            font-size: 36px;
                            font-weight: bold;
                            padding: 15px 30px;
                            border-radius: 8px;
                            letter-spacing: 8px;
                            margin: 20px 0;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            border-top: 1px solid #e9ecef;
                        }
                        .footer p {
                            color: #6c757d;
                            font-size: 12px;
                            margin: 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>BankPro</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${userName || 'User'},</p>
                            <p>We received a request to reset your password. Use the verification code below to proceed:</p>
                            <div class="verification-code">${code}</div>
                            <p>This code will expire in 10 minutes.</p>
                            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} BankPro. All rights reserved.</p>
                            <p>This is an automated message, please do not reply directly to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Hello ${userName || 'User'},

                We received a request to reset your password. Use the verification code below to proceed:

                Verification Code: ${code}

                This code will expire in 10 minutes.

                If you didn't request a password reset, please ignore this email or contact support if you have concerns.

                © ${new Date().getFullYear()} BankPro. All rights reserved.
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent successfully to ${email}`);
        console.log(`📧 Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("❌ Error sending verification email:", error);
        return false;
    }
};

/**
 * Send a welcome email to new users
 * @param email - Recipient email address
 * @param userName - User's name
 */
export const sendWelcomeEmail = async (email: string, userName: string): Promise<boolean> => {
    try {
        const mailOptions = {
            from: `"BankPro" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "Welcome to BankPro",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f5f5f5;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #1976d2 0%, #06b6d4 100%);
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            color: #ffffff;
                            margin: 0;
                            font-size: 28px;
                        }
                        .content {
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .content p {
                            color: #333333;
                            font-size: 16px;
                            line-height: 1.6;
                            margin-bottom: 20px;
                        }
                        .footer {
                            background-color: #f8f9fa;
                            padding: 20px;
                            text-align: center;
                            border-top: 1px solid #e9ecef;
                        }
                        .footer p {
                            color: #6c757d;
                            font-size: 12px;
                            margin: 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>BankPro</h1>
                        </div>
                        <div class="content">
                            <p>Hello ${userName},</p>
                            <p>Welcome to BankPro! We're excited to have you on board.</p>
                            <p>With BankPro, you can manage your accounts, apply for loans, transfer funds, and much more - all in one secure platform.</p>
                            <p>If you have any questions, feel free to reach out to our support team.</p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} BankPro. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Welcome email sent successfully to ${email}`);
        console.log(`📧 Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("❌ Error sending welcome email:", error);
        return false;
    }
};

export default transporter;


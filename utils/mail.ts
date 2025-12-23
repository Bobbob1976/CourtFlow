import nodemailer from 'nodemailer';

// Create a reusable transporter object using Hostinger SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT) || 465, // 465 for SSL, 587 for TLS
    secure: true, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER, // e.g. info@courtflow.nl
        pass: process.env.SMTP_PASSWORD, // your email password
    },
});

export async function sendEmail({
    to,
    subject,
    html,
    text
}: {
    to: string;
    subject: string;
    html: string;
    text?: string;
}) {
    // If credentials are missing, log instead of crashing (Safety for Dev)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn("⚠️ SMTP credentials missing. Email NOT sent.");
        console.log("To:", to);
        console.log("Subject:", subject);
        console.log("--- Content ---\n", text || html);
        return { success: false, error: "SMTP credentials missing" };
    }

    try {
        const info = await transporter.sendMail({
            from: `CourtFlow <${process.env.SMTP_USER || 'info@claritysolutions.cloud'}>`, // Sender address
            to,
            subject,
            text, // fallback plain text
            html, // html body
        });

        console.log("✅ Email sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error("❌ Error sending email:", error);
        return { success: false, error: error.message };
    }
}

"use server";

import { getBookingConfirmationEmail, getBookingCancellationEmail } from "./email-templates";

// Email service using Resend (or any other provider)
// Install: npm install resend

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams) {
    try {
        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
            console.log("📧 Email would be sent (Resend not configured):", { to, subject });
            return { success: true, message: "Email simulated (no API key)" };
        }

        // Use Resend to send email
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || "CourtFlow <noreply@courtflow.app>",
            to: [to],
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("❌ Email send error:", error);
            return { success: false, error: error.message };
        }

        console.log("✅ Email sent:", { to, subject, id: data?.id });
        return { success: true, data };

    } catch (error) {
        console.error("❌ Email service error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export async function sendBookingConfirmation(params: {
    to: string;
    userName: string;
    courtName: string;
    sport: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalCost: number;
    bookingId: string;
    clubName: string;
}) {
    const html = getBookingConfirmationEmail(params);

    return sendEmail({
        to: params.to,
        subject: `✓ Booking Confirmed - ${params.courtName} on ${params.bookingDate}`,
        html,
    });
}

export async function sendBookingCancellation(params: {
    to: string;
    userName: string;
    courtName: string;
    sport: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalCost: number;
    bookingId: string;
    clubName: string;
}) {
    const html = getBookingCancellationEmail(params);

    return sendEmail({
        to: params.to,
        subject: `Booking Cancelled - ${params.courtName}`,
        html,
    });
}

export async function sendBookingReminder(params: {
    to: string;
    userName: string;
    courtName: string;
    bookingDate: string;
    startTime: string;
}) {
    const html = `
    <h1>Reminder: Your booking is tomorrow!</h1>
    <p>Hi ${params.userName},</p>
    <p>This is a friendly reminder that you have a booking at <strong>${params.courtName}</strong> tomorrow (${params.bookingDate}) at ${params.startTime}.</p>
    <p>See you on the court!</p>
  `;

    return sendEmail({
        to: params.to,
        subject: `⏰ Reminder: Booking Tomorrow at ${params.startTime}`,
        html,
    });
}

import { NextRequest, NextResponse } from 'next/server';
import { processMollieWebhook } from '@/lib/mollie-actions';

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const params = new URLSearchParams(body);
        const paymentId = params.get('id');

        if (!paymentId) {
            return NextResponse.json(
                { error: 'Missing payment ID' },
                { status: 400 }
            );
        }

        console.log('📥 Mollie webhook received:', paymentId);

        const result = await processMollieWebhook(paymentId);

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('❌ Webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

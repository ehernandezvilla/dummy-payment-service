// src/scripts/test-payment.ts
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

async function simulatePaymentFlow() {
    try {
        // 1. Iniciar un pago
        const initResponse = await axios.post(`${API_BASE_URL}/api/payments/initiate`, {
            amount: 99.99,
            userId: "user123",
            metadata: {
                orderId: "ORDER123",
                description: "Test payment"
            }
        });

        const { transactionId } = initResponse.data;
        console.log('Payment initiated:', initResponse.data);

        // 2. Simular eventos de webhook para el flujo de pago
        const events = [
            { type: 'payment.created', delay: 1000 },
            { type: 'payment.processing', delay: 2000 },
            { type: 'payment.success', delay: 3000 }
        ];

        for (const event of events) {
            await new Promise(resolve => setTimeout(resolve, event.delay));

            const webhookEvent = {
                id: crypto.randomUUID(),
                type: event.type,
                created: Date.now(),
                data: {
                    transactionId,
                    amount: 99.99,
                    userId: "user123",
                    metadata: {
                        orderId: "ORDER123"
                    }
                }
            };

            // Crear firma del webhook
            const signature = crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(JSON.stringify(webhookEvent))
                .digest('hex');

            // Enviar evento webhook
            const webhookResponse = await axios.post(
                `${API_BASE_URL}/webhooks/payment`,
                webhookEvent,
                {
                    headers: {
                        'x-webhook-signature': signature
                    }
                }
            );

            console.log(`Webhook ${event.type} sent:`, webhookResponse.data);

            // Verificar estado del pago
            const statusResponse = await axios.get(
                `${API_BASE_URL}/api/payments/${transactionId}/status`
            );
            console.log('Payment status:', statusResponse.data);
        }

        // 3. Verificar estado de la cola de webhooks
        const queueStatus = await axios.get(`${API_BASE_URL}/webhooks/status`);
        console.log('Queue status:', queueStatus.data);

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error:', error.response?.data || error.message);
        } else {
            console.error('Error:', error);
        }
    }
}

simulatePaymentFlow();
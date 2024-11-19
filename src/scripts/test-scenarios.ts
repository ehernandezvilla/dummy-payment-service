// src/scripts/test-scenarios.ts
import crypto from 'crypto';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

interface PaymentScenario {
    name: string;
    amount: number;
    events: Array<{
        type: string;
        delay: number;
        expectedStatus: string;
    }>;
}

const scenarios: PaymentScenario[] = [
    {
        name: "Successful Payment",
        amount: 99.99,
        events: [
            { type: 'payment.created', delay: 1000, expectedStatus: 'payment_pending' },
            { type: 'payment.processing', delay: 2000, expectedStatus: 'payment_processing' },
            { type: 'payment.success', delay: 3000, expectedStatus: 'payment_success' }
        ]
    },
    {
        name: "Failed Payment",
        amount: 199.99,
        events: [
            { type: 'payment.created', delay: 1000, expectedStatus: 'payment_pending' },
            { type: 'payment.processing', delay: 2000, expectedStatus: 'payment_processing' },
            { type: 'payment.failed', delay: 3000, expectedStatus: 'payment_failed' }
        ]
    },
    {
        name: "Cancelled Payment",
        amount: 299.99,
        events: [
            { type: 'payment.created', delay: 1000, expectedStatus: 'payment_pending' },
            { type: 'payment.processing', delay: 2000, expectedStatus: 'payment_processing' },
            { type: 'payment.cancelled', delay: 3000, expectedStatus: 'payment_cancelled' }
        ]
    },
    {
        name: "Expired Payment",
        amount: 399.99,
        events: [
            { type: 'payment.created', delay: 1000, expectedStatus: 'payment_pending' },
            { type: 'payment.expired', delay: 5000, expectedStatus: 'payment_expired' }
        ]
    }
];

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForStatus(transactionId: string, expectedStatus: string, maxAttempts = 10): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
        const statusResponse = await axios.get(
            `${API_BASE_URL}/api/payments/${transactionId}/status`
        );
        
        if (statusResponse.data.status === expectedStatus) {
            return true;
        }
        
        await sleep(500); // Wait 500ms between attempts
    }
    return false;
}

async function simulateScenario(scenario: PaymentScenario) {
    console.log(`\n🎬 Starting scenario: ${scenario.name}`);
    try {
        // 1. Iniciar pago
        const initResponse = await axios.post(`${API_BASE_URL}/api/payments/initiate`, {
            amount: scenario.amount,
            userId: "user123",
            metadata: {
                orderId: "ORDER123",
                scenario: scenario.name
            }
        });

        const { transactionId } = initResponse.data;
        console.log('✅ Payment initiated:', initResponse.data);

        // 2. Procesar eventos
        for (const event of scenario.events) {
            await sleep(event.delay);

            const webhookEvent = {
                id: crypto.randomUUID(),
                type: event.type,
                created: Date.now(),
                data: {
                    transactionId,
                    amount: scenario.amount,
                    userId: "user123",
                    metadata: {
                        orderId: "ORDER123",
                        scenario: scenario.name
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

            console.log(`✅ Webhook ${event.type} sent:`, webhookResponse.data);

            // Esperar y verificar el estado correcto
            const statusUpdated = await waitForStatus(transactionId, event.expectedStatus);
            const finalStatus = await axios.get(
                `${API_BASE_URL}/api/payments/${transactionId}/status`
            );

            if (statusUpdated) {
                console.log(`✅ Payment status updated to ${event.expectedStatus}:`, finalStatus.data);
            } else {
                console.log(`❌ Payment status did not update to ${event.expectedStatus}:`, finalStatus.data);
            }
        }

    } catch (error) {
        console.error('❌ Error in scenario:', scenario.name);
        if (axios.isAxiosError(error)) {
            console.error('Error details:', error.response?.data || error.message);
        } else {
            console.error('Error:', error);
        }
    }
}

async function runAllScenarios() {
    console.log('🚀 Starting payment gateway simulation...');
    
    for (const scenario of scenarios) {
        await simulateScenario(scenario);
        await sleep(2000); // Pausa entre escenarios
    }

    // Verificar estado final de la cola
    try {
        const queueStatus = await axios.get(`${API_BASE_URL}/webhooks/status`);
        console.log('\n📊 Final queue status:', queueStatus.data);
    } catch (error) {
        console.error('Error getting queue status:', error);
    }

    console.log('\n✨ Simulation completed!');
}

runAllScenarios();
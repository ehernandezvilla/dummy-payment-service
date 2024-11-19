// src/scripts/test-local.ts
import axios from 'axios';
import crypto from 'crypto';

const API_BASE_URL = 'http://localhost:3000';
const API_KEY = 'local-api-key-123';
const WEBHOOK_SECRET = 'local-webhook-secret-key';

// Simular una quote de tu sistema
const mockQuote = {
  id: '492927a2-8b3d-4834-9461-0738e1c85a4f',
  user_id: '7f465bdb-8d3f-4b63-beb1-72eda470d652',
  quote_number: 'FCL-20241118-0724',
  shipment_type: 'FCL',
  total_amount: 4443967.70,
  currency: 'USD',
  quote_data: {
    shipmentQuote: {
      amount: 7515,
      route: "CNSHA-SCL",
    },
    insuranceQuote: {
      costoTotal: 2252.7
    },
    transportQuote: {
      total: 100000
    }
  }
};

async function testPaymentGateway() {
  try {
    console.log('🚀 Iniciando prueba del Payment Gateway');

    // 1. Iniciar pago
    console.log('\n1️⃣ Iniciando pago...');
    const paymentResponse = await axios.post(
      `${API_BASE_URL}/api/payments/initiate`,
      {
        amount: mockQuote.total_amount,
        userId: mockQuote.user_id,
        metadata: {
          quoteId: mockQuote.id,
          quoteNumber: mockQuote.quote_number,
          shipmentType: mockQuote.shipment_type,
          breakdown: {
            shipment: mockQuote.quote_data.shipmentQuote.amount,
            insurance: mockQuote.quote_data.insuranceQuote.costoTotal,
            transport: mockQuote.quote_data.transportQuote.total
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      }
    );

    console.log('✅ Pago iniciado:', paymentResponse.data);

    // 2. Simular eventos de webhook
    const events = [
      { type: 'payment.created', delay: 1000 },
      { type: 'payment.processing', delay: 2000 },
      { type: 'payment.success', delay: 3000 }
    ];

    for (const event of events) {
      await new Promise(resolve => setTimeout(resolve, event.delay));

      console.log(`\n2️⃣ Enviando webhook ${event.type}...`);
      
      const webhookEvent = {
        id: crypto.randomUUID(),
        type: event.type,
        created: Date.now(),
        data: {
          transactionId: paymentResponse.data.transactionId,
          amount: mockQuote.total_amount,
          userId: mockQuote.user_id,
          metadata: {
            quoteId: mockQuote.id,
            quoteNumber: mockQuote.quote_number
          }
        }
      };

      // Crear firma del webhook
      const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(webhookEvent))
        .digest('hex');

      const webhookResponse = await axios.post(
        `${API_BASE_URL}/webhooks/payment`,
        webhookEvent,
        {
          headers: {
            'x-webhook-signature': signature
          }
        }
      );

      console.log(`✅ Webhook ${event.type} enviado:`, webhookResponse.data);

      // Verificar estado del pago
      const statusResponse = await axios.get(
        `${API_BASE_URL}/api/payments/${paymentResponse.data.transactionId}/status`,
        {
          headers: {
            'x-api-key': API_KEY
          }
        }
      );

      console.log('📊 Estado del pago:', statusResponse.data);
    }

    // 3. Verificar estado de la cola
    console.log('\n3️⃣ Verificando estado de la cola...');
    const queueStatus = await axios.get(
      `${API_BASE_URL}/webhooks/status`,
      {
        headers: {
          'x-api-key': API_KEY
        }
      }
    );
    console.log('📊 Estado de la cola:', queueStatus.data);

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error:', error.response?.data || error.message);
    } else {
      console.error('❌ Error:', error);
    }
  }
}

// Ejecutar prueba
testPaymentGateway();
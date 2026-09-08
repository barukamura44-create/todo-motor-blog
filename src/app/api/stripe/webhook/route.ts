import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeWebhook } from '../../../../../server/stripe-service';

/**
 * Next.js Route Handler: POST /api/stripe/webhook
 * Recebe eventos assinados criptograficamente da Stripe.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Assinatura stripe-signature ausente nos cabeçalhos.' },
      { status: 400 }
    );
  }

  try {
    // Lê o corpo bruto da requisição para validação da assinatura
    const rawBody = await request.text();

    const event = verifyStripeWebhook(rawBody, signature);

    // Processamento seguro dos eventos
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        console.log(`[Stripe Webhook] Novo cliente concluiu checkout: ${session.customer_email || session.id}`);
        // Aqui pode salvar ou atualizar o status do lojista no banco de dados
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as any;
        console.log(`[Stripe Webhook] Assinatura criada: ${subscription.id} | Status: ${subscription.status}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        console.log(`[Stripe Webhook] Assinatura atualizada: ${subscription.id} | Status: ${subscription.status}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        console.log(`[Stripe Webhook] Pagamento aprovado: ${invoice.id} | Valor: ${invoice.amount_paid}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.warn(`[Stripe Webhook] Falha no pagamento da fatura: ${invoice.id}`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Evento não manipulado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook Error]:', error);
    const message = error instanceof Error ? error.message : 'Erro na validação do webhook';
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }
}

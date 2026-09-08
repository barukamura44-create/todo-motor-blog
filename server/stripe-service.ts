import Stripe from 'stripe';

/**
 * Serviço Stripe Seguro para Todo Motor Blog / Marketplace
 * Gerencia Sessões de Checkout, Assinaturas e Validação de Webhooks.
 */

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY não configurada. Adicione sua chave secreta (sk_live_... ou sk_test_...) no arquivo .env.local.'
    );
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia' as any,
  });
};

export interface CreateCheckoutOptions {
  customerEmail?: string;
  customerName?: string;
  origin: string;
  priceId?: string;
  applyTrial?: boolean;
}

/**
 * Cria uma sessão do Stripe Checkout para assinatura do anunciante / lojista
 */
export async function createAdvertiserCheckoutSession(options: CreateCheckoutOptions) {
  const stripe = getStripeClient();
  const priceId = options.priceId || process.env.STRIPE_PRICE_ID_MONTHLY;

  if (!priceId) {
    throw new Error(
      'STRIPE_PRICE_ID_MONTHLY não configurado. Crie um produto e preço recorrente no Stripe Dashboard e defina o Price ID no .env.local.'
    );
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // Habilita o campo de código promocional (ex: LANCAMENTO20) com limite de 20 resgates definido no Stripe
    allow_promotion_codes: true,
    customer_email: options.customerEmail || undefined,
    billing_address_collection: 'required',
    subscription_data: {
      metadata: {
        source: 'todo-motor-blog',
        customerName: options.customerName || '',
      },
      // Se solicitado trial explícito de 30 dias (1 mês grátis)
      trial_period_days: options.applyTrial ? 30 : undefined,
    },
    metadata: {
      source: 'todo-motor-blog',
      customerName: options.customerName || '',
    },
    success_url: `${options.origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${options.origin}/#anuncie`,
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Validação criptográfica do webhook do Stripe
 */
export function verifyStripeWebhook(rawBody: string | Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET não configurado.');
  }

  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

/**
 * Busca detalhes de uma sessão de checkout concluída
 */
export async function retrieveCheckoutSession(sessionId: string) {
  const stripe = getStripeClient();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['customer', 'subscription'],
  });
}

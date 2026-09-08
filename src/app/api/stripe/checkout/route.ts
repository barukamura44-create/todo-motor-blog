import { NextRequest, NextResponse } from 'next/server';
import { createAdvertiserCheckoutSession } from '../../../../../server/stripe-service';

/**
 * Next.js Route Handler: POST /api/stripe/checkout
 * Cria uma sessão do Stripe Checkout para adesão à assinatura do Todo Motor
 * Suporta o cupom LANCAMENTO20 ou período de teste (trial de 30 dias).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { customerEmail, customerName, applyTrial } = body;

    // Obtém a origem (URL base do blog) dinamicamente a partir dos headers
    const origin =
      request.headers.get('origin') ||
      request.headers.get('referer')?.replace(/\/$/, '') ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          success: false,
          message:
            'A chave STRIPE_SECRET_KEY ainda não foi definida nas variáveis de ambiente (.env.local). Adicione sua chave para ativar o checkout.',
          requiresSetup: true,
        },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_PRICE_ID_MONTHLY) {
      return NextResponse.json(
        {
          success: false,
          message:
            'STRIPE_PRICE_ID_MONTHLY não configurado no .env.local. Crie o produto/preço no painel do Stripe e adicione o ID correspondente.',
          requiresSetup: true,
        },
        { status: 400 }
      );
    }

    const { url, sessionId } = await createAdvertiserCheckoutSession({
      customerEmail,
      customerName,
      origin,
      applyTrial: applyTrial ?? true, // Concede 1 mês grátis por padrão na oferta de lançamento
    });

    return NextResponse.json({
      success: true,
      url,
      sessionId,
    });
  } catch (error) {
    console.error('[Stripe Checkout Error]:', error);
    const message = error instanceof Error ? error.message : 'Erro interno ao iniciar checkout';
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

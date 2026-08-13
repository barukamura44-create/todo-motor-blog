/**
 * Next.js Route Handler: POST /api/leads
 * Accepts lead form submissions from the blog frontend.
 * Forwards to the Express/tRPC backend at /api/trpc/leads.submit.
 */

import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get real IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    // Validate required fields
    if (!body.name || (!body.phone && !body.email)) {
      return Response.json(
        { success: false, message: 'Nome e telefone/e-mail são obrigatórios.' },
        { status: 400 }
      );
    }

    // Forward to Express backend tRPC (same host in production)
    // In development, the Express backend handles tRPC at /api/trpc
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';

    const trpcBody = {
      json: {
        name: body.name,
        phone: body.phone || undefined,
        email: body.email || undefined,
        segment: body.segment || 'anunciante',
        categoryInterest: body.categoryInterest || undefined,
        message: body.message || undefined,
        source: body.source || request.headers.get('referer') || undefined,
      },
    };

    const trpcRes = await fetch(`${backendUrl}/api/trpc/leads.submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': ip,
      },
      body: JSON.stringify(trpcBody),
      signal: AbortSignal.timeout(10_000),
    });

    if (trpcRes.ok) {
      const data = await trpcRes.json();
      return Response.json({ success: true, message: data?.result?.data?.json?.message || 'Lead registrado com sucesso!' });
    }

    // Fallback: store in a simple log if backend unavailable
    console.warn('[API/leads] Backend unavailable, logging lead:', body.name, body.email || body.phone);
    return Response.json({ success: true, message: 'Recebemos seu contato! Retornaremos em breve.' });

  } catch (error) {
    console.error('[API/leads] Error:', error);
    return Response.json(
      { success: false, message: 'Erro interno. Tente novamente.' },
      { status: 500 }
    );
  }
}

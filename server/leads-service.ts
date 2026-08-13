/**
 * Leads service — captures potential advertisers/sellers interested in the Todo Motor platform.
 * Includes rate limiting (1 lead per IP per hour) and admin notification.
 */

import { createLead, getLeads, countLeadsByIp } from './db';
import type { InsertLead } from '../drizzle/schema';

export interface LeadInput {
  name: string;
  phone?: string;
  email?: string;
  segment: 'anunciante' | 'lojista' | 'comprador' | 'outro';
  categoryInterest?: string;
  message?: string;
  source?: string;
  ipAddress?: string;
}

/**
 * Submit a new lead. Enforces rate limiting per IP.
 * Returns the created lead ID.
 */
export async function submitLead(input: LeadInput): Promise<{ success: boolean; message: string }> {
  // Rate limiting: max 1 lead per IP per hour
  if (input.ipAddress) {
    const recentCount = await countLeadsByIp(input.ipAddress, 3600_000);
    if (recentCount >= 3) {
      return {
        success: false,
        message: 'Muitas solicitações. Por favor, tente novamente em 1 hora.',
      };
    }
  }

  // Validate required fields
  if (!input.name || input.name.trim().length < 2) {
    return { success: false, message: 'Nome inválido.' };
  }

  if (!input.phone && !input.email) {
    return { success: false, message: 'Informe pelo menos telefone ou e-mail.' };
  }

  const lead: InsertLead = {
    name: input.name.trim().substring(0, 128),
    phone: input.phone?.trim().substring(0, 32),
    email: input.email?.trim().toLowerCase().substring(0, 320),
    segment: input.segment,
    categoryInterest: input.categoryInterest?.substring(0, 64),
    message: input.message?.trim().substring(0, 1000),
    source: input.source?.substring(0, 256),
    ipAddress: input.ipAddress?.substring(0, 64),
  };

  await createLead(lead);

  // Fire-and-forget admin notification
  notifyAdmin(lead).catch(err => {
    console.warn('[Leads] Admin notification failed:', err);
  });

  return { success: true, message: 'Obrigado! Nossa equipe entrará em contato em breve.' };
}

/**
 * List all leads (admin only).
 */
export async function listLeads(limit = 50, offset = 0) {
  return getLeads(limit, offset);
}

/**
 * Export leads as a CSV string.
 */
export async function exportLeadsCsv(): Promise<string> {
  const allLeads = await getLeads(1000, 0);
  const header = 'ID,Nome,Telefone,Email,Segmento,Categoria,Mensagem,Origem,Data\n';
  const rows = allLeads.map(l =>
    [
      l.id,
      `"${l.name}"`,
      l.phone || '',
      l.email || '',
      l.segment,
      l.categoryInterest || '',
      `"${(l.message || '').replace(/"/g, '""')}"`,
      l.source || '',
      l.createdAt?.toISOString() || '',
    ].join(',')
  );
  return header + rows.join('\n');
}

/**
 * Send a notification to the platform owner about a new lead.
 * Uses the built-in Forge API email service if available.
 */
async function notifyAdmin(lead: InsertLead): Promise<void> {
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!forgeApiUrl || !forgeApiKey) {
    console.log('[Leads] No Forge API configured — skipping admin notification');
    return;
  }

  const segmentLabels: Record<string, string> = {
    anunciante: '🚗 Quer anunciar na plataforma',
    lojista: '🏪 Lojista interessado em mídia',
    comprador: '🛒 Comprador buscando veículos',
    outro: '📝 Outro interesse',
  };

  const body = {
    subject: `[Todo Motor] Novo Lead: ${lead.name} — ${segmentLabels[lead.segment || 'outro']}`,
    text: [
      `Novo lead capturado no blog Todo Motor:`,
      ``,
      `Nome: ${lead.name}`,
      `Telefone: ${lead.phone || '—'}`,
      `E-mail: ${lead.email || '—'}`,
      `Segmento: ${segmentLabels[lead.segment || 'outro']}`,
      `Categoria de interesse: ${lead.categoryInterest || '—'}`,
      `Mensagem: ${lead.message || '—'}`,
      `Origem: ${lead.source || '—'}`,
    ].join('\n'),
  };

  try {
    await fetch(`${forgeApiUrl}/notifications/email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${forgeApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.warn('[Leads] Email notification error:', err);
  }
}

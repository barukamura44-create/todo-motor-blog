'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Check, Copy, Flame, Loader2 } from 'lucide-react';

interface PromoBannerLojistaProps {
  onOpenLeadModal?: () => void;
}

export default function PromoBannerLojista({ onOpenLeadModal }: PromoBannerLojistaProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const promoCode = process.env.NEXT_PUBLIC_STRIPE_PROMO_CODE || 'LANCAMENTO20';

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStartFreeTrial = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applyTrial: true,
        }),
      });

      const data = await res.json();

      if (data.success && data.url) {
        // Redireciona para o checkout seguro da Stripe
        window.location.href = data.url;
      } else {
        if (data.requiresSetup) {
          setErrorMessage(
            'Chaves de produção do Stripe ainda não configuradas no .env.local. Adicione STRIPE_SECRET_KEY e STRIPE_PRICE_ID_MONTHLY.'
          );
        } else {
          setErrorMessage(data.message || 'Não foi possível iniciar o checkout.');
        }
      }
    } catch (err) {
      setErrorMessage('Erro de conexão ao iniciar checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative my-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1527] via-[#111c35] to-[#1e142e] border border-amber-500/30 p-6 md:p-8 shadow-2xl">
      {/* Background glow ornaments */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Side: Offer Info */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Oferta Exclusiva de Lançamento
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3 h-3" /> Primeiros 20 Clientes
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-[var(--font-barlow-condensed)] uppercase text-white tracking-wide leading-tight mb-2">
            Ganhe <span className="text-amber-400">1 Mês Grátis</span> para Anunciar no App e Marketplace Todo Motor
          </h2>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
            Cadastre sua loja, concessionária ou frota e comece a anunciar hoje sem custo. 
            Válido exclusivamente para os 20 primeiros cadastros com renovação automática cancelável a qualquer momento.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span>Código de ativação:</span>
            <div
              onClick={handleCopyCode}
              role="button"
              tabIndex={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-amber-500/40 text-amber-300 font-mono font-bold hover:bg-black/60 transition-colors cursor-pointer"
              title="Clique para copiar"
            >
              <span>{promoCode}</span>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            {copied && <span className="text-emerald-400 text-xs animate-fade-in font-medium">Copiado!</span>}
          </div>
        </div>

        {/* Right Side: CTA Action */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          <button
            onClick={handleStartFreeTrial}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Conectando ao Stripe...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Garantir Meu 1º Mês Grátis <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {onOpenLeadModal && (
            <button
              onClick={onOpenLeadModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold uppercase tracking-wider border border-white/10 transition-colors"
            >
              Falar com Consultor Comercial
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
          ⚠️ {errorMessage}
        </div>
      )}
    </section>
  );
}

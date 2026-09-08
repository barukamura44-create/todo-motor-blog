import Link from 'next/link';
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Assinatura Confirmada — 1º Mês Grátis Todo Motor',
  description: 'Parabéns! Sua assinatura foi iniciada com sucesso na promoção de lançamento.',
};

export default function SucessoPage() {
  return (
    <main className="min-h-screen bg-[#080d1a] text-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-[#0f172a]/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10 animate-pulse">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          OFERTA DE LANÇAMENTO GARANTIDA
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-[var(--font-barlow-condensed)] uppercase tracking-wide text-white mb-3">
          Parabéns! Seu 1º Mês Grátis Está Ativado
        </h1>

        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
          Você garantiu uma das 20 vagas exclusivas de lançamento do app e marketplace <strong>Todo Motor</strong>.
          Seu acesso foi registrado com sucesso e nossa equipe editorial e comercial já está preparando a vitrine dos seus anúncios.
        </p>

        <div className="bg-[#1e293b]/70 rounded-xl p-5 border border-white/10 text-left mb-8 space-y-3">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300">
              <strong className="text-white">Sem cobrança imediata:</strong> Seu período de 30 dias grátis já está valendo. Você receberá um aviso antes de qualquer renovação.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-300">
              <strong className="text-white">Confirmação por E-mail:</strong> O comprovante e recibo oficial emitido pela Stripe foram enviados para o e-mail cadastrado.
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
          >
            Voltar ao Blog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}

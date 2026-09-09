import Link from 'next/link';
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Smartphone, MessageSquare, Mail, Download } from 'lucide-react';

export const metadata = {
  title: 'Assinatura Confirmada — 1º Mês Grátis Todo Motor',
  description: 'Parabéns! Sua assinatura foi iniciada com sucesso na promoção de lançamento.',
};

export default function SucessoPage() {
  return (
    <main className="min-h-screen bg-[#080d1a] text-white flex items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full bg-[#0f172a]/95 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-5 shadow-lg shadow-emerald-500/10 animate-pulse">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          OFERTA DE LANÇAMENTO ATIVADA
        </div>

        <h1 className="text-2xl sm:text-4xl font-black font-[var(--font-barlow-condensed)] uppercase tracking-wide text-white mb-3">
          Parabéns! Seu 1º Mês Grátis Está Garantido
        </h1>

        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
          Você é um dos <strong>20 primeiros clientes fundadores</strong> do marketplace e app <strong>Todo Motor</strong>.
          Sua conta foi criada e o período de 30 dias gratuitos já está ativo.
        </p>

        {/* Notificações WhatsApp + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-6">
          <div className="bg-[#1e293b]/80 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Aviso no WhatsApp</h2>
              <p className="text-xs text-gray-300 mt-1">
                Enviamos suas instruções de ativação e link de acesso direto no seu <strong>WhatsApp</strong>.
              </p>
            </div>
          </div>

          <div className="bg-[#1e293b]/80 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Confirmação por E-mail</h2>
              <p className="text-xs text-gray-300 mt-1">
                Recibo oficial da Stripe com valor <strong>R$ 0,00</strong> enviado para a sua caixa de entrada.
              </p>
            </div>
          </div>
        </div>

        {/* Bloco de Download do App */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-6 text-left mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="w-6 h-6 text-amber-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Baixe o App Todo Motor e Comece a Anunciar
            </h2>
          </div>
          <p className="text-xs text-gray-300 mb-4">
            Acesse o aplicativo para cadastrar seus veículos, maquinários ou embarcações e receber leads em tempo real.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/20 text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" /> Google Play (Android)
            </a>
            <a
              href="https://apple.com/app-store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/60 hover:bg-black/90 text-white border border-white/20 text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" /> App Store (iOS)
            </a>
          </div>
        </div>

        {/* Garantia */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-8">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sem taxas de cancelamento. Cancele com 1 clique a qualquer momento antes dos 30 dias.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
          >
            Acessar Notícias do Blog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}

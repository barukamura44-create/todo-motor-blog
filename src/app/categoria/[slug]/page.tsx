/**
 * Category page: /categoria/[slug]
 * Shows all published posts for a given category.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_META: Record<string, { name: string; icon: string; description: string; accentColor: string }> = {
  veiculos:            { name: 'Veículos',            icon: '🚗', accentColor: '#F5C800', description: 'Notícias sobre carros, SUVs, picapes e lançamentos do mercado automotivo.' },
  barcos:              { name: 'Barcos e Náutica',    icon: '⛵', accentColor: '#0066CC', description: 'Lanchas, veleiros, iates e embarcações regionais.' },
  aeronaves:           { name: 'Aeronaves',           icon: '✈️', accentColor: '#6B48FF', description: 'Aviação geral, pequenas aeronaves e regulações da ANAC.' },
  agricola:            { name: 'Máquinas Agrícolas',  icon: '🌾', accentColor: '#22C55E', description: 'Tratores, colheitadeiras, pulverizadores e implementos.' },
  terraplenagem:       { name: 'Terraplenagem',       icon: '🏗️', accentColor: '#F97316', description: 'Escavadeiras, motoniveladoras e máquinas de construção pesada.' },
  'transportes-pesados':{ name: 'Transportes Pesados',icon: '🚛', accentColor: '#EF4444', description: 'Caminhões, ônibus, carretas e logística de cargas.' },
  lancamentos:         { name: 'Lançamentos',         icon: '🚀', accentColor: '#EC4899', description: 'Lançamentos exclusivos de veículos, máquinas e equipamentos no Brasil.' },
  eventos:             { name: 'Eventos',             icon: '📅', accentColor: '#8B5CF6', description: 'Feiras, exposições, shows rurais e eventos do setor.' },
  jetski:              { name: 'Jet Ski',             icon: '🌊', accentColor: '#06B6D4', description: 'Motos aquáticas, esportes náuticos e competições.' },
  drones:              { name: 'Drones',              icon: '🛸', accentColor: '#10B981', description: 'Drones, VANTs, fotografia aérea e regulação ANAC.' },
  helicopteros:        { name: 'Helicópteros',        icon: '🚁', accentColor: '#6366F1', description: 'Helicópteros executivos, de resgate e serviços aéreos.' },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = CATEGORY_META[slug];
  if (!meta) return { title: 'Categoria | Todo Motor Blog' };
  return {
    title: `${meta.icon} ${meta.name} | Todo Motor Blog`,
    description: meta.description,
    openGraph: {
      type: 'website',
      title: `${meta.name} — Todo Motor Blog`,
      description: meta.description,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = CATEGORY_META[slug];

  if (!meta) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <span style={{ fontSize: 64 }}>🔍</span>
        <h1 style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 32, textTransform: 'uppercase', marginTop: 16 }}>
          Categoria não encontrada
        </h1>
        <Link href="/" style={{ color: 'var(--yellow)', marginTop: 16, display: 'inline-block' }}>
          ← Voltar para o início
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Category header */}
      <div
        className="article-header"
        style={{ borderTopColor: meta.accentColor }}
      >
        <div className="article-header-inner">
          <Link href="/" className="article-back">← Voltar para Notícias</Link>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{meta.icon}</div>
          <h1 className="article-title">{meta.name}</h1>
          <p className="article-excerpt">{meta.description}</p>
        </div>
      </div>

      {/* Posts grid — loaded from API in production */}
      <main style={{ padding: '40px 24px' }}>
        <div className="main-inner">
          <div className="empty-state">
            <span style={{ fontSize: 48 }}>{meta.icon}</span>
            <h2 style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 24, textTransform: 'uppercase' }}>
              {meta.name}
            </h2>
            <p>As notícias desta categoria aparecerão aqui após conectar ao banco de dados.</p>
            <Link href="/" className="btn-yellow" style={{ marginTop: 16 }}>
              ← Ver Todas as Notícias
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

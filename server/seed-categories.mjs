#!/usr/bin/env node
/**
 * Seed script: populates all blog categories for the Todo Motor platform.
 * Run with: node server/seed-categories.mjs
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  console.log("⚠️ DATABASE_URL não configurada no ambiente local. O script de seed será executado automaticamente quando a variável DATABASE_URL estiver configurada.");
  process.exit(0);
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const categories = [
  // Original 6 categories
  { name: 'Veículos',            slug: 'veiculos',           icon: '🚗', accentColor: '#F5C800', description: 'Notícias sobre carros, SUVs, picapes e lançamentos do mercado automotivo.' },
  { name: 'Barcos e Náutica',    slug: 'barcos',             icon: '⛵', accentColor: '#0066CC', description: 'Lanchas, veleiros, iates e embarcações regionais.' },
  { name: 'Aeronaves',           slug: 'aeronaves',          icon: '✈️', accentColor: '#6B48FF', description: 'Aviação geral, pequenas aeronaves e regulações da ANAC.' },
  { name: 'Máquinas Agrícolas',  slug: 'agricola',           icon: '🌾', accentColor: '#22C55E', description: 'Tratores, colheitadeiras, pulverizadores e equipamentos para o campo.' },
  { name: 'Terraplenagem',       slug: 'terraplenagem',      icon: '🏗️', accentColor: '#F97316', description: 'Escavadeiras, motoniveladoras e máquinas de construção pesada.' },
  { name: 'Transportes Pesados', slug: 'transportes-pesados', icon: '🚛', accentColor: '#EF4444', description: 'Caminhões, ônibus, carretas e logística de cargas.' },

  // New categories
  { name: 'Lançamentos',         slug: 'lancamentos',        icon: '🚀', accentColor: '#EC4899', description: 'Lançamentos exclusivos de veículos, máquinas e equipamentos no Brasil.' },
  { name: 'Eventos',             slug: 'eventos',            icon: '📅', accentColor: '#8B5CF6', description: 'Feiras, exposições, shows e eventos do setor automotivo e agro.' },
  { name: 'Jet Ski',             slug: 'jetski',             icon: '🌊', accentColor: '#06B6D4', description: 'Motos aquáticas, esportes náuticos e competições de Jet Ski.' },
  { name: 'Drones',              slug: 'drones',             icon: '🚁', accentColor: '#10B981', description: 'Drones, VANTs, fotografia aérea e regulação ANAC para RPAs.' },
  { name: 'Helicópteros',        slug: 'helicopteros',       icon: '🚁', accentColor: '#6366F1', description: 'Helicópteros executivos, de resgate e serviços aéreos.' },
];

console.log('Seeding categories...');

for (const cat of categories) {
  try {
    await connection.execute(
      `INSERT INTO categories (name, slug, icon, accentColor, description, createdAt) 
       VALUES (?, ?, ?, ?, ?, NOW()) 
       ON DUPLICATE KEY UPDATE icon=VALUES(icon), accentColor=VALUES(accentColor), description=VALUES(description)`,
      [cat.name, cat.slug, cat.icon, cat.accentColor, cat.description]
    );
    console.log(`  ✓ ${cat.name}`);
  } catch (err) {
    console.warn(`  ✗ ${cat.name}: ${err.message}`);
  }
}

await connection.end();
console.log('Done! All categories seeded.');

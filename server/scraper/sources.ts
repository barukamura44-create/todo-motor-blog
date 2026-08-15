/**
 * Pre-configured RSS sources organized by category.
 * Each source is mapped to a category slug and includes keywords for relevance filtering.
 */

export interface SourceConfig {
  name: string;
  url: string;
  categorySlug: string;
  type: 'rss' | 'html';
  keywords: string[];
}

export const SOURCES: SourceConfig[] = [
  // ─── VEÍCULOS / LANÇAMENTOS ───────────────────────────────────────────────
  {
    name: 'Motor1 Brasil',
    url: 'https://br.motor1.com/rss/news/all/',
    categorySlug: 'veiculos',
    type: 'rss',
    keywords: ['carro', 'picape', 'suv', 'veículo', 'lançamento', 'teste', 'motor'],
  },
  {
    name: 'Notícias Automotivas',
    url: 'https://www.noticiasautomotivas.com.br/feed/',
    categorySlug: 'lancamentos',
    type: 'rss',
    keywords: ['lançamento', 'novo', 'carro', 'picape', 'suv', 'brasil', 'preço'],
  },
  {
    name: 'Autoesporte',
    url: 'https://autoesporte.globo.com/rss/autoesporte/',
    categorySlug: 'veiculos',
    type: 'rss',
    keywords: ['carro', 'veículo', 'suv', 'picape', 'lançamento', 'elétrico'],
  },

  // ─── TRANSPORTES PESADOS ──────────────────────────────────────────────────
  {
    name: 'Transporte Moderno',
    url: 'https://www.transportemoderno.com.br/feed/',
    categorySlug: 'transportes-pesados',
    type: 'rss',
    keywords: ['caminhão', 'frota', 'logística', 'transporte', 'carga', 'semirreboque'],
  },
  {
    name: 'Motor1 Comercial/Pesados',
    url: 'https://br.motor1.com/rss/category/comerciais-leves-e-pesados/',
    categorySlug: 'transportes-pesados',
    type: 'rss',
    keywords: ['caminhão', 'van', 'furgão', 'pesados', 'scania', 'volvo', 'mercedes'],
  },

  // ─── MÁQUINAS AGRÍCOLAS ───────────────────────────────────────────────────
  {
    name: 'Canal Rural',
    url: 'https://www.canalrural.com.br/feed/',
    categorySlug: 'agricola',
    type: 'rss',
    keywords: ['máquina', 'agrícola', 'colheitadeira', 'trator', 'plantadeira', 'pulverizador', 'New Holland', 'John Deere', 'Case', 'campo', 'agro'],
  },
  {
    name: 'AgroLink',
    url: 'https://www.agrolink.com.br/rss/noticias.aspx',
    categorySlug: 'agricola',
    type: 'rss',
    keywords: ['trator', 'máquina agrícola', 'colheita', 'equipamento', 'implemento', 'agronegócio'],
  },

  // ─── TERRAPLENAGEM ────────────────────────────────────────────────────────
  {
    name: 'Máquinas e Equipamentos',
    url: 'https://www.maquinasemercado.com.br/feed/',
    categorySlug: 'terraplenagem',
    type: 'rss',
    keywords: ['escavadeira', 'retroescavadeira', 'motoniveladora', 'terraplenagem', 'compactador', 'caterpillar', 'komatsu', 'volvo CE', 'obra'],
  },
  {
    name: 'Canal Rural Infra',
    url: 'https://www.canalrural.com.br/feed/',
    categorySlug: 'terraplenagem',
    type: 'rss',
    keywords: ['máquina', 'equipamento', 'obra', 'estrutura', 'terraplenagem'],
  },

  // ─── NÁUTICA / BARCOS / JET SKI ──────────────────────────────────────────
  {
    name: 'Náutica Online',
    url: 'https://nautica.com.br/feed/',
    categorySlug: 'barcos',
    type: 'rss',
    keywords: ['lancha', 'barco', 'veleiro', 'iate', 'náutica', 'marinha', 'embarcação', 'jetski', 'moto aquática'],
  },

  // ─── AERONAVES / DRONES / HELICÓPTEROS ──────────────────────────────────
  {
    name: 'Aeroin Notícias',
    url: 'https://aeroin.net/feed/',
    categorySlug: 'aeronaves',
    type: 'rss',
    keywords: ['aeronave', 'avião', 'aviação', 'helicóptero', 'drone', 'embraer', 'boeing', 'airbus', 'piloto'],
  },
  {
    name: 'Airway Aviação',
    url: 'https://www.airway.com.br/feed/',
    categorySlug: 'helicopteros',
    type: 'rss',
    keywords: ['aviação', 'aeronave', 'airshow', 'helicóptero', 'drone', 'avião'],
  },
  {
    name: 'Aeroin Drones',
    url: 'https://aeroin.net/feed/',
    categorySlug: 'drones',
    type: 'rss',
    keywords: ['drone', 'VANT', 'UAS', 'DJI', 'tecnologia', 'aérea', 'aeronave'],
  },

  // ─── EVENTOS / LANÇAMENTOS ──────────────────────────────────────────────
  {
    name: 'Notícias Automotivas Eventos',
    url: 'https://www.noticiasautomotivas.com.br/feed/',
    categorySlug: 'eventos',
    type: 'rss',
    keywords: ['feira', 'exposição', 'salão', 'evento', 'lançamento', 'apresentação'],
  },
];

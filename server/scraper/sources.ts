/**
 * Pre-configured RSS sources organized by category.
 * Each source is mapped to a category slug and includes keywords for relevance filtering.
 *
 * HOW TO ADD SOURCES:
 *  1. Find the category slug in the categories table
 *  2. Add a new entry in the SOURCES array below
 *  3. Provide keywords to filter irrelevant items from generic feeds
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
    name: 'ANFAVEA - Notícias',
    url: 'https://anfavea.com.br/feed',
    categorySlug: 'lancamentos',
    type: 'rss',
    keywords: ['veículo', 'carro', 'automóvel', 'lançamento', 'fabricante', 'montadora'],
  },
  {
    name: 'Webmotors Notícias',
    url: 'https://www.webmotors.com.br/rss/noticias',
    categorySlug: 'veiculos',
    type: 'rss',
    keywords: ['lançamento', 'carro', 'picape', 'suv', 'caminhão', 'veículo'],
  },
  {
    name: 'Motor1 Brasil',
    url: 'https://br.motor1.com/rss/',
    categorySlug: 'lancamentos',
    type: 'rss',
    keywords: ['lançamento', 'novo', 'estreia', 'brasil'],
  },

  // ─── TRANSPORTES PESADOS ──────────────────────────────────────────────────
  {
    name: 'Fenabrave',
    url: 'https://fenabrave.org.br/feed/',
    categorySlug: 'transportes-pesados',
    type: 'rss',
    keywords: ['caminhão', 'ônibus', 'semirreboque', 'transportes', 'carga', 'frotas'],
  },
  {
    name: 'Transporte Moderno RSS',
    url: 'https://www.transportemoderno.com.br/feed/',
    categorySlug: 'transportes-pesados',
    type: 'rss',
    keywords: ['caminhão', 'frota', 'logística', 'carroceria', 'transporte'],
  },

  // ─── MÁQUINAS AGRÍCOLAS ───────────────────────────────────────────────────
  {
    name: 'Canal Rural',
    url: 'https://www.canalrural.com.br/feed/',
    categorySlug: 'agricola',
    type: 'rss',
    keywords: ['máquina', 'agrícola', 'colheitadeira', 'trator', 'plantadeira', 'pulverizador', 'New Holland', 'John Deere', 'Case'],
  },
  {
    name: 'AgroLink',
    url: 'https://www.agrolink.com.br/rss/noticias.aspx',
    categorySlug: 'agricola',
    type: 'rss',
    keywords: ['trator', 'máquina agrícola', 'colheita', 'equipamento', 'implemento'],
  },
  {
    name: 'Globo Rural',
    url: 'https://revistagloborural.globo.com/rss',
    categorySlug: 'agricola',
    type: 'rss',
    keywords: ['trator', 'colheitadeira', 'máquina', 'equipamento agrícola', 'tecnologia no campo'],
  },

  // ─── TERRAPLENAGEM ────────────────────────────────────────────────────────
  {
    name: 'Máquinas e Equipamentos',
    url: 'https://www.maquinasemercado.com.br/feed/',
    categorySlug: 'terraplenagem',
    type: 'rss',
    keywords: ['escavadeira', 'retroescavadeira', 'motoniveladora', 'terraplenagem', 'compactador', 'caterpillar', 'komatsu', 'volvo CE'],
  },

  // ─── NÁUTICA / LANCHAS ────────────────────────────────────────────────────
  {
    name: 'Náutica Online',
    url: 'https://nauticaonline.uol.com.br/feed/',
    categorySlug: 'nautica',
    type: 'rss',
    keywords: ['lancha', 'barco', 'veleiro', 'iate', 'náutica', 'marinha', 'embarcação'],
  },
  {
    name: 'Boat International (PT)',
    url: 'https://www.boatinternational.com/feed',
    categorySlug: 'nautica',
    type: 'rss',
    keywords: ['lancha', 'barco', 'iate', 'lançamento'],
  },

  // ─── JET SKI ─────────────────────────────────────────────────────────────
  {
    name: 'Moto Aquática Brasil',
    url: 'https://motoaquatica.com.br/feed/',
    categorySlug: 'jetski',
    type: 'rss',
    keywords: ['jet ski', 'moto aquática', 'kawasaki', 'sea-doo', 'yamaha waverunner', 'esporte aquático'],
  },

  // ─── AERONAVES / DRONES ───────────────────────────────────────────────────
  {
    name: 'ANAC Notícias',
    url: 'https://www.anac.gov.br/Rss',
    categorySlug: 'aeronaves',
    type: 'rss',
    keywords: ['aeronave', 'avião', 'piloto', 'aviação geral', 'homologação'],
  },
  {
    name: 'Airway',
    url: 'https://www.airway.com.br/feed/',
    categorySlug: 'aeronaves',
    type: 'rss',
    keywords: ['aviação', 'aeronave', 'airshow', 'helicóptero', 'drone', 'avião'],
  },
  {
    name: 'Mundo Drone',
    url: 'https://mundodrone.com.br/feed/',
    categorySlug: 'drones',
    type: 'rss',
    keywords: ['drone', 'VANT', 'UAS', 'DJI', 'RPAS', 'regulação', 'fotografia aérea'],
  },

  // ─── EVENTOS ─────────────────────────────────────────────────────────────
  {
    name: 'Agrishow RSS',
    url: 'https://agrishow.com.br/feed/',
    categorySlug: 'eventos',
    type: 'rss',
    keywords: ['feira', 'exposição', 'show rural', 'evento', 'agrishow', 'automec'],
  },
];

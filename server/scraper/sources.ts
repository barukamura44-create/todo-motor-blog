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
    name: 'Notícias Automotivas Veículos',
    url: 'https://www.noticiasautomotivas.com.br/feed/',
    categorySlug: 'veiculos',
    type: 'rss',
    keywords: ['carro', 'picape', 'suv', 'veículo', 'veiculo', 'teste', 'motor', 'híbrido', 'elétrico'],
  },
  {
    name: 'Notícias Automotivas Lançamentos',
    url: 'https://www.noticiasautomotivas.com.br/feed/',
    categorySlug: 'lancamentos',
    type: 'rss',
    keywords: ['lançamento', 'novo', 'nova geração', 'revelado', 'preço', 'estreia'],
  },
  {
    name: 'Autoesporte',
    url: 'https://autoesporte.globo.com/rss/autoesporte/',
    categorySlug: 'veiculos',
    type: 'rss',
    keywords: ['carro', 'veículo', 'veiculo', 'suv', 'picape', 'lançamento', 'elétrico'],
  },

  // ─── TRANSPORTES PESADOS ──────────────────────────────────────────────────
  {
    name: 'Transporte Moderno',
    url: 'https://www.transportemoderno.com.br/feed/',
    categorySlug: 'transportes-pesados',
    type: 'rss',
    keywords: ['caminhão', 'caminhao', 'frota', 'logística', 'transporte rodoviário', 'carga pesada', 'semirreboque', 'cavalo-mecânico', 'scania', 'volvo trucks', 'mercedes-benz', 'iveco', 'daf'],
  },

  // ─── MÁQUINAS AGRÍCOLAS ───────────────────────────────────────────────────
  {
    name: 'Canal Rural Máquinas',
    url: 'https://www.canalrural.com.br/feed/',
    categorySlug: 'agricola',
    type: 'rss',
    keywords: ['máquina agrícola', 'maquina agricola', 'colheitadeira', 'trator', 'plantadeira', 'pulverizador', 'New Holland', 'John Deere', 'Case IH', 'Valtra', 'Massey Ferguson', 'mecanização agrícola', 'implemento'],
  },
  {
    name: 'AgroLink',
    url: 'https://www.agrolink.com.br/rss/noticias.aspx',
    categorySlug: 'agricola',
    type: 'rss',
    keywords: ['trator', 'máquina agrícola', 'maquina agricola', 'colheitadeira', 'pulverizador', 'implemento agrícola', 'mecanização'],
  },

  // ─── TERRAPLENAGEM (Linha Amarela & Obras Pesadas) ────────────────────────
  {
    name: 'Máquinas e Equipamentos',
    url: 'https://www.maquinasemercado.com.br/feed/',
    categorySlug: 'terraplenagem',
    type: 'rss',
    keywords: ['escavadeira', 'retroescavadeira', 'motoniveladora', 'terraplenagem', 'compactador', 'pá carregadeira', 'pa carregadeira', 'caterpillar', 'komatsu', 'volvo CE', 'linha amarela', 'trator de esteira'],
  },
  {
    name: 'Canal Rural Infra & Máquinas',
    url: 'https://www.canalrural.com.br/feed/',
    categorySlug: 'terraplenagem',
    type: 'rss',
    keywords: ['máquina de terraplenagem', 'escavadeira hidráulica', 'pá carregadeira', 'motoniveladora', 'linha amarela', 'equipamento pesado de terraplenagem'],
  },

  // ─── NÁUTICA / BARCOS / JET SKI ──────────────────────────────────────────
  {
    name: 'Náutica Online Barcos',
    url: 'https://nautica.com.br/feed/',
    categorySlug: 'barcos',
    type: 'rss',
    keywords: ['lancha', 'barco', 'veleiro', 'iate', 'náutica', 'marinha', 'embarcação', 'estaleiro', 'boat show', 'marina'],
  },
  {
    name: 'Náutica Online Jet Ski',
    url: 'https://nautica.com.br/feed/',
    categorySlug: 'jetski',
    type: 'rss',
    keywords: ['jet ski', 'jetski', 'moto aquática', 'moto aquatica', 'sea-doo', 'yamaha waverunner', 'kawasaki jet ski'],
  },

  // ─── AERONAVES / DRONES / HELICÓPTEROS ──────────────────────────────────
  {
    name: 'Aeroin Notícias',
    url: 'https://aeroin.net/feed/',
    categorySlug: 'aeronaves',
    type: 'rss',
    keywords: ['aeronave', 'avião', 'aviao', 'aviação comercial', 'embraer', 'boeing', 'airbus', 'jato executivo', 'turbina', 'companhia aérea'],
  },
  {
    name: 'Airway Aviação',
    url: 'https://www.airway.com.br/feed/',
    categorySlug: 'aeronaves',
    type: 'rss',
    keywords: ['aviação', 'aeronave', 'avião', 'aviao', 'boeing', 'airbus', 'embraer', 'jato comercial', 'companhia aérea'],
  },
  {
    name: 'Aeroin Helicópteros',
    url: 'https://aeroin.net/feed/',
    categorySlug: 'helicopteros',
    type: 'rss',
    keywords: ['helicóptero', 'helicoptero', 'rotorcraft', 'asas rotativas', 'helibras', 'bell helicopter', 'sikorsky', 'leonardo helicopters', 'aeromédico'],
  },
  {
    name: 'Aeroin Drones',
    url: 'https://aeroin.net/feed/',
    categorySlug: 'drones',
    type: 'rss',
    keywords: ['drone', 'drones', 'VANT', 'UAS', 'DJI', 'multirrotor', 'eVTOL', 'aeronave não tripulada'],
  },

  // ─── EVENTOS / LANÇAMENTOS ──────────────────────────────────────────────
  {
    name: 'Notícias Automotivas Eventos',
    url: 'https://www.noticiasautomotivas.com.br/feed/',
    categorySlug: 'eventos',
    type: 'rss',
    keywords: ['feira', 'exposição', 'salão automotivo', 'boat show', 'fenatran', 'agrishow', 'evento automotivo'],
  },
];

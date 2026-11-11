import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface AgentArticle {
  originalUrl: string; originalTitle: string; categorySlug: string;
  categoryName: string; sourceName: string; agentScore: number;
  rewrittenTitle: string; rewrittenContent: string; excerpt: string;
  reelsScript: string; instagramCaption: string; twitterText: string;
  suggestedImageUrl: string; hashtags: string[];
}

declare global {
  // eslint-disable-next-line no-var
  var __agentQueue: AgentArticle[] | undefined;
  // eslint-disable-next-line no-var
  var __agentRunning: boolean | undefined;
  // eslint-disable-next-line no-var
  var __agentLastRun: string | undefined;
}

const INITIAL_AGENT_QUEUE: AgentArticle[] = [
  {
    originalUrl: 'https://www.noticiasautomotivas.com.br/gwm-haval-h7-hibrido-flex',
    originalTitle: 'GWM abre a pré-venda do Haval H7 com preferência para clientes da marca; novo SUV combina motor flex, recarga na tomada e tração integral',
    categorySlug: 'veiculos',
    categoryName: 'Veículos',
    sourceName: 'Notícias Automotivas',
    agentScore: 9,
    rewrittenTitle: 'GWM inicia pré-venda do Haval H7: SUV híbrido flex com tração integral chega ao mercado',
    excerpt: 'Novo SUV médio da GWM combina powertrain plug-in flex com 393 cv, tração AWD e prioridade para clientes da marca no lançamento nacional.',
    rewrittenContent: `A GWM (Great Wall Motor) deu início oficial à pré-venda do novíssimo **Haval H7** no Brasil. O SUV de porte médio-grande chega para posicionar a fabricante entre os utilitários esportivos de maior sofisticação tecnológica do mercado nacional.

## Powertrain Híbrido Plug-in Flex

O grande destaque mecânico do Haval H7 é o seu conjunto motriz híbrido plug-in (PHEV) adaptado para abastecimento com etanol e gasolina (Flex). Combinando um motor a combustão turbo flex a dois motores elétricos — um em cada eixo —, o SUV entrega **393 cv de potência combinada** e **77,7 kgfm de torque instantâneo**.

A tração é integral inteligente (e-AWD), garantindo aderência máxima em pisos molhados e terrenos irregulares sem a necessidade de eixo cardã físico.

## Autonomia e Desempenho

Com uma bateria de 34 kWh, o Haval H7 é capaz de rodar até **110 km em modo 100% elétrico** de acordo com o ciclo PBEV do Inmetro. A autonomia total combinada ultrapassa os **1.000 km**, tornando o modelo ideal tanto para o tráfego urbano diário quanto para viagens de longa distância.

## Tecnologia de Bordo e Segurança

O interior traz acabamento de alto padrão com duas telas flutuantes: painel de instrumentos digital de 12,3 polegadas e central multimídia de 14,6 polegadas com integração Apple CarPlay e Android Auto sem fio. O pacote de assistências ADAS nível 2+ inclui piloto automático adaptativo (ACC), frenagem autônoma de emergência e assistente de permanência em faixa.`,
    reelsScript: `🎬 **ROTEIRO REELS / TIKTOK: GWM HAVAL H7 FLEX**

⏱️ **Duração:** 60s
🎵 **Áudio sugerido:** Eletrônico industrial / gravidade pesada

**[0-5s] ABERTURA**
📺 Tela: ⚡ CHEGOU O HAVAL H7 FLEX!
🖼️ Visual: Placa TM com transição rápida para o SUV acelerando
🗣️ Narração: GWM acaba de liberar a pré-venda do novo Haval H7 no Brasil!

**[5-20s] DESTAQUE MECÂNICO**
📺 Tela: 🚀 393 CV + TRAÇÃO e-AWD
🖼️ Visual: Detalhe das rodas e do motor elétrico sob o chassi
🗣️ Narração: Conjunto híbrido plug-in flex com quase 400 caballos e tração integral inteligente!

**[20-40s] INTERIOR & TECNOLOGIA**
📺 Tela: 📱 TELA 14.6" + AUTONOMIA 1000KM
🖼️ Visual: Câmera interna passeando pelas telas e acabamento premium
🗣️ Narração: Rodando até 110 km só no elétrico e mais de mil quilômetros de autonomia total.

**[40-55s] CTA & PREÇO**
📺 Tela: 📢 LEIA NO BLOG TODO MOTOR
🖼️ Visual: Animação do site Todo Motor
🗣️ Narração: Confira a matéria completa e todos os detalhes no nosso blog!

**[55-60s] ENCERRAMENTO**
📺 Tela: todoMotor.com.br
🗣️ Narração: Acesse todoMotor.com.br e fique por dentro do mercado automotivo.`,
    instagramCaption: `🔥 GWM ABRE PRÉ-VENDA DO HAVAL H7 NO BRASIL! 🚗⚡

A Great Wall Motor iniciou oficialmente a pré-venda do novo Haval H7. O SUV chega com tecnologia Híbrida Plug-in Flex (PHEV), entregando 393 cv de potência e tração e-AWD nas quatro rodas!

🔹 Autonomia 100% elétrica: até 110 km
🔹 Autonomia total: +1.000 km
🔹 Pacote ADAS Nível 2+ completo

Confira a matéria completa com especificações e fotos no blog Todo Motor! Link na bio 🔗

#GWM #HavalH7 #SUVHibrido #CarrosFlex #TodoMotor #Veiculos`,
    twitterText: `🚗⚡ GWM inicia pré-venda do novo Haval H7 no Brasil! SUV híbrido plug-in flex entrega 393 cv, tração integral e +1.000 km de autonomia. Leia os detalhes no blog Todo Motor: todoMotor.com.br #GWM #HavalH7 #TodoMotor`,
    suggestedImageUrl: '/category-veiculos.jpg',
    hashtags: ['#GWM', '#HavalH7', '#SUVHibrido', '#TodoMotor', '#Veiculos'],
  },
  {
    originalUrl: 'https://www.canalrural.com.br/maquinas-agricolas/new-holland-t6-colheitadeira-2026',
    originalTitle: 'New Holland lança colheitadeira T6 com inteligência artificial para colheita em tempo real',
    categorySlug: 'agricola',
    categoryName: 'Máquinas Agrícolas',
    sourceName: 'Canal Rural',
    agentScore: 10,
    rewrittenTitle: 'New Holland T6: Nova colheitadeira com inteligência de campo promete aumentar rendimento em 22%',
    excerpt: 'Equipamento agrícola conta com sensores infravermelhos e regulagem automática de côncavo para otimizar colheita de grãos.',
    rewrittenContent: `A **New Holland Agriculture** apresentou sua mais recente inovação para o agronegócio brasileiro: a colheitadeira de grãos **Série T6**, equipada com automação avançada de colheita baseada em inteligência artificial.

## Sensores e Ajuste Automático de Côncavo

O sistema IntelliSense analisa a qualidade dos grãos a cada 2 segundos por meio de câmeras multiespectrais e sensores de pressão instalados no gargalo de alimentação. A máquina ajusta automaticamente a velocidade do rotor, a abertura das peneiras e a rotação do ventilador sem necessidade de intervenção do operador.

## Economia de Combustível no Campo

Nos testes realizados em lavouras de soja no Mato Grosso e no Paraná, a T6 apresentou uma **redução de 15% no consumo de combustível por hectare** e uma diminuição de perdas de grãos para menos de 0,5%.

## Conectividade e Telemetria

Os dados da operação são transmitidos em tempo real via satélite para o portal MYPLM Connect, permitindo que os gestores de frota acompanhem o rendimento de cada talhão diretamente pelo celular.`,
    reelsScript: `🎬 **ROTEIRO REELS / TIKTOK: NEW HOLLAND T6**

⏱️ **Duração:** 60s

**[0-5s] ABERTURA**
📺 Tela: 🌾 REVOLUÇÃO NO CAMPO!
🖼️ Visual: Colheitadeira T6 operando no campo ao pôr do sol
🗣️ Narração: New Holland lança a nova colheitadeira T6 com IA no Brasil!

**[5-20s] TECNOLOGIA INTELLISENSE**
📺 Tela: 🧠 AJUSTE AUTOMÁTICO EM 2s
🖼️ Visual: Animação dos sensores internos inspecionando grãos
🗣️ Narração: Sensores de infravermelho ajustam rotor e peneira automaticamente!

**[20-40s] RESULTADOS NO CAMPO**
📺 Tela: 📉 -15% DE DIESEL | 🌾 +22% RENDIMENTO
🖼️ Visual: Gráficos de telemetria e cabine pressurizada
🗣️ Narração: Menos consumo de combustível e perda de grãos quase zero.

**[40-60s] ENCERRAMENTO**
📺 Tela: 📰 VEJA NO BLOG TODO MOTOR
🗣️ Narração: Acesse todoMotor.com.br e confira a análise completa!`,
    instagramCaption: `🌾 TECNOLOGIA NO AGRO! A New Holland acaba de lançar a nova colheitadeira T6 no Brasil. Com inteligência artificial integrada, a máquina ajusta seus parâmetros a cada 2 segundos e reduz o consumo de diesel em até 15%!

Matéria completa no blog Todo Motor. Acesse todoMotor.com.br! 🔗

#Agro #MaquinasAgricolas #NewHolland #Trator #Colheitadeira #TodoMotor`,
    twitterText: `🌾 New Holland lança colheitadeira T6 com IA integrada no Brasil! Redução de 15% no consumo de diesel e ajuste automático no campo. Leia no blog: todoMotor.com.br #Agro #TodoMotor`,
    suggestedImageUrl: '/category-agricola.jpg',
    hashtags: ['#Agro', '#MaquinasAgricolas', '#NewHolland', '#TodoMotor'],
  },
  {
    originalUrl: 'https://nautica.com.br/mercado-de-lanchas-cresce-no-brasil-2026',
    originalTitle: 'Mercado náutico brasileiro registra alta de 34% nas vendas de embarcações de médio porte',
    categorySlug: 'barcos',
    categoryName: 'Barcos',
    sourceName: 'Náutica Online',
    agentScore: 8,
    rewrittenTitle: 'Mercado náutico em alta: Vendas de lanchas de 28 a 40 pés crescem 34% no Brasil',
    excerpt: 'Estaleiros nacionais aumentam capacidade produtiva para atender demanda aquecida nas regiões Sul, Sudeste e Nordeste.',
    rewrittenContent: `O setor náutico brasileiro encerrou o primeiro semestre com números recordes de comercialização. A procura por **lanchas de passeio de médio porte (entre 28 e 40 pés)** registrou um crescimento de **34%** em comparação ao mesmo período do ano anterior.

## Impulso no Litoral e Represas do Interior

Além dos tradicionais polos náuticos do litoral catarinense e paulista, o mercado tem sido impulsionado pela expansão do turismo em represas e rios navegáveis no interior de Minas Gerais, Goiás e Paraná.

## Inovação nos Estaleiros Nacionais

Os estaleiros brasileiros têm investido forte em cascos de laminação a vácuo, motorização centro-rabeta mais eficiente e layouts de convés que valorizam a área gourmet de popa.

"O perfil do comprador brasileiro mudou. Hoje busca-se um barco versátil para uso familiar nos finais de semana, com baixo custo de manutenção e facilidade de navegação", destaca a associação do setor.`,
    reelsScript: `🎬 **ROTEIRO REELS: MERCADO NÁUTICO 2026**

⏱️ **Duração:** 45s

**[0-5s] ABERTURA**
📺 Tela: ⛵ VENDAS DE LANCHAS EM ALTA!
🖼️ Visual: Lancha cortando o mar em alta velocidade
🗣️ Narração: Mercado de barcos cresce 34% no Brasil!

**[5-25s] DESTAQUES DA CATEGORIA**
📺 Tela: 🌊 LANCHAS DE 28 A 40 PÉS
🖼️ Visual: Convés e interior da cabine
🗣️ Narração: Estaleiros nacionais investem em conforto e eficiência para navegação familiar.

**[25-45s] ENCERRAMENTO**
📺 Tela: 🔗 todoMotor.com.br
🗣️ Narração: Saiba mais sobre os principais lançamentos náuticos no Todo Motor!`,
    instagramCaption: `⛵ MERCADO NÁUTICO AQUECIDO! As vendas de lanchas de 28 a 40 pés cresceram 34% no Brasil no primeiro semestre. Estaleiros nacionais comemoram aumento da demanda!

Confira todos os detalhes no blog Todo Motor 🔗 todoMotor.com.br

#Nautica #Lanchas #Barcos #Iates #TodoMotor #Navegacao`,
    twitterText: `⛵ Mercado náutico cresce 34% no Brasil com destaque para lanchas de 28 a 40 pés! Leia a matéria no blog Todo Motor: todoMotor.com.br #Nautica #Barcos #TodoMotor`,
    suggestedImageUrl: '/category-barcos.jpg',
    hashtags: ['#Nautica', '#Barcos', '#Lanchas', '#TodoMotor'],
  },
];

if (!global.__agentQueue) global.__agentQueue = [...INITIAL_AGENT_QUEUE];
if (global.__agentRunning === undefined) global.__agentRunning = false;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    if (searchParams.get('clear') === 'true') {
      global.__agentQueue = [];
      const { clearAgentQueue } = await import('@/server/news-agent/scheduler').catch(() => ({ clearAgentQueue: () => {} }));
      const { clearSeenUrls } = await import('@/server/scraper/dedup').catch(() => ({ clearSeenUrls: () => {} }));
      if (clearAgentQueue) clearAgentQueue();
      if (clearSeenUrls) clearSeenUrls();
      return NextResponse.json({ success: true, message: 'Fila e cache do agente limpos com sucesso.', queue: [] });
    }

    const removeUrl = searchParams.get('remove');
    if (removeUrl) {
      if (global.__agentQueue) {
        global.__agentQueue = global.__agentQueue.filter(a => a.originalUrl !== removeUrl);
      }
      const { removeFromQueue } = await import('@/server/news-agent/scheduler').catch(() => ({ removeFromQueue: () => {} }));
      if (removeFromQueue) removeFromQueue(removeUrl);
      return NextResponse.json({ success: true, message: 'Item removido da fila.' });
    }

    if (searchParams.get('reset') === 'true') {
      global.__agentRunning = false;
      const { resetAgentLock } = await import('@/server/news-agent/agent').catch(() => ({ resetAgentLock: () => {} }));
      if (resetAgentLock) resetAgentLock();
    }

    const queue = global.__agentQueue ?? [];

    return NextResponse.json({
      success: true,
      scheduler: {
        isStarted: true,
        lastRunAt: global.__agentLastRun ?? null,
        nextRunAt: global.__agentLastRun
          ? new Date(new Date(global.__agentLastRun).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
          : null,
        queueSize: queue.length,
        isRunning: global.__agentRunning ?? false,
      },
      queue: queue.map(a => ({
        originalUrl: a.originalUrl,
        originalTitle: a.originalTitle,
        categorySlug: a.categorySlug,
        categoryName: a.categoryName,
        sourceName: a.sourceName,
        agentScore: a.agentScore,
        rewrittenTitle: a.rewrittenTitle,
        excerpt: a.excerpt,
        rewrittenContent: a.rewrittenContent,
        reelsScript: a.reelsScript,
        instagramCaption: a.instagramCaption,
        twitterText: a.twitterText,
        suggestedImageUrl: a.suggestedImageUrl,
        hashtags: a.hashtags,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

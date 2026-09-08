# Todo Motor Blog - Funcionalidades

## Banco de Dados e Backend
- [x] Criar schema de posts com campos: id, título, conteúdo, categoria, imagem de capa, status, data de criação, data de atualização
- [x] Criar schema de categorias (Veículos, Barcos, Aeronaves, Máquinas Agrícolas, Terraplanagem, Transportes Pesados)
- [x] Implementar query helpers para CRUD de posts
- [x] Implementar query helpers para busca e filtro de posts
- [x] Implementar procedures tRPC para posts e categorias

## Frontend - Página Inicial
- [x] Criar layout responsivo da página inicial com header e footer
- [x] Implementar listagem de notícias em destaque (últimas 10 posts publicados)
- [x] Implementar filtro por categoria
- [x] Implementar busca por palavra-chave
- [x] Adicionar CTA para download do app Todo Motor
- [x] Aplicar identidade visual (cores Amarelo Motor e Preto Asfalto)

## Frontend - Página de Artigo
- [x] Criar página de leitura de artigo completo
- [x] Exibir imagem de capa, título, corpo do texto, categoria, data de publicação
- [x] Adicionar CTA de conversão ao final do artigo
- [x] Implementar navegação entre artigos

## Painel Administrativo
- [x] Criar tela de login com autenticação (via Manus OAuth)
- [x] Implementar dashboard administrativo protegido
- [x] Criar formulário de criação de posts (título, conteúdo, categoria, imagem, status)
- [x] Implementar listagem de posts no painel com opções de editar e deletar
- [x] Criar página de edição de posts
- [x] Implementar exclusão de posts com confirmação

## Sistema de IA para Geração Automática
- [ ] Criar interface para input de URL ou texto bruto de notícia
- [ ] Integrar com LLM (OpenAI/Claude) para reescrever conteúdo
- [ ] Implementar geração automática de título SEO-friendly
- [ ] Implementar geração automática de resumo
- [ ] Aplicar tom de voz do Todo Motor (direto, técnico, apaixonado)
- [ ] Exibir preview do conteúdo gerado antes de publicar

## Identidade Visual
- [x] Configurar paleta de cores (Amarelo Motor #F5C800, Preto Asfalto #0D0D0D)
- [x] Aplicar tipografia industrial moderna (Inter + Roboto Mono)
- [x] Implementar layout responsivo mobile-first
- [x] Criar componentes reutilizáveis com estilo consistente
- [x] Adicionar favicon e branding visual (SVG favicon com logo TM)

## Testes e Validação
- [x] Testar fluxo de criação e edição de posts
- [x] Testar busca e filtro de notícias
- [x] Testar responsividade em mobile e desktop
- [x] Validar categorias populadas
- [x] Escrever testes unitários para procedures de posts (13 testes passando)
- [x] Testar procedures de bySlug, update e delete com fixtures garantidas

## Sistema de IA para Geração Automática
- [x] Criar serviço de IA para reescrever conteúdo (ai-service.ts)
- [x] Adicionar procedures tRPC para generateFromUrl e generateFromText
- [x] Implementar UI no painel admin com aba de geração de IA
- [x] Integrar preview completo de conteúdo gerado (título, corpo, resumo)
- [x] Botão para usar conteúdo gerado no formulário
- [x] Suporte para geração a partir de URL ou texto bruto
- [x] Prompt de sistema com tom de voz do Todo Motor

## Geração Automática e Busca de Imagens de Destaque
- [x] Criar serviço para gerar prompts de imagem baseado no conteúdo (image-generation-service.ts)
- [x] Integrar com API de geração de imagens do Manus / DALL-E
- [x] Implementar fallback automático para busca de imagens de estoque caso a IA falhe
- [x] Criar procedure tRPC para busca manual de imagens (posts.searchCoverImage)
- [x] Adicionar botões "IA" e "Buscar" no painel de administração
- [x] Criar modal interativo de busca de imagens com miniaturas e seleção rápida
- [x] Exibir preview da imagem gerada/selecionada com indicação de fallback
- [x] Testar geração de imagens e busca em diferentes categorias (15 testes passando)

## Botões de Compartilhamento em Redes Sociais
- [x] Criar componente de compartilhamento reutilizável (ShareButtons.tsx)
- [x] Implementar compartilhamento para WhatsApp
- [x] Implementar compartilhamento para LinkedIn
- [x] Implementar compartilhamento para Twitter/X
- [x] Adicionar botões na página de artigo (PostDetail) - topo e rodapé
- [x] Adicionar botões na listagem (Home) - expandável por post
- [x] Adicionar botão "Copiar Link" para compartilhamento rápido
- [ ] Testar compartilhamento em diferentes plataformas

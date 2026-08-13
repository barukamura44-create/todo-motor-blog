# Todo Motor Blog - Protótipo Funcional

Bem-vindo ao protótipo do **Todo Motor Blog**, uma plataforma completa de notícias focada no universo de veículos pesados, máquinas agrícolas, barcos, aeronaves e equipamentos de terraplanagem.

## 🚀 Funcionalidades Implementadas

### Página Inicial
- ✅ Listagem de notícias publicadas com filtro por categoria
- ✅ Busca por palavra-chave em tempo real
- ✅ 6 categorias pré-configuradas: Veículos, Barcos, Aeronaves, Máquinas Agrícolas, Terraplanagem, Transportes Pesados
- ✅ Call-to-Action (CTA) para download do app Todo Motor
- ✅ Design responsivo mobile-first com identidade visual forte (Amarelo Motor #F5C800 e Preto Asfalto #0D0D0D)

### Página de Artigo
- ✅ Leitura completa de artigos com imagem de capa
- ✅ Exibição de categoria, data de publicação e conteúdo formatado
- ✅ CTA de conversão ao final do artigo
- ✅ Navegação de volta para a página inicial

### Painel Administrativo
- ✅ Autenticação via Manus OAuth (protegido)
- ✅ Dashboard com listagem de posts do usuário
- ✅ Criação de novos posts com formulário completo
- ✅ Edição de posts existentes
- ✅ Exclusão de posts com confirmação
- ✅ Seleção de categoria, imagem de capa e status (rascunho/publicado)

### Backend
- ✅ Banco de dados MySQL com schema de posts e categorias
- ✅ Procedures tRPC para CRUD de posts
- ✅ Procedures tRPC para busca e filtro de notícias
- ✅ Query helpers para operações de banco de dados

## 🎨 Identidade Visual

O blog segue rigorosamente a identidade visual do Todo Motor:
- **Cores Primárias**: Amarelo Motor (#F5C800) e Preto Asfalto (#0D0D0D)
- **Tipografia**: Inter (corpo de texto) e Roboto Mono (código/técnico)
- **Layout**: Responsivo mobile-first com componentes reutilizáveis
- **Tema**: Dark mode por padrão para melhor contraste

## 📋 Como Usar

### Acessar o Blog
1. Abra a URL do projeto no navegador
2. Você verá a página inicial com as notícias publicadas
3. Use os filtros de categoria ou a busca para encontrar notícias específicas
4. Clique em "Ler Mais" para abrir o artigo completo

### Acessar o Painel Administrativo
1. Clique no botão "Painel Admin" no header (se autenticado)
2. Se não estiver autenticado, será redirecionado para fazer login via Manus OAuth
3. No painel, você pode:
   - **Criar Post**: Preencha o formulário com título, conteúdo, categoria, imagem e status
   - **Editar Post**: Clique no ícone de edição e modifique os campos
   - **Deletar Post**: Clique no ícone de lixeira (com confirmação)

### Criar um Post
1. Acesse o painel administrativo
2. Preencha os campos obrigatórios:
   - **Título**: Título do artigo
   - **Conteúdo**: Corpo do texto (suporta Markdown)
   - **Categoria**: Selecione uma das 6 categorias
3. Opcionais:
   - **Imagem de Capa**: URL da imagem
   - **Resumo**: Resumo do artigo
4. Escolha o status (Rascunho ou Publicado)
5. Clique em "Criar" para salvar

## 🤖 Próximas Etapas: Integração com IA

O blog está pronto para integração com um sistema de geração automática de conteúdo via IA. Veja o arquivo `references/ai-content-generation.md` para instruções detalhadas.

### Funcionalidades Planejadas
- [ ] Interface para input de URL ou texto bruto de notícia
- [ ] Integração com LLM (OpenAI/Claude) para reescrever conteúdo
- [ ] Geração automática de título SEO-friendly
- [ ] Geração automática de resumo
- [ ] Aplicação do tom de voz do Todo Motor
- [ ] Preview do conteúdo gerado antes de publicar

## 📁 Estrutura do Projeto

```
/home/ubuntu/todo-motor-blog/
├── client/                      # Frontend React
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx        # Página inicial do blog
│   │   │   ├── PostDetail.tsx  # Página de leitura de artigo
│   │   │   └── AdminDashboard.tsx # Painel administrativo
│   │   ├── App.tsx             # Rotas da aplicação
│   │   └── index.css           # Estilos globais com cores do Todo Motor
│   └── index.html              # HTML principal
├── server/                      # Backend Express + tRPC
│   ├── db.ts                   # Query helpers
│   ├── routers.ts              # Procedures tRPC
│   └── seed-categories.mjs     # Script para popular categorias
├── drizzle/                     # Schema do banco de dados
│   └── schema.ts               # Definição de tabelas
├── references/                  # Documentação
│   ├── ai-content-generation.md # Guia de integração com IA
│   └── llm-integration.md       # Guia de integração com LLM
└── todo.md                      # Rastreamento de funcionalidades
```

## 🔧 Configuração

### Variáveis de Ambiente
As seguintes variáveis já estão configuradas automaticamente:
- `DATABASE_URL`: Conexão com o banco de dados MySQL
- `JWT_SECRET`: Chave para assinatura de sessões
- `VITE_APP_ID`: ID da aplicação Manus OAuth
- `BUILT_IN_FORGE_API_URL`: URL da API de IA
- `BUILT_IN_FORGE_API_KEY`: Chave de autenticação da API de IA

### Banco de Dados
O banco de dados foi criado automaticamente com as seguintes tabelas:
- `users`: Usuários autenticados
- `categories`: Categorias de notícias (6 pré-populadas)
- `posts`: Artigos do blog

## 🧪 Testes

Para testar o blog:

1. **Página Inicial**:
   - Verifique se as categorias aparecem nos filtros
   - Teste a busca por palavra-chave
   - Clique em um artigo para abrir a página de leitura

2. **Painel Administrativo**:
   - Faça login com sua conta Manus
   - Crie um novo post de teste
   - Edite e delete o post
   - Verifique se o post aparece na página inicial após publicar

3. **Responsividade**:
   - Teste em diferentes tamanhos de tela (mobile, tablet, desktop)
   - Verifique se o layout se adapta corretamente

## 📚 Documentação Adicional

- [Guia de Integração com IA](./references/ai-content-generation.md)
- [Guia de Integração com LLM](./references/llm-integration.md)
- [Guia de Atualizações Periódicas](./references/periodic-updates.md)

## 🎯 Próximas Melhorias

1. **Sistema de IA**: Implementar geração automática de conteúdo
2. **Scraping**: Integrar agentes para coletar notícias de fontes externas
3. **SEO**: Otimizar meta tags e URLs para melhor ranqueamento no Google
4. **Analytics**: Adicionar rastreamento de visualizações e engajamento
5. **Notificações**: Notificar usuários sobre novas notícias
6. **Comentários**: Permitir que usuários comentem em artigos
7. **Compartilhamento Social**: Integrar botões de compartilhamento em redes sociais

## 📞 Suporte

Para dúvidas ou sugestões sobre o blog, entre em contato com a equipe do Todo Motor.

---

**Desenvolvido com ❤️ para o Todo Motor**

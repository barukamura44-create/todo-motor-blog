# Integração de IA para Geração Automática de Conteúdo

Este documento descreve como integrar um sistema de geração automática de conteúdo via IA no Todo Motor Blog.

## Visão Geral

O sistema de geração automática funciona em três etapas:
1. **Input**: Administrador fornece uma URL de notícia ou texto bruto
2. **Processamento**: IA reescreve o conteúdo no tom de voz do Todo Motor
3. **Output**: Post é criado automaticamente no blog com título SEO-friendly e resumo

## Configuração

### 1. Adicionar Procedure tRPC para IA

Adicione o seguinte código em `server/routers.ts`:

```typescript
import { generateContent } from "./ai-service";

posts: router({
  // ... existing procedures ...
  
  generateFromUrl: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      categoryId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const content = await generateContent(input.url, input.categoryId);
      return content;
    }),

  generateFromText: protectedProcedure
    .input(z.object({
      text: z.string().min(100),
      categoryId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const content = await generateContent(input.text, input.categoryId);
      return content;
    }),
}),
```

### 2. Criar o Serviço de IA

Crie um novo arquivo `server/ai-service.ts`:

```typescript
import { ENV } from './_core/env';

const SYSTEM_PROMPT = `Você é um redator especializado em notícias do setor de transportes pesados, máquinas e equipamentos.
Seu tom é direto, técnico e apaixonado pelo universo motor.
Reescreva o conteúdo fornecido seguindo estas regras:
1. Mantenha a precisão técnica
2. Use linguagem clara e acessível
3. Destaque informações relevantes para lojistas e compradores
4. Inclua um resumo de 2-3 linhas no final
5. Gere um título SEO-friendly (máximo 60 caracteres)`;

export async function generateContent(input: string, categoryId: number) {
  const response = await fetch(ENV.builtInForgeApiUrl + '/llm/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ENV.builtInForgeApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Reescreva este conteúdo: ${input}` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  const generatedText = data.choices[0].message.content;

  // Parse the response to extract title, content, and excerpt
  const lines = generatedText.split('\n');
  const title = lines[0].replace(/^#+\s*/, '').trim();
  const content = lines.slice(1, -3).join('\n').trim();
  const excerpt = lines[lines.length - 1].trim();

  return {
    title,
    content,
    excerpt,
    categoryId,
  };
}
```

### 3. Adicionar UI no Painel Admin

No `client/src/pages/AdminDashboard.tsx`, adicione uma aba para geração de IA:

```tsx
const [aiInput, setAiInput] = useState('');
const [aiMode, setAiMode] = useState<'url' | 'text'>('url');

const aiMutation = trpc.posts.generateFromUrl.useMutation({
  onSuccess: (data) => {
    setFormData({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      categoryId: data.categoryId.toString(),
      coverImage: '',
      status: 'draft',
    });
    toast.success('Conteúdo gerado com sucesso!');
    setAiInput('');
  },
});

// UI para input de IA
<Dialog>
  <DialogTrigger asChild>
    <Button className="bg-accent text-accent-foreground">
      <Sparkles className="mr-2 h-4 w-4" />
      Gerar com IA
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Gerar Conteúdo com IA</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={aiMode === 'url' ? 'default' : 'outline'}
          onClick={() => setAiMode('url')}
        >
          URL
        </Button>
        <Button
          variant={aiMode === 'text' ? 'default' : 'outline'}
          onClick={() => setAiMode('text')}
        >
          Texto
        </Button>
      </div>
      <Textarea
        placeholder={aiMode === 'url' ? 'Cole a URL da notícia' : 'Cole o texto da notícia'}
        value={aiInput}
        onChange={(e) => setAiInput(e.target.value)}
        rows={6}
      />
      <Button
        onClick={() => {
          if (aiMode === 'url') {
            aiMutation.mutate({ url: aiInput, categoryId: parseInt(formData.categoryId) });
          }
        }}
        disabled={!aiInput || !formData.categoryId}
      >
        Gerar Conteúdo
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

## Variáveis de Ambiente

As seguintes variáveis já estão disponíveis:
- `BUILT_IN_FORGE_API_URL`: URL da API de IA
- `BUILT_IN_FORGE_API_KEY`: Chave de autenticação

## Próximos Passos

1. Implementar scraping automático de fontes de notícias
2. Agendar execução periódica de geração de posts
3. Adicionar validação e revisão manual antes de publicar
4. Implementar cache de conteúdo gerado
5. Adicionar métricas de engajamento para otimizar prompts

## Referências

- [LLM Integration Guide](./llm-integration.md)
- [Periodic Updates Guide](./periodic-updates.md)

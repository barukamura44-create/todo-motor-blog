import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Edit2, Trash2, LogOut, Sparkles, Copy, Image as ImageIcon, Search, Check, RefreshCw } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [aiMode, setAiMode] = useState<"url" | "text">("url");
  const [aiInput, setAiInput] = useState("");
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [isSearchImageOpen, setIsSearchImageOpen] = useState(false);
  const [searchQueryText, setSearchQueryText] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    categoryId: "",
    coverImage: "",
    status: "draft" as "draft" | "published",
  });

  // Fetch user posts
  const { data: userPosts = [], isLoading: postsLoading, refetch: refetchPosts } = trpc.posts.myPosts.useQuery({
    limit: 50,
    offset: 0,
  });

  // Fetch categories
  const { data: categories = [] } = trpc.categories.list.useQuery();

  // Mutations
  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Post criado com sucesso!");
      setFormData({ title: "", content: "", excerpt: "", categoryId: "", coverImage: "", status: "draft" });
      setIsCreating(false);
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar post");
    },
  });

  const updateMutation = trpc.posts.update.useMutation({
    onSuccess: () => {
      toast.success("Post atualizado com sucesso!");
      setEditingId(null);
      setFormData({ title: "", content: "", excerpt: "", categoryId: "", coverImage: "", status: "draft" });
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar post");
    },
  });

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deletado com sucesso!");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao deletar post");
    },
  });

  const generateFromUrlMutation = trpc.posts.generateFromUrl.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data) {
        setAiPreview(result.data);
        toast.success("Conteúdo gerado com sucesso!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar conteúdo");
    },
  });

  const generateFromTextMutation = trpc.posts.generateFromText.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data) {
        setAiPreview(result.data);
        toast.success("Conteúdo gerado com sucesso!");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar conteúdo");
    },
  });

  const generateImageMutation = trpc.posts.generateCoverImage.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data) {
        setGeneratedImage(result.data);
        setFormData((prev) => ({ ...prev, coverImage: result.data.url }));
        if (result.data.fallbackUsed) {
          toast.info(result.data.message || "Geração IA indisponível. Imagem HD de estoque selecionada automaticamente!");
        } else {
          toast.success("Imagem de capa gerada com IA!");
        }
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao obter imagem de capa");
    },
  });

  const { data: stockImageSearchResponse, isLoading: stockLoading, refetch: refetchStockImages } = trpc.posts.searchCoverImage.useQuery(
    {
      query: searchQueryText || formData.title || "veiculos",
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
    },
    {
      enabled: isSearchImageOpen,
    }
  );
  const stockImages = stockImageSearchResponse?.data || [];

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      navigate("/");
    },
  });

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-foreground mb-4">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-6">
            Você precisa estar autenticado para acessar o painel administrativo.
          </p>
          <Link href="/">
            <Button className="w-full bg-accent text-accent-foreground">
              Voltar ao Blog
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!formData.title || !formData.content || !formData.categoryId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        categoryId: parseInt(formData.categoryId),
        coverImage: formData.coverImage,
        status: formData.status,
      });
    } else {
      createMutation.mutate({
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        categoryId: parseInt(formData.categoryId),
        coverImage: formData.coverImage,
        status: formData.status,
      });
    }
  };

  const handleEdit = (post: any) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      categoryId: post.categoryId.toString(),
      coverImage: post.coverImage || "",
      status: post.status,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja deletar este post?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleGenerateAI = () => {
    if (!aiInput || !formData.categoryId) {
      toast.error("Preencha a URL/texto e selecione uma categoria");
      return;
    }

    if (aiMode === "url") {
      generateFromUrlMutation.mutate({
        url: aiInput,
        categoryId: parseInt(formData.categoryId),
      });
    } else {
      generateFromTextMutation.mutate({
        text: aiInput,
        categoryId: parseInt(formData.categoryId),
      });
    }
  };

  const handleUseAIContent = () => {
    if (aiPreview) {
      setFormData({
        ...formData,
        title: aiPreview.title,
        content: aiPreview.content,
        excerpt: aiPreview.excerpt,
      });
      setAiPreview(null);
      setAiInput("");
      toast.success("Conteúdo carregado! Revise e publique.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Painel Administrativo</h1>
            <p className="text-sm text-muted-foreground">Bem-vindo, {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                Ver Blog
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manual">Manual</TabsTrigger>
                <TabsTrigger value="ai">IA</TabsTrigger>
              </TabsList>

              {/* Manual Tab */}
              <TabsContent value="manual">
                <Card className="p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4">
                    {editingId ? "Editar Post" : "Novo Post"}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Título *</label>
                      <Input
                        placeholder="Título do post"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Categoria *</label>
                      <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Imagem de Capa</label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          placeholder="URL da imagem"
                          value={formData.coverImage}
                          onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        />
                        <Button
                          type="button"
                          onClick={() => {
                            if (!formData.title || !formData.categoryId) {
                              toast.error("Preencha título e categoria primeiro");
                              return;
                            }
                            generateImageMutation.mutate({
                              title: formData.title,
                              content: formData.content || formData.title,
                              categoryId: parseInt(formData.categoryId),
                            });
                          }}
                          disabled={generateImageMutation.isPending || !formData.title || !formData.categoryId}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 gap-1"
                          title="Gerar com IA (ou fallback para busca de estoque)"
                        >
                          {generateImageMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                              <span className="hidden sm:inline text-xs">IA</span>
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setSearchQueryText(formData.title || "");
                            setIsSearchImageOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 gap-1"
                          title="Buscar imagem de estoque por palavra-chave"
                        >
                          <Search className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline text-xs">Buscar</span>
                        </Button>
                      </div>
                      {formData.coverImage && (
                        <div className="mt-2 p-2 bg-accent/10 border border-accent/20 rounded">
                          <img src={formData.coverImage} alt="Preview" className="w-full h-32 object-cover rounded" />
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[11px] text-muted-foreground truncate">
                              {generatedImage?.source === 'ai' ? '✨ Gerada por IA' : generatedImage?.source === 'stock' ? '🖼️ Imagem de Estoque' : '🔗 URL Externa'}
                            </p>
                            {generatedImage?.fallbackUsed && (
                              <Badge variant="outline" className="text-[10px] py-0 border-amber-500/40 text-amber-600 dark:text-amber-400">
                                Fallback Ativado
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Resumo</label>
                      <Textarea
                        placeholder="Resumo do post (opcional)"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground">Status</label>
                      <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="published">Publicado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="flex-1 bg-accent text-accent-foreground"
                      >
                        {createMutation.isPending || updateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : editingId ? (
                          "Atualizar"
                        ) : (
                          "Criar"
                        )}
                      </Button>
                      {editingId && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingId(null);
                            setFormData({ title: "", content: "", excerpt: "", categoryId: "", coverImage: "", status: "draft" });
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* AI Tab */}
              <TabsContent value="ai">
                <Card className="p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-accent" />
                    Gerar com IA
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Categoria *</label>
                      <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <div className="flex gap-2 mb-2">
                        <Button
                          variant={aiMode === "url" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAiMode("url")}
                          className={aiMode === "url" ? "bg-accent text-accent-foreground" : ""}
                        >
                          URL
                        </Button>
                        <Button
                          variant={aiMode === "text" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAiMode("text")}
                          className={aiMode === "text" ? "bg-accent text-accent-foreground" : ""}
                        >
                          Texto
                        </Button>
                      </div>
                      <label className="text-sm font-medium text-foreground block mb-2">
                        {aiMode === "url" ? "Cole a URL da notícia" : "Cole o texto da notícia"}
                      </label>
                      <Textarea
                        placeholder={aiMode === "url" ? "https://exemplo.com/noticia" : "Cole o texto bruto da notícia aqui..."}
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        className="mt-1"
                        rows={4}
                      />
                    </div>

                    <Button
                      onClick={handleGenerateAI}
                      disabled={generateFromUrlMutation.isPending || generateFromTextMutation.isPending || !aiInput || !formData.categoryId}
                      className="w-full bg-accent text-accent-foreground"
                    >
                      {generateFromUrlMutation.isPending || generateFromTextMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Gerar Conteúdo
                        </>
                      )}
                    </Button>

                    {aiPreview && (
                      <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg max-h-96 overflow-y-auto">
                        <h3 className="font-semibold text-foreground mb-3">Preview do Conteúdo Gerado</h3>
                        <div className="space-y-3 mb-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs font-medium">Título:</p>
                            <p className="text-foreground font-semibold">{aiPreview.title}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs font-medium">Conteúdo:</p>
                            <div className="text-foreground text-xs leading-relaxed bg-background/50 p-2 rounded border border-border max-h-32 overflow-y-auto">
                              {aiPreview.content.substring(0, 500)}...
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs font-medium">Resumo:</p>
                            <p className="text-foreground text-xs">{aiPreview.excerpt}</p>
                          </div>
                        </div>
                        <Button
                          onClick={handleUseAIContent}
                          className="w-full bg-accent text-accent-foreground"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Usar este Conteúdo
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <label className="text-sm font-medium text-foreground block mb-2">Conteúdo *</label>
              <Textarea
                placeholder="Conteúdo do post (Markdown suportado)"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-96 font-mono text-sm"
              />
            </Card>

            {/* Posts List */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Meus Posts</h2>
              {postsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : userPosts.length === 0 ? (
                <p className="text-muted-foreground">Nenhum post criado ainda.</p>
              ) : (
                <div className="space-y-3">
                  {userPosts.map((post) => {
                    const category = categories.find((c) => c.id === post.categoryId);
                    return (
                      <div key={post.id} className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/5">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{post.title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {category?.name}
                            </Badge>
                            <Badge variant={post.status === "published" ? "default" : "secondary"} className="text-xs">
                              {post.status === "published" ? "Publicado" : "Rascunho"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.updatedAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(post)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Busca de Imagens de Estoque */}
      <Dialog open={isSearchImageOpen} onOpenChange={setIsSearchImageOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Search className="h-5 w-5 text-accent" />
              Buscar Imagens para Capa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex gap-2">
              <Input
                placeholder="Palavra-chave (ex: caminhão Scania, trator, escavadeira...)"
                value={searchQueryText}
                onChange={(e) => setSearchQueryText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    refetchStockImages();
                  }
                }}
              />
              <Button onClick={() => refetchStockImages()} disabled={stockLoading} className="bg-accent text-accent-foreground">
                {stockLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
              </Button>
            </div>

            {stockLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : stockImages.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Nenhuma imagem encontrada para o termo pesquisado.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
                {stockImages.map((img: any) => (
                  <div
                    key={img.id}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, coverImage: img.url }));
                      setGeneratedImage({
                        url: img.url,
                        prompt: img.title,
                        source: 'stock',
                        fallbackUsed: false,
                      });
                      setIsSearchImageOpen(false);
                      toast.success("Imagem de capa selecionada!");
                    }}
                    className="group relative cursor-pointer border border-border rounded-lg overflow-hidden hover:border-accent hover:shadow-md transition-all bg-card"
                  >
                    <img src={img.thumbnailUrl || img.url} alt={img.title} className="w-full h-28 object-cover group-hover:scale-105 transition-transform" />
                    <div className="p-1.5 text-[11px] truncate font-medium text-foreground bg-background/90">
                      {img.title}
                    </div>
                    <div className="absolute inset-0 bg-accent/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                      <Badge className="bg-accent text-accent-foreground shadow">Selecionar</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


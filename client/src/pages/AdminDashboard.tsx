import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Sparkles,
  Copy,
  Image as ImageIcon,
  Search,
  Check,
  RefreshCw,
  LayoutDashboard,
  Newspaper,
  PenTool,
  Bot,
  Users,
  Rss,
  Download,
  ExternalLink,
  MessageSquare,
  Phone,
  Mail,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Video,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

const CATEGORY_SLUG_TO_ID: Record<string, number> = {
  veiculos: 1, barcos: 2, aeronaves: 3, agricola: 4, terraplenagem: 5,
  'transportes-pesados': 6, lancamentos: 7, eventos: 8, jetski: 9, drones: 10, helicopteros: 11,
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "editor" | "agent" | "leads" | "sources">("overview");

  // Post Editor State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    categoryId: "",
    coverImage: "",
    status: "draft" as "draft" | "published",
  });

  // AI & Image State
  const [aiMode, setAiMode] = useState<"url" | "text">("url");
  const [aiInput, setAiInput] = useState("");
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [generatedImage, setGeneratedImage] = useState<any>(null);
  const [isSearchImageOpen, setIsSearchImageOpen] = useState(false);
  const [searchQueryText, setSearchQueryText] = useState("");
  const [selectedStockImage, setSelectedStockImage] = useState<string | null>(null);

  // Filter States
  const [postSearchFilter, setPostSearchFilter] = useState("");
  const [postStatusFilter, setPostStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [postCategoryFilter, setPostCategoryFilter] = useState<string>("all");
  const [leadSegmentFilter, setLeadSegmentFilter] = useState<string>("all");
  const [expandedReelsId, setExpandedReelsId] = useState<number | null>(null);

  // New RSS Source State
  const [newSource, setNewSource] = useState({
    name: "",
    url: "",
    categoryId: "1",
    keywords: "",
  });

  // ─── tRPC Queries ────────────────────────────────────────────────────────────
  const { data: userPosts = [], isLoading: postsLoading, refetch: refetchPosts } = trpc.posts.myPosts.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: categories = [] } = trpc.categories.list.useQuery();

  const { data: agentStatus, refetch: refetchAgentStatus } = trpc.agent.status.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const { data: agentQueue = [], refetch: refetchAgentQueue } = trpc.agent.queue.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const { data: leads = [], isLoading: leadsLoading, refetch: refetchLeads } = trpc.leads.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const { data: sources = [], isLoading: sourcesLoading, refetch: refetchSources } = trpc.scraper.getSources.useQuery();

  const { data: pendingItems = [], refetch: refetchPendingItems } = trpc.scraper.getPendingItems.useQuery({
    limit: 50,
  });

  // ─── Mutations ───────────────────────────────────────────────────────────────
  const runAgentNowMutation = trpc.agent.runNow.useMutation({
    onSuccess: () => {
      toast.success("Ciclo do robô disparado com sucesso! Notícias geradas.");
      refetchAgentStatus();
      refetchAgentQueue();
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao executar robô agente");
    },
  });

  const createMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Matéria criada e publicada no blog com sucesso!");
      resetForm();
      setActiveTab("posts");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar matéria");
    },
  });

  const directPublishAgentMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Publicação autorizada! A matéria do robô foi publicada e já está disponível no feed de notícias.");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao autorizar publicação");
    },
  });

  const publishMutation = trpc.posts.update.useMutation({
    onSuccess: (_, variables) => {
      if (variables.status === "published") {
        toast.success("Publicação autorizada! A matéria já está visível no feed de notícias do blog.");
      } else {
        toast.info("Matéria alterada para rascunho.");
      }
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const updateMutation = trpc.posts.update.useMutation({
    onSuccess: () => {
      toast.success("Matéria atualizada com sucesso!");
      resetForm();
      setActiveTab("posts");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar matéria");
    },
  });

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("Matéria excluída!");
      refetchPosts();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir matéria");
    },
  });

  const generateFromUrlMutation = trpc.posts.generateFromUrl.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data) {
        setAiPreview(result.data);
        toast.success("Conteúdo gerado da URL com sucesso!");
      } else {
        toast.error((result as any).error || "Falha ao gerar conteúdo");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar da URL");
    },
  });

  const generateFromTextMutation = trpc.posts.generateFromText.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data) {
        setAiPreview(result.data);
        toast.success("Conteúdo gerado do texto com sucesso!");
      } else {
        toast.error((result as any).error || "Falha ao gerar conteúdo");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar do texto");
    },
  });

  const generateImageMutation = trpc.posts.generateCoverImage.useMutation({
    onSuccess: (result) => {
      if (result.success && result.data?.url) {
        setGeneratedImage(result.data);
        setFormData((prev) => ({ ...prev, coverImage: result.data.url }));
        toast.success(
          result.data.fallbackUsed
            ? "Imagem de estoque selecionada automaticamente (fallback)!"
            : "Imagem de capa gerada com sucesso pela IA!"
        );
      } else {
        toast.error((result as any).error || "Erro ao gerar imagem");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao gerar imagem de capa");
    },
  });

  const { data: stockImageSearchResponse, isLoading: stockLoading } = trpc.posts.searchCoverImage.useQuery(
    {
      query: searchQueryText || formData.title || "veiculos",
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
    },
    {
      enabled: isSearchImageOpen,
    }
  );
  const stockImages = stockImageSearchResponse?.data || [];

  const addSourceMutation = trpc.scraper.addSource.useMutation({
    onSuccess: () => {
      toast.success("Fonte RSS cadastrada com sucesso!");
      setNewSource({ name: "", url: "", categoryId: "1", keywords: "" });
      refetchSources();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar fonte");
    },
  });

  const reviewItemMutation = trpc.scraper.reviewItem.useMutation({
    onSuccess: () => {
      toast.success("Item de scraping atualizado!");
      refetchPendingItems();
      refetchPosts();
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      navigate("/");
    },
  });

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function resetForm() {
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      categoryId: "",
      coverImage: "",
      status: "draft",
    });
    setAiPreview(null);
    setGeneratedImage(null);
  }

  function handleStartNewPost() {
    resetForm();
    setActiveTab("editor");
  }

  function handleEditPost(post: any) {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      categoryId: post.categoryId.toString(),
      coverImage: post.coverImage || "",
      status: post.status,
    });
    setActiveTab("editor");
    toast.info(`Editando: ${post.title}`);
  }

  function handleDeletePost(id: number, title: string) {
    if (confirm(`Tem certeza que deseja excluir a matéria:\n"${title}"?`)) {
      deleteMutation.mutate({ id });
    }
  }

  function handleQuickToggleStatus(post: any) {
    const newStatus = post.status === "published" ? "draft" : "published";
    publishMutation.mutate({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      categoryId: post.categoryId,
      coverImage: post.coverImage,
      status: newStatus,
    });
  }

  function handleSubmitPost() {
    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      toast.error("Preencha título, conteúdo e selecione a categoria!");
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
  }

  function handleGenerateAI() {
    if (!aiInput.trim()) {
      toast.error("Informe a URL ou o texto bruto primeiro!");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Selecione uma categoria primeiro!");
      return;
    }

    if (aiMode === "url") {
      generateFromUrlMutation.mutate({ url: aiInput, categoryId: parseInt(formData.categoryId) });
    } else {
      generateFromTextMutation.mutate({ text: aiInput, categoryId: parseInt(formData.categoryId) });
    }
  }

  function handleUseAIContent() {
    if (!aiPreview) return;
    setFormData((prev) => ({
      ...prev,
      title: aiPreview.title,
      content: aiPreview.content,
      excerpt: aiPreview.excerpt,
    }));
    toast.success("Conteúdo da IA carregado no formulário!");
    setActiveTab("editor");
  }

  function handleExportLeadsCsv() {
    if (leads.length === 0) {
      toast.info("Nenhum lead para exportar no momento.");
      return;
    }
    const header = "ID,Nome,Telefone,Email,Segmento,Categoria,Mensagem,Origem,Data\n";
    const rows = leads.map((l: any) =>
      [
        l.id,
        `"${(l.name || "").replace(/"/g, '""')}"`,
        l.phone || "",
        l.email || "",
        l.segment || "",
        l.categoryInterest || "",
        `"${(l.message || "").replace(/"/g, '""')}"`,
        l.source || "",
        l.createdAt ? new Date(l.createdAt).toISOString() : "",
      ].join(",")
    );
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-todomotor-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Planilha de leads baixada com sucesso!");
  }

  function handleAddSourceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newSource.name.trim() || !newSource.url.trim()) {
      toast.error("Preencha nome e URL do feed RSS!");
      return;
    }
    addSourceMutation.mutate({
      name: newSource.name.trim(),
      url: newSource.url.trim(),
      categoryId: parseInt(newSource.categoryId),
      type: "rss",
      keywords: newSource.keywords.trim(),
    });
  }

  // Filtered lists
  const filteredPosts = userPosts.filter((post: any) => {
    const matchesSearch =
      postSearchFilter === "" ||
      post.title.toLowerCase().includes(postSearchFilter.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(postSearchFilter.toLowerCase()));
    const matchesStatus = postStatusFilter === "all" || post.status === postStatusFilter;
    const matchesCategory = postCategoryFilter === "all" || post.categoryId.toString() === postCategoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredLeads = leads.filter((lead: any) => {
    if (leadSegmentFilter === "all") return true;
    return lead.segment === leadSegmentFilter;
  });

  const publishedCount = userPosts.filter((p: any) => p.status === "published").length;
  const draftCount = userPosts.filter((p: any) => p.status === "draft").length;
  const categoryMap = new Map(categories.map((c: any) => [c.id, c.name]));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* ─── Top Admin Header ─────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded bg-accent text-accent-foreground font-black flex items-center justify-center text-sm shadow">
                TM
              </div>
              <span className="font-extrabold tracking-tight text-lg text-foreground group-hover:text-accent transition">
                TODO <span className="text-accent">MOTOR</span>
              </span>
            </Link>
            <Badge variant="outline" className="border-accent/40 text-accent bg-accent/10 text-xs px-2.5 py-0.5 font-bold">
              PAINEL ADMIN
            </Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full border border-border">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{user?.name || "Administrador Todo Motor"}</span>
            </div>

            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ver Site Público</span>
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              className="text-xs gap-1.5 border-border hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Primary Navigation Bar ───────────────────────────────────────────── */}
      <nav className="border-b border-border bg-card/40 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-2">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "bg-accent text-accent-foreground font-bold shadow text-xs gap-2" : "text-xs gap-2 text-muted-foreground"}
          >
            <LayoutDashboard className="h-4 w-4" />
            Visão Geral
          </Button>

          <Button
            variant={activeTab === "posts" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("posts")}
            className={activeTab === "posts" ? "bg-accent text-accent-foreground font-bold shadow text-xs gap-2" : "text-xs gap-2 text-muted-foreground"}
          >
            <Newspaper className="h-4 w-4" />
            Notícias ({userPosts.length})
          </Button>

          <Button
            variant={activeTab === "editor" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("editor")}
            className={activeTab === "editor" ? "bg-accent text-accent-foreground font-bold shadow text-xs gap-2" : "text-xs gap-2 text-muted-foreground"}
          >
            <PenTool className="h-4 w-4" />
            {editingId ? `Editando #${editingId}` : "Editor de Matéria"}
          </Button>

          <Button
            variant={activeTab === "agent" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("agent")}
            className={activeTab === "agent" ? "bg-accent text-accent-foreground font-bold shadow text-xs gap-2" : "text-xs gap-2 text-muted-foreground"}
          >
            <Bot className="h-4 w-4 text-amber-500 animate-pulse" />
            Robô Agente IA
            {agentQueue.length > 0 && (
              <Badge className="bg-amber-500 text-black text-[10px] px-1.5 py-0 h-4 ml-1">
                {agentQueue.length}
              </Badge>
            )}
          </Button>

          <Button
            variant={activeTab === "leads" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("leads")}
            className={activeTab === "leads" ? "bg-accent text-accent-foreground font-bold shadow text-xs gap-2" : "text-xs gap-2 text-muted-foreground"}
          >
            <Users className="h-4 w-4" />
            Leads & Anunciantes ({leads.length})
          </Button>

          <Button
            variant={activeTab === "sources" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("sources")}
            className={activeTab === "sources" ? "bg-accent text-accent-foreground font-bold shadow text-xs gap-2" : "text-xs gap-2 text-muted-foreground"}
          >
            <Rss className="h-4 w-4" />
            Fontes RSS ({sources.length})
          </Button>
        </div>
      </nav>

      {/* ─── Main Content Body ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto w-full p-4 lg:p-8 flex-1 space-y-6">

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 1: VISÃO GERAL (OVERVIEW)
        ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 border-border/60 bg-card/60 hover:border-accent/40 transition">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1">
                  <span>Total de Matérias</span>
                  <Newspaper className="h-4 w-4 text-accent" />
                </div>
                <div className="text-2xl font-black text-foreground">{userPosts.length}</div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
                  <span className="text-emerald-400 font-semibold">{publishedCount} publ.</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">{draftCount} rascunhos</span>
                </div>
              </Card>

              <Card className="p-4 border-border/60 bg-card/60 hover:border-accent/40 transition">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1">
                  <span>Leads Capturados</span>
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-foreground">{leads.length}</div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                  <span className="text-blue-400 font-semibold">Anunciantes & Lojas</span>
                </div>
              </Card>

              <Card className="p-4 border-border/60 bg-card/60 hover:border-accent/40 transition">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1">
                  <span>Robô de Notícias</span>
                  <Bot className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-base font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Ativo & Agendado
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 truncate">
                  {agentStatus?.nextRunAt ? `Próxima: ${new Date(agentStatus.nextRunAt).toLocaleDateString("pt-BR")}` : "A cada 5 dias às 08h"}
                </p>
              </Card>

              <Card className="p-4 border-border/60 bg-card/60 hover:border-accent/40 transition">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-1">
                  <span>Fontes RSS Monitoradas</span>
                  <Rss className="h-4 w-4 text-orange-400" />
                </div>
                <div className="text-2xl font-black text-foreground">{sources.length}</div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Veículos, Agro, Náutica, Máquinas
                </p>
              </Card>
            </div>

            {/* Quick Actions Bar */}
            <Card className="p-4 bg-gradient-to-r from-accent/10 via-card to-card border-accent/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-accent text-accent-foreground font-black">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Ações Rápidas do Administrador</h3>
                  <p className="text-xs text-muted-foreground">Crie matérias, dispare o robô inteligente ou baixe contatos de anunciantes.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button onClick={handleStartNewPost} className="bg-accent text-accent-foreground font-bold text-xs gap-1.5 shadow">
                  <Plus className="h-4 w-4" />
                  Nova Matéria
                </Button>
                <Button
                  onClick={() => runAgentNowMutation.mutate()}
                  disabled={runAgentNowMutation.isPending}
                  variant="outline"
                  className="text-xs font-semibold gap-1.5 border-accent/40 hover:bg-accent/10"
                >
                  {runAgentNowMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Disparar Robô
                </Button>
                <Button onClick={handleExportLeadsCsv} variant="outline" className="text-xs font-semibold gap-1.5 border-border">
                  <Download className="h-3.5 w-3.5" />
                  Exportar Leads (CSV)
                </Button>
              </div>
            </Card>

            {/* Split: Recent Posts and Recent Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Posts Card */}
              <Card className="p-5 border-border/80">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-accent" />
                    <h3 className="font-bold text-sm text-foreground">Últimas Matérias no Blog</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("posts")} className="text-xs text-accent">
                    Ver todas →
                  </Button>
                </div>

                <div className="space-y-3">
                  {userPosts.slice(0, 5).map((post: any) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-lg border border-border/60 bg-background/50 hover:bg-accent/5 flex items-center justify-between gap-3 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-xs text-foreground truncate">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                          <span className="text-accent font-medium">{categoryMap.get(post.categoryId) || "Veículos"}</span>
                          <span>•</span>
                          <span className={post.status === "published" ? "text-emerald-400" : "text-amber-400"}>
                            {post.status === "published" ? "Publicado" : "Rascunho"}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)} className="h-7 w-7 p-0">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Leads Card */}
              <Card className="p-5 border-border/80">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <h3 className="font-bold text-sm text-foreground">Últimos Leads de Anunciantes</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("leads")} className="text-xs text-blue-400">
                    Ver todos ({leads.length}) →
                  </Button>
                </div>

                {leads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
                    Nenhum lead recebido ainda. Os formulários de anúncio no blog alimentarão esta lista.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leads.slice(0, 5).map((lead: any) => (
                      <div
                        key={lead.id}
                        className="p-3 rounded-lg border border-border/60 bg-background/50 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground truncate">{lead.name}</span>
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 uppercase font-mono">
                              {lead.segment}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {lead.message || "Interessado em anunciar na plataforma"}
                          </p>
                        </div>
                        {lead.phone && (
                          <a
                            href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded hover:bg-emerald-500/20"
                            title="Conversar no WhatsApp"
                          >
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 2: GERENCIADOR DE NOTÍCIAS (POSTS)
        ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar matéria por título..."
                  value={postSearchFilter}
                  onChange={(e) => setPostSearchFilter(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Select value={postStatusFilter} onValueChange={(v: any) => setPostStatusFilter(v)}>
                  <SelectTrigger className="h-9 text-xs w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="published">Publicados</SelectItem>
                    <SelectItem value="draft">Rascunhos</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={postCategoryFilter} onValueChange={setPostCategoryFilter}>
                  <SelectTrigger className="h-9 text-xs w-36">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={handleStartNewPost} className="bg-accent text-accent-foreground font-bold text-xs h-9 gap-1.5 shadow">
                  <Plus className="h-4 w-4" />
                  Nova Matéria
                </Button>
              </div>
            </div>

            {/* Posts Table */}
            <Card className="p-0 overflow-hidden border-border">
              {postsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">Nenhuma matéria encontrada com esses filtros.</p>
                  <Button onClick={handleStartNewPost} variant="link" className="text-accent text-xs mt-1">
                    + Criar primeira matéria agora
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Capa</th>
                        <th className="py-3 px-4">Título & Resumo</th>
                        <th className="py-3 px-4">Categoria</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Data</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredPosts.map((post: any) => (
                        <tr key={post.id} className="hover:bg-accent/5 transition">
                          <td className="py-3 px-4 w-16">
                            {post.coverImage ? (
                              <img src={post.coverImage} alt="" className="w-14 h-10 object-cover rounded shadow-sm border border-border" />
                            ) : (
                              <div className="w-14 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 max-w-md">
                            <h4 className="font-bold text-foreground text-sm line-clamp-1">{post.title}</h4>
                            <p className="text-muted-foreground text-xs line-clamp-1 mt-0.5">{post.excerpt || "Sem resumo definido."}</p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-[11px] font-semibold border-accent/30 text-accent">
                              {categoryMap.get(post.categoryId) || "Veículos"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleQuickToggleStatus(post)}
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition ${
                                post.status === "published"
                                  ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                              }`}
                              title="Clique para alternar Publicado / Rascunho"
                            >
                              {post.status === "published" ? "● Publicado" : "○ Rascunho"}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString("pt-BR") : "—"}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditPost(post)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-accent"
                              title="Editar"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id, post.title)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                              title="Excluir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 3: EDITOR DE MATÉRIA (EDITOR)
        ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "editor" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div>
                <h2 className="text-xl font-black text-foreground">
                  {editingId ? `Editar Matéria #${editingId}` : "Criar Nova Matéria"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Preencha os dados abaixo ou utilize o gerador de IA para pré-preencher o conteúdo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab("posts")} className="text-xs">
                  Voltar para Lista
                </Button>
                <Button
                  onClick={handleSubmitPost}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-accent text-accent-foreground font-bold text-xs gap-1.5 shadow"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {editingId ? "Salvar Alterações" : "Publicar Matéria"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Metadata & Image */}
              <div className="space-y-4">
                <Card className="p-4 space-y-4 border-border">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-accent" />
                    Informações Básicas
                  </h3>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Título *</label>
                    <Input
                      placeholder="Ex: Nova colheitadeira New Holland com motor elétrico..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Categoria *</label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                    >
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Status de Publicação</label>
                    <Select
                      value={formData.status}
                      onValueChange={(val: "draft" | "published") => setFormData({ ...formData, status: val })}
                    >
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho (Não visível)</SelectItem>
                        <SelectItem value="published">Publicado (Visível no Blog)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Resumo (Excerpt)</label>
                    <Textarea
                      placeholder="Breve resumo para os cards de destaque no site..."
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={3}
                      className="mt-1 text-xs"
                    />
                  </div>
                </Card>

                {/* Cover Image Card */}
                <Card className="p-4 space-y-3 border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Imagem de Capa</label>
                    <span className="text-[10px] text-muted-foreground">URL ou Gerador</span>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!formData.title || !formData.categoryId) {
                          toast.error("Preencha o título e a categoria primeiro!");
                          return;
                        }
                        generateImageMutation.mutate({
                          title: formData.title,
                          content: formData.content || formData.title,
                          categoryId: parseInt(formData.categoryId),
                        });
                      }}
                      disabled={generateImageMutation.isPending || !formData.title || !formData.categoryId}
                      className="flex-1 text-xs gap-1.5 border-accent/40 hover:bg-accent/10"
                    >
                      {generateImageMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      )}
                      Gerar com IA
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQueryText(formData.title || "veiculos");
                        setIsSearchImageOpen(true);
                      }}
                      className="flex-1 text-xs gap-1.5 border-border hover:bg-muted"
                    >
                      <Search className="h-3.5 w-3.5" />
                      Banco de Imagens
                    </Button>
                  </div>

                  {formData.coverImage && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-border relative group">
                      <img src={formData.coverImage} alt="Preview da Capa" className="w-full h-36 object-cover" />
                      <div className="p-2 bg-card/90 text-[11px] flex items-center justify-between">
                        <span className="text-muted-foreground truncate">
                          {generatedImage?.source === "ai"
                            ? "✨ Gerada por IA"
                            : generatedImage?.source === "stock"
                            ? "🖼️ Imagem de Estoque"
                            : "🔗 Imagem configurada"}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData({ ...formData, coverImage: "" })}
                          className="h-5 px-1.5 text-[10px] text-destructive hover:bg-destructive/10"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Column: Markdown Content Editor */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="p-5 border-border flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-foreground">Conteúdo da Notícia (Markdown) *</label>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formData.content.length} caracteres • {formData.content.split(/\s+/).filter(Boolean).length} palavras
                    </span>
                  </div>

                  <Textarea
                    placeholder="Escreva aqui o artigo completo. Você pode usar Markdown (# Título, ## Subtítulo, **negrito**, listas)..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="min-h-[480px] font-mono text-sm leading-relaxed p-4 bg-muted/20 flex-1"
                  />

                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <span>Dica: Use a aba <strong>Robô Agente IA</strong> para gerar matérias completas automaticamente.</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={resetForm} className="text-xs">
                        Limpar
                      </Button>
                      <Button
                        onClick={handleSubmitPost}
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="bg-accent text-accent-foreground font-bold text-xs gap-1.5 shadow"
                      >
                        {createMutation.isPending || updateMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {editingId ? "Atualizar Matéria" : "Salvar e Publicar"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 4: ROBÔ AGENTE IA & GERADOR (AGENT)
        ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "agent" && (
          <div className="space-y-6">
            {/* Banner Robô Gemini 3.8 Flash */}
            <Card className="p-6 bg-gradient-to-r from-amber-500/10 via-card to-accent/10 border-accent/40 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-accent text-accent-foreground rounded-xl shadow-md">
                    <Bot className="h-7 w-7 text-black animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-extrabold text-base text-foreground">Robô Inteligente de Notícias (Gemini 3.8 Flash)</h3>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[11px] font-mono">
                        ● AGENDADO A CADA 5 DIAS (08:00)
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                      O robô varre portais especializados automotivos, de agronegócio e náuticos via feeds RSS, pontua a relevância de 0 a 10 com Gemini 3.8 Flash, reescreve as matérias completas em tom jornalístico técnico e gera automaticamente roteiros de Reels para redes sociais.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => runAgentNowMutation.mutate()}
                    disabled={runAgentNowMutation.isPending}
                    className="bg-accent text-accent-foreground font-black px-5 py-5 text-xs shadow-md hover:bg-accent/90 gap-2"
                  >
                    {runAgentNowMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Varrendo RSS & Gerando com IA...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        ⚡ Disparar Ciclo do Robô Agora
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <Tabs defaultValue="queue" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mb-4">
                <TabsTrigger value="queue">Fila do Robô ({agentQueue.length})</TabsTrigger>
                <TabsTrigger value="manual-ai">Gerar sob Demanda (URL/Texto)</TabsTrigger>
              </TabsList>

              {/* Subtab: Agent Queue */}
              <TabsContent value="queue" className="space-y-4">
                {agentQueue.length === 0 ? (
                  <Card className="p-12 text-center border-dashed border-border">
                    <Bot className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                    <h4 className="font-bold text-sm text-foreground">Nenhuma notícia gerada na fila recente</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Clique em "Disparar Ciclo do Robô Agora" acima para iniciar a varredura nas fontes cadastradas.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agentQueue.map((art: any, idx: number) => (
                      <Card key={idx} className="p-4 border-border bg-card hover:border-accent/40 transition flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <Badge variant="outline" className="text-[10px] border-accent/40 text-accent font-semibold">
                              {art.categoryName || art.categorySlug}
                            </Badge>
                            <Badge className="bg-accent text-accent-foreground font-mono text-[10px] font-bold">
                              Score: {art.agentScore}/10
                            </Badge>
                          </div>

                          <h4 className="font-bold text-sm text-foreground line-clamp-2">{art.rewrittenTitle}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">{art.excerpt}</p>

                          {art.suggestedImageUrl && (
                            <img src={art.suggestedImageUrl} alt="" className="w-full h-32 object-cover rounded-md mt-2" />
                          )}

                          {/* Reels Script Section */}
                          {art.reelsScript && (
                            <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/80 text-xs">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                                  <Video className="h-3.5 w-3.5 text-pink-500" />
                                  Roteiro de Reels / Shorts:
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(art.reelsScript);
                                    toast.success("Roteiro copiado para a área de transferência!");
                                  }}
                                  className="h-6 px-1.5 text-[10px] text-muted-foreground"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copiar
                                </Button>
                              </div>
                              <p className="text-muted-foreground text-[11px] line-clamp-3 italic">
                                "{art.reelsScript}"
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 mt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">Fonte: {art.sourceName}</span>
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const catId = CATEGORY_SLUG_TO_ID[art.categorySlug] || 1;
                                setFormData({
                                  title: art.rewrittenTitle,
                                  content: art.rewrittenContent,
                                  excerpt: art.excerpt,
                                  categoryId: catId.toString(),
                                  coverImage: art.suggestedImageUrl || "",
                                  status: "published",
                                });
                                setActiveTab("editor");
                                toast.info("Conteúdo carregado no editor.");
                              }}
                              className="text-xs h-7 px-2.5"
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              disabled={directPublishAgentMutation.isPending}
                              onClick={() => {
                                const catId = CATEGORY_SLUG_TO_ID[art.categorySlug] || 1;
                                directPublishAgentMutation.mutate({
                                  title: art.rewrittenTitle,
                                  content: art.rewrittenContent,
                                  excerpt: art.excerpt,
                                  categoryId: catId,
                                  coverImage: art.suggestedImageUrl || "",
                                  status: "published",
                                });
                              }}
                              className="bg-accent text-accent-foreground font-bold text-xs h-7 px-2.5 shadow gap-1"
                            >
                              <Check className="h-3 w-3" />
                              Autorizar Publicação
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Subtab: Manual AI Rewrite */}
              <TabsContent value="manual-ai">
                <Card className="p-6 border-border max-w-2xl space-y-4">
                  <div className="flex gap-2 p-1 bg-muted/40 rounded-lg border border-border">
                    <Button
                      variant={aiMode === "url" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAiMode("url")}
                      className={aiMode === "url" ? "bg-accent text-accent-foreground font-bold text-xs flex-1" : "text-xs flex-1"}
                    >
                      Reescrever de URL
                    </Button>
                    <Button
                      variant={aiMode === "text" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAiMode("text")}
                      className={aiMode === "text" ? "bg-accent text-accent-foreground font-bold text-xs flex-1" : "text-xs flex-1"}
                    >
                      Reescrever de Texto Bruto
                    </Button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Categoria de Destino *</label>
                    <Select value={formData.categoryId} onValueChange={(val) => setFormData({ ...formData, categoryId: val })}>
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue placeholder="Selecione a categoria para orientar a IA" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">
                      {aiMode === "url" ? "Cole a URL da Notícia" : "Cole o Texto da Notícia"}
                    </label>
                    <Textarea
                      placeholder={aiMode === "url" ? "https://exemplo.com/noticia-automotiva" : "Cole aqui o texto bruto da matéria..."}
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      rows={4}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <Button
                    onClick={handleGenerateAI}
                    disabled={generateFromUrlMutation.isPending || generateFromTextMutation.isPending || !aiInput.trim()}
                    className="w-full bg-accent text-accent-foreground font-bold text-xs py-5"
                  >
                    {generateFromUrlMutation.isPending || generateFromTextMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando com Gemini 3.8 Flash...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar Matéria Formatada
                      </>
                    )}
                  </Button>

                  {aiPreview && (
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/30 space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground">Resultado da Geração</h4>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                          Pronto
                        </Badge>
                      </div>
                      <h5 className="font-bold text-sm text-foreground">{aiPreview.title}</h5>
                      <p className="text-xs text-muted-foreground">{aiPreview.excerpt}</p>
                      <Button onClick={handleUseAIContent} className="w-full bg-accent text-accent-foreground font-bold text-xs">
                        Importar para o Editor de Matéria
                      </Button>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 5: LEADS DE ANUNCIANTES (LEADS)
        ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
              <div>
                <h3 className="font-bold text-base text-foreground">Leads Capturados no Blog</h3>
                <p className="text-xs text-muted-foreground">
                  Pessoas e empresas que clicaram em "Anuncie Aqui" ou preencheram os formulários de mídia.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select value={leadSegmentFilter} onValueChange={setLeadSegmentFilter}>
                  <SelectTrigger className="h-9 text-xs w-36">
                    <SelectValue placeholder="Segmento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Segmentos</SelectItem>
                    <SelectItem value="anunciante">Anunciantes</SelectItem>
                    <SelectItem value="lojista">Lojistas</SelectItem>
                    <SelectItem value="comprador">Compradores</SelectItem>
                    <SelectItem value="outro">Outros</SelectItem>
                  </SelectContent>
                </Select>

                <Button onClick={handleExportLeadsCsv} variant="outline" className="text-xs font-semibold gap-1.5 border-border h-9">
                  <Download className="h-3.5 w-3.5" />
                  Baixar Planilha CSV
                </Button>
              </div>
            </div>

            <Card className="p-0 overflow-hidden border-border">
              {leadsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">Nenhum lead encontrado com o filtro selecionado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                      <tr>
                        <th className="py-3 px-4">Nome</th>
                        <th className="py-3 px-4">Segmento</th>
                        <th className="py-3 px-4">Interesse</th>
                        <th className="py-3 px-4">Contato Rápido</th>
                        <th className="py-3 px-4">Mensagem</th>
                        <th className="py-3 px-4">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredLeads.map((lead: any) => (
                        <tr key={lead.id} className="hover:bg-accent/5 transition">
                          <td className="py-3 px-4 font-semibold text-foreground">
                            {lead.name}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-[10px] uppercase font-mono border-accent/30 text-accent">
                              {lead.segment}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {lead.categoryInterest || "Geral"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {lead.phone && (
                                <a
                                  href={`https://wa.me/55${lead.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold hover:bg-emerald-500/20 text-[11px]"
                                >
                                  <Phone className="h-3 w-3" />
                                  {lead.phone}
                                </a>
                              )}
                              {lead.email && (
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[11px]"
                                >
                                  <Mail className="h-3 w-3" />
                                  Email
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 max-w-xs text-muted-foreground truncate">
                            {lead.message || "—"}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("pt-BR") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            TAB 6: FONTES RSS & SCRAPING (SOURCES)
        ════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "sources" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add New Source Form */}
              <Card className="p-5 border-border space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Rss className="h-4 w-4 text-orange-400" />
                    Cadastrar Nova Fonte RSS
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    O robô agente consumirá este feed automaticamente durante as varreduras periódicas.
                  </p>
                </div>

                <form onSubmit={handleAddSourceSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground">Nome da Fonte *</label>
                    <Input
                      placeholder="Ex: Canal Rural - Máquinas"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                      className="text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">URL do Feed RSS *</label>
                    <Input
                      placeholder="https://site.com.br/feed/"
                      value={newSource.url}
                      onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                      className="text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Categoria Associada *</label>
                    <Select
                      value={newSource.categoryId}
                      onValueChange={(val) => setNewSource({ ...newSource, categoryId: val })}
                    >
                      <SelectTrigger className="mt-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground">Palavras-chave Filtro</label>
                    <Input
                      placeholder="trator, colheitadeira, picape"
                      value={newSource.keywords}
                      onChange={(e) => setNewSource({ ...newSource, keywords: e.target.value })}
                      className="text-xs mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={addSourceMutation.isPending}
                    className="w-full bg-accent text-accent-foreground font-bold text-xs mt-2"
                  >
                    {addSourceMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                    Cadastrar Fonte
                  </Button>
                </form>
              </Card>

              {/* Active Sources Grid */}
              <div className="lg:col-span-2 space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center justify-between">
                  <span>Fontes RSS Monitoradas ({sources.length})</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                    Todas Ativas
                  </Badge>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sources.map((src: any) => (
                    <Card key={src.id} className="p-3.5 border-border bg-card/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-foreground truncate">{src.name}</h4>
                        <Badge variant="outline" className="text-[10px] border-accent/40 text-accent">
                          {categoryMap.get(src.categoryId) || "Veículos"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate font-mono">{src.url}</p>
                      {src.keywords && (
                        <p className="text-[10px] text-muted-foreground">
                          Filtros: <span className="text-foreground">{src.keywords}</span>
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ─── Modal: Busca de Imagem de Estoque ──────────────────────────────────── */}
      <Dialog open={isSearchImageOpen} onOpenChange={setIsSearchImageOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4 text-accent" />
              Banco de Imagens de Estoque
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex gap-2">
              <Input
                placeholder="Pesquisar por veículo, barco, trator..."
                value={searchQueryText}
                onChange={(e) => setSearchQueryText(e.target.value)}
                className="text-xs"
              />
            </div>

            {stockLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : stockImages.length === 0 ? (
              <p className="text-center py-8 text-xs text-muted-foreground">
                Nenhuma imagem encontrada. Tente outra palavra-chave.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stockImages.map((img: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, coverImage: img.url }));
                      setSelectedStockImage(img.url);
                      setIsSearchImageOpen(false);
                      toast.success("Imagem de capa selecionada!");
                    }}
                    className="group relative cursor-pointer rounded-lg overflow-hidden border border-border hover:border-accent transition aspect-video bg-muted"
                  >
                    <img src={img.url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition">
                      <span className="text-[11px] text-white font-medium truncate">{img.title}</span>
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

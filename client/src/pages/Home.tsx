import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, Share2 } from "lucide-react";
import { Link } from "wouter";
import { ShareButtons } from "@/components/ShareButtons";

export default function Home() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedShareId, setExpandedShareId] = useState<number | null>(null);

  // Fetch categories
  const { data: categories = [] } = trpc.categories.list.useQuery();

  // Fetch published posts
  const { data: posts = [], isLoading: postsLoading } = trpc.posts.list.useQuery({
    limit: 20,
    offset: 0,
  });

  // Filter posts by category and search
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = !selectedCategory || post.categoryId === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-accent flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">TM</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Todo Motor</h1>
          </div>
          <nav className="flex items-center gap-4">
            {user && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Painel Admin
                </Button>
              </Link>
            )}
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Download className="mr-2 h-4 w-4" />
              Baixar App
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-accent/10 to-background py-12">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Notícias do Universo Motor
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Fique por dentro das últimas novidades sobre veículos pesados, barcos, aeronaves, máquinas agrícolas e equipamentos de terraplanagem.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="border-b border-border bg-background py-8">
        <div className="container">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar notícias..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={selectedCategory === null ? "bg-accent text-accent-foreground" : ""}
              >
                Todas as Categorias
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? "bg-accent text-accent-foreground" : ""}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <div className="container">
          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Nenhuma notícia encontrada. Tente ajustar seus filtros.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => {
                const category = categories.find((c) => c.id === post.categoryId);
                const postUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/post/${post.slug}`;
                const isExpanded = expandedShareId === post.id;

                return (
                  <div key={post.id} className="flex flex-col h-full">
                    <Link href={`/post/${post.slug}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex-1 flex flex-col">
                        {post.coverImage && (
                          <div className="h-48 w-full overflow-hidden bg-muted">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="h-full w-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <div className="flex flex-col flex-1 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {category && (
                              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                                {category.name}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString("pt-BR")
                                : ""}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                            {post.excerpt || post.content.substring(0, 150)}
                          </p>
                          <Button
                            variant="ghost"
                            className="mt-4 w-full text-accent hover:bg-accent/10"
                          >
                            Ler Mais →
                          </Button>
                        </div>
                      </Card>
                    </Link>

                    {/* Share Buttons */}
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedShareId(isExpanded ? null : post.id)}
                        className="w-full"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        {isExpanded ? "Ocultar Compartilhamento" : "Compartilhar"}
                      </Button>
                      {isExpanded && (
                        <div className="mt-2 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                          <ShareButtons
                            title={post.title}
                            url={postUrl}
                            excerpt={post.excerpt || undefined}
                            variant="vertical"
                            showLabel={false}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-accent/10 py-12 mt-12">
        <div className="container text-center">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Conecte-se com os Melhores Lojistas
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Baixe o app Todo Motor e tenha acesso a uma plataforma completa de compra e venda de veículos pesados, máquinas e equipamentos.
          </p>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg">
            <Download className="mr-2 h-5 w-5" />
            Baixar Todo Motor
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Todo Motor. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

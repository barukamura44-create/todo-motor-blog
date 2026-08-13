import { useParams } from "wouter";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { ShareButtons } from "@/components/ShareButtons";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = trpc.posts.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: categories = [] } = trpc.categories.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </header>
        <div className="container py-12 text-center">
          <p className="text-muted-foreground text-lg">Artigo não encontrado.</p>
        </div>
      </div>
    );
  }

  const category = categories.find((c) => c.id === post.categoryId);
  const postUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/post/${post.slug}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Download className="mr-2 h-4 w-4" />
            Baixar App
          </Button>
        </div>
      </header>

      {/* Article */}
      <article className="py-12">
        <div className="container max-w-3xl">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          {/* Meta Information */}
          <div className="flex items-center gap-4 mb-6">
            {category && (
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                {category.name}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-foreground mb-6">{post.title}</h1>

          {/* Share Buttons - Top */}
          <div className="mb-8 pb-8 border-b border-border">
            <p className="text-sm text-muted-foreground mb-4">Compartilhe esta notícia:</p>
            <ShareButtons
              title={post.title}
              url={postUrl}
              excerpt={post.excerpt || undefined}
              variant="horizontal"
              showLabel={true}
            />
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-12">
            <div className="text-foreground leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-8 mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Procurando peças ou equipamentos como este?
            </h3>
            <p className="text-muted-foreground mb-6">
              Baixe agora o app Todo Motor e conecte-se com os melhores lojistas do mercado. Encontre veículos pesados, máquinas agrícolas, equipamentos de terraplanagem e muito mais.
            </p>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-6 text-lg">
              <Download className="mr-2 h-5 w-5" />
              Baixar Todo Motor - Acesse www.todomotor.com.br
            </Button>
          </div>

          {/* Share Section - Bottom */}
          <div className="border-t border-border pt-8">
            <p className="text-sm text-muted-foreground mb-4">Gostou? Compartilhe com seus contatos:</p>
            <ShareButtons
              title={post.title}
              url={postUrl}
              excerpt={post.excerpt || undefined}
              variant="horizontal"
              showLabel={true}
            />
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Todo Motor. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

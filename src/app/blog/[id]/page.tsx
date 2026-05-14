import { getPostData } from "@/lib/blog";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await getPostData(params.id).catch(() => null);
  if (!post) return { title: "Post no encontrado" };
  return { title: `${post.title} — Blog` };
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await getPostData(params.id).catch(() => null);
  
  if (!post) notFound();

  return (
    <article className="min-h-screen bg-[var(--bg-main)] py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al blog
        </Link>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {post.date}</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[var(--text-heading)] leading-tight">
            {post.title}
          </h1>
        </div>

        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        </div>

        <div 
          className="prose prose-indigo dark:prose-invert max-w-none prose-headings:font-black prose-p:text-[var(--text-muted)] prose-p:leading-relaxed prose-li:text-[var(--text-muted)]"
          dangerouslySetInnerHTML={{ __html: post.contentHtml! }} 
        />

        <div className="pt-12 border-t border-[var(--border-main)]">
          <div className="glass-card rounded-3xl p-8 bg-indigo-50/30 dark:bg-indigo-500/5 text-center space-y-4">
            <h3 className="text-xl font-bold text-[var(--text-heading)]">¿Te gustó este artículo?</h3>
            <p className="text-sm text-[var(--text-muted)]">Suscríbete a nuestra newsletter para recibir consejos semanales directamente en tu bandeja de entrada.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input type="email" placeholder="tu@email.com" className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-main)] bg-white dark:bg-white/5 outline-none focus:ring-2 focus:ring-indigo-500/50" />
              <button className="btn-primary py-2.5 px-6">Suscribirse</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

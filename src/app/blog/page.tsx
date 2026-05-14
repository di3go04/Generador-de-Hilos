import Link from "next/link";
import { getSortedPostsData } from "@/lib/blog";
import { Calendar, User, ArrowRight } from "lucide-react";

export const metadata = { title: "Blog — Generador de Hilos" };

export default function BlogPage() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-heading)]">Blog de Crecimiento</h1>
          <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto">
            Consejos, estrategias y noticias sobre cómo dominar Twitter/X con ayuda de la IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="group flex flex-col glass-card rounded-2xl overflow-hidden hover:translate-y-[-4px] transition-all border border-[var(--border-main)]">
              <div className="relative aspect-video overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="p-6 flex-1 flex flex-col space-y-3">
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {post.author}</span>
                </div>
                <h2 className="text-xl font-bold text-[var(--text-heading)] group-hover:text-indigo-600 transition-colors leading-tight">
                  {post.title}
                </h2>
                <p className="text-sm text-[var(--text-muted)] line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="pt-4 mt-auto flex items-center text-sm font-bold text-indigo-600 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Leer más <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

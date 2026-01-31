import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  Clock,
  ArrowLeft,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  Tag,
  User,
  Eye,
} from 'lucide-react';
import { blogApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

function ShareButton({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 mr-2">Partager:</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        aria-label="Partager sur Facebook"
      >
        <Facebook className="h-5 w-5" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-500 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-colors"
        aria-label="Partager sur Twitter"
      >
        <Twitter className="h-5 w-5" />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
        aria-label="Partager sur LinkedIn"
      >
        <Linkedin className="h-5 w-5" />
      </a>
      <button
        onClick={handleCopy}
        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
        aria-label="Copier le lien"
      >
        {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
      </button>
    </div>
  );
}

function TableOfContents({ content }: { content: string }) {
  // Extract headings from content (assumes markdown-like h2 and h3)
  const headings = content.match(/^##\s+.+$/gm) || [];
  
  if (headings.length < 3) return null;

  return (
    <nav className="bg-gray-50 rounded-xl p-6 mb-8">
      <h2 className="font-bold text-gray-900 mb-4">Dans cet article</h2>
      <ul className="space-y-2">
        {headings.map((heading, i) => {
          const text = heading.replace(/^##\s+/, '');
          const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
          return (
            <li key={i}>
              <a
                href={`#${id}`}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                {text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const { data: posts } = useQuery({
    queryKey: ['blog-related', currentSlug],
    queryFn: () => blogApi.getPosts({ limit: 3 }),
  });

  const related = posts?.data?.filter((p) => p.slug !== currentSlug).slice(0, 3);

  if (!related?.length) return null;

  return (
    <section className="mt-16 pt-8 border-t">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles similaires</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {post.coverImage && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 line-clamp-2">
                {post.title}
              </h3>
              {post.publishedAt && (
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(post.publishedAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogApi.getPost(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-8" />
          <div className="aspect-video bg-gray-200 rounded-xl mb-8" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-5 w-5" />
              Retour au blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const pageUrl = `https://promotionhub.ci/blog/${post.slug}`;

  return (
    <>
      <Helmet>
        <title>{post.metaTitle || post.title} | Blog PromotionHub</title>
        <meta
          name="description"
          content={post.metaDescription || post.excerpt || post.title}
        />
        {post.metaKeywords && <meta name="keywords" content={post.metaKeywords} />}
        <link rel="canonical" href={post.canonicalUrl || pageUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={post.metaTitle || post.title} />
        <meta
          property="og:description"
          content={post.metaDescription || post.excerpt || post.title}
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        {(post.ogImage || post.coverImage) && (
          <meta property="og:image" content={(post.ogImage || post.coverImage) ?? undefined} />
        )}
        {post.publishedAt && <meta property="article:published_time" content={post.publishedAt} />}
        {post.authorName && <meta property="article:author" content={post.authorName} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.metaTitle || post.title} />
        <meta
          name="twitter:description"
          content={post.metaDescription || post.excerpt || post.title}
        />
        {(post.ogImage || post.coverImage) && (
          <meta name="twitter:image" content={(post.ogImage || post.coverImage) ?? undefined} />
        )}

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt || post.metaDescription,
            image: post.coverImage || post.ogImage,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt,
            author: {
              '@type': 'Person',
              name: post.authorName || 'PromotionHub',
            },
            publisher: {
              '@type': 'Organization',
              name: 'PromotionHub',
              logo: {
                '@type': 'ImageObject',
                url: 'https://promotionhub.ci/logo.png',
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': pageUrl,
            },
            wordCount: post.content?.split(/\s+/).length || 0,
            timeRequired: `PT${post.readingTime || 5}M`,
          })}
        </script>
      </Helmet>

      <article className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-primary-600">
                Accueil
              </Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-primary-600">
                Blog
              </Link>
              <span>/</span>
              <span className="text-gray-900 truncate">{post.title}</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <header className="bg-white pb-8">
          <div className="max-w-4xl mx-auto px-4 pt-8">
            {/* Categories */}
            {post.categories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/blog?category=${cat.slug}`}
                    className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full hover:bg-primary-100"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
              {post.authorName && (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.authorName}
                </span>
              )}
              {post.publishedAt && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
              {post.readingTime && (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.readingTime} min de lecture
                </span>
              )}
              {post.viewCount > 0 && (
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {post.viewCount.toLocaleString('fr-FR')} vues
                </span>
              )}
            </div>

            {/* Share */}
            <ShareButton url={pageUrl} title={post.title} />
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="max-w-5xl mx-auto px-4 -mt-4 mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full aspect-video object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Table of Contents */}
          <TableOfContents content={post.content} />

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-700 leading-relaxed mb-8 font-medium">
              {post.excerpt}
            </p>
          )}

          {/* Main Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-a:text-primary-600 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-12 pt-6 border-t">
              <Tag className="h-5 w-5 text-gray-400" />
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/blog?tag=${tag.slug}`}
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Share at bottom */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Link
              to="/blog"
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour au blog
            </Link>
            <ShareButton url={pageUrl} title={post.title} />
          </div>

          {/* Related Posts */}
          <RelatedPosts currentSlug={post.slug} />
        </div>
      </article>
    </>
  );
}

function formatContent(content: string): string {
  // Basic markdown-like formatting
  return content
    .replace(/^## (.+)$/gm, (_, text) => {
      const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return `<h2 id="${id}">${text}</h2>`;
    })
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h(\d)><\/p>/g, '</h$1>');
}

export default BlogPost;

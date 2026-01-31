import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Search, Calendar, Clock, ArrowRight, Tag, Folder } from 'lucide-react';
import { blogApi, type BlogPost } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {post.coverImage && (
        <Link to={`/blog/${post.slug}`} className="block aspect-video overflow-hidden">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
      )}
      <div className="p-6">
        {post.categories?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/blog?category=${cat.slug}`}
                className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full hover:bg-primary-100 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readingTime} min
              </span>
            )}
          </div>
          <Link
            to={`/blog/${post.slug}`}
            className="flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700"
          >
            Lire <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <article className="relative bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl overflow-hidden text-white">
      <div className="absolute inset-0">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        )}
      </div>
      <div className="relative p-8 md:p-12 lg:p-16">
        <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Article à la une
        </span>
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 hover:underline">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="text-lg text-white/90 mb-6 max-w-2xl line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-white/80 mb-6">
          {post.authorName && <span>Par {post.authorName}</span>}
          {post.publishedAt && (
            <span>
              {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
          {post.readingTime && <span>{post.readingTime} min de lecture</span>}
        </div>
        <Link to={`/blog/${post.slug}`}>
          <Button variant="secondary" size="lg">
            Lire l'article <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </article>
  );
}

export function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const page = Number(searchParams.get('page')) || 1;

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['blog-posts', { category, tag, search: searchParams.get('search'), page }],
    queryFn: () =>
      blogApi.getPosts({
        category: category || undefined,
        tag: tag || undefined,
        search: searchParams.get('search') || undefined,
        page,
        limit: 9,
      }),
  });

  const { data: featuredPosts } = useQuery({
    queryKey: ['blog-featured'],
    queryFn: blogApi.getFeatured,
  });

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: blogApi.getCategories,
  });

  const { data: tags } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: blogApi.getTags,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (searchQuery) {
        prev.set('search', searchQuery);
      } else {
        prev.delete('search');
      }
      prev.delete('page');
      return prev;
    });
  };

  const posts = postsData?.data || [];
  const pagination = postsData?.pagination;
  const mainFeatured = featuredPosts?.[0];

  return (
    <>
      <Helmet>
        <title>Blog | Conseils Publicité Extérieure en Côte d'Ivoire - PromotionHub</title>
        <meta
          name="description"
          content="Découvrez nos articles sur la publicité extérieure en Côte d'Ivoire. Conseils, tendances et bonnes pratiques pour maximiser l'impact de vos campagnes d'affichage."
        />
        <meta
          name="keywords"
          content="publicité extérieure, panneaux publicitaires, affichage Côte d'Ivoire, marketing Abidjan, communication visuelle"
        />
        <link rel="canonical" href="https://promotionhub.ci/blog" />
        <meta property="og:title" content="Blog | Publicité Extérieure en Côte d'Ivoire" />
        <meta
          property="og:description"
          content="Conseils et tendances pour réussir vos campagnes d'affichage publicitaire en Côte d'Ivoire."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://promotionhub.ci/blog" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Blog PromotionHub',
            description: 'Conseils et tendances pour la publicité extérieure en Côte d\'Ivoire',
            url: 'https://promotionhub.ci/blog',
            publisher: {
              '@type': 'Organization',
              name: 'PromotionHub',
              logo: {
                '@type': 'ImageObject',
                url: 'https://promotionhub.ci/logo.png',
              },
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Blog & Ressources
              </h1>
              <p className="text-xl text-gray-600">
                Conseils, tendances et bonnes pratiques pour optimiser vos campagnes
                de publicité extérieure en Côte d'Ivoire
              </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="flex gap-3">
                <Input
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-5 w-5" />}
                  className="flex-1"
                />
                <Button type="submit">Rechercher</Button>
              </div>
            </form>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Featured Post */}
          {mainFeatured && !category && !tag && !searchParams.get('search') && page === 1 && (
            <div className="mb-12">
              <FeaturedPost post={mainFeatured} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Active Filters */}
              {(category || tag || searchParams.get('search')) && (
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                  <span className="text-gray-600">Filtres:</span>
                  {category && (
                    <button
                      onClick={() => {
                        setSearchParams((prev) => {
                          prev.delete('category');
                          return prev;
                        });
                      }}
                      className="flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm hover:bg-primary-200"
                    >
                      <Folder className="h-3 w-3" />
                      {categories?.find((c) => c.slug === category)?.name || category}
                      <span className="ml-1">×</span>
                    </button>
                  )}
                  {tag && (
                    <button
                      onClick={() => {
                        setSearchParams((prev) => {
                          prev.delete('tag');
                          return prev;
                        });
                      }}
                      className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                    >
                      <Tag className="h-3 w-3" />
                      {tags?.find((t) => t.slug === tag)?.name || tag}
                      <span className="ml-1">×</span>
                    </button>
                  )}
                  {searchParams.get('search') && (
                    <button
                      onClick={() => {
                        setSearchParams((prev) => {
                          prev.delete('search');
                          return prev;
                        });
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                    >
                      "{searchParams.get('search')}"
                      <span className="ml-1">×</span>
                    </button>
                  )}
                </div>
              )}

              {/* Posts Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                      <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl">
                  <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun article trouvé</h3>
                  <p className="text-gray-600">
                    Essayez une autre recherche ou explorez nos catégories
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      {page > 1 && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            setSearchParams((prev) => {
                              prev.set('page', String(page - 1));
                              return prev;
                            })
                          }
                        >
                          Précédent
                        </Button>
                      )}
                      <span className="flex items-center px-4 text-gray-600">
                        Page {page} sur {pagination.totalPages}
                      </span>
                      {page < pagination.totalPages && (
                        <Button
                          variant="outline"
                          onClick={() =>
                            setSearchParams((prev) => {
                              prev.set('page', String(page + 1));
                              return prev;
                            })
                          }
                        >
                          Suivant
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Categories */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Folder className="h-5 w-5 text-primary-600" />
                  Catégories
                </h3>
                <ul className="space-y-2">
                  {categories?.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/blog?category=${cat.slug}`}
                        className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                          category === cat.slug
                            ? 'bg-primary-50 text-primary-700'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-sm text-gray-500">{cat._count?.posts || 0}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary-600" />
                    Tags populaires
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 15).map((t) => (
                      <Link
                        key={t.id}
                        to={`/blog?tag=${t.slug}`}
                        className={`text-sm px-3 py-1 rounded-full transition-colors ${
                          tag === t.slug
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter CTA */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Restez informé</h3>
                <p className="text-primary-100 text-sm mb-4">
                  Recevez nos derniers articles et conseils directement dans votre boîte mail.
                </p>
                <Link to="/#newsletter">
                  <Button variant="secondary" className="w-full">
                    S'inscrire à la newsletter
                  </Button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

export default Blog;

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, Eye, Search,
  FileText, Tag, Folder, BarChart3
} from 'lucide-react';
import { blogApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

type TabType = 'posts' | 'categories' | 'tags';

export function AdminBlog() {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: postsData, isLoading: loadingPosts } = useQuery({
    queryKey: ['admin-blog-posts', searchQuery],
    queryFn: () => blogApi.getPosts({ limit: 50, search: searchQuery || undefined }),
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-blog-categories'],
    queryFn: blogApi.getCategories,
  });

  const { data: tags } = useQuery({
    queryKey: ['admin-blog-tags'],
    queryFn: blogApi.getTags,
  });

  const deletePostMutation = useMutation({
    mutationFn: blogApi.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
    },
  });

  const posts = postsData?.data || [];

  const stats = {
    totalPosts: posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    drafts: posts.filter((p) => p.status === 'draft').length,
    totalViews: posts.reduce((sum, p) => sum + p.viewCount, 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion du Blog</h1>
          <p className="text-gray-600 mt-1">Gérez vos articles, catégories et tags</p>
        </div>
        <Button>
          <Plus className="h-5 w-5 mr-2" />
          Nouvel article
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                <p className="text-sm text-gray-500">Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                <p className="text-sm text-gray-500">Publiés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Edit2 className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.drafts}</p>
                <p className="text-sm text-gray-500">Brouillons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Vues totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {[
            { id: 'posts', label: 'Articles', icon: FileText },
            { id: 'categories', label: 'Catégories', icon: Folder },
            { id: 'tags', label: 'Tags', icon: Tag },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 pb-4 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
              className="max-w-md"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vues</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingPosts ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Chargement...
                    </td>
                  </tr>
                ) : posts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Aucun article trouvé
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.coverImage && (
                            <img
                              src={post.coverImage}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <Link
                              to={`/blog/${post.slug}`}
                              className="font-medium text-gray-900 hover:text-primary-600"
                            >
                              {post.title}
                            </Link>
                            <div className="flex gap-1 mt-1">
                              {post.categories?.map((cat) => (
                                <span
                                  key={cat.id}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                                >
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            post.status === 'published'
                              ? 'success'
                              : post.status === 'draft'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {post.status === 'published' ? 'Publié' : post.status === 'draft' ? 'Brouillon' : 'Archivé'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {post.viewCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString('fr-FR')
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/blog/${post.slug}`}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm('Supprimer cet article ?')) {
                                deletePostMutation.mutate(post.slug);
                              }
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-end mb-6">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle catégorie
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories?.map((cat) => (
              <Card key={cat.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{cat.name}</h3>
                      <p className="text-sm text-gray-500">{cat.slug}</p>
                    </div>
                    <Badge variant="info">{cat._count?.posts || 0} articles</Badge>
                  </div>
                  {cat.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{cat.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tags Tab */}
      {activeTab === 'tags' && (
        <div>
          <div className="flex justify-end mb-6">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau tag
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {tags?.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2"
              >
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">{tag.name}</span>
                <span className="text-sm text-gray-500">({tag._count?.posts || 0})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBlog;

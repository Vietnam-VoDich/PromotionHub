import { useState, useEffect } from 'react';
import { newsletterApi, type NewsletterSubscriber, type NewsletterCampaign } from '@/lib/api';
import {
  EnvelopeIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-CI', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AdminNewsletter() {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'campaigns'>('subscribers');
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [subscribersPagination, setSubscribersPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [campaignsPagination, setCampaignsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ subject: '', content: '', htmlContent: '' });
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const data = await newsletterApi.getSubscribers({
        page: subscribersPagination.page,
        limit: subscribersPagination.limit,
      });
      setSubscribers(data.data);
      setSubscribersPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await newsletterApi.getCampaigns({
        page: campaignsPagination.page,
        limit: campaignsPagination.limit,
      });
      setCampaigns(data.data);
      setCampaignsPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'subscribers') {
      fetchSubscribers();
    } else {
      fetchCampaigns();
    }
  }, [activeTab, subscribersPagination.page, campaignsPagination.page]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await newsletterApi.exportSubscribers();
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await newsletterApi.createCampaign(newCampaign);
      setShowCreateModal(false);
      setNewCampaign({ subject: '', content: '', htmlContent: '' });
      await fetchCampaigns();
    } catch (err) {
      console.error('Error creating campaign:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleSendCampaign = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir envoyer cette campagne à tous les abonnés ?')) return;
    try {
      await newsletterApi.sendCampaign(id);
      await fetchCampaigns();
    } catch (err) {
      console.error('Error sending campaign:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-500 mt-1">Gérez vos abonnés et campagnes email</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'subscribers' && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              {exporting ? 'Export...' : 'Exporter CSV'}
            </button>
          )}
          {activeTab === 'campaigns' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouvelle campagne
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`pb-4 px-2 font-medium flex items-center ${
            activeTab === 'subscribers'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserGroupIcon className="h-5 w-5 mr-2" />
          Abonnés ({subscribersPagination.total})
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-4 px-2 font-medium flex items-center ${
            activeTab === 'campaigns'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <EnvelopeIcon className="h-5 w-5 mr-2" />
          Campagnes ({campaignsPagination.total})
        </button>
      </div>

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucun abonné</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Inscrit le
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{sub.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{sub.firstName || '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          sub.isActive && sub.confirmedAt
                            ? 'bg-green-100 text-green-700'
                            : sub.isActive
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {sub.isActive && sub.confirmedAt
                          ? 'Confirmé'
                          : sub.isActive
                          ? 'En attente'
                          : 'Désabonné'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{sub.source || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(sub.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {subscribersPagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <p className="text-sm text-gray-500">
                Page {subscribersPagination.page} sur {subscribersPagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setSubscribersPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={subscribersPagination.page === 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() =>
                    setSubscribersPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={subscribersPagination.page === subscribersPagination.totalPages}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <EnvelopeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune campagne créée</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Créer une campagne
              </button>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{campaign.subject}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'sent'
                            ? 'bg-green-100 text-green-700'
                            : campaign.status === 'sending'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {campaign.status === 'sent'
                          ? 'Envoyée'
                          : campaign.status === 'sending'
                          ? 'En cours'
                          : 'Brouillon'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{campaign.content}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex gap-6 text-sm text-gray-500">
                    {campaign.sentAt ? (
                      <>
                        <span className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 mr-1 text-green-500" />
                          Envoyée le {formatDate(campaign.sentAt)}
                        </span>
                        <span>{campaign.sentCount} envoyés</span>
                        <span>{campaign.openCount} ouverts</span>
                        <span>{campaign.clickCount} clics</span>
                      </>
                    ) : (
                      <span className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Créée le {formatDate(campaign.createdAt)}
                      </span>
                    )}
                  </div>

                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleSendCampaign(campaign.id)}
                      className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                      <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                      Envoyer
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nouvelle campagne</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                <input
                  type="text"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  placeholder="Sujet de l'email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu (texte brut)
                </label>
                <textarea
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                  required
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  placeholder="Contenu de l'email..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenu HTML (optionnel)
                </label>
                <textarea
                  value={newCampaign.htmlContent}
                  onChange={(e) => setNewCampaign({ ...newCampaign, htmlContent: e.target.value })}
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm"
                  placeholder="<html>...</html>"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {creating ? 'Création...' : 'Créer la campagne'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

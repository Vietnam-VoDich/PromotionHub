import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, ShieldCheck, ShieldAlert, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { blockchainApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface BlockchainBadgeProps {
  bookingId: string;
  blockchainHash: string | null;
  blockchainTxId: string | null;
  blockchainNetwork: string | null;
  certifiedAt: string | null;
  showCertifyButton?: boolean;
  compact?: boolean;
}

export function BlockchainBadge({
  bookingId,
  blockchainHash,
  blockchainTxId,
  blockchainNetwork,
  certifiedAt,
  showCertifyButton = true,
  compact = false,
}: BlockchainBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  const isCertified = !!blockchainHash;

  // Verify certification
  const { data: verification, isLoading: verifying } = useQuery({
    queryKey: ['blockchain-verify', bookingId],
    queryFn: () => blockchainApi.verifyBooking(bookingId),
    enabled: isCertified && showDetails,
  });

  // Certify mutation
  const certifyMutation = useMutation({
    mutationFn: () => blockchainApi.certifyBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['blockchain-verify', bookingId] });
    },
  });

  // Get blockchain info
  const { data: blockchainInfo } = useQuery({
    queryKey: ['blockchain-info'],
    queryFn: blockchainApi.getInfo,
    staleTime: 60000,
  });

  const getExplorerUrl = () => {
    if (!blockchainTxId || !blockchainNetwork) return null;

    const explorers: Record<string, string> = {
      polygon: 'https://polygonscan.com/tx/',
      polygon_mumbai: 'https://mumbai.polygonscan.com/tx/',
      ethereum: 'https://etherscan.io/tx/',
    };

    const baseUrl = explorers[blockchainNetwork];
    return baseUrl ? `${baseUrl}${blockchainTxId}` : null;
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        {isCertified ? (
          <div className="flex items-center gap-1 text-green-600" title="Certifié sur blockchain">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-medium">Certifié</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-400" title="Non certifié">
            <Shield className="h-4 w-4" />
            <span className="text-xs">Non certifié</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCertified ? (
            <ShieldCheck className="h-5 w-5 text-green-600" />
          ) : (
            <Shield className="h-5 w-5 text-gray-400" />
          )}
          <h4 className="font-medium text-gray-900">Certification Blockchain</h4>
        </div>

        {isCertified && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showDetails ? 'Masquer' : 'Détails'}
          </button>
        )}
      </div>

      {isCertified ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700">
              Réservation certifiée le {new Date(certifiedAt!).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {showDetails && (
            <div className="mt-4 space-y-3 bg-white rounded-lg p-3 border border-gray-100">
              <div>
                <p className="text-xs text-gray-500 mb-1">Hash de certification</p>
                <p className="font-mono text-xs text-gray-700 break-all bg-gray-50 p-2 rounded">
                  {blockchainHash}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Réseau</p>
                  <p className="text-sm font-medium text-gray-700 capitalize">
                    {blockchainNetwork === 'local' ? 'Local (Hash)' : blockchainNetwork}
                  </p>
                </div>

                {blockchainTxId && (
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Transaction</p>
                    <a
                      href={getExplorerUrl() || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <span className="font-mono truncate max-w-[150px]">{blockchainTxId}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {verification && (
                <div className={`flex items-center gap-2 p-2 rounded ${
                  verification.valid ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {verification.valid ? (
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${verification.valid ? 'text-green-700' : 'text-red-700'}`}>
                    {verification.message}
                  </span>
                </div>
              )}

              {verifying && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Vérification en cours...</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Cette réservation n'est pas encore certifiée sur la blockchain.
            {blockchainInfo && (
              <span className="block text-xs text-gray-500 mt-1">
                Mode: {blockchainInfo.description}
              </span>
            )}
          </p>

          {showCertifyButton && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => certifyMutation.mutate()}
              disabled={certifyMutation.isPending}
            >
              {certifyMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Certification...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Certifier cette réservation
                </>
              )}
            </Button>
          )}

          {certifyMutation.isSuccess && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Certification réussie !</span>
            </div>
          )}

          {certifyMutation.isError && (
            <div className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-sm">Erreur lors de la certification</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

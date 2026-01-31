import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { favoritesApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  listingId: string;
  initialFavorited?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCount?: boolean;
  count?: number;
}

export function FavoriteButton({
  listingId,
  initialFavorited = false,
  size = 'md',
  className,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: () => favoritesApi.toggle(listingId),
    onMutate: async () => {
      // Optimistic update
      setIsFavorited((prev) => !prev);
    },
    onError: () => {
      // Rollback on error
      setIsFavorited((prev) => !prev);
    },
    onSuccess: (data) => {
      setIsFavorited(data.favorited);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-ids'] });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirect to login or show toast
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    toggleMutation.mutate();
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      className={cn(
        'rounded-full transition-all duration-200',
        'hover:scale-110 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        isFavorited
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white',
        'backdrop-blur-sm shadow-sm',
        sizeClasses[size],
        toggleMutation.isPending && 'opacity-50 cursor-not-allowed',
        className
      )}
      title={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-all duration-200',
          isFavorited && 'fill-current'
        )}
      />
    </button>
  );
}

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

const DEFAULT_TITLE = 'PromotionHub - Panneaux Publicitaires à Abidjan';
const DEFAULT_DESCRIPTION =
  "Trouvez et réservez des panneaux publicitaires à Abidjan et en Côte d'Ivoire. La marketplace de l'affichage extérieur.";
const DEFAULT_IMAGE = 'https://promotionhub.ci/og-image.jpg';
const SITE_NAME = 'PromotionHub';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = 'panneaux publicitaires, affichage, publicité, Abidjan, Côte d\'Ivoire, billboard, advertising',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_CI" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Geo tags for Côte d'Ivoire */}
      <meta name="geo.region" content="CI" />
      <meta name="geo.placename" content="Abidjan" />

      {/* Language */}
      <meta httpEquiv="content-language" content="fr" />
    </Helmet>
  );
}

// preset SEO components for common pages
export function HomeSEO() {
  return (
    <SEO
      title="Accueil"
      description="PromotionHub - La marketplace de panneaux publicitaires en Côte d'Ivoire. Trouvez, comparez et réservez des emplacements publicitaires à Abidjan."
    />
  );
}

export function ListingsSEO({ quartier }: { quartier?: string }) {
  const title = quartier
    ? `Panneaux publicitaires à ${quartier}`
    : 'Tous les panneaux publicitaires';
  const description = quartier
    ? `Découvrez les panneaux publicitaires disponibles à ${quartier}, Abidjan. Réservez votre emplacement publicitaire en ligne.`
    : "Parcourez tous les panneaux publicitaires disponibles à Abidjan et en Côte d'Ivoire.";

  return <SEO title={title} description={description} />;
}

export function ListingDetailSEO({
  title,
  description,
  image,
  quartier,
  price,
}: {
  title: string;
  description?: string;
  image?: string;
  quartier: string;
  price: number;
}) {
  return (
    <SEO
      title={title}
      description={
        description ||
        `Panneau publicitaire à ${quartier} - ${price.toLocaleString('fr-FR')} XOF/mois. Réservez maintenant sur PromotionHub.`
      }
      image={image}
      type="product"
    />
  );
}

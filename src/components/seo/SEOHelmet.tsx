
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  twitterHandle?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEOHelmet: React.FC<SEOProps> = ({
  title = 'B3F Prints - Custom T-Shirts, Mugs & More | Design Your Own Products',
  description = 'Create custom t-shirts, mugs, caps and more with our easy-to-use design tool. High-quality printing, fast delivery, and affordable prices. Start designing today!',
  image = 'https://b3f-prints.pages.dev/og-image.jpg',
  url = 'https://b3f-prints.pages.dev',
  type = 'website',
  siteName = 'B3F Prints',
  twitterHandle = '@b3fprints',
  keywords = 'custom t-shirts, personalized mugs, custom printing, design tool, promotional products',
  author = 'B3F Prints',
  publishedTime,
  modifiedTime
}) => {
  const fullTitle = title.includes('B3F Prints') ? title : `${title} | B3F Prints`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      
      {/* Structured Data for Products */}
      {type === 'product' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": title,
            "description": description,
            "image": image,
            "brand": {
              "@type": "Brand",
              "name": siteName
            },
            "offers": {
              "@type": "Offer",
              "availability": "https://schema.org/InStock",
              "priceCurrency": "INR"
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHelmet;

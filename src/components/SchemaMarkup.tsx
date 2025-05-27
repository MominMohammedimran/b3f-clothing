
import { Helmet } from 'react-helmet';

interface WebsiteSchemaData {
  name: string;
  description: string;
  url: string;
}

interface OrganizationSchemaData {
  name: string;
  url: string;
  logo: string;
  socialLinks?: string[];
}

interface ProductSchemaData {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: string;
  brand?: string;
  sku?: string;
}

type SchemaType = 'website' | 'organization' | 'product';
type SchemaData = WebsiteSchemaData | OrganizationSchemaData | ProductSchemaData;

interface SchemaMarkupProps {
  type: SchemaType;
  data: SchemaData;
}

const SchemaMarkup = ({ type, data }: SchemaMarkupProps) => {
  let schema = {};

  switch (type) {
    case 'website':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: (data as WebsiteSchemaData).name,
        description: (data as WebsiteSchemaData).description,
        url: (data as WebsiteSchemaData).url,
      };
      break;
    case 'organization':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: (data as OrganizationSchemaData).name,
        url: (data as OrganizationSchemaData).url,
        logo: (data as OrganizationSchemaData).logo,
        sameAs: (data as OrganizationSchemaData).socialLinks || [],
      };
      break;
    case 'product':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: (data as ProductSchemaData).name,
        description: (data as ProductSchemaData).description,
        image: (data as ProductSchemaData).image,
        brand: {
          '@type': 'Brand',
          name: (data as ProductSchemaData).brand || '',
        },
        sku: (data as ProductSchemaData).sku,
        offers: {
          '@type': 'Offer',
          price: (data as ProductSchemaData).price,
          priceCurrency: (data as ProductSchemaData).currency,
          availability: (data as ProductSchemaData).availability,
        },
      };
      break;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export default SchemaMarkup;

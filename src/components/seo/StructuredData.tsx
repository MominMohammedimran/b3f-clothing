
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface OrganizationData {
  name: string;
  url: string;
  logo: string;
  description: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    areaServed: string;
  };
  sameAs?: string[];
}

interface WebsiteData {
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

interface StructuredDataProps {
  type: 'organization' | 'website' | 'product';
  data: OrganizationData | WebsiteData | any;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const generateSchema = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": (data as OrganizationData).name,
          "url": (data as OrganizationData).url,
          "logo": (data as OrganizationData).logo,
          "description": (data as OrganizationData).description,
          "contactPoint": (data as OrganizationData).contactPoint,
          "sameAs": (data as OrganizationData).sameAs || []
        };

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": (data as WebsiteData).name,
          "url": (data as WebsiteData).url,
          "description": (data as WebsiteData).description,
          "potentialAction": (data as WebsiteData).potentialAction ? {
            "@type": "SearchAction",
            "target": (data as WebsiteData).potentialAction.target,
            "query-input": (data as WebsiteData).potentialAction.queryInput
          } : undefined
        };

      default:
        return data;
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(generateSchema())}
      </script>
    </Helmet>
  );
};

export default StructuredData;

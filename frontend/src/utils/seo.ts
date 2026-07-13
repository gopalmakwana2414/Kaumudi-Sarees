import { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://kaumudi.com";

interface SeoProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  keywords?: string[];
}

/**
 * Constructs standard Next.js metadata for a page.
 */
export function constructMetadata({
  title,
  description,
  path = "",
  image = "/kaumodi.png", // fallback to the logo for brand consistency
  type = "website",
  keywords = [
    "sarees",
    "silk sarees",
    "banarasi sarees",
    "kanjivaram sarees",
    "wedding sarees",
    "designer sarees",
    "cotton sarees",
    "linen sarees",
    "surat saree manufacturer",
    "premium sarees",
    "kaumudi sarees",
    "surat saree store",
  ],
}: SeoProps): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: "Kaumudi" }],
    applicationName: "Kaumudi",
    metadataBase: new URL(SITE_URL),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Kaumudi",
      images: [
        {
          url: image.startsWith("http") ? image : `${SITE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: type === "product" ? "website" : type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.startsWith("http") ? image : `${SITE_URL}${image}`],
      creator: "@Kaumudi",
    },
  };
}

/**
 * Returns Organization JSON-LD Schema.
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": "Kaumudi",
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE_URL}/kaumodi.png`,
      "width": "315",
      "height": "141"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-89594-65264",
      "contactType": "customer service",
      "email": "g91652251@gmail.com",
      "availableLanguage": ["English", "Hindi", "Gujarati"]
    },
    "sameAs": [
      "https://www.instagram.com",
      "https://www.facebook.com",
      "https://wa.me/918959465264"
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ring Road",
      "addressLocality": "Surat",
      "addressRegion": "Gujarat",
      "postalCode": "395002",
      "addressCountry": "IN"
    }
  };
}

/**
 * Returns LocalBusiness JSON-LD Schema (for Surat local SEO).
 */
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    "name": "Kaumudi Sarees",
    "description": "Premium Saree Store and Manufacturer in Surat. Direct from factory Banarasi, Silk, Kanjivaram and Designer sarees.",
    "url": SITE_URL,
    "logo": `${SITE_URL}/kaumodi.png`,
    "image": `${SITE_URL}/kaumodi.png`,
    "telephone": "+91-89594-65264",
    "email": "g91652251@gmail.com",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Ring Road",
      "addressLocality": "Surat",
      "addressRegion": "Gujarat",
      "postalCode": "395002",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "21.1702",
      "longitude": "72.8311"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://www.instagram.com",
      "https://www.facebook.com",
      "https://wa.me/918959465264"
    ]
  };
}

/**
 * Returns WebSite JSON-LD Schema for search action.
 */
export function getWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "name": "Kaumudi",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/shop?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Returns BreadcrumbList JSON-LD Schema.
 */
export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item.startsWith("http") ? item.item : `${SITE_URL}${item.item}`
    }))
  };
}

/**
 * Returns Product JSON-LD Schema.
 */
interface ProductSchemaProps {
  name: string;
  description: string;
  sku: string;
  price: number;
  currency?: string;
  availability: boolean;
  images: string[];
  categoryName?: string;
  url: string;
  reviews?: Array<{
    author: string;
    datePublished: string;
    reviewBody: string;
    reviewRating: number;
  }>;
  averageRating?: number;
  numReviews?: number;
}

export function getProductSchema({
  name,
  description,
  sku,
  price,
  currency = "INR",
  availability,
  images,
  categoryName = "Sarees",
  url,
  reviews = [],
  averageRating = 0,
  numReviews = 0,
}: ProductSchemaProps) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "image": images.map((img) => (img.startsWith("http") ? img : `${SITE_URL}${img}`)),
    "description": description,
    "sku": sku,
    "mpn": sku,
    "brand": {
      "@type": "Brand",
      "name": "Kaumudi"
    },
    "category": categoryName,
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}${url}`,
      "priceCurrency": currency,
      "price": price,
      "priceValidUntil": new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split("T")[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": availability
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "INR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 7,
            "unitCode": "DAY"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnPeriod",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    }
  };

  if (averageRating > 0 && numReviews > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": numReviews,
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  if (reviews.length > 0) {
    schema.review = reviews.map((rev) => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": rev.reviewRating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "author": {
        "@type": "Person",
        "name": rev.author
      },
      "datePublished": rev.datePublished,
      "reviewBody": rev.reviewBody
    }));
  }

  return schema;
}

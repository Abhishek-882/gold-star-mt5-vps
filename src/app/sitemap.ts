import type { MetadataRoute } from 'next';

const BASE_URL = 'https://gold-star-mt5-vps.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/terminal`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    ...['gold-star', 'gold-scalp-x', 'zone3', 'btc-swing-ea', 'expert-macd'].map((slug) => ({
      url: `${BASE_URL}/strategies/${slug}`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.85,
    })),
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];
}

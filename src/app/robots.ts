import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/terminal', '/privacy', '/terms'],
        disallow: ['/api/', '/profile'],
      },
    ],
    sitemap: 'https://gold-star-mt5-vps.vercel.app/sitemap.xml',
  };
}

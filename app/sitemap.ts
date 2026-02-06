import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://simplstudios.vercel.app'

  // Get all apps for dynamic routes
  const apps = await prisma.app.findMany({
    select: { slug: true, updatedAt: true },
  })

  const appUrls = apps.map((app) => ({
    url: `${baseUrl}/apps/${app.slug}`,
    lastModified: app.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/apps`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...appUrls,
  ]
}

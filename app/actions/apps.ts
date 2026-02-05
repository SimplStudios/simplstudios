'use server'

import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Helper to generate slug from name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

// Create a new app
export async function createApp(formData: FormData) {
    const name = formData.get('name') as string
    const tagline = formData.get('tagline') as string
    const description = formData.get('description') as string
    const icon = formData.get('icon') as string
    const color = formData.get('color') as string || 'blue'
    const status = formData.get('status') as string || 'coming-soon'
    const url = formData.get('url') as string || null

    // Parse arrays from form data
    const screenshotsStr = formData.get('screenshots') as string
    const featuresStr = formData.get('features') as string
    const platformsStr = formData.get('platforms') as string

    const screenshots = screenshotsStr ? screenshotsStr.split('\n').filter(s => s.trim()) : []
    const features = featuresStr ? featuresStr.split('\n').filter(s => s.trim()) : []
    const platforms = platformsStr ? platformsStr.split(',').map(s => s.trim()).filter(Boolean) : []

    // Generate slug
    const slug = generateSlug(name)

    // Check if slug already exists
    const existing = await prisma.app.findUnique({ where: { slug } })
    if (existing) {
        throw new Error('An app with this name already exists')
    }

    await prisma.app.create({
        data: {
            name,
            slug,
            tagline,
            description,
            icon,
            color,
            screenshots,
            features,
            status,
            url: url || null,
            platforms,
        }
    })

    revalidatePath('/admin')
    revalidatePath('/apps')
    redirect('/admin')
}

// Update an existing app
export async function updateApp(formData: FormData) {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const tagline = formData.get('tagline') as string
    const description = formData.get('description') as string
    const icon = formData.get('icon') as string
    const color = formData.get('color') as string || 'blue'
    const status = formData.get('status') as string || 'live'
    const url = formData.get('url') as string || null

    // Parse arrays from form data
    const screenshotsStr = formData.get('screenshots') as string
    const featuresStr = formData.get('features') as string
    const platformsStr = formData.get('platforms') as string

    const screenshots = screenshotsStr ? screenshotsStr.split('\n').filter(s => s.trim()) : []
    const features = featuresStr ? featuresStr.split('\n').filter(s => s.trim()) : []
    const platforms = platformsStr ? platformsStr.split(',').map(s => s.trim()).filter(Boolean) : []

    await prisma.app.update({
        where: { id },
        data: {
            name,
            tagline,
            description,
            icon,
            color,
            screenshots,
            features,
            status,
            url: url || null,
            platforms,
        }
    })

    revalidatePath('/admin')
    revalidatePath('/apps')
    redirect('/admin')
}

// Delete an app
export async function deleteApp(id: string) {
    await prisma.app.delete({ where: { id } })

    revalidatePath('/admin')
    revalidatePath('/apps')
    redirect('/admin')
}

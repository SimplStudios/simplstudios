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
    const logoUrl = formData.get('logoUrl') as string || null
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
            logoUrl: logoUrl || null,
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
    const logoUrl = formData.get('logoUrl') as string || null
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

    // Get the current app to check if name changed
    const currentApp = await prisma.app.findUnique({ where: { id } })
    if (!currentApp) throw new Error('App not found')

    // Check if name changed and generate new slug
    const newSlug = generateSlug(name)
    const slugChanged = currentApp.slug !== newSlug

    // If slug changed, update all related records
    if (slugChanged) {
        // Check if new slug is taken by another app
        const existingApp = await prisma.app.findUnique({ where: { slug: newSlug } })
        if (existingApp && existingApp.id !== id) {
            throw new Error('An app with this name already exists')
        }

        // Update related updates
        await prisma.update.updateMany({
            where: { appSlug: currentApp.slug },
            data: { appSlug: newSlug }
        })

        // Update related reviews
        await prisma.review.updateMany({
            where: { appSlug: currentApp.slug },
            data: { appSlug: newSlug }
        })

        // Update related testimonials
        await prisma.testimonial.updateMany({
            where: { appSlug: currentApp.slug },
            data: { appSlug: newSlug }
        })
    }

    await prisma.app.update({
        where: { id },
        data: {
            name,
            slug: newSlug,
            tagline,
            description,
            icon,
            logoUrl: logoUrl || null,
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
    revalidatePath(`/apps/${newSlug}`)
    if (slugChanged) {
        revalidatePath(`/apps/${currentApp.slug}`)
    }
    redirect('/admin')
}

// Delete an app
export async function deleteApp(id: string) {
    await prisma.app.delete({ where: { id } })

    revalidatePath('/admin')
    revalidatePath('/apps')
    redirect('/admin')
}

// Toggle pin status for an app
export async function toggleAppPin(id: string) {
    const app = await prisma.app.findUnique({ where: { id } })
    if (!app) throw new Error('App not found')

    // If pinning, get the next order number
    let pinnedOrder = null
    if (!app.pinned) {
        const maxOrder = await prisma.app.aggregate({
            where: { pinned: true },
            _max: { pinnedOrder: true }
        })
        pinnedOrder = (maxOrder._max.pinnedOrder ?? 0) + 1
    }

    await prisma.app.update({
        where: { id },
        data: {
            pinned: !app.pinned,
            pinnedOrder: !app.pinned ? pinnedOrder : null
        }
    })

    revalidatePath('/admin')
    revalidatePath('/apps')
    revalidatePath('/')
}

// Update pinned order for multiple apps
export async function updatePinnedOrder(updates: { id: string, order: number }[]) {
    await Promise.all(
        updates.map(({ id, order }) => 
            prisma.app.update({
                where: { id },
                data: { pinnedOrder: order }
            })
        )
    )

    revalidatePath('/admin')
    revalidatePath('/apps')
    revalidatePath('/')
}

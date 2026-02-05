'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAnnouncement(formData: FormData) {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as string || 'info'
    const priority = parseInt(formData.get('priority') as string) || 0
    const active = formData.get('active') === 'true'
    const expiresAtStr = formData.get('expiresAt') as string
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null

    await prisma.announcement.create({
        data: {
            title,
            content,
            type,
            priority,
            active,
            expiresAt
        }
    })

    revalidatePath('/admin/announcements')
    revalidatePath('/')
    redirect('/admin/announcements')
}

export async function updateAnnouncement(formData: FormData) {
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as string
    const priority = parseInt(formData.get('priority') as string) || 0
    const active = formData.get('active') === 'true'
    const expiresAtStr = formData.get('expiresAt') as string
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null

    await prisma.announcement.update({
        where: { id },
        data: {
            title,
            content,
            type,
            priority,
            active,
            expiresAt
        }
    })

    revalidatePath('/admin/announcements')
    revalidatePath('/')
    redirect('/admin/announcements')
}

export async function toggleAnnouncement(id: string) {
    const announcement = await prisma.announcement.findUnique({ where: { id } })
    if (!announcement) return

    await prisma.announcement.update({
        where: { id },
        data: { active: !announcement.active }
    })

    revalidatePath('/admin/announcements')
    revalidatePath('/')
}

export async function deleteAnnouncement(id: string) {
    await prisma.announcement.delete({ where: { id } })

    revalidatePath('/admin/announcements')
    revalidatePath('/')
    redirect('/admin/announcements')
}

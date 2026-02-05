'use server'

import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Create a new update/changelog entry
export async function createUpdate(formData: FormData) {
    const appSlug = formData.get('appSlug') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const version = formData.get('version') as string || null
    const type = formData.get('type') as string || 'update'

    await prisma.update.create({
        data: {
            appSlug,
            title,
            content,
            version,
            type,
        }
    })

    revalidatePath('/admin')
    revalidatePath('/admin/updates')
    revalidatePath('/updates')
    revalidatePath(`/apps/${appSlug}`)
    redirect('/admin/updates')
}

// Update an existing update entry
export async function updateUpdateEntry(formData: FormData) {
    const id = formData.get('id') as string
    const appSlug = formData.get('appSlug') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const version = formData.get('version') as string || null
    const type = formData.get('type') as string || 'update'

    await prisma.update.update({
        where: { id },
        data: {
            appSlug,
            title,
            content,
            version,
            type,
        }
    })

    revalidatePath('/admin')
    revalidatePath('/admin/updates')
    revalidatePath('/updates')
    revalidatePath(`/apps/${appSlug}`)
    redirect('/admin/updates')
}

// Delete an update entry
export async function deleteUpdate(id: string) {
    const update = await prisma.update.findUnique({ where: { id } })

    await prisma.update.delete({ where: { id } })

    revalidatePath('/admin')
    revalidatePath('/admin/updates')
    revalidatePath('/updates')
    if (update) {
        revalidatePath(`/apps/${update.appSlug}`)
    }
    redirect('/admin/updates')
}

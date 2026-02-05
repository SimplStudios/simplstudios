'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as string || 'announcement'
    const imageUrl = formData.get('imageUrl') as string | null
    const pinned = formData.get('pinned') === 'on'

    await prisma.post.create({
        data: {
            title,
            content,
            type,
            imageUrl: imageUrl || null,
            pinned
        }
    })

    revalidatePath('/admin/posts')
    revalidatePath('/')
    redirect('/admin/posts')
}

export async function updatePost(formData: FormData) {
    const id = formData.get('id') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const type = formData.get('type') as string
    const imageUrl = formData.get('imageUrl') as string | null
    const pinned = formData.get('pinned') === 'on'

    await prisma.post.update({
        where: { id },
        data: {
            title,
            content,
            type,
            imageUrl: imageUrl || null,
            pinned
        }
    })

    revalidatePath('/admin/posts')
    revalidatePath('/')
    redirect('/admin/posts')
}

export async function togglePinPost(id: string) {
    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) return

    await prisma.post.update({
        where: { id },
        data: { pinned: !post.pinned }
    })

    revalidatePath('/admin/posts')
    revalidatePath('/')
}

export async function deletePost(id: string) {
    await prisma.post.delete({ where: { id } })

    revalidatePath('/admin/posts')
    revalidatePath('/')
    redirect('/admin/posts')
}

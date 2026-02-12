'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Create a new user message/feedback
export async function createUserMessage(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string
    const type = formData.get('type') as string || 'feedback'

    if (!name || !email || !subject || !message) {
        return { error: 'All fields are required' }
    }

    // Basic email validation
    if (!email.includes('@') || !email.includes('.')) {
        return { error: 'Please enter a valid email address' }
    }

    try {
        // @ts-ignore - Prisma types available after migration
        await prisma.userMessage.create({
            data: {
                name,
                email,
                subject,
                message,
                type,
                status: 'unread'
            }
        })

        return { success: true }
    } catch (error) {
        console.error('[Messages] Error creating message:', error)
        return { error: 'Failed to send message. Please try again.' }
    }
}

// Admin: Get all messages
export async function getMessages() {
    // @ts-ignore - Prisma types available after migration
    return await prisma.userMessage.findMany({
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
    })
}

// Admin: Mark message as read
export async function markMessageRead(id: string) {
    // @ts-ignore - Prisma types available after migration
    await prisma.userMessage.update({
        where: { id },
        data: { status: 'read' }
    })
    revalidatePath('/admin/messages')
}

// Admin: Reply to message
export async function replyToMessage(formData: FormData) {
    const id = formData.get('id') as string
    const reply = formData.get('reply') as string

    if (!reply) {
        return
    }

    // @ts-ignore - Prisma types available after migration
    await prisma.userMessage.update({
        where: { id },
        data: {
            adminReply: reply,
            repliedAt: new Date(),
            status: 'replied'
        }
    })

    revalidatePath('/admin/messages')
}

// Admin: Mark as resolved
export async function resolveMessage(id: string) {
    // @ts-ignore - Prisma types available after migration
    await prisma.userMessage.update({
        where: { id },
        data: { status: 'resolved' }
    })
    revalidatePath('/admin/messages')
}

// Admin: Delete message
export async function deleteMessage(id: string) {
    // @ts-ignore - Prisma types available after migration
    await prisma.userMessage.delete({
        where: { id }
    })
    revalidatePath('/admin/messages')
}

// Site Status Management
export async function getSiteStatus() {
    // @ts-ignore - Prisma types available after migration
    const status = await prisma.siteStatus.findFirst({
        orderBy: { updatedAt: 'desc' }
    })
    return status
}

export async function updateSiteStatus(formData: FormData) {
    const title = formData.get('title') as string
    const message = formData.get('message') as string
    const type = formData.get('type') as string || 'maintenance'
    const isActive = formData.get('isActive') === 'true'
    const estimatedFix = formData.get('estimatedFix') as string || null

    // @ts-ignore - Prisma types available after migration
    const existing = await prisma.siteStatus.findFirst()

    if (existing) {
        // @ts-ignore - Prisma types available after migration
        await prisma.siteStatus.update({
            where: { id: existing.id },
            data: { title, message, type, isActive, estimatedFix }
        })
    } else {
        // @ts-ignore - Prisma types available after migration
        await prisma.siteStatus.create({
            data: { title, message, type, isActive, estimatedFix }
        })
    }

    revalidatePath('/admin/status')
    revalidatePath('/')
}

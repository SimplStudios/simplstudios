'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Approve a review
export async function approveReview(id: string) {
    await prisma.review.update({
        where: { id },
        data: { approved: true }
    })

    revalidatePath('/admin/reviews')
}

// Reject (unapprove) a review
export async function rejectReview(id: string) {
    await prisma.review.update({
        where: { id },
        data: { approved: false }
    })

    revalidatePath('/admin/reviews')
}

// Toggle featured status of a review
export async function toggleFeatureReview(id: string) {
    const review = await prisma.review.findUnique({ where: { id } })

    if (!review) {
        throw new Error('Review not found')
    }

    await prisma.review.update({
        where: { id },
        data: { featured: !review.featured }
    })

    revalidatePath('/admin/reviews')
    revalidatePath('/')
}

// Respond to a review
export async function respondToReview(id: string, response: string) {
    await prisma.review.update({
        where: { id },
        data: {
            adminResponse: response,
            respondedAt: new Date()
        }
    })

    revalidatePath('/admin/reviews')
}

// Delete a review
export async function deleteReview(id: string) {
    await prisma.review.delete({ where: { id } })

    revalidatePath('/admin/reviews')
}

// Create a review (from public form)
export async function createReview(formData: FormData) {
    const appSlug = formData.get('appSlug') as string || null
    const author = formData.get('author') as string
    const email = formData.get('email') as string || null
    const content = formData.get('content') as string
    const rating = parseInt(formData.get('rating') as string) || 5

    await prisma.review.create({
        data: {
            appSlug,
            author,
            email,
            content,
            rating,
            approved: false,
            featured: false,
        }
    })

    revalidatePath('/admin/reviews')
}

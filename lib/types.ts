// App type from database
export interface App {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  icon: string
  color: string
  screenshots: string[]
  features: string[]
  status: string
  url: string | null
  platforms: string[]
  createdAt: Date
  updatedAt: Date
  reviews?: Review[]
}

// Update type from database
export interface Update {
  id: string
  appSlug: string
  title: string
  content: string
  version: string | null
  type: string
  createdAt: Date
}

// Testimonial type from database
export interface Testimonial {
  id: string
  appSlug: string | null
  author: string
  role: string | null
  avatar: string | null
  content: string
  rating: number
  featured: boolean
  createdAt: Date
}

// Post type for message board (replaces Announcement)
export interface Post {
  id: string
  title: string
  content: string
  type: 'announcement' | 'update' | 'release' | 'news'
  imageUrl?: string | null
  pinned: boolean
  createdAt: Date
  updatedAt: Date
  comments?: Comment[]
  likes?: PostLike[]
  _count?: {
    comments: number
    likes: number
  }
}

// Comment on a post
export interface Comment {
  id: string
  postId: string
  author: string
  content: string
  createdAt: Date
}

// Like on a post
export interface PostLike {
  id: string
  postId: string
  sessionId: string
  createdAt: Date
}

// Review type from database (with admin response)
export interface Review {
  id: string
  appSlug: string
  author: string
  email: string | null
  content: string
  rating: number
  approved: boolean
  featured: boolean
  adminResponse: string | null
  respondedAt: Date | null
  createdAt: Date
}

# SimplStudios

A modern web platform for SimplStudios apps, updates, and community engagement. Built with Next.js 15, React 19, and Prisma.

## Features

- **App Showcase** - Display and manage all SimplStudios applications
- **Admin Dashboard** - Secure admin panel for content management
- **App Pinning** - Pin featured apps to the top of listings
- **Updates Feed** - Publish and track app updates
- **Reviews System** - User reviews and ratings for apps
- **Message Board** - Community posts with likes and comments
- **The Vault** - Secure developer access with key-based authentication
- **Dark Theme** - Modern slate/violet design system

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Fonts**: Outfit, Plus Jakarta Sans, Rubik

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon account)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SimplStudios/simplstudios.git
   cd simplstudios
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with:
   ```
   DATABASE_URL="your-postgresql-connection-string"
   ```

4. Push the database schema:
   ```bash
   npx prisma db push
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── page.tsx              # Homepage
├── about/                # About page
├── apps/                 # Public apps listing
├── updates/              # Updates feed
├── admin/                # Admin dashboard
│   ├── apps/             # App management
│   ├── posts/            # Message board management
│   ├── reviews/          # Review moderation
│   ├── updates/          # Updates management
│   └── vault/            # Vault admin
├── actions/              # Server actions
└── api/                  # API routes

components/
├── ui/                   # shadcn/ui components
├── AppCard.tsx           # App display cards
├── Navbar.tsx            # Navigation
├── Footer.tsx            # Footer
└── ...                   # Other components

lib/
├── db.ts                 # Prisma client
├── auth.ts               # Authentication utilities
├── types.ts              # TypeScript types
└── utils.ts              # Utility functions

prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Database seeding
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The app is configured for deployment on Vercel. Push to the main branch to trigger automatic deployments.

## License

Proprietary - SimplStudios Inc.

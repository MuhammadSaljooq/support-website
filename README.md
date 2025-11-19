# Support Website

A Next.js 14 project with TypeScript, Tailwind CSS, and shadcn/ui components.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **NextAuth** - Authentication
- **Prisma** - Database ORM
- **Stripe** - Payment processing
- **Recharts** - Chart library
- **Lucide React** - Icon library

## Project Structure

```
/app
  /(auth)          # Authentication route group
    /login
  /(dashboard)     # Dashboard route group
    /dashboard
/components
  /ui              # shadcn/ui components
  /landing         # Landing page components
  /dashboard       # Dashboard components
/lib
  /utils.ts        # Utility functions
  /db.ts           # Prisma client
  /auth.ts         # NextAuth configuration
  /stripe.ts       # Stripe client
/prisma
  /schema.prisma   # Database schema
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables in `.env.local`:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - A random secret for NextAuth
   - `NEXTAUTH_URL` - Your application URL
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Adding shadcn/ui Components

To add shadcn/ui components, use:
```bash
npx shadcn-ui@latest add [component-name]
```

For example:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
```


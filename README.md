# Katina Responsibility Calendar

A Next.js reservation system for managing daily Katina responsibilities. Public users can reserve available daily events without login, while admins can view, edit, delete, backup, and restore reservation data.

## Features

- Public calendar view
- Four daily responsibility slots
- Reservation available only from July 29, 2026 to October 25, 2026
- No public login or signup required
- Admin login with predefined credentials
- Admin dashboard with statistics
- Upcoming 7-day reservation overview
- Search and filters by date, month, event, name, batch, and phone
- Admin edit and delete with confirmation popups
- Manual JSON backup and restore
- Restore keeps current data as priority and only imports missing records
- PostgreSQL database with Prisma ORM
- Apple-inspired liquid glass UI

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Zod
- JWT with HTTP-only cookies
- Lucide React icons

## Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/db-name?schema=public"

ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin-password"
JWT_SECRET="replace-with-a-secure-secret"

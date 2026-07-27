# AGENTS.md

# TriDuty

**Version:** 1.0

**Project Type:** Full Stack Next.js Application

**Primary Goal:** Build a modern, Apple-inspired responsibility scheduling web application where community members can reserve one of three daily responsibilities without creating an account.

---

# Project Vision

TriDuty is designed to be an elegant, minimal, and highly intuitive scheduling application.

The application should feel closer to an Apple product than a traditional business management system.

Every design and engineering decision should prioritise:

* Simplicity
* Performance
* Consistency
* Accessibility
* Maintainability
* Premium User Experience

The application is intended to be portfolio-quality rather than simply functional.

---

# Core Concept

Every calendar day contains exactly **three predefined responsibilities (events).**

Visitors can:

* Browse the calendar
* View available responsibilities
* Reserve an available responsibility
* Submit their personal information

No public authentication is required.

Once reserved, a responsibility becomes unavailable.

Only administrators may edit or delete reservations.

---

# Primary Users

## Public User

No login required.

Capabilities:

* View calendar
* Browse months
* View daily availability
* Reserve an available responsibility
* Submit:

  * Name
  * Phone Number
  * Address

Restrictions:

* Cannot edit reservation
* Cannot delete reservation
* Cannot view other users' information
* Cannot access dashboard

---

## Administrator

Authentication required.

Capabilities:

* Login
* Dashboard
* View all reservations
* Edit reservations
* Delete reservations
* View statistics
* Search reservations
* Filter reservations
* Export data (future enhancement)

Credentials are predefined through environment variables.

No registration functionality exists.

---

# Functional Requirements

## Public Calendar

Display one month at a time.

Each day appears as a glass card.

Each day displays three availability indicators.

Example:

● ● ○

Meaning:

Green = Available

Red = Reserved

Users should immediately understand remaining availability without opening the day.

---

## Reservation Flow

User selects a day.

↓

User selects an available responsibility.

↓

Reservation form opens.

↓

User enters:

* Name
* Phone Number
* Address

↓

Server validates request.

↓

Reservation is stored.

↓

Calendar updates immediately.

---

## Reservation Rules

Only one reservation per responsibility.

Exactly three responsibilities exist per day.

Past dates cannot be reserved.

Already reserved responsibilities cannot be reserved again.

Validation must always occur on the server.

Never trust client-side validation.

---

# Admin Dashboard

Dashboard contains:

* Statistics cards
* Recent reservations
* Calendar overview
* Reservation management
* Search
* Filters

Statistics include:

* Total reservations
* Reservations today
* Reservations this month
* Available responsibilities
* Occupancy percentage

---

# Technology Stack

Framework

* Next.js 15
* App Router
* TypeScript

UI

* Tailwind CSS
* shadcn/ui
* Framer Motion
* Lucide Icons

Backend

* Next.js Route Handlers

Database

* PostgreSQL (Neon)

ORM

* Prisma

Validation

* Zod
* React Hook Form

Authentication

* JWT
* HTTP-only Cookies

Deployment

* Vercel

---

# Project Structure

src/

```
app/
    (public)/
    admin/
    api/

components/
    ui/
    layout/

features/
    calendar/
    reservation/
    dashboard/
    authentication/

hooks/

services/

repositories/

validators/

lib/

constants/

types/

prisma/
```

---

# Architecture

Presentation Layer

↓

Feature Layer

↓

Service Layer

↓

Repository Layer

↓

Database

Business logic must never exist inside React components.

API route handlers should remain thin.

Repositories should only communicate with Prisma.

---

# Design Language

The application follows an Apple-inspired Liquid Glass design system.

Guidelines:

* Frosted glass surfaces
* Soft blur
* Rounded corners
* Thin borders
* Large spacing
* Minimal colour usage
* Elegant typography
* Smooth animations

Avoid:

* Heavy shadows
* Sharp corners
* Excessive gradients
* Bright colours
* Visual clutter

---

# UI Principles

Every interface should communicate only what is necessary.

Whitespace is considered a design element.

Animations should feel natural rather than decorative.

Consistency is more important than novelty.

---

# Colour Philosophy

Primary

Apple Blue

Success

Apple Green

Danger

Apple Red

Neutral

Soft greys

Glass

Semi-transparent white

Never introduce random colours.

---

# Typography

Primary Font

Geist

Hierarchy

Display

Heading

Title

Body

Caption

Typography should remain consistent throughout the application.

---

# Animation Principles

Animations should:

Improve understanding

Guide attention

Provide feedback

Never distract the user.

Use Framer Motion.

Avoid excessive movement.

---

# Component Strategy

Reusable components should be preferred over duplication.

Examples:

GlassCard

GlassButton

GlassInput

GlassBadge

GlassDialog

GlassNavbar

GlassSidebar

StatCard

CalendarDayCard

AvailabilityIndicator

ReservationCard

Do not duplicate component implementations.

---

# Feature Modules

Each feature owns:

Components

Hooks

Services

Types

Validation

Example:

features/calendar/

components/

hooks/

types/

service.ts

validator.ts

---

# API Design

Public

GET /api/calendar

GET /api/reservations/{date}

POST /api/reservations

Admin

POST /api/admin/login

POST /api/admin/logout

GET /api/admin/dashboard

GET /api/admin/reservations

PUT /api/admin/reservations/{id}

DELETE /api/admin/reservations/{id}

---

# Database

Reservation

id

date

eventNumber

name

phone

address

createdAt

updatedAt

Only one reservation may exist for:

(date + eventNumber)

Enforce this using a unique database constraint.

---

# Authentication

Public users are anonymous.

Admin authentication uses:

JWT

HTTP-only cookies

Credentials stored inside environment variables.

No user registration exists.

---

# Error Handling

Never expose internal errors.

Always return structured API responses.

Every error response should include:

success

message

optional validation errors

---

# Validation Rules

Validate on both client and server.

Required:

Name

Phone

Address

Date

Event Number

Phone numbers should be normalised before storage.

---

# Coding Standards

Use strict TypeScript.

Avoid any.

Prefer named exports.

Prefer composition over inheritance.

Avoid duplicated code.

Keep functions small.

Keep files focused.

Do not mix business logic with presentation.

---

# Naming Conventions

Components

PascalCase

Functions

camelCase

Variables

camelCase

Constants

UPPER_SNAKE_CASE

Types

PascalCase

Interfaces

PascalCase

---

# Git Strategy

Feature branches

feature/calendar

feature/reservations

feature/admin-dashboard

Commit messages

feat:

fix:

refactor:

style:

docs:

---

# Performance Goals

Optimise images.

Prefer Server Components.

Minimise Client Components.

Avoid unnecessary re-renders.

Keep bundle size small.

Lazy load where appropriate.

---

# Accessibility

Keyboard navigation required.

Visible focus states.

Semantic HTML.

Accessible labels.

Sufficient colour contrast.

---

# Future Enhancements

CSV export

Excel export

Dark Mode

Multiple administrators

Audit logs

Analytics

SMS reminders

Email notifications

PWA support

Offline mode

---

# Development Philosophy

This project prioritises:

Quality over speed.

Maintainability over cleverness.

Consistency over experimentation.

Every new feature should integrate naturally into the existing architecture and design system.

When implementing functionality, first consider whether an existing component, service, or pattern can be reused before introducing new abstractions.

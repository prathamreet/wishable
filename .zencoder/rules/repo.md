---
description: Repository Information Overview
alwaysApply: true
---

# Wishable Information

## Summary
Wishable is a comprehensive wishlist management platform that allows users to save, organize, and track products from various e-commerce websites. It works across multiple shopping platforms, providing a single destination to manage desired products.

## Structure
- **src/app**: Next.js app directory containing pages and API routes
- **src/components**: React components for UI elements
- **src/contexts**: React context providers for state management
- **src/lib**: Utility functions and core services
- **src/models**: MongoDB data models
- **src/scraper**: Product scraping functionality for e-commerce sites
- **public**: Static assets including images and favicons

## Language & Runtime
**Language**: JavaScript (React, Node.js)
**Version**: Node.js v18+ required
**Framework**: Next.js 15.2.3
**Build System**: Next.js build system
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- next: ^15.2.3 - React framework
- react: ^19.0.0 - UI library
- react-dom: ^19.0.0 - DOM rendering for React
- mongoose: ^8.12.2 - MongoDB ODM
- axios: ^1.8.4 - HTTP client
- cheerio: ^1.0.0 - HTML parsing for scraping
- jsonwebtoken: ^9.0.2 - JWT authentication
- bcryptjs: ^3.0.2 - Password hashing
- tailwindcss: ^3.3.0 - CSS framework

**Development Dependencies**:
- eslint: ^9 - Code linting
- eslint-config-next: 15.2.3 - Next.js ESLint configuration

## Build & Installation
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start
```

## Database
**Type**: MongoDB
**Connection**: Configured via MONGODB_URI environment variable
**Models**:
- User: Stores user profiles and wishlist items
- Wishlist items are embedded within the User model

## Authentication
**Method**: JWT (JSON Web Tokens)
**Configuration**: JWT_SECRET environment variable
**Token Expiration**: 30 days with rotation

## API Endpoints
**Authentication**:
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login and get JWT token

**User Profile**:
- GET /api/user/profile - Get user profile data
- PUT /api/user/profile - Update user profile information

**Wishlist**:
- GET /api/wishlist - Get all wishlist items
- POST /api/wishlist - Add new item to wishlist
- DELETE /api/wishlist/{id} - Remove item from wishlist

## Scraper
**Supported Sites**: Amazon, Flipkart, Myntra, Ajio, Nykaa, Zara, Steam, Epic Games
**Features**:
- Product details extraction (name, price, image, description)
- Structured data parsing
- Rate limiting and retry mechanisms
- Batch scraping with concurrency control

## Deployment
**Platform**: Vercel
**Configuration**: vercel.json for deployment settings
**Environment Variables**:
- MONGODB_URI: MongoDB connection string
- JWT_SECRET: Secret key for JWT authentication
- NODE_ENV: Environment (development/production)
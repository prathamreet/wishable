# Wishable

Wishable is a universal e-commerce wishlist manager that allows users to save, organize, and track products from multiple shopping platforms in one place.

## Features

- Universal Product Saving: Save items from any supported e-commerce site.
- Organization: Categorize and sort your saved products.
- Price Tracking: Monitor price updates for your saved items.
- User Profiles: Create a profile and share your wishlist with others.

## Technical Stack

- Frontend: Next.js (React, Tailwind CSS)
- Backend: Next.js API Routes
- Database: MongoDB (Mongoose)
- Authentication: JWT

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/wishable.git
   cd wishable
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a .env.local file in the root directory and add the variables listed in .env.example.

4. Run the development server:
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000.

## Deployment

The project is optimized for deployment on Vercel. Connect your GitHub repository to Vercel and configure the environment variables as required.

## Project Structure

- src/app: Next.js App Router (pages and API routes)
- src/components: Shared React components
- src/lib: Utility functions and scrapers
- src/models: Database models
- public: Static assets

## License

This project is licensed under the MIT License.

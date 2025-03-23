# Wishable - Universal E-commerce Wishlist Manager

![Wishable Logo](https://via.placeholder.com/150x150?text=Wishable)

## 📋 Overview

Wishable is a comprehensive wishlist management platform that allows users to save, organize, and track products from various e-commerce websites. Unlike traditional site-specific wishlists, Wishable works across dozens of popular shopping platforms, giving you a single destination to manage all your desired products.



## 🔧 Technical Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB database

### Installation

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/wishable.git
   cd wishable
   ```

2. **Install dependencies**
   ```
   npm install
   ```

3. **Create environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. **Run the development server**
   ```
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 How to Use Wishable

### 1. Creating an Account

1. Click on the "Sign Up" button on the homepage.
2. Fill in your details (name, email, password).
3. Verify your email (if enabled).
4. Log in with your credentials.

### 2. Adding Products to Your Wishlist

1. Click on the "Add Product" button in your dashboard.
2. Paste the URL of any product from a supported e-commerce website.
3. Click "Add to Wishlist" to save the product.

### 3. Managing Your Wishlist

1. View all your saved products in the dashboard.
2. Filter products by category, site, or custom filters.
3. Sort products by price, name, or date added.
4. Remove items by clicking the delete button.

### 4. Customizing Your Profile

1. Navigate to your profile page via the sidebar.
2. Update your display name, profile picture, and contact information.
3. Manage privacy settings for your contact details.

### 5. Sharing Your Wishlist

1. Visit your profile page.
2. Copy your unique profile URL.
3. Share this URL with friends and family.

## 🔒 Privacy & Security

- Your wishlist can be public or private based on your preferences.
- Contact information visibility can be toggled.
- All authentication is secured with JWT tokens.
- Passwords are securely hashed and never stored in plain text.

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### User Profile
- `GET /api/user/profile` - Get user profile data
- `PUT /api/user/profile` - Update user profile information

### Wishlist
- `GET /api/wishlist` - Get all wishlist items
- `POST /api/wishlist` - Add new item to wishlist
- `DELETE /api/wishlist/{id}` - Remove item from wishlist

## 🐞 Troubleshooting

### Common Issues

1. **Product information not loading**
   - Ensure the product URL is correct
   - Some e-commerce sites block scraping attempts
   - Try refreshing the page or adding the product again

2. **Can't log in**
   - Check if your email and password are correct
   - Clear browser cookies and try again
   - Reset your password if necessary

### Error Messages

- **"This site is not supported"**: The e-commerce site you're trying to add isn't currently supported.
- **"Access denied by website"**: The website is blocking our scraper. Try adding a different product.
- **"Product not found"**: The URL might be invalid or the product might be unavailable.

## 📝 Development Notes

### Project Structure

```
wishable/
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── api/           # API endpoints
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Dashboard pages
│   │   └── profile/       # Profile pages
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utility functions
│   │   └── scraper.js     # E-commerce scraper
│   └── models/            # Database models
├── public/                # Static assets
├── .env.local             # Environment variables
└── package.json           # Dependencies
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Introduction](https://jwt.io/introduction)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👥 Team

- [Your Name](https://github.com/yourusername) - Lead Developer

## 🙏 Acknowledgements

- Thanks to all the e-commerce platforms that make their product information accessible.
- Special thanks to the Next.js and MongoDB teams for their amazing technologies.

---


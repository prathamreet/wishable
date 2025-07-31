import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ToastProvider } from "../contexts/ToastContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "wishAble - Create & Share Wishlists from Any Online Store",
  description:
    "Create beautiful wishlists and add products from any ecommerce site. Share your wishlist with friends and family, track prices, and never forget what you want. Works with Amazon, Flipkart, and 1000+ online stores.",
  keywords:
    "wishlist app, online wishlist, ecommerce wishlist, product wishlist, gift list, shopping list, wishlist sharing, price tracking, universal wishlist, amazon wishlist, flipkart wishlist",
  authors: [{ name: "Pratham Reet" }],
  creator: "Pratham Reet",
  publisher: "Pratham Reet",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body
        className={`${inter.variable} antialiased transition-colors duration-300`}
      >
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

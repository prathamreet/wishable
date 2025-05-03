import { Inter } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

export const metadata = {
    title: 'Wishable - Track Prices Across Online Stores',
    description: 'Create and share wishlists with price tracking for products from all your favorite online stores.',
};

export const viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    ],
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="h-full scroll-smooth">
            <body className={`${inter.variable} antialiased h-full transition-colors duration-300`}>
                <ThemeProvider>
                    <ToastProvider>
                        <AuthProvider>
                            <div className="min-h-screen flex flex-col">
                                <Navbar />
                                <main className="flex-grow pt-16">{children}</main>
                                <Footer />
                            </div>
                        </AuthProvider>
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

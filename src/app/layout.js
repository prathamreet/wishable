import { Inter } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ThemeProvider } from '../contexts/ThemeContext'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export const metadata = {
    title: 'Wishable - Track Prices Across Online Stores',
    description: 'Create and share wishlists with price tracking for products from all your favorite online stores.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.variable} antialiased h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}>
                <ThemeProvider>
                    <AuthProvider>
                        <div className="min-h-screen flex flex-col">
                            <Navbar />
                            <main className="flex-grow">{children}</main>
                            <Footer />
                        </div>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-light-text dark:text-dark-text">About Wishable</h1>
      
      <div className="card p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">Our Mission</h2>
            <p className="text-light-text/70 dark:text-dark-text/70 mb-4">
              At Wishable, we believe shopping should be smart, simple, and stress-free. Our mission is to help you track the products you love across any website, notify you of price drops, and help you make informed purchasing decisions.
            </p>
            <p className="text-light-text/70 dark:text-dark-text/70">
              Whether you&apos;re saving for a big purchase, hunting for the best deal, or just keeping an eye on your favorite products, Wishable is your personal shopping assistant that works across the entire internet.
            </p>
          </div>
          <div className="md:w-1/2 relative h-64 w-full rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-700/20 rounded-lg flex items-center justify-center">
              <div className="text-center p-6">
                <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300">Track. Save. Shop Smart.</h3>
                <p className="text-light-text/80 dark:text-dark-text/80 mt-2">Your universal wishlist solution</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 text-light-text dark:text-dark-text">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-light-text dark:text-dark-text">Add Products</h3>
            <p className="text-light-text/70 dark:text-dark-text/70">
              Simply paste the URL of any product from supported websites into your wishlist.
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-light-text dark:text-dark-text">Track Automatically</h3>
            <p className="text-light-text/70 dark:text-dark-text/70">
              We monitor prices and availability, keeping your wishlist up to date.
            </p>
          </div>
          
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-light-text dark:text-dark-text">Get Notified</h3>
            <p className="text-light-text/70 dark:text-dark-text/70">
              Receive alerts when prices drop or items come back in stock.
            </p>
          </div>
        </div>
      </div>
      
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 text-light-text dark:text-dark-text">Supported Sites</h2>
        <p className="text-light-text/70 dark:text-dark-text/70 mb-6">
          Wishable works with hundreds of popular shopping sites across multiple categories:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
            <h3 className="font-medium text-sm mb-2 text-light-text dark:text-dark-text">E-commerce</h3>
            <ul className="text-sm text-light-text/70 dark:text-dark-text/70 space-y-1">
              <li>Amazon</li>
              <li>eBay</li>
              <li>Walmart</li>
              <li>Target</li>
              <li>Best Buy</li>
            </ul>
          </div>
          
          <div className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
            <h3 className="font-medium text-sm mb-2 text-light-text dark:text-dark-text">Fashion</h3>
            <ul className="text-sm text-light-text/70 dark:text-dark-text/70 space-y-1">
              <li>ASOS</li>
              <li>Zara</li>
              <li>H&M</li>
              <li>Nike</li>
              <li>Adidas</li>
            </ul>
          </div>
          
          <div className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
            <h3 className="font-medium text-sm mb-2 text-light-text dark:text-dark-text">Tech</h3>
            <ul className="text-sm text-light-text/70 dark:text-dark-text/70 space-y-1">
              <li>Apple</li>
              <li>Samsung</li>
              <li>Dell</li>
              <li>HP</li>
              <li>Newegg</li>
            </ul>
          </div>
          
          <div className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
            <h3 className="font-medium text-sm mb-2 text-light-text dark:text-dark-text">Gaming</h3>
            <ul className="text-sm text-light-text/70 dark:text-dark-text/70 space-y-1">
              <li>Steam</li>
              <li>Epic Games</li>
              <li>PlayStation Store</li>
              <li>Xbox Store</li>
              <li>Nintendo eShop</li>
            </ul>
          </div>
        </div>
        
        <p className="text-light-text/70 dark:text-dark-text/70 mt-4 text-sm">
          And many more! If you find a site that doesn&apos;t work, please let us know.
        </p>
      </div>
      
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6 text-light-text dark:text-dark-text">Our Team</h2>
        <p className="text-light-text/70 dark:text-dark-text/70 mb-6">
          Wishable was created by a small team of developers and shopping enthusiasts who wanted a better way to track products across the web.
        </p>
        
        <div className="flex justify-center">
          <div className="text-center max-w-sm">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-medium text-light-text dark:text-dark-text">The Wishable Team</h3>
            <p className="text-sm text-light-text/70 dark:text-dark-text/70 mt-2">
              We&apos;re passionate about creating tools that make online shopping better for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
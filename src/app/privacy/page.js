export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-light-text dark:text-dark-text">Privacy Policy</h1>
      
      <div className="card p-6 prose dark:prose-invert max-w-none">
        <p className="text-sm text-light-text/70 dark:text-dark-text/70 mb-6">
          Last updated: June 1, 2023
        </p>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">Introduction</h2>
          <p className="mb-4">
            Wishable (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
          <p>
            Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you have read, understood, and agree to be bound by all the terms outlined in this policy.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">Information We Collect</h2>
          
          <h3 className="text-lg font-medium mb-2 text-light-text dark:text-dark-text">Personal Information</h3>
          <p className="mb-4">
            We may collect personal information that you voluntarily provide to us when you register for an account, express interest in obtaining information about us or our products and services, or otherwise contact us. The personal information we collect may include:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Username and password</li>
            <li>Profile information</li>
            <li>Content of communications with us</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-2 text-light-text dark:text-dark-text">Wishlist Information</h3>
          <p className="mb-4">
            When you use our service to track products, we collect information about the items you add to your wishlist, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Product URLs</li>
            <li>Product names, prices, and images</li>
            <li>Price history</li>
            <li>Your notes and preferences for each item</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-2 text-light-text dark:text-dark-text">Automatically Collected Information</h3>
          <p className="mb-4">
            When you access our service, we may automatically collect certain information about your device and usage patterns, including:
          </p>
          <ul className="list-disc pl-6">
            <li>Device type, operating system, and browser information</li>
            <li>IP address and general location</li>
            <li>Pages visited and features used</li>
            <li>Time spent on the service</li>
            <li>Referring websites</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect for various purposes, including to:
          </p>
          <ul className="list-disc pl-6">
            <li>Provide, maintain, and improve our services</li>
            <li>Create and manage your account</li>
            <li>Track product prices and availability for your wishlist items</li>
            <li>Send notifications about price changes and availability</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Understand how users interact with our service</li>
            <li>Detect, prevent, and address technical issues</li>
            <li>Protect against harmful or illegal activity</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">Sharing Your Information</h2>
          <p className="mb-4">
            We may share your information in the following situations:
          </p>
          <ul className="list-disc pl-6">
            <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, and contractors who perform services for us.</li>
            <li><strong>For Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
            <li><strong>With Your Consent:</strong> We may disclose your information for any other purpose with your consent.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security of your data.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">Your Privacy Rights</h2>
          <p className="mb-4">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6">
            <li>The right to access the personal information we have about you</li>
            <li>The right to request correction of inaccurate information</li>
            <li>The right to request deletion of your personal information</li>
            <li>The right to opt-out of certain data sharing practices</li>
            <li>The right to withdraw consent where processing is based on consent</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@wishable.com.
          </p>
        </section>
      </div>
    </div>
  );
}
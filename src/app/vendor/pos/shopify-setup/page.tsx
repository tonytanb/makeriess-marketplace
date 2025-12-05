'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function ShopifySetupPage() {
  const router = useRouter();
  const [shopDomain, setShopDomain] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!shopDomain) {
      setError('Shop domain is required');
      return;
    }

    // Validate shop domain format
    const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!cleanDomain.includes('.myshopify.com') && !cleanDomain.match(/^[a-zA-Z0-9-]+$/)) {
      setError('Please enter a valid Shopify shop domain (e.g., your-store.myshopify.com or your-store)');
      return;
    }

    // Construct full domain if needed
    const fullDomain = cleanDomain.includes('.myshopify.com') 
      ? cleanDomain 
      : `${cleanDomain}.myshopify.com`;

    // Redirect to Shopify OAuth
    const clientId = process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID || 'YOUR_SHOPIFY_CLIENT_ID';
    const redirectUri = `${window.location.origin}/vendor/pos/callback`;
    const scopes = 'read_products,read_inventory';
    
    const oauthUrl = `https://${fullDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=SHOPIFY:${fullDomain}`;
    
    window.location.href = oauthUrl;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to POS Connections</span>
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛍️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Shopify</h1>
          <p className="text-gray-600">
            Enter your Shopify store domain to connect your products
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="shopDomain" className="block text-sm font-medium text-gray-700 mb-2">
              Shop Domain
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="shopDomain"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your-store"
                required
              />
              <span className="text-gray-600">.myshopify.com</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter your Shopify store name (e.g., &quot;your-store&quot; for your-store.myshopify.com)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens next:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>You&apos;ll be redirected to Shopify to authorize Makeriess</li>
              <li>Grant permission to read your products and inventory</li>
              <li>You&apos;ll be redirected back to complete the connection</li>
              <li>Your products will automatically sync</li>
            </ol>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            Continue to Shopify
          </button>
        </form>
      </div>
    </div>
  );
}

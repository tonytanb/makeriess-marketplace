'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link2, AlertCircle, CheckCircle } from 'lucide-react';
import { POSConnectionCard } from '@/components/vendor/POSConnectionCard';
import { SyncLogsTable } from '@/components/vendor/SyncLogsTable';
import {
  usePOSConnection,
  useConnectPOS,
  useSyncPOSProducts,
  useSyncLogs,
  useDisconnectPOS,
} from '@/lib/hooks/useVendors';

// TODO: Get vendorId from auth context
const VENDOR_ID = 'vendor_123';

// OAuth redirect URLs for each provider
const getOAuthURL = (provider: 'SQUARE' | 'TOAST' | 'SHOPIFY') => {
  const redirectUri = `${window.location.origin}/vendor/pos/callback`;
  
  switch (provider) {
    case 'SQUARE':
      const squareClientId = process.env.NEXT_PUBLIC_SQUARE_CLIENT_ID || 'YOUR_SQUARE_CLIENT_ID';
      return `https://connect.squareup.com/oauth2/authorize?client_id=${squareClientId}&scope=MERCHANT_PROFILE_READ+ITEMS_READ+INVENTORY_READ&redirect_uri=${encodeURIComponent(redirectUri)}&state=SQUARE`;
    
    case 'TOAST':
      // Toast uses a different OAuth flow - typically requires manual setup
      return `/vendor/pos/toast-setup`;
    
    case 'SHOPIFY':
      // Shopify requires shop domain input first
      return `/vendor/pos/shopify-setup`;
    
    default:
      return '#';
  }
};

export default function POSConnectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { data: posConnection, isLoading: isLoadingConnection } = usePOSConnection(VENDOR_ID);
  const { data: syncLogs, isLoading: isLoadingSyncLogs } = useSyncLogs(VENDOR_ID);
  const connectPOS = useConnectPOS();
  const syncProducts = useSyncPOSProducts();
  const disconnectPOS = useDisconnectPOS();

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setNotification({
        type: 'error',
        message: `OAuth error: ${error}`,
      });
      // Clean up URL
      router.replace('/vendor/pos');
      return;
    }

    if (code && state) {
      // Determine provider from state
      const provider = state as 'SQUARE' | 'TOAST' | 'SHOPIFY';
      
      handleConnect(provider, code);
      
      // Clean up URL
      router.replace('/vendor/pos');
    }
  }, [searchParams]);

  const handleConnect = async (provider: 'SQUARE' | 'TOAST' | 'SHOPIFY', authCode?: string) => {
    if (!authCode) {
      // Redirect to OAuth flow
      window.location.href = getOAuthURL(provider);
      return;
    }

    try {
      const result = await connectPOS.mutateAsync({
        vendorId: VENDOR_ID,
        provider,
        authCode,
      });

      if (result.success) {
        setNotification({
          type: 'success',
          message: `Successfully connected to ${provider}!`,
        });
        
        // Trigger initial sync
        setTimeout(() => {
          handleSync();
        }, 1000);
      } else {
        setNotification({
          type: 'error',
          message: result.message || 'Failed to connect POS system',
        });
      }
    } catch (error: unknown) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect POS system',
      });
    }
  };

  const handleSync = async () => {
    try {
      const result = await syncProducts.mutateAsync(VENDOR_ID);
      
      if (result.success) {
        setNotification({
          type: 'success',
          message: `Sync completed! Added: ${result.productsAdded}, Updated: ${result.productsUpdated}, Removed: ${result.productsRemoved}`,
        });
      } else {
        setNotification({
          type: 'error',
          message: `Sync completed with errors: ${result.errors.join(', ')}`,
        });
      }
    } catch (error: unknown) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to sync products',
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectPOS.mutateAsync(VENDOR_ID);
      setNotification({
        type: 'success',
        message: 'Successfully disconnected POS system',
      });
    } catch (error: unknown) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to disconnect POS system',
      });
    }
  };

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (isLoadingConnection) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading POS connections...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">POS Connections</h1>
        </div>
        <p className="text-gray-600">
          Connect your Point of Sale system to automatically sync products, prices, and inventory
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'
            }`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* POS Provider Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Available Integrations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <POSConnectionCard
            provider="SQUARE"
            isConnected={posConnection?.provider === 'SQUARE'}
            accountId={posConnection?.provider === 'SQUARE' ? posConnection.accountId : undefined}
            lastSyncAt={posConnection?.provider === 'SQUARE' ? posConnection.lastSyncAt : undefined}
            syncStatus={posConnection?.provider === 'SQUARE' ? posConnection.syncStatus : undefined}
            onConnect={() => handleConnect('SQUARE')}
            onDisconnect={handleDisconnect}
            onSync={handleSync}
            isSyncing={syncProducts.isPending}
          />

          <POSConnectionCard
            provider="TOAST"
            isConnected={posConnection?.provider === 'TOAST'}
            accountId={posConnection?.provider === 'TOAST' ? posConnection.accountId : undefined}
            lastSyncAt={posConnection?.provider === 'TOAST' ? posConnection.lastSyncAt : undefined}
            syncStatus={posConnection?.provider === 'TOAST' ? posConnection.syncStatus : undefined}
            onConnect={() => handleConnect('TOAST')}
            onDisconnect={handleDisconnect}
            onSync={handleSync}
            isSyncing={syncProducts.isPending}
          />

          <POSConnectionCard
            provider="SHOPIFY"
            isConnected={posConnection?.provider === 'SHOPIFY'}
            accountId={posConnection?.provider === 'SHOPIFY' ? posConnection.accountId : undefined}
            lastSyncAt={posConnection?.provider === 'SHOPIFY' ? posConnection.lastSyncAt : undefined}
            syncStatus={posConnection?.provider === 'SHOPIFY' ? posConnection.syncStatus : undefined}
            onConnect={() => handleConnect('SHOPIFY')}
            onDisconnect={handleDisconnect}
            onSync={handleSync}
            isSyncing={syncProducts.isPending}
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">1.</span>
            <span>Click "Connect" on your POS provider to authorize Makeriess</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">2.</span>
            <span>Your products will automatically sync every 15 minutes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">3.</span>
            <span>Use "Sync Now" to manually trigger a sync at any time</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">4.</span>
            <span>Manage product visibility in the Products page</span>
          </li>
        </ul>
      </div>

      {/* Sync History */}
      {posConnection && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sync History</h2>
          <SyncLogsTable logs={syncLogs || []} isLoading={isLoadingSyncLogs} />
        </div>
      )}
    </div>
  );
}

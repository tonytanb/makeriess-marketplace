'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Unlink } from 'lucide-react';

interface POSConnectionCardProps {
  provider: 'SQUARE' | 'TOAST' | 'SHOPIFY';
  isConnected: boolean;
  accountId?: string;
  lastSyncAt?: string;
  syncStatus?: 'CONNECTED' | 'SYNCING' | 'ERROR' | 'DISCONNECTED';
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  isSyncing?: boolean;
}

const providerInfo = {
  SQUARE: {
    name: 'Square',
    logo: '🟦',
    description: 'Connect your Square POS to sync products and inventory',
    color: 'blue',
  },
  TOAST: {
    name: 'Toast',
    logo: '🍞',
    description: 'Connect your Toast POS to sync menu items',
    color: 'orange',
  },
  SHOPIFY: {
    name: 'Shopify',
    logo: '🛍️',
    description: 'Connect your Shopify store to sync products',
    color: 'green',
  },
};

export function POSConnectionCard({
  provider,
  isConnected,
  accountId,
  lastSyncAt,
  syncStatus,
  onConnect,
  onDisconnect,
  onSync,
  isSyncing = false,
}: POSConnectionCardProps) {
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const info = providerInfo[provider];

  const getStatusIcon = () => {
    if (!isConnected) return null;
    
    switch (syncStatus) {
      case 'CONNECTED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'SYNCING':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'DISCONNECTED':
        return <XCircle className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (!isConnected) return 'Not connected';
    
    switch (syncStatus) {
      case 'CONNECTED':
        return 'Connected';
      case 'SYNCING':
        return 'Syncing...';
      case 'ERROR':
        return 'Sync error';
      case 'DISCONNECTED':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{info.logo}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{info.name}</h3>
            <p className="text-sm text-gray-600">{info.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${
            isConnected && syncStatus === 'CONNECTED' ? 'text-green-600' :
            isConnected && syncStatus === 'ERROR' ? 'text-red-600' :
            'text-gray-500'
          }`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {isConnected && accountId && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Account ID:</span>
            <span className="font-mono text-gray-900">{accountId}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Last sync:</span>
            <span className="text-gray-900">{formatLastSync(lastSyncAt)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!isConnected ? (
          <button
            onClick={onConnect}
            className={`flex-1 px-4 py-2 bg-${info.color}-600 text-white rounded-lg font-medium hover:bg-${info.color}-700 transition`}
          >
            Connect {info.name}
          </button>
        ) : (
          <>
            <button
              onClick={onSync}
              disabled={isSyncing || syncStatus === 'SYNCING'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
            
            {!showDisconnectConfirm ? (
              <button
                onClick={() => setShowDisconnectConfirm(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
              >
                <Unlink className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onDisconnect();
                    setShowDisconnectConfirm(false);
                  }}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDisconnectConfirm(false)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Offline Queue for Cart and Favorites Actions

interface PendingAction {
  id?: number;
  type: 'cart' | 'favorite';
  action: 'add' | 'remove' | 'update';
  data: any;
  timestamp: number;
}

const DB_NAME = 'makeriess-db';
const DB_VERSION = 1;
const STORE_NAME = 'pendingActions';

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Add action to queue
export async function queueAction(action: Omit<PendingAction, 'id' | 'timestamp'>): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const pendingAction: PendingAction = {
      ...action,
      timestamp: Date.now(),
    };

    await store.add(pendingAction);
    
    console.log('Action queued for offline sync:', pendingAction);

    // Try to sync immediately if online
    if (navigator.onLine) {
      await syncPendingActions();
    }
  } catch (error) {
    console.error('Failed to queue action:', error);
    throw error;
  }
}

// Get all pending actions
export async function getPendingActions(): Promise<PendingAction[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to get pending actions:', error);
    return [];
  }
}

// Remove action from queue
export async function removeAction(id: number): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await store.delete(id);
    console.log('Action removed from queue:', id);
  } catch (error) {
    console.error('Failed to remove action:', error);
  }
}

// Clear all pending actions
export async function clearPendingActions(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    await store.clear();
    console.log('All pending actions cleared');
  } catch (error) {
    console.error('Failed to clear pending actions:', error);
  }
}

// Sync pending actions
export async function syncPendingActions(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Cannot sync: offline');
    return;
  }

  try {
    const actions = await getPendingActions();

    if (actions.length === 0) {
      return;
    }

    console.log(`Syncing ${actions.length} pending actions...`);

    for (const action of actions) {
      try {
        await syncAction(action);
        
        // Remove from queue after successful sync
        if (action.id) {
          await removeAction(action.id);
        }
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        // Keep in queue for retry
      }
    }

    console.log('Pending actions synced');
  } catch (error) {
    console.error('Failed to sync pending actions:', error);
  }
}

// Sync individual action
async function syncAction(action: PendingAction): Promise<void> {
  const endpoint = action.type === 'cart' ? '/api/cart' : '/api/favorites';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: action.action,
      data: action.data,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to sync action: ${response.statusText}`);
  }
}

// Setup online/offline listeners
export function setupOfflineSync() {
  if (typeof window === 'undefined') {
    return;
  }

  window.addEventListener('online', async () => {
    console.log('Back online - syncing pending actions...');
    await syncPendingActions();
  });

  window.addEventListener('offline', () => {
    console.log('Gone offline - actions will be queued');
  });

  // Sync on page load if online
  if (navigator.onLine) {
    syncPendingActions();
  }
}

// Check if online
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

// Get pending actions count
export async function getPendingActionsCount(): Promise<number> {
  const actions = await getPendingActions();
  return actions.length;
}

'use client';

import { Truck, Store } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import type { DeliveryMode } from '@/lib/types/customer';

export function DeliveryToggle() {
  const { deliveryMode, setDeliveryMode } = useStore();

  const modes: { value: DeliveryMode; label: string; icon: typeof Truck }[] = [
    { value: 'DELIVERY', label: 'Delivery', icon: Truck },
    { value: 'PICKUP', label: 'Pickup', icon: Store },
  ];

  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = deliveryMode === mode.value;
        
        return (
          <button
            key={mode.value}
            onClick={() => setDeliveryMode(mode.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md transition font-medium text-sm
              ${isActive
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';

export function ScheduleSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { isScheduled, scheduledTime, setScheduled } = useStore();

  const handleDeliverNow = () => {
    setScheduled(false, null);
    setIsOpen(false);
  };

  const handleScheduleLater = () => {
    // In production, open date/time picker modal
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    setScheduled(true, tomorrow);
    setIsOpen(false);
  };

  const formatScheduledTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition"
      >
        <Clock className="w-5 h-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">
          {isScheduled && scheduledTime
            ? formatScheduledTime(scheduledTime)
            : 'Deliver now'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
            <div className="p-2">
              <button
                onClick={handleDeliverNow}
                className={`w-full text-left px-3 py-2 rounded-md transition ${
                  !isScheduled
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                Deliver now
              </button>
              <button
                onClick={handleScheduleLater}
                className={`w-full text-left px-3 py-2 rounded-md transition ${
                  isScheduled
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                Schedule for later
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

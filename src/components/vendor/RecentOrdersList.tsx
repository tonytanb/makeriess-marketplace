import { Clock, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface RecentOrder {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  status: string;
  createdAt: string;
}

interface RecentOrdersListProps {
  orders: RecentOrder[];
}

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'OUT_FOR_DELIVERY':
        return 'bg-indigo-100 text-indigo-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No recent orders</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => router.push(`/vendor/orders/${order.id}`)}
          className="p-4 hover:bg-gray-50 cursor-pointer transition"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900">
                  Order #{order.id.slice(-8)}
                </p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    order.status
                  )}`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                ${order.subtotal.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {order.items.slice(0, 2).map((item, index) => (
              <p key={index} className="text-sm text-gray-600">
                {item.quantity}x {item.productName}
              </p>
            ))}
            {order.items.length > 2 && (
              <p className="text-sm text-gray-500">
                +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

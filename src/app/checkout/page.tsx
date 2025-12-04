'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, CreditCard, Tag, Gift, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { checkoutService } from '@/lib/api/checkout';
import {
  AddressSelector,
  PaymentMethodSelector,
  PromoCodeInput,
  LoyaltyPointsRedemption,
  OrderSummary,
  StripePaymentForm,
} from '@/components/checkout';
import type { Address } from '@/lib/types/customer';
import type { PromoCode, LoyaltyPoints, SavedPaymentMethod } from '@/lib/types/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useStore((state) => state.cartItems);
  const selectedAddress = useStore((state) => state.selectedAddress);
  const deliveryMode = useStore((state) => state.deliveryMode);
  const scheduledTime = useStore((state) => state.scheduledTime);
  const getVendorSubtotals = useStore((state) => state.getVendorSubtotals);
  const getCartTotal = useStore((state) => state.getCartTotal);

  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(selectedAddress);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SavedPaymentMethod | null>(null);
  const [useNewPaymentMethod, setUseNewPaymentMethod] = useState(false);
  
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPoints>({
    balance: 0,
    pointsToRedeem: 0,
    dollarValue: 0,
  });
  
  const [error, setError] = useState<string | null>(null);

  const vendorGroups = getVendorSubtotals();
  const subtotal = getCartTotal();

  // Calculate fees and totals
  const platformFee = subtotal * 0.06;
  const deliveryFeePerVendor = deliveryMode === 'DELIVERY' ? 3.99 : 0;
  const totalDeliveryFee = vendorGroups.size * deliveryFeePerVendor;
  const tax = subtotal * 0.08;
  
  const promoDiscount = promoCode
    ? promoCode.discountType === 'PERCENTAGE'
      ? subtotal * (promoCode.discountValue / 100)
      : promoCode.discountValue
    : 0;
  
  const loyaltyDiscount = loyaltyPoints.pointsToRedeem / 100;
  const totalDiscount = promoDiscount + loyaltyDiscount;
  
  const grandTotal = Math.max(0, subtotal + platformFee + totalDeliveryFee + tax - totalDiscount);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/');
    }
  }, [cartItems, router]);

  // Load saved data
  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        // In production, get customerId from auth session
        const customerId = 'mock-customer-id';
        
        const [addresses, paymentMethods, points] = await Promise.all([
          checkoutService.getSavedAddresses(customerId),
          checkoutService.getSavedPaymentMethods(customerId),
          checkoutService.getLoyaltyPoints(customerId),
        ]);

        setSavedAddresses(addresses as Address[]);
        setSavedPaymentMethods(paymentMethods);
        setLoyaltyPoints(points);

        // Set default payment method
        const defaultMethod = paymentMethods.find((pm: SavedPaymentMethod) => pm.isDefault);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod);
        }
      } catch (err) {
        console.error('Failed to load checkout data:', err);
      }
    };

    loadCheckoutData();
  }, []);

  // Check vendor minimums
  const vendorMinimumWarnings = Array.from(vendorGroups.entries())
    .filter(([, group]) => group.subtotal < 15)
    .map(([vendorId, group]) => ({
      vendorId,
      vendorName: group.vendorName,
      needed: 15 - group.subtotal,
    }));

  const hasMinimumWarnings = vendorMinimumWarnings.length > 0;

  const handlePromoCodeApplied = (code: PromoCode) => {
    setPromoCode(code);
    setError(null);
  };

  const handlePromoCodeRemoved = () => {
    setPromoCode(null);
  };

  const handleLoyaltyPointsChanged = (points: number) => {
    setLoyaltyPoints((prev) => ({
      ...prev,
      pointsToRedeem: points,
      dollarValue: points / 100,
    }));
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Shopping</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor Minimum Warnings */}
            {hasMinimumWarnings && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">
                      Minimum Order Requirements
                    </h3>
                    {vendorMinimumWarnings.map((warning) => (
                      <p key={warning.vendorId} className="text-sm text-amber-800">
                        {warning.vendorName}: Add ${warning.needed.toFixed(2)} more to reach $15.00 minimum
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {deliveryMode === 'DELIVERY' ? 'Delivery Address' : 'Pickup Location'}
                </h2>
              </div>
              <AddressSelector
                selectedAddress={deliveryAddress}
                savedAddresses={savedAddresses}
                onAddressSelected={setDeliveryAddress}
                deliveryMode={deliveryMode}
              />
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
              </div>
              
              {!useNewPaymentMethod && savedPaymentMethods.length > 0 ? (
                <PaymentMethodSelector
                  savedPaymentMethods={savedPaymentMethods}
                  selectedPaymentMethod={selectedPaymentMethod}
                  onPaymentMethodSelected={setSelectedPaymentMethod}
                  onUseNewPaymentMethod={() => setUseNewPaymentMethod(true)}
                />
              ) : (
                <div>
                  <StripePaymentForm
                    amount={grandTotal}
                    onSuccess={(paymentIntentId: string) => {
                      router.push(`/order-confirmation?paymentIntent=${paymentIntentId}`);
                    }}
                    onError={(err: string) => setError(err)}
                    disabled={!deliveryAddress || hasMinimumWarnings}
                  />
                  {savedPaymentMethods.length > 0 && (
                    <button
                      onClick={() => setUseNewPaymentMethod(false)}
                      className="mt-4 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Use saved payment method
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Promo Code */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Promo Code</h2>
              </div>
              <PromoCodeInput
                subtotal={subtotal}
                appliedPromoCode={promoCode}
                onPromoCodeApplied={handlePromoCodeApplied}
                onPromoCodeRemoved={handlePromoCodeRemoved}
              />
            </div>

            {/* Loyalty Points */}
            {loyaltyPoints.balance > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Gift className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Loyalty Points</h2>
                </div>
                <LoyaltyPointsRedemption
                  loyaltyPoints={loyaltyPoints}
                  maxRedeemable={Math.min(loyaltyPoints.balance, Math.floor(grandTotal * 100))}
                  onPointsChanged={handleLoyaltyPointsChanged}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary
                vendorGroups={vendorGroups}
                subtotal={subtotal}
                deliveryFee={totalDeliveryFee}
                platformFee={platformFee}
                tax={tax}
                promoDiscount={promoDiscount}
                loyaltyDiscount={loyaltyDiscount}
                total={grandTotal}
                deliveryMode={deliveryMode}
                scheduledTime={scheduledTime}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

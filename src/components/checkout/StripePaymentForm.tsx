'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';
import { useStore } from '@/lib/store/useStore';
import { checkoutService } from '@/lib/api/checkout';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

function CheckoutForm({
  amount,
  onSuccess,
  onError,
  disabled,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cartItems = useStore((state) => state.cartItems);
  const selectedAddress = useStore((state) => state.selectedAddress);
  const deliveryMode = useStore((state) => state.deliveryMode);
  const scheduledTime = useStore((state) => state.scheduledTime);
  const clearCart = useStore((state) => state.clearCart);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || disabled) {
      return;
    }

    if (!selectedAddress) {
      setErrorMessage('Please select a delivery address');
      onError('Please select a delivery address');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Create checkout session
      await checkoutService.createCheckoutSession({
        customerId: 'mock-customer-id', // In production, get from auth
        items: cartItems,
        deliveryAddress: selectedAddress,
        deliveryMode,
        scheduledFor: scheduledTime?.toISOString(),
      });

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Clear cart and redirect to confirmation
        clearCart();
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment processing failed';
      setErrorMessage(message);
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Element */}
      <div className="p-4 border border-gray-300 rounded-lg">
        <PaymentElement />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing || disabled}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Lock className="w-3 h-3" />
        <span>Secure payment powered by Stripe</span>
      </div>
    </form>
  );
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const cartItems = useStore((state) => state.cartItems);
  const selectedAddress = useStore((state) => state.selectedAddress);
  const deliveryMode = useStore((state) => state.deliveryMode);
  const scheduledTime = useStore((state) => state.scheduledTime);
  const { onError } = props;

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      if (!selectedAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const session = await checkoutService.createCheckoutSession({
          customerId: 'mock-customer-id', // In production, get from auth
          items: cartItems,
          deliveryAddress: selectedAddress,
          deliveryMode,
          scheduledFor: scheduledTime?.toISOString(),
        });

        setClientSecret(session.clientSecret);
      } catch (err) {
        console.error('Failed to create payment intent:', err);
        onError('Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [cartItems, selectedAddress, deliveryMode, scheduledTime, onError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          Please select a delivery address to continue
        </p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  );
}

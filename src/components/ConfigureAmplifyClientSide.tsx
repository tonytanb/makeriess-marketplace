'use client';

/**
 * Configure Amplify Client Side
 * This component configures Amplify on the client side for Next.js App Router
 */

import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs, {
  ssr: true,
});

export function ConfigureAmplifyClientSide() {
  return null;
}

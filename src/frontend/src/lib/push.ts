import axios from 'axios';

// create a basic axios instance for push API calls
const pushApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// add auth token to requests
pushApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const VAPID_PUBLIC_KEY_STORAGE = 'vapid_public_key';

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get the VAPID public key from the server
 */
async function getVapidPublicKey(): Promise<string | null> {
  // check cache first
  const cached = localStorage.getItem(VAPID_PUBLIC_KEY_STORAGE);
  if (cached) return cached;

  try {
    const response = await pushApi.get<{ publicKey: string }>('/push/vapid-key');
    if (response.data.publicKey) {
      localStorage.setItem(VAPID_PUBLIC_KEY_STORAGE, response.data.publicKey);
      return response.data.publicKey;
    }
  } catch (error) {
    console.error('Failed to get VAPID key:', error);
  }

  return null;
}

/**
 * Convert VAPID key to Uint8Array for Web Push API
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray.buffer;
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return false;
  }

  try {
    // get VAPID key
    const vapidKey = await getVapidPublicKey();
    if (!vapidKey) {
      console.error('No VAPID key available');
      return false;
    }

    // get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // check existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Push notification permission denied');
        return false;
      }

      // subscribe
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
    }

    // send subscription to server
    await pushApi.post('/push/subscribe', subscription.toJSON());
    console.log('Push subscription saved');

    return true;
  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    return false;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // notify server
      await pushApi.post('/push/unsubscribe', { endpoint: subscription.endpoint });

      // unsubscribe locally
      await subscription.unsubscribe();
      console.log('Push subscription removed');
    }

    return true;
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    return false;
  }
}

/**
 * Check if currently subscribed to push
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

/**
 * Get notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

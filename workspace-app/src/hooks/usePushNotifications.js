/**
 * Push Notification Hook
 * Handles service worker registration and push subscription management
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/api';

// Check if push notifications are supported
const isPushSupported = () => {
    return 'serviceWorker' in navigator && 'PushManager' in window;
};

// Convert VAPID key to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const usePushNotifications = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [permission, setPermission] = useState('default');

    // Check current subscription status
    const checkSubscription = useCallback(async () => {
        if (!isPushSupported()) {
            setIsSupported(false);
            setIsLoading(false);
            return;
        }

        setIsSupported(true);
        setPermission(Notification.permission);

        try {
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();

            setSubscription(existingSubscription);
            setIsSubscribed(!!existingSubscription);
        } catch (err) {
            console.error('Error checking subscription:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Subscribe to push notifications
    const subscribe = useCallback(async (deviceName = 'Web Browser') => {
        if (!isPushSupported()) {
            throw new Error('Push notifications are not supported');
        }

        setIsLoading(true);
        setError(null);

        try {
            // Request notification permission
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult !== 'granted') {
                throw new Error('Notification permission denied');
            }

            // Get VAPID public key from server
            const { publicKey, available } = await notificationsAPI.getVapidKey();

            if (!available || !publicKey) {
                throw new Error('Push notifications not configured on server');
            }

            // Register service worker if not already
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push
            const pushSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey)
            });

            // Send subscription to server
            await notificationsAPI.subscribe(pushSubscription.toJSON(), deviceName);

            setSubscription(pushSubscription);
            setIsSubscribed(true);

            return pushSubscription;
        } catch (err) {
            console.error('Error subscribing to push:', err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Unsubscribe from push notifications
    const unsubscribe = useCallback(async () => {
        if (!subscription) return;

        setIsLoading(true);
        setError(null);

        try {
            // Unsubscribe on server
            await notificationsAPI.unsubscribe(subscription.endpoint);

            // Unsubscribe locally
            await subscription.unsubscribe();

            setSubscription(null);
            setIsSubscribed(false);
        } catch (err) {
            console.error('Error unsubscribing:', err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [subscription]);

    // Register service worker on mount - DISABLED to prevent local network popup
    // Service worker will only register when user explicitly enables push notifications
    useEffect(() => {
        // Don't auto-register service worker to avoid "local network" permission popup
        // const registerServiceWorker = async () => {
        //     if ('serviceWorker' in navigator) {
        //         try {
        //             const registration = await navigator.serviceWorker.register('/sw.js');
        //             console.log('Service Worker registered:', registration.scope);
        //         } catch (err) {
        //             console.error('Service Worker registration failed:', err);
        //         }
        //     }
        // };
        // registerServiceWorker();

        // Only check subscription status, don't register SW automatically
        setIsLoading(false);
        setIsSupported(isPushSupported());
    }, []);

    return {
        isSupported,
        isSubscribed,
        isLoading,
        error,
        permission,
        subscribe,
        unsubscribe,
        checkSubscription
    };
};

export default usePushNotifications;

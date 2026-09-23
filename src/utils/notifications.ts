// Utilidad de notificaciones del sistema para FocusGarden
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function isNotificationGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

export interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  renotify?: boolean;
}

export async function sendSystemNotification(title: string, options?: ExtendedNotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const defaultOptions: ExtendedNotificationOptions = {
    icon: '/pwa-192.svg',
    badge: '/pwa-192.svg',
    vibrate: [200, 100, 200, 100, 400],
    ...options
  };

  // Intentar usar el Service Worker si está registrado (óptimo para móviles y background)
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, defaultOptions);
        return;
      }
    } catch {
      // Si falla, fallback a Notification API directa
    }
  }

  // Fallback con la API estándar de Notification
  try {
    new Notification(title, defaultOptions);
  } catch (err) {
    console.warn('Could not trigger direct notification:', err);
  }
}

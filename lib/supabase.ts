import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';

const configuredSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
// A device opened through Expo's LAN address cannot reach the host machine via
// its own loopback address. Use the dev server's LAN host for local Supabase.
const supabaseUrl = (() => {
  if (!__DEV__ || !configuredSupabaseUrl) return configuredSupabaseUrl;
  const devHost = Platform.OS === 'web' && typeof window !== 'undefined'
    ? window.location.hostname
    : Constants.expoConfig?.hostUri?.split(':')[0];
  if (!devHost || !/^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(devHost)) return configuredSupabaseUrl;
  const url = new URL(configuredSupabaseUrl);
  if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') return configuredSupabaseUrl;
  url.hostname = devHost;
  return url.toString().replace(/\/$/, '');
})();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Pause token auto-refresh when app is in background to prevent
// AuthRetryableFetchError from the internal refresh timer on weak networks.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

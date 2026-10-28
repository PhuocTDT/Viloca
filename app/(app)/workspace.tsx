import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ImageBackground, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Badge } from '@/src/components/ui/Badge';
import { colors } from '@/src/theme/colors';
import { spacing, radius } from '@/src/theme/spacing';
import supabase from '@/src/lib/supabase';
import { getCoverForDestination } from '@/src/lib/destination-covers';
import { useT, type StringKey } from '@/src/lib/i18n';
import type { Trip } from '@/src/types';
import { loadCachedTrips, removeTripCache } from '@/src/lib/trip-cache';
import NetInfo from '@react-native-community/netinfo';

const STATUS_TKEY: Record<string, StringKey> = {
  planning:  'tripStatusPlanning',
  active:    'wsStatusActive',
  completed: 'tripStatusCompleted',
};
const STATUS_COLOR: Record<string, 'warning' | 'forest' | 'neutral'> = {
  planning:  'warning',
  active:    'forest',
  completed: 'neutral',
};

function formatDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function tripCoverUrl(trip: Trip) {
  return getCoverForDestination(trip.destination, trip.id);
}

const N = colors.nomad;

export default function WorkspaceScreen() {
  const user = useAuthStore((s) => s.user);
  const t = useT();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => { fetchTrips(); }, [user]);

  async function fetchTrips() {
    setLoading(true);
    if (user?.id) {
      const saved = await loadCachedTrips(user.id).catch(() => []);
      setTrips(saved);
      setFromCache(saved.length > 0);
      if (saved.length) setLoading(false);
    }
    const network = await NetInfo.fetch();
    if (network.isConnected === false || network.isInternetReachable === false) {
      setLoading(false);
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (!error) { setTrips(data ?? []); setFromCache(false); }
    setLoading(false);
  }

  function confirmDeleteTrip(trip: Trip) {
    Alert.alert(
      t('wsDeleteTitle'),
      `${t('deleteBtn')} "${trip.title}"? ${t('wsDeleteBodyCannotUndo')}`,
      [
        { text: t('cancelBtn'), style: 'cancel' },
        {
          text: t('deleteBtn'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('trips').delete().eq('id', trip.id);
            if (!error) {
              await removeTripCache(trip.id);
              setTrips((prev) => prev.filter((item) => item.id !== trip.id));
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={N.primary} />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>{t('wsHeading')}</Text>
          <Text style={styles.subheading}>{trips.length} {t('wsTripsOf')}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/create-trip')}>
          <Ionicons name="add" size={20} color={N.onPrimary} />
          <Text style={styles.addText}>{t('wsNewTrip')}</Text>
        </TouchableOpacity>
      </View>

      {fromCache && <Text style={{ paddingHorizontal: spacing.lg, color: N.onSurfaceVariant, fontSize: 12 }}>{t('offlineTripsSaved')}</Text>}
      {trips.length === 0 ? (
        <EmptyState
          icon="map-outline"
          title={t('wsEmptyTitle')}
          body={t('wsEmptyBody')}
          ctaLabel={t('wsEmptyCtaLabel')}
          onCta={() => router.push('/create-trip')}
        />
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, gap: 10 }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchTrips}
          refreshing={loading}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tripCard}
              activeOpacity={0.92}
              onPress={() => router.push(`/trip/${item.id}`)}
              onLongPress={() => confirmDeleteTrip(item)}
              delayLongPress={500}
            >
              {/* ── Ảnh bên trái ── */}
              <View style={styles.tripImageWrap}>
                <ImageBackground
                  source={{ uri: tripCoverUrl(item) }}
                  style={styles.tripImage}
                  imageStyle={styles.tripImageStyle}
                  resizeMode="cover"
                />
              </View>

              {/* ── Thông tin bên phải ── */}
              <View style={styles.tripInfo}>
                <View style={styles.tripBadgeRow}>
                  <Badge label={t(STATUS_TKEY[item.status] ?? 'tripStatusPlanning')} color={STATUS_COLOR[item.status]} />
                  {item.is_ai_generated && (
                    <View style={styles.aiBadge}>
                      <Ionicons name="sparkles" size={10} color="#fff" />
                      <Text style={styles.aiBadgeText}>AI</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.tripTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.tripMeta}>
                  <View style={styles.tripMetaItem}>
                    <Ionicons name="location-outline" size={12} color={N.onSurfaceVariant} />
                    <Text style={styles.tripMetaText}>{item.destination}</Text>
                  </View>
                  {item.start_date && (
                    <View style={styles.tripMetaItem}>
                      <Ionicons name="calendar-outline" size={12} color={N.onSurfaceVariant} />
                      <Text style={styles.tripMetaText}>
                        {formatDate(item.start_date)}{item.end_date ? ` → ${formatDate(item.end_date)}` : ''}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl },
  heading:       { fontSize: 22, fontWeight: '800', color: N.onSurface },
  subheading:    { fontSize: 13, color: N.onSurfaceVariant, marginTop: 2 },
  addBtn:        { flexDirection: 'row', alignItems: 'center', backgroundColor: N.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.xl, gap: 4 },
  addText:       { color: N.onPrimary, fontWeight: '600', fontSize: 14 },

  tripCard:        { flexDirection: 'row', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: N.surface, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 5 },
  tripImageWrap:   { width: 96, height: 96 },
  tripImage:       { width: 96, height: 96 },
  tripImageStyle:  { borderRadius: 0 },
  tripBadgeRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiBadge:         { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.nomad.primaryContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full },
  aiBadgeText:     { fontSize: 9, color: '#fff', fontWeight: '700' },
  tripInfo:        { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 4 },
  tripTitle:       { fontSize: 14.5, fontWeight: '800', color: N.onSurface, lineHeight: 18 },
  tripMeta:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tripMetaItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripMetaText:    { fontSize: 11, color: N.onSurfaceVariant, fontWeight: '500' },
});

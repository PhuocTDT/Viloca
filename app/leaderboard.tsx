import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { Avatar } from '@/src/components/ui/Avatar';
import { colors } from '@/src/theme/colors';
import { spacing, radius } from '@/src/theme/spacing';
import { useAuthStore } from '@/store/authStore';
import { useLeaderboard } from '@/src/hooks/useLeaderboard';
import { useT } from '@/src/lib/i18n';
import type { LeaderboardEntry } from '@/src/types';

const N = colors.nomad;

type Tab = 'posts' | 'checkins';

const RANK_COLORS: Record<number, string> = { 1: '#F2C94C', 2: '#C0C0C0', 3: '#CD7F32' };

const PODIUM_STYLE: Record<number, { height: number; base: string; ring: string; badge: string }> = {
  1: { height: 108, base: '#F7DE8C', ring: '#F2C94C', badge: '#F2C94C' },
  2: { height: 82,  base: '#E2E2E2', ring: '#C0C0C0', badge: '#B9B9B9' },
  3: { height: 68,  base: '#ECC9AC', ring: '#CD7F32', badge: '#CD7F32' },
};

function PodiumColumn({ entry, rank, unit, isMe }: { entry: LeaderboardEntry; rank: 1 | 2 | 3; unit: string; isMe: boolean }) {
  const p = PODIUM_STYLE[rank];
  return (
    <TouchableOpacity
      style={styles.podiumCol}
      activeOpacity={0.85}
      onPress={() => router.push(`/user/${entry.id}`)}
    >
      <MaterialCommunityIcons name="crown" size={rank === 1 ? 22 : 18} color={p.ring} style={{ marginBottom: 2 }} />
      <View style={[styles.podiumAvatarRing, { borderColor: p.ring }, isMe && styles.podiumAvatarRingMe]}>
        <Avatar uri={entry.avatar_url} name={entry.full_name} size={rank === 1 ? 56 : 48} />
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>{entry.username ? `@${entry.username}` : (entry.full_name ?? '—')}</Text>
      <Text style={styles.podiumValue} numberOfLines={1}>{entry.value} {unit}</Text>
      <View style={[styles.podiumBase, { height: p.height, backgroundColor: p.base }]}>
        <View style={[styles.podiumBadge, { backgroundColor: p.badge }]}>
          <Text style={styles.podiumBadgeText}>{rank}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function LeaderboardRow({ entry, unit, isMe }: { entry: LeaderboardEntry; unit: string; isMe: boolean }) {
  const rankColor = RANK_COLORS[entry.rank];
  return (
    <TouchableOpacity
      style={[styles.row, isMe && styles.rowMe]}
      activeOpacity={0.85}
      onPress={() => router.push(`/user/${entry.id}`)}
    >
      <View style={[styles.rankWrap, rankColor ? { backgroundColor: rankColor } : null]}>
        <Text style={[styles.rankText, rankColor && styles.rankTextTop]}>{entry.rank}</Text>
      </View>
      <Avatar uri={entry.avatar_url} name={entry.full_name} size={40} />
      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={1}>{entry.full_name ?? entry.username ?? '—'}</Text>
        {entry.username ? <Text style={styles.rowUsername} numberOfLines={1}>@{entry.username}</Text> : null}
      </View>
      <Text style={styles.rowValue}>{entry.value} {unit}</Text>
    </TouchableOpacity>
  );
}

export default function LeaderboardScreen() {
  const t = useT();
  const me = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>('posts');
  const { entries, loading } = useLeaderboard(tab);
  const unit = tab === 'posts' ? t('leaderboardPostUnit') : t('leaderboardStreakUnit');

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const [first, second, third] = top3;

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={N.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('leaderboardTitle')}</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tab pills */}
      <View style={styles.tabs}>
        {([['posts', t('leaderboardTabPosts')], ['checkins', t('leaderboardTabCheckins')]] as [Tab, string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, tab === key && styles.tabActive]}
            onPress={() => setTab(key)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={N.primary} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="trophy-outline" size={40} color={N.outlineVariant} />
          <Text style={styles.emptyText}>{t('leaderboardEmpty')}</Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, gap: 8 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            top3.length > 0 ? (
              <View style={styles.podiumRow}>
                {second ? <PodiumColumn entry={second} rank={2} unit={unit} isMe={second.id === me?.id} /> : <View style={styles.podiumCol} />}
                {first ? <PodiumColumn entry={first} rank={1} unit={unit} isMe={first.id === me?.id} /> : <View style={styles.podiumCol} />}
                {third ? <PodiumColumn entry={third} rank={3} unit={unit} isMe={third.id === me?.id} /> : <View style={styles.podiumCol} />}
              </View>
            ) : undefined
          }
          ListHeaderComponentStyle={{ marginBottom: rest.length > 0 ? spacing.lg : 0 }}
          renderItem={({ item }) => <LeaderboardRow entry={item} unit={unit} isMe={item.id === me?.id} />}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: N.outlineVariant },
  headerTitle:   { fontSize: 17, fontWeight: '700', color: N.onSurface },
  tabs:          { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  tab:           { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.full, backgroundColor: N.surfaceContainerLow, borderWidth: 1, borderColor: N.outlineVariant },
  tabActive:     { backgroundColor: N.primary, borderColor: N.primary },
  tabText:       { fontSize: 13, fontWeight: '600', color: N.onSurfaceVariant },
  tabTextActive: { color: N.onPrimary },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText:     { fontSize: 13, color: N.onSurfaceVariant },

  podiumRow:          { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 6, paddingTop: spacing.lg, paddingHorizontal: spacing.md },
  podiumCol:          { flex: 1, alignItems: 'center', maxWidth: 130 },
  podiumAvatarRing:   { borderWidth: 2.5, borderRadius: 999, padding: 2, marginBottom: 6 },
  podiumAvatarRingMe: { borderColor: N.primary },
  podiumName:         { fontSize: 13, fontWeight: '700', color: N.onSurface, maxWidth: '100%' },
  podiumValue:        { fontSize: 12, fontWeight: '700', color: N.primary, marginBottom: 8 },
  podiumBase:          { width: '100%', borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, alignItems: 'center', paddingTop: 10 },
  podiumBadge:          { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  podiumBadgeText:      { fontSize: 13, fontWeight: '800', color: '#fff' },

  row:         { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: N.outlineVariant },
  rowMe:       { borderColor: N.primary, borderWidth: 1.5, backgroundColor: N.surfaceContainerLow },
  rankWrap:    { width: 26, height: 26, borderRadius: 13, backgroundColor: N.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  rankText:    { fontSize: 12, fontWeight: '700', color: N.onSurfaceVariant },
  rankTextTop: { color: '#fff' },
  rowBody:     { flex: 1, gap: 2 },
  rowName:     { fontSize: 14, fontWeight: '700', color: N.onSurface },
  rowUsername: { fontSize: 12, color: N.onSurfaceVariant },
  rowValue:    { fontSize: 13, fontWeight: '700', color: N.primary },
});

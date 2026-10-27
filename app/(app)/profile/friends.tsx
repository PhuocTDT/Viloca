import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Avatar } from '@/src/components/ui/Avatar';
import { colors } from '@/src/theme/colors';
import { spacing, radius } from '@/src/theme/spacing';
import { useAuthStore } from '@/store/authStore';
import { useFollowLists } from '@/src/hooks/useFollowLists';
import { useFollow } from '@/src/hooks/useFollow';
import { useT } from '@/src/lib/i18n';
import type { ProfileSummary } from '@/src/types';

const N = colors.nomad;

type Tab = 'following' | 'followers';

/** Dòng 1 người trong danh sách — tự quản nút "Bỏ theo dõi" của riêng mình qua useFollow. */
function FriendRow({ profile, showUnfollow }: { profile: ProfileSummary; showUnfollow: boolean }) {
  const t = useT();
  const { isFollowing, toggle } = useFollow(profile.id);

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.85}
      onPress={() => router.push(`/user/${profile.id}`)}
    >
      <Avatar uri={profile.avatar_url} name={profile.full_name} size={44} />
      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={1}>{profile.full_name ?? profile.username ?? '—'}</Text>
        {profile.username ? <Text style={styles.rowUsername} numberOfLines={1}>@{profile.username}</Text> : null}
      </View>
      {showUnfollow && isFollowing && (
        <TouchableOpacity style={styles.unfollowBtn} onPress={toggle} hitSlop={8}>
          <Text style={styles.unfollowText}>{t('followBtnUnfollow')}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function FriendsScreen() {
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<Tab>('following');
  const { following, followers, loading } = useFollowLists(user?.id);

  const list = tab === 'following' ? following : followers;

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={N.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('friendsTitle')}</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/profile/friends-search')} hitSlop={12}>
          <Ionicons name="person-add-outline" size={22} color={N.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab pills */}
      <View style={styles.tabs}>
        {([
          ['following', `${t('friendsTabFollowing')} (${following.length})`],
          ['followers', `${t('friendsTabFollowers')} (${followers.length})`],
        ] as [Tab, string][]).map(([key, label]) => (
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
      ) : list.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={t('friendsEmptyTitle')}
          body={t('friendsEmptyHint')}
          ctaLabel={t('friendsEmptyCta')}
          onCta={() => router.push('/(app)/profile/friends-search')}
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, gap: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <FriendRow profile={item} showUnfollow={tab === 'following'} />}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: N.outlineVariant },
  headerTitle:   { fontSize: 17, fontWeight: '700', color: N.onSurface },
  tabs:          { flexDirection: 'row', gap: 6, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  tab:           { flex: 1, alignItems: 'center', paddingVertical: 7, borderRadius: radius.full, backgroundColor: N.surfaceContainerLow, borderWidth: 1, borderColor: N.outlineVariant },
  tabActive:     { backgroundColor: N.primary, borderColor: N.primary },
  tabText:       { fontSize: 12, fontWeight: '600', color: N.onSurfaceVariant },
  tabTextActive: { color: N.onPrimary },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row:           { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: N.outlineVariant },
  rowBody:       { flex: 1, gap: 2 },
  rowName:       { fontSize: 14, fontWeight: '700', color: N.onSurface },
  rowUsername:   { fontSize: 12, color: N.onSurfaceVariant },
  unfollowBtn:   { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: N.outline },
  unfollowText:  { fontSize: 12, fontWeight: '600', color: N.onSurfaceVariant },
});

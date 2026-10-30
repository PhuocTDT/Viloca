import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ActivityIndicator,
  type TextInputInstance,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { ProfileCard } from '@/src/components/ui/ProfileCard';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { useFriendSearch } from '@/src/hooks/useFriendSearch';
import { useFollow } from '@/src/hooks/useFollow';
import { useT } from '@/src/lib/i18n';
import type { ProfileSearchResult } from '@/src/types';

const N = colors.nomad;

function ResultCard({ profile }: { profile: ProfileSearchResult }) {
  const { isFollowing, toggle } = useFollow(profile.id);

  return (
    <ProfileCard
      profile={{
        id: profile.id,
        name: profile.full_name ?? profile.username ?? '—',
        avatar: profile.avatar_url ?? '',
        bio: profile.bio ?? '',
        followers: profile.followersCount,
        following: profile.followingCount,
      }}
      isFollowing={isFollowing}
      onFollow={toggle}
      onPress={() => router.push(`/user/${profile.id}`)}
    />
  );
}

export default function FriendsSearchScreen() {
  const t = useT();
  const { query, setQuery, results, loading } = useFriendSearch();
  const inputRef = useRef<TextInputInstance>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={N.onSurface} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <Ionicons name="search-outline" size={16} color={N.outline} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={t('friendsSearchHint')}
            placeholderTextColor={N.outline}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={N.outline} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={N.primary} />
        </View>
      ) : query.trim().length === 0 ? null : results.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={40} color={N.outlineVariant} />
          <Text style={styles.emptyText}>{t('friendsSearchEmpty')}</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <ResultCard profile={item} />}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn:   { padding: 4 },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: N.surfaceContainer,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 15, color: N.onSurface, padding: 0 },

  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: spacing.xl },
  emptyText: { fontSize: 13, color: N.onSurfaceVariant, textAlign: 'center' },

  list: { padding: spacing.lg, gap: 14, alignItems: 'center' },
});

import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Dimensions, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/src/components/ui/ScreenWrapper';
import { Avatar } from '@/src/components/ui/Avatar';
import { colors } from '@/src/theme/colors';
import { spacing, radius } from '@/src/theme/spacing';
import supabase from '@/src/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useFollow } from '@/src/hooks/useFollow';
import { useT } from '@/src/lib/i18n';
import type { Profile, Post } from '@/src/types';

const N = colors.nomad;
const SCREEN_W = Dimensions.get('window').width;
const POST_CELL = (SCREEN_W - spacing.lg * 2 - 4) / 3;

/** Copy từ `profile/posts.tsx` — `images` đôi khi về dạng chuỗi Postgres array thô. */
function getThumb(images: string[] | string | null | undefined): string | null {
  const imgList: string[] = Array.isArray(images)
    ? images
    : typeof images === 'string' && images.startsWith('{')
      ? images.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  return imgList[0] ?? null;
}

type PostCell = Pick<Post, 'id' | 'images' | 'content' | 'likes_count'>;

export default function UserProfileScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = useAuthStore((s) => s.user);
  const isOwnProfile = !!id && id === me?.id;

  const [profile, setProfile]     = useState<Profile | null>(null);
  const [tripCount, setTripCount]   = useState(0);
  const [placeCount, setPlaceCount] = useState(0);
  const [posts, setPosts]           = useState<PostCell[]>([]);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);

  const { isFollowing, toggle, loading: followLoading } = useFollow(id ?? '');

  useFocusEffect(useCallback(() => {
    let cancelled = false;

    async function load() {
      if (!id) return;
      setLoading(true);

      const [profileRes, tripsRes, postsRes] = await Promise.all([
        supabase.from('profiles')
          .select('id, username, full_name, avatar_url, bio, travel_style, plan, ai_credits_remaining, created_at')
          .eq('id', id).maybeSingle(),
        supabase.from('trips').select('id').eq('user_id', id),
        supabase.from('posts').select('id, images, content, likes_count').eq('user_id', id).order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;

      if (profileRes.error || !profileRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProfile(profileRes.data as Profile);

      const tripIds = (tripsRes.data ?? []).map((row: { id: string }) => row.id);
      setTripCount(tripIds.length);
      if (tripIds.length > 0) {
        const { count } = await supabase
          .from('trip_items').select('id', { count: 'exact', head: true }).in('trip_id', tripIds);
        if (!cancelled) setPlaceCount(count ?? 0);
      } else {
        setPlaceCount(0);
      }

      setPosts(postsRes.data ?? []);
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [id]));

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.headerBare}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={N.onSurface} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={N.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  if (notFound || !profile) {
    return (
      <ScreenWrapper>
        <View style={styles.headerBare}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={N.onSurface} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Ionicons name="person-outline" size={40} color={N.outlineVariant} />
          <Text style={styles.emptyText}>{t('userProfileNotFound')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerBare}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={N.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Avatar uri={profile.avatar_url} name={profile.full_name} size={80} />
          <Text style={styles.name}>{profile.full_name ?? profile.username ?? '—'}</Text>
          {profile.username ? <Text style={styles.username}>@{profile.username}</Text> : null}
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          {!isOwnProfile && (
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followBtnActive]}
              onPress={toggle}
              disabled={followLoading}
            >
              <Text style={[styles.followText, isFollowing && styles.followTextActive]}>
                {isFollowing ? t('followBtnFollowing') : t('followBtnFollow')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: t('statTrips'),  value: String(tripCount) },
            { label: t('statPlaces'), value: String(placeCount) },
            { label: t('statPosts'),  value: String(posts.length) },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <View style={styles.emptyPosts}>
            <Ionicons name="camera-outline" size={32} color={N.outlineVariant} />
            <Text style={styles.emptyText}>{t('postsEmptyMine')}</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {posts.map((post) => {
              const thumb = getThumb(post.images);
              return (
                <TouchableOpacity
                  key={post.id}
                  style={styles.cell}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/post/${post.id}` as any)}
                >
                  {thumb ? (
                    <Image source={{ uri: thumb }} style={styles.cellImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.cellImg, styles.cellNoImg]}>
                      <Ionicons name="text-outline" size={20} color={N.onSurfaceVariant} />
                    </View>
                  )}
                  <View style={styles.cellOverlay}>
                    <Ionicons name="heart" size={11} color="#fff" />
                    <Text style={styles.cellStat}>{post.likes_count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerBare:  { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 48 },
  emptyText:   { fontSize: 13, color: N.onSurfaceVariant, textAlign: 'center' },

  hero:        { alignItems: 'center', paddingBottom: spacing.lg, paddingHorizontal: spacing.lg },
  name:        { fontSize: 20, fontWeight: '700', color: N.onSurface, marginTop: 12 },
  username:    { fontSize: 13, color: N.onSurfaceVariant, marginTop: 2 },
  bio:         { fontSize: 13, color: N.onSurface, marginTop: 8, textAlign: 'center', lineHeight: 18 },

  followBtn:       { marginTop: 14, paddingHorizontal: 24, paddingVertical: 9, borderRadius: radius.full, backgroundColor: N.primary },
  followBtnActive: { backgroundColor: N.surfaceContainer },
  followText:      { fontSize: 13, fontWeight: '700', color: N.onPrimary },
  followTextActive:{ color: N.onSurfaceVariant },

  statsRow:    { flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.lg, backgroundColor: N.surfaceContainerLow, borderRadius: radius.lg, borderWidth: 1, borderColor: N.outlineVariant, padding: spacing.md },
  statItem:    { flex: 1, alignItems: 'center' },
  statValue:   { fontSize: 20, fontWeight: '700', color: N.onSurface },
  statLabel:   { fontSize: 11, color: N.onSurfaceVariant, marginTop: 2 },

  emptyPosts:  { alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 48 },
  grid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 2, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  cell:        { width: POST_CELL, height: POST_CELL, borderRadius: radius.sm, overflow: 'hidden', position: 'relative' },
  cellImg:     { width: '100%', height: '100%' },
  cellNoImg:   { backgroundColor: N.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  cellOverlay: { position: 'absolute', bottom: 4, left: 4, flexDirection: 'row', alignItems: 'center', gap: 2 },
  cellStat:    { fontSize: 10, color: '#fff', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
});

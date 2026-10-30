import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, AccessibilityInfo } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, shadow } from '../../theme/spacing';

export type ProfileCardVariant = 'light' | 'soft-glass' | 'dark';

export interface ProfileCardData {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  verified?: boolean;
}

interface Props {
  profile: ProfileCardData;
  variant?: ProfileCardVariant;
  isFollowing?: boolean;
  onFollow?: (following: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
}

function formatCount(n: number): string {
  const round1 = (v: number) => (Math.round(v * 10) / 10).toString();
  if (n >= 1_000_000) return `${round1(n / 1_000_000)}M`;
  if (n >= 1_000) return `${round1(n / 1_000)}k`;
  return String(n);
}

function initials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

const PALETTES: Record<ProfileCardVariant, {
  nameColor: string; bioColor: string; statColor: string; badgeColor: string;
  fallbackBg: string; fallbackText: string;
  followIdleBg: string; followIdleText: string; followActiveBg: string; followActiveText: string;
}> = {
  light: {
    nameColor: '#12152B', bioColor: '#6B7280', statColor: '#6B7280', badgeColor: '#16A34A',
    fallbackBg: '#E5E7EB', fallbackText: '#6B7280',
    followIdleBg: '#F1F2F4', followIdleText: '#12152B', followActiveBg: '#12152B', followActiveText: '#FFFFFF',
  },
  'soft-glass': {
    nameColor: '#12152B', bioColor: '#4B5160', statColor: '#4B5160', badgeColor: '#16A34A',
    fallbackBg: 'rgba(255,255,255,0.4)', fallbackText: '#4B5160',
    followIdleBg: 'rgba(255,255,255,0.75)', followIdleText: '#12152B', followActiveBg: '#12152B', followActiveText: '#FFFFFF',
  },
  dark: {
    nameColor: '#FFFFFF', bioColor: '#B8BCC8', statColor: '#B8BCC8', badgeColor: '#FFFFFF',
    fallbackBg: '#2A2E42', fallbackText: '#B8BCC8',
    followIdleBg: '#F4F5F7', followIdleText: '#12152B', followActiveBg: 'rgba(255,255,255,0.16)', followActiveText: '#FFFFFF',
  },
};

/** Thẻ hồ sơ người dùng dạng premium — ảnh chân dung lớn + tên/bio/stat/nút Follow.
 *  3 biến thể màu (light/soft-glass/dark) dùng chung 1 cây render, không lặp markup. */
export function ProfileCard({ profile, variant = 'light', isFollowing = false, onFollow, onPress, disabled = false }: Props) {
  const [following, setFollowing] = useState(isFollowing);
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const p = PALETTES[variant];

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => { if (!cancelled) setReduceMotion(v); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  function toggleFollow() {
    if (disabled) return;
    const next = !following;
    setFollowing(next);
    onFollow?.(next);
  }

  const cardContent = (
    <>
      <View style={styles.portraitWrap}>
        {imgError || !profile.avatar ? (
          <View style={[styles.portraitFallback, { backgroundColor: p.fallbackBg }]}>
            <Text style={[styles.portraitInitials, { color: p.fallbackText }]}>{initials(profile.name)}</Text>
          </View>
        ) : (
          <ExpoImage
            source={{ uri: profile.avatar }}
            style={styles.portrait}
            contentFit="cover"
            transition={reduceMotion ? 0 : 150}
            onError={() => setImgError(true)}
            accessibilityLabel={`Ảnh đại diện của ${profile.name}`}
          />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: p.nameColor }]} numberOfLines={1}>{profile.name}</Text>
          {profile.verified && <Ionicons name="checkmark-circle" size={16} color={p.badgeColor} />}
        </View>

        <Text style={[styles.bio, { color: p.bioColor }]} numberOfLines={2}>{profile.bio}</Text>

        <View style={styles.footerRow}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={13} color={p.statColor} />
              <Text style={[styles.statText, { color: p.statColor }]}>{formatCount(profile.followers)}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="person-add-outline" size={13} color={p.statColor} />
              <Text style={[styles.statText, { color: p.statColor }]}>{formatCount(profile.following)}</Text>
            </View>
          </View>

          <Pressable
            onPress={toggleFollow}
            onHoverIn={() => setHovered(true)}
            onHoverOut={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ disabled, selected: following }}
            accessibilityLabel={following ? `Bỏ theo dõi ${profile.name}` : `Theo dõi ${profile.name}`}
            style={({ pressed }) => [
              styles.followBtn,
              { backgroundColor: following ? p.followActiveBg : p.followIdleBg },
              (hovered || focused) && !disabled && styles.followBtnHighlight,
              pressed && !disabled && styles.followBtnPressed,
              disabled && styles.followBtnDisabled,
            ]}
          >
            <Ionicons name={following ? 'checkmark' : 'add'} size={14} color={following ? p.followActiveText : p.followIdleText} />
            <Text style={[styles.followText, { color: following ? p.followActiveText : p.followIdleText }]}>
              {following ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );

  const cardStyle = [
    styles.card,
    variant === 'light' && [styles.cardLight, shadow.card],
    variant === 'soft-glass' && styles.cardGlass,
    variant === 'dark' && styles.cardDark,
  ];

  if (variant === 'soft-glass') {
    return (
      <PressableOrView onPress={onPress} disabled={disabled} style={cardStyle}>
        {/* Không có API blur-cường-độ-theo-gradient trong expo-blur, nên giả lập bằng
            2 lớp BlurView chồng nhau, cường độ khác nhau, phủ từ các mốc % khác nhau:
            trên cùng (vùng ảnh) rõ nhất -> giữa mờ nhẹ -> dưới cùng (vùng chữ) mờ đậm nhất. */}
        <BlurView intensity={14} tint="light" style={styles.glassLayerWide} pointerEvents="none" />
        <BlurView intensity={48} tint="light" style={styles.glassLayerNarrow} pointerEvents="none" />
        {cardContent}
      </PressableOrView>
    );
  }

  return (
    <PressableOrView onPress={onPress} disabled={disabled} style={cardStyle}>
      {cardContent}
    </PressableOrView>
  );
}

/**
 * Card gốc là View (không onPress) hoặc Pressable (có onPress) — tránh lồng Touchable thừa.
 * role="link" (không phải "button") vì bên trong đã có nút Follow riêng — 2 role="button"
 * lồng nhau render thành <button> trong <button> trên web, là HTML không hợp lệ.
 */
function PressableOrView({ onPress, disabled, style, children }: {
  onPress?: () => void; disabled?: boolean; style: any; children: React.ReactNode;
}) {
  if (!onPress) return <View style={style}>{children}</View>;
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="link" style={style}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 280,
    borderRadius: radius.xl,
    overflow: 'hidden',
    padding: spacing.sm,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEDF1',
  },
  cardGlass: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  cardDark: {
    backgroundColor: '#13162A',
  },
  glassLayerWide:   { position: 'absolute', left: 0, right: 0, bottom: 0, top: '12%' },
  glassLayerNarrow: { position: 'absolute', left: 0, right: 0, bottom: 0, top: '48%' },

  // Ảnh nằm thụt vào trong, bo góc riêng, nền card chạy liền một khối phía sau —
  // để cả card đọc như MỘT khối chứ không phải 2 mảng ảnh/thông tin tách rời.
  portraitWrap: { width: '100%', aspectRatio: 4 / 3.3, borderRadius: radius.lg, overflow: 'hidden' },
  portrait: { width: '100%', height: '100%' },
  portraitFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  portraitInitials: { fontSize: 36, fontWeight: '700' },

  body: { paddingHorizontal: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: '700', flexShrink: 1 },
  bio: { fontSize: 13, lineHeight: 18 },

  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  stats: { flexDirection: 'row', gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, fontWeight: '600' },

  followBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
  },
  followBtnHighlight: { opacity: 0.92 },
  followBtnPressed: { opacity: 0.7 },
  followBtnDisabled: { opacity: 0.4 },
  followText: { fontSize: 12.5, fontWeight: '700' },
});

import { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Animated, StyleSheet,
} from 'react-native';
import { colors } from '@/src/theme/colors';
import { useVibes } from '@/src/hooks/useVibes';

interface Props {
  selected: string | null;
  onSelect: (name: string) => void;
  /** Phong cách từ quiz onboarding (`profiles.preferred_vibes`), ưu tiên hơn vibes[0] khi tự chọn mặc định. */
  preferredVibe?: string | null;
  /** true khi vẫn đang tải preferredVibe — chặn tự chọn mặc định quá sớm bằng vibes[0]. */
  preferredLoading?: boolean;
}

const VIBE_ICONS: [string, string][] = [
  ['lịch sử',      '🏛️'],
  ['cổ kính',      '⏳'],
  ['cổ điển',      '🎩'],
  ['cổ xưa',       '📜'],
  ['hoài cổ',      '🕰️'],
  ['kiến trúc',    '🏗️'],
  ['nghệ thuật',   '🎨'],
  ['lộng lẫy',     '✨'],
  ['sang trọng',   '💎'],
  ['trang nghiêm', '🙏'],
  ['yên tĩnh',     '🤫'],
  ['sâu lắng',     '🌊'],
  ['bình yên',     '🕊️'],
  ['thoáng đãng',  '🌬️'],
  ['thiên nhiên',  '🌿'],
  ['hoang sơ',     '🏕️'],
  ['xanh mát',     '🌳'],
  ['nhộn nhịp',    '🎉'],
  ['đông đúc',     '👥'],
  ['sôi động',     '🎵'],
  ['náo nhiệt',    '🔥'],
  ['đa dạng',      '🌈'],
  ['ẩm thực',      '🍜'],
  ['sài gòn',      '🏙️'],
  ['giáo dục',     '📚'],
  ['văn hóa',      '🎭'],
  ['tâm linh',     '🕯️'],
  ['truyền thống', '🏮'],
  ['địa phương',   '📍'],
  ['cộng đồng',    '🤝'],
  ['làng nghề',    '🏺'],
  ['khám phá',     '🔍'],
  ['dân dã',       '🌾'],
];

function getVibeIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, emoji] of VIBE_ICONS) {
    if (lower.includes(keyword)) return emoji;
  }
  return '✦';
}

const CHIP_HEIGHT = 40;
const SKELETON_COUNT = 4;

function SkeletonChip({ width }: { width: number }) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.chip, styles.skeleton, { width, opacity }]} />
  );
}

function VibeChip({
  name, icon, active, onPress, onLayout,
}: {
  name: string; icon: string | null; active: boolean;
  onPress: () => void; onLayout: (x: number, w: number) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }).start();
  }
  function pressOut() {
    Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}
        activeOpacity={1}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        onLayout={(e) => onLayout(e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
      >
        <Text style={styles.icon}>{icon ?? getVibeIcon(name)}</Text>
        <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
          {name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function VibeChips({ selected, onSelect, preferredVibe = null, preferredLoading = false }: Props) {
  const { vibes, loading } = useVibes();
  const scrollRef = useRef<ScrollView>(null);
  const chipPositions = useRef<{ x: number; w: number }[]>([]);

  // Auto-select when loaded: ưu tiên phong cách người dùng chọn ở quiz onboarding
  // nếu nó còn tồn tại trong danh sách, không thì mặc định vibes[0] như trước.
  useEffect(() => {
    if (loading || preferredLoading || vibes.length === 0 || selected !== null) return;
    const match = preferredVibe && vibes.some((v) => v.name === preferredVibe);
    onSelect(match ? preferredVibe! : vibes[0].name);
  }, [loading, preferredLoading, vibes, preferredVibe, selected]);

  // Auto-scroll to keep selected chip fully visible
  useEffect(() => {
    if (selected === null) return;
    const idx = vibes.findIndex((v) => v.name === selected);
    if (idx < 0) return;
    const pos = chipPositions.current[idx];
    if (!pos) return;
    // Scroll so chip starts with 16dp padding from left
    scrollRef.current?.scrollTo({ x: Math.max(0, pos.x - 16), animated: true });
  }, [selected, vibes]);

  if (loading) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={styles.scroll}
        scrollEnabled={false}
      >
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonChip key={i} width={52 + i * 12} />
        ))}
      </ScrollView>
    );
  }

  if (vibes.length === 0) return null;

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {vibes.map((vibe, i) => (
        <VibeChip
          key={vibe.id}
          name={vibe.name}
          icon={vibe.icon}
          active={selected === vibe.name}
          onPress={() => onSelect(vibe.name)}
          onLayout={(x, w) => { chipPositions.current[i] = { x, w }; }}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginBottom: 20 },
  row:    { paddingHorizontal: 16, gap: 10, flexDirection: 'row', alignItems: 'center' },

  chip: {
    height: 30, borderRadius: 15,
    paddingHorizontal: 10, flexDirection: 'row',
    alignItems: 'center', gap: 4,
  },
  chipActive:   { backgroundColor: colors.nomad.primary },
  chipInactive: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E5E5' },

  skeleton: { backgroundColor: '#E5E5E5', borderWidth: 0 },

  icon:          { fontSize: 12 },
  label:         { fontSize: 12 },
  labelActive:   { color: '#fff', fontWeight: '700' },
  labelInactive: { color: '#1C1C1C', fontWeight: '400' },
});

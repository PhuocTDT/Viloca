import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { useFavorite } from '@/src/hooks/useFavorite';
import { useLocalize } from '@/src/lib/location-i18n';
import type { Location } from '@/src/types';

const N = colors.nomad;

/** Icon đại diện theo danh mục — nhận diện nhanh trong danh sách "Gần bạn". */
function iconForCategory(category: string | null): keyof typeof Ionicons.glyphMap {
  const c = (category ?? '').toLowerCase();
  if (c.includes('café') || c.includes('cafe') || c.includes('cà phê')) return 'cafe-outline';
  if (c.includes('bảo tàng')) return 'business-outline';
  if (c.includes('ẩm thực') || c.includes('nhà hàng')) return 'restaurant-outline';
  if (c.includes('tín ngưỡng') || c.includes('chùa') || c.includes('nhà thờ')) return 'flower-outline';
  if (c.includes('thiên nhiên') || c.includes('sinh thái')) return 'leaf-outline';
  return 'location-outline';
}

interface Props {
  location: Location;
  distanceLabel?: string | null;
}

export function NearbyListItem({ location, distanceLabel }: Props) {
  const { isFavorite, toggle } = useFavorite(location.id);
  const localize = useLocalize();
  const tags = (location.style_tag ?? location.category ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.85}
      onPress={() => router.push(`/location/${location.id}`)}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={iconForCategory(location.category)} size={18} color={N.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{localize(location.name, location.name_en)}</Text>
        <Text style={styles.tags} numberOfLines={1}>
          {[tags.join(' · '), distanceLabel].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <TouchableOpacity hitSlop={10} onPress={toggle}>
        <Ionicons
          name={isFavorite ? 'bookmark' : 'bookmark-outline'}
          size={19}
          color={isFavorite ? N.primary : N.outline}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 12, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: N.outlineVariant },
  iconWrap: { width: 42, height: 42, borderRadius: 12, backgroundColor: N.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  body:     { flex: 1, gap: 2 },
  name:     { fontSize: 14, fontWeight: '700', color: N.onSurface },
  tags:     { fontSize: 12, fontWeight: '600', color: N.primary },
});

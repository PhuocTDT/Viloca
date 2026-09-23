import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/src/theme/colors';
import type { Location } from '@/src/types';

interface Props {
  location: Location;
  distanceLabel?: string | null;
  width: number;
}

function cityLabel(code: string | null): string {
  if (code === 'SG') return 'TP. HCM';
  if (code === 'HN') return 'Hà Nội';
  if (code === 'DN') return 'Đà Nẵng';
  return code ?? '';
}

export function PlaceGridCard({ location, distanceLabel, width }: Props) {
  const firstPhoto = location.photos?.split(',')[0]?.trim() ?? location.cover_image ?? undefined;
  const badgeLabel = location.style_tag ?? location.category?.split(',')[0]?.trim() ?? null;
  const addressParts = [location.district, cityLabel(location.city)].filter(Boolean);
  const imageHeight = Math.round(width * 0.72); // slightly taller than 4:3

  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      activeOpacity={0.88}
      onPress={() => router.push(`/location/${location.id}`)}
    >
      {/* Image */}
      <View style={[styles.imageWrap, { height: imageHeight }]}>
        {firstPhoto ? (
          <Image source={{ uri: firstPhoto }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imageFallback, { height: imageHeight }]} />
        )}
        {badgeLabel ? (
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText} numberOfLines={1}>{badgeLabel}</Text>
          </View>
        ) : null}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{location.name}</Text>

        {addressParts.length > 0 ? (
          <View style={styles.locationRow}>
            <Text style={styles.locationDot}>○</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {addressParts.join(', ')}
            </Text>
          </View>
        ) : null}

        <View style={styles.bottomRow}>
          {location.rating != null ? (
            <Text style={styles.ratingText}>★ {location.rating}</Text>
          ) : <View />}
          {distanceLabel ? (
            <Text style={styles.distanceText}>{distanceLabel}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:           { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  imageWrap:      { position: 'relative', overflow: 'hidden' },
  image:          { width: '100%', height: '100%' },
  imageFallback:  { width: '100%', backgroundColor: colors.nomad.surfaceContainer },
  imageBadge:     { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, maxWidth: '80%' },
  imageBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  body:           { padding: 10, gap: 4 },
  name:           { fontSize: 14, fontWeight: '700', color: colors.nomad.onSurface },
  locationRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationDot:    { fontSize: 10, color: colors.nomad.onSurfaceVariant, lineHeight: 14 },
  locationText:   { fontSize: 12, color: colors.nomad.onSurfaceVariant, flex: 1 },
  bottomRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  ratingText:     { fontSize: 13, color: colors.nomad.primary, fontWeight: '700' },
  distanceText:   { fontSize: 12, color: colors.nomad.onSurfaceVariant },
});

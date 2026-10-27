import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors } from '@/src/theme/colors';
import type { Location } from '@/src/types';

interface Props {
  location: Location;
  distanceLabel?: string | null;
  width: number;
  imageRatio?: number;
  overlay?: boolean;
}

function cityLabel(code: string | null): string {
  if (code === 'SG') return 'TP. HCM';
  if (code === 'HN') return 'Hà Nội';
  if (code === 'DN') return 'Đà Nẵng';
  return code ?? '';
}

export function PlaceGridCard({ location, distanceLabel, width, imageRatio = 0.72, overlay = false }: Props) {
  const firstPhoto  = location.photos?.split(',')[0]?.trim() ?? location.cover_image ?? undefined;
  const badgeLabel  = location.style_tag ?? location.category?.split(',')[0]?.trim() ?? null;
  const addressParts = [location.district, cityLabel(location.city)].filter(Boolean);
  const imageHeight  = Math.round(width * imageRatio);

  if (overlay) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.cardOverlay, { width, height: imageHeight }]}
        activeOpacity={0.88}
        onPress={() => router.push(`/location/${location.id}`)}
      >
        {firstPhoto ? (
          <Image source={{ uri: firstPhoto }} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.nomad.surfaceContainer }]} />
        )}

        {/* Dark gradient from bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.68)']}
          locations={[0.35, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Featured badge — top left */}
        <View style={styles.overlayBadge}>
          <Text style={styles.overlayBadgeText}>📍 Địa điểm nổi bật</Text>
        </View>

        {/* Name + meta — bottom */}
        <View style={styles.overlayInfo}>
          <Text style={styles.overlayName} numberOfLines={1}>{location.name}</Text>
          {(addressParts.length > 0 || distanceLabel) ? (
            <Text style={styles.overlayMeta} numberOfLines={1}>
              {[addressParts.join(', '), distanceLabel].filter(Boolean).join(' • ')}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      activeOpacity={0.88}
      onPress={() => router.push(`/location/${location.id}`)}
    >
      {/* Image */}
      <View style={[styles.imageWrap, { height: imageHeight }]}>
        {firstPhoto ? (
          <Image source={{ uri: firstPhoto }} style={styles.image} contentFit="cover" transition={150} />
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
  card:            { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  cardOverlay:     { borderWidth: 0 },
  imageWrap:       { position: 'relative', overflow: 'hidden' },
  image:           { width: '100%', height: '100%' },
  imageFallback:   { width: '100%', backgroundColor: colors.nomad.surfaceContainer },
  imageBadge:      { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, maxWidth: '80%' },
  imageBadgeText:  { color: '#fff', fontSize: 11, fontWeight: '600' },
  body:            { padding: 10, gap: 4 },
  name:            { fontSize: 14, fontWeight: '700', color: colors.nomad.onSurface },
  locationRow:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationDot:     { fontSize: 10, color: colors.nomad.onSurfaceVariant, lineHeight: 14 },
  locationText:    { fontSize: 12, color: colors.nomad.onSurfaceVariant, flex: 1 },
  bottomRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  ratingText:      { fontSize: 13, color: colors.nomad.primary, fontWeight: '700' },
  distanceText:    { fontSize: 12, color: colors.nomad.onSurfaceVariant },

  // Overlay variant
  overlayBadge:     { position: 'absolute', top: 10, left: 10, backgroundColor: colors.nomad.primary, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  overlayBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  overlayInfo:      { position: 'absolute', bottom: 12, left: 12, right: 12 },
  overlayName:      { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 3, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  overlayMeta:      { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
});

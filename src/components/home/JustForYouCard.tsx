import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/src/theme/colors';
import type { Location } from '@/src/types';

const N = colors.nomad;

interface Props {
  location: Location;
  width: number;
}

/** Thẻ vuông dùng cho hàng cuộn ngang "Just for you" trên Home. */
export function JustForYouCard({ location, width }: Props) {
  const firstPhoto = location.photos?.split(',')[0]?.trim() ?? location.cover_image ?? undefined;
  const tags = (location.style_tag ?? location.category ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      activeOpacity={0.88}
      onPress={() => router.push(`/location/${location.id}`)}
    >
      <View style={[styles.imageWrap, { width, height: width }]}>
        {firstPhoto ? (
          <Image source={{ uri: firstPhoto }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imageFallback} />
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>{location.name}</Text>
      {tags.length > 0 ? (
        <Text style={styles.tags} numberOfLines={1}>{tags.join(' · ')}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:          { gap: 4 },
  imageWrap:     { borderRadius: 14, overflow: 'hidden', backgroundColor: N.surfaceContainer },
  image:         { width: '100%', height: '100%' },
  imageFallback: { flex: 1, backgroundColor: N.secondaryContainer, opacity: 0.5 },
  name:          { fontSize: 12.5, fontWeight: '700', color: N.onSurface, lineHeight: 15 },
  tags:          { fontSize: 10.5, fontWeight: '600', color: N.primary },
});

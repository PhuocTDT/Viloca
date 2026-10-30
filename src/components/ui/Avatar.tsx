import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

interface Props {
  uri?: string | null;
  name?: string | null;
  size?: number;
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

export function Avatar({ uri, name, size = 48 }: Props) {
  const style = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, style]} contentFit="cover" transition={150} />;
  }
  return (
    <View style={[styles.fallback, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
        {name ? initials(name) : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image:    {},
  fallback: { backgroundColor: colors.nomad.secondaryContainer, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.nomad.primary, fontWeight: '700' },
});

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon, title, body, ctaLabel, onCta }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.nomad.outlineVariant} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {ctaLabel && onCta && (
        <Button label={ctaLabel} onPress={onCta} size="sm" style={styles.cta} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title:     { fontSize: 15, fontWeight: '600', color: colors.nomad.onSurface, marginTop: spacing.md, textAlign: 'center' },
  body:      { fontSize: 12.5, color: colors.nomad.onSurfaceVariant, marginTop: 4, textAlign: 'center', lineHeight: 17 },
  cta:       { marginTop: spacing.lg },
});

import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLangStore } from '@/src/store/langStore';
import { colors } from '@/src/theme/colors';

export function LangToggle() {
  const { lang, toggle } = useLangStore();
  return (
    <TouchableOpacity style={styles.btn} onPress={toggle} activeOpacity={0.7}>
      <Text style={styles.label}>{lang === 'vi' ? '🇻🇳 VI' : '🇬🇧 EN'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn:   { borderWidth: 1, borderColor: colors.nomad.outline, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  label: { fontSize: 12, fontWeight: '600', color: colors.nomad.onSurface },
});

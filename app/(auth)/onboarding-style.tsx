import { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import supabase from '@/src/lib/supabase';
import { colors } from '@/src/theme/colors';
import { useT } from '@/src/lib/i18n';
import { useVibes } from '@/src/hooks/useVibes';

const c = colors.nomad;
const MAX_PICKS = 3;

/**
 * Quiz chọn phong cách du lịch, hiện một lần duy nhất ngay sau khi tài khoản
 * có session (sau register hoặc sau xác nhận email). Lựa chọn lưu vào
 * `profiles.preferred_vibes`, dùng để cá nhân hóa Home ngay từ lần mở đầu
 * tiên (xem `src/hooks/usePreferredVibes.ts`). Bỏ qua cũng được — không có
 * lựa chọn thì Home vẫn chạy như trước, không cá nhân hóa.
 */
export default function OnboardingStyleScreen() {
  const insets = useSafeAreaInsets();
  const t = useT();
  const { vibes, loading: vibesLoading } = useVibes();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function toggle(name: string) {
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((v) => v !== name);
      if (prev.length >= MAX_PICKS) return prev;
      return [...prev, name];
    });
  }

  async function finish(picks: string[]) {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('profiles').update({ preferred_vibes: picks }).eq('id', session.user.id);
    }
    setSaving(false);
    router.replace('/(app)');
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('onbStyleTitle')}</Text>
        <Text style={styles.sub}>{t('onbStyleSub')}</Text>

        {vibesLoading ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: 32 }} />
        ) : (
          <View style={styles.chipWrap}>
            {vibes.map((v) => {
              const active = selected.includes(v.name);
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggle(v.name)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{v.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <Text style={styles.pickCount}>{selected.length}/{MAX_PICKS}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.continueBtn, (saving || selected.length === 0) && styles.continueBtnDisabled]}
          onPress={() => finish(selected)}
          disabled={saving || selected.length === 0}
          activeOpacity={0.85}
        >
          {saving ? <ActivityIndicator color={c.onPrimary} /> : (
            <Text style={styles.continueBtnText}>{t('onbStyleContinueBtn')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => finish([])} disabled={saving}>
          <Text style={styles.skipText}>{t('onbStyleSkip')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  body:   { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 24 },
  title:  { fontSize: 24, fontWeight: '800', color: c.onSurface, marginBottom: 8 },
  sub:    { fontSize: 14, color: c.onSurfaceVariant, marginBottom: 28 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99,
    backgroundColor: c.surfaceContainer, borderWidth: 1.5, borderColor: 'transparent',
  },
  chipActive:     { backgroundColor: c.primaryContainer, borderColor: c.primary },
  chipText:       { fontSize: 14, fontWeight: '600', color: c.onSurfaceVariant },
  chipTextActive: { color: c.primary },
  pickCount: { fontSize: 12, color: c.onSurfaceVariant, marginTop: 20, textAlign: 'right' },
  footer: { paddingHorizontal: 24, paddingTop: 12, gap: 12 },
  continueBtn: {
    backgroundColor: c.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.5 },
  continueBtnText: { color: c.onPrimary, fontWeight: '700', fontSize: 16 },
  skipText: { textAlign: 'center', fontSize: 14, color: c.onSurfaceVariant },
});

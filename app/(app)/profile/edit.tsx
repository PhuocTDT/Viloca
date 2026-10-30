import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { resizeImage } from '@/src/lib/image-resize';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/src/components/ui/Avatar';
import { colors } from '@/src/theme/colors';
import { spacing, radius } from '@/src/theme/spacing';
import supabase from '@/src/lib/supabase';
import { useT } from '@/src/lib/i18n';

const N = colors.nomad;

export default function EditProfileScreen() {
  const user    = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const t = useT();

  const [fullName,      setFullName]      = useState(user?.user_metadata?.full_name ?? '');
  const [username,      setUsername]      = useState('');
  const [bio,           setBio]           = useState('');
  const [age,           setAge]           = useState('');
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [localAvatar,   setLocalAvatar]   = useState<string | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      supabase.from('profiles')
        .select('full_name, username, bio, age_range, avatar_url')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if (!data) return;
          if (data.full_name)  setFullName(data.full_name);
          if (data.username)   setUsername(data.username);
          if (data.bio)        setBio(data.bio);
          if (data.age_range)  setAge(String(data.age_range));
          if (data.avatar_url) setCurrentAvatar(data.avatar_url);
        });
    });
  }, []);

  async function pickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { setError(t('editErrPhotoPermission')); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setLocalAvatar(result.assets[0].uri);
  }

  async function uploadAvatar(uid: string, uri: string): Promise<string | null> {
    const resized = await resizeImage(uri, null, { width: 512, height: 512 });
    const path = `${uid}.jpg`;
    const resp = await fetch(resized.uri);
    const blob = await resp.blob();
    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
    if (uploadErr) { setError(t('editErrUploadPhoto') + uploadErr.message); return null; }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    return publicUrl;
  }

  async function handleSave() {
    if (!fullName.trim()) { setError(t('editErrFullName')); return; }
    setSaving(true);
    setError('');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setError(t('errSessionExpired')); setSaving(false); return; }
    const uid = session.user.id;

    let avatarUrl = currentAvatar;
    if (localAvatar) {
      avatarUrl = await uploadAvatar(uid, localAvatar);
      if (!avatarUrl) { setSaving(false); return; }
    }

    const profileUpdate: Record<string, any> = {
      full_name:  fullName.trim(),
      bio:        bio.trim() || null,
      age_range:  age.trim() || null,
      avatar_url: avatarUrl,
    };
    if (username.trim()) profileUpdate.username = username.trim().toLowerCase();

    const { error: profileErr } = await supabase.from('profiles').update(profileUpdate).eq('id', uid);
    if (profileErr) { setError(profileErr.message); setSaving(false); return; }

    const { data, error: authErr } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim(), avatar_url: avatarUrl },
    });
    setSaving(false);
    if (authErr) { setError(authErr.message); return; }
    if (data.user) setUser(data.user);
    router.back();
  }

  const displayUri = localAvatar ?? currentAvatar;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={N.onSurface} />
        </TouchableOpacity>
        <Text style={styles.heading}>{t('editProfileTitle')}</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} style={styles.avatarWrap}>
          <Avatar uri={displayUri} name={fullName || user?.user_metadata?.full_name} size={88} />
          <View style={styles.cameraOverlay}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>{t('editAvatarHint')}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Field label={t('editFieldFullName')}>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={(v) => { setFullName(v); setError(''); }}
          placeholder={t('editFullNamePH')}
          placeholderTextColor={N.onSurfaceVariant}
          autoCapitalize="words"
        />
      </Field>

      <Field label={t('editFieldUsername')}>
        <View style={styles.inputPrefix}>
          <Text style={styles.prefixText}>@</Text>
          <TextInput
            style={[styles.input, styles.inputFlex]}
            value={username}
            onChangeText={(v) => setUsername(v.replace(/\s/g, '').toLowerCase())}
            placeholder={t('editUsernamePH')}
            placeholderTextColor={N.onSurfaceVariant}
            autoCapitalize="none"
          />
        </View>
      </Field>

      <Field label={t('editFieldBio')}>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={bio}
          onChangeText={setBio}
          placeholder={t('editBioPH')}
          placeholderTextColor={N.onSurfaceVariant}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </Field>

      <Field label={t('editFieldAge')}>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={(v) => setAge(v.replace(/\D/g, ''))}
          placeholder=""
          placeholderTextColor={N.onSurfaceVariant}
          keyboardType="number-pad"
          maxLength={3}
        />
      </Field>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving
          ? <ActivityIndicator color={N.onPrimary} />
          : <Text style={styles.saveText}>{t('editSaveBtn')}</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap:  { marginHorizontal: spacing.lg, marginTop: spacing.md },
  label: { fontSize: 13, fontWeight: '500', color: N.onSurfaceVariant, marginBottom: 6 },
});

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: N.background },
  content:       { paddingBottom: 48 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, paddingTop: spacing.xl },
  backBtn:       { width: 38, height: 38, borderRadius: radius.lg, backgroundColor: N.surfaceContainerLow, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: N.outlineVariant },
  heading:       { fontSize: 18, fontWeight: '700', color: N.onSurface },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.lg, gap: 8 },
  avatarWrap:    { position: 'relative' },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: N.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: N.background },
  avatarHint:    { fontSize: 12, color: N.onSurfaceVariant },
  input:         { borderWidth: 1, borderColor: N.outlineVariant, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: N.onSurface, backgroundColor: N.surfaceContainerLow },
  inputFlex:     { flex: 1, borderWidth: 0, paddingLeft: 0 },
  inputMultiline:{ minHeight: 88, paddingTop: 12 },
  inputPrefix:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: N.outlineVariant, borderRadius: radius.lg, backgroundColor: N.surfaceContainerLow, paddingLeft: 16 },
  prefixText:    { fontSize: 15, color: N.onSurfaceVariant, marginRight: 4 },
  error:         { color: colors.error, fontSize: 13, textAlign: 'center', marginBottom: spacing.md, marginHorizontal: spacing.lg },
  saveBtn:       { backgroundColor: N.primary, marginHorizontal: spacing.lg, marginTop: spacing.xl, paddingVertical: 16, borderRadius: radius.xl, alignItems: 'center' },
  saveText:      { color: N.onPrimary, fontWeight: '600', fontSize: 16 },
});

import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Image, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { resizeImage } from '@/src/lib/image-resize';
import supabase from '@/src/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/src/theme/colors';
import { spacing, radius } from '@/src/theme/spacing';
import { useT } from '@/src/lib/i18n';

const MAX_IMAGES = 5;
const MAX_LONG_EDGE = 1600;

type ImageAsset = { uri: string; mimeType: string; ext: string; base64: string };

export default function CreatePostScreen() {
  const user = useAuthStore((s) => s.user);
  const t = useT();
  const { trip_id } = useLocalSearchParams<{ trip_id?: string }>();
  const [content, setContent]     = useState('');
  const [images, setImages]       = useState<ImageAsset[]>([]);
  const [uploading, setUploading] = useState(false);

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: MAX_IMAGES - images.length,
    });
    if (!result.canceled) {
      const assets: ImageAsset[] = await Promise.all(
        result.assets.map(async (a) => {
          const resized = await resizeImage(
            a.uri,
            { width: a.width, height: a.height },
            { maxLongEdge: MAX_LONG_EDGE }
          );
          return { uri: resized.uri, mimeType: 'image/jpeg', ext: 'jpg', base64: resized.base64 };
        })
      );
      setImages((prev) => [...prev, ...assets].slice(0, MAX_IMAGES));
    }
  }

  function removeImage(uri: string) {
    setImages((prev) => prev.filter((a) => a.uri !== uri));
  }

  function uploadImageXHR(asset: ImageAsset, filename: string, token: string): Promise<boolean> {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
    const anonKey    = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
    if (!asset.base64) return Promise.resolve(false);

    const binary = atob(asset.base64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    return new Promise<boolean>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${supabaseUrl}/storage/v1/object/post-images/${filename}`, true);
      xhr.setRequestHeader('apikey', anonKey);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', asset.mimeType);
      xhr.timeout = 30000;
      xhr.onload    = () => { resolve(xhr.status < 300); };
      xhr.onerror   = () => { console.error('[upload] network error'); resolve(false); };
      xhr.ontimeout = () => { console.error('[upload] timeout');       resolve(false); };
      xhr.send(bytes.buffer);
    });
  }

  async function handleSubmit() {
    if (!user) return;
    if (!content.trim() && images.length === 0) {
      Alert.alert(t('postErrEmpty'), t('postErrEmptyBody'));
      return;
    }
    setUploading(true);
    let posted = false;
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

      // Upload tất cả ảnh song song
      const results = await Promise.all(
        images.map((asset, i) => {
          const filename = `${user.id}/${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${asset.ext}`;
          return uploadImageXHR(asset, filename, token).then((ok) =>
            ok ? `${supabaseUrl}/storage/v1/object/public/post-images/${filename}` : null
          );
        })
      );
      const uploadedUrls = results.filter((u): u is string => u !== null);

      if (images.length > 0 && uploadedUrls.length === 0) {
        Alert.alert(t('postErrUpload'), t('postErrUploadBody'));
        return;
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: content.trim() || null,
        images: uploadedUrls,
        trip_id: trip_id ?? null,
      });

      if (error) {
        Alert.alert(t('errGeneral'), t('postErrPostBody'));
      } else {
        posted = true;
      }
    } finally {
      setUploading(false);
    }
    // Gọi sau finally để tránh state update cancel navigation
    if (posted) router.back();
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={colors.nomad.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('createPostTitle')}</Text>
        <TouchableOpacity
          style={[styles.submitBtn, uploading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          {uploading
            ? <ActivityIndicator size="small" color={colors.nomad.onPrimary} />
            : <Text style={styles.submitText}>{t('createPostSubmitBtn')}</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {trip_id && (
          <View style={styles.tripBanner}>
            <Ionicons name="map-outline" size={16} color={colors.nomad.primary} />
            <Text style={styles.tripBannerText}>{t('createPostTripBanner')}</Text>
          </View>
        )}
        <TextInput
          style={styles.input}
          multiline
          placeholder={t('createPostPlaceholder')}
          placeholderTextColor={colors.nomad.onSurfaceVariant}
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
          autoFocus
        />

        {/* Image previews */}
        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow} contentContainerStyle={{ gap: 8 }}>
            {images.map((asset) => (
              <View key={asset.uri} style={styles.imageWrap}>
                <Image source={{ uri: asset.uri }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(asset.uri)}>
                  <Ionicons name="close-circle" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Pick image button */}
        {images.length < MAX_IMAGES && (
          <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
            <Ionicons name="image-outline" size={22} color={colors.nomad.primary} />
            <Text style={styles.addImageText}>
              {images.length === 0 ? t('createPostAddPhoto') : `${t('createPostAddPhoto')} (${images.length}/${MAX_IMAGES})`}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.nomad.surface },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 52, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.nomad.outlineVariant },
  headerBtn:    { padding: 4 },
  headerTitle:  { fontSize: 16, fontWeight: '700', color: colors.nomad.onSurface },
  submitBtn:    { backgroundColor: colors.nomad.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full },
  submitText:   { color: colors.nomad.onPrimary, fontWeight: '700', fontSize: 14 },
  body:         { padding: spacing.lg, gap: spacing.lg },
  input:        { minHeight: 140, fontSize: 15, color: colors.nomad.onSurface, lineHeight: 23 },
  imageRow:     { marginTop: spacing.sm },
  imageWrap:    { position: 'relative' },
  previewImage: { width: 120, height: 120, borderRadius: radius.md },
  removeBtn:    { position: 'absolute', top: 4, right: 4 },
  addImageBtn:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.nomad.primary, borderRadius: radius.lg, borderStyle: 'dashed', alignSelf: 'flex-start' },
  addImageText: { fontSize: 14, color: colors.nomad.primary, fontWeight: '600' },
  tripBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.nomad.secondaryContainer, borderRadius: radius.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.nomad.primary + '40' },
  tripBannerText: { fontSize: 13, color: colors.nomad.primary, fontWeight: '500', flex: 1 },
});

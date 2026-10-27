import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileCard, type ProfileCardData } from '@/src/components/ui/ProfileCard';

const SAMPLE_PROFILE: ProfileCardData = {
  id: 'demo-1',
  name: 'Minh Anh',
  avatar: 'https://i.pravatar.cc/600?img=47',
  bio: 'Full-stack developer passionate about technology, design and building useful things.',
  followers: 312,
  following: 48,
  verified: true,
};

/**
 * Màn demo riêng cho ProfileCard — không gắn vào luồng điều hướng chính,
 * chỉ để xem trực quan 3 biến thể màu. Xoá file này nếu không cần giữ lại.
 */
export default function ProfileCardDemoScreen() {
  const insets = useSafeAreaInsets();

  function handleFollow(name: string, following: boolean) {
    Alert.alert(name, following ? 'Đã theo dõi' : 'Đã bỏ theo dõi');
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#12152B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ProfileCard — demo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Light</Text>
          <View style={styles.lightBg}>
            <ProfileCard
              profile={SAMPLE_PROFILE}
              variant="light"
              onFollow={(f) => handleFollow(SAMPLE_PROFILE.name, f)}
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Soft glass</Text>
          <LinearGradient
            colors={['#7C9CF5', '#B892F0', '#F5A6C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glassBg}
          >
            <ProfileCard
              profile={SAMPLE_PROFILE}
              variant="soft-glass"
              onFollow={(f) => handleFollow(SAMPLE_PROFILE.name, f)}
              onPress={() => {}}
            />
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Dark</Text>
          <View style={styles.darkBg}>
            <ProfileCard
              profile={SAMPLE_PROFILE}
              variant="dark"
              onFollow={(f) => handleFollow(SAMPLE_PROFILE.name, f)}
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F5F7' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingBottom: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#12152B' },

  scrollContent: { padding: 20, gap: 28, paddingBottom: 48 },
  section: { gap: 10 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9096A6', textTransform: 'uppercase', letterSpacing: 0.5 },

  lightBg: { backgroundColor: '#F4F5F7', padding: 20, borderRadius: 20, alignItems: 'center' },
  glassBg: { padding: 20, borderRadius: 20, alignItems: 'center' },
  darkBg: { backgroundColor: '#0B0D18', padding: 20, borderRadius: 20, alignItems: 'center' },
});

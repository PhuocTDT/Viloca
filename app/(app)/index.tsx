import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Image, Dimensions,
  type ImageSourcePropType, type ScrollViewInstance,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/src/theme/colors';
import { useMascot } from '@/hooks/useMascot';
import MascotAvatar from '@/components/Mascot/MascotAvatar';
import { useFestivals } from '@/src/hooks/useFestivals';
import { useLocations } from '@/src/hooks/useLocations';
import { FilterSheet, FilterTab, EMPTY_FILTERS } from '@/src/components/home/FilterSheet';
import { VN_CITY_CENTERS } from '@/src/lib/vn-cities';
import { setPendingSearchFilters } from '@/store/searchFilters';
import { HomeSectionHeader } from '@/src/components/home/HomeSectionHeader';
import { JustForYouCard } from '@/src/components/home/JustForYouCard';
import { NearbyListItem } from '@/src/components/home/NearbyListItem';
import { useFeaturedLocation } from '@/src/hooks/useFeaturedLocation';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { usePlaceDistances } from '@/src/hooks/usePlaceDistances';
import { MyTripCard } from '@/src/components/home/MyTripCard';
import { useLangStore } from '@/src/store/langStore';
import { useT, type StringKey } from '@/src/lib/i18n';
import { InfoAlertModal } from '@/src/components/ui/InfoAlertModal';
import type { FestivalWithStatus } from '@/src/hooks/useFestivals';
import type { Location } from '@/src/types';

const { width: SCREEN_W } = Dimensions.get('window');
const CAROUSEL_W = SCREEN_W - 96;
const JFY_CARD_W = Math.round(SCREEN_W * 0.32); // "Just for you" row: ~3 cards + peek of a 4th

/** Khoảng cách đường chim bay (m) — chỉ để SẮP XẾP "Gần bạn", không hiển thị.
 *  Nhãn hiển thị vẫn lấy từ usePlaceDistances (qua Google Routes). */
function haversineMeters(a: { lat: number; lng: number }, b: { latitude: number; longitude: number }): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.lat) * Math.PI) / 180;
  const dLng = ((b.longitude - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}


/** Chỉ số chấm sẽ hiển thị cho carousel — tối đa `max` chấm, cửa sổ trượt theo vị trí đang active. */
function visibleDotIndices(total: number, active: number, max = 5): number[] {
  if (total <= max) return Array.from({ length: total }, (_, i) => i);
  const start = Math.max(0, Math.min(active - Math.floor(max / 2), total - max));
  return Array.from({ length: max }, (_, i) => start + i);
}

function festivalBadge(f: FestivalWithStatus, t: (k: StringKey) => string) {
  if (f.displayStatus === 'coming_soon') return t('festComingSoon');
  if (f.displayStatus === 'days_away')   return `${f.daysAway} ${t('festDaysAway')}`;
  return `${f.monthsAway} ${t('festMonthsAway')}`;
}

// ─── "Sen đề xuất" quick-action grid ─────────────────────────────────────────
interface SenGridItemDef {
  labelKey: StringKey;
  icon: ImageSourcePropType;
  onPress: () => void;
}

function SenGridButton({ item, label }: { item: SenGridItemDef; label: string }) {
  return (
    <TouchableOpacity style={styles.senGridItem} activeOpacity={0.75} onPress={item.onPress}>
      <Image source={item.icon} style={styles.senGridIcon} resizeMode="contain" />
      <Text style={styles.senGridLabel} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Festival carousel card ──────────────────────────────────────────────────
function FestivalCarouselCard({ festival }: { festival: FestivalWithStatus }) {
  const t = useT();
  return (
    <TouchableOpacity activeOpacity={0.9}>
      <View style={[styles.festivalCard, { width: CAROUSEL_W }]}>
        {festival.cover_image ? (
          <ExpoImage
            source={{ uri: festival.cover_image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <LinearGradient
            colors={[colors.nomad.primaryContainer, colors.nomad.primary]}
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.78)']}
          locations={[0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.festivalBadge}>
          <Text style={styles.festivalBadgeText}>{festivalBadge(festival, t)}</Text>
        </View>
        <View style={styles.festivalInfo}>
          <Text style={styles.festivalTitle} numberOfLines={2}>{festival.name}</Text>
          <Text style={styles.festivalSub}>📍 {festival.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets    = useSafeAreaInsets();
  const user      = useAuthStore((s) => s.user);
  const { lang, toggle: toggleLang } = useLangStore();
  const t = useT();
  const firstName = user?.user_metadata?.full_name?.split(' ').pop() ?? t('homeFallbackName');
  const mascot = useMascot();

  const [sheetVisible, setSheetVisible]     = useState(false);
  const [sheetTab, setSheetTab]             = useState<FilterTab>('category');
  const [festivalIndex, setFestivalIndex]   = useState(0);
  const [nearbyY, setNearbyY]     = useState(0);
  const [festivalY, setFestivalY] = useState(0);
  const [senGridPage, setSenGridPage] = useState(0);
  const festivalRef   = useRef<ScrollViewInstance>(null);
  const mainScrollRef = useRef<ScrollViewInstance>(null);

  function scrollToY(y: number) {
    mainScrollRef.current?.scrollTo({ y: Math.max(y - 8, 0), animated: true });
  }

  const { festivals, loading: festivalsLoading }  = useFestivals();
  const { locations, loading: forYouLoading }      = useLocations(20, null, null);
  const { location: featuredLocation }             = useFeaturedLocation(null);
  const { coords: userCoords, permissionDenied }   = useUserLocation();

  // "Just for you": thẻ nổi bật lên đầu, phần còn lại xáo một lần mỗi phiên
  const restLocations = useMemo(
    () => locations.filter((l) => l.id !== featuredLocation?.id),
    [locations, featuredLocation]
  );
  const [shuffledRest, setShuffledRest] = useState<Location[]>([]);
  const hasPickedRef = useRef(false);
  useEffect(() => {
    if (restLocations.length === 0) return;
    if (hasPickedRef.current && shuffledRest.length > 0) return;
    hasPickedRef.current = true;
    setShuffledRest([...restLocations].sort(() => Math.random() - 0.5));
  }, [restLocations]);
  const justForYouLocations = useMemo(
    () => (featuredLocation ? [featuredLocation, ...shuffledRest] : shuffledRest).slice(0, 8),
    [featuredLocation, shuffledRest]
  );

  // Alert.alert() không render gì trên react-native-web, nên dùng InfoAlertModal
  // (state bên dưới) thay vì Alert.alert() để hoạt động đúng trên cả web lẫn native.
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string } | null>(null);

  const senGridItems: SenGridItemDef[] = [
    { labelKey: 'gridNearby',     icon: require('@/assets/sen-grid/nearby.png'),    onPress: () => scrollToY(nearbyY) },
    { labelKey: 'gridMissions',   icon: require('@/assets/sen-grid/missions.png'),  onPress: () => router.push('/(app)/profile/missions') },
    { labelKey: 'gridDailyCheckin', icon: require('@/assets/sen-grid/daily-checkin.png'), onPress: () => router.push('/(app)/profile/checkin') },
    { labelKey: 'gridLeaderboard',  icon: require('@/assets/sen-grid/leaderboard.png'),   onPress: () => router.push('/(app)/profile/leaderboard') },
    { labelKey: 'gridFood',       icon: require('@/assets/sen-grid/food.png'),      onPress: () => router.push({ pathname: '/search', params: { category: 'Ẩm thực', near: '1' } }) },
    { labelKey: 'gridFestival',   icon: require('@/assets/sen-grid/festivals.png'), onPress: () => scrollToY(festivalY) },
    { labelKey: 'gridStay',       icon: require('@/assets/sen-grid/stays.png'),     onPress: () => router.push({ pathname: '/search', params: { category: 'Lưu trú', near: '1' } }) },
    { labelKey: 'gridCheckin',    icon: require('@/assets/sen-grid/checkin.png'),   onPress: () => router.push({ pathname: '/search', params: { category: 'Check-in', near: '1' } }) },
    { labelKey: 'gridWeather',    icon: require('@/assets/sen-grid/weather.png'),   onPress: () => router.push('/weather') },
    { labelKey: 'gridFriends',    icon: require('@/assets/sen-grid/friends.png'),   onPress: () => router.push('/(app)/profile/friends') },
  ];
  // Chỉ hiện 2 dòng (4 cột x 2) mỗi lần — phần còn lại xem bằng cách vuốt ngang sang trang kế.
  const SEN_GRID_PAGE_SIZE = 8;
  const senGridPages: SenGridItemDef[][] = [];
  for (let i = 0; i < senGridItems.length; i += SEN_GRID_PAGE_SIZE) {
    senGridPages.push(senGridItems.slice(i, i + SEN_GRID_PAGE_SIZE));
  }

  // "Gần bạn": 3 địa điểm gần nhất theo đường chim bay, cần có tọa độ + vị trí người dùng
  const nearbyLocations = useMemo(() => {
    if (!userCoords) return [];
    return locations
      .filter((l) => l.coordinates != null)
      .map((l) => ({ loc: l, meters: haversineMeters(l.coordinates!, userCoords) }))
      .sort((a, b) => a.meters - b.meters)
      .slice(0, 3)
      .map((x) => x.loc);
  }, [locations, userCoords]);

  // Build coords list for distance calculation (featured + just-for-you + nearby)
  const allCoordsForDistance = useMemo(() => {
    const byId = new Map<string, { id: string; lat: number; lng: number }>();
    for (const l of [...justForYouLocations, ...nearbyLocations]) {
      if (l.coordinates && !byId.has(l.id)) {
        byId.set(l.id, { id: l.id, lat: l.coordinates.lat, lng: l.coordinates.lng });
      }
    }
    return Array.from(byId.values());
  }, [justForYouLocations, nearbyLocations]);

  const distanceMap = usePlaceDistances(allCoordsForDistance, userCoords);

  // Chỉ show festivals trong vòng 1 tháng tới
  const nearFestivals = festivals.filter(
    (f) => f.displayStatus !== 'months_away' || (f.monthsAway ?? 99) <= 1
  );

  // Auto-scroll festival carousel every 3.5s
  useEffect(() => {
    if (nearFestivals.length <= 1) return;
    const interval = setInterval(() => {
      const next = (festivalIndex + 1) % nearFestivals.length;
      festivalRef.current?.scrollTo({ x: next * (CAROUSEL_W + 14), animated: true });
      setFestivalIndex(next);
    }, 3500);
    return () => clearInterval(interval);
  }, [festivalIndex, nearFestivals.length]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* ── Background decoration ── */}
      <View style={styles.bgBlobMidLeft} pointerEvents="none" />

      <ScrollView
        ref={mainScrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerBrand}>
            <Image source={require('@/assets/viloca-logo.png')} style={styles.logoImg} resizeMode="contain" />
            <View>
              <Text style={styles.brandName}>Viloca</Text>
              <Text style={styles.brandSub}>{t('homeTagline')}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon} onPress={toggleLang}>
              <Ionicons name="globe-outline" size={22} color={colors.nomad.onSurface} />
              <Text style={styles.langBadge}>{lang.toUpperCase()}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <View>
                <Ionicons name="notifications-outline" size={22} color={colors.nomad.onSurface} />
                <View style={styles.notifDot} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero Card ── */}
        <View style={styles.greetingCard}>
          <LinearGradient
            colors={['#F1F8E9', '#E8F3DC']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
          />
          <View style={styles.heroCardBody}>
            <View style={styles.heroCardLeft}>
              <Text style={styles.greetingName}>
                {t('homeGreeting')} {firstName},{' '}
                <Text style={styles.greetingTagline}>{t('homeTodayQ')}</Text>
              </Text>
              <View style={styles.senBubble}>
                <Text style={styles.senBubbleText}>{mascot.senMessage}</Text>
              </View>
            </View>
            <MascotAvatar emotion={mascot.emotion} size={100} />
          </View>
        </View>{/* greetingCard */}

        {/* ── Search bar ── */}
        <View style={styles.searchBar}>
          <TouchableOpacity style={styles.searchInput} activeOpacity={0.85} onPress={() => router.push({ pathname: '/search', params: { near: '1' } })}>
            <Ionicons name="search-outline" size={15} color="#9E9E9E" />
            <Text style={styles.searchPlaceholder}>{t('homeSearchHint')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn} onPress={() => { setSheetTab('category'); setSheetVisible(true); }}>
            <Ionicons name="options-outline" size={14} color={colors.nomad.primary} />
          </TouchableOpacity>
        </View>

        {/* ── My trip: today's schedule or next upcoming trip ── */}
        <MyTripCard />

        {/* ── Sen đề xuất (quick-action grid, 2 dòng/trang, vuốt ngang để xem thêm) ── */}
        <HomeSectionHeader title={t('homeSenSuggest')} />
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={senGridPages.length <= 1 ? { marginBottom: 28 } : undefined}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
            setSenGridPage(Math.max(0, Math.min(idx, senGridPages.length - 1)));
          }}
        >
          {senGridPages.map((page, pageIdx) => (
            <View key={pageIdx} style={[styles.senGridPage, { width: SCREEN_W }]}>
              {page.map((item) => (
                <SenGridButton key={item.labelKey} item={item} label={t(item.labelKey)} />
              ))}
            </View>
          ))}
        </ScrollView>
        {senGridPages.length > 1 && (
          <View style={styles.senGridDotsWrap}>
            {senGridPages.map((_, i) => (
              <View key={i} style={[styles.senGridDot, i === senGridPage && styles.senGridDotActive]} />
            ))}
          </View>
        )}

        {/* ── Just for you ── */}
        <HomeSectionHeader
          title={t('homeForYou')}
          onViewAll={() => router.push('/(app)/explore')}
        />

        {forYouLoading ? (
          <ActivityIndicator color={colors.nomad.primary} style={{ marginVertical: 24 }} />
        ) : justForYouLocations.length === 0 ? (
          <Text style={styles.emptyText}>{t('homeEmptyCategory')}</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.justForYouRow}
          >
            {justForYouLocations.map((loc) => (
              <JustForYouCard key={loc.id} location={loc} width={JFY_CARD_W} />
            ))}
          </ScrollView>
        )}

        {/* ── Gần bạn ── */}
        <View onLayout={(e) => setNearbyY(e.nativeEvent.layout.y)}>
          <HomeSectionHeader title={t('homeNearby')} />

          {permissionDenied ? (
            <Text style={styles.locationHint}>{t('homeLocationHint')}</Text>
          ) : !userCoords ? (
            <ActivityIndicator color={colors.nomad.primary} style={{ marginVertical: 16 }} />
          ) : nearbyLocations.length === 0 ? (
            <Text style={styles.emptyText}>{t('homeEmptyCategory')}</Text>
          ) : (
            nearbyLocations.map((loc) => (
              <NearbyListItem key={loc.id} location={loc} distanceLabel={distanceMap.get(loc.id)} />
            ))
          )}
        </View>

        {/* ── Don't Miss ── */}
        <View onLayout={(e) => setFestivalY(e.nativeEvent.layout.y)}>
          <View style={[styles.sectionHeader, { marginTop: 32 }]}>
            <Text style={styles.sectionTitle}>{t('homeDontMiss')}</Text>
            <Text style={styles.seeAll}>{t('viewAll')}</Text>
          </View>

          {festivalsLoading ? (
            <ActivityIndicator color={colors.nomad.primary} style={{ marginVertical: 32 }} />
          ) : nearFestivals.length === 0 ? (
            <Text style={styles.emptyText}>{t('homeEmptyFestivals')}</Text>
          ) : (
            <View>
              <ScrollView
                ref={festivalRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CAROUSEL_W + 14}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / (CAROUSEL_W + 14));
                  setFestivalIndex(Math.max(0, Math.min(idx, nearFestivals.length - 1)));
                }}
              >
                {nearFestivals.map((f) => <FestivalCarouselCard key={f.id} festival={f} />)}
              </ScrollView>
              {nearFestivals.length > 1 && (
                <View style={styles.dotsWrap}>
                  <View style={styles.dotsPill}>
                    {visibleDotIndices(nearFestivals.length, festivalIndex).map((i) => (
                      <View key={i} style={[styles.dot, i === festivalIndex && styles.dotActive]} />
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <FilterSheet
        visible={sheetVisible}
        initialTab={sheetTab}
        onClose={() => setSheetVisible(false)}
        filters={EMPTY_FILTERS}
        cityOptions={[{ code: 'near', tKey: 'searchNearMe' }, ...VN_CITY_CENTERS.map((c) => ({ code: c.code as string, tKey: c.tKey }))]}
        onApply={(filters) => {
          setPendingSearchFilters(filters);
          router.push({ pathname: '/search', params: { near: '1' } });
        }}
      />

      <InfoAlertModal
        visible={alertInfo !== null}
        title={alertInfo?.title ?? ''}
        message={alertInfo?.message ?? ''}
        onClose={() => setAlertInfo(null)}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.nomad.background },

  // Background decoration
  bgBlobMidLeft: {
    position: 'absolute', top: 160, left: -50,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: colors.nomad.onPrimaryContainer, opacity: 0.5,
  },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  logoImg:     { width: 38, height: 38 },
  headerIcon:  { padding: 2, alignItems: 'center' },
  langBadge:   { fontSize: 9, fontWeight: '700', color: colors.nomad.onSurface, lineHeight: 11, opacity: 0.7 },
  brandName:   { fontSize: 20, fontWeight: '700', color: colors.nomad.primary, lineHeight: 24 },
  brandSub:    { fontSize: 11, color: '#8A8A8A' },
  notifDot:    { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D6D', borderWidth: 1.5, borderColor: '#fff' },

  // Hero card
  greetingCard:    { marginHorizontal: 16, marginTop: 10, marginBottom: 12, borderRadius: 24, padding: 14, overflow: 'hidden', shadowColor: '#3a6010', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  heroCardBody:    { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  heroCardLeft:    { flex: 1, gap: 10 },
  greetingName:    { fontSize: 15, fontWeight: '900', color: '#1C1C1C', lineHeight: 18 },
  greetingTagline: { fontSize: 15, fontWeight: '900', color: '#3E7B27', lineHeight: 18 },
  senBubble:       { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 1 },
  senBubbleText:   { fontSize: 13, color: '#3D3D3D', lineHeight: 18, fontWeight: '600' },

  // Search
  searchBar:         { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: 20, height: 40, borderWidth: 1, borderColor: '#E5E5E5', paddingLeft: 12, paddingRight: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  searchInput:       { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, height: '100%' },
  searchPlaceholder: { flex: 1, fontSize: 13, color: '#9E9E9E' },
  filterBtn:         { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E3F0D6', alignItems: 'center', justifyContent: 'center' },

  // Section header for "Đừng bỏ lỡ" (manual header — has no onViewAll via HomeSectionHeader)
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.nomad.onSurface },
  seeAll:       { fontSize: 12, fontWeight: '600', color: colors.nomad.primary },

  // New: suggestion grid + location hint
  justForYouRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 24 },
  locationHint: { fontSize: 12, color: colors.nomad.onSurfaceVariant, textAlign: 'center', marginHorizontal: 16, marginBottom: 12 },

  // "Sen đề xuất" grid
  senGridPage:  { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  senGridItem:  { width: '25%', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 4 },
  senGridIcon:  { width: 52, height: 52 },
  senGridLabel: { fontSize: 11.5, fontWeight: '700', color: colors.nomad.onSurface, textAlign: 'center', lineHeight: 14 },
  senGridDotsWrap: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 28 },
  senGridDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.nomad.outlineVariant },
  senGridDotActive: { width: 16, height: 6, borderRadius: 3, backgroundColor: colors.nomad.primary },

  // Festival carousel
  festivalCard: {
    height: 150, borderRadius: 18,
    overflow: 'hidden', backgroundColor: colors.nomad.surfaceContainer,
  },
  festivalBadge:     { position: 'absolute', top: 10, left: 10, backgroundColor: colors.nomad.primary, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 },
  festivalBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  festivalInfo:      { position: 'absolute', bottom: 12, left: 14, right: 14 },
  festivalTitle:     { fontSize: 15, fontWeight: '700', color: '#fff', lineHeight: 19, marginBottom: 2 },
  festivalSub:       { fontSize: 10.5, color: 'rgba(255,255,255,0.8)' },

  // Dots
  dotsWrap: { alignItems: 'center', marginTop: 14 },
  dotsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6,
  },
  dot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.nomad.outlineVariant },
  dotActive: { width: 22, height: 7, borderRadius: 4, backgroundColor: colors.nomad.primary },

  emptyText: { paddingHorizontal: 20, fontSize: 13, color: colors.nomad.onSurfaceVariant },
});

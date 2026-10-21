import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Image, ImageBackground, Dimensions,
} from 'react-native';
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
import { FilterSheet, FilterTab } from '@/src/components/home/FilterSheet';
import { CategoryChips } from '@/src/components/home/CategoryChips';
import { HomeSectionHeader } from '@/src/components/home/HomeSectionHeader';
import { FeaturedPlaceCard } from '@/src/components/home/FeaturedPlaceCard';
import { PlaceGridCard } from '@/src/components/home/PlaceGridCard';
import { useFeaturedLocation } from '@/src/hooks/useFeaturedLocation';
import { useUserLocation } from '@/src/hooks/useUserLocation';
import { usePlaceDistances } from '@/src/hooks/usePlaceDistances';
import { VibeChips } from '@/src/components/home/VibeChips';
import { MyTripCard } from '@/src/components/home/MyTripCard';
import { usePreferredVibes } from '@/src/hooks/usePreferredVibes';
import { useLangStore } from '@/src/store/langStore';
import { useT, type StringKey } from '@/src/lib/i18n';
import type { FestivalWithStatus } from '@/src/hooks/useFestivals';
import type { Location } from '@/src/types';

const { width: SCREEN_W } = Dimensions.get('window');
const CAROUSEL_W = SCREEN_W - 56;
const CARD_WIDTH      = Math.floor((SCREEN_W - 16 - 16 - 12) / 2);
const CARD_FULL_WIDTH = SCREEN_W - 16 - 16; // grid paddingHorizontal 16 each side


function festivalBadge(f: FestivalWithStatus, t: (k: StringKey) => string) {
  if (f.displayStatus === 'coming_soon') return t('festComingSoon');
  if (f.displayStatus === 'days_away')   return `${f.daysAway} ${t('festDaysAway')}`;
  return `${f.monthsAway} ${t('festMonthsAway')}`;
}

function cityLabel(code: string | null, t: (k: StringKey) => string) {
  if (code === 'SG') return t('cityHCM');
  if (code === 'HN') return t('cityHN');
  if (code === 'DN') return t('cityDN');
  return code ?? '';
}

// ─── Festival carousel card ──────────────────────────────────────────────────
function FestivalCarouselCard({ festival }: { festival: FestivalWithStatus }) {
  const t = useT();
  return (
    <TouchableOpacity activeOpacity={0.9}>
      <ImageBackground
        source={festival.cover_image ? { uri: festival.cover_image } : undefined}
        style={[styles.festivalCard, { width: CAROUSEL_W }]}
        resizeMode="cover"
        imageStyle={{ borderRadius: 24 }}
      >
        {!festival.cover_image && (
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
      </ImageBackground>
    </TouchableOpacity>
  );
}

// ─── Carousel card (auto-scroll) ─────────────────────────────────────────────
function CarouselCard({ location }: { location: Location }) {
  const t = useT();
  const firstPhoto    = location.photos?.split(',')[0]?.trim();
  const subtitle      = [location.district, cityLabel(location.city, t)].filter(Boolean).join(', ');
  const firstCategory = location.category?.split(',')[0]?.trim();
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => router.push(`/location/${location.id}`)}>
      <ImageBackground
        source={firstPhoto ? { uri: firstPhoto } : undefined}
        style={[styles.carouselCard, { width: CAROUSEL_W }]}
        resizeMode="cover"
        imageStyle={{ borderRadius: 20 }}
      >
        {!firstPhoto && (
          <LinearGradient
            colors={[colors.nomad.surfaceDim, colors.nomad.inverseSurface]}
            style={StyleSheet.absoluteFill}
          />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.82)']}
          locations={[0.25, 1]}
          style={StyleSheet.absoluteFill}
        />
        {firstCategory && (
          <View style={styles.carouselBadge}>
            <Text style={styles.carouselBadgeText}>{firstCategory}</Text>
          </View>
        )}
        <View style={styles.carouselInfo}>
          <Text style={styles.carouselName} numberOfLines={1}>{location.name}</Text>
          <View style={styles.carouselSubRow}>
            <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.75)" />
            <Text style={styles.carouselSub}>{subtitle}</Text>
          </View>
        </View>
      </ImageBackground>
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

  const [activeVibe,     setActiveVibe]     = useState<string | null>(null);
  const [sheetVisible, setSheetVisible]     = useState(false);
  const [sheetTab, setSheetTab]             = useState<FilterTab>('category');
  const [carouselIndex, setCarouselIndex]   = useState(0);
  const [festivalIndex, setFestivalIndex]   = useState(0);
  const carouselRef  = useRef<ScrollView>(null);
  const festivalRef  = useRef<ScrollView>(null);

  const { festivals, loading: festivalsLoading }  = useFestivals();
  const { locations, loading: locationsLoading }   = useLocations(20, null, activeVibe);
  const { location: featuredLocation }             = useFeaturedLocation(null);
  const { coords: userCoords, permissionDenied }   = useUserLocation();
  const { vibes: preferredVibes, loading: preferredVibesLoading } = usePreferredVibes();

  // Grid excludes the featured card
  const gridLocations = useMemo(
    () => locations.filter((l) => l.id !== featuredLocation?.id),
    [locations, featuredLocation]
  );

  // Pick 3 random — re-randomise on mount only
  const [displayLocations, setDisplayLocations] = useState<Location[]>([]);
  const hasPickedRef = useRef(false);
  useEffect(() => {
    if (gridLocations.length === 0) return;
    if (hasPickedRef.current && displayLocations.length > 0) return;
    hasPickedRef.current = true;
    const shuffled = [...gridLocations].sort(() => Math.random() - 0.5);
    setDisplayLocations(shuffled.slice(0, 3));
  }, [gridLocations]);

  // Build coords list for distance calculation (featured + 3 grid cards)
  const allCoordsForDistance = useMemo(() => [
    ...(featuredLocation?.coordinates
      ? [{ id: featuredLocation.id, lat: featuredLocation.coordinates.lat, lng: featuredLocation.coordinates.lng }]
      : []),
    ...displayLocations
      .filter((l) => l.coordinates != null)
      .map((l) => ({ id: l.id, lat: l.coordinates!.lat, lng: l.coordinates!.lng })),
  ], [featuredLocation, displayLocations]);

  const distanceMap = usePlaceDistances(allCoordsForDistance, userCoords);

  // Chỉ show festivals trong vòng 1 tháng tới
  const nearFestivals = festivals.filter(
    (f) => f.displayStatus !== 'months_away' || (f.monthsAway ?? 99) <= 1
  );

  // Auto-scroll location carousel every 3s
  useEffect(() => {
    if (locations.length === 0) return;
    const interval = setInterval(() => {
      const next = (carouselIndex + 1) % locations.length;
      carouselRef.current?.scrollTo({ x: next * (CAROUSEL_W + 14), animated: true });
      setCarouselIndex(next);
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselIndex, locations.length]);

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
      <LinearGradient
        colors={['rgba(232,255,194,0.5)', 'rgba(250,250,240,0)']}
        locations={[0, 1]}
        style={styles.bgGradient}
        pointerEvents="none"
      />
      <View style={styles.bgBlobTopRight} pointerEvents="none" />
      <View style={styles.bgBlobMidLeft} pointerEvents="none" />

      <ScrollView
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
          <View style={styles.heroDecorCircle} pointerEvents="none" />
          <View style={styles.heroCardBody}>
            <View style={styles.heroCardLeft}>
              <View style={styles.heroBadge}>
                <View style={styles.heroDot} />
                <Text style={styles.heroLabelText}>{t('homeSidekick')}</Text>
              </View>
              <Text style={styles.greetingName}>{t('homeGreeting')} {firstName},</Text>
              <Text style={styles.greetingTagline}>{t('homeTodayQ')}</Text>
            </View>
            <MascotAvatar emotion={mascot.emotion} size={160} />
          </View>
          <View style={styles.senBubbleTail} />
          <View style={styles.senBubble}>
            <Text style={styles.senBubbleText}>{mascot.senMessage}</Text>
          </View>
        </View>{/* greetingCard */}

        {/* ── Search bar ── */}
        <View style={styles.searchBar}>
          <TouchableOpacity style={styles.searchInput} activeOpacity={0.85} onPress={() => router.push('/search')}>
            <Ionicons name="search-outline" size={18} color="#9E9E9E" />
            <Text style={styles.searchPlaceholder}>{t('homeSearchHint')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn} onPress={() => { setSheetTab('category'); setSheetVisible(true); }}>
            <Ionicons name="options-outline" size={18} color={colors.nomad.primary} />
          </TouchableOpacity>
        </View>

        {/* ── My trip: today's schedule or next upcoming trip ── */}
        <MyTripCard />

        {/* ── Vibe chips (from DB vibes table) ── */}
        <VibeChips
          selected={activeVibe}
          onSelect={setActiveVibe}
          preferredVibe={preferredVibes[0] ?? null}
          preferredLoading={preferredVibesLoading}
        />

        {/* ── Category chips — tap to open search filtered by category ── */}
        <CategoryChips />

        {/* ── Dành riêng cho bạn ── */}
        <HomeSectionHeader
          title={t('homeForYou')}
          subtitle={t('homeForYouSub')}
          onViewAll={() => router.push('/(app)/explore')}
        />

        {/* Location hint when permission denied */}
        {permissionDenied && (
          <Text style={styles.locationHint}>{t('homeLocationHint')}</Text>
        )}

        {/* Featured card */}
        {featuredLocation && (
          <FeaturedPlaceCard
            location={featuredLocation}
            distanceLabel={distanceMap.get(featuredLocation.id)}
          />
        )}

        {/* 2-column suggestion grid — 3 random per session */}
        {locationsLoading ? (
          <ActivityIndicator color={colors.nomad.primary} style={{ marginVertical: 24 }} />
        ) : displayLocations.length === 0 ? (
          <Text style={styles.emptyText}>{t('homeEmptyCategory')}</Text>
        ) : (
          <View style={styles.grid}>
            {displayLocations.map((loc, i) => (
              <PlaceGridCard
                key={loc.id}
                location={loc}
                distanceLabel={distanceMap.get(loc.id)}
                width={i === 0 ? CARD_FULL_WIDTH : CARD_WIDTH}
                imageRatio={i === 0 ? 0.45 : 0.72}
                overlay={i === 0}
              />
            ))}
          </View>
        )}

        {/* ── Don't Miss ── */}
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
                  {nearFestivals.map((_, i) => (
                    <View key={i} style={[styles.dot, i === festivalIndex && styles.dotActive]} />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Must Visit (auto-scroll carousel) ── */}
        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>{t('homeMustVisit')}</Text>
        </View>

        {locationsLoading ? (
          <ActivityIndicator color={colors.nomad.primary} style={{ marginVertical: 24 }} />
        ) : locations.length === 0 ? (
          <Text style={styles.emptyText}>{t('homeEmptyPlaces')}</Text>
        ) : (
          <View>
            <ScrollView
              ref={carouselRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CAROUSEL_W + 14}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (CAROUSEL_W + 14));
                setCarouselIndex(Math.max(0, Math.min(idx, locations.length - 1)));
              }}
            >
              {locations.map((loc) => <CarouselCard key={loc.id} location={loc} />)}
            </ScrollView>

            {/* Dot indicators */}
            <View style={styles.dotsWrap}>
              <View style={styles.dotsPill}>
                {locations.map((_, i) => (
                  <View key={i} style={[styles.dot, i === carouselIndex && styles.dotActive]} />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <FilterSheet
        visible={sheetVisible}
        initialTab={sheetTab}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.nomad.background },

  // Background decoration
  bgGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 280,
  },
  bgBlobTopRight: {
    position: 'absolute', top: -40, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: colors.nomad.secondaryContainer, opacity: 0.35,
  },
  bgBlobMidLeft: {
    position: 'absolute', top: 160, left: -50,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: colors.nomad.onPrimaryContainer, opacity: 0.5,
  },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoImg:     { width: 38, height: 38 },
  headerIcon:  { padding: 2, alignItems: 'center' },
  langBadge:   { fontSize: 9, fontWeight: '700', color: colors.nomad.onSurface, lineHeight: 11, opacity: 0.7 },
  brandName:   { fontSize: 20, fontWeight: '700', color: colors.nomad.primary, lineHeight: 24 },
  brandSub:    { fontSize: 11, color: '#8A8A8A' },
  notifDot:    { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D6D', borderWidth: 1.5, borderColor: '#fff' },

  // Hero card
  greetingCard:    { marginHorizontal: 16, marginTop: 10, marginBottom: 12, borderRadius: 24, padding: 12, paddingBottom: 10, overflow: 'hidden', shadowColor: '#3a6010', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  heroDecorCircle: { position: 'absolute', bottom: -44, right: -44, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(160,210,100,0.22)' },
  heroCardBody:    { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  heroCardLeft:    { flex: 1 },
  heroBadge:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  heroDot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.nomad.primary },
  heroLabelText:   { fontSize: 12, color: colors.nomad.primary, fontWeight: '500' },
  greetingName:    { fontSize: 24, fontWeight: '800', color: '#1C1C1C', lineHeight: 30 },
  greetingTagline: { fontSize: 24, fontWeight: '800', color: '#3E7B27', lineHeight: 30 },
  senBubbleTail:   { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#fff', marginRight: 72, alignSelf: 'flex-end' },
  senBubble:       { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 1 },
  senBubbleText:   { fontSize: 13, color: '#3D3D3D', lineHeight: 19 },

  // Search
  searchBar:         { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: 28, height: 56, borderWidth: 1, borderColor: '#E5E5E5', paddingLeft: 16, paddingRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  searchInput:       { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: '100%' },
  searchPlaceholder: { flex: 1, fontSize: 15, color: '#9E9E9E' },
  filterBtn:         { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F0D6', alignItems: 'center', justifyContent: 'center' },

  // Section headers (festivals + carousel — keep for "Đừng bỏ lỡ" and "Phải ghé một lần")
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.nomad.onSurface },
  seeAll:       { fontSize: 12, fontWeight: '600', color: colors.nomad.primary },

  // New: suggestion grid + location hint
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, marginBottom: 24 },
  locationHint: { fontSize: 12, color: colors.nomad.onSurfaceVariant, textAlign: 'center', marginHorizontal: 16, marginBottom: 12 },

  // Festival carousel
  festivalCard: {
    height: 220, borderRadius: 24,
    overflow: 'hidden', backgroundColor: colors.nomad.surfaceContainer,
  },
  festivalBadge:     { position: 'absolute', top: 16, left: 16, backgroundColor: colors.nomad.primary, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 },
  festivalBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  festivalInfo:      { position: 'absolute', bottom: 20, left: 20, right: 20 },
  festivalTitle:     { fontSize: 20, fontWeight: '700', color: '#fff', lineHeight: 26, marginBottom: 4 },
  festivalSub:       { fontSize: 12, color: 'rgba(255,255,255,0.8)' },

  // Carousel
  carouselCard: {
    height: 200, borderRadius: 20,
    overflow: 'hidden', backgroundColor: colors.nomad.surfaceContainer,
  },
  carouselBadge:     { position: 'absolute', top: 16, left: 16, backgroundColor: colors.nomad.primary, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
  carouselBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  carouselInfo:      { position: 'absolute', bottom: 20, left: 20, right: 20 },
  carouselName:      { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  carouselSubRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  carouselSub:       { fontSize: 12, color: 'rgba(255,255,255,0.75)' },

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

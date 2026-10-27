export type ExperienceCategory = 'food_tour' | 'workshop' | 'trekking' | 'cultural';
export type PlaceRegion = 'north' | 'central' | 'south';

/** @deprecated Use Location instead */
export interface Place {
  id: string;
  name: string;
  slug: string;
  region: PlaceRegion;
  cover_image: string | null;
  description: string | null;
  experience_types: string[];
  created_at: string;
}

export interface Festival {
  id: string;
  name: string;
  location: string;
  cover_image: string | null;
  month: number;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  tags: string[];
  created_at: string;
}
export type TripStatus = 'planning' | 'active' | 'completed';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export interface Experience {
  id: string;
  title: string;
  location: string;
  category: ExperienceCategory;
  price: number;
  rating: number;
  reviewCount: number;
  durationHours: number;
  coverImage: string;
  guideName: string;
  guideAvatar: string;
  description: string;
  tags: string[];
  isFeatured: boolean;
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  travel_style: string[];
  plan: 'free' | 'pro';
  ai_credits_remaining: number;
  created_at: string;
}

/** Tập con của Profile dùng cho danh sách/kết quả tìm kiếm (không cần fetch nguyên row). */
export type ProfileSummary = Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>;

/** ProfileSummary + bio + số người theo dõi/đang theo dõi — dùng cho ProfileCard ở màn tìm bạn. */
export type ProfileSearchResult = Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url' | 'bio'> & {
  followersCount: number;
  followingCount: number;
};

export interface CheckinMilestone {
  day_threshold: number;
  reward_credits: number;
  grants_shield: boolean;
}

export interface CheckinState {
  current_streak: number;
  last_checkin_date: string | null;
  streak_shields: number;
}

export interface CheckinResult {
  streak: number;
  credits_granted: number;
  shield_used: boolean;
  milestone_hit: number | null;
  shields_remaining: number;
}

export interface LeaderboardEntry extends ProfileSummary {
  rank: number;
  value: number;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  cover_image: string | null;
  status: TripStatus;
  summary_note: string | null;
  place_id: string | null;
  is_ai_generated: boolean;
  created_at: string;
}

export interface TripItem {
  id: string;
  trip_id: string;
  experience_id: string | null;
  location_id: string | null;
  experience_title: string | null;
  experience_location: string | null;
  experience_image: string | null;
  experience_category: string | null;
  day_number: number;
  time_slot: TimeSlot;
  visit_time: string | null;
  note: string | null;
  ai_reason: string | null;
  sort_order: number;
  // joined via select('*, locations(...)')
  locations?: {
    name: string;
    name_en: string | null;
    category: string | null;
    hint: string | null;
    hint_en: string | null;
    short_description: string | null;
    short_description_en: string | null;
    cover_image: string | null;
    photos: string | null;
    district: string | null;
    address: string | null;
    price_per_person: number | null;
    duration_minutes: number | null;
    rating: number | null;
    opening_hours: string | null;
    coordinates: { lat: number; lng: number } | null;
  } | null;
}

export interface Location {
  id: string;
  // Core / free-tier fields
  name: string;
  name_en: string | null;
  category: string;
  vibes: string[];
  hint: string | null;
  hint_en: string | null;
  cover_image: string | null;
  images: string[];
  price_per_person: number;
  duration_minutes: number;
  rating: number | null;
  // Premium fields
  address: string | null;
  coordinates: { lat: number; lng: number } | null;
  // Extended metadata (from enrich migration)
  city: string | null;
  district: string | null;
  google_maps_url: string | null;
  style_tag: string | null;
  price_level: number | null;
  opening_hours: string | null;
  closing_hours: string | null;
  off_days: string | null;
  phone: string | null;
  short_description: string | null;
  short_description_en: string | null;
  photos: string | null;
  verified: boolean;
  is_featured: boolean;
  // Admin / internal fields
  description: string | null;
  hint_generated_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  emoji: string | null;
  sort_order: number;
}

export type BookmarkStatus = 'want' | 'planned' | 'done';

export interface Bookmark {
  id: string;
  user_id: string;
  experience_id: string;
  status: BookmarkStatus;
  created_at: string;
}

export interface PackingItem {
  id: string;
  trip_id: string;
  name: string;
  is_packed: boolean;
  category: string;
  sort_order: number;
  created_at: string;
}

export interface TripJournal {
  id: string;
  trip_id: string;
  day_number: number;
  content: string;
  photos: string[];
  mood: 'great' | 'good' | 'okay' | 'tired' | null;
  weather: 'sunny' | 'rainy' | 'cloudy' | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  images: string[];
  location_id: string | null;
  trip_id: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
  post_likes?: { user_id: string }[];
  post_saves?: { user_id: string }[];
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}

export interface Mission {
  id: string;
  code: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  icon: string | null;
  verification_mode: 'server_count' | 'client_report';
  metric: string;
  target_count: number;
  reward_credits: number;
  is_active: boolean;
  sort_order: number;
}

export interface UserMissionProgress {
  mission_id: string;
  progress_count: number;
  completed_at: string | null;
  claimed_at: string | null;
}

export interface MissionWithProgress extends Mission {
  progressCount: number;
  completedAt: string | null;
  claimedAt: string | null;
}

import { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView,
  StyleSheet, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme/colors';
import { useT, type StringKey } from '@/src/lib/i18n';

export type FilterTab = 'category' | 'city' | 'style' | 'price';

export interface CityFilterOption {
  code: string | null; // null = "Tất cả"/"Gần bạn" tuỳ `tKey`
  tKey: StringKey;
}

export interface SearchFilters {
  categories: string[];
  city: string | null;
  vibes: string[];
  priceLevels: number[];
}

export const EMPTY_FILTERS: SearchFilters = { categories: [], city: null, vibes: [], priceLevels: [] };

export function filterCount(f: SearchFilters): number {
  return f.categories.length + f.vibes.length + f.priceLevels.length + (f.city ? 1 : 0);
}

const FILTER_TABS: { key: FilterTab; labelKey: StringKey; icon: string }[] = [
  { key: 'category', labelKey: 'filterTabCategory', icon: 'grid-outline' },
  { key: 'city',     labelKey: 'filterTabCity',      icon: 'business-outline' },
  { key: 'style',    labelKey: 'filterTabStyle',     icon: 'sparkles-outline' },
  { key: 'price',    labelKey: 'filterTabPrice',     icon: 'pricetag-outline' },
];

// Extracted from category column in DB
const CATEGORIES = [
  'Di tích', 'Kiến trúc', 'Nghệ thuật', 'Ẩm thực', 'Lịch sử',
  'Trải nghiệm', 'Tham quan', 'Văn hóa', 'Mua sắm', 'Check-in',
  'Workshop', 'Café', 'Du lịch cộng đồng', 'Trekking',
];

// Extracted from vibes column in DB (individual tags)
const VIBE_TAGS = [
  'Cổ kính', 'Hoài cổ', 'Lịch sử', 'Truyền thống', 'Dân gian',
  'Kiến trúc Pháp', 'Kiến trúc tối giản', 'Sang trọng', 'Lộng lẫy',
  'Nghệ thuật', 'Triển lãm', 'Biểu diễn', 'Đương đại',
  'Chụp ảnh', 'Check-in',
  'Yên tĩnh', 'Yên bình', 'Thư giãn', 'Sâu lắng',
  'Nhộn nhịp', 'Đông đúc',
  'Giáo dục', 'Bảo tàng',
  'Làng nghề', 'Thủ công', 'Bền vững',
  'Thiên nhiên', 'Nghỉ dưỡng', 'Bản địa',
];

// Matches price_level column values
const PRICE_LEVELS = [
  { value: 1, label: '₫   Miễn phí – 80k' },
  { value: 2, label: '₫₫   80k – 250k' },
  { value: 3, label: '₫₫₫   250k – 600k' },
  { value: 4, label: '₫₫₫₄   600k+' },
];

/** Danh sách lựa chọn dạng dropdown (1 chọn, có tick) — dùng cho tab City. */
function SingleSelectList({ items, selected, onSelect }: {
  items: { value: string | null; label: string }[];
  selected: string | null;
  onSelect: (v: string | null) => void;
}) {
  return (
    <View style={styles.optionList}>
      {items.map((item) => {
        const active = selected === item.value;
        return (
          <TouchableOpacity
            key={String(item.value)}
            style={[styles.optionRow, active && styles.optionRowActive]}
            onPress={() => onSelect(active ? null : item.value)}
          >
            <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{item.label}</Text>
            {active && <Ionicons name="checkmark" size={16} color={colors.nomad.primary} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** Danh sách lựa chọn nhiều — dùng cho tab Category/Vibe/Price. */
function MultiSelectList({ items, selected, onToggle }: {
  items: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <View style={styles.optionList}>
      {items.map((item) => {
        const active = selected.includes(item.value);
        return (
          <TouchableOpacity
            key={item.value}
            style={[styles.optionRow, active && styles.optionRowActive]}
            onPress={() => onToggle(item.value)}
          >
            <Ionicons
              name={active ? 'checkbox' : 'square-outline'}
              size={18}
              color={active ? colors.nomad.primary : colors.nomad.outline}
            />
            <Text style={[styles.optionLabel, { flex: 1 }, active && styles.optionLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

interface Props {
  visible: boolean;
  initialTab?: FilterTab;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (f: SearchFilters) => void;
  cityOptions: CityFilterOption[];
}

export function FilterSheet({ visible, initialTab = 'category', onClose, filters, onApply, cityOptions }: Props) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<FilterTab>(initialTab);
  const [draft, setDraft]         = useState<SearchFilters>(filters);

  // Mở sheet lại -> nạp lại từ filter đang áp dụng, để Huỷ (đóng không Apply) không mất lựa chọn cũ.
  useEffect(() => {
    if (visible) { setDraft(filters); setActiveTab(initialTab); }
  }, [visible, initialTab]);

  function toggleCategory(v: string) {
    setDraft((d) => ({ ...d, categories: d.categories.includes(v) ? d.categories.filter((x) => x !== v) : [...d.categories, v] }));
  }
  function toggleVibe(v: string) {
    setDraft((d) => ({ ...d, vibes: d.vibes.includes(v) ? d.vibes.filter((x) => x !== v) : [...d.vibes, v] }));
  }
  function togglePrice(v: string) {
    const n = Number(v);
    setDraft((d) => ({ ...d, priceLevels: d.priceLevels.includes(n) ? d.priceLevels.filter((x) => x !== n) : [...d.priceLevels, n] }));
  }

  function handleApply() {
    onApply(draft);
    onClose();
  }
  function handleClear() {
    setDraft(EMPTY_FILTERS);
  }

  const count = filterCount(draft);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>{t('filterSheetTitle')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.nomad.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}
        >
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any} size={14}
                color={activeTab === tab.key ? '#fff' : colors.nomad.onSurfaceVariant}
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Options */}
        <ScrollView style={styles.optionsScroll} showsVerticalScrollIndicator={false}>
          {activeTab === 'category' && (
            <MultiSelectList
              items={CATEGORIES.map((c) => ({ value: c, label: c }))}
              selected={draft.categories}
              onToggle={toggleCategory}
            />
          )}
          {activeTab === 'city' && (
            <SingleSelectList
              items={cityOptions.map((c) => ({ value: c.code, label: t(c.tKey) }))}
              selected={draft.city}
              onSelect={(v) => setDraft((d) => ({ ...d, city: v }))}
            />
          )}
          {activeTab === 'style' && (
            <MultiSelectList
              items={VIBE_TAGS.map((v) => ({ value: v, label: v }))}
              selected={draft.vibes}
              onToggle={toggleVibe}
            />
          )}
          {activeTab === 'price' && (
            <MultiSelectList
              items={PRICE_LEVELS.map((p) => ({ value: String(p.value), label: p.label }))}
              selected={draft.priceLevels.map(String)}
              onToggle={togglePrice}
            />
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearText}>{t('filterClearBtn')}{count > 0 ? ` (${count})` : ''}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyText}>{t('filterApplyBtn')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.nomad.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 22, height: '72%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.nomad.outlineVariant,
    alignSelf: 'center', marginTop: 8, marginBottom: 2,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 8,
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.nomad.onSurface },

  tabScroll: { flexGrow: 0, marginBottom: 4 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 13, paddingVertical: 8, borderRadius: 99,
    backgroundColor: colors.nomad.surfaceContainer,
    borderWidth: 1, borderColor: colors.nomad.outlineVariant,
  },
  tabActive:     { backgroundColor: colors.nomad.primary, borderColor: colors.nomad.primary },
  tabText:       { fontSize: 12.5, fontWeight: '600', color: colors.nomad.onSurfaceVariant },
  tabTextActive: { color: '#fff' },

  optionsScroll: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },

  optionList: { gap: 5 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.nomad.surfaceContainer,
  },
  optionRowActive:   { backgroundColor: colors.nomad.onPrimaryContainer },
  optionLabel:       { fontSize: 12.5, color: colors.nomad.onSurfaceVariant },
  optionLabelActive: { color: colors.nomad.primary, fontWeight: '600' },

  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 12 },
  clearBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: colors.nomad.outline, alignItems: 'center',
  },
  clearText: { fontSize: 13, color: colors.nomad.onSurface, fontWeight: '600' },
  applyBtn: {
    flex: 2, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.nomad.primary, alignItems: 'center',
  },
  applyText: { fontSize: 13, color: '#fff', fontWeight: '700' },
});

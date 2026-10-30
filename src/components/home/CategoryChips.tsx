import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import supabase from '@/src/lib/supabase';
import { readLocations } from '@/src/lib/location-access';
import { useCategories } from '@/src/hooks/useCategories';
import { colors } from '@/src/theme/colors';
import type { Category } from '@/src/types';

const SHOW_COUNT = 7;

function ChipSkeleton() {
  return <View style={styles.skeleton} />;
}

function useActiveCategoryChips(): { chips: Category[]; loading: boolean } {
  const { categories, loading: catLoading } = useCategories();
  const [chips, setChips] = useState<Category[]>([]);
  const [locLoading, setLocLoading] = useState(true);
  const pickedRef = useRef(false);

  useEffect(() => {
    if (catLoading || categories.length === 0) return;
    if (pickedRef.current) return;

    async function load() {
      const data = await readLocations<{ category: string | null }>((table) => {
        const q = supabase.from(table).select('category');
        return table === 'locations' ? q.eq('is_active', true) : q;
      });

      // Build a set of all lowercase category tokens from active locations
      const activeTokens = new Set<string>();
      for (const row of data) {
        if (!row.category) continue;
        for (const part of String(row.category).split(',')) {
          activeTokens.add(part.trim().toLowerCase());
        }
      }

      // Keep only categories that appear in at least one active location
      const matched = categories.filter((cat) =>
        activeTokens.has(cat.name.toLowerCase())
      );

      // Shuffle and take SHOW_COUNT
      const shuffled = [...matched].sort(() => Math.random() - 0.5);
      setChips(shuffled.slice(0, SHOW_COUNT));
      pickedRef.current = true;
      setLocLoading(false);
    }

    load();
  }, [catLoading, categories]);

  return { chips, loading: catLoading || locLoading };
}

export function CategoryChips() {
  const { chips, loading } = useActiveCategoryChips();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      {loading
        ? [1, 2, 3].map((k) => <ChipSkeleton key={k} />)
        : chips.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.chip}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/search', params: { category: cat.name } })}
            >
              {cat.emoji ? (
                <Text style={styles.chipEmoji}>{cat.emoji}</Text>
              ) : null}
              <Text style={styles.chipText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:    { marginBottom: 20 },
  content:   { paddingHorizontal: 16, gap: 10, paddingVertical: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    height: 40, borderRadius: 20,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E5E5',
  },
  chipEmoji: { fontSize: 15 },
  chipText:  { fontSize: 14, color: colors.nomad.onSurface, fontWeight: '500' },
  skeleton:  { width: 90, height: 40, borderRadius: 20, backgroundColor: '#E8E8E8', opacity: 0.6 },
});

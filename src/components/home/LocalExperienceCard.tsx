import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useLangStore } from '@/src/store/langStore';

type Props = {
  onPress?: () => void;
  mascotSource?: any;
};

const VI_IMAGE = require('@/assets/local-experience-card.png');
const EN_IMAGE = require('@/assets/local-experience-card-en.png');

export default function LocalExperienceCard({ onPress }: Props) {
  const { width } = useWindowDimensions();
  const lang = useLangStore((s) => s.lang);

  const isEn = lang === 'en';
  const cardWidth = Math.min(width - 32, 540);
  const cardHeight = Math.round(cardWidth * (422 / 960));

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isEn ? 'Explore local experiences' : 'Khám phá trải nghiệm bản địa'}
      style={[
        styles.wrapper,
        { width: cardWidth, height: cardHeight },
      ]}
    >
      <Image
        source={isEn ? EN_IMAGE : VI_IMAGE}
        style={styles.cardImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
});

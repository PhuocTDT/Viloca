import { useMemo } from 'react';
import type { MascotEmotion, MascotState } from '@/types/mascot';
import { useT, type StringKey } from '@/src/lib/i18n';
import { useLangStore } from '@/src/store/langStore';

interface TimeSlot {
  emotion: MascotEmotion;
  greetingKeys: StringKey[];
}

const TIME_SLOTS: { start: number; end: number; slot: TimeSlot }[] = [
  {
    start: 5, end: 11,
    slot: {
      emotion: 'happy',
      greetingKeys: ['mascotGreetMorning1', 'mascotGreetMorning2', 'mascotGreetMorning3'],
    },
  },
  {
    start: 12, end: 17,
    slot: {
      emotion: 'excited',
      greetingKeys: ['mascotGreetAfternoon1', 'mascotGreetAfternoon2', 'mascotGreetAfternoon3'],
    },
  },
  {
    start: 18, end: 21,
    slot: {
      emotion: 'happy',
      greetingKeys: ['mascotGreetEvening1', 'mascotGreetEvening2', 'mascotGreetEvening3'],
    },
  },
  {
    start: 22, end: 28, // 22:00 - 04:59 (28 = 24+4)
    slot: {
      emotion: 'idle',
      greetingKeys: ['mascotGreetNight1', 'mascotGreetNight2', 'mascotGreetNight3'],
    },
  },
];

function getTimeSlot(hour: number): TimeSlot {
  const h = hour < 5 ? hour + 24 : hour;
  const match = TIME_SLOTS.find((t) => h >= t.start && h <= t.end);
  return match?.slot ?? TIME_SLOTS[0].slot;
}

const SEN_MESSAGE_KEYS: StringKey[] = [
  'senMsg1', 'senMsg2', 'senMsg3', 'senMsg4', 'senMsg5',
  'senMsg6', 'senMsg7', 'senMsg8', 'senMsg9', 'senMsg10',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useMascot(overrideEmotion?: MascotEmotion): MascotState {
  const t = useT();
  const lang = useLangStore((s) => s.lang);

  return useMemo(() => {
    const hour = new Date().getHours();
    const slot = getTimeSlot(hour);
    return {
      emotion:    overrideEmotion ?? slot.emotion,
      greeting:   t(pickRandom(slot.greetingKeys)),
      senMessage: t(pickRandom(SEN_MESSAGE_KEYS)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrideEmotion, lang]);
}

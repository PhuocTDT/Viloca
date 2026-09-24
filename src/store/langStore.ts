import { create } from 'zustand';

type Lang = 'vi' | 'en';

type LangState = {
  lang: Lang;
  toggle: () => void;
  setLang: (l: Lang) => void;
};

export const useLangStore = create<LangState>((set) => ({
  lang: 'en',
  toggle: () => set((s) => ({ lang: s.lang === 'vi' ? 'en' : 'vi' })),
  setLang: (lang) => set({ lang }),
}));

import { useLangStore } from '@/src/store/langStore';

/** Chọn bản tiếng Anh nếu đang ở chế độ EN và có bản dịch, không thì dùng bản gốc tiếng Việt. */
export function localize(vi: string, en: string | null | undefined, lang: 'vi' | 'en'): string {
  if (lang === 'en' && en && en.trim()) return en;
  return vi;
}

/** Hook: trả về hàm `(vi, en) => string` đã khoá theo ngôn ngữ hiện tại — dùng cho tên/mô tả địa điểm. */
export function useLocalize(): (vi: string, en: string | null | undefined) => string {
  const lang = useLangStore((s) => s.lang);
  return (vi, en) => localize(vi, en, lang);
}

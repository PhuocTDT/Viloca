import supabase from './supabase';

/**
 * Truy cập bảng `locations` theo gói (freemium).
 *
 * Pro đọc thẳng bảng `locations`. Free bị RLS chặn (sau migration
 * 20261021000001) nên trả về rỗng và phải đọc view `locations_preview`, chỉ có
 * các cột miễn phí. Hàm này thử bảng đầy đủ trước rồi mới lùi về view, nên chạy
 * đúng cả trước lẫn sau khi migration được áp dụng.
 *
 * `run` nhận tên bảng và tự dựng truy vấn. View không có cột `is_active`
 * (đã lọc sẵn), nên đừng `.eq('is_active', ...)` khi `table` là view.
 */
export type LocationTable = 'locations' | 'locations_preview';

type Result<T> = { data: T[] | null; error: unknown };

export async function readLocations<T>(
  run: (table: LocationTable) => PromiseLike<Result<T>>,
): Promise<T[]> {
  const full = await run('locations');
  if (!full.error && full.data && full.data.length > 0) return full.data;
  const preview = await run('locations_preview');
  return (!preview.error && preview.data) || [];
}

/** Đếm địa điểm khớp `apply`; lùi về view nếu bảng đầy đủ không trả gì. */
export async function countLocations(
  apply: (q: any, table: LocationTable) => PromiseLike<{ count: number | null }>,
): Promise<number> {
  const build = (table: LocationTable) =>
    apply(supabase.from(table).select('id', { count: 'exact', head: true }), table);
  const full = await build('locations');
  if (full.count) return full.count;
  return (await build('locations_preview')).count ?? 0;
}

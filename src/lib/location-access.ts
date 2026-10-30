import supabase from './supabase';

/**
 * Truy cập bảng `locations` theo gói (freemium).
 *
 * Pro đọc thẳng bảng `locations`. Free bị RLS chặn (sau migration
 * 20261021000001) nên phải đọc view `locations_preview`, chỉ có các cột
 * miễn phí. Gói được xác định rõ qua `profiles.plan` — KHÔNG được đoán theo
 * việc bảng đầy đủ trả về rỗng hay không, vì free user vẫn đọc được full row
 * của địa điểm nằm trong trip của họ (policy `users_read_own_trip_locations`),
 * nên với truy vấn dạng danh sách, "có dữ liệu" không đồng nghĩa "là pro".
 *
 * `run` nhận tên bảng và tự dựng truy vấn. View không có cột `is_active`
 * (đã lọc sẵn), nên đừng `.eq('is_active', ...)` khi `table` là view.
 */
export type LocationTable = 'locations' | 'locations_preview';

type Result<T> = { data: T[] | null; error: unknown };

export async function isProUser(): Promise<boolean> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const { data } = await supabase.from('profiles').select('plan').eq('id', auth.user.id).single();
  return data?.plan === 'pro';
}

export async function readLocations<T>(
  run: (table: LocationTable) => PromiseLike<Result<T>>,
): Promise<T[]> {
  const table: LocationTable = (await isProUser()) ? 'locations' : 'locations_preview';
  const result = await run(table);
  if (!result.error && result.data) return result.data;
  if (table === 'locations') {
    const preview = await run('locations_preview');
    return (!preview.error && preview.data) || [];
  }
  return [];
}

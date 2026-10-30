import { Share, type ShareContent, type ShareOptions } from 'react-native';
import supabase from './supabase';

/**
 * Share.share() + báo tiến độ nhiệm vụ "Chia sẻ Viloca" (honor-system — không thể biết
 * user share vào đâu, nên tính hoàn thành ngay khi share sheet được mở, bất kể kết quả).
 */
export async function shareAndReportMission(content: ShareContent, options?: ShareOptions) {
  const result = await Share.share(content, options);
  supabase.rpc('report_mission_progress', { p_metric: 'app_shared' }).then(
    () => {},
    () => {}
  );
  return result;
}

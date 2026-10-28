import type { WeatherRegion } from './config.ts';
import type { WeatherImpact } from './impact.ts';

export interface TransportAdvice {
  title: string;
  explanation: string;
}

/** Suggestions are conditional. The forecast never verifies roads or operators. */
export function transportAdvice(
  region: WeatherRegion | null | undefined,
  impact: WeatherImpact,
  language: 'vi' | 'en' = 'vi',
): TransportAdvice | null {
  if (!region) return null;
  const wet = impact.kinds.some((kind) => ['rain', 'heavy_rain', 'thunder'].includes(kind));
  const dangerous = impact.level === 'high';
  const unknown = impact.level === 'unknown' || impact.incomplete;
  const calm = impact.level === 'none' && !unknown && !wet;
  if (unknown && !dangerous) {
    return language === 'vi'
      ? { title: 'Chưa đủ dữ liệu để gợi ý phương tiện', explanation: 'Hãy kiểm tra dự báo, đường đi và đơn vị vận hành tại địa phương trước khi chọn phương tiện.' }
      : { title: 'Not enough data to suggest transport', explanation: 'Check the forecast, roads and local operator before choosing a vehicle.' };
  }
  const messages: Record<WeatherRegion, { vi: TransportAdvice; en: TransportAdvice }> = {
    hue: calm ? {
      vi: { title: 'Thử thuyền rồng hoặc xích lô', explanation: 'Dự báo thuận lợi tại Huế. Hãy kiểm tra lịch chạy và điều kiện thực tế với đơn vị vận hành.' },
      en: { title: 'Consider a dragon boat or cyclo', explanation: 'The Hue forecast looks favorable. Check schedules and actual conditions with the operator.' },
    } : dangerous ? {
      vi: { title: 'Cân nhắc dời hoạt động trên sông', explanation: 'Mưa, gió hoặc tầm nhìn có thể ảnh hưởng. Kiểm tra đơn vị vận hành và điều kiện đường; taxi không thay thế việc kiểm tra an toàn.' },
      en: { title: 'Consider postponing the river activity', explanation: 'Rain, wind or visibility may affect it. Check the operator and roads; a taxi does not remove every risk.' },
    } : {
      vi: { title: 'Cân nhắc taxi hoặc xe công nghệ', explanation: 'Kiểm tra đường và điểm đón trả thực tế. Hoạt động trên sông cần xác nhận riêng với đơn vị vận hành.' },
      en: { title: 'Consider a taxi or ride-hailing car', explanation: 'Check current roads and pickup points. Confirm river activities separately with the operator.' },
    },
    hoi_an: calm ? {
      vi: { title: 'Xe đạp quanh phố cổ và đồng lúa', explanation: 'Dự báo thuận lợi hơn cho xe đạp; hãy kiểm tra đường và điều kiện thực tế trước khi đi.' },
      en: { title: 'Cycle around the old town and fields', explanation: 'The forecast is more favorable for cycling; check roads and actual conditions first.' },
    } : dangerous ? {
      vi: { title: 'Trú trong nhà hoặc dời hoạt động', explanation: 'Không nên mặc định đi bộ khi mưa lớn hoặc giông. Chỉ dùng taxi nếu đường còn đi được và điểm đón trả phù hợp.' },
      en: { title: 'Shelter indoors or move the activity', explanation: 'Walking is not a default in heavy rain or storms. Use a taxi only where roads and pickup points remain suitable.' },
    } : {
      vi: { title: 'Đi bộ đoạn ngắn hoặc dùng taxi khi phù hợp', explanation: 'Chỉ đi bộ nếu mưa nhẹ và đường thực tế phù hợp; chưa có dữ liệu xác nhận đường không ngập.' },
      en: { title: 'Walk a short distance or use a taxi if suitable', explanation: 'Walk only in light rain and when actual streets allow it; flooding has not been verified.' },
    },
    mekong_delta: calm ? {
      vi: { title: 'Xuồng ba lá hoặc ghe máy', explanation: 'Khám phá chợ nổi cùng đơn vị vận hành; xác nhận gió và tình trạng sông trước khi đi.' },
      en: { title: 'Try a sampan or motorboat', explanation: 'Visit a floating market with an operator; confirm wind and river conditions first.' },
    } : {
      vi: { title: 'Cân nhắc dời chuyến trên sông', explanation: 'Chỉ đi sớm nếu đúng khung giờ đó có dự báo tốt hơn và đơn vị vận hành xác nhận. Không coi sáng sớm luôn êm.' },
      en: { title: 'Consider rescheduling the river trip', explanation: 'Go earlier only if that exact time has a better forecast and the operator confirms conditions.' },
    },
    ha_giang: calm ? {
      vi: { title: 'Xe máy hoặc tài xế địa phương', explanation: 'Chỉ chọn khi phù hợp kinh nghiệm và đường thực tế; kiểm tra dự báo trên tuyến trước khi đi.' },
      en: { title: 'Motorbike or a local driver', explanation: 'Choose based on experience and actual roads; check conditions along the route first.' },
    } : {
      vi: { title: 'Không tự chạy xe máy qua đèo', explanation: 'Khi mưa hoặc sương mù, cân nhắc hoãn. Ô tô có tài xế chỉ là lựa chọn khi tuyến còn hoạt động và được xác nhận tại địa phương.' },
      en: { title: 'Do not ride a mountain pass yourself', explanation: 'In rain or fog, consider postponing. A car with a driver is an option only when the route is open and locally confirmed.' },
    },
  };
  const result = messages[region][language];
  if (unknown) {
    return {
      title: result.title,
      explanation: `${result.explanation} ${language === 'vi' ? 'Dữ liệu dự báo chưa đầy đủ.' : 'Forecast data is incomplete.'}`,
    };
  }
  return result;
}

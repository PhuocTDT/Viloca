import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export interface ResizeResult {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

/**
 * Resize ảnh trước khi upload. Luôn xuất JPEG (chuẩn hoá định dạng, nén nhẹ).
 * - `{ maxLongEdge }`: chỉ co lại khi cạnh dài hơn hiện tại vượt mức, không bao giờ phóng to.
 * - `{ width, height }`: resize cứng về đúng kích thước (dùng cho avatar đã crop vuông sẵn).
 */
export async function resizeImage(
  uri: string,
  currentSize: { width: number; height: number } | null,
  target: { maxLongEdge: number } | { width: number; height: number },
  compress = 0.85
): Promise<ResizeResult> {
  let resizeArg: { width?: number; height?: number } | null = null;

  if ('width' in target) {
    resizeArg = { width: target.width, height: target.height };
  } else if (currentSize) {
    const longEdge = Math.max(currentSize.width, currentSize.height);
    if (longEdge > target.maxLongEdge) {
      const scale = target.maxLongEdge / longEdge;
      resizeArg = {
        width: Math.round(currentSize.width * scale),
        height: Math.round(currentSize.height * scale),
      };
    }
  }

  let context = ImageManipulator.manipulate(uri);
  if (resizeArg) context = context.resize(resizeArg);
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress, format: SaveFormat.JPEG, base64: true });

  return { uri: saved.uri, base64: saved.base64 ?? '', width: saved.width, height: saved.height };
}

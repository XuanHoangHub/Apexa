import { env } from 'cloudflare:workers';

export async function POST(request: Request) {
  const json = (data: unknown, status = 200) => Response.json(data, { status });
  if (
    request.headers.get('origin') &&
    new URL(request.headers.get('origin')!).origin !==
      new URL(request.url).origin
  )
    return json({ error: 'Nguồn yêu cầu không hợp lệ.' }, 403);
  const runtime = env as unknown as Record<string, string | undefined>;
  if (!runtime.FRAME_AI_ENDPOINT || !runtime.FRAME_AI_TOKEN)
    return json(
      {
        error:
          'Chưa kết nối mô hình AI. Bạn có thể lưu bản nháp hoặc xuất brief để tiếp tục sau.',
      },
      503,
    );
  try {
    const text = await request.text();
    if (text.length > 15_000_000)
      return json({ error: 'Ảnh tham chiếu quá lớn.' }, 413);
    const body = JSON.parse(text);
    if (
      typeof body.prompt !== 'string' ||
      !body.prompt.trim() ||
      body.prompt.length > 4000
    )
      return json({ error: 'Prompt cần từ 1 đến 4000 ký tự.' }, 400);
    if (
      !['image', 'video', 'cinema', 'marketing', 'canvas'].includes(
        body.mode,
      ) ||
      !['16:9', '9:16', '1:1', '4:3', '3:2'].includes(body.ratio)
    )
      return json({ error: 'Thiết lập sáng tạo không hợp lệ.' }, 400);
    if (
      body.image &&
      (typeof body.image !== 'string' ||
        !/^data:image\/(png|jpeg|webp);base64,/.test(body.image))
    )
      return json({ error: 'Định dạng ảnh không hợp lệ.' }, 400);
    const endpoint = new URL(runtime.FRAME_AI_ENDPOINT);
    if (endpoint.protocol !== 'https:')
      return json({ error: 'Kết nối AI chưa được cấu hình đúng.' }, 503);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${runtime.FRAME_AI_TOKEN}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90000),
      redirect: 'error',
    });
    if (!response.ok)
      return json(
        { error: 'Dịch vụ AI chưa xử lý được yêu cầu. Vui lòng thử lại sau.' },
        502,
      );
    const result = (await response.json()) as { url?: string; type?: string };
    if (
      !result.url ||
      new URL(result.url).protocol !== 'https:' ||
      !['image', 'video'].includes(result.type || '')
    )
      return json({ error: 'Dịch vụ trả về kết quả không hợp lệ.' }, 502);
    return json({ url: result.url, type: result.type });
  } catch (e) {
    return json(
      {
        error:
          e instanceof SyntaxError
            ? 'Dữ liệu yêu cầu không hợp lệ.'
            : 'Kết nối AI bị gián đoạn. Vui lòng thử lại.',
      },
      e instanceof SyntaxError ? 400 : 502,
    );
  }
}

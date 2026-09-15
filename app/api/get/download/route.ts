import { NextRequest, NextResponse } from 'next/server';
import { streamWithYtDlp, isYtDlpAvailable } from '@/lib/yt-dlp-service';

export const runtime = 'nodejs';

function buildFetchHeaders(
  req: NextRequest,
  referer?: string | null,
): Record<string, string> {
  const fetchHeaders: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    Accept: '*/*',
    // Disable server-side compression for media streams so bytes flow uninhibited
    'Accept-Encoding': 'identity',
    Connection: 'keep-alive',
  };

  const range = req.headers.get('range');
  if (range) {
    fetchHeaders['Range'] = range;
  }

  const ifRange = req.headers.get('if-range');
  if (ifRange) {
    fetchHeaders['If-Range'] = ifRange;
  }

  if (referer) {
    fetchHeaders['Referer'] = referer;
    try {
      fetchHeaders['Origin'] = new URL(referer).origin;
    } catch {}
  }

  return fetchHeaders;
}

function buildResponseHeaders(
  remoteHeaders: Headers,
  cleanFilename: string,
  encodedFilename: string,
  fallbackContentType: string,
  isInline = false,
): Headers {
  const responseHeaders = new Headers();

  responseHeaders.set(
    'Content-Type',
    remoteHeaders.get('content-type') || fallbackContentType,
  );
  responseHeaders.set(
    'Content-Disposition',
    isInline
      ? 'inline'
      : `attachment; filename="${cleanFilename}"; filename*=UTF-8''${encodedFilename}`,
  );

  const contentLength = remoteHeaders.get('content-length');
  if (contentLength) {
    responseHeaders.set('Content-Length', contentLength);
  }

  const contentRange = remoteHeaders.get('content-range');
  if (contentRange) {
    responseHeaders.set('Content-Range', contentRange);
  }

  // Critical for multi-threaded downloaders (IDM, FDM, Chrome parallel download)
  responseHeaders.set('Accept-Ranges', 'bytes');
  responseHeaders.set('Cache-Control', 'public, max-age=86400');
  // Disable Nginx / Cloudflare intermediate buffer pooling so streaming starts instantly
  responseHeaders.set('X-Accel-Buffering', 'no');
  // Enable CORS for client-side blob fetching and Web Worker acceleration
  responseHeaders.set('Access-Control-Allow-Origin', '*');
  responseHeaders.set(
    'Access-Control-Expose-Headers',
    'Content-Length, Content-Range, Accept-Ranges, Content-Disposition',
  );

  return responseHeaders;
}

/**
 * HEAD request handler:
 * Essential for IDM, FDM, and browser multi-thread download engines
 * which probe file size and byte-range support before dispatching parallel download threads.
 */
function sanitizeFilenames(rawFilename: string, fallback = 'media.mp4') {
  const trimmed = rawFilename.trim() || fallback;
  const asciiSafe =
    trimmed
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^\w\s.-]/g, '')
      .trim() || fallback;
  const utf8Encoded = encodeURIComponent(trimmed);
  return { asciiSafe, utf8Encoded };
}

export async function HEAD(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get('mediaUrl');
    const quality = searchParams.get('quality');
    const targetUrl = searchParams.get('url');
    const rawFilename = searchParams.get('filename') || 'download.mp4';
    const contentType = searchParams.get('type') || 'video/mp4';
    const isInline =
      searchParams.get('inline') === '1' ||
      searchParams.get('inline') === 'true';

    if (!targetUrl && !mediaUrl) {
      return new Response(null, { status: 400 });
    }

    const { asciiSafe, utf8Encoded } = sanitizeFilenames(rawFilename);

    if (mediaUrl) {
      const isAudio = quality === 'audio' || rawFilename.endsWith('.mp3');
      const responseHeaders = new Headers();
      responseHeaders.set('Content-Type', isAudio ? 'audio/mpeg' : contentType);
      responseHeaders.set(
        'Content-Disposition',
        isInline
          ? 'inline'
          : `attachment; filename="${asciiSafe}"; filename*=UTF-8''${utf8Encoded}`,
      );
      responseHeaders.set('Accept-Ranges', 'bytes');
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      return new Response(null, {
        status: 200,
        headers: responseHeaders,
      });
    }

    const fetchHeaders = buildFetchHeaders(req, searchParams.get('referer'));

    // Try HEAD first
    let remoteRes = await fetch(targetUrl!, {
      method: 'HEAD',
      headers: fetchHeaders,
      redirect: 'follow',
      signal: AbortSignal.timeout(6000),
    });

    // If HEAD is not supported by upstream CDN, send lightweight GET with range 0-0
    if (!remoteRes.ok && remoteRes.status !== 206) {
      remoteRes = await fetch(targetUrl!, {
        method: 'GET',
        headers: { ...fetchHeaders, Range: 'bytes=0-0' },
        redirect: 'follow',
        signal: AbortSignal.timeout(6000),
      });
    }

    const responseHeaders = buildResponseHeaders(
      remoteRes.headers,
      asciiSafe,
      utf8Encoded,
      contentType,
      isInline,
    );

    return new Response(null, {
      status: remoteRes.status === 206 || remoteRes.ok ? 200 : remoteRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('Download HEAD probe error:', err);
    return new Response(null, { status: 500 });
  }
}

/**
 * OPTIONS request handler for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, If-Range, Content-Type',
      'Access-Control-Expose-Headers':
        'Content-Length, Content-Range, Accept-Ranges, Content-Disposition',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * High-performance streaming GET handler
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mediaUrl = searchParams.get('mediaUrl');
    const quality = searchParams.get('quality');
    const targetUrl = searchParams.get('url');
    const rawFilename = searchParams.get('filename') || 'download.mp4';
    const contentType = searchParams.get('type') || 'video/mp4';
    const isInline =
      searchParams.get('inline') === '1' ||
      searchParams.get('inline') === 'true';

    if (!targetUrl && !mediaUrl) {
      return new Response('Missing target URL or media URL', { status: 400 });
    }

    const { asciiSafe, utf8Encoded } = sanitizeFilenames(rawFilename);

    // High Quality yt-dlp Streaming Engine (Full HD, 4K, Muxed MP4 with Audio)
    if (mediaUrl && isYtDlpAvailable()) {
      const isAudio = quality === 'audio' || rawFilename.endsWith('.mp3');
      const responseHeaders = new Headers();
      responseHeaders.set('Content-Type', isAudio ? 'audio/mpeg' : contentType);
      responseHeaders.set(
        'Content-Disposition',
        isInline
          ? 'inline'
          : `attachment; filename="${asciiSafe}"; filename*=UTF-8''${utf8Encoded}`,
      );
      responseHeaders.set('Accept-Ranges', 'bytes');
      responseHeaders.set('Cache-Control', 'public, max-age=3600');
      responseHeaders.set('X-Accel-Buffering', 'no');
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set(
        'Access-Control-Expose-Headers',
        'Content-Disposition, Content-Type, Content-Length, Content-Range, Accept-Ranges',
      );

      const { webStream } = streamWithYtDlp(
        mediaUrl,
        quality || undefined,
        req.signal,
      );
      return new Response(webStream, {
        status: 200,
        headers: responseHeaders,
      });
    }

    if (!targetUrl) {
      return new Response('Target stream URL not found', { status: 404 });
    }

    const fetchHeaders = buildFetchHeaders(req, searchParams.get('referer'));

    const remoteRes = await fetch(targetUrl, {
      headers: fetchHeaders,
      redirect: 'follow',
    });

    if (!remoteRes.ok && remoteRes.status !== 206) {
      // If direct proxy fetch fails (e.g. strict origin IP binding), redirect user directly to CDN URL
      if (
        targetUrl &&
        (targetUrl.startsWith('http://') || targetUrl.startsWith('https://'))
      ) {
        return NextResponse.redirect(targetUrl, 302);
      }
      return new Response('Upstream fetch failed', {
        status: remoteRes.status,
      });
    }

    const responseHeaders = buildResponseHeaders(
      remoteRes.headers,
      asciiSafe,
      utf8Encoded,
      contentType,
      isInline,
    );

    return new Response(remoteRes.body, {
      status: remoteRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('Download proxy streaming error:', err);
    // Fallback: redirect directly to target URL so user can still access file
    try {
      const url = new URL(req.url).searchParams.get('url');
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        return NextResponse.redirect(url, 302);
      }
    } catch {}
    return new Response('Download failed', { status: 500 });
  }
}

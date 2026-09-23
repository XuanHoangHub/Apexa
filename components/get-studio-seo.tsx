'use client';

import React, { useState } from 'react';
import {
  Zap,
  Download,
  ShieldCheck,
  Sparkles,
  Film,
  Music,
  Layers,
  Check,
  ChevronDown,
  CheckCircle2,
  Scissors,
  Copy,
} from 'lucide-react';
import { PlatformBrandIcon } from '@/components/platform-icon';
import type { PlatformType } from '@/app/api/get/route';

interface GetStudioSeoProps {
  onScrollToTop?: () => void;
  onTrySample?: (url: string, platform: PlatformType) => void;
}

export default function GetStudioSeo({ onScrollToTop }: GetStudioSeoProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const handleScrollToTop = () => {
    if (onScrollToTop) {
      onScrollToTop();
    } else {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Structured Data Schema (JSON-LD) for SEO Rich Snippets
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': 'https://apexa.ai/#get-app',
        name: 'Apexa Get — Tải Video & Âm Thanh Đa Nền Tảng Siêu Tốc',
        url: 'https://apexa.ai/get',
        description:
          'Công cụ tải video Facebook Reels, TikTok không logo watermark, YouTube 4K, Instagram, X/Twitter và tách nhạc MP3 320kbps miễn phí 100%. Tốc độ máy chủ CDN gốc siêu tốc.',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All (Windows, macOS, Linux, iOS, Android)',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'VND',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.95',
          ratingCount: '15820',
          bestRating: '5',
          worstRating: '1',
        },
      },
      {
        '@type': 'HowTo',
        name: 'Cách tải video Facebook, TikTok không logo, YouTube 4K với Apexa Get',
        description:
          'Hướng dẫn 3 bước đơn giản để tải video và âm thanh MP3 từ hơn 14 mạng xã hội phổ biến về điện thoại và máy tính.',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: 'Sao chép liên kết video',
            text: 'Mở ứng dụng hoặc trang web (Facebook, TikTok, YouTube, Instagram...), bấm nút Chia sẻ (Share) và chọn Sao chép liên kết (Copy Link).',
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: 'Dán liên kết vào ô tìm kiếm Apexa Get',
            text: 'Truy cập Apexa Get, dán liên kết vào thanh tìm kiếm hoặc nhấn nút Dán link (phím tắt Ctrl+V). Hệ thống tự động nhận diện nền tảng trong tích tắc.',
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: 'Chọn định dạng và bấm Tải xuống',
            text: 'Chọn độ phân giải mong muốn (4K, 1080p, 720p hoặc Audio MP3 320kbps) rồi bấm nút Tải Siêu Tốc để lưu file về thiết bị.',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Apexa Get có hoàn toàn miễn phí không? Có giới hạn số lần tải không?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Apexa Get hoàn toàn miễn phí 100%, không yêu cầu trả phí và không giới hạn số lượng video tải xuống mỗi ngày. Bạn có thể tải bao nhiêu video tùy thích với băng thông tối đa.',
            },
          },
          {
            '@type': 'Question',
            name: 'Tải video TikTok trên Apexa Get có bị dính watermark / logo ID người đăng không?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Không. Thuật toán của Apexa Get tự động trích xuất luồng video gốc không logo (No Watermark) trực tiếp từ máy chủ CDN của TikTok và Douyin, đảm bảo video sạch 100% không bị mờ hay chèn ID.',
            },
          },
          {
            '@type': 'Question',
            name: 'Làm thế nào để tải video trên điện thoại iPhone / iPad (iOS)?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Trên thiết bị iOS (iPhone/iPad), bạn mở trình duyệt Safari, truy cập Apexa Get và dán liên kết. Sau khi bấm Tải xuống, Safari sẽ hỏi bạn có muốn tải tệp về không. Tệp tải về sẽ nằm trong ứng dụng Tệp (Files) hoặc thư viện Ảnh.',
            },
          },
          {
            '@type': 'Question',
            name: 'Apexa Get hỗ trợ tải video chất lượng tối đa là bao nhiêu? Có hỗ trợ 4K không?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Apexa Get hỗ trợ độ phân giải tối đa mà video gốc cung cấp, bao gồm 4K UHD (2160p), 2K QHD (1440p), Full HD (1080p 60fps) và HD (720p). Không có bất kỳ hiện tượng nén mờ hay suy giảm chất lượng nào.',
            },
          },
          {
            '@type': 'Question',
            name: 'Làm thế nào để tách nhạc MP3 từ video YouTube hoặc TikTok?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Chỉ cần dán link video vào ô tìm kiếm. Trong bảng kết quả, bạn chọn tab Audio MP3 hoặc cuộn xuống phần Âm thanh, chọn chất lượng (lên đến 320kbps) và bấm Tải xuống. Hệ thống sẽ trích xuất file MP3 chất lượng cao ngay lập tức.',
            },
          },
          {
            '@type': 'Question',
            name: 'Video tải về có bị lưu trữ trên máy chủ của Apexa không?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Hoàn toàn không. Apexa Get chỉ đóng vai trò phân tích và chuyển tiếp luồng tải trực tiếp từ CDN máy chủ gốc của nền tảng về thiết bị của bạn. Chúng tôi không lưu trữ bất kỳ video, hình ảnh hay thông tin cá nhân nào của người dùng.',
            },
          },
        ],
      },
    ],
  };

  const FAQS = [
    {
      q: 'Apexa Get có hoàn toàn miễn phí không? Có bị giới hạn số lần tải không?',
      a: 'Apexa Get là công cụ trực tuyến miễn phí 100%. Bạn có thể tải không giới hạn số lượng video, shorts, reels và tệp âm thanh mỗi ngày mà không phải trả bất kỳ khoản phí nào, không cần đăng ký tài khoản hay cài đặt phần mềm bên thứ ba.',
    },
    {
      q: 'Tải video TikTok trên Apexa Get có bị dính watermark / logo ID người đăng không?',
      a: 'Hoàn toàn KHÔNG. Apexa Get sử dụng bộ giải mã tiên tiến để lấy trực tiếp luồng video gốc không chứa watermark từ máy chủ CDN của TikTok và Douyin. Video tải về có chất lượng HD sắc nét và hoàn toàn sạch sẽ, rất phù hợp cho các nhà sáng tạo nội dung tái sử dụng.',
    },
    {
      q: 'Làm sao để tải video trên điện thoại iPhone / iPad (iOS)?',
      a: 'Với hệ điều hành iOS (iPhone/iPad từ iOS 13 trở lên), bạn mở trình duyệt Safari mặc định, truy cập Apexa Get và dán liên kết video. Sau khi nhấn "Tải Siêu Tốc", Safari sẽ hiện thông báo xác nhận tải về. Video sẽ được lưu trực tiếp vào ứng dụng "Tệp" (Files) hoặc bạn có thể chọn "Lưu video" vào Thư viện Ảnh chỉ với một chạm.',
    },
    {
      q: 'Chất lượng video tải về tối đa là bao nhiêu? Có hỗ trợ 4K và 60fps không?',
      a: 'Apexa Get hỗ trợ độ phân giải gốc cao nhất mà nền tảng cung cấp: 4K UHD (3840x2160), 2K (2560x1440), Full HD 1080p 60fps và HD 720p. Hệ thống cam kết giữ nguyên bitrate và số khung hình gốc mà không thực hiện tái mã hóa làm suy hao độ sắc nét.',
    },
    {
      q: 'Làm thế nào để tách nhạc nền hoặc âm thanh MP3 320kbps từ video?',
      a: 'Sau khi dán link video vào Apexa Get và bấm "Lấy dữ liệu", bạn chuyển sang tab "Âm thanh (MP3)" trong bảng kết quả. Tại đây, bạn có thể nghe thử luồng âm thanh trực tiếp bằng trình phát sóng nhạc và chọn tải file MP3 chất lượng cao lên đến 320kbps.',
    },
    {
      q: 'Tính năng Tải hàng loạt (Batch Download) hoạt động như thế nào?',
      a: 'Chuyển sang tab "Tải hàng loạt", bạn có thể dán danh sách tối đa 30 liên kết video cùng lúc (mỗi link một dòng) hoặc kéo thả tệp text (.txt) chứa danh sách link. Apexa Get sẽ tự động phân tích song song toàn bộ liên kết, cho phép bạn chọn định dạng và tải về toàn bộ chỉ trong tích tắc.',
    },
    {
      q: 'Video tải về được lưu trữ ở đâu trên máy tính và điện thoại?',
      a: 'Trên máy tính (Windows, macOS), file tải về sẽ mặc định nằm trong thư mục "Downloads" (Tải về). Trên điện thoại Android, file nằm trong thư viện Ảnh hoặc mục Download của trình quản lý tệp. Trên iPhone, file nằm trong ứng dụng Tệp (iCloud Drive / Trên iPhone này) hoặc ứng dụng Ảnh.',
    },
    {
      q: 'Apexa Get có lưu trữ video hay theo dõi người dùng không?',
      a: 'Chúng tôi tôn trọng tuyệt đối quyền riêng tư của bạn. Apexa Get KHÔNG lưu trữ bất kỳ bản sao video nào trên máy chủ, KHÔNG lưu lịch sử duyệt web cá nhân và KHÔNG yêu cầu quyền truy cập vào thông tin nhạy cảm. Toàn bộ dữ liệu truyền tải đều được mã hóa an toàn qua giao thức SSL/HTTPS.',
    },
  ];

  return (
    <section
      className="get-seo-root"
      aria-label="Thông tin chi tiết và hướng dẫn tải video"
    >
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Trust & Highlights Bar */}
      <div className="get-seo-trust-bar">
        <div className="seo-trust-item">
          <div className="seo-trust-icon">
            <Zap size={18} />
          </div>
          <div className="seo-trust-text">
            <span className="seo-trust-title">Origin CDN Siêu Tốc</span>
            <span className="seo-trust-desc">Tải trực tiếp máy chủ gốc</span>
          </div>
        </div>

        <div className="seo-trust-item">
          <div className="seo-trust-icon">
            <Scissors size={18} />
          </div>
          <div className="seo-trust-text">
            <span className="seo-trust-title">Sạch 100% Watermark</span>
            <span className="seo-trust-desc">Gỡ logo TikTok & Reels</span>
          </div>
        </div>

        <div className="seo-trust-item">
          <div className="seo-trust-icon">
            <Film size={18} />
          </div>
          <div className="seo-trust-text">
            <span className="seo-trust-title">Chuẩn 4K & 1080p 60fps</span>
            <span className="seo-trust-desc">Không nén, không mờ nhòe</span>
          </div>
        </div>

        <div className="seo-trust-item">
          <div className="seo-trust-icon">
            <Music size={18} />
          </div>
          <div className="seo-trust-text">
            <span className="seo-trust-title">Tách MP3 320kbps</span>
            <span className="seo-trust-desc">Âm thanh phòng thu sắc nét</span>
          </div>
        </div>

        <div className="seo-trust-item">
          <div className="seo-trust-icon">
            <ShieldCheck size={18} />
          </div>
          <div className="seo-trust-text">
            <span className="seo-trust-title">Bảo Mật & Ẩn Danh</span>
            <span className="seo-trust-desc">Không lưu trữ dữ liệu</span>
          </div>
        </div>
      </div>

      {/* Section 1: Core Features */}
      <div className="seo-section">
        <div className="seo-section-header">
          <span className="seo-section-badge">Tính năng cốt lõi</span>
          <h2 className="seo-section-title">
            Giải pháp tải đa phương tiện{' '}
            <span className="text-gradient">toàn diện số 1</span>
          </h2>
          <p className="seo-section-desc">
            Apexa Get mang đến công nghệ bóc tách liên kết thông minh, kết nối
            trực tiếp đến các cụm máy chủ phân phối nội dung (CDN) để mang lại
            tốc độ tải tối đa cùng chất lượng nguyên bản.
          </p>
        </div>

        <div className="seo-features-grid">
          <div className="seo-feature-card">
            <div className="seo-feature-icon-wrap">
              <Zap size={22} />
            </div>
            <h3 className="seo-feature-title">Tốc độ máy chủ CDN gốc</h3>
            <p className="seo-feature-text">
              Dữ liệu được truyền tải trực tiếp từ máy chủ gốc của nền tảng mà
              không qua máy chủ trung gian chậm chạp. Hỗ trợ đa luồng tải đồng
              thời, tương thích tuyệt đối với các trình tăng tốc tải file như
              IDM hay FDM.
            </p>
          </div>

          <div className="seo-feature-card">
            <div className="seo-feature-icon-wrap">
              <Film size={22} />
            </div>
            <h3 className="seo-feature-title">
              Độ phân giải 4K / 2K / 1080p gốc
            </h3>
            <p className="seo-feature-text">
              Giữ nguyên vẹn 100% độ phân giải và chất lượng khung hình gốc. Cho
              phép bạn lựa chọn từ các bản Full HD 1080p 60fps mượt mà cho đến
              các thước phim 4K Ultra HD sắc nét từng chi tiết.
            </p>
          </div>

          <div className="seo-feature-card">
            <div className="seo-feature-icon-wrap">
              <Scissors size={22} />
            </div>
            <h3 className="seo-feature-title">Gỡ sạch Watermark & Logo</h3>
            <p className="seo-feature-text">
              Thuật toán tự động tìm nạp phiên bản không chứa hình mờ
              (No-Watermark) cho video TikTok, Douyin và Facebook Reels. Video
              tải về hoàn toàn sạch sẽ, thuận tiện lưu trữ hoặc dựng video
              chuyên nghiệp.
            </p>
          </div>

          <div className="seo-feature-card">
            <div className="seo-feature-icon-wrap">
              <Music size={22} />
            </div>
            <h3 className="seo-feature-title">Tách nhạc nền MP3 320kbps</h3>
            <p className="seo-feature-text">
              Trích xuất âm thanh từ mọi video ca nhạc, podcast, phỏng vấn sang
              định dạng MP3 chất lượng cao lên đến 320kbps. Tích hợp trình phát
              nhạc trực tiếp với sóng equalizer trực quan.
            </p>
          </div>

          <div className="seo-feature-card">
            <div className="seo-feature-icon-wrap">
              <Layers size={22} />
            </div>
            <h3 className="seo-feature-title">
              Tải hàng loạt (Batch Download)
            </h3>
            <p className="seo-feature-text">
              Tiết kiệm 95% thời gian cho nhà sáng tạo nội dung. Cho phép dán
              đồng thời tới 30 liên kết hoặc kéo thả tệp .txt để tự động phân
              tích và tải về toàn bộ danh sách một cách đồng bộ.
            </p>
          </div>

          <div className="seo-feature-card">
            <div className="seo-feature-icon-wrap">
              <ShieldCheck size={22} />
            </div>
            <h3 className="seo-feature-title">
              Bảo mật & Không quảng cáo độc hại
            </h3>
            <p className="seo-feature-text">
              Không chuyển hướng quảng cáo pop-up phiền toái, không yêu cầu cài
              extension nguy hiểm. Hoạt động an toàn trên sandbox trình duyệt và
              tôn trọng tối đa quyền riêng tư của người dùng.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Step-by-Step How-To Guide */}
      <div className="seo-section">
        <div className="seo-section-header">
          <span className="seo-section-badge">Hướng dẫn sử dụng</span>
          <h2 className="seo-section-title">
            Tải video & âm thanh dễ dàng chỉ trong{' '}
            <span className="text-gradient">3 bước</span>
          </h2>
          <p className="seo-section-desc">
            Không cần tài khoản, không cần cài đặt phần mềm. Quy trình tinh giản
            tối đa giúp bạn lưu video về máy chỉ trong vài giây.
          </p>
        </div>

        <div className="seo-steps-grid">
          <div className="seo-step-card">
            <div className="seo-step-header">
              <span className="seo-step-num">01</span>
              <div className="seo-step-icon">
                <Copy size={18} />
              </div>
            </div>
            <h3 className="seo-step-title">Sao chép liên kết video</h3>
            <p className="seo-step-text">
              Mở ứng dụng hoặc trang web chứa video bạn muốn tải (Facebook,
              TikTok, YouTube, Instagram, X...). Bấm vào nút{' '}
              <strong>Chia sẻ (Share)</strong> rồi chọn{' '}
              <strong>Sao chép liên kết (Copy link)</strong>.
            </p>
            <div className="seo-step-tip">
              <Sparkles size={13} />
              <span>Hỗ trợ cả link video ngắn (Reels/Shorts)</span>
            </div>
          </div>

          <div className="seo-step-card">
            <div className="seo-step-header">
              <span className="seo-step-num">02</span>
              <div className="seo-step-icon">
                <Zap size={18} />
              </div>
            </div>
            <h3 className="seo-step-title">Dán link & Tự động nhận diện</h3>
            <p className="seo-step-text">
              Truy cập Apexa Get, nhấn nút <strong>Dán link (Ctrl+V)</strong>.
              Hệ thống thông minh sẽ ngay lập tức nhận diện máy chủ nền tảng và
              nạp dữ liệu tốc độ cao mà bạn không cần thao tác thêm.
            </p>
            <div className="seo-step-tip">
              <CheckCircle2 size={13} />
              <span>Huy hiệu AUTO hiển thị khi nhận diện thành công</span>
            </div>
          </div>

          <div className="seo-step-card">
            <div className="seo-step-header">
              <span className="seo-step-num">03</span>
              <div className="seo-step-icon">
                <Download size={18} />
              </div>
            </div>
            <h3 className="seo-step-title">Chọn chất lượng & Tải về</h3>
            <p className="seo-step-text">
              Xem trước video trực tiếp. Chọn độ phân giải (4K, 1080p, 720p hoặc
              MP3 320kbps) rồi bấm <strong>Tải Siêu Tốc</strong>. Tệp sẽ được
              lưu trực tiếp vào thư mục tải về của thiết bị.
            </p>
            <div className="seo-step-tip">
              <ShieldCheck size={13} />
              <span>Có nút Tải Dự Phòng nếu mạng chặn tải trực tiếp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Platform Deep Dive */}
      <div className="seo-section">
        <div className="seo-section-header">
          <span className="seo-section-badge">Nền tảng hỗ trợ</span>
          <h2 className="seo-section-title">
            Tối ưu hóa chuyên sâu cho{' '}
            <span className="text-gradient">14+ nền tảng hàng đầu</span>
          </h2>
          <p className="seo-section-desc">
            Mỗi nền tảng mạng xã hội đều được trang bị bộ trích xuất chuyên
            dụng, đảm bảo tỷ lệ thành công 99.9% và giữ trọn chất lượng cao
            nhất.
          </p>
        </div>

        <div className="seo-platforms-grid">
          {/* Facebook */}
          <div className="seo-platform-card">
            <div className="seo-platform-header">
              <div className="seo-platform-title-wrap">
                <PlatformBrandIcon id="facebook" size={24} />
                <span className="seo-platform-name">Facebook Downloader</span>
              </div>
              <span className="seo-platform-tag">Reels / 1080p</span>
            </div>
            <ul className="seo-platform-features">
              <li>
                <Check size={14} />
                <span>
                  Tải Facebook Reels, Facebook Watch, Video bài viết Full HD
                  1080p / 2K
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Hỗ trợ cả liên kết công khai, fanpage, hội nhóm và link chia
                  sẻ rút gọn fb.watch
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Tách âm thanh MP3 từ video ca nhạc và bài phát biểu trên
                  Facebook
                </span>
              </li>
            </ul>
          </div>

          {/* TikTok */}
          <div className="seo-platform-card">
            <div className="seo-platform-header">
              <div className="seo-platform-title-wrap">
                <PlatformBrandIcon id="tiktok" size={24} />
                <span className="seo-platform-name">TikTok Downloader</span>
              </div>
              <span className="seo-platform-tag">Không Logo</span>
            </div>
            <ul className="seo-platform-features">
              <li>
                <Check size={14} />
                <span>
                  Tải video TikTok không logo (No Watermark), không mờ nhòe ID
                  người dùng
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Hỗ trợ tải video Douyin (TikTok Trung Quốc) chất lượng gốc
                  1080p
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Tải nhạc nền TikTok MP3 thịnh hành và ảnh slideshow album
                </span>
              </li>
            </ul>
          </div>

          {/* YouTube */}
          <div className="seo-platform-card">
            <div className="seo-platform-header">
              <div className="seo-platform-title-wrap">
                <PlatformBrandIcon id="youtube" size={24} />
                <span className="seo-platform-name">YouTube Downloader</span>
              </div>
              <span className="seo-platform-tag">4K / MP3 320k</span>
            </div>
            <ul className="seo-platform-features">
              <li>
                <Check size={14} />
                <span>
                  Tải video YouTube độ phân giải 4K, 2K, 1080p 60fps và YouTube
                  Shorts
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Chuyển đổi YouTube sang MP3 320kbps cực nhanh cho podcast và
                  nhạc
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Tải phụ đề đa ngôn ngữ (SRT, VTT) và ảnh thu nhỏ Thumbnail
                  chất lượng cao
                </span>
              </li>
            </ul>
          </div>

          {/* Instagram */}
          <div className="seo-platform-card">
            <div className="seo-platform-header">
              <div className="seo-platform-title-wrap">
                <PlatformBrandIcon id="instagram" size={24} />
                <span className="seo-platform-name">Instagram Downloader</span>
              </div>
              <span className="seo-platform-tag">Reels / Post</span>
            </div>
            <ul className="seo-platform-features">
              <li>
                <Check size={14} />
                <span>
                  Tải Instagram Reels, Video bài viết và video Story độ nét cao
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Bóc tách video từ các bài viết Carousel nhiều slide trọn vẹn
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Lưu giữ âm thanh gốc sắc nét cho nội dung thời trang, du lịch,
                  đời sống
                </span>
              </li>
            </ul>
          </div>

          {/* X / Twitter */}
          <div className="seo-platform-card">
            <div className="seo-platform-header">
              <div className="seo-platform-title-wrap">
                <PlatformBrandIcon id="twitter" size={24} />
                <span className="seo-platform-name">
                  X / Twitter Downloader
                </span>
              </div>
              <span className="seo-platform-tag">HD MP4</span>
            </div>
            <ul className="seo-platform-features">
              <li>
                <Check size={14} />
                <span>
                  Tải video tweet độ phân giải HD MP4 nhanh nhất từ x.com và
                  twitter.com
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Lưu trữ clip tin tức thời sự, thể thao, meme với tốc độ máy
                  chủ tối đa
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Hỗ trợ cả định dạng ảnh động GIF chất lượng cao từ tweet
                </span>
              </li>
            </ul>
          </div>

          {/* Other Platforms */}
          <div className="seo-platform-card">
            <div className="seo-platform-header">
              <div className="seo-platform-title-wrap">
                <PlatformBrandIcon id="auto" size={24} />
                <span className="seo-platform-name">Đa Nền Tảng Mở Rộng</span>
              </div>
              <span className="seo-platform-tag">14+ CDN</span>
            </div>
            <ul className="seo-platform-features">
              <li>
                <Check size={14} />
                <span>
                  Hỗ trợ Pinterest Video & Idea Pins, Vimeo Staff Picks,
                  Bilibili Anime Full HD
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Tải clip Twitch, video LinkedIn, Telegram Public Channels,
                  Weibo, Tumblr
                </span>
              </li>
              <li>
                <Check size={14} />
                <span>
                  Liên tục cập nhật bộ giải mã mới nhất thích ứng với thay đổi
                  API các nền tảng
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 4: Formats & Quality Matrix Table */}
      <div className="seo-section">
        <div className="seo-section-header">
          <span className="seo-section-badge">Bảng định dạng</span>
          <h2 className="seo-section-title">
            Định dạng & độ phân giải{' '}
            <span className="text-gradient">được hỗ trợ</span>
          </h2>
          <p className="seo-section-desc">
            Apexa Get cung cấp đầy đủ các định dạng phổ biến nhất, tương thích
            100% với các thiết bị di động, máy tính để bàn, TV thông minh và
            phần mềm dựng phim.
          </p>
        </div>

        <div className="seo-matrix-wrap">
          <table className="seo-matrix-table">
            <thead>
              <tr>
                <th>Định dạng</th>
                <th>Chất lượng tối đa</th>
                <th>Âm thanh</th>
                <th>Thiết bị tương thích</th>
                <th>Mục đích sử dụng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className="format-badge">MP4 Video</span>
                </td>
                <td>4K UHD (2160p) / 1080p 60fps</td>
                <td>AAC 320kbps Stereo</td>
                <td>Mọi thiết bị (iPhone, Android, PC, Mac, TV)</td>
                <td>Xem offline, dựng phim Premiere/CapCut</td>
              </tr>
              <tr>
                <td>
                  <span className="format-badge">MP3 Audio</span>
                </td>
                <td>320kbps / 48kHz HD</td>
                <td>Âm thanh phòng thu gốc</td>
                <td>Máy nghe nhạc, điện thoại, ô tô, tai nghe</td>
                <td>Nghe nhạc, podcast, trích xuất nhạc nền</td>
              </tr>
              <tr>
                <td>
                  <span className="format-badge">M4A Audio</span>
                </td>
                <td>256kbps VBR Lossless</td>
                <td>Chuẩn nén cao cấp Apple</td>
                <td>Hệ sinh thái Apple (iPhone, iPad, Mac)</td>
                <td>Chất lượng cao dung lượng tối ưu</td>
              </tr>
              <tr>
                <td>
                  <span className="format-badge">WebM Video</span>
                </td>
                <td>4K UHD HDR / VP9 Codec</td>
                <td>Opus 160kbps</td>
                <td>Trình duyệt hiện đại, Android, YouTube</td>
                <td>Xem trên web độ nét siêu cao</td>
              </tr>
              <tr>
                <td>
                  <span className="format-badge">Phụ đề SRT/VTT</span>
                </td>
                <td>Đa ngôn ngữ gốc & Tự động</td>
                <td>Văn bản UTF-8</td>
                <td>VLC Player, YouTube, Premiere Pro</td>
                <td>Dịch thuật, học ngoại ngữ, thêm phụ đề</td>
              </tr>
              <tr>
                <td>
                  <span className="format-badge">Thumbnail JPG</span>
                </td>
                <td>HD 1280x720 / 1920x1080</td>
                <td>Ảnh bìa sắc nét</td>
                <td>Trình xem ảnh, phần mềm đồ họa Photoshop</td>
                <td>Làm ảnh bìa video, thiết kế banner</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: SEO FAQ Accordion */}
      <div className="seo-section">
        <div className="seo-section-header">
          <span className="seo-section-badge">Hỏi đáp thường gặp</span>
          <h2 className="seo-section-title">
            Câu hỏi thường gặp về{' '}
            <span className="text-gradient">Apexa Get</span>
          </h2>
          <p className="seo-section-desc">
            Giải đáp chi tiết tất cả thắc mắc của bạn về tính năng, độ bảo mật
            và cách tải video hiệu quả nhất.
          </p>
        </div>

        <div className="seo-faq-accordion">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.q}
                className={`seo-faq-item ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="seo-faq-q"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className="seo-faq-chevron" />
                </button>
                {isOpen && (
                  <div className="seo-faq-a">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 6: Bottom Call To Action */}
      <div className="seo-cta-banner">
        <h2 className="seo-cta-title">
          Sẵn sàng tải video chất lượng gốc siêu tốc?
        </h2>
        <p className="seo-cta-desc">
          Dán liên kết video từ Facebook, TikTok, YouTube hoặc bất kỳ nền tảng
          nào vào ô tìm kiếm phía trên để trải nghiệm tốc độ vượt trội ngay bây
          giờ.
        </p>
        <button
          type="button"
          className="seo-cta-btn"
          onClick={handleScrollToTop}
        >
          <Zap size={16} />
          <span>Bắt đầu tải ngay</span>
        </button>
      </div>
    </section>
  );
}

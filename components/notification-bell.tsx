'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Inbox,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Clock,
  PlusCircle,
} from 'lucide-react';
import './notification-bell.css';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type?: 'system' | 'message' | 'alert' | 'feature';
}

export interface NotificationBellProps {
  /** Initial notification list */
  initialItems?: NotificationItem[];
  /** Badge display mode: number (e.g. "3") or simple dot */
  variant?: 'number' | 'dot';
  /** Max count displayed before showing 99+ */
  maxCount?: number;
  /** Custom trigger class */
  className?: string;
  /** Callback when notification is clicked */
  onItemClick?: (item: NotificationItem) => void;
  /** Position alignment of dropdown */
  align?: 'left' | 'right';
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Cập nhật hệ thống thành công',
    description: 'Phiên bản mới đã sẵn sàng trải nghiệm với nhiều cải tiến.',
    time: '2 phút trước',
    read: false,
    type: 'system',
  },
  {
    id: '2',
    title: 'Tin nhắn mới từ Admin',
    description: 'Vui lòng kiểm tra lại thiết lập tài khoản của bạn.',
    time: '25 phút trước',
    read: false,
    type: 'message',
  },
  {
    id: '3',
    title: 'Tính năng mới: AI Assistant',
    description: 'Trợ lý AI vừa được tích hợp vào không gian làm việc.',
    time: '2 giờ trước',
    read: false,
    type: 'feature',
  },
];

export function NotificationBell({
  initialItems = DEFAULT_NOTIFICATIONS,
  variant = 'number',
  maxCount = 99,
  className = '',
  onItemClick,
  align = 'right',
}: NotificationBellProps) {
  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isRinging, setIsRinging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  // Bell ring effect whenever unread count increases
  const prevUnreadRef = useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setIsRinging(true);
      const timer = setTimeout(() => setIsRinging(false), 800);
      return () => clearTimeout(timer);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Actions
  const markAsRead = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  };

  const markAllAsRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Demo: trigger a new notification to see the slide + pop animation in real time
  const addDemoNotification = () => {
    const newId = Date.now().toString();
    const demoItems: Array<Omit<NotificationItem, 'id' | 'read'>> = [
      {
        title: 'Đơn hàng mới #8492',
        description:
          'Khách hàng vừa thanh toán thành công qua cổng thanh toán.',
        time: 'Vừa xong',
        type: 'feature',
      },
      {
        title: 'Bình luận mới',
        description: 'Lan Anh đã nhắc đến bạn trong một bình luận gần đây.',
        time: 'Vừa xong',
        type: 'message',
      },
      {
        title: 'Cảnh báo bảo mật',
        description: 'Phát hiện đăng nhập mới từ thiết bị Chrome trên Windows.',
        time: 'Vừa xong',
        type: 'alert',
      },
    ];
    const picked = demoItems[Math.floor(Math.random() * demoItems.length)];
    setItems((prev) => [{ id: newId, read: false, ...picked }, ...prev]);
  };

  const filteredItems = items.filter((item) =>
    filter === 'unread' ? !item.read : true,
  );

  const renderBadgeContent = () => {
    if (variant === 'dot') return null;
    if (unreadCount > maxCount) return `${maxCount}+`;
    return unreadCount;
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-sky-500" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'feature':
        return <Sparkles className="w-4 h-4 text-violet-500" />;
      case 'system':
      default:
        return <Bell className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        className="t-bell-trigger"
        data-ringing={isRinging}
        aria-label={`Thông báo (${unreadCount} chưa đọc)`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Bell className="t-bell-icon w-5 h-5" />

        {/* Transitions.dev Badge */}
        <span
          className="t-badge"
          data-open={hasUnread ? 'true' : 'false'}
          aria-hidden={!hasUnread}
        >
          <span className={`t-badge-dot ${variant === 'dot' ? 'is-dot' : ''}`}>
            {renderBadgeContent()}
          </span>
        </span>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2.5 z-50 w-80 sm:w-96 rounded-2xl border border-neutral-200/80 bg-white/95 backdrop-blur-md shadow-2xl transition-all duration-200 animate-in fade-in-0 zoom-in-95 dark:border-neutral-800 dark:bg-neutral-900/95 text-neutral-900 dark:text-neutral-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{
            transformOrigin: align === 'right' ? 'top right' : 'top left',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800/80">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">
                Thông báo
              </h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-2 py-1 rounded-md transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Đã đọc</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 bg-neutral-50/60 dark:bg-neutral-900/40 border-b border-neutral-100 dark:border-neutral-800/60 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                filter === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              Tất cả ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                filter === 'unread'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60 overscroll-contain">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-2.5">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  {filter === 'unread'
                    ? 'Bạn đã đọc hết mọi thông báo!'
                    : 'Chưa có thông báo nào'}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Các cập nhật mới sẽ hiển thị tại đây
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    markAsRead(item.id);
                    onItemClick?.(item);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      markAsRead(item.id);
                      onItemClick?.(item);
                    }
                  }}
                  className={`group relative flex items-start gap-3 p-3.5 cursor-pointer transition-colors duration-150 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 ${
                    !item.read
                      ? 'bg-rose-50/20 dark:bg-rose-950/10'
                      : 'opacity-85'
                  }`}
                >
                  {/* Icon Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mt-0.5 border border-neutral-200/50 dark:border-neutral-700/50">
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`text-xs truncate ${
                          !item.read
                            ? 'font-semibold text-neutral-900 dark:text-white'
                            : 'font-medium text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-neutral-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </div>
                  </div>

                  {/* Quick Actions (Hover) */}
                  <div className="absolute right-2.5 top-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!item.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                        className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => removeItem(item.id, e)}
                      className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                      title="Xóa thông báo này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Demo trigger button */}
          <div className="p-2.5 bg-neutral-50/70 dark:bg-neutral-900/60 border-t border-neutral-100 dark:border-neutral-800/80 rounded-b-2xl flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={addDemoNotification}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Thử nhận thông báo mới</span>
            </button>
            <span className="text-[10px] text-neutral-400">
              Transitions.dev
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

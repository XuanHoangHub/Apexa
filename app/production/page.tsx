import type { Metadata } from 'next';
import ProductionSuite from '@/components/production/production-suite';
import './production.css';

export const metadata: Metadata = {
  title: 'Production Suite — Apexa',
  description:
    'Từ kịch bản đến ngày bấm máy. Không gian quản lý sản xuất của Apexa.',
};

export default function ProductionPage() {
  return <ProductionSuite />;
}

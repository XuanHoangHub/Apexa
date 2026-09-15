import AuthForm from '@/components/auth/auth-form';

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  let initialError: string | undefined;

  if (error === 'callback') {
    initialError =
      'Liên kết đã hết hạn hoặc được mở ở trình duyệt khác. Hãy đăng nhập hoặc yêu cầu liên kết mới.';
  } else if (error === 'oauth' || error === 'access_denied') {
    initialError =
      'Đăng nhập bằng mạng xã hội chưa thành công hoặc đã bị hủy. Vui lòng thử lại.';
  } else if (error) {
    initialError = 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.';
  }

  return <AuthForm mode="login" initialError={initialError} />;
}

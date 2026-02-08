import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";
import { clerkAuthAppearance } from "@/lib/clerk-auth-appearance";

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="TN HOME STUDIO"
      heading="Tạo tài khoản cá nhân."
      description="Đăng ký để mở khóa hành trình mua sắm liền mạch, lưu gu nội thất riêng và nhận cập nhật ưu đãi mới nhất."
      highlights={[
        "Thiết lập tài khoản trong vài bước, bảo mật và nhanh chóng.",
        "Đồng bộ giỏ hàng và lịch sử mua sắm giữa điện thoại và máy tính.",
        "Nhận thông báo về bộ sưu tập mới phù hợp phong cách của bạn.",
      ]}
    >
      <SignUp appearance={clerkAuthAppearance} />
    </AuthShell>
  );
}

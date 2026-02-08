import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";
import { clerkAuthAppearance } from "@/lib/clerk-auth-appearance";

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="TN HOME STUDIO"
      heading="Thiết kế sống tinh giản."
      description="Đăng nhập để theo dõi đơn hàng, lưu danh sách yêu thích và đồng bộ trải nghiệm mua sắm trên mọi thiết bị."
      highlights={[
        "Quản lý đơn hàng và trạng thái giao hàng theo thời gian thực.",
        "Lưu sản phẩm yêu thích để quay lại nhanh hơn mỗi lần ghé thăm.",
        "Nhận đề xuất nội thất phù hợp với phong cách không gian của bạn.",
      ]}
    >
      <SignIn appearance={clerkAuthAppearance} />
    </AuthShell>
  );
}

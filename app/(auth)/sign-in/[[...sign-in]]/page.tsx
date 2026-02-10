import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

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
      <Suspense
        fallback={
          <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
        }
      >
        <GoogleSignInButton />
      </Suspense>
    </AuthShell>
  );
}

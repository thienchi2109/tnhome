import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

const trustBadges = [
  {
    icon: Truck,
    title: "Miễn Phí Vận Chuyển",
    description: "Cho đơn hàng từ 500K",
  },
  {
    icon: ShieldCheck,
    title: "Thanh Toán An Toàn",
    description: "Bảo mật tuyệt đối",
  },
  {
    icon: RefreshCw,
    title: "Đổi Trả 7 Ngày",
    description: "Hoàn tiền dễ dàng",
  },
  {
    icon: Headphones,
    title: "Hỗ Trợ 24/7",
    description: "Luôn sẵn sàng giúp bạn",
  },
];

export function BrandStory() {
  return (
    <section className="py-16 md:py-24 px-6">
      <div className="mx-auto max-w-[1400px]">
        {/* Brand Statement */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-16 md:mb-20">
          <h2 className="heading-hero text-foreground">
            Chất Lượng Là
            <br />
            Tiêu Chuẩn Của Chúng Tôi
          </h2>
          <div className="flex items-end">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
              TN Home mang đến những sản phẩm gia dụng được chọn lọc kỹ
              lưỡng, kết hợp giữa thiết kế hiện đại và chất lượng bền vững.
              Mỗi sản phẩm đều được kiểm tra và đảm bảo đáp ứng tiêu chuẩn
              cao nhất trước khi đến tay bạn.
            </p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {trustBadges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center gap-3 p-6"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <badge.icon className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {badge.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

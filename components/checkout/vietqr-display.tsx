"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface VietQRDisplayProps {
  orderId: string;
  amount: number;
  bankId: string;
  accountNo: string;
  accountName: string;
}

export function VietQRDisplay({
  orderId,
  amount,
  bankId,
  accountNo,
  accountName,
}: VietQRDisplayProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate VietQR URL
  // Format: https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-{TEMPLATE}.jpg?amount={AMOUNT}&addInfo={INFO}&accountName={NAME}
  const transferContent = `DH${orderId.slice(-8).toUpperCase()}`;
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

  const copyTransferContent = async () => {
    try {
      await navigator.clipboard.writeText(transferContent);
      setCopied(true);
      toast.success("Đã sao chép nội dung chuyển khoản");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép");
    }
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-center mb-6">
        Quét mã QR để thanh toán
      </h3>

      {/* QR Code */}
      <div className="relative mx-auto w-full max-w-xs aspect-square bg-muted rounded-xl overflow-hidden">
        {!imageLoaded && !imageError && (
          <Skeleton className="absolute inset-0" />
        )}
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Không thể tải mã QR. Vui lòng chuyển khoản thủ công.
            </p>
          </div>
        ) : (
          <Image
            src={qrUrl}
            alt="Mã QR thanh toán VietQR"
            fill
            className="object-contain p-2"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            priority
            unoptimized // External URL
          />
        )}
      </div>

      {/* Payment Info */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
          <span className="text-sm text-muted-foreground">Số tiền</span>
          <span className="text-lg font-bold text-primary">
            {formatPrice(amount)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
          <span className="text-sm text-muted-foreground">Nội dung CK</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium">
              {transferContent}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyTransferContent}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
          <span className="text-sm text-muted-foreground">Chủ tài khoản</span>
          <span className="font-medium">{accountName}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 rounded-xl bg-primary/5 p-4">
        <p className="text-sm text-center text-muted-foreground">
          Mở ứng dụng ngân hàng → Quét mã QR → Kiểm tra thông tin → Thanh toán
        </p>
      </div>

      {/* Manual Transfer Info (fallback) */}
      <details className="mt-4">
        <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
          Chuyển khoản thủ công
        </summary>
        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Ngân hàng:</span>{" "}
            <span className="font-medium">MB Bank</span>
          </p>
          <p>
            <span className="text-muted-foreground">Số tài khoản:</span>{" "}
            <span className="font-mono font-medium">{accountNo}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Chủ TK:</span>{" "}
            <span className="font-medium">{accountName}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Số tiền:</span>{" "}
            <span className="font-medium">{formatPrice(amount)}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Nội dung:</span>{" "}
            <span className="font-mono font-medium">{transferContent}</span>
          </p>
        </div>
      </details>
    </div>
  );
}

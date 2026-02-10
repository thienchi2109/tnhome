# Thiết lập Clerk Production trên VPS

Tài liệu này hướng dẫn cấu hình Clerk với khóa `live` cho môi trường triển khai VPS đang dùng `docker-compose.prod.yml`.

## Phạm vi

- Kiểu triển khai: Docker Compose trên VPS
- Nhà cung cấp xác thực: Clerk
- Mục tiêu: bỏ trạng thái `Development mode` và chạy bằng khóa production

## Điều kiện tiên quyết

1. Instance production của Clerk đã sẵn sàng.
2. Domain production đã được cấu hình trong Clerk (ví dụ `https://giadungtnhome.io.vn`).
3. Có thể SSH vào VPS và chạy lệnh Docker.
4. Đã có quyền Docker Hub để push/pull image `thienchi/tnhome-web:latest`.

## Quy trình triển khai tích hợp (Local -> VPS)

Mục này được đồng bộ theo `.agent/workflows/deploy-prod.md`.

## A. Phát triển và kiểm thử trên Local

Hãy chạy và kiểm tra thay đổi trên máy local trước (ví dụ `http://localhost:3003`).

## B. Tạo migration trên Local (nếu Prisma schema thay đổi)

```powershell
npx prisma migrate dev --name <ten_thay_doi>
```

Ví dụ:

```powershell
npx prisma migrate dev --name add_user_table
```

## C. Build và push Docker image trên Local

```powershell
docker buildx build --platform linux/amd64 -t thienchi/tnhome-web:latest -f docker/Dockerfile . --push
```

Lưu ý: nếu cần, chạy `docker login` trước.

## D. Deploy image lên VPS

```bash
cd /path/to/tnhome
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## E. Áp dụng migration database trên VPS (nếu đã làm bước B)

Khuyến nghị dùng cách an toàn, có lịch sử migration:

```bash
docker compose -f docker-compose.prod.yml exec web npx prisma@6 migrate deploy
```

Tùy chọn theo workflow nếu cần gọi trực tiếp container:

```bash
docker exec -it tnhome-web-1 npx prisma@6 migrate deploy
```

## F. Áp dụng pg_trgm + tối ưu search/filter trên VPS

Mục tiêu: bật `pg_trgm` để tăng tốc tìm kiếm `ILIKE/%term%` và áp dụng index cho luồng search/filter (customer + admin).

### 1) Backup database trước khi migrate

```bash
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres -d tnhome > backup-tnhome-$(date +%F-%H%M%S).sql
```

### 2) Bật extension pg_trgm

```bash
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d tnhome -f - < prisma/migrations/enable_pg_trgm_extension.sql
```

### 3) Áp dụng migration index cho search/filter

```bash
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d tnhome -f - < prisma/migrations/harden_search_filter_indexes.sql
```

### 4) Verify sau khi migrate

```bash
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d tnhome -c "SELECT extname, extversion FROM pg_extension WHERE extname='pg_trgm';"
docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d tnhome -c "SELECT indexname FROM pg_indexes WHERE tablename IN ('Product','Order') AND indexname ILIKE '%trgm%' ORDER BY indexname;"
```

Kỳ vọng:
- Có 1 dòng `pg_trgm` trong `pg_extension`.
- Có các index dạng `*_trgm_idx` cho `Product` và `Order`.

### 5) PowerShell note (nếu VPS dùng PowerShell)

PowerShell không dùng được `<` redirect như bash. Dùng pipe:

```powershell
Get-Content -Raw "prisma/migrations/enable_pg_trgm_extension.sql" |
  docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d tnhome -f -

Get-Content -Raw "prisma/migrations/harden_search_filter_indexes.sql" |
  docker compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d tnhome -f -
```

Tham khảo chi tiết: `docs/pg_trgm-extension-migration.md`.

## 1. Cập nhật `.env` trên VPS (khóa Clerk)

Chạy trong cùng thư mục có `docker-compose.prod.yml`:

```bash
cd /path/to/tnhome
cp .env .env.bak.$(date +%F-%H%M%S)
nano .env
```

Thiết lập:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<pk_live_...>
CLERK_SECRET_KEY=<sk_live_...>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_APP_URL=https://giadungtnhome.io.vn
```

Lưu ý:

- Không commit `.env` lên git.
- Không lưu secret thật trong tài liệu markdown.

## 2. Khởi động lại stack production

```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## 3. Xác minh container đang dùng khóa live

```bash
docker compose -f docker-compose.prod.yml exec web sh -lc 'node -e "
const k=process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY||\"\"; 
console.log(\"key_type=\", k.startsWith(\"pk_live_\")?\"live\":\"not_live\");
console.log(\"decoded=\", Buffer.from((k.split(\"_\")[2]||\"\"),\"base64\").toString());
"'
```

Kỳ vọng:

- `key_type= live`
- `decoded` phải là domain production (không phải `*.accounts.dev`)

## 4. Kiểm tra khóa test bị bake trong build output

Nếu màn hình đăng nhập vẫn hiện `Development mode`, kiểm tra xem `pk_test` có bị bake vào artifact trong image hay không:

```bash
docker compose -f docker-compose.prod.yml exec web sh -lc 'grep -R "pk_test_" .next 2>/dev/null | head'
```

Nếu lệnh có kết quả, image đã được build bằng test key.

### Vì sao xảy ra

`docker-compose.prod.yml` đang dùng prebuilt image:

```yaml
web:
  image: thienchi/tnhome-web:latest
```

Với Next.js + `NEXT_PUBLIC_*`, giá trị client-side có thể được nhúng ngay lúc build. Khi đó, chỉ đổi `.env` runtime có thể không đủ để cập nhật hành vi auth phía client.

## 5. Cách xử lý khi key đã bị bake

1. Build lại image từ source theo luồng Local build/push ở mục `C`.
2. Push image tag mới lên Docker Hub.
3. Pull và deploy lại trên VPS:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

4. Chạy lại các bước xác minh ở mục 3 và 4.

## 6. Checklist trên Clerk Dashboard

1. Đang chọn đúng production instance.
2. Domain đã được thêm và xác thực (`giadungtnhome.io.vn`, tùy chọn thêm `www`).
3. URL đăng nhập/đăng ký hợp lệ cho domain production.

## 7. Bảo mật sau triển khai

Nếu live secret key đã từng bị lộ trong chat hoặc log:

1. Rotate `CLERK_SECRET_KEY` trên Clerk Dashboard.
2. Cập nhật `.env` trên VPS.
3. Khởi động lại stack.

## Tóm tắt nhanh

1. Local: test code -> `prisma migrate dev` (nếu cần) -> `docker buildx ... --push`.
2. VPS: cập nhật `.env` với Clerk live keys -> `docker compose pull` -> `docker compose up -d`.
3. VPS: chạy `prisma migrate deploy` nếu schema có thay đổi.
4. Xác minh key live và đảm bảo không còn `pk_test` bị bake.

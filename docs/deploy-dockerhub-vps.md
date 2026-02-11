# Deploy Guide: Local Build -> DockerHub -> VPS Pull (No VPS Build)

## Goal
- Build image on local machine.
- Push image to DockerHub.
- Pull and run on VPS using `docker-compose.prod.yml`.
- Do not build app image on VPS.

## 1) Required VPS `.env` (Supabase Auth)
Your VPS `.env` must use Supabase keys (not Clerk keys).

Required keys:
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_PORT`
- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `VIETQR_BANK_ID`
- `VIETQR_ACCOUNT_NO`
- `VIETQR_ACCOUNT_NAME`
- `NEXT_PUBLIC_APP_URL`
- `TUNNEL_TOKEN`
- `NODE_ENV`

Example production values:
- `NEXT_PUBLIC_SUPABASE_URL=https://laqvjojsvnvmxzllloor.supabase.co`
- `NEXT_PUBLIC_APP_URL=https://giadungtnhome.io.vn`
- `NODE_ENV=production`

## 2) Local Build And Push
Run these commands on local machine in repo root.

```bash
cd /mnt/d/tnhome
npm ci
npm run type-check
docker login -u thienchi
export IMAGE=thienchi/tnhome-web
export TAG=$(git rev-parse --short HEAD)
export NEXT_PUBLIC_SUPABASE_URL=https://laqvjojsvnvmxzllloor.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=REPLACE_WITH_REAL_ANON_KEY
export NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dve3n20wv
docker buildx build --platform linux/amd64 -f docker/Dockerfile -t ${IMAGE}:${TAG} -t ${IMAGE}:latest --build-arg NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} --build-arg NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME} --push .
```

## 3) VPS Deploy (Pull Only)
Run these commands on VPS project directory (where `docker-compose.prod.yml` exists).

```bash
cd ~/tnhome
docker login -u thienchi
docker compose -f docker-compose.prod.yml pull web
docker compose -f docker-compose.prod.yml up -d --remove-orphans
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=200 web
```

## 4) Health Checks
Run on VPS:

```bash
curl -I http://127.0.0.1:3003
docker compose -f docker-compose.prod.yml logs --tail=200 tunnel
```

Then verify in browser:
- `https://giadungtnhome.io.vn`
- `https://giadungtnhome.io.vn/sign-in`
- `https://giadungtnhome.io.vn/admin`

## 5) Optional: Apply Prisma Migrations On VPS
Only run when schema changes are introduced.

```bash
cd ~/tnhome
npx prisma migrate deploy
```

## 6) Fast Redeploy (After New Push To `latest`)
Run on VPS:

```bash
cd ~/tnhome
docker compose -f docker-compose.prod.yml pull web
docker compose -f docker-compose.prod.yml up -d web
docker compose -f docker-compose.prod.yml logs --tail=100 web
```

## 7) Troubleshooting
- If old UI appears, hard refresh browser or use incognito.
- If auth redirects to wrong domain, check Supabase Auth URL Configuration and VPS `NEXT_PUBLIC_APP_URL`.
- If `/admin` redirects to unauthorized, verify `ADMIN_EMAILS` on VPS `.env` and restart web container.
- If container starts but app fails, inspect logs with `docker compose -f docker-compose.prod.yml logs --tail=200 web`.

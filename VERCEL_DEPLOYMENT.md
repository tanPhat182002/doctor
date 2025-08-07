# Hướng dẫn Deploy lên Vercel

## Vấn đề thường gặp

Khi deploy lên Vercel, bạn có thể gặp lỗi liên quan đến NextAuth:
- `[next-auth][warn][NEXTAUTH_URL]`
- `[next-auth][warn][NO_SECRET]`

## Cách khắc phục

### 1. Cấu hình Environment Variables trên Vercel

Truy cập Vercel Dashboard → Project Settings → Environment Variables và thêm:

```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secure-random-secret-key
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
DATABASE_URL=your-production-database-url
DIRECT_URL=your-production-direct-database-url
```

### 2. Tạo NEXTAUTH_SECRET

Sử dụng một trong các cách sau để tạo secret key:

```bash
# Cách 1: Sử dụng openssl
openssl rand -base64 32

# Cách 2: Sử dụng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Cách 3: Online generator
# Truy cập: https://generate-secret.vercel.app/32
```

### 3. Cập nhật NEXTAUTH_URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-app-name.vercel.app`

### 4. Kiểm tra Database Connection

Đảm bảo database URL có thể truy cập từ Vercel:
- Supabase: Đã cấu hình đúng
- PostgreSQL: Kiểm tra firewall và connection string

### 5. Deploy lại

Sau khi cấu hình xong, deploy lại project:

```bash
# Hoặc push code mới lên Git
git add .
git commit -m "Add environment variables for Vercel"
git push

# Hoặc redeploy trực tiếp trên Vercel Dashboard
```

## Kiểm tra sau khi deploy

1. Truy cập URL production
2. Kiểm tra Console không còn warning NextAuth
3. Test chức năng đăng nhập
4. Kiểm tra kết nối database

## Troubleshooting

### Lỗi Database Connection
- Kiểm tra DATABASE_URL và DIRECT_URL
- Đảm bảo database cho phép connection từ Vercel

### Lỗi NextAuth
- Kiểm tra NEXTAUTH_URL khớp với domain production
- Đảm bảo NEXTAUTH_SECRET đã được set

### Lỗi API Routes
- Kiểm tra NEXT_PUBLIC_API_URL
- Đảm bảo không có hardcode localhost trong code
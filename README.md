# CarSense — پلتفرم مکانیک

پروژه دانشگاهی: سامانه ارتباط کاربر و مکانیک

## ساختار پروژه

```
├── core/          ← بکند FastAPI (Python)
├── src/           ← فرانت React + TypeScript
├── docker-compose.yml
├── Dockerfile.dev
├── requirements.txt
└── package.json
```

---

## راه‌اندازی

### ۱. بکند + دیتابیس (Docker)

```bash
docker-compose up --build -d
docker-compose exec api alembic upgrade head
```

بکند روی: http://localhost:8000  
مستندات API: http://localhost:8000/docs

### ۲. فرانت

```bash
npm install
npm run dev
```

فرانت روی: http://localhost:5173

---

## حساب‌های تست

برای تست، ابتدا از http://localhost:5173/login یک حساب بسازید.

- **کاربر عادی:** ثبت‌نام با ایمیل/موبایل → نقش «کاربر»  
- **مکانیک:** ثبت‌نام با ایمیل/موبایل → نقش «مکانیک» (نیاز به تأیید ادمین)  
- **ادمین:** باید مستقیم در دیتابیس ساخته شود (role = admin)

---

## صفحات وصل‌شده به بکند

| صفحه | مسیر | وضعیت |
|------|------|--------|
| صفحه اصلی | `/` | ✅ |
| ورود / ثبت‌نام | `/login` | ✅ |
| پنل مکانیک - داشبورد | `/mechanic/dashboard` | ✅ |
| پنل مکانیک - درخواست‌ها | `/mechanic/requests` | ✅ |
| پنل مکانیک - پروفایل | `/mechanic/profile` | ✅ |
| پنل کاربر - ثبت مشکل | `/user/new-request` | ✅ |
| پنل کاربر - تاریخچه | `/user/history` | ✅ |
| پنل کاربر - خودروها | `/user/vehicles` | ✅ |
| پنل کاربر - پروفایل | `/user/profile` | ✅ |
| لیست مکانیک‌ها | `/mechanics` | ✅ |
| پروفایل عمومی مکانیک | `/mechanics/:id` | ✅ |

---

## تکنولوژی‌ها

**بکند:** FastAPI · PostgreSQL · SQLAlchemy · Alembic · JWT  
**فرانت:** React · TypeScript · Tailwind CSS · Axios · Vite

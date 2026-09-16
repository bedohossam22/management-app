# 📋 تطبيق إدارة المهام (Task Management App)

تطبيق متكامل (Full-Stack) لإدارة المهام مبني باستخدام **React + TypeScript** للواجهة الأمامية و **Node.js + Express + MongoDB** للواجهة الخلفية، ويدعم التوثيق باستخدام JWT، وعمليات إدارة المهام الكاملة (CRUD)، والتصفية (Filtering)، والبحث (Search).

---

## 🌐 اللغات / Languages

- [English](README.md)
- [العربية](README.ar.md)

---

## 🤖 أدوات الذكاء الاصطناعي المستخدمة في التطوير

| الأداة | الدور |
|---|---|
| **DeepSeek** | التخطيط الأولي، وتصميم بنية المجلدات، والقرارات الهندسية |
| **Gemini** | ملفات الإعدادات (tsconfig, vite.config, vercel.json, وإعدادات البيئة) |
| **Kimi** | تصحيح أخطاء الواجهة الخلفية — معالجة الأخطاء غير المتزامنة، استعلامات Mongoose، ومنطق الـ middleware |
| **Thunder Client** | اختبار الواجهات البرمجية (API) — تم اختبار جميع الـ endpoints بمجموعات Thunder Client |
| **Antigravity (Google DeepMind)** | تحسين واجهة المستخدم — تصميم المكونات، الحركات (animations)، وصقل تجربة المستخدم |

---

## 🚀 المعاينة المباشرة (Live Demo)

🔗 **[https://management-app-frontend-five.vercel.app/](https://management-app-frontend-five.vercel.app/)**

---

## 🔑 بيانات حساب التجربة (Test Account)

| الدور | البريد الإلكتروني | كلمة المرور |
|---|---|---|
| المراجع / مسؤول التوظيف (Recruiter / Reviewer) | `Test@recruitermail.com` | `Recruit$123456` |

---

## ✅ المتطلبات الأساسية

تأكد من تثبيت ما يلي:

- [Node.js](https://nodejs.org/) **إصدار 18 فما فوق**
- [npm](https://www.npmjs.com/) **إصدار 9 فما فوق**
- [MongoDB](https://www.mongodb.com/) — نسخة محلية **أو** رابط اتصال عبر [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## ⚙️ متغيرات البيئة (Environment Variables)

### الواجهة الخلفية (`backend/.env`)

أنشئ ملفاً في المسار `backend/.env` — راجع النموذج في [`backend/.env.example`](./backend/.env.example):

| المتغير | الوصف | مثال |
|---|---|---|
| `PORT` | المنفذ الذي يعمل عليه خادم Express | `5000` |
| `MONGO_URI` | رابط الاتصال بقاعدة بيانات MongoDB | `mongodb://localhost:27017/task-management` |
| `JWT_SECRET` | المفتاح السري المستخدم لتوقيع رموز JWT | `your_super_secret_key` |

### الواجهة الأمامية (`frontend/.env`)

أنشئ ملفاً في المسار `frontend/.env` — راجع النموذج في [`frontend/.env.example`](./frontend/.env.example):

| المتغير | الوصف | مثال |
|---|---|---|
| `VITE_API_URL` | الرابط الأساسي للواجهة البرمجية (API) | `http://localhost:5000/api` |

---

## 🛠️ التثبيت والتشغيل

### 1. استنساخ المستودع (Clone)

```bash
git clone <repo-url>
cd management-app
```

### 2. إعداد الواجهة الخلفية (Backend)

```bash
cd backend
npm install
cp .env.example .env       # املأ القيم الخاصة بك
npm run dev                # يبدأ التشغيل على http://localhost:5000
```

### 3. إعداد الواجهة الأمامية (Frontend)

```bash
cd frontend
npm install
cp .env.example .env       # املأ القيم الخاصة بك
npm run dev                # يبدأ التشغيل على http://localhost:5173
```

---

## 📁 هيكل المشروع

```
management-app/
├── vercel.json                  # إعدادات النشر على Vercel (خدمات الواجهة الأمامية والخلفية)
│
├── backend/
│   ├── src/
│   │   ├── app.ts               # إعداد Express — الـ middleware، المسارات، معالجات الأخطاء
│   │   ├── server.ts            # نقطة انطلاق خادم HTTP
│   │   ├── config/
│   │   │   └── Mongodb.ts       # منطق الاتصال بقاعدة بيانات MongoDB
│   │   ├── controllers/
│   │   │   ├── authController.ts    # معالجات تسجيل الدخول وإنشاء الحسابات
│   │   │   └── taskController.ts    # معالجات عمليات المهام مع التصفية والبحث
│   │   ├── middleware/
│   │   │   ├── auth.ts          # التحقق من توثيق JWT
│   │   │   └── errorHandler.ts  # معالج الأخطاء العام
│   │   ├── models/
│   │   │   ├── User.ts          # نموذج المستخدم في Mongoose (تشفير كلمات المرور بـ bcrypt)
│   │   │   └── Task.ts          # نموذج المهام في Mongoose (الحالة، الأولوية، تاريخ الاستحقاق)
│   │   ├── routes/
│   │   │   ├── authRoutes.ts    # مسارات التوثيق POST /api/auth/register, POST /api/auth/login
│   │   │   └── taskRoutes.ts    # مسارات المهام GET/POST/PUT/DELETE /api/tasks (محمية)
│   │   ├── validators/
│   │   │   ├── authValidator.ts # قواعد التحقق للتوثيق عبر express-validator
│   │   │   └── taskValidator.ts # قواعد التحقق للمهام عبر express-validator
│   │   └── utils/               # أدوات ومساعدات عامة
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx              # الموجه الرئيسي (Router) — المسارات العامة والمحمية
    │   ├── main.tsx             # نقطة انطلاق React مع الـ Providers
    │   ├── index.css            # التنسيقات العامة
    │   ├── context/
    │   │   └── AuthContext.tsx  # حالة التوثيق العامة (المستخدم، تسجيل الدخول، تسجيل الخروج)
    │   ├── hooks/
    │   │   └── useAuth.ts       # Hook مخصص للوصول إلى AuthContext
    │   ├── services/
    │   │   └── api.ts           # نسخة Axios مع معترضات JWT وإعادة التوجيه عند خطأ 401
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── Login.tsx       # نموذج تسجيل الدخول (react-hook-form + yup)
    │   │   │   └── Register.tsx    # نموذج التسجيل
    │   │   ├── tasks/
    │   │   │   ├── TaskCard.tsx    # عرض بطاقة المهمة
    │   │   │   ├── TaskDetails.tsx # عرض تفاصيل المهمة الموسعة
    │   │   │   ├── TaskFilters.tsx # شريط التصفية (الحالة، الأولوية، البحث)
    │   │   │   ├── TaskForm.tsx    # نافذة منبثقة لإنشاء / تعديل المهام
    │   │   │   └── TaskList.tsx    # عرض قائمة المهام
    │   │   └── common/
    │   │       ├── Navbar.tsx       # شريط التنقل العلوي مع زر تسجيل الخروج
    │   │       ├── PrivateRoute.tsx # حماية المسارات للمستخدمين الموثقين
    │   │       └── LoadingSpinner.tsx
    │   ├── pages/
    │   │   ├── DashboardPage.tsx    # الصفحة الرئيسية — المهام + التصفية + الإحصائيات
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── NotFoundPage.tsx
    │   │   └── NotAuthorizedPage.tsx
    │   ├── types/               # واجهات TypeScript المشتركة (Task, User, إلخ)
    │   └── utils/               # دوال مساعدة للواجهة الأمامية
    ├── package.json
    └── tsconfig.json
```

---

## 🔌 نقاط النهاية الرئيسية (API Endpoints)

جميع نقاط نهاية المهام تتطلب إرسال الترويسة `Authorization: Bearer <token>`.

### التوثيق — `/api/auth`

| الطريقة (Method) | المسار (Endpoint) | الوصف | يتطلب توثيق |
|---|---|---|---|
| `POST` | `/api/auth/register` | تسجيل مستخدم جديد | ❌ |
| `POST` | `/api/auth/login` | تسجيل الدخول واستلام رمز JWT | ❌ |

**بيانات إنشاء حساب (Register Body):**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "password123" }
```

**بيانات تسجيل الدخول (Login Body):**
```json
{ "email": "john@example.com", "password": "password123" }
```

### المهام — `/api/tasks`

| الطريقة (Method) | المسار (Endpoint) | الوصف | يتطلب توثيق |
|---|---|---|---|
| `GET` | `/api/tasks` | جلب جميع المهام (يدعم `?status=`، `?priority=`، `?search=`) | ✅ |
| `GET` | `/api/tasks/:id` | جلب مهمة واحدة عبر المعرف (ID) | ✅ |
| `POST` | `/api/tasks` | إنشاء مهمة جديدة | ✅ |
| `PUT` | `/api/tasks/:id` | تحديث بيانات مهمة | ✅ |
| `DELETE` | `/api/tasks/:id` | حذف مهمة | ✅ |

**بيانات المهمة (إنشاء / تعديل):**
```json
{
  "title": "Fix login bug",
  "description": "Optional description",
  "status": "To Do",
  "priority": "High",
  "dueDate": "2025-12-31"
}
```

**معاملات الاستعلام لـ `GET /api/tasks`:**

| المعامل | القيم المتاحة |
|---|---|
| `status` | `To Do`, `In Progress`, `Done` |
| `priority` | `Low`, `Medium`, `High` |
| `search` | أي نص — يطابق عنوان المهمة (غير حساس لحالة الأحرف) |

---

## ✨ المميزات المنفذة

- [x] **توثيق المستخدمين** — تسجيل حساب، تسجيل الدخول، تسجيل الخروج باستخدام JWT (صلاحية 7 أيام)
- [x] **المسارات المحمية** — يتم توجيه المستخدمين غير الموثقين تلقائيًا إلى صفحة `/login`
- [x] **انتهاء الجلسة التلقائي** — استجابات 401 تعيد التوجيه تلقائيًا وتمسح `localStorage`
- [x] **إدارة المهام (CRUD)** — إنشاء، قراءة، تعديل، وحذف المهام
- [x] **حقول المهام** — العنوان، الوصف، الحالة، الأولوية، تاريخ الاستحقاق
- [x] **تصفية المهام** — تصفية المهام بحسب الحالة والأولوية
- [x] **البحث في المهام** — بحث فوري في عناوين المهام
- [x] **إحصائيات لوحة التحكم** — ملخص بعدد المهام لكل حالة
- [x] **التحقق من صحة النماذج** — في الواجهة الأمامية (yup + react-hook-form) والخلفية (express-validator)
- [x] **إشعارات التنبيه (Toast)** — إشعارات النجاح والأخطاء عبر react-toastify
- [x] **تصميم متجاوب** — واجهة متوافقة مع الهواتف الذكية باستخدام TailwindCSS v4
- [x] **إعدادات النشر على Vercel** — إعدادات Monorepo للواجهة الأمامية والخلفية

---

## ❌ المشاكل المعروفة والميزات غير المكتملة

- [ ] **عدم وجود ترقيم للصفحات (Pagination)** — يتم جلب جميع المهام دفعة واحدة؛ قد يبطئ الأداء مع كميات البيانات الكبيرة
- [ ] **عدم وجود إسناد المهام (Task Assignment)** — المهام خاصة بالمستخدم فقط؛ لا يوجد دعم للفرق أو لتعدد المستخدمين
- [ ] **عدم دعم المرفقات** — رفع الملفات في المهام غير متاح حاليًا
- [ ] **عدم التحقق من البريد الإلكتروني** — التسجيل لا يتحقق من صحة البريد الإلكتروني عبر رسالة تفعيل
- [ ] **عدم وجود خيار استعادة كلمة المرور** — لم يتم تضمين مسار نسيت / استعادة كلمة المرور
- [ ] **عدم وجود تنبيهات بتواريخ الاستحقاق** — لا توجد تذكيرات للمواعيد النهائية القادمة
- [ ] **عدم وجود Refresh Token** — ينتهي رمز JWT بعد 7 أيام دون تجديد تلقائي صامت
- [ ] **إعدادات CORS مفتوحة** — تفعيل `app.use(cors())` يقبل كل النطاقات؛ ينصح بتقييدها في بيئة الإنتاج
- [ ] **عدم وجود Rate Limiting** — نقاط نهاية التوثيق غير محمية من هجمات التخمين (Brute Force)
- [ ] **عدم وجود اختبارات آلية (Tests)** — لم تتم كتابة اختبارات الوحدة (Unit Tests) أو التكامل (Integration Tests)

---

## 🧰 الحزمة التقنية (Tech Stack)

### الواجهة الخلفية (Backend)
- **بيئة التشغيل:** Node.js + TypeScript
- **إطار العمل:** Express.js
- **قاعدة البيانات:** MongoDB + Mongoose
- **التوثيق:** JWT (`jsonwebtoken`) + `bcryptjs`
- **التحقق:** `express-validator`

### الواجهة الأمامية (Frontend)
- **إطار العمل:** React 19 + TypeScript + Vite 8
- **التوجيه:** React Router DOM v7
- **النماذج:** React Hook Form + Yup
- **عميل HTTP:** Axios (مع interceptors)
- **التنسيق:** TailwindCSS v4
- **الإشعارات:** React Toastify

### DevOps
- **النشر:** Vercel (monorepo config)
- **اختبار الـ API:** Thunder Client

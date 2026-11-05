# museum-id-api

Backend API untuk aplikasi **museum-id** — Express + TypeScript + Drizzle ORM + PostgreSQL.

## Fitur

- **Auth JWT**: register & login (username + password, hash bcrypt)
- **CRUD Comic**: data komik pahlawan (id, title, author, imageUrl)
- **CRUD Museum**: data museum (id, name, location, imageUrl, description, showLocationIcon)
- **Profile**: lihat & ubah profil, ganti password, daftar menu profil (ProfileMenu)
- Seed data sesuai `ComicDummy`, `MuseumDummy`, dan `ProfileDummy` di aplikasi mobile

## Prasyarat

- Node.js (v20+)
- PostgreSQL (contoh: `brew install postgresql@17`)

## Cara Menjalankan

```bash
# 1. Install dependensi
npm install

# 2. Salin .env.example -> .env, sesuaikan DATABASE_URL
cp .env.example .env

# 3. Buat database (sekali saja)
createdb museum_id

# 4. Push skema + isi data seed
npm run setup

# 5. Jalankan server (dev, auto-reload)
npm run dev
```

Server berjalan di `http://localhost:3000`.

## User Hasil Seed

| username  | password     |
|-----------|--------------|
| `novanedo`| `password123`|

## Daftar Endpoint

Base URL: `http://localhost:3000/api`

### Auth
| Method | Endpoint        | Auth | Keterangan |
|--------|-----------------|------|------------|
| POST   | `/auth/register`| ➖  | Body: `username`, `password`, `name`, `avatarUrl` (opsional) |
| POST   | `/auth/login`   | ➖  | Body: `username`, `password` → `{ token, user }` |
| GET    | `/auth/me`      | 🔒  | Profil user dari token |

### Comic
| Method | Endpoint     | Auth | Keterangan |
|--------|--------------|------|------------|
| GET    | `/comics`    | ➖  | Semua comic |
| GET    | `/comics/:id`| ➖  | Detail comic |
| POST   | `/comics`    | 🔒  | Body: `title`, `author`, `imageUrl` |
| PUT    | `/comics/:id`| 🔒  | Update (field opsional, parsial) |
| DELETE | `/comics/:id`| 🔒  | Hapus |

### Museum
| Method | Endpoint      | Auth | Keterangan |
|--------|---------------|------|------------|
| GET    | `/museums`    | ➖  | Semua museum |
| GET    | `/museums/:id`| ➖  | Detail museum |
| POST   | `/museums`    | 🔒  | Body: `name`, `location`, `imageUrl`, `description`, `showLocationIcon` (opsional) |
| PUT    | `/museums/:id`| 🔒  | Update (field opsional, parsial) |
| DELETE | `/museums/:id`| 🔒  | Hapus |

### Profile
| Method | Endpoint             | Auth | Keterangan |
|--------|----------------------|------|------------|
| GET    | `/profile`           | 🔒  | `{ user: {name, username, avatarUrl}, menus: [...] }` |
| PUT    | `/profile`           | 🔒  | Update `name` dan/atau `avatarUrl` |
| PUT    | `/profile/password`  | 🔒  | Body: `oldPassword`, `newPassword` |

🔒 = sertakan header `Authorization: Bearer <token>`

## Contoh Pemakaian

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"novanedo","password":"password123"}'

# Daftar museum
curl http://localhost:3000/api/museums

# Tambah comic (pakai token dari login)
curl -X POST http://localhost:3000/api/comics \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pangeran Diponegoro","author":"penulis_baru","imageUrl":"https://...jpg"}'
```

## Format Error

```json
{ "message": "Username atau password salah" }
```

Kode status: `400` validasi, `401` auth gagal, `404` tidak ditemukan, `409` username duplikat, `500` error server.

## Skrip npm

| Skrip | Keterangan |
|-------|------------|
| `npm run dev` | Jalankan server dengan auto-reload |
| `npm run build` | Compile TypeScript ke `dist/` |
| `npm start` | Jalankan hasil build |
| `npm run db:push` | Sinkronkan skema Drizzle ke database |
| `npm run seed` | Isi data dummy |
| `npm run setup` | `db:push` + `seed` sekaligus |
| `npm run db:studio` | Buka Drizzle Studio (GUI database) |

import bcrypt from "bcryptjs";
import "dotenv/config";

import { pool } from "./index.js";
import { comics, museums, users, type NewComic, type NewMuseum } from "./schema.js";

function seededImage(seed: string, width: number, height: number) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

const comicSeed: NewComic[] = [
  { title: "Ir Soekarno", author: "heaclinn", imageUrl: seededImage("comic-soekarno", 600, 800) },
  { title: "K.H Dewantara", author: "reivgallery", imageUrl: seededImage("comic-dewantara", 600, 800) },
  { title: "RA Kartini", author: "yhkahla_", imageUrl: seededImage("comic-kartini", 600, 800) },
  { title: "Jenderal Sudirman", author: "w.arjuna227", imageUrl: seededImage("comic-sudirman", 600, 800) },
];

const museumSeed: NewMuseum[] = [
  {
    name: "Benteng Vredeburg",
    location: "Yogyakarta",
    imageUrl: seededImage("vredeburg", 1200, 700),
    showLocationIcon: false,
    description:
      "Benteng ini memiliki arsitektur kolonial Belanda abad ke-18 yang otentik, " +
      "dengan bentuk persegi, empat bastion di sudutnya, dan parit di sekelilingnya. " +
      "Bangunan utamanya pernah difungsikan sebagai pusat pengawasan pemerintah kolonial.\n\n" +
      "Terdapat museum perjuangan yang menampilkan koleksi sejarah tentang " +
      "perjuangan bangsa Indonesia, termasuk diorama, replika seragam tentara, " +
      "bendera, dan berbagai artefak lainnya.",
  },
  {
    name: "Museum Nasional",
    location: "Jakarta",
    imageUrl: seededImage("nasional", 1200, 700),
    showLocationIcon: true,
    description:
      "Museum Nasional memiliki koleksi kolonial dan etnografi Nusantara " +
      "yang sangat lengkap, dengan gedung klasik berpadu bangunan modern di pusat Jakarta.\n\n" +
      "Terdapat patung, keramik, prasasti, dan koleksi emas kerajaan yang " +
      "menampilkan kekayaan sejarah dan budaya Indonesia dari masa prasejarah hingga kini.",
  },
  {
    name: "Museum Puri Lukisan",
    location: "Bali",
    imageUrl: seededImage("purilukisan", 1200, 700),
    showLocationIcon: true,
    description:
      "Museum Puri Lukisan di Ubud menampilkan arsitektur tradisional Bali " +
      "dengan taman yang asri, menyimpan koleksi lukisan dan ukiran khas Bali.\n\n" +
      "Terdapat karya maestro seni lukis Bali dari berbagai aliran, " +
      "termasuk gaya Ubud, Batuan, dan Young Artist yang memikat para pecinta seni.",
  },
  {
    name: "Museum Angkut",
    location: "Malang",
    imageUrl: seededImage("angkut", 1200, 700),
    showLocationIcon: true,
    description:
      "Museum Angkut di Batu, Malang menghadirkan koleksi transportasi " +
      "dari berbagai era dengan zona tematik layaknya keliling dunia.\n\n" +
      "Terdapat mobil klasik, pesawat, replika jalanan Eropa dan Hollywood, " +
      "serta berbagai wahana edukatif yang cocok untuk keluarga.",
  },
];

async function seed() {
  console.log("Menjalankan seed museum-id-api...");

  // Comic
  const comicCount = await pool.query("select count(*)::int as n from comics");
  if (comicCount.rows[0].n === 0) {
    await pool.query("insert into comics (title, author, image_url) values ($1, $2, $3), ($4, $5, $6), ($7, $8, $9), ($10, $11, $12)", comicSeed.flatMap((c) => [c.title, c.author, c.imageUrl]));
    console.log(`  comics: ${comicSeed.length} baris dimasukkan`);
  } else {
    console.log("  comics: sudah ada data, dilewati");
  }

  // Museum
  const museumCount = await pool.query("select count(*)::int as n from museums");
  if (museumCount.rows[0].n === 0) {
    await pool.query(
      "insert into museums (name, location, image_url, description, show_location_icon) values ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10), ($11, $12, $13, $14, $15), ($16, $17, $18, $19, $20)",
      museumSeed.flatMap((m) => [m.name, m.location, m.imageUrl, m.description, m.showLocationIcon])
    );
    console.log(`  museums: ${museumSeed.length} baris dimasukkan`);
  } else {
    console.log("  museums: sudah ada data, dilewati");
  }

  // User (dari ProfileDummy — Novan Edo)
  const userCount = await pool.query("select count(*)::int as n from users");
  if (userCount.rows[0].n === 0) {
    await pool.query("insert into users (username, password, name, avatar_url) values ($1, $2, $3, $4)", [
      "novanedo",
      await bcrypt.hash("password123", 10),
      "Novan Edo",
      seededImage("novanedo", 600, 600),
    ]);
    console.log("  users: 1 baris dimasukkan (novanedo / password123)");
  } else {
    console.log("  users: sudah ada data, dilewati");
  }

  console.log("Selesai seed ✅");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

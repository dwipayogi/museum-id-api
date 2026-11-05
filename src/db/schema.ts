import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  avatarUrl: text("avatar_url").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const comics = pgTable("comics", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  author: varchar("author", { length: 128 }).notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const museums = pgTable("museums", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  location: varchar("location", { length: 128 }).notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  showLocationIcon: boolean("show_location_icon").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Comic = typeof comics.$inferSelect;
export type NewComic = typeof comics.$inferInsert;
export type Museum = typeof museums.$inferSelect;
export type NewMuseum = typeof museums.$inferInsert;

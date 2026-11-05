import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  avatarUrl: text("avatar_url").notNull().default(""),
  role: varchar("role", { length: 16 }).notNull().default("user"),
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

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemType: varchar("item_type", { length: 16 }).notNull(), // "comic" | "museum"
    itemId: uuid("item_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("favorites_user_item_unique").on(
      table.userId,
      table.itemType,
      table.itemId
    ),
  ]
);

export type User = typeof users.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
export type NewUser = typeof users.$inferInsert;
export type Comic = typeof comics.$inferSelect;
export type NewComic = typeof comics.$inferInsert;
export type Museum = typeof museums.$inferSelect;
export type NewMuseum = typeof museums.$inferInsert;

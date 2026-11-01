-- CreateTable
CREATE TABLE "trip_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trip_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_template_items" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "perDay" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,

    CONSTRAINT "trip_template_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trip_templates_userId_idx" ON "trip_templates"("userId");

-- CreateIndex
CREATE INDEX "trip_template_items_templateId_idx" ON "trip_template_items"("templateId");

-- CreateIndex
CREATE INDEX "trip_template_items_categoryId_idx" ON "trip_template_items"("categoryId");

-- AddForeignKey
ALTER TABLE "trip_templates" ADD CONSTRAINT "trip_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_template_items" ADD CONSTRAINT "trip_template_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "trip_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_template_items" ADD CONSTRAINT "trip_template_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "item_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Backfill: every existing user gets the default templates (same content as
-- lib/templates/defaults.ts, which new accounts receive at signup).

-- 1. Categories used by the default templates, created only when missing.
INSERT INTO "item_categories" ("id", "userId", "name", "color", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, u."id", c."name", '#3B82F6', NOW(), NOW()
FROM "users" u
CROSS JOIN (VALUES
  ('Clothing'),
  ('Footwear'),
  ('Toiletries'),
  ('Accessories'),
  ('Electronics'),
  ('Documents'),
  ('Gear')
) AS c("name")
WHERE NOT EXISTS (
  SELECT 1 FROM "item_categories" ic WHERE ic."userId" = u."id" AND ic."name" = c."name"
);

-- 2. Templates and their items (template names are unique within the defaults).
WITH new_templates AS (
  INSERT INTO "trip_templates" ("id", "userId", "name", "emoji", "createdAt", "updatedAt")
  SELECT gen_random_uuid()::text, u."id", d."name", d."emoji", NOW(), NOW()
  FROM "users" u
  CROSS JOIN (VALUES
    ('Plage', '🏖️'),
    ('Ville', '🏙️'),
    ('Affaires', '💼'),
    ('Ski', '🎿'),
    ('Randonnée', '🥾'),
    ('Autre', '📦')
  ) AS d("name", "emoji")
  RETURNING "id", "userId", "name"
)
INSERT INTO "trip_template_items" ("id", "templateId", "categoryId", "name", "quantity", "perDay", "position")
SELECT gen_random_uuid()::text, t."id", cat."id", i."name", i."quantity", i."perDay", i."position"
FROM new_templates t
JOIN (VALUES
  ('Plage', 'T-shirt', 'Clothing', 1, true, 0),
  ('Plage', 'Short', 'Clothing', 1, true, 1),
  ('Plage', 'Sous-vêtements', 'Clothing', 1, true, 2),
  ('Plage', 'Maillot de bain', 'Clothing', 2, false, 3),
  ('Plage', 'Tongs', 'Footwear', 1, false, 4),
  ('Plage', 'Crème solaire', 'Toiletries', 1, false, 5),
  ('Plage', 'Lunettes de soleil', 'Accessories', 1, false, 6),
  ('Plage', 'Chapeau', 'Accessories', 1, false, 7),
  ('Plage', 'Serviette de plage', 'Accessories', 1, false, 8),
  ('Plage', 'Chargeur téléphone', 'Electronics', 1, false, 9),
  ('Plage', 'Brosse à dents', 'Toiletries', 1, false, 10),
  ('Plage', 'Passeport', 'Documents', 1, false, 11),
  ('Ville', 'T-shirt', 'Clothing', 1, true, 0),
  ('Ville', 'Sous-vêtements', 'Clothing', 1, true, 1),
  ('Ville', 'Chaussettes', 'Clothing', 1, true, 2),
  ('Ville', 'Jean', 'Clothing', 2, false, 3),
  ('Ville', 'Veste', 'Clothing', 1, false, 4),
  ('Ville', 'Pyjama', 'Clothing', 1, false, 5),
  ('Ville', 'Baluchon vêtement sale', 'Clothing', 1, false, 6),
  ('Ville', 'Brosse à dents', 'Toiletries', 1, false, 7),
  ('Ville', 'Coupe-ongles', 'Toiletries', 1, false, 8),
  ('Ville', 'Goutière', 'Toiletries', 1, false, 9),
  ('Ville', 'Chargeur téléphone', 'Electronics', 1, false, 10),
  ('Ville', 'Appareil photo', 'Electronics', 1, false, 11),
  ('Ville', 'Ordinateur', 'Electronics', 1, false, 12),
  ('Ville', 'Switch', 'Electronics', 1, false, 13),
  ('Affaires', 'Chemise', 'Clothing', 1, true, 0),
  ('Affaires', 'Sous-vêtements', 'Clothing', 1, true, 1),
  ('Affaires', 'Chaussettes', 'Clothing', 1, true, 2),
  ('Affaires', 'Veste de costume', 'Clothing', 1, false, 3),
  ('Affaires', 'Pantalon de costume', 'Clothing', 2, false, 4),
  ('Affaires', 'Cravate', 'Accessories', 2, false, 5),
  ('Affaires', 'Chaussures de ville', 'Footwear', 1, false, 6),
  ('Affaires', 'Ordinateur portable', 'Electronics', 1, false, 7),
  ('Affaires', 'Chargeur PC', 'Electronics', 1, false, 8),
  ('Affaires', 'Chargeur téléphone', 'Electronics', 1, false, 9),
  ('Affaires', 'Cartes de visite', 'Documents', 1, false, 10),
  ('Affaires', 'Passeport', 'Documents', 1, false, 11),
  ('Ski', 'T-shirt', 'Clothing', 1, true, 0),
  ('Ski', 'Chaussettes de ski', 'Clothing', 1, true, 1),
  ('Ski', 'Sous-vêtements', 'Clothing', 1, true, 2),
  ('Ski', 'Veste de ski', 'Clothing', 1, false, 3),
  ('Ski', 'Pantalon de ski', 'Clothing', 1, false, 4),
  ('Ski', 'Sous-couche thermique', 'Clothing', 2, false, 5),
  ('Ski', 'Gants de ski', 'Accessories', 1, false, 6),
  ('Ski', 'Lunettes de ski', 'Accessories', 1, false, 7),
  ('Ski', 'Crème solaire', 'Toiletries', 1, false, 8),
  ('Ski', 'Baume à lèvres', 'Toiletries', 1, false, 9),
  ('Ski', 'Chargeur téléphone', 'Electronics', 1, false, 10),
  ('Randonnée', 'T-shirt', 'Clothing', 1, true, 0),
  ('Randonnée', 'Chaussettes de randonnée', 'Clothing', 1, true, 1),
  ('Randonnée', 'Sous-vêtements', 'Clothing', 1, true, 2),
  ('Randonnée', 'Pantalon de randonnée', 'Clothing', 2, false, 3),
  ('Randonnée', 'Veste de pluie', 'Clothing', 1, false, 4),
  ('Randonnée', 'Chaussures de randonnée', 'Footwear', 1, false, 5),
  ('Randonnée', 'Gourde', 'Gear', 1, false, 6),
  ('Randonnée', 'Sac à dos', 'Gear', 1, false, 7),
  ('Randonnée', 'Trousse de premiers secours', 'Gear', 1, false, 8),
  ('Randonnée', 'Lampe frontale', 'Gear', 1, false, 9),
  ('Randonnée', 'Crème solaire', 'Toiletries', 1, false, 10),
  ('Randonnée', 'Chargeur téléphone', 'Electronics', 1, false, 11),
  ('Autre', 'T-shirt', 'Clothing', 1, true, 0),
  ('Autre', 'Sous-vêtements', 'Clothing', 1, true, 1),
  ('Autre', 'Chaussettes', 'Clothing', 1, true, 2),
  ('Autre', 'Chargeur téléphone', 'Electronics', 1, false, 3),
  ('Autre', 'Brosse à dents', 'Toiletries', 1, false, 4),
  ('Autre', 'Ordinateur', 'Electronics', 1, false, 5),
  ('Autre', 'Chargeur PC', 'Electronics', 1, false, 6),
  ('Autre', 'Appareil photo', 'Electronics', 1, false, 7),
  ('Autre', 'Écouteurs', 'Electronics', 1, false, 8),
  ('Autre', 'Gourde', 'Gear', 1, false, 9),
  ('Autre', 'Veste', 'Clothing', 1, false, 10),
  ('Autre', 'Pull', 'Clothing', 1, false, 11),
  ('Autre', 'Pantalon', 'Clothing', 1, false, 12),
  ('Autre', 'Passeport', 'Documents', 1, false, 13),
  ('Autre', 'Billets', 'Documents', 1, false, 14),
  ('Autre', 'Déodorant', 'Toiletries', 1, false, 15),
  ('Autre', 'Coupe-ongles', 'Toiletries', 1, false, 16),
  ('Autre', 'Goutière', 'Toiletries', 1, false, 17),
  ('Autre', 'Pyjama', 'Clothing', 1, false, 18),
  ('Autre', 'Baluchon vêtement sale', 'Clothing', 1, false, 19),
  ('Autre', 'Serviette', 'Accessories', 1, false, 20),
  ('Autre', 'Switch', 'Electronics', 1, false, 21),
  ('Autre', 'Chaussures de randonnée', 'Footwear', 1, false, 22),
  ('Autre', 'Livre', 'Accessories', 1, false, 23),
  ('Autre', 'Vêtements de sport', 'Clothing', 1, false, 24)
) AS i("templateName", "name", "category", "quantity", "perDay", "position") ON i."templateName" = t."name"
LEFT JOIN LATERAL (
  SELECT ic."id" FROM "item_categories" ic
  WHERE ic."userId" = t."userId" AND ic."name" = i."category"
  ORDER BY ic."createdAt"
  LIMIT 1
) cat ON TRUE;


-- Trip types and global presets are replaced by the templates above.
-- AlterTable
ALTER TABLE "trips" DROP COLUMN "tripType";

-- DropTable
DROP TABLE "trip_presets";

-- DropEnum
DROP TYPE "TripType";


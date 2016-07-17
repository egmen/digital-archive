WITH allusers AS (
	SELECT "Login"
	FROM users
		UNION ALL
	SELECT "Name"
	FROM groups
), rankusers AS(
	-- Чтобы каждому элементу соответсвовало одно натуральное число
	SELECT "Login", rank() OVER (ORDER BY "Login" DESC) n
	FROM allusers
), randomperm AS(
	SELECT "Id",
		-- Выбрать случайных пользователей по их номеру
		CAST(random() * 1000 AS int) % (SELECT COUNT(*) + 1 FROM rankusers) AS usr,
		-- Выбрать случайное разрешение путём random из максимального
		CAST(random() * (SELECT SUM("Id") + 1 FROM "permissionTypes") AS int) AS prm
	FROM folders
		UNION ALL
	SELECT "Id",
		CAST(random() * 1000 AS int) % (SELECT COUNT(*) + 1 FROM rankusers),
		CAST(random() * (SELECT SUM("Id") + 1 FROM "permissionTypes") AS int)
	FROM files
)
INSERT INTO "permissions" ("Id", "Name", "Permission")
SELECT p."Id", u."Login", p.prm
FROM randomperm p
JOIN rankusers u ON u.n = p.usr
;

-- Дедупликация значений таблицы "permissions"
CREATE TEMP TABLE IF NOT EXISTS "tab1"(
   LIKE "permissions"
);
DELETE FROM "tab1"
;
INSERT INTO "tab1"
SELECT "Id", "Name", bit_or("Permission") "Permission"
FROM "permissions"
GROUP BY "Id", "Name"
;
DELETE FROM "permissions"
;
INSERT INTO "permissions"
SELECT *
FROM "tab1"
;
REFRESH MATERIALIZED VIEW "namedPermissions"
;
SELECT COUNT(*) cnt
FROM "permissions"
;
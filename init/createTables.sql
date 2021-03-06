CREATE TABLE "folders" (
  "Id" uuid PRIMARY KEY,
  "ParentId" uuid REFERENCES "folders" ("Id") ON DELETE CASCADE,
  "Name" character varying(255),
  "FolderPath" character varying(1024)
);

CREATE TABLE "files" (
  "Id" uuid PRIMARY KEY,
  "FolderId" uuid NOT NULL REFERENCES "folders" ("Id") ON DELETE CASCADE,
  "Name" character varying(255),
  "Type" character varying(255),
  "Size" bigint,
  "Ctime" timestamp
);

-- Создание таблицы с типами разрешений
CREATE SEQUENCE "bittypes" MINVALUE 0
;
CREATE TABLE "permissionTypes" (
  "Id" int PRIMARY KEY DEFAULT 2 ^ nextval('bittypes'),
  "Name" character varying(50),
  "VarName" character varying(50),
  "BitId" varbit DEFAULT CAST(2 ^ currval('bittypes') AS int)::bit(16),
  "n" int DEFAULT currval('bittypes')
);

INSERT INTO "permissionTypes" ("Name", "VarName")
VALUES ('Чтение', 'P_READ')
,('Создание', 'P_CREATE')
,('Переименование', 'P_RENAME')
,('Копирование', 'P_COPY')
,('Перемещение', 'P_MOVE')
,('Удаление', 'P_DELETE')
;

CREATE TABLE "users" (
  "Login" character varying(50) PRIMARY KEY,
  "Name" character varying(255)
);

-- Логины юзеров с маленькой буквы
INSERT INTO "users" ("Login", "Name")
VALUES ('admin', 'Админ')
,('petr', 'Петя')
,('lena', 'Лена')
,('nick', 'Джон')
;

CREATE TABLE "groups" (
  "Name" character varying(50) PRIMARY KEY
);

-- Наименования групп с заглавной буквы
INSERT INTO "groups" ("Name")
VALUES ('All')
,('Admins')
,('Users')
,('Other')
;

CREATE TABLE "userGroups" (
  "Login" character varying(50) REFERENCES "users" ("Login") ON DELETE CASCADE,
  "Name" character varying(50) REFERENCES "groups" ("Name") ON DELETE CASCADE
);
INSERT INTO "userGroups"
VALUES ('admin', 'Admins')
,('petr', 'Users')
,('lena', 'Other')
;

CREATE TABLE "permissions" (
  "Id" uuid, -- Id файла или папка
  "Name" character varying(50), -- Логин пользователя либо имя группы
  "Permission" int -- Сумма разрешений
);

-- Рекурсивное построение зависимостей по группам и юзерам
-- цепочки наследования по каждому с отметкой о том, заданное разрешение или наследованное
-- простая вьюшка на 200+ тысяч значений строилась больше секунды
CREATE MATERIALIZED VIEW "namedPermissions"
AS
WITH RECURSIVE allnames AS(
	SELECT "Name"
	FROM "groups"
		UNION ALL
	SELECT "Login"
	FROM "users"
),perm AS(
  SELECT f."Id", f."ParentId", coalesce("Permission", 0) "Permission", an."Name",
    CASE WHEN p."Permission" IS NULL THEN false ELSE true END AS "isOwn"
  FROM folders f
  CROSS JOIN allnames an
  LEFT JOIN permissions p ON p."Id" = f."Id" AND p."Name" = an."Name"
  WHERE 1 = 1
    AND "ParentId" IS NULL
    UNION ALL
  SELECT f."Id",
    f."ParentId",
    coalesce(p."Permission", fl."Permission") AS "Permission",
    coalesce(p."Name", fl."Name"),
    CASE WHEN p."Permission" IS NULL THEN false ELSE true END AS "isOwn"
  FROM perm fl
  JOIN folders f ON f."ParentId" = fl."Id"
  LEFT JOIN permissions p ON p."Id" = f."Id" AND p."Name" = fl."Name"
  WHERE 1 = 1
)
SELECT "Id", "Permission", "Name", "isOwn"
FROM perm
;

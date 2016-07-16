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

INSERT INTO "users" ("Login", "Name")
VALUES ('admin', 'Админ')
,('petr', 'Петя')
,('lena', 'Лена')
,('nick', 'Джон')
;

CREATE TABLE "groups" (
  "Name" character varying(50) PRIMARY KEY
);

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
,('lena', 'Others')
;

CREATE TABLE "permissions" (
  "Id" uuid, -- Id файла или папка
  "Name" character varying(50), -- Логин пользователя либо имя группы
  "Permission" int -- Сумма разрешений
);

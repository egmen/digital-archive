CREATE TABLE folders (
  Id uuid PRIMARY KEY,
  ParentId uuid REFERENCES folders (Id),
  Name character varying(255)
);

CREATE TABLE files (
  Id uuid PRIMARY KEY,
  FolderId uuid NOT NULL REFERENCES folders (Id) ON DELETE CASCADE,
  Name character varying(255),
  Type character varying(255),
  Size integer,
  FilePath character varying(1024)
);

-- Создание таблицы с типами разрешений
CREATE SEQUENCE bittypes MINVALUE 0
;
CREATE TABLE "permissionTypes" (
  Id int PRIMARY KEY DEFAULT 2 ^ nextval('bittypes'),
  Name character varying(50),
  VarName character varying(50),
  BitId varbit DEFAULT CAST(2 ^ currval('bittypes') AS int)::bit(16),
  n int DEFAULT currval('bittypes')
);

INSERT INTO "permissionTypes" (Name, VarName)
VALUES ('Чтение', 'P_READ')
,('Создание', 'P_CREATE')
,('Переименование', 'P_RENAME')
,('Копирование', 'P_COPY')
,('Перемещение', 'P_MOVE')
,('Удаление', 'P_DELETE')
;

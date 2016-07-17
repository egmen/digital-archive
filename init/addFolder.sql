-- Добавление одной директории
INSERT INTO "folders" ("Id", "ParentId", "Name", "FolderPath")
SELECT 
	CAST($1 AS uuid) AS "Id",
	CAST($2 AS uuid) AS "ParentId",
	CAST($3 AS character varying(255)) AS "Name",
	CAST($4 AS character varying(1024)) AS "FolderPath"
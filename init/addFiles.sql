INSERT INTO "files" (
	"Id",
	"FolderId",
	"Name",
	"Type",
	"Ctime",
	"Size")
SELECT
	"Id",
	CAST($2 AS uuid) AS "FolderId",
	"Name",
	"Type",
	"Ctime",
	"Size"
FROM json_to_recordset($1) AS x
	(
		"Id" uuid,
		"Name" character varying(255),
		"Type" character varying(255),
		"Ctime" timestamp,
		"Size" bigint
	);

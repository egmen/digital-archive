WITH childs AS(
	SELECT "ParentId", json_agg("Id") AS "Childs"
	FROM folders
	GROUP BY "ParentId"
)
SELECT f."Id", f."ParentId", f."Name", c."Childs"
FROM folders f
LEFT JOIN childs c ON c."ParentId" = f."Id"
;
WITH allnames AS(
	SELECT "Name"
	FROM "groups"
		UNION ALL
	SELECT "Login"
	FROM "users"
)
SELECT a."Name", p."Id", coalesce(p."Permission", 0) "Permission", p."isOwn"
FROM allnames a
LEFT JOIN "namedPermissions" p ON p."Name" = a."Name" AND "Id" = $1
ORDER BY CASE WHEN a."Name" = 'All' THEN 0 ELSE 1 END, ascii(a."Name"), a."Name"
;
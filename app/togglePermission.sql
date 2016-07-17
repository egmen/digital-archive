UPDATE "permissions"
SET "Permission" = "Permission" # $2
WHERE 1 = 1
	AND "Id" = $1
	AND "Name" = $3
RETURNING *
;
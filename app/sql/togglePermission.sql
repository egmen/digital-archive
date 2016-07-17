-- Переключение разрешения путём XOR к текущему разрешению
UPDATE "permissions"
SET "Permission" = coalesce("Permission", 0) # $2
WHERE 1 = 1
	AND "Id" = $1
	AND "Name" = $3
RETURNING *
;
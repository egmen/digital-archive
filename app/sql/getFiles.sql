-- Просто список файлов, без каких-либо проверок
SELECT *
FROM files
WHERE 1 = 1
  AND "FolderId" = $1
ORDER BY "Name"
;
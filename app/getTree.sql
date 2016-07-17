WITH RECURSIVE usergroups AS(
	SELECT "Name", "Login"
	FROM "userGroups" u
	WHERE u."Login" = $1
		UNION ALL
	SELECT 'All', $1
), pgroup AS(
	-- Групповые наследования и наследования для всех имеют одинаковый приоритет, поэтому объединены
	-- рассматриваются только явно заданные разрешения
	SELECT p."Id", u."Login", bit_or(p."Permission") AS "Permission", true "isOwn", string_agg(p."Name", ',') AS "permName"
	FROM "namedPermissions" p
	JOIN usergroups u ON u."Name" = p."Name"
	WHERE p."isOwn" = true
	GROUP BY p."Id", u."Login"
),perm AS(
	-- Приоритет имеет юзерское разрешение заданное для конкретного элемента
	-- далее групповое разрешение заданное для элемента
	-- иначе применяется разрешение вышестоящего элемента
	SELECT
		f."Id",
		f."ParentId",
		f."Name",
		CASE
			WHEN puser."isOwn" = true THEN puser."Permission"
			WHEN pgroup."isOwn" = true THEN pgroup."Permission"
			ELSE 0
		END "Permission",
		CASE
			WHEN puser."isOwn" = true THEN 'user'
			WHEN pgroup."isOwn" = true THEN pgroup."permName"
			ELSE ''
		END "permName"
	FROM folders f
	LEFT JOIN pgroup ON pgroup."Id" = f."Id"
	LEFT JOIN "namedPermissions" puser ON puser."Id" = f."Id" AND puser."Name" = $1
	WHERE 1 = 1
		AND f."ParentId" IS NULL
		UNION ALL
	SELECT
		f."Id",
		f."ParentId",
		f."Name",
		CASE
			WHEN puser."isOwn" = true THEN puser."Permission"
			WHEN pgroup."isOwn" = true THEN pgroup."Permission"
			ELSE p."Permission"
		END "Permission",
		CASE
			WHEN puser."isOwn" = true THEN 'user'
			WHEN pgroup."isOwn" = true THEN pgroup."permName"
			ELSE p."permName"
		END "permName"
	FROM perm p
	JOIN folders f ON f."ParentId" = p."Id"
	LEFT JOIN pgroup ON pgroup."Id" = f."Id"
	LEFT JOIN "namedPermissions" puser ON puser."Id" = f."Id" AND puser."Name" = $1
	WHERE 1 = 1
),childs AS(
	SELECT f."ParentId", json_agg(f."Id") AS "Childs"
	FROM folders f
	JOIN perm p ON p."Id" = f."Id"
	WHERE 1 = 1
		AND p."Permission" & 1 > 0 -- Базовое разрешение на чтение папки
	GROUP BY f."ParentId"
)
SELECT
	f."Id",
	f."ParentId",
	f."Name",
	f."Permission",
	c."Childs",
	f."permName"
FROM perm f
LEFT JOIN childs c ON c."ParentId" = f."Id"
WHERE 1 = 1
	AND f."Permission" & 1 > 0 -- Базовое разрешение на чтение папки
ORDER BY f."Name"
;

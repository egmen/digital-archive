-- Добавление разрешения (не смог всё сделать одним запросом, т.к. UPSERT появился только в 9.5)
INSERT INTO "permissions" ("Id", "Name", "Permission")
VALUES ($1, $3, $2)
;
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
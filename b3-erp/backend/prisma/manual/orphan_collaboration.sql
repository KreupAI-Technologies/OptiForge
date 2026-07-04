-- Additive-only tables for collaboration orphan pages (files, folders,
-- channels, messages). Safe to run repeatedly. Never drops or alters existing
-- tables. Column names are quoted to match the TypeORM entity property names
-- (camelCase), which is how the collaboration service reads these tables.
-- NOTE: this file is NOT run automatically — apply manually when ready.

-- ---------------------------------------------------------------------------
-- Folders — backing table for collaboration/files page (folder cards).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "collab_folders" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "parentId" varchar(100),
  "itemCount" integer NOT NULL DEFAULT 0,
  "sizeBytes" bigint NOT NULL DEFAULT 0,
  "owner" varchar(200),
  "meta" jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_collab_folders" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_collab_folders_companyId" ON "collab_folders" ("companyId");

-- ---------------------------------------------------------------------------
-- Files — backing table for collaboration/files page (file cards / list).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "collab_files" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "name" varchar(255) NOT NULL,
  "folderId" varchar(100),
  "fileType" varchar(50) NOT NULL DEFAULT 'file',
  "sizeBytes" bigint NOT NULL DEFAULT 0,
  "owner" varchar(200),
  "isStarred" boolean NOT NULL DEFAULT false,
  "isShared" boolean NOT NULL DEFAULT false,
  "meta" jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_collab_files" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_collab_files_companyId" ON "collab_files" ("companyId");

-- ---------------------------------------------------------------------------
-- Channels — backing table for collaboration/messaging page (chat sidebar).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "collab_channels" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "name" varchar(200) NOT NULL,
  "channelType" varchar(50) NOT NULL DEFAULT 'channel',
  "lastMessage" varchar(500),
  "lastMessageAt" timestamptz,
  "unreadCount" integer NOT NULL DEFAULT 0,
  "memberCount" integer NOT NULL DEFAULT 0,
  "status" varchar(50),
  "meta" jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_collab_channels" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_collab_channels_companyId" ON "collab_channels" ("companyId");

-- ---------------------------------------------------------------------------
-- Messages — backing table for collaboration/messaging page (message thread).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "collab_messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId" varchar(100) NOT NULL,
  "channelId" varchar(100) NOT NULL,
  "senderName" varchar(200),
  "senderId" varchar(100),
  "content" text NOT NULL,
  "messageType" varchar(50) NOT NULL DEFAULT 'text',
  "status" varchar(50),
  "sentAt" timestamptz,
  "meta" jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "PK_collab_messages" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "IDX_collab_messages_companyId" ON "collab_messages" ("companyId");
CREATE INDEX IF NOT EXISTS "IDX_collab_messages_channelId" ON "collab_messages" ("channelId");

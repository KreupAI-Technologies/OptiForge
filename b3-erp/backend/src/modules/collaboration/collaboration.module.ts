import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollabFolder } from './entities/collab-folder.entity';
import { CollabFile } from './entities/collab-file.entity';
import { CollabChannel } from './entities/collab-channel.entity';
import { CollabMessage } from './entities/collab-message.entity';

import { CollabFilesController } from './controllers/collab-files.controller';
import { CollabFoldersController } from './controllers/collab-folders.controller';
import { CollabChannelsController } from './controllers/collab-channels.controller';
import { CollabMessagesController } from './controllers/collab-messages.controller';

import { CollaborationService } from './services/collaboration.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollabFolder,
      CollabFile,
      CollabChannel,
      CollabMessage,
    ]),
  ],
  controllers: [
    CollabFilesController,
    CollabFoldersController,
    CollabChannelsController,
    CollabMessagesController,
  ],
  providers: [CollaborationService],
  exports: [CollaborationService],
})
export class CollaborationModule {}

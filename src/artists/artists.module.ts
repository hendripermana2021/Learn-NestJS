import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistsController } from './artists.controller';
import { ArtistsService } from './artists.service';
import { Artist } from './artist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Artist])],
  providers: [ArtistsService],
  exports: [ArtistsService],
  controllers: [ArtistsController], // make it available for other modules to use.  // TODO: How does this work? Does it create an instance of the service for each module that imports this module?  // TODO: Is there a way to make it create an instance of the service only once, regardless of how many modules import it?  // TODO: Can we use the service in a controller?  // TODO: How does this work
})
export class ArtistsModule {}

import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  HttpStatus,
  Param,
  ParseIntPipe,
  Body,
  Scope,
  DefaultValuePipe,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDTO } from './dto/create-songs-dto';
// import { Connection } from 'src/common/constant/connection';
import { Song } from './song.entity';
import { DeleteResult } from 'typeorm';
import { UpdateSongDto } from './dto/update-songs-dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ArtistJwtGuard } from 'src/artists/artists.guard';
// import { request } from 'express';

@Controller({
  path: 'songs',
  scope: Scope.REQUEST,
})
export class SongsController {
  constructor(
    private songService: SongsService,
    // @Inject('CONNECTION')
    // private connection: Connection,
  ) {
    // console.log(`THIS CONNECTION STRING ${this.connection.CONNECTION_STRING}`);
  }

  @Post()
  @UseGuards(ArtistJwtGuard)
  create(
    @Body() createSongDTO: CreateSongDTO,
    @Request()
    request,
  ): Promise<Song> {
    console.log('request.user: ', request.user);
    return this.songService.create(createSongDTO);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number = 10,
  ): Promise<Pagination<Song>> {
    limit = limit > 100 ? 100 : limit;
    return this.songService.paginate({
      page,
      limit,
    });
  }

  // async findAll(): Promise<Song[]> {
  //   try {
  //     return this.songService.findAll();
  //   } catch (e) {
  //     console.log('I am in the catching block', e);
  //     throw new HttpException(
  //       'server Error',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       {
  //         cause: e,
  //       },
  //     );
  //   }
  // }
  @Get(':id')
  findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ): Promise<Song> {
    return this.songService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSongDto: UpdateSongDto,
  ) {
    return this.songService.update(id, updateSongDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return this.songService.remove(id);
  }
}

import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PollsService } from './polls.service';
import { CreatePollDto } from './dto/create-poll.dto';
import { VoteDto } from './dto/vote.dto';

@Controller('polls')
export class PollsController {
    constructor(private readonly pollsService: PollsService) { }

    @Get()
    findAll() {
        return this.pollsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.pollsService.findOne(id);
    }

    @Post()
    create(@Body() createPollDto: CreatePollDto) {
        return this.pollsService.create(createPollDto);
    }

    @Post(':id/vote')
    vote(@Param('id') id: string, @Body() voteDto: VoteDto) {
        return this.pollsService.vote(id, voteDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.pollsService.remove(id);
    }
}

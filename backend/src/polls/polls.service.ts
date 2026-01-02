import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './entities/poll.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { VoteDto } from './dto/vote.dto';

@Injectable()
export class PollsService {
    constructor(
        @InjectRepository(Poll)
        private pollsRepository: Repository<Poll>,
    ) { }

    async findAll(): Promise<Poll[]> {
        return this.pollsRepository.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: string): Promise<Poll> {
        const poll = await this.pollsRepository.findOneBy({ id });
        if (!poll) throw new NotFoundException('Poll not found');
        return poll;
    }

    async create(createPollDto: CreatePollDto): Promise<Poll> {
        const poll = this.pollsRepository.create({
            id: `poll-${Date.now()}`,
            ...createPollDto,
            status: 'published',
            visitors: 0,
            totalVotes: 0,
            clients: [],
        });
        return this.pollsRepository.save(poll);
    }

    async vote(id: string, voteDto: VoteDto): Promise<Poll> {
        const poll = await this.findOne(id);
        const { answers, voterInfo } = voteDto;

        // Update votes in JSONB
        poll.questions.forEach((q) => {
            const answerId = answers[q.id];
            if (answerId) {
                const option = q.options.find((o: any) => o.id === answerId);
                if (option) {
                    option.votes = (option.votes || 0) + 1;
                }
            }
        });

        poll.totalVotes += 1;
        if (!poll.clients) poll.clients = [];
        poll.clients.push({
            ...voterInfo,
            time: new Date().toISOString(),
        });

        return this.pollsRepository.save(poll);
    }

    async remove(id: string): Promise<void> {
        const result = await this.pollsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Poll not found');
        }
    }
}

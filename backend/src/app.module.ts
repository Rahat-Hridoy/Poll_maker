import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PollsModule } from './polls/polls.module';
import { Poll } from './polls/entities/poll.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      entities: [Poll],
      synchronize: true,
      ssl: process.env.DATABASE_URL || process.env.POSTGRES_URL ? { rejectUnauthorized: false } : false,
    }),
    PollsModule,
  ],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { StartController } from './start.controller';

@Module({
  controllers: [StartController],
})
export class StartModule {} 
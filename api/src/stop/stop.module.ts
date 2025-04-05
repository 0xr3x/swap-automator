import { Module } from '@nestjs/common';
import { StopController } from './stop.controller';

@Module({
  controllers: [StopController],
})
export class StopModule {} 
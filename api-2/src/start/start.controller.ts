import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Start')
@Controller('start')
export class StartController {
  @Post()
  @ApiOperation({ summary: 'Start the system' })
  @ApiResponse({ 
    status: 200, 
    description: 'System started successfully',
    schema: {
      type: 'string',
      example: 'started'
    }
  })
  start(): string {
    return 'started';
  }
} 
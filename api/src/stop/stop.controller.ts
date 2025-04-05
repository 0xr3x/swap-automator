import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Stop')
@Controller('stop')
export class StopController {
  @Post()
  @ApiOperation({ summary: 'Stop the system' })
  @ApiResponse({ 
    status: 200, 
    description: 'System stopped successfully',
    schema: {
      type: 'string',
      example: 'stopped'
    }
  })
  stop(): string {
    return 'stopped';
  }
} 
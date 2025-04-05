import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StopService } from './stop.service';

@ApiTags('Stop')
@Controller('stop')
export class StopController {
  constructor(private readonly stopService: StopService) {}

  @Post()
  @ApiOperation({ summary: 'Stop the system' })
  @ApiResponse({ 
    status: 200, 
    description: 'System stopped successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'stopped'
        }
      }
    }
  })
  async stop(): Promise<{ status: string }> {
    return this.stopService.stop();
  }
} 
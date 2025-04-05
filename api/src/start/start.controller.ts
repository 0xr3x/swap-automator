import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StartService } from './start.service';

@ApiTags('Start')
@Controller('start')
export class StartController {
  constructor(private readonly startService: StartService) {}

  @Post()
  @ApiOperation({ summary: 'Start the system' })
  @ApiResponse({ 
    status: 200, 
    description: 'System started successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'started'
        },
        weatherData: {
          type: 'object',
          properties: {
            tokenId: { type: 'string' },
            gradeTA: { type: 'string' },
            signalDate: { type: 'string' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  })
  async start(): Promise<{ status: string; weatherData?: any }> {
    return this.startService.start();
  }
} 
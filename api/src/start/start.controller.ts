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
          example: 'started - monitoring trading conditions every 5 minutes'
        },
        tradeDetails: {
          type: 'string',
          example: 'No trade needed at this time - doing alright!'
        },
        transactionHash: {
          type: 'string',
          example: '0x123...abc',
          nullable: true
        },
        requestId: {
          type: 'string',
          example: '0x456...def',
          nullable: true
        }
      }
    }
  })
  async start(): Promise<{ 
    status: string;
    tradeDetails: string;
    transactionHash?: string;
    requestId?: string;
  }> {
    return this.startService.start();
  }
} 
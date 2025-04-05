import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('PnL')
@Controller('PnL')
export class PnLController {
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
  getPnl(): string {
    return 'started';
  }
} 
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('PnL')
@Controller('pnl')
export class PnlController {
  @Get()
  @ApiOperation({ summary: 'Get current PnL value' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the current PnL value',
    schema: {
      type: 'number',
      example: 123.45
    }
  })
  getPnl(): number {
    // This is a mock implementation - replace with your actual PnL calculation
    return 123.45;
  }
} 
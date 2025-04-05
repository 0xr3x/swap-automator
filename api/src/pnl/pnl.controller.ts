import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PnLService } from './pnl.service';

@ApiTags('PnL')
@Controller('PnL')
export class PnLController {
  constructor(private readonly pnlService: PnLService) {}

  @Post()
  @ApiOperation({ summary: 'Calculate total PnL from all encrypted request values' })
  @ApiResponse({ 
    status: 200, 
    description: 'PnL calculated successfully',
    schema: {
      type: 'object',
      properties: {
        pnl: {
          type: 'number',
          example: 1000.50
        }
      }
    }
  })
  async calculatePnL(): Promise<{ pnl: number }> {
    const pnl = await this.pnlService.calculatePnL();
    return { pnl };
  }
} 
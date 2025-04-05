import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Execute')
@Controller('execute')
export class ExecuteController {
  @Post()
  @ApiOperation({ summary: 'Execute a transaction' })
  @ApiResponse({ 
    status: 200, 
    description: 'Please use /start, /stop, or /pnl commands instead. This endpoint is not yet deployed.',
    schema: {
      type: 'string',
      example: 'Please use /start, /stop, or /pnl commands instead. This endpoint is not yet deployed.'
    }
  })
  execute(): string {
    return 'Please use /start, /stop, or /pnl commands instead. This endpoint is not yet deployed.';
  }
} 
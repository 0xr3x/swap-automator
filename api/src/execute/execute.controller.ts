import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Execute')
@Controller('execute')
export class ExecuteController {
  @Post()
  @ApiOperation({ summary: 'Execute a transaction' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transaction executed successfully',
    schema: {
      type: 'string',
      example: 'executed'
    }
  })
  execute(): string {
    return 'executed';
  }
} 
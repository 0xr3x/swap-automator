import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('requests')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('quarterly-report')
  @ApiOperation({ summary: 'Create quarterly report' })
  @ApiResponse({ status: 200, description: 'Report created successfully' })
  createQuarterlyReport(@Body('q') q: number): number {
    return this.appService.getQuarterlyReport(q);
  }

  @Get('request-ids')
  @ApiOperation({ summary: 'Get all request IDs' })
  @ApiResponse({ status: 200, description: 'List of request IDs' })
  getRequestIds(): string[] {
    return this.appService.getRequestIds();
  }

  @Get('request/:id')
  @ApiOperation({ summary: 'Get encrypted request by ID' })
  @ApiResponse({ status: 200, description: 'Request data' })
  async getEncryptedRequest(@Param('id') id: string): Promise<any> {
    return this.appService.getEncryptedRequest(id);
  }

  @Post('request')
  @ApiOperation({ summary: 'Create encrypted request' })
  @ApiResponse({ status: 200, description: 'Request created successfully' })
  async createEncryptedRequest(@Body() body: any): Promise<string> {
    return this.appService.createEncryptedRequest(body);
  }
}


import { ApiProperty } from '@nestjs/swagger';

export class CreateRequestDto {
  @ApiProperty({ description: 'Zipcode for the request' })
  zipcode: string;

  @ApiProperty({ description: 'Private key for encryption' })
  privateKey: string;

  @ApiProperty({ description: 'Contract address' })
  contractAddress: string;

  @ApiProperty({ description: 'Contract ABI' })
  contractABI: any;
} 
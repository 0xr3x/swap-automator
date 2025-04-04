import { Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { retrieveEncryptedRequest } from './utils/retrieveEncryptedRequest';
import { createEncryptedRequest } from './utils/createEncryptedRequest';

// 01364e19a9cb82a8bdd2a4afda5d0e8d3f7b7224c49b3b55e4a723714815fcfaf2 requestId

@Injectable()
export class AppService {

  async createEncryptedRequest(body: CreateRequestDto): Promise<string> {
    const requestId = await createEncryptedRequest(
      body.zipcode,
      body.privateKey,
      body.contractAddress,
      body.contractABI
    );
    return requestId.requestId;
  }

  async getEncryptedRequest(id: string): Promise<any> {
    return await retrieveEncryptedRequest(id);
  }

  getQuarterlyReport(q: number): number {
    return q;
  }

  getRequestIds(): string[] {
    return ['1', '2', '3'];
  }

  getQuarterlyPositions(q: number): number[] {
    return [1, 2, 3];
  }
}

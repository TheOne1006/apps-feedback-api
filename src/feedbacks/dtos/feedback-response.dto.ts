import { ApiResponseProperty } from '@nestjs/swagger';

export class BaseFeedbackResponseDto {
  @ApiResponseProperty()
  id: string;

  @ApiResponseProperty()
  created_at: string;
}

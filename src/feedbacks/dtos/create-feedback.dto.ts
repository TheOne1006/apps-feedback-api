import { IsString, IsNotEmpty, Length, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Feedback content',
    minLength: 1,
    maxLength: 100,
    example: 'The app crashes when I open settings',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  content: string;

  @ApiProperty({
    description: 'Application name',
    minLength: 1,
    maxLength: 50,
    example: 'MyApp',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  appName: string;

  @ApiPropertyOptional({
    description: 'Contact information (optional)',
    maxLength: 50,
    example: 'user@example.com',
    required: false,
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  contact?: string;

  @ApiProperty({
    description: 'Device identifier',
    example: 'device-abc-123',
  })
  @IsString()
  @IsNotEmpty()
  device_id: string;
}

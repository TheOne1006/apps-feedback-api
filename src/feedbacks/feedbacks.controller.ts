import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FeedbacksService } from './feedbacks.service';
import { FeedbackRateLimitGuard } from './feedbacks.guard';
import { CreateFeedbackDto, BaseFeedbackResponseDto } from './dtos';

@ApiTags('Feedbacks')
@Controller('api/v1/feedback')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Post()
  @UseGuards(FeedbackRateLimitGuard)
  @ApiOperation({
    summary: 'Submit user feedback',
    description: 'Submit user feedback with optional contact info and up to 3 images (JPEG, PNG, GIF, WebP; max 10MB each)',
  })
  @ApiResponse({ status: 201, description: 'The record has been successfully created.', type: BaseFeedbackResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request — Invalid input or file type.' })
  @ApiResponse({ status: 413, description: 'Payload Too Large — Image file exceeds 10MB limit.' })
  @ApiResponse({ status: 429, description: 'Too Many Requests.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Feedback content', minLength: 1, maxLength: 100 },
        contact: { type: 'string', description: 'Contact information (optional)', maxLength: 50 },
        device_id: { type: 'string', description: 'Device identifier' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Images (JPEG, PNG, GIF, WebP; up to 3 files, max 10MB each)',
        },
      },
      required: ['content', 'device_id'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 3 }], {
      limits: {
        fileSize: 1024 * 1024 * 10, // 10MB per file
      },
      fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('只支持图片格式 (jpeg, png, gif, webp)'), false);
        }
      },
    }),
  )
  async create(
    @Body() dto: CreateFeedbackDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    const result = await this.feedbacksService.createFeedback(dto, files.images || []);
    return {
      code: 201,
      message: 'Feedback submitted successfully',
      data: result,
    };
  }
}

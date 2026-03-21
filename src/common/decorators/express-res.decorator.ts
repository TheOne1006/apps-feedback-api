import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Response } from 'express';

export const ExpressResponse = createParamDecorator(
  (data: any, ctx: ExecutionContext): Response => {
    const res = ctx.switchToHttp().getResponse();
    return res;
  },
);

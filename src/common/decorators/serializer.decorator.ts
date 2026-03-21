import { SetMetadata } from '@nestjs/common';
import { SERIALIZER_CLASS, CLASS_SERIALIZER_OPTIONS } from '../constants';

export const SerializerClass = (plainClass: any) =>
  SetMetadata(SERIALIZER_CLASS, plainClass);


// CLASS_SERIALIZER_OPTIONS
export const ClassSerializerOptions = (options: any) =>
  SetMetadata(CLASS_SERIALIZER_OPTIONS, options);

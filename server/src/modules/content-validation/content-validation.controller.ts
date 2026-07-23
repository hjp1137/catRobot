import { Controller, Post } from '@nestjs/common';
import { ContentValidationService } from './content-validation.service';

@Controller('content')
export class ContentValidationController {
  constructor(private readonly validation: ContentValidationService) {}

  @Post('validate')
  validate() {
    return this.validation.validate();
  }
}

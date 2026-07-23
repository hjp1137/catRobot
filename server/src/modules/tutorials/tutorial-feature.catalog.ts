import { BadRequestException, Injectable } from '@nestjs/common';
import { TUTORIAL_FEATURES } from '../../../../shared/tutorial-catalog';

@Injectable()
export class TutorialFeatureCatalog {
  list() { return TUTORIAL_FEATURES.map(item => ({ ...item })); }
  require(id: string) {
    const item = TUTORIAL_FEATURES.find(feature => feature.id === id);
    if (!item) throw new BadRequestException({ code: 'TUTORIAL_FEATURE_REFERENCE_INVALID', featureId: id });
    return item;
  }
}

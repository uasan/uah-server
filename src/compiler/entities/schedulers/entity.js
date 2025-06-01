import { PATH_SRC_APP } from '#config';
import { TypeScriptEntity } from '../typescript/entity.js';

export class SchedulerEntity extends TypeScriptEntity {
  isScheduler = true;

  static {
    this.init({ path: PATH_SRC_APP + '*/schedulers/**.ts' });
  }
}

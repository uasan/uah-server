import {
  host,
  entities,
  beforeEmit,
  afterEmit,
  emitEntities,
} from '../host.js';
import { factoryEntity } from '../entities/factory.js';
import { setDeclarations } from '../makers/declaration.js';

const emitResult = {
  emitSkipped: false,
  diagnostics: [],
  emittedFiles: undefined,
};

export function emit() {
  const { state } = this;
  const { program, fileInfos } = state;

  host.program = program;
  host.checker = program.getTypeChecker();

  // console.log(
  //   Object.fromEntries(
  //     Object.entries(state).map(([key, value]) => [
  //       key,
  //       value?.size ?? value?.length,
  //     ])
  //   )
  // );

  try {
    let entity, files;

    setDeclarations();

    if (host.bootstrap) {
      files = state.affectedFilesPendingEmit.keys();
    } else {
      files = state.seenAffectedFiles;

      for (const key of entities.keys())
        if (fileInfos.has(key) === false) entities.get(key).delete();
    }

    if (files) {
      //path.endsWith('/hello.tsx') &&
      for (const path of files)
        if ((entity = factoryEntity(path))) emitEntities.add(entity);

      if (beforeEmit.size) {
        for (const task of beforeEmit) task();
        beforeEmit.clear();
      }

      // if (host.bootstrap === false) {
      //   for (const { refers } of emitEntities)
      //     if (refers) for (entity of refers) emitEntities.add(entity);
      // }

      for (entity of emitEntities) {
        host.entity = entity;
        const file = program.getSourceFileByPath(entity.path);

        entity.emitted(entity.emit(entity.emitting(file)));
      }

      if (afterEmit.size) {
        for (const task of afterEmit) task();
        afterEmit.clear();
      }
    }

    host.emitted();
  } catch (error) {
    console.error(error);
    host.reset();
  }

  return emitResult;
}

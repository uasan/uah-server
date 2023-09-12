type Deferrable = 'not' | 'immediate' | 'deferred';
type ReferenceAction =
  | 'cascade'
  | 'restrict'
  | 'noAction'
  | 'setDefault'
  | 'setNull';

interface Reference {
  keys: Record<string, any>;
  onUpdate?: ReferenceAction;
  onDelete?: ReferenceAction;
  deferrable?: Deferrable;
}

interface TableOptions {
  name: string;
  primary: [string, ...string[]];
  references?: Record<string, Reference>;
  constrains?: Record<string, any>;
  indexes?: Record<string, any>;
}

export declare abstract class TableModel<T extends TableOptions> {

}

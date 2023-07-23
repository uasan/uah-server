type OptionsColumn =
  | {
      primary?: boolean;
    }
  | undefined;

export type Column<T, options extends OptionsColumn = undefined> = T;

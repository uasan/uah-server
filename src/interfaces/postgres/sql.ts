export interface SQL {
  log(): this;

  asValue(): this;
  asTuples(): this;
  asObject(): this;
  asObjects(): this;
  asArray(): this;
  asArrays(): this;
  asLookup(deep: number): this;

  builder(): this;

  sql(strings: TemplateStringsArray, ...params: unknown[]): this;
  sql(
    value: unknown,
  ): (strings: TemplateStringsArray, ...params: unknown[]) => this;

  then(resolve: () => void, reject: () => void): Promise<unknown>;
}

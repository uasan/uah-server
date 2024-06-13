export interface SQL {
  log(): this;

  asObject(): this;
  asValue(): this;
  asBlob(): this;
  asValues(): this;

  sql(strings: TemplateStringsArray, ...params: unknown[]): this;
  sql(
    value: unknown
  ): (strings: TemplateStringsArray, ...params: unknown[]) => this;

  then(resolve: () => void, reject: () => void): Promise<unknown>;
}

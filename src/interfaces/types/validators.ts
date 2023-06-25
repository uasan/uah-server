
type IntOptions = { max?: number, min?:number, default?: number } | undefined;
type TextOptions = { max?: number, min?:number, default?: string, trim?: boolean, empty?: boolean } | undefined;

export type Default<T> = T;

export type Text<T extends TextOptions = undefined > = string;
export type Int<T extends IntOptions = undefined > = number;
export type UUID = string;
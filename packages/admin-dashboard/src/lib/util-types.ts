// given a union type it removes nulls from it
type RemoveNull<T> = T extends null ? never : T;

export type RemoveNullFields<T> = {
    [Key in keyof T]: RemoveNull<T[Key]>;
};
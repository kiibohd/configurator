// Some common aliases used throughout.

type Optional<T> = T | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

type Dictionary<V> = { [key: string]: V };

type ConstrainedDictionary<K extends string, V> = { [key in K]: V };

type SparseArray<T> = { [key: number]: Optional<T> };

type NameValue<N, V> = {
  name: N;
  value: V;
};

type Pair<T, U> = [T, U];

type NonEmptyArray<T> = {
  0: T;
} & Array<T>;

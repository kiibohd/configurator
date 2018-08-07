export type Update<T> = ((v: T) => T) | T;

export type SetSharedState<S> = <N extends keyof S>(
  name: N,
  update: Update<S[N]>,
) => void;

export type HookResult<T> = [T, (u: Update<T>) => void];

export type Reducer<S, A> = (state: S, action: A) => S;

export type Dispatch<A> = (action: A) => A;

export type UseSharedState<S> = <N extends keyof S>(name: N) => HookResult<S[N]>;

export type GetSharedState<S> = <N extends keyof S>(name: N) => S;

export type Store<S, A> = {
  useSharedState: UseSharedState<S>,
  getState: () => S,
  dispatch: Dispatch<A>,
};

export type StoreCreator<S, A> = (reducer: Reducer<S, A>, initialState: S) => Store<S, A>;

export type Enhancer<S, A> = (creator: StoreCreator<S, A>) => StoreCreator<S, A>;

export type CreateSharedState = <S extends {}, A extends {}>(initialState: S) => {
  useSharedState: UseSharedState<S>,
  setSharedState: SetSharedState<S>,
  getSharedState: GetSharedState<S>
};

export type CreateStore = <S extends {}, A extends {}>(
  reducer: Reducer<S, A>,
  initialState: S,
  enhancer?: Enhancer<S, A>,
) => Store<S, A>;

export const createSharedState: CreateSharedState;
export const createStore: CreateStore;

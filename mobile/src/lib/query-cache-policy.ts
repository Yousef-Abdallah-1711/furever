type QueryForPersistence = {
  state: { status: string };
  meta?: Record<string, unknown>;
};

export function shouldPersistQuery(query: QueryForPersistence): boolean {
  return query.state.status === 'success' && query.meta?.persist === true;
}

export function shouldClearPrivateCacheOnAuthChange(input: {
  event: string;
  previousUserId: string | null | undefined;
  nextUserId: string | null;
}): boolean {
  return input.event === 'SIGNED_OUT'
    || input.event === 'SIGNED_IN'
    || (input.previousUserId !== undefined && input.previousUserId !== input.nextUserId);
}

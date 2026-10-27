export const petQueryKeys = {
  all: ['pets'] as const,
  list: (ownerId: string) => ['pets', 'list', ownerId] as const,
  detail: (ownerId: string, id: string) => ['pets', 'detail', ownerId, id] as const,
  breeds: (species: string) => ['pets', 'breeds', species] as const,
};

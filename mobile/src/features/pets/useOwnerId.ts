import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useOwnerId() {
  return useQuery({
    queryKey: ['auth', 'current-owner-id'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session?.user.id ?? null;
    },
    staleTime: 30_000,
    retry: false,
    meta: { persist: false },
  });
}

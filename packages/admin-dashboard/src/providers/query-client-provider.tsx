import { QueryClientProvider as BaseQueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { queryClient } from '@/infra/query/query-client.js';

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
	return <BaseQueryClientProvider client={queryClient}>{children}</BaseQueryClientProvider>;
}

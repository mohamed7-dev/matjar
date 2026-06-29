import type { Permission } from '@matjar/common/lib/generated-types';
import type React from 'react';
import { usePermissions } from '@/hooks/use-permissions.js';

interface PermissionGuardProps {
	requiredPermissions: string[] | Permission[];
	children: React.ReactNode;
}

export function PermissionGuard({ requiredPermissions, children }: PermissionGuardProps) {
	const { hasPermissions } = usePermissions();

	if (!hasPermissions(requiredPermissions)) return null;
	return children;
}

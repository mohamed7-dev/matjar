import { Trans } from '@lingui/react/macro';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@matjar/design-system/components/alert-dialog';
import { DropdownMenuItem } from '@matjar/design-system/components/dropdown-menu';
import { cn } from '@matjar/design-system/lib/utils';
import type { LucideIcon } from 'lucide-react';
import React from 'react';
import { usePermissions } from '@/hooks/use-permissions.js';

interface BulkActionProps {
	label: React.ReactNode;
	icon?: LucideIcon;
	confirm?: React.ReactNode;
	permissions?: string[];
	disabled?: boolean;
	keepMenuOpen?: boolean;
	onExecute(): void;
	className?: string;
}

export function BulkAction(props: BulkActionProps) {
	const [confirming, setConfirming] = React.useState(false);

	const { hasPermissions } = usePermissions();

	const allowed = hasPermissions(props.permissions ?? []);

	const execute = () => {
		if (!allowed || props.disabled) {
			return;
		}

		if (props.confirm) {
			setConfirming(true);
			return;
		}

		props.onExecute();
	};

	return (
		<>
			<ActionMenuItem
				{...props}
				disabled={!allowed || props.disabled}
				onSelect={execute}
			/>

			<ConfirmationDialog
				open={confirming}
				description={props.confirm}
				onCancel={() => setConfirming(false)}
				onConfirm={() => {
					setConfirming(false);
					props.onExecute();
				}}
			/>
		</>
	);
}

interface MenuItemProps
	extends Pick<BulkActionProps, 'icon' | 'label' | 'disabled' | 'className' | 'keepMenuOpen'> {
	onSelect: () => void;
}

function ActionMenuItem({ label, icon: Icon, className, disabled, keepMenuOpen, onSelect }: MenuItemProps) {
	return (
		<DropdownMenuItem
			disabled={disabled}
			// closeOnClick={!keepMenuOpen}
			onClick={(event) => {
				event.preventDefault();
				event.stopPropagation();
				onSelect();
			}}
		>
			{Icon && <Icon className={cn('mr-2 h-4 w-4', className)} />}

			<span className={cn('text-sm', className)}>{label}</span>
		</DropdownMenuItem>
	);
}

interface ConfirmationDialogProps {
	onCancel: () => void;
	onConfirm: () => void;
	description: React.ReactNode;
	open: boolean;
}

function ConfirmationDialog({ open, description, onConfirm, onCancel }: ConfirmationDialogProps) {
	if (!description) {
		return null;
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={(open) => {
				if (!open) {
					onCancel();
				}
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						<Trans>Confirm Action</Trans>
					</AlertDialogTitle>

					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel onClick={onCancel}>
						<Trans>Cancel</Trans>
					</AlertDialogCancel>

					<AlertDialogAction onClick={onConfirm}>
						<Trans>Continue</Trans>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

import { Checkbox } from '@matjar/design-system/components/checkbox';

export function AssetSelection({ checked, onChange }: { checked: boolean; onChange(): void }) {
	return (
		<Checkbox
			checked={checked}
			onClick={(e) => {
				e.stopPropagation();
				onChange();
			}}
		/>
	);
}

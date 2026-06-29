import { DndContext, type DragEndEvent, useDraggable } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { Trans } from '@lingui/react/macro';
import { Button } from '@matjar/design-system/components/button';
import { cn } from '@matjar/design-system/lib/utils';
import { CrosshairIcon, XIcon } from 'lucide-react';
import React from 'react';

function DraggablePoint({ focalPoint }: { focalPoint: FocalPoint }) {
	const { transform, isDragging, listeners, attributes, setNodeRef } = useDraggable({
		id: 'focal-point',
	});

	return (
		<div
			style={{
				left: `${focalPoint.x * 100}%`,
				top: `${focalPoint.y * 100}%`,
				transform: !isDragging
					? `translate(-50%, -50%)`
					: `translate(-50%, -50%) ${CSS.Translate.toString(transform)}`,
			}}
			{...listeners}
			{...attributes}
			ref={setNodeRef}
			className='absolute size-10 rounded-full bg-primary/70 border-4 border-border shadow-lg cursor-move'
		/>
	);
}

type FocalPoint = {
	x: number;
	y: number;
};

interface AssetFocalPointEditorProps {
	children: React.ReactNode;
	isFocalPointLocatorActive: boolean;
	focalPoint: FocalPoint | undefined;
	imageWidth: number;
	imageHeight: number;
	onCancel: () => void;
	onFocalPointChange: (focalPoint: FocalPoint) => void;
}

export function AssetFocalPointEditor({
	children,
	isFocalPointLocatorActive,
	focalPoint,
	imageWidth,
	imageHeight,
	onCancel,
	onFocalPointChange,
}: AssetFocalPointEditorProps) {
	const [currentFocalPoint, setCurrentFocalPoint] = React.useState<FocalPoint>(
		focalPoint ?? {
			x: 0.5,
			y: 0.5,
		},
	);

	const onDragEnd = React.useCallback(
		(event: DragEndEvent) => {
			const { delta } = event;
			const newX = Math.max(0, Math.min(1, currentFocalPoint.x + delta.x / imageWidth));
			const newY = Math.max(0, Math.min(1, currentFocalPoint.y + delta.y / imageHeight));
			const newPoint = {
				x: newX,
				y: newY,
			};
			setCurrentFocalPoint(newPoint);
		},
		[
			currentFocalPoint,
			imageWidth,
			imageHeight,
		],
	);

	return (
		<div
			className={cn(
				'relative flex items-center justify-center',
				isFocalPointLocatorActive && 'cursor-crosshair',
			)}
		>
			<div
				className='relative'
				style={{
					width: `${imageWidth}px`,
					height: `${imageHeight}px`,
				}}
			>
				{children}
				{isFocalPointLocatorActive && (
					<DndContext
						onDragEnd={onDragEnd}
						modifiers={[
							restrictToParentElement,
						]}
					>
						<DraggablePoint focalPoint={currentFocalPoint} />
					</DndContext>
				)}
			</div>
			{isFocalPointLocatorActive && (
				<div className='absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2'>
					<Button
						type='button'
						variant='neutral'
						size={'sm'}
						onClick={onCancel}
					>
						<XIcon />
						<Trans>Cancel</Trans>
					</Button>
					<Button
						type='button'
						size={'sm'}
						onClick={() => {
							onFocalPointChange(currentFocalPoint);
						}}
					>
						<CrosshairIcon />
						<Trans>Set Focal Point</Trans>
					</Button>
				</div>
			)}
		</div>
	);
}

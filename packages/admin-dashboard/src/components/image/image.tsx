import { cn } from '@matjar/design-system/lib/utils';
import { ImageIcon } from 'lucide-react';
import type React from 'react';
import { buildImageUrl, resolveSize } from './utils.js';

export interface AssetLike {
	id: string;
	url: string;
	name?: string | null;
	focalPoint?: {
		x: number;
		y: number;
	} | null;
}

export type ImagePreset = 'tiny' | 'thumb' | 'small' | 'medium' | 'large' | 'full' | null;

export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | null;

export type ImageMode = 'crop' | 'resize' | null;

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
	asset: AssetLike | undefined;
	placeholder?: React.ReactNode;
	width?: number;
	height?: number;
	transform: {
		preset?: ImagePreset;
		mode?: ImageMode;
		format?: ImageFormat;
		quality?: number;
		useFocalPoint?: boolean;
	};
	ref?: React.Ref<HTMLImageElement>;
}

export function Image({
	ref,
	asset,
	placeholder,
	transform,
	width,
	height,
	alt,
	className,
	style,
	...props
}: ImageProps) {
	const { quality, useFocalPoint = true, preset = null, mode = null, format = null } = transform;
	if (!asset) {
		return (
			placeholder ?? (
				<PlaceholderImage
					preset={preset}
					width={width}
					height={height}
					className={className}
				/>
			)
		);
	}

	const size = resolveSize(preset, width, height);

	return (
		<img
			ref={ref}
			src={buildImageUrl(asset, {
				preset,
				mode,
				format,
				width,
				height,
				quality,
				useFocalPoint,
			})}
			alt={alt ?? asset.name ?? ''}
			width={size.width}
			height={size.height}
			className={cn('rounded-base', className)}
			loading='lazy'
			style={style}
			{...props}
		/>
	);
}

interface PlaceholderImageProps extends React.HTMLAttributes<HTMLDivElement> {
	preset?: ImagePreset;
	width?: number;
	height?: number;
}

export function PlaceholderImage({
	preset = null,
	width,
	height,
	className,
	style,
	...props
}: PlaceholderImageProps) {
	const size = resolveSize(preset, width, height);

	return (
		<div
			className={cn('rounded-base flex items-center justify-center bg-secondary-background', className)}
			style={{
				width: size.width,
				height: size.height,
				...style,
			}}
			{...props}
		>
			<ImageIcon className='size-full text-foreground' />
		</div>
	);
}

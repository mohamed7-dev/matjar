import {
	Pagination as BasePagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@matjar/design-system/components/pagination';

interface PaginationProps {
	goToPage: (page: number) => void;
	page: number;
	totalPagesCount: number;
}

export function AssetsPagination({ goToPage, page, totalPagesCount }: PaginationProps) {
	return (
		<BasePagination className='w-auto'>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						href='#'
						size='default'
						onClick={(e) => {
							e.preventDefault();
							goToPage(page - 1);
						}}
						className={page === 1 ? 'pointer-events-none opacity-50' : ''}
					/>
				</PaginationItem>

				{/* First page */}
				{page > 2 && (
					<PaginationItem>
						<PaginationLink
							href='#'
							onClick={(e) => {
								e.preventDefault();
								goToPage(1);
							}}
						>
							1
						</PaginationLink>
					</PaginationItem>
				)}

				{/* Ellipsis if needed */}
				{page > 3 && (
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				)}

				{/* Previous page */}
				{page > 1 && (
					<PaginationItem>
						<PaginationLink
							href='#'
							onClick={(e) => {
								e.preventDefault();
								goToPage(page - 1);
							}}
						>
							{page - 1}
						</PaginationLink>
					</PaginationItem>
				)}

				{/* Current page */}
				<PaginationItem>
					<PaginationLink
						href='#'
						isActive
					>
						{page}
					</PaginationLink>
				</PaginationItem>

				{/* Next page */}
				{page < totalPagesCount && (
					<PaginationItem>
						<PaginationLink
							href='#'
							onClick={(e) => {
								e.preventDefault();
								goToPage(page + 1);
							}}
						>
							{page + 1}
						</PaginationLink>
					</PaginationItem>
				)}

				{/* Ellipsis if needed */}
				{page < totalPagesCount - 2 && (
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
				)}

				{/* Last page */}
				{page < totalPagesCount - 1 && (
					<PaginationItem>
						<PaginationLink
							href='#'
							onClick={(e) => {
								e.preventDefault();
								goToPage(totalPagesCount);
							}}
						>
							{totalPagesCount}
						</PaginationLink>
					</PaginationItem>
				)}

				<PaginationItem>
					<PaginationNext
						href='#'
						onClick={(e) => {
							e.preventDefault();
							goToPage(page + 1);
						}}
						className={page === totalPagesCount ? 'pointer-events-none opacity-50' : ''}
					/>
				</PaginationItem>
			</PaginationContent>
		</BasePagination>
	);
}

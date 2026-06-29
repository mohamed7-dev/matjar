import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@matjar/design-system/components/alert-dialog';
import { Button } from '@matjar/design-system/components/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@matjar/design-system/components/dialog';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@matjar/design-system/components/sheet';
import { Skeleton } from '@matjar/design-system/components/skeleton';
import { createFileRoute, Navigate, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider.js';

export const Route = createFileRoute('/_authenticated/')({
	component: AuthenticatedLayoutIndexPage,
});

function AuthenticatedLayoutIndexPage() {
	const auth = useAuth('AuthenticatedLayoutIndexPage');
	const router = useRouter();

	const handleLogout = async () => {
		await auth.logout().then(() => {
			router.invalidate().finally(() => {
				Navigate({
					to: '/login',
				});
			});
		});
	};

	return (
		<>
			<div>Hello "/authenticated/"!</div>
			<Button onClick={handleLogout}>Logout</Button>
			<Button onClick={() => toast.info('Testing toaster')}>Sonner</Button>

			<Sheet>
				<SheetTrigger asChild>
					<Button>Open Sheet</Button>
				</SheetTrigger>
				<SheetContent>
					<SheetHeader>
						<SheetTitle>Edit profile</SheetTitle>
						<SheetDescription>
							Make changes to your profile here. Click save when you&apos;re done.
						</SheetDescription>
					</SheetHeader>
					<div className='grid flex-1 auto-rows-min gap-6 px-4'>Sheet Content</div>
					<SheetFooter>
						<Button type='submit'>Save changes</Button>
						<SheetClose asChild>
							<Button variant='neutral'>Close</Button>
						</SheetClose>
					</SheetFooter>
				</SheetContent>
			</Sheet>
			<Dialog>
				<DialogTrigger>Open Dialog</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Title</DialogTitle>
						<DialogDescription>Description</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant={'neutral'}>Close</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<AlertDialog>
				<AlertDialogTrigger>Open Alert Dialog</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Title</AlertDialogTitle>
						<AlertDialogDescription>Description</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction>Okay</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<div className='flex items-center space-x-4'>
				<Skeleton className='h-12 w-12 rounded-full' />
				<div className='space-y-2'>
					<Skeleton className='h-4 sm:w-[250px] w-[100px]' />
					<Skeleton className='h-4 sm:w-[200px] w-[100px]' />
				</div>
			</div>
		</>
	);
}

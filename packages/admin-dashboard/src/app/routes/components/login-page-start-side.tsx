import { ShoppingBagIcon } from 'lucide-react';
import React from 'react';

export function LoginPageStartSide() {
	return (
		<div
			className='hidden lg:flex flex-col justify-between w-1/2 h-screen p-12'
			style={{
				backgroundColor: '#0A0A0A',
				borderRight: '4px solid #000',
			}}
		>
			<div className='flex items-center gap-3'>
				<div className='w-10 h-10 flex items-center justify-center bg-primary border-2 border-primary'>
					<ShoppingBagIcon
						size={20}
						className='text-primary-foreground'
						strokeWidth={2.5}
					/>
				</div>
				<span className='text-primary text-2xl font-bold'>Matjar Commerce</span>
			</div>

			<div>
				<div className='inline-block mb-6 px-3 py-1 bg-primary border-2 border-primary'>
					<span className='text-primary-foreground text-lg font-bold'>MULTI-REGION PLATFORM</span>
				</div>
				<h1 className='text-white text-5xl font-bold mb-4'>
					MANAGE YOUR
					<br />
					<span className='text-primary'>MARKETPLACE</span>
					<br />
					GLOBALLY.
				</h1>
				<p className='text-muted-foreground text-md max-w-[380px]'>
					Unified control over EG-Store and KSA-Store — products, orders, customers, and assets from
					one powerful dashboard.
				</p>
			</div>

			<div className='flex gap-6'>
				{[
					{
						label: 'Regions',
						value: '2+',
					},
					{
						label: 'Orders/mo',
						value: '9K+',
					},
					{
						label: 'Customers',
						value: '5K+',
					},
				].map((stat) => (
					<div key={stat.label}>
						<div className='text-primary text-xl font-bold'>{stat.value}</div>
						<div className='text-muted-foreground text-md font-semibold'>{stat.label}</div>
					</div>
				))}
			</div>
		</div>
	);
}

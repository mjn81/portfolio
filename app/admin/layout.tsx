'use client';

import type React from 'react';

import { usePathname } from 'next/navigation';
import { AdminSidebar, AdminSidebarTrigger } from '@/components/admin/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	// Don't show sidebar on login page
	const isLoginPage = pathname === '/admin/login';

	if (isLoginPage) {
		return (
			<>
				{children}
				<Toaster />
			</>
		);
	}

	return (
		<SidebarProvider>
			<div className="flex h-screen w-full overflow-hidden">
				<AdminSidebar />
				<div className="flex-1 flex flex-col w-full overflow-hidden">
					<AdminSidebarTrigger />
					<main className="flex-1 w-full overflow-auto p-4 md:p-6">
						{children}
					</main>
				</div>
			</div>
			<Toaster />
		</SidebarProvider>
	);
}

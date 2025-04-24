'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useAuth() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		// Check if user is authenticated
		const checkAuth = () => {
			const auth = localStorage.getItem('admin_authenticated');
			setIsAuthenticated(auth === 'true');
			setIsLoading(false);
		};

		checkAuth();
	}, []);

	const logout = () => {
		localStorage.removeItem('admin_authenticated');
		setIsAuthenticated(false);
		router.push('/admin/login');
	};

	return { isAuthenticated, isLoading, logout };
}

export function withAuth(Component: React.ComponentType) {
	return function AuthenticatedComponent(props: any) {
		const { isAuthenticated, isLoading } = useAuth();
		const router = useRouter();
		const pathname = usePathname();

		// Skip authentication check for the login page
		const isLoginPage = pathname === '/admin/login';

		useEffect(() => {
			if (!isLoading && !isAuthenticated && !isLoginPage) {
				router.push('/admin/login');
			}
		}, [isAuthenticated, isLoading, router, isLoginPage]);

		if (isLoading) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					Loading...
				</div>
			);
		}

		if (!isAuthenticated && !isLoginPage) {
			return null;
		}

		return <Component {...props} />;
	};
}

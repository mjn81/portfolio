'use client';

import React, { useEffect, useState, ComponentType } from 'react';
import { useRouter, usePathname } from 'next/navigation';


interface User {
	id: string;
	email: string;
	name: string;
	avatar: string;
	status: string;
	role: string;
	created_at: string;
	last_active: string;
}

export function useAuth() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [profile, setProfile] = useState<User | null>(null);
	const router = useRouter();

	const fetchProfile = async () => {
		try {
			const response = await fetch('/api/users/profile', {
				method: 'GET',
			});

			if (!response.ok) {
				localStorage.removeItem('user');
				localStorage.removeItem('user_fetched_at');
				setIsAuthenticated(false);
				setIsLoading(false);
				return;
			}

			const data = await response.json();

			if (data.error) {
				localStorage.removeItem('user');
				localStorage.removeItem('user_fetched_at');
				setIsAuthenticated(false);
				setIsLoading(false);
				return;
			}

			setIsAuthenticated(true);
			localStorage.setItem('user', JSON.stringify(data));
			localStorage.setItem('user_fetched_at', Date.now().toString());
			setProfile(data);
			setIsLoading(false);
		} catch (error) {
			localStorage.removeItem('user');
			localStorage.removeItem('user_fetched_at');
			setIsAuthenticated(false);
			setIsLoading(false);
		}
	};

	const logout = async () => {
		try {
			const response = await fetch('/api/auth/logout', {
				method: 'POST',
			});

			if (!response.ok) {
				localStorage.removeItem('user');
				localStorage.removeItem('user_fetched_at');
				setIsAuthenticated(false);
				setIsLoading(false);
				return;
			}

			const data = await response.json();

			if (data.error) {
				localStorage.removeItem('user');
				localStorage.removeItem('user_fetched_at');
				setIsAuthenticated(false);
				setIsLoading(false);
				return;
			}

			localStorage.removeItem('user');
			localStorage.removeItem('user_fetched_at');
			setProfile(null);
			setIsAuthenticated(false);
			router.push('/admin/login');
		} catch (error) {
			localStorage.removeItem('user');
			localStorage.removeItem('user_fetched_at');
			setIsAuthenticated(false);
			setIsLoading(false);
		}
	}

	useEffect(() => {
		const user = localStorage.getItem('user');
		const fetchedAt = localStorage.getItem('user_fetched_at');
		const now = Date.now();
		const twentyFourHours = 24 * 60 * 60 * 1000;

		if (user && fetchedAt && now - parseInt(fetchedAt, 10) < twentyFourHours) {
			const parsedUser = JSON.parse(user);
			setProfile(parsedUser);
			setIsAuthenticated(true);
			setIsLoading(false);
		} else {
			fetchProfile();
		}
	}, []);

	return { isAuthenticated, profile, isLoading, logout };
}

export function withAuth<P extends object>(Component: ComponentType<P>) {
	return function AuthenticatedComponent(props: P) {
		const { isAuthenticated, isLoading } = useAuth();
		const router = useRouter();
		const pathname = usePathname();

		const isLoginPage = pathname === '/admin/login';

		useEffect(() => {
			if (!isLoading && !isAuthenticated && !isLoginPage) {
				router.push('/admin/login');
			}
		}, [isAuthenticated, isLoading, router, isLoginPage]);

		if (isLoading) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					Authenticating...
				</div>
			);
		}

		if (!isAuthenticated && !isLoginPage) {
			return null;
		}

		return <Component {...props} />;
	};
}

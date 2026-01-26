    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    import { LoginRequest, RegisterRequest, AuthResponse, PortfolioResponse } from '@/lib/types';



    export const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
        });

        if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
        }

        return response.json();
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
        });

        if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
        }

        return response.json();
    },

    async logout(): Promise<void> {
        await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        });
    },

    async verify(): Promise<{ username: string } | null> {
        try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            return null;
        }

        return response.json();
        } catch {
        return null;
        }
    },

    async getPortfolio(): Promise<PortfolioResponse> {
        const response = await fetch(`${API_BASE_URL}/portfolio/`, {
        method: 'GET',
        credentials: 'include',
        });

        if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch portfolio');
        }

        return response.json();
    },
    };


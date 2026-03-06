import { browser } from "$app/environment";
import { get, writable } from "svelte/store";
import type { AppUser } from "$lib/types";

interface AuthState {
	initialized: boolean;
	users: AppUser[];
	currentUser: AppUser | null;
}

interface AuthSnapshot {
	users: AppUser[];
	currentUserId: string | null;
}

type AuthMutationResult = { ok: true } | { ok: false; error: string };

const AUTH_STORAGE_KEY = "inventory.auth.v1";

const defaultUsers: AppUser[] = [
	{
		id: "user-demo-1",
		name: "Demo Admin",
		email: "demo@inventory.app",
		password: "demo1234",
		createdAt: "2026-03-01T08:00:00.000Z",
	},
];

const initialState: AuthState = {
	initialized: false,
	users: [],
	currentUser: null,
};

let hasInitialized = false;

export const authStore = writable<AuthState>(initialState);

function createId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}

	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readSnapshot(): AuthSnapshot | null {
	if (!browser) {
		return null;
	}

	const raw = localStorage.getItem(AUTH_STORAGE_KEY);
	if (!raw) {
		return null;
	}

	try {
		const parsed = JSON.parse(raw) as Partial<AuthSnapshot>;
		if (!Array.isArray(parsed.users)) {
			return null;
		}

		return {
			users: parsed.users,
			currentUserId: typeof parsed.currentUserId === "string" ? parsed.currentUserId : null,
		};
	} catch {
		return null;
	}
}

function persistState(state: AuthState) {
	if (!browser) {
		return;
	}

	const snapshot: AuthSnapshot = {
		users: state.users,
		currentUserId: state.currentUser?.id ?? null,
	};

	localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(snapshot));
}

function setAndPersist(state: AuthState) {
	authStore.set(state);
	persistState(state);
}

export function initializeAuth() {
	if (hasInitialized) {
		return;
	}

	hasInitialized = true;

	const snapshot = readSnapshot();
	if (!snapshot) {
		setAndPersist({
			initialized: true,
			users: defaultUsers,
			currentUser: null,
		});
		return;
	}

	const currentUser =
		snapshot.currentUserId === null
			? null
			: snapshot.users.find((user) => user.id === snapshot.currentUserId) ?? null;

	setAndPersist({
		initialized: true,
		users: snapshot.users.length > 0 ? snapshot.users : defaultUsers,
		currentUser,
	});
}

export function signUp(payload: {
	name: string;
	email: string;
	password: string;
}): AuthMutationResult {
	const name = payload.name.trim();
	const email = payload.email.trim().toLowerCase();
	const password = payload.password.trim();

	if (!name || !email || !password) {
		return { ok: false, error: "Name, email, and password are required." };
	}

	const state = get(authStore);
	if (state.users.some((user) => user.email === email)) {
		return { ok: false, error: "Email already exists. Please log in instead." };
	}

	const nextUser: AppUser = {
		id: createId(),
		name,
		email,
		password,
		createdAt: new Date().toISOString(),
	};

	const nextState: AuthState = {
		initialized: true,
		users: [nextUser, ...state.users],
		currentUser: nextUser,
	};

	setAndPersist(nextState);
	return { ok: true };
}

export function login(payload: { email: string; password: string }): AuthMutationResult {
	const email = payload.email.trim().toLowerCase();
	const password = payload.password.trim();

	if (!email || !password) {
		return { ok: false, error: "Email and password are required." };
	}

	const state = get(authStore);
	const matchedUser = state.users.find(
		(user) => user.email === email && user.password === password
	);

	if (!matchedUser) {
		return { ok: false, error: "Invalid credentials. Please try again." };
	}

	const nextState: AuthState = {
		...state,
		initialized: true,
		currentUser: matchedUser,
	};

	setAndPersist(nextState);
	return { ok: true };
}

export function logout() {
	const state = get(authStore);
	setAndPersist({
		...state,
		initialized: true,
		currentUser: null,
	});
}

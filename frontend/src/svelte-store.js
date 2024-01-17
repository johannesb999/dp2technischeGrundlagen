import { writable } from 'svelte/store';

export const loggedIn = writable(false);
export const token = writable("");

export const currentRoute = writable("/Login");


import React, { createContext } from "react";
const AuthContext = createContext();
export function AuthProvider({ children }) {
	const providerValue = {
		user: null,
		userName: null,
		userId: null,
		userEmail: null,
		userPhoto: null,
		loading: false,
		isLoggedIn: false,
		accessToken: null,
		error: null,
		isOwner: false,
		getUserData: ()=>{},
		pageRequiredAuth: ()=>{},
		login: ()=>{},
		logout: ()=>{},
	}
	return (
		<AuthContext.Provider value={providerValue}>
			{children}
		</AuthContext.Provider>
	);
}
export {AuthContext}

import React, { useState } from 'react';
import { View } from 'react-native';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [error, setError] = useState(null);
	const [Message, setMessage] = useState(null);
	const ip = 'localhost';
	const port = ':2000';
	const [paiment, setPaiment] = useState({
		amount: 0,
		description: '',
	});

	return <AuthContext.Provider value={{ isSignedIn, setIsSignedIn, isAdmin, setIsAdmin, ip, error, setError, port, Message, setMessage, paiment, setPaiment }}>{children}</AuthContext.Provider>;
}

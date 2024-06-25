import React from 'react';
import Routes from './pages/Routes';
import { AuthProvider } from './components/auths/AuthProvider';
import ErrorBanner from './components/banners/ErrorBanner';
import MessageBanner from './components/banners/MessageBanner';
import { View, Dimensions } from 'react-native';
import StripeContainer from './components/StripeContainer';

const { height } = Dimensions.get('window');

console.log(height - 1);
export default function App() {
	return (
		<AuthProvider>
			<View style={{ flex: 1, height: height - 1 }}>
				<StripeContainer />
				<ErrorBanner />
				<MessageBanner />
				<Routes />
			</View>
		</AuthProvider>
	);
}

import React, { useEffect, useContext } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Button } from '@rneui/base';
import Global from '../global';
import Footer from '../components/footer';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../components/auths/AuthContext';

export default function HomePage() {
	const { isSignedIn, isAdmin, ip, setIsSignedIn, setIsAdmin, setError } = useContext(AuthContext);

	const navigation = useNavigation();
	useEffect(() => {
		fetch('http://' + ip + ':2000/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		}).catch((error) => console.error(error));
	}, []);

	function deconexion() {
		fetch('http://' + ip + ':2000/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					setError(data.error);
				} else {
					setIsSignedIn(false);
					setIsAdmin(false);
					navigation.navigate('Welcome');
				}
			})
			.catch((error) => console.error(error));
	}

	return (
		<View style={{ flex: 1 }}>
			<ScrollView contentContainerStyle={styles.container}>
				<View>
					<Text style={styles.title}>Hotel Avengers</Text>
					<Image source={require('../assets/hotel_icon.png')} style={styles.image} />
					<View style={styles.buttonContainer}>
						{!isSignedIn && (
							<>
								<Button buttonStyle={styles.button} title="Sign In" onPress={() => navigation.navigate('Sign In')} />
								<Button buttonStyle={styles.button} title="Sign Up" onPress={() => navigation.navigate('Sign Up')} />
							</>
						)}

						{isSignedIn && isAdmin && (
							// Admin button
							<Button buttonStyle={styles.button} title="Admin" onPress={() => navigation.navigate('Update info')} />
							//navigation.navigate('Admin')} />
						)}

						{isSignedIn && !isAdmin && (
							// User button
							<Button
								buttonStyle={styles.button}
								title="My Account"
								onPress={() => {
									navigation.navigate('My account');
								}}
							/>
						)}

						<Button buttonStyle={styles.button} title="List of Hotels" onPress={() => navigation.navigate('Hotel list')} />

						{isSignedIn && (
							// Log out button
							<Button buttonStyle={styles.button} title="Sign out" onPress={() => deconexion()} />
						)}
					</View>
				</View>
				<Footer />
			</ScrollView>
		</View>
	);
}

const styles = {
	container: {
		flex: 1,
		justifyContent: 'space-between',
	},
	title: {
		alignSelf: 'center',
		fontSize: 24,
		fontWeight: 'bold',
		marginTop: 24,
		marginBottom: 48,
	},
	image: {
		marginBottom: 50,
		width: 250,
		height: 250,
		alignSelf: 'center',
	},
	button: {
		alignSelf: 'center',
		backgroundColor: Global.buttonbg1,
		marginBottom: 12,
		width: '40%',
	},
};

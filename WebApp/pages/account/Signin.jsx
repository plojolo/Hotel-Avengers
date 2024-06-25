import React, { useState, useContext } from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input, Button } from '@rneui/base';
import Global from '../../global';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../components/auths/AuthContext';

export default function Signin() {
	const { setIsSignedIn, setIsAdmin, ip, setError, setMessage } = useContext(AuthContext);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigation = useNavigation();

	const handleSignUp = () => {
		//expression régulière pour vérifier le format de l'email
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		if (email === '' || !emailRegex.test(email) || password === '') {
			alert('Please fill out all the form');
			return;
		}
		fetch('http://' + ip + ':2000/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email: email, password: password }),
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				if (data.error) {
					setError(data.error);
				} else {
					setIsSignedIn(true);
					if (data.isAdmin) {
						setIsAdmin(true);
					}
					navigation.goBack();
				}
			});
	};

	function handleEmail(value) {
		setEmail(value);
	}

	function handlePass(value) {
		setPassword(value);
	}

	function forgottenPass() {
		var email = prompt('Veuillez entrer votre email');
		if (email === null || email === '') {
			setError('Veuillez entrer un email');
			return;
		}
		fetch('http://' + ip + ':2000/forgot-password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email: email }),
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					setError(data.error);
				} else {
					setMessage(data.message);
					navigation.navigate('Welcome');
				}
			});
	}

	return (
		<View>
			<Text style={styles.title}> Avengers Hotel Ohio</Text>
			<Input
				leftIcon={<Icon name="envelope" size={24} color="black" />}
				type="email"
				placeholder="Email"
				keyboardType={'email-address'}
				autoCompleteType={'email'}
				textContentType={'emailAddress'}
				autoCorrect={false}
				value={email}
				onChangeText={handleEmail}
			/>
			<Input leftIcon={<Icon name="lock" size={24} color="black" />} placeholder="Password" secureTextEntry={true} type="password" value={password} onChangeText={handlePass} />
			<Button buttonStyle={styles.button} title="Connect" onPress={handleSignUp} />
			<Text style={{ alignSelf: 'center' }} onPress={forgottenPass}>
				{' '}
				Forgot password ?
			</Text>
		</View>
	);
}

const styles = {
	title: {
		alignSelf: 'center',
		fontSize: 24,
		fontWeight: 'bold',
		marginTop: 24,
		marginBottom: 48,
	},
	button: {
		alignSelf: 'center',
		backgroundColor: Global.buttonbg1,
		marginBottom: 12,
		width: '40%',
	},
};

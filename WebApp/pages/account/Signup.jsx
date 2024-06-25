import React, { useState, useContext } from 'react';
import { View, Text, Box, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Input, Button, CheckBox } from '@rneui/base';
import Global from '../../global';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../components/auths/AuthContext';

const Signup = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [phone, setPhone] = useState('');
	const [address, setAddress] = useState('');
	const [admin, setAdmin] = useState(false);

	const { setIsSignedIn, ip, setError, setIsAdmin } = useContext(AuthContext);
	const navigation = useNavigation();

	const handleSignUp = () => {
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		if (email === '' || !emailRegex.test(email) || password === '') {
			alert('Please fill out all the form');
			return;
		}
		fetch('http://' + ip + ':2000/new_client', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email: email, password: password, firstName: firstName, lastName: lastName, phone: phone, address: address, admin: admin }),
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
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
	function handleFirstName(value) {
		setFirstName(value);
	}
	function handleLastName(value) {
		setLastName(value);
	}
	function handlePhone(value) {
		setPhone(value);
	}
	function handleAddress(value) {
		setAddress(value);
	}

	return (
		<>
			<Text style={styles.title}>Avengers Hotel Ohio</Text>
			<View style={{ alignItems: 'center' }}>
				<Input leftIcon={<Icon name="user" size={24} color="black" />} placeholder="First Name" type="text" value={firstName} onChangeText={handleFirstName} />
				<Input leftIcon={<Icon name="user" size={24} color="black" />} placeholder="Last Name" type="text" value={lastName} onChangeText={handleLastName} />
				<Input leftIcon={<Icon name="phone" size={24} color="black" />} placeholder="Phone Number" type="phone" value={phone} onChangeText={handlePhone} />
				<Input leftIcon={<Icon name="home" size={24} color="black" />} placeholder="Address" type="text" value={address} onChangeText={handleAddress} />
			</View>
			<Input
				leftIcon={<Icon name="envelope" size={24} color="black" />}
				type="email"
				placeholder="Email Address"
				keyboardType={'email-address'}
				autoCompleteType={'email'}
				textContentType={'emailAddress'}
				autoCorrect={false}
				value={email}
				onChangeText={handleEmail}
			/>
			<Input leftIcon={<Icon name="lock" size={24} color="black" />} placeholder="Password" secureTextEntry={true} type="password" value={password} onChangeText={handlePass} />
			<Input leftIcon={<Icon name="lock" size={24} color="black" />} placeholder="Confirm Password" secureTextEntry={true} type="password" value={password} onChangeText={handlePass} />
			<CheckBox title="Admin" checked={admin} onPress={() => setAdmin(!admin)} />
			<Button buttonStyle={styles.button} title="Sign Up" onPress={handleSignUp} />
		</>
	);
};

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

export default Signup;

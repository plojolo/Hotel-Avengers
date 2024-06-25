import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../components/auths/AuthContext';

export default function ResetPassword({ route }) {
	const [newPassword, setNewPassword] = useState('');
	const [repeatPassword, setRepeatPassword] = useState('');
	const { ip, port, setError, setMessage } = useContext(AuthContext);
	const navigation = useNavigation();
	const { token } = route.params;
	console.log(token);

	const handleSubmit = () => {
		if (newPassword !== repeatPassword) {
			alert('Passwords do not match');
			return;
		}

		fetch('http://' + ip + port + '/reset-password/' + token, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ password: newPassword }),
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					alert(data.error);
					navigation.navigate('Welcome');
				} else {
					alert('Password reset successfully');
					navigation.navigate('Welcome');
				}
			});
	};

	return (
		<View style={styles.container}>
			<Text style={{ fontSize: 20 }}>Reset Password</Text>
			<TextInput value={newPassword} onChangeText={setNewPassword} placeholder="New Password" secureTextEntry style={styles.input} />
			<TextInput value={repeatPassword} onChangeText={setRepeatPassword} placeholder="Repeat Password" secureTextEntry style={styles.input} />
			<Button title="Submit" onPress={handleSubmit} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	input: {
		width: '80%',
		margin: 15,
		padding: 10,
		borderWidth: 1,
		borderColor: 'black',
	},
});

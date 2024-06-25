import React, { useEffect } from 'react';
import { useContext, useState } from 'react';
import { AuthContext } from '../../components/auths/AuthContext';
import { StyleSheet, Text, TextInput, Button } from 'react-native';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function UpdateInfo() {
	const { ip, port, setError, setMessage } = useContext(AuthContext);
	const [info, setInfo] = useState({
		Email: '',
		Password: '',
		NewPassword: '',
		RepeatPassword: '',
		Adress: '',
		Phone: '',
		FirstName: '',
		LastName: '',
	});
	const navigation = useNavigation();

	useEffect(() => {
		fetch('http://' + ip + port + '/getUserInfo', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				setInfo(data);
				if (data.error) {
					setError(data.error);
				}
				if (data.message) {
					setMessage(data.message);
				}
			})
			.catch((error) => console.error(error));
	}, []);

	const handleSubmit = () => {
		if (info.NewPassword !== info.RepeatPassword) {
			alert('Passwords do not match');
			return;
		}

		fetch('http://' + ip + port + '/updateUserInfo', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(info),
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.error) {
					setError(data.error);
				}
				if (data.message) {
					setMessage(data.message);
					navigation.goBack();
				}
			});
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Update your information</Text>
			<Text>Email:</Text>
			<TextInput style={styles.input} value={info.Email} onChangeText={(text) => setInfo({ ...info, Email: text })} />
			<Text>Adress:</Text>
			<TextInput style={styles.input} value={info.Adress} onChangeText={(text) => setInfo({ ...info, Adress: text })} />
			<Text>Phone:</Text>
			<TextInput style={styles.input} value={info.Phone} onChangeText={(text) => setInfo({ ...info, Phone: text })} />
			<Text>First name:</Text>
			<TextInput style={styles.input} value={info.FirstName} onChangeText={(text) => setInfo({ ...info, FirstName: text })} />
			<Text>Last name:</Text>
			<TextInput style={styles.input} value={info.LastName} onChangeText={(text) => setInfo({ ...info, LastName: text })} />
			<Text>Current password:</Text>
			<TextInput style={styles.input} value={info.Password} onChangeText={(text) => setInfo({ ...info, Password: text })} secureTextEntry={true} />
			<Text>New password:</Text>
			<TextInput style={styles.input} value={info.NewPassword} onChangeText={(text) => setInfo({ ...info, NewPassword: text })} secureTextEntry={true} />
			<Text>Repeat new password:</Text>
			<TextInput style={styles.input} value={info.RepeatPassword} onChangeText={(text) => setInfo({ ...info, RepeatPassword: text })} secureTextEntry={true} />

			<Button title="Submit" onPress={handleSubmit} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
	},
	reservation: {
		borderWidth: 1,
		borderColor: 'black',
		margin: 10,
		padding: 10,
	},
	boldText: {
		fontWeight: 'bold',
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		borderRadius: 5,
		marginVertical: 5,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginVertical: 10,
	},
});

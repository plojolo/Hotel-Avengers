import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../auths/AuthContext';
import { Button } from '@rneui/base';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function MessageBanner() {
	const { Message, setMessage } = useContext(AuthContext);
	return Message ? (
		<View style={styles.banner}>
			<Text style={styles.Message}>{Message}</Text>
			<Button onPress={() => setMessage(null)} style={styles.buttonClose}>
				<Icon name="close" size={20} />
			</Button>
		</View>
	) : null;
}

const styles = StyleSheet.create({
	banner: {
		position: 'absolute',
		top: '1%',
		left: '5%',
		right: 0,
		backgroundColor: 'rgba(0, 0, 255, 0.5)', // 50% transparent red
		padding: 10,
		zIndex: 1000,
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderRadius: 5,
		width: '90%',
		alignSelf: 'center',
	},
	Message: {
		color: 'white',
	},
	buttonClose: {
		backgroundColor: 'white',
		color: 'green',
		borderRadius: 5,
	},
});

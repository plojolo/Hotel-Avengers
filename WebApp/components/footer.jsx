import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Footer() {
	return (
		<View style={styles.footer}>
			<Text style={styles.footerText}>© 2024 Avengers Hotel</Text>
			<Icon name="gitlab" size={30} color="#000" onPress={() => Linking.openURL('https://etulab.univ-amu.fr/projet-finl3/hotel-avengers')} />
		</View>
	);
}

const styles = StyleSheet.create({
	footer: {
		height: '10%',
		width: '100%',
		backgroundColor: 'lightblue',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 10,
	},
	footerText: {
		color: '#000',
	},
});

import React, { useState, useEffect, useContext } from 'react';
import { Platform, FlatList, StyleSheet, Pressable, View, Button } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Item from '../../components/Item';
import { AuthContext } from '../../components/auths/AuthContext';

export default function ListHotels() {
	const [hotels, setHotels] = useState([]);
	const { ip, setError, isAdmin } = useContext(AuthContext);
	const isFocused = useIsFocused();

	useEffect(() => {
		const url = isAdmin ? 'getHotelWhereAdmin' : 'getAllHotel';
		fetch(`http://${ip}:2000/${url}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				setHotels(data);
			})
			.catch((error) => setError(error));
	}, [isFocused, isAdmin, ip, setError]);

	const navigation = useNavigation();
	console.log('hotels', hotels);
	return Platform.OS === 'web' ? (
		<>
			{isAdmin && <Button title="Add new hotel" onPress={() => navigation.navigate('Add new hotel')} />}
			<div style={styles.listItems}>
				{hotels.map((item) => (
					<Pressable
						key={item}
						onPress={() => {
							navigation.navigate('Hotel details', { item });
						}}>
						<Item item={item} type="Hotel" />
					</Pressable>
				))}
			</div>
		</>
	) : (
		<View style={styles.container}>
			{isAdmin && <Button title="Add new hotel" onPress={() => navigation.navigate('v')} />}
			<FlatList
				data={hotels}
				renderItem={({ item }) => (
					<Pressable
						style={styles.item}
						onPress={() => {
							navigation.navigate('DetailHotel', { item });
						}}>
						<Item item={item} type="Hotel" />
					</Pressable>
				)}
				key={hotels}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
	},
	item: {
		height: 200,
		width: '100%',
	},
	contentContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
	},
	listItems: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
});

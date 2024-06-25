import React, { useEffect, useState, useContext } from 'react';
import { Platform, FlatList, StyleSheet, Pressable, Button, TextInput, Text, View } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Item from '../../components/Item';
import { AuthContext } from '../../components/auths/AuthContext';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';

export default function ListRooms({ route, id }) {
	console.log('id', id);
	const { Id_Hotel } = route ? route.params : { Id_Hotel: id };
	const navigation = useNavigation();
	const { isAdmin, ip } = useContext(AuthContext);
	const [items, setItems] = useState([]);
	const [filteredItems, setFilteredItems] = useState([]);
	const [capacityFilter, setCapacityFilter] = useState('');
	const [priceFilter, setPriceFilter] = useState('');
	const [dateRange, setDateRange] = useState([null, null]);

	const fetchRooms = () => {
		fetch(`http://${ip}:2000/getRoomsInHotel/${Id_Hotel}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				data.forEach((room) => {
					room.Id_Hotel = Id_Hotel;
					if (room.Television == 'TRUE') room.Television = 'True';
					else room.Television = 'False';
					if (room.Phone == 'TRUE') room.Phone = 'True';
					else room.Phone = 'False';
				});

				setItems(data);
				setFilteredItems(data);
			})
			.catch((error) => console.error(error));
	};

	useEffect(() => {
		fetchRooms();
	}, [ip, Id_Hotel, useIsFocused()]);

	useEffect(() => {
		let filteredRooms = items;

		// Filter by price
		if (priceFilter) {
			filteredRooms = filteredRooms.filter((room) => room.PricePERNight >= priceFilter);
		}

		// Filter by capacity
		if (capacityFilter) {
			filteredRooms = filteredRooms.filter((room) => room.Capacity >= capacityFilter);
		}

		// Filter by date
		if (dateRange && dateRange.length === 2) {
			const [startDate, endDate] = dateRange;
			filteredRooms = filteredRooms.filter((room) => {
				return !room.Reservations.some((reservation) => {
					const reservationStartDate = new Date(reservation.CheckDateIn);
					const reservationEndDate = new Date(reservation.CheckDateOut);
					return (startDate >= reservationStartDate && startDate <= reservationEndDate) || (endDate >= reservationStartDate && endDate <= reservationEndDate);
				});
			});
		}

		setFilteredItems(filteredRooms);
	}, [capacityFilter, priceFilter, dateRange, items]);

	return Platform.OS === 'web' ? (
		<>
			{isAdmin && <Button title="Add new room" onPress={() => navigation.navigate('Add new room', { Id_Hotel })} />}
			<View style={styles.filterContainer}>
				<Text>Capacity</Text>
				<TextInput placeholder="" value={capacityFilter} onChangeText={setCapacityFilter} style={styles.input} />
				<Text>Price</Text>
				<TextInput placeholder="" value={priceFilter} onChangeText={setPriceFilter} style={styles.input} />
				<Text>Date</Text>
				<DateRangePicker onChange={setDateRange} value={dateRange} disableCalendar={true} />
			</View>
			<View style={styles.listItems}>
				{filteredItems.map((item) => (
					<Pressable key={item.Id_Room} onPress={() => navigation.navigate('Room details', { item })}>
						<Item item={item} type="Room" />
					</Pressable>
				))}
			</View>
		</>
	) : (
		<>
			{isAdmin && <Button title="Add new room" onPress={() => navigation.navigate('Add new room', { Id_Hotel })} />}
			<FlatList
				data={filteredItems}
				renderItem={({ item }) => (
					<Pressable onPress={() => navigation.navigate('DetailRoom', { item })}>
						<Item item={item} type="Room" />
					</Pressable>
				)}
				keyExtractor={(item) => item.Id_Room.toString()}
				style={styles.contentContainer}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	filterContainer: {
		padding: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 5,
		marginVertical: 5,
		borderRadius: 5,
	},
	listItems: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	contentContainer: {
		flex: 1,
		padding: 10,
	},
});

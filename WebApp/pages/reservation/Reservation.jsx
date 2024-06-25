import React, { useState, useContext, useEffect } from 'react';

import { View, Text, StyleSheet, Button, CheckBox } from 'react-native-web';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { format, isValid } from 'date-fns';
import { AuthContext } from '../../components/auths/AuthContext';
import { useNavigation } from '@react-navigation/native';

const Reservation = ({ route }) => {
	console.log(route.params.item);
	const { item: room } = route.params;
	const [dateRange, setDateRange] = useState([new Date(), new Date()]);
	const checkInDate = dateRange ? format(dateRange[0], 'yyyy-MM-dd') : '';
	const checkOutDate = dateRange ? format(dateRange[1], 'yyyy-MM-dd') : '';
	const { ip, port, setMessage, setError } = useContext(AuthContext);
	const [options, setOptions] = useState([]);
	const [numberOfPersons, setNumberOfPersons] = useState(1);
	const navagation = useNavigation();

	useEffect(() => {
		fetch(`http://${ip}${port}/getServiceFromHotel/${room.Id_Hotel}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				data.forEach((service) => {
					service.checked = false;
				});
				setOptions(data);
			})
			.catch((error) => console.error(error));
	}, []);

	const reserveRoom = async () => {
		console.log(room.PricePERNight);
		if (!isValid(dateRange[0]) || !isValid(dateRange[1])) {
			setError('Please select a valid date range');
			return;
		}
		try {
			const response = await fetch('http://' + ip + ':2000/createReservation', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					checkInDate,
					checkOutDate,
					roomId: room.Id_Room,
					Id_Hotel: room.Id_Hotel,
					Options: options.filter((option) => option.checked).map((option) => option.Name),
					NumberOfPersons: numberOfPersons,
				}),
			});
			if (response.ok) {
				setMessage('Room reserved successfully');
				navagation.navigate('Welcome');
			} else {
				setError('Failed to reserve room');
				navagation.goBack();
			}
		} catch (error) {
			console.error(error);
		}
	};
	return (
		<View style={{ padding: 20 }}>
			<Text style={{ fontSize: 20, marginBottom: 20 }}>Select Date Range</Text>
			<DateRangePicker onChange={setDateRange} value={dateRange} minDate={new Date()} />
			<View style={{ marginTop: 20 }}>
				<Text>Start Date: {dateRange ? dateRange[0].toDateString() : 'Not selected'}</Text>
				<Text>End Date: {dateRange ? dateRange[1].toDateString() : 'Not selected'}</Text>
			</View>
			<Text style={{ fontSize: 20, marginBottom: 20, marginTop: 20 }}>Number of Persons</Text>
			<input type="number" value={numberOfPersons} onChange={(e) => setNumberOfPersons(e.target.value)} />
			<Text style={{ fontSize: 20, marginBottom: 20 }}>Select Services</Text>
			{options.map((option) => (
				<View key={option.Name} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
					<CheckBox
						value={option.checked}
						onValueChange={() => {
							option.checked = !option.checked;
							setOptions([...options]);
						}}
					/>
					<Text>
						{option.Name} - {option.Price}€
					</Text>
				</View>
			))}
			<Button title="Reserve Room" onPress={reserveRoom} />
		</View>
	);
};

export default Reservation;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	calendarButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 4,
		alignItems: 'center',
		marginBottom: 16,
	},
	calendarButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	dateRangeText: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 16,
	},
});

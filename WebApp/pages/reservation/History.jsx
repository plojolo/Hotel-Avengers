import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../components/auths/AuthContext';
import { Text, Button, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Platform } from 'react-native-web';
import { useNavigation } from '@react-navigation/native';
import { set } from 'date-fns';

export default function History() {
	const { ip, setError, port, setPaiment, paiment } = useContext(AuthContext);
	const [history, setHistory] = useState([]);
	const [expandedReservations, setExpandedReservations] = useState({});
	const [checkInPressed, setCheckInPressed] = useState(false);
	const navigation = useNavigation();
	useEffect(() => {
		try {
			fetch(`http://${ip}${port}/getReservationFromClient`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			})
				.then((response) => response.json())
				.then((data) => {
					setHistory(data);
				})
				.catch((error) => {
					console.log(error);
					setError('Failed to get history');
				});
		} catch (error) {
			console.error(error);
			setError('Failed to get history');
		}
	}, [paiment]);

	const toggleReservation = (id) => {
		setExpandedReservations((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const checkIn = async (reservation) => {
		setPaiment({
			amount: reservation.totalCost,
			description: reservation.Id_Reservation,
		});
	};

	const cancel = async (reservation) => {
		try {
			const response = await fetch(`http://${ip}${port}/deleteReservation/${reservation.Id_Reservation}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			});
			if (response.ok) {
				setHistory(history.filter((r) => r.Id_Reservation !== reservation.Id_Reservation));
			} else {
				const error = await response.json();
				console.error(error);
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<ScrollView style={{ flex: 1, padding: 10 }}>
			<Button title="Change profile infos" onPress={() => navigation.navigate('Update info')} />
			{history.map((reservation) => (
				<TouchableOpacity key={reservation.Id_Reservation} style={styles.reservation} onPress={() => toggleReservation(reservation.Id_Reservation)}>
					<Text style={styles.boldText}>Reservation ID: {reservation.Id_Reservation}</Text>
					{expandedReservations[reservation.Id_Reservation] && (
						<>
							<Text>Hotel Name: {reservation.Name}</Text>
							<Text>City: {reservation.City}</Text>
							<Text>Address: {reservation.Address}</Text>
							<Text>Check In Date: {reservation.CheckDateIn}</Text>
							<Text>Check Out Date: {reservation.CheckDateOut}</Text>
							<Text>Exact Check In Time: {reservation.ExactCheckInTime}</Text>
							<Text>Accompanying Count: {reservation.AccompanyingCount}</Text>
							<Text>Duration: {reservation.Duration} days</Text>
							<Text>Total Cost: {reservation.totalCost} €</Text>
							<Text>Confirmed: {reservation.Confirmed === 'TRUE' ? 'Yes' : 'No'}</Text>
							<Text>Checked Out: {reservation.CheckedOut ? 'Yes' : 'No'}</Text>
							<Text>Phone: {reservation.Phone}</Text>
							<Text>Email: {reservation.Email}</Text>
							{reservation.Confirmed === 'FALSE' && (
								<>
									<Button style={styles.deleteButton} title="Pay now !" onPress={() => checkIn(reservation)} />
									<Button title="Cancel" onPress={() => cancel(reservation)} />
								</>
							)}
							{reservation.Confirmed === 'TRUE' && <Text style={styles.title}>Already paid</Text>}
						</>
					)}
				</TouchableOpacity>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		flex: 1,
	},
	reservation: {
		marginBottom: 16,
		padding: 10,
		borderRadius: 8,
		backgroundColor: '#f0f0f0',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.23,
		shadowRadius: 2.62,
		elevation: 4,
	},
	boldText: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 5,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
		color: 'blue',
	},
	deleteButton: {
		backgroundColor: '#ff0000',
		color: '#fff',
		marginTop: 10,
		padding: 10,
		borderRadius: 5,
	},
	text: {
		fontSize: 16,
		marginBottom: 5,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
});

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, Button, TextInput, CheckBox,ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../components/auths/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function DetailRoom({ route }) {
	const navigation = useNavigation();
	const { isAdmin, ip, port, isSignedIn } = useContext(AuthContext);
	const isAdding = route.params?.isAdding || false;

	const [item, setItem] = useState({
		Id_RoomType: route.params?.item?.Id_RoomType || '-1',
		Name: route.params?.item?.Name || '',
		Capacity: route.params?.item?.Capacity || '',
		Television: route.params?.item?.Television === 'True' ? true : false,
		Phone: route.params?.item?.Phone === 'True' ? true : false,
		PricePERNight: route.params?.item?.PricePERNight || '',
		Images: route.params?.item?.Images[0] || '',
		Id_Hotel: isAdding ? route.params?.Id_Hotel : route.params?.item?.Id_Hotel,
		Id_Room: route.params?.item?.Id_Room || '-1',
	});
	console.log(item);
	console.log(route.params?.item?.Television);
	const [RoomNumbers, setRoomNumbers] = useState(1);
	const [imageData, setImageData] = useState(null);
	const [image, setImage] = useState('');

	useEffect(() => {
		if (item.Images) {
			setImage({ uri: item.Images.ImagePath });
		}
	}, [item.Images]);

	const deleteRoom = (id) => {
		fetch(`http://${ip}:2000/deleteRoomType/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				navigation.goBack();
			})
			.catch((error) => console.error(error));
	};

	const saveNewData = async () => {
		try {
			if (!item.Name || !item.Capacity || !item.PricePERNight || (!item.Phone && !image)) {
				alert('Please fill all fields');
				return;
			}

			let url = isAdding ? `http://${ip}:2000/createRoomType` : `http://${ip}:2000/updateRoomType/${item.Id_RoomType}`;

			const response = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					Id_RoomType: item.Id_RoomType || null,
					Name: item.Name,
					Capacity: item.Capacity,
					Television: item.Television ? 'TRUE' : 'FALSE',
					Phone: item.Phone ? 'TRUE' : 'FALSE',
					PricePERNight: item.PricePERNight,
					Images: imageData || item.Images,
					RoomNumbers: RoomNumbers,
					Id_Hotel: item.Id_Hotel,
				}),
			});
			if (response.ok) {
				navigation.goBack();
			} else {
				const error = await response.json();
				console.error(error);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const selectImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			base64: true,
		});
		if (!result.canceled) {
			setImageData(result.assets[0]);
			setImage({ uri: result.assets[0].uri });
		}
	};

	return (
		<View style={{ flex: 1 }}>
			<ScrollView style={{ flex: 1, padding: 10 }}>
			{!isAdmin ? (
				<>
					<View>
						<Text style={styles.title}>{item.Name}</Text>
						<Image source={image} style={styles.image} />
						<Text>Price: {item.PricePERNight}$</Text>
						<Text>Capacity: {item.Capacity}</Text>
						<Text>Television: {item.Television ? 'Yes' : 'No'}</Text>
						<Text>Phone: {item.Phone}</Text>
					</View>
					<Text style={styles.subtitle}>Rooms</Text>
					{isSignedIn ? (
						<Button title="Reserve" onPress={() => navigation.navigate('Reservation', { item })} />
					) : (
						<Button title="Sign in to reserve" onPress={() => navigation.navigate('Sign In')} />
					)}
				</>
			) : (
				<>
					<View>
						<Text style={styles.title}>Room name:</Text>
						<TextInput style={styles.input} value={item.Name} onChangeText={(text) => setItem({ ...item, Name: text })} />
						<Image source={image} style={styles.image} />
						<Button title="Select Image" onPress={selectImage} />
						<Text>Price:</Text>
						<TextInput style={styles.input} value={item.PricePERNight} onChangeText={(text) => setItem({ ...item, PricePERNight: text })} />
						<Text>Capacity:</Text>
						<TextInput style={styles.input} value={item.Capacity} onChangeText={(text) => setItem({ ...item, Capacity: text })} />
						<Text>Phone:</Text>
						<CheckBox value={item.Phone} onValueChange={(value) => setItem({ ...item, Phone: value })} />
						<Text>Television:</Text>
						<CheckBox value={item.Television} onValueChange={(value) => setItem({ ...item, Television: value })} />
						{isAdding && (
							<>
								<Text style={styles.subtitle}>Number of Rooms:</Text>
								<TextInput
									style={styles.input}
									value={RoomNumbers.toString()}
									onChangeText={(text) => {
										const number = parseInt(text);
										if (isNaN(number)) {
											// Set to default value or display error
											setRoomNumbers(0);
										} else {
											setRoomNumbers(number);
										}
									}}
								/>
							</>
						)}
					</View>
					{!isAdding && <Button title="Delete" onPress={() => deleteRoom(item.Id_RoomType)} />}
					<Button title="Save" onPress={saveNewData} />
				</>
			)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 20,
		marginBottom: 10,
	},
	image: {
		width: '100%',
		height: 600,
		borderRadius: 10,
		marginBottom: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		marginBottom: 10,
		borderRadius: 5,
	},
});

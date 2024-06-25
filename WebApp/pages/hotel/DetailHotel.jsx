import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, Button, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../components/auths/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import ListRooms from '../room/ListRooms';

export default function DetailHotel({ route }) {
	const navigation = useNavigation();
	const [roomsType, setRoomsType] = useState([]);
	const { ip, setError, isAdmin } = useContext(AuthContext);
	const { isAdding } = route.params || false;
	const [item, setItem] = useState({
		Name: route.params?.item?.Name || '',
		City: route.params?.item?.City || '',
		Address: route.params?.item?.Address || '',
		Capacity: route.params?.item?.Capacity || '',
		Phone: route.params?.item?.Phone || '',
		Email: route.params?.item?.Email || '',
		Id_Hotel: route.params?.item?.Id_Hotel || '-1',
		Images: route.params?.item?.Images[0] || {},
		Options: [],
	});
	const [imageData, setImageData] = useState(null);
	const [image, setImage] = useState('');

	useEffect(() => {
		if (item.Images[0]) {
			setImage({ uri: item.Images[0].ImagePath });
		}
	}, [item.Images]);

	useEffect(() => {
		if (item.Id_Hotel !== '-1') {
			fetch(`http://${ip}:2000/getServiceFromHotel/${item.Id_Hotel}`, {
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
					setItem((prevItem) => ({ ...prevItem, Options: data }));
				})
				.catch((error) => console.error(error));
		}
	}, [ip, item.Id_Hotel]);

	const saveNewData = () => {
		if (Object.values(item).some((x) => x === '') || !image) {
			setError('Please fill all fields');
			return;
		}

		if (item.Options.some((option) => option.Name === '' || option.Price === '')) {
			setError('Please fill all fields');
			return;
		}

		const url = isAdding ? `http://${ip}:2000/createHotel` : `http://${ip}:2000/updateHotel/${item.Id_Hotel}`;
		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				...item,
				Images: imageData || item.Images,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				navigation.goBack();
			})
			.catch((error) => console.error(error));
	};

	const deleteHotel = (id) => {
		fetch(`http://${ip}:2000/deleteHotel/${id}`, {
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

	const selectImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			base64: true,
		});

		if (!result.canceled) {
			const selectedImage = result.assets[0];
			setImageData(selectedImage);
			setImage({ uri: selectedImage.uri });
		}
	};

	const addServiceInput = () => {
		const newService = {
			Id_Services: item.Options.length + 1,
			Name: 'New Service',
			Price: '0',
		};
		setItem((prevItem) => ({ ...prevItem, Options: [...prevItem.Options, newService] }));
	};

	return (
		<View style={{ flex: 1 }}>
			<ScrollView style={{ flex: 1, padding: 10 }}>
				{!isAdmin ? (
					<View style={styles.container}>
						<View>
							<Text style={styles.title}>{item.Name}</Text>
							<Image source={image} style={styles.image} />
							<Text>City: {item.City}</Text>
							<Text>Address: {item.Address}</Text>
							<Text>Capacity: {item.Capacity}</Text>
							<Text>Phone: {item.Phone}</Text>
							<Text>Email: {item.Email}</Text>
							<Text style={styles.title}>Services</Text>
							{item.Options.map((option) => (
								<Text key={option.Id_Services}>
									{option.Name} - {option.Price}€
								</Text>
							))}
						</View>
						<Text style={styles.title}>Rooms</Text>
						<ListRooms id={item.Id_Hotel} />
					</View>
				) : (
					<View style={styles.container}>
						<View>
							<Text style={styles.title}>Hotel name :</Text>
							<TextInput style={styles.input} value={item.Name} onChangeText={(text) => setItem({ ...item, Name: text })} />
							<Image source={image} style={styles.image} />
							<Button title="Change Image" onPress={selectImage} />
							<Text style={styles.title}>City :</Text>
							<TextInput style={styles.input} value={item.City} onChangeText={(text) => setItem({ ...item, City: text })} />
							<Text style={styles.title}>Address :</Text>
							<TextInput style={styles.input} value={item.Address} onChangeText={(text) => setItem({ ...item, Address: text })} />
							<Text style={styles.title}>Capacity :</Text>
							<TextInput style={styles.input} value={item.Capacity} onChangeText={(text) => setItem({ ...item, Capacity: text })} />
							<Text style={styles.title}>Contact :</Text>
							<TextInput style={styles.input} value={item.Phone} onChangeText={(text) => setItem({ ...item, Phone: text })} />
							<Text style={styles.title}>Email :</Text>
							<TextInput style={styles.input} value={item.Email} onChangeText={(text) => setItem({ ...item, Email: text })} />
							<Text style={styles.title}>Services</Text>
							{item.Options.map((option, index) => (
								<View key={index} style={styles.serviceContainer}>
									<TextInput
										style={styles.input}
										value={option.Name}
										onChangeText={(text) => {
											const updatedOptions = item.Options.map((opt, i) => (i === index ? { ...opt, Name: text } : opt));
											setItem({ ...item, Options: updatedOptions });
										}}
									/>
									<TextInput
										style={styles.input}
										value={option.Price}
										onChangeText={(text) => {
											const updatedOptions = item.Options.map((opt, i) => (i === index ? { ...opt, Price: text } : opt));
											setItem({ ...item, Options: updatedOptions });
										}}
									/>
									<Button title="Delete" onPress={() => setItem({ ...item, Options: item.Options.filter((_, i) => i !== index) })} color="#ff0000" style={styles.deleteButton} />
								</View>
							))}
							<Button title="Add Service" onPress={addServiceInput} />
						</View>
						<Text style={styles.title}>Rooms</Text>
						<Button title="View Rooms" onPress={() => navigation.navigate('List of rooms', { Id_Hotel: item.Id_Hotel })} />
						<Button title="Delete" onPress={() => deleteHotel(item.Id_Hotel)} color="#ff0000" style={styles.deleteButton} />
						<Button title="Save" onPress={saveNewData} />
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginVertical: 10,
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
		borderRadius: 5,
		marginVertical: 5,
	},
	serviceContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 5,
	},
	deleteButton: {
		backgroundColor: '#ff0000',
		color: '#fff',
	},
});

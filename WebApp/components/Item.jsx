import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

function Item({ item, type }) {
	//console.log('img : ' + img);
	if (type === 'Hotel') {
		img = item.Images[0][0].ImagePath;
		console.log('item');
		console.log(item);
		return (
			<View style={styles.item}>
				<Text style={styles.title}>{item.Name}</Text>
				<Image source={{ uri: img }} style={styles.img} />
				<Text>{item.City}</Text>
				<Text>{item.Address}</Text>
			</View>
		);
	} else if (type === 'Room') {
		img = item.Images[0].ImagePath;
		return (
			<View style={styles.item}>
				<Text style={styles.title}>{item.Name}</Text>
				<Image source={{ uri: img }} style={styles.img} />
				<Text>Capacity: {item.Capacity}</Text>
				<Text>Price Per Night: {item.PricePERNight}</Text>
			</View>
		);
	} else {
		return null;
	}
}

export default React.memo(Item);

const styles = StyleSheet.create({
	item: {
		flex: 1,
		margin: 10,
		padding: 10,
		minWidth: 170,
		maxWidth: 223,
		backgroundColor: '#CCC',
		borderRadius: 10,
	},
	img: {
		width: '100%',
		height: 100,
		marginVertical: 10,
	},
	title: {
		textAlign: 'center',
		fontWeight: 'bold',
	},
});

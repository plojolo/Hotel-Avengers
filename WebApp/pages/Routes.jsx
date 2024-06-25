import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Root = createStackNavigator();
import Signup from './account/Signup';
import Signin from './account/Signin';
import HomePage from './HomePage';
import ListHotels from './hotel/ListHotels';
import ListRooms from './room/ListRooms';
import DetailHotel from './hotel/DetailHotel';
import DetailRoom from './room/DetailRoom';
import { AuthContext } from '../components/auths/AuthContext';
import Reservation from './reservation/Reservation';
import History from './reservation/History';
import ForgotPassword from './account/ForgotPassword';
import UpdateInfo from './account/UpdateInfo';

const Routes = () => {
	const { isSignedIn, isAdmin } = useContext(AuthContext);
	const linking = {
		prefixes: ['http://localhost:8081', 'myapp://'],
		config: {
			screens: {
				ResetPassword: 'reset-password/:token',
			},
		},
	};
	return (
		<NavigationContainer linking={linking}>
			<Root.Navigator>
				<Root.Screen name="Welcome" component={HomePage} />
				<Root.Screen name="Hotel list" component={ListHotels} />
				<Root.Screen name="Hotel details" component={DetailHotel} />
				<Root.Screen name="List of rooms" component={ListRooms} />
				<Root.Screen name="Room details" component={DetailRoom} />
				<Root.Screen name="ResetPassword" component={ForgotPassword} />

				{!isSignedIn && (
					<>
						<Root.Screen name="Sign Up" component={Signup} />
						<Root.Screen name="Sign In" component={Signin} />
					</>
				)}

				{isSignedIn && (
					<>
						<Root.Screen name="Reservation" component={Reservation} />
						<Root.Screen name="My account" component={History} />
						<Root.Screen name="Update info" component={UpdateInfo} />
					</>
				)}

				{isAdmin && (
					<>
						<Root.Screen name="Add new hotel" component={DetailHotel} initialParams={{ isAdding: true }} />
						<Root.Screen name="Add new room" component={DetailRoom} initialParams={{ isAdding: true }} />
						<Root.Screen name="Modify hotel" component={DetailHotel} />
						<Root.Screen name="Modify room" component={DetailRoom} />
					</>
				)}
			</Root.Navigator>
		</NavigationContainer>
	);
};

export default Routes;

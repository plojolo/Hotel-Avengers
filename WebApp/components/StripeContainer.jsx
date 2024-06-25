import React, { useContext } from 'react';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { AuthContext } from './auths/AuthContext';
import { Button, View } from 'react-native-web';

const PUBLIC_KEY = 'pk_test_51PQgZCP0PLRGHpjCfvXBWkXlbm5zbar1av4fXtAtNjGWbkLqyHC2mIiXndicrreoArnTSCKaTRYSiF5Ta9iukd2M00a9JDzYQw';
const stripePromise = loadStripe(PUBLIC_KEY);

const StripeContainer = () => {
	const { paiment, setPaiment } = useContext(AuthContext);

	return paiment.amount > 0 ? (
		<View style={styles.popup}>
			<Elements stripe={stripePromise}>
				<CheckoutForm />
			</Elements>
			<Button title="Close" onPress={() => setPaiment({ amount: 0, description: '' })} />
		</View>
	) : null;
};

const styles = {
	popup: {
		position: 'absolute',
		zIndex: 1,
		backgroundColor: 'white',
		border: '1px solid black',
		borderRadius: '10px',
		padding: '10px',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: '50%',
	},
};

export default StripeContainer;

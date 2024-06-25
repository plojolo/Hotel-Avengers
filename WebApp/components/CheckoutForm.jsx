import { useState, useContext } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { View, Text, Button } from 'react-native';
import { AuthContext } from './auths/AuthContext';

const CheckoutForm = () => {
	const stripe = useStripe();
	const elements = useElements();
	const { ip, port, setError, setMessage, paiment, setPaiment } = useContext(AuthContext);
	const [paimentIntent, setPaimentIntent] = useState({});
	const handleSubmit = async (event) => {
		event.preventDefault();
		const { error, paymentMethod } = await stripe.createPaymentMethod({
			type: 'card',
			card: elements.getElement(CardElement),
		});

		if (!error) {
			console.log('Stripe 23 | token generated!', paymentMethod);

			try {
				console.log('Stripe 26 | paymentMethod.id', paymentMethod.id);
				const id = paymentMethod.id;
				const response = await fetch(`http://${ip}${port}/create-payment-intent`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
					body: JSON.stringify({ amount: paiment.amount * 100, id: id, description: paiment.description }),
				});

				if (response.ok) {
					const data = await response.json();
					setPaimentIntent(data);
					const { paymentIntent, error } = await stripe.confirmCardPayment(data.clientSecret, {
						payment_method: {
							card: elements.getElement(CardElement),
							billing_details: {
								name: 'John Doe',
							},
						},
					});

					if (paymentIntent) {
						setMessage('Payment successful');
					} else if (error) {
						setError('Payment failed');
					}
				}
			} catch (error) {
				console.error('Stripe 42 | error', error);
				setError('Payment failed');
				setPaiment({ amount: 0, description: '' });
			}
		}
	};

	return (
		<View>
			<Text style={{ fontSize: 20 }}>Amount: {paiment.amount} €</Text>
			<CardElement options={{ hidePostalCode: true }} />
			<Button title="Pay" onPress={handleSubmit} />
		</View>
	);
};

export default CheckoutForm;

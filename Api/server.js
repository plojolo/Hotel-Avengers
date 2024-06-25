const express = require('express');
const fs = require('fs');
const app = express();
const cookieParser = require('cookie-parser');
let model = require('./model');
let classList = require('./class.js');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const Mailjet = require('node-mailjet');
const bcrypt = require('bcrypt');
const { log } = require('console');
const { type } = require('os');
const saltRounds = 10; // Niveau de complexité du sel
const stripe = require('stripe')('sk_test_51PQgZCP0PLRGHpjCuiVyApO7yXNgAHgWCaN1mbZQC5jzTzNiGZns3SxcOYj1lfPYYELVV5NBrRO6wMiu9XHeWbM400C6PI5PFA');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

function generateImageName() {
	let password = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		password += characters[randomIndex];
	}
	return password;
}

// CORS settings
app.use(
	cors({
		origin: 'http://localhost:8081', // replace with the domain of your front-end, if it's different
		methods: ['GET', 'POST', 'DELETE'],
		credentials: true, // this allows session cookies to be sent with requests
	})
);

function generateSecretKey() {
	return crypto.randomBytes(64).toString('hex');
}

// Session settings
app.use(
	session({
		secret: generateSecretKey(),
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false,
			httpOnly: true,
			maxAge: 60 * 60 * 60 * 60 * 24,
		},
		name: 'connect', // default name for the session cookie
	})
);

app.use(function (req, res, next) {
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8081');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});

const mailjet = new Mailjet({
	apiKey: '8b9feb51c17e846b1faa00eaf73547f2',
	apiSecret: '97725bed47554b7b74176e45996e75e1',
});

async function isAdminFromHotel(req, res, next) {
	try {
		const isAdmin = await model.isAdminFromHotel(await getEmailSession(req), req.body.name);
		if (isAdmin) next();
		else res.json({ error: 'Insufficient privileges: Admin access required' });
	} catch (error) {
		res.json({ error: 'Permission denied: No Admin rights' });
	}
}

function isConnect(req, res, next) {
	try {
		const cookieStatus = req.cookies.status;
		if (cookieStatus == 'Connected') next();
		else res.json({ Message: 'User not authenticated: Please log in' });
	} catch (error) {
		res.json({ Message: 'Permission denied: No Admin rights' });
		return false;
	}
}

async function getEmailSession(req, res) {
	let sid_id = req.cookies.sid;
	const sid = await model.checkSessionBySid(sid_id);
	const session_info = await model.getSessionEmail(sid.sid);
	const email = session_info.sess;
	return email;
}

// DEFAULT
app.get('/', async (req, res) => {
	res.json({ message: 'Welcome to the Avengers Hotel' });
});

// LOGIN
app.post('/login', async (req, res) => {
	const { password, email } = req.body;

	try {
		const idClient = await model.checkUserByEmail(email);
		if (!idClient) {
			return res.status(401).json({ error: 'Wrong credentials' });
		}
		const client = await model.getClientById(await model.getClientIdByEmail(email));

		const isPasswordValid = (await bcrypt.compare(password, client.Password)) || client.Password == password;
		if (isPasswordValid) {
			res.cookie('status', 'Connected', {
				httpOnly: true,
			});
			res.cookie('sid', req.sessionID, {
				httpOnly: true,
			});
			const admin = await model.isAdmin(email);
			await model.createSession(req.sessionID, req.session.cookie._expires, email);
			res.status(200).json({ message: 'Authentication successful', isAdmin: admin });
		} else {
			res.status(401).json({ error: 'Wrong credentials' });
		}
	} catch (error) {
		console.error('Error during login:', error);
		res.status(500).json({ error: 'An error has occurred during login' });
	}
});

// LOGOUT
app.post('/logout', async (req, res) => {
	res.clearCookie('status');
	res.clearCookie('email');
	res.clearCookie('sid');
	res.clearCookie('connect.sid', { path: '/' });

	req.session.destroy((err) => {});
	res.status(200).json({ message: 'Logout réussie' });
});

// Stripe
app.post('/create-payment-intent', async (req, res) => {
	const { amount, id, description } = req.body;

	// Check if id is a string
	if (typeof id !== 'string') {
		return res.status(400).json({ error: 'Invalid payment method ID' });
	}

	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount,
			currency: 'EUR',
			description: description,
			automatic_payment_methods: {
				enabled: true,
				allow_redirects: 'never',
			},
			payment_method: id,
		});

		await model.checkIn(description, 'TRUE');

		res.status(200).json({
			clientSecret: paymentIntent.client_secret,
			message: 'Payment intent created successfully',
		});
	} catch (error) {
		console.error('Error creating payment intent:', error);
		res.status(500).json({ error: 'Failed to create payment intent' });
	}
});

// CREATE

//      CLIENT
app.post('/new_client', async (req, res) => {
	const { address, phone, password, email, firstName, lastName, admin } = req.body;

	if (!(await model.validEmail(email))) {
		return res.status(510).json({ error: 'e-mail adress is not valid' });
	}

	try {
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		var client = new classList.User(address, phone, hashedPassword, email, 'BASIC', firstName, lastName);

		if (admin) {
			const idUser = await model.createEmployee(client);
			const idHotel = await model.createHotel(new classList.Hotel('HotelNoName', 'not completed', 'not completed', -1, 1234567890, 'HotelNoName@HotelNoName.com'));
			await model.assignEmployeeToHotel(idHotel, idUser, 'TRUE');

			const imagePath = 'http://localhost:2000/image/HotelNoName.jpeg';
			const imageID = await model.createImage(imagePath);
			const imageHotel = new classList.ImageHotel(idHotel, imageID);
			await model.insertHotelImage(imageHotel);
		} else {
			await model.createClient(client);
		}
		res.cookie('status', 'Connected', {
			httpOnly: true,
		});
		res.cookie('sid', req.sessionID, {
			httpOnly: true,
		});
		await model.createSession(req.sessionID, req.session.cookie._expires, email);
		res.status(200).json({ Message: 'Client successfully created', isAdmin: 'TRUE' });
	} catch (error) {
		console.error('Error while creating new client :', error);
		res.status(501).json({ error: 'An error has occured while creating a new client' });
	}
});

//      HOTEL
app.post('/createHotel', async (req, res) => {
	try {
		const { Name, Address, City, Capacity, Phone, Email, Images, Options } = req.body;

		// Validation des entrées
		if (!Name || !Address || !City || !Capacity || !Phone || !Email || !Images || !Images.base64 || !Images.mimeType) {
			return res.status(400).json({ error: 'All information is required' });
		}

		if (!(await model.validNameHotel(Name))) {
			return res.status(409).json({ error: 'Hotel name already taken' });
		}

		// Création de l'hôtel
		const hotel = new classList.Hotel(Name, City, Address, Capacity, Phone, Email);
		const hotel_ID = await model.createHotel(hotel);

		if (Images.mimeType) {
			const fileNameEnding = req.body.Images.mimeType.split('/');

			const nameImage = generateImageName();
			const path = 'public/image/' + nameImage + '.' + fileNameEnding[1];
			const bddPath = 'http://localhost:2000/image/' + nameImage + '.' + fileNameEnding[1];

			const buffer = Buffer.from(req.body.Images.base64, 'base64');
			fs.writeFileSync(path, buffer);

			const imageID = await model.createImage(bddPath);
			const imageHotel = new classList.ImageHotel(hotel_ID, imageID);
			await model.insertHotelImage(imageHotel);
		}

		for (const service of Options) {
			const serviceNew = new classList.Services(service.Name, service.Price);
			const Id_Service = await model.createServices(serviceNew);
			model.addHotelService(hotel_ID, Id_Service);
		}

		const UserId = await model.getClientIdByEmail(await getEmailSession(req, res));
		await model.assignEmployeeToHotel(hotel_ID, UserId, 'TRUE');

		res.status(200).json({ Message: 'Hotel successfully created' });
	} catch (error) {
		console.error('Error while creating new hotel :', error);
		res.status(500).json({ error: 'An error occurred while creating a hotel' });
	}
});

app.post('/createRoomType', async (req, res) => {
	try {
		const { Name, Capacity, Television, Phone, PricePERNight, RoomNumbers, Images, Id_Hotel } = req.body;

		// Checking entries
		if (!Name || !Capacity || !Phone || !PricePERNight || !RoomNumbers || !Images || !Images.base64) {
			return res.status(400).json({ error: 'All information is required' });
		}

		const roomType = new classList.RoomType(Name, Capacity, Television, Phone, PricePERNight);
		const roomTypeId = await model.createRoomType(roomType);

		if (Images.mimeType) {
			const fileNameEnding = req.body.Images.mimeType.split('/');

			const nameImage = generateImageName();
			const path = 'public/image/' + nameImage + '.' + fileNameEnding[1];
			const bddPath = 'http://localhost:2000/image/' + nameImage + '.' + fileNameEnding[1];

			const buffer = Buffer.from(req.body.Images.base64, 'base64');
			fs.writeFileSync(path, buffer);

			const imageID = await model.createImage(bddPath);
			const imageHotel = new classList.ImageRoom(roomTypeId, imageID);
			await model.insertRoomTypeImage(imageHotel);
		}

		const roomBase = new classList.Room('TRUE');

		const createRoomsPromises = [];
		for (let i = 1; i <= RoomNumbers; i++) {
			createRoomsPromises.push(
				(async () => {
					const roomId = await model.createRoom(roomBase);
					const linkRoomTypeRoom1 = new classList.RoomHotel(Id_Hotel, roomTypeId, roomId);
					await model.associateRoomHotelType(linkRoomTypeRoom1);
				})()
			);
		}
		await Promise.all(createRoomsPromises);

		res.status(200).json({ Message: 'Room Type successfully' });
	} catch (error) {
		console.error('Error while creating un room type :', error);
		res.status(500).json({ error: 'An error occurred while creating a room type' });
	}
});

//      BILLING + Hotel name + Client email
app.post('/createBilling', async (req, res) => {
	try {
		const total = req.body.total;
		const paid = req.body.paid;
		const roomTotalCost = req.body.roomTotalCost;
		const serviceTotalCost = req.body.serviceTotalCost;
		var billing = classList.Billing(total, paid, roomTotalCost, serviceTotalCost);
		const Id_Billing = await model.createBilling(billing);
		res.status(501).json({ error: 'Error while inserting into the Billing table' });

		const nameHotel = req.body.nameHotel;
		const hotelId = await model.getHotelIdFromName(nameHotel);
		if (!hotelId) res.status(501).json({ error: 'Error : cannot find hotel' });

		const clientEmail = req.body.clientEmail;
		const clientId = await model.getClientIdByEmail(clientEmail);
		if (!clientId) res.status(501).json({ error: 'Error : cannot find client' });

		const reservationId = req.body.reservationId;
		const clientbilling = classList.ClientBilling(Id_Billing, reservationId, hotelId, clientId);
		await model.assignememtClientBillingHotel(clientbilling);
		res.status(200).json({ Message: 'Billing successfully created' });
	} catch (error) {
		console.error('Error while creating billing', error);
		res.status(501).json({ error: 'An error occurred while creating the new billing' });
	}
});

//      SERVICES + Hotel Name
app.post('/createService', async (req, res) => {
	try {
		const name = req.body.name;
		const price = req.body.price;
		var service = classList.Services(name, price);
		const serviceId = await model.createServices(service);
		if (!serviceId) res.status(501).json({ error: 'Error while inserting into the Services table' });

		const nameHotel = req.body.nameHotel;
		const hotelId = await model.getHotelIdFromName(nameHotel);
		if (!hotelId) res.status(501).json({ error: 'Hotel not found' });

		var hotelService = classList.HotelServices(hotelId, serviceId);
		await model.assignementServiceHotel(hotelService);
		res.status(200).json({ Message: 'Service created successfully' });
	} catch (error) {
		console.error('Error while creating a Service', error);
		res.status(501).json({ error: 'An error occurred while creating a Service' });
	}
});

//      RESERVATION + Hotel Name + Room Id
app.post('/createReservation', isConnect, async (req, res) => {
	try {
		const { checkInDate, checkOutDate, roomId, Id_Hotel, Options, NumberOfPersons } = req.body;

		// Calculer la durée du séjour
		const duration = (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24) + 1;

		// Créer l'objet réservation
		const reservation = {
			CheckDateIn: checkInDate,
			CheckDateOut: checkOutDate,
			ExactCheckInTime: 'not checked in',
			AccompanyingCount: NumberOfPersons,
			Duration: duration,
			Confirmed: 'FALSE',
			CheckedOut: 'FALSE',
			CreatorID: await model.getClientIdByEmail(await getEmailSession(req, res)),
		};

		// Créer la réservation
		const reservationId = model.createReservation(reservation);

		// Créer l'objet clientReservation
		const clientReservation = {
			Id_Hotel: Id_Hotel,
			Id_Room: roomId,
			Id_Reservation: reservationId,
			Id_UserInfo: await model.getClientIdByEmail(await getEmailSession(req, res)),
		};

		// Ajouter la réservation du client
		await model.createUserReservation(clientReservation);

		// Obtenir les IDs des services
		const serviceIds = await model.getServiceIdsByName(Options);

		// Ajouter les services à la réservation
		if (serviceIds && serviceIds.length > 0) {
			model.createReservationServices(reservationId, serviceIds);
		}

		res.status(201).json({ message: 'Reservation created successfully', reservationId: reservationId });
	} catch (error) {
		console.error('Error creating reservation:', error);
		res.status(500).json({ error: 'An error occurred while creating the reservation' });
	}
});

// GET ALL
// CLIENT
app.get('/getAllClient', async (req, res) => {
	try {
		const clients = await model.getClients();
		res.json(clients);
	} catch (error) {
		console.error('Error retrieving clients:', error);
		res.status(500).json({ error: 'An error occurred while retrieving clients' });
	}
});

app.get('/getUserInfo', async (req, res) => {
	try {
		const email = await getEmailSession(req, res);
		const client = await model.getClientById(await model.getClientIdByEmail(email));
		res.json(client);
	} catch (error) {
		console.error('Error retrieving the client:', error);
		res.status(500).json({ error: 'An error occurred while retrieving the client' });
	}
});

// HOTEL
app.get('/getAllHotel', async (req, res) => {
	try {
		const hotels = await model.getHotels();
		for (let hotel of hotels) {
			const imagesId = await model.getImagesForHotel(hotel.Id_Hotel);
			hotel.Images = [];
			for (let imageId of imagesId) {
				const image = await model.getImageById(imageId.Id_Images);
				hotel.Images.push(image);
			}
		}
		res.json(hotels);
	} catch (error) {
		console.error('Error getting Hotels:', error);
		res.status(501).json({ error: 'An error occurred while getting Hotels' });
	}
});

app.get('/getHotelWhereAdmin', async (req, res) => {
	try {
		const email = await getEmailSession(req, res);
		const userId = await model.getClientIdByEmail(email);
		const hotels = await model.getHotelsByAdmin(userId);
		for (let hotel of hotels) {
			const imagesId = await model.getImagesForHotel(hotel.Id_Hotel);
			hotel.Images = [];
			for (let imageId of imagesId) {
				const image = await model.getImageById(imageId.Id_Images);
				hotel.Images.push(image);
			}
		}
		res.json(hotels);
	} catch (error) {
		console.error('Error while getting Hotel:', error);
		res.status(501).json({ error: 'An error occurred while getting Hotel' });
	}
});

// GET FROM HOTEL starting from the hotel's name

// RESERVATION
app.get('/getReservationFromHotel/:id', async (req, res) => {
	try {
		const hotelName = req.params.id;
		const reservation = await model.getReservationFromHotel(hotelName);
		res.json(reservation);
	} catch (error) {
		console.error('Error selecting reservations from the hotel', error);
		res.status(501).json({ error: 'An error occurred while selecting reservations from the hotel' });
	}
});

// ROOM AVAILABLE
app.get('/getAvailableRoomFromHotel/:id', async (req, res) => {
	try {
		const hotelName = req.params.id;
		const roomAvailable = await model.getAvailableRoomsInHotel(hotelName);
		res.json(roomAvailable);
	} catch (error) {
		console.error('Error selecting available rooms from the hotel', error);
		res.status(501).json({ error: 'An error occurred while selecting available rooms from the hotel' });
	}
});

app.get('/getRoomsInHotel/:id', async (req, res) => {
	try {
		const hotelId = req.params.id;
		const rooms = await model.getRoomsInHotel(hotelId);
		const roomsReservation = await model.getRoomReservationsByHotel(hotelId);

		const data = [];

		for (const room of rooms) {
			const roomTypes = await model.getRoomTypeById(room.Id_RoomType);
			if (!roomTypes) {
				continue;
			}

			const imagesId = await model.getImagesForRoom(room.Id_RoomType);
			const images = [];

			for (const imageId of imagesId) {
				const imagePath = await model.getImageById(imageId.Id_Images);
				if (imagePath && imagePath.length > 0) {
					images.push({
						Id_Images: imageId.Id_Images,
						ImagePath: imagePath[0].ImagePath,
					});
				}
			}

			const combinedData = {
				...roomTypes,
				Images: images,
				Id_Room: room.Id_Room,
			};

			// Find the reservation data for this room
			const reservationData = roomsReservation.find((roomRes) => roomRes.Id_Room === room.Id_Room);
			combinedData.Reservations = reservationData
				? reservationData.Reservations.map((reservation) => ({
						CheckDateIn: reservation.CheckDateIn,
						CheckDateOut: reservation.CheckDateOut,
				  }))
				: [];

			data.push(combinedData);
		}
		res.json(data);
	} catch (error) {
		console.error(error);
		res.status(501).json({ error: 'An error occurec while selecting room' });
	}
});

// SERVICE DE L'HOTEL
app.get('/getServiceFromHotel/:id', async (req, res) => {
	try {
		const hotelName = req.params.id;
		const services = await model.getServicesFromHotel(hotelName);
		res.json(services);
	} catch (error) {
		console.error('Error selecting available services from the hotel:', error); // Function name in French: getServicesFromHotel
		res.status(501).json({ error: 'An error occurred while selecting available services from the hotel' });
	}
});

// GET FROM CLIENT from client's email

// RESERVATION
app.get('/getReservationFromClient', isConnect, async (req, res) => {
	try {
		const reservations = await model.getReservationFromClient(await getEmailSession(req, res));
		const mergedReservations = [];
		for (let reservation of reservations) {
			const reservationCost = await model.calculateReservationCost(reservation.Id_Reservation);

			const mergedReservation = {
				...reservation,
				...reservationCost,
			};
			mergedReservations.push(mergedReservation);
		}
		res.json(mergedReservations);
	} catch (error) {
		console.error('Error selecting client reservations:', error); // Function name in French: getReservationFromClient
		res.status(501).json({ error: 'An error occurred while selecting client reservations' });
	}
});

app.post('/checkIn/:id', isConnect, async (req, res) => {
	try {
		const reservation = await model.checkIn(req.params.id, 'TRUE');
		res.status(200).json({ error: 'Check-in paid' });
	} catch (error) {
		console.error('Error selecting client reservations:', error); // Function name in French: checkIn
		res.status(501).json({ error: 'An error occurred while selecting client reservations' });
	}
});

// DELETE

// Route to delete a hotel
app.delete('/deleteHotel/:id', async (req, res) => {
	try {
		const hotelId = req.params.id;
		model.deleteHotel(hotelId);
		res.status(200).json({ message: 'Hotel deleted successfully' });
	} catch (error) {
		console.error('Error deleting hotel:', error); // Function name in French: deleteHotel
		res.status(500).json({ error: 'An error occurred while deleting the hotel' });
	}
});

// Route to delete a user
app.delete('/deleteUserInfo/:id', async (req, res) => {
	try {
		const userId = req.params.id;
		await model.deleteUserInfo(userId);
		res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('Error deleting user:', error); // Function name in French: deleteUserInfo
		res.status(500).json({ error: 'An error occurred while deleting the user' });
	}
});

// Route to delete a room type
app.delete('/deleteRoomType/:id', async (req, res) => {
	try {
		const roomTypeId = req.params.id;
		await model.deleteRoomType(roomTypeId);
		res.status(200).json({ message: 'Room type deleted successfully' });
	} catch (error) {
		console.error('Error deleting room type:', error); // Function name in French: deleteRoomType
		res.status(500).json({ error: 'An error occurred while deleting the room type' });
	}
});

// Route to delete a room
app.delete('/deleteRoom/:id', async (req, res) => {
	try {
		const roomId = req.params.id;
		await model.deleteRoom(roomId);
		res.status(200).json({ message: 'Room deleted successfully' });
	} catch (error) {
		console.error('Error deleting room:', error); // Function name in French: deleteRoom
		res.status(500).json({ error: 'An error occurred while deleting the room' });
	}
});

// Route to delete a reservation
app.delete('/deleteReservation/:id', async (req, res) => {
	try {
		const reservationId = req.params.id;
		model.deleteReservation(reservationId);
		res.status(200).json({ message: 'Reservation deleted successfully' });
	} catch (error) {
		console.error('Error deleting reservation:', error); // Function name in French: deleteReservation
		res.status(500).json({ error: 'An error occurred while deleting the reservation' });
	}
});

// Route to delete a service
app.delete('/deleteService/:id', async (req, res) => {
	try {
		const serviceId = req.params.id;
		await model.deleteService(serviceId);
		res.status(200).json({ message: 'Service deleted successfully' });
	} catch (error) {
		console.error('Error deleting service:', error); // Function name in French: deleteService
		res.status(500).json({ error: 'An error occurred while deleting the service' });
	}
});

// Route to delete a bill
app.delete('/deleteBilling/:id', async (req, res) => {
	try {
		const billingId = req.params.id;
		await model.deleteBilling(billingId);
		res.status(200).json({ message: 'Bill deleted successfully' });
	} catch (error) {
		console.error('Error deleting the bill:', error);
		res.status(500).json({ error: 'An error occurred while deleting the bill' });
	}
});

// Route to delete a statistic
app.delete('/deleteStatistic/:id', async (req, res) => {
	try {
		const statisticId = req.params.id;
		await model.deleteStatistic(statisticId);
		res.status(200).json({ message: 'Statistic deleted successfully' });
	} catch (error) {
		console.error('Error deleting the statistic:', error);
		res.status(500).json({ error: 'An error occurred while deleting the statistic' });
	}
});

// Route to delete an image
app.delete('/deleteImage/:id', async (req, res) => {
	try {
		const imageId = req.params.id;
		await model.deleteImage(imageId);
		res.status(200).json({ message: 'Image deleted successfully' });
	} catch (error) {
		console.error('Error deleting the image:', error);
		res.status(500).json({ error: 'An error occurred while deleting the image' });
	}
});

// UPDATE

// Route for updating hotel details
app.post('/updateHotel/:id', async (req, res) => {
	try {
		const { Name, Address, City, Capacity, Phone, Email, Options } = req.body;

		const oldHotel = await model.getHotelById(req.params.id);
		if (!oldHotel) {
			return res.status(404).json({ error: 'The specified hotel does not exist' });
		}

		const changes = {
			Name: Name || oldHotel.Name,
			Address: Address || oldHotel.Address,
			City: City || oldHotel.City,
			Capacity: Capacity || oldHotel.Capacity,
			Phone: Phone || oldHotel.Phone,
			Email: Email || oldHotel.Email,
		};

		const updatedHotel = new classList.Hotel(changes.Name, changes.City, changes.Address, changes.Capacity, changes.Phone, changes.Email);
		await model.updateHotel(updatedHotel, req.params.id);

		if (req.body.Images.mimeType) {
			model.deleteHotelImage(req.params.id);
			const terminaison = req.body.Images.mimeType.split('/');

			const nameImage = generateImageName();
			const path = 'public/image/' + nameImage + '.' + terminaison[1];
			const bddPath = 'http://localhost:2000/image/' + nameImage + '.' + terminaison[1];

			const buffer = Buffer.from(req.body.Images.base64, 'base64');
			fs.writeFileSync(path, buffer);

			const imageID = await model.createImage(bddPath);
			const imageHotel = new classList.ImageHotel(req.params.id, imageID);
			await model.insertHotelImage(imageHotel);
		}

		// Get existing services for this hotel
		const existingServices = await model.getServicesByHotelId(req.params.id);

		for (const service of existingServices) {
			model.deleteService(service.Id_Services);
		}

		for (const service of Options) {
			const serviceNew = new classList.Services(service.Name, service.Price);
			const Id_Service = await model.createServices(serviceNew);
			model.addHotelService(req.params.id, Id_Service);
		}

		res.status(200).json({ message: 'Hotel updated successfully' });
	} catch (error) {
		console.error('Error updating the hotel', error);
		res.status(500).json({ error: 'An error occurred while updating the hotel' });
	}
});

// Route for updating room type details
app.post('/updateRoomType/:id', async (req, res) => {
	try {
		const { Name, Capacity, Television, Phone, PricePERNight, Images } = req.body;
		const roomType = await model.getRoomTypeById(req.params.id);
		if (!roomType) {
			return res.status(404).json({ error: 'No room type associated with this ID' });
		}

		if (Images.mimeType) {
			model.deleteRoomTypeImage(req.params.id);
			const terminaison = req.body.Images.mimeType.split('/');

			const nameImage = generateImageName();
			const path = 'public/image/' + nameImage + '.' + terminaison[1];
			const bddPath = 'http://localhost:2000/image/' + nameImage + '.' + terminaison[1];

			const buffer = Buffer.from(req.body.Images.base64, 'base64');
			fs.writeFileSync(path, buffer);

			const imageID = await model.createImage(bddPath);
			const imageHotel = new classList.ImageRoom(req.params.id, imageID);
			await model.insertRoomTypeImage(imageHotel);
		}

		const changes = {
			Name: Name || roomType.Name,
			Capacity: Capacity || roomType.Capacity,
			Television: Television || roomType.Television,
			Phone: Phone || roomType.Phone,
			PricePerNight: PricePERNight || roomType.PricePERNight,
		};

		const updatedRoomType = new classList.RoomType(changes.Name, changes.Capacity, changes.Television, changes.Phone, changes.PricePerNight);

		await model.updateRoomType(updatedRoomType, req.params.id);
		res.status(200).json({ message: 'Room type modification successful' });
	} catch (error) {
		console.error('Error updating the room type', error);
		res.status(500).json({ error: 'An error occurred while updating the room type' });
	}
});

app.post('/updateUserInfo', async (req, res) => {
	try {
		const { Adress, Phone, Password, Email, FirstName, LastName, FidelityLevel, NewPassword } = req.body;

		const userId = await model.getClientIdByEmail(await getEmailSession(req, res));
		if (!userId) {
			res.status(404).json({ error: 'User not found' });
		}
		const user = await model.getClientById(userId);

		const isPasswordValid = (await bcrypt.compare(Password, user.Password)) || user.Password == Password;
		if (!isPasswordValid) {
			res.status(401).json({ error: 'Wrong credentials' });
		}

		const changes = {
			Adress: Adress || user.Address,
			Phone: Phone || user.Phone,

			FidelityLevel: FidelityLevel || user.FidelityLevel,
			Email: Email || user.Email,
			FirstName: FirstName || user.FirstName,
			LastName: LastName || user.LastName,
		};

		const updatedUser = new classList.UserInfo(changes.Adress, changes.Phone, changes.Password, changes.Email, changes.FidelityLevel, changes.FirstName, changes.LastName);

		if (NewPassword) {
			const hashedPassword = await bcrypt.hash(NewPassword, saltRounds);
			await model.changePassword(hashedPassword, userId);
		}

		await model.updateClient(updatedUser, userId);
		res.status(200).json({ message: 'User update succesfull' });
	} catch (error) {
		console.error('An error occurred while updating the User info', error);
		res.status(500).json({ error: 'An error occurred while updating the User info' });
	}
});

app.post('/searchRooms', async (req, res) => {
	try {
		const { checkInDate, checkOutDate, roomTypeId, hotelId } = req.body;
		const availableRoomIds = await model.getAvailableRoomsForHotel(hotelId, checkInDate, checkOutDate);

		if (roomTypeId) {
			const filteredRoomIds = availableRoomIds.filter((roomId) => model.getRoomTypeForRoom(roomId) === roomTypeId);
			res.json(filteredRoomIds);
		} else {
			res.json(availableRoomIds);
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'An error occurred while searching for rooms' });
	}
});

// LOST PASSWORD / FORGOTTEN PASSWORD

app.post('/forgot-password', async (req, res) => {
	const { email } = req.body;
	const user = await model.checkUserByEmail(email);

	if (!user) {
		return res.status(400).json({ error: 'User not found' });
	}

	const idUser = await model.getClientIdByEmail(email);
	const token = crypto.randomBytes(32).toString('hex');
	await model.createPasswordTicket(idUser, token, Date.now() + 3600000); // 1 heure

	const userInfo = await model.getClientById(idUser);

	const request = mailjet.post('send', { version: 'v3.1' }).request({
		Messages: [
			{
				From: {
					Email: 'Avengers.Hotel@gmail.com',
					Name: 'hotelAvengers.com13',
				},
				To: [
					{
						Email: userInfo.Email,
						Name: userInfo.FirstName,
					},
				],
				Subject: 'Password Reset',
				TextPart: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/reset-password/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
			},
		],
	});

	request
		.then(() => {
			res.status(200).json({ message: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
		})
		.catch((err) => {
			console.error('There was an error: ', err);
			res.status(500).json({ error: 'An error occurred while sending the email' });
		});
});

app.get('/reset-password/:token', async (req, res) => {
	const user = await model.findPasswordTicket(req.params.token);

	if (!user) {
		return res.status(400).send('Password reset token is invalid or has expired.');
	}

	const redirectUrl = `http://localhost:8081/reset-password/${req.params.token}`;

	res.redirect(redirectUrl);
});

app.post('/reset-password/:token', async (req, res) => {
	const user = await model.findPasswordTicket(req.params.token);

	if (!user) {
		return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
	}
	const { password } = req.body;
	const hashedPassword = await bcrypt.hash(password, saltRounds);
	await model.changePassword(hashedPassword, user.Id_UserInfo);
	await model.deletePasswordTicket(user.Id_UserInfo);

	res.status(200).json({ message: 'Password reset successful' });
});

app.listen(2000, () => console.log('listening on http://localhost:2000'));

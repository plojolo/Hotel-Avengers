const Sqlite = require('better-sqlite3');
const db = new Sqlite('hotel-management.db');

function executeQuery(query, params) {
	return new Promise((resolve, reject) => {
		try {
			const stmt = db.prepare(query);
			const result = stmt.all(params);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

function executeQueryRun(query, params) {
	return new Promise((resolve, reject) => {
		try {
			const stmt = db.prepare(query);
			const result = stmt.run(params);
			resolve(result);
		} catch (error) {
			reject(error);
		}
	});
}

function executeQueryWithResult(query, params = []) {
	return new Promise((resolve, reject) => {
		try {
			const statement = db.prepare(query);
			const rows = statement.all(params); // Utilisez all() pour récupérer tous les résultats
			resolve(rows);
		} catch (error) {
			reject(error);
		}
	});
}

//HOTEL FUNCTIONS --------------------------------------------------------

// Create a new hotel
exports.createHotel = async function (hotel) {
	const query = 'INSERT INTO Hotel (Name, City, Address, Capacity, Phone, Email) VALUES (?, ?, ?, ?, ?, ?)';
	const result = await executeQueryRun(query, [hotel.name, hotel.city, hotel.address, hotel.capacity, hotel.phone, hotel.email]);
	return result.lastInsertRowid;
};

// Get all hotels
exports.getHotels = async function () {
	const query = 'SELECT * FROM Hotel';
	const hotels = await executeQueryWithResult(query);
	return hotels;
};

// Get a hotel by ID
exports.getHotelById = async function (Id_Hotel) {
	const query = 'SELECT * FROM Hotel WHERE Id_Hotel = ?';
	const hotel = await executeQuery(query, [Id_Hotel]);
	return hotel[0];
};

exports.getHotelByName = async function (name) {
	const query = 'SELECT * FROM Hotel WHERE Name = ?';
	const hotel = await executeQueryWithResult(query, [name]);
	return hotel[0];
};

// Update a hotel
exports.updateHotel = async function (hotel, hotelId) {
	const query = 'UPDATE Hotel SET Name = ?, City = ?, Address = ?, Capacity = ?, Phone = ?, Email = ? WHERE Id_Hotel = ?';
	const result = await executeQueryRun(query, [hotel.name, hotel.city, hotel.address, hotel.capacity, hotel.phone, hotel.email, hotelId]);
	return result.changes;
};

// Delete a hotel
exports.deleteHotel = function (id) {
	const deleteHotelServices = db.prepare('DELETE FROM HotelServices WHERE Id_Hotel = ?');
	const deleteEmployeeHotelAssignment = db.prepare('DELETE FROM EmployeeHotelAssignment WHERE Id_Hotel = ?');
	const deleteRoomHotelAssociation = db.prepare('DELETE FROM RoomHotelAssociation WHERE Id_Hotel = ?');
	const deleteClientBilling = db.prepare('DELETE FROM ClientBilling WHERE Id_Hotel = ?');
	const deleteHotelStats = db.prepare('DELETE FROM HotelStats WHERE Id_Hotel = ?');
	const deleteImageHotel = db.prepare('DELETE FROM ImageHotel WHERE Id_Hotel = ?');
	const deleteUserReservationHotel = db.prepare('DELETE FROM UserReservation WHERE Id_Hotel = ?');
	const deleteHotel = db.prepare('DELETE FROM Hotel WHERE Id_Hotel = ?');

	deleteHotelServices.run(id);
	deleteEmployeeHotelAssignment.run(id);
	deleteRoomHotelAssociation.run(id);
	deleteClientBilling.run(id);
	deleteHotelStats.run(id);
	deleteImageHotel.run(id);
	deleteUserReservationHotel.run(id);
	deleteHotel.run(id);
};

// Check Valid name
exports.validNameHotel = async function (name) {
	const query = 'SELECT COUNT(*) as nb FROM Hotel WHERE Name = ?';
	const countHotelName = await executeQuery(query, [name]);
	//console.log(countHotelName[0].nb)
	//console.log(countHotelName[0].nb == 0)
	//console.log(countHotelName[0].nb != 0)
	return countHotelName[0].nb == 0;
};

// Get ID From Hotel name
exports.getHotelIdFromName = async function (name) {
	const queryId = 'Select Id_Hotel from Hotel WHERE Name = ?';
	const resultId = await executeQueryWithResult(queryId, [name]);
	return resultId[0].Id_Hotel;
};

getHotelIdFromName = async function (name) {
	const queryId = 'Select Id_Hotel from Hotel WHERE Name = ?';
	const resultId = await executeQueryWithResult(queryId, [name]);
	return resultId[0].Id_Hotel;
};

// Get Reservation From hotel
exports.getReservationFromHotel = async function (name) {
	const query = 'Select * FROM UserReservation WHERE Id_Hotel = ?';
	const result = await executeQueryWithResult(query, [name]);
	let reservation = [];
	for (const row of result) {
		const queryReservation = 'SELECT * FROM Reservation WHERE Id_Reservation = ?';
		const reservationInfo = await executeQueryWithResult(queryReservation, [row.Id_Reservation]);
		reservation.push(reservationInfo);
	}
	let client = [];
	for (const row of result) {
		const queryClient = 'SELECT * FROM UserInfo WHERE Id_UserInfo = ?';
		const clientInfo = await executeQueryWithResult(queryClient, [row.Id_UserInfo]);
		client.push(clientInfo);
	}
	let room = [];
	for (const row of result) {
		const queryRoom = 'SELECT * FROM Room WHERE Id_Room = ?';
		const roomInfo = await executeQueryWithResult(queryRoom, [row.Id_Room]);
		room.push(roomInfo);
	}
	var reservationHotel = [];
	let i = 0;
	for (const row of result) {
		reservationHotel.push([reservation[i], client[i], room[i]]);
		i++;
	}
	return reservationHotel;
};

exports.getServicesFromHotel = async function (hotelId) {
	const query = 'SELECT Id_Services FROM HotelServices WHERE Id_Hotel = ?';
	const result = await executeQueryWithResult(query, [hotelId]);
	let services = [];

	for (const row of result) {
		const queryService = 'SELECT * FROM Services WHERE Id_Services = ?';
		const serviceInfo = await executeQueryWithResult(queryService, [row.Id_Services]);
		if (serviceInfo.length > 0) {
			services.push(serviceInfo[0]); // Push the first element of serviceInfo array directly
		}
	}
	return services;
};

// Function to get all services for a hotel using Id_Hotel
exports.getServicesByHotelId = async function (hotelId) {
	const query = `SELECT s.Id_Services, s.Name, s.Price
                   FROM Services s
                   JOIN HotelServices hs ON s.Id_Services = hs.Id_Services
                   WHERE hs.Id_Hotel = ?`;
	const result = await executeQueryWithResult(query, [hotelId]);
	return result;
};

// Function to remove a service from a hotel using Id_Hotel
exports.removeHotelService = async function (hotelId, serviceId) {
	const query = `DELETE FROM HotelServices WHERE Id_Hotel = ? AND Id_Services = ?`;
	await db.run(query, [hotelId, serviceId]);
};

// Function to add a new service for a hotel using Id_Hotel
exports.addHotelService = async function (hotelId, serviceId) {
	const query = `INSERT INTO HotelServices (Id_Hotel, Id_Services) VALUES (?, ?)`;
	await executeQueryRun(query, [hotelId, serviceId]);
};

exports.createSession = async function (sid, _expires, email) {
	const query = `INSERT INTO sessions (sid, expired, sess) VALUES (?,?,?)`;
	const results = await executeQueryRun(query, [sid, _expires.toString(), email]);
	return results.lastInsertRowid;
};

exports.checkSessionBySid = async function (sid_id) {
	const query = `SELECT sid FROM sessions`;
	const results = await executeQueryWithResult(query, []);
	for (let result of results) {
		if (sid_id == result.sid) {
			return result;
		}
	}
	return false;
};

exports.getSessionEmail = async function (sid) {
	const query = `SELECT sess FROM sessions WHERE sid = ?`;
	const results = await executeQueryWithResult(query, [sid]);
	return results[0];
};

exports.destroySessionById = async function (sid) {
	const query = `DELETE FROM sessions WHERE sid = ?`;
	const results = await executeQueryRun(query, [sid]);
};

// Client FUNCTIONS --------------------------------------------------------

// Create a new client
exports.createClient = async function (client) {
	const query = 'INSERT INTO UserInfo (Adress, Phone, Password, Email, FidelityLevel, FirstName, LastName) VALUES (?, ?, ?, ?, ?, ?, ?)';
	const result = await executeQueryRun(query, [client.adress, client.phone, client.password, client.email, client.fidelityLevel, client.firstName, client.lastName]);
	const queryClient = 'INSERT INTO Client (Id_UserInfo) VALUES (?)';
	await executeQueryRun(queryClient, [result.lastInsertRowid]);
	return result.lastInsertRowid; // Get the newly created client ID
};

// Get all clients
exports.getClients = async function () {
	const query = 'SELECT * FROM UserInfo';
	const clients = await executeQueryWithResult(query);
	return clients;
};

// Get a client by ID
exports.getClientById = async function (Id_UserInfo) {
	const query = 'SELECT * FROM UserInfo WHERE Id_UserInfo = ?';
	const client = await executeQuery(query, [Id_UserInfo]);
	return client[0]; // Assuming the result is an array with a single element
};

// Get a client by Email
exports.validEmail = async function (Email) {
	const query = 'SELECT COUNT(*) as count FROM UserInfo WHERE Email = ?';
	const result = await executeQuery(query, [Email]);

	// If result is an object with the properties 'changes' and 'lastInsertRowid'
	if (typeof result === 'object' && result !== null && 'changes' in result) {
		return result.changes === 0;
	}

	// If result is an array
	if (Array.isArray(result) && result.length > 0) {
		return result[0].count === 0;
	}

	// If result is neither an object nor an array, or if it's an empty array
	return false;
};

// Get a valid client
exports.clientConnexion = async function (email, password) {
	const query = 'SELECT COUNT(*) as count FROM UserInfo WHERE Password = ? AND Email = ?';
	const clientCount = await executeQueryWithResult(query, [password, email]);
	return clientCount[0].count == 1;
};

// Insert password ticket
exports.createPasswordTicket = async function (Id_UserInfo, Token, TokenExpired) {
	const query = 'INSERT INTO ResetPassword (Id_UserInfo, Token, TokenExpired) VALUES (?, ?, ?)';
	const result = await executeQueryRun(query, [Id_UserInfo, Token, TokenExpired]);
	return result.lastInsertRowid;
};

// find password ticket
exports.findPasswordTicket = async function (Token) {
	const query = 'SELECT * FROM ResetPassword Where Token = ?';
	const result = await executeQueryWithResult(query, [Token]);
	return result[0];
};

// delete password ticket
exports.deletePasswordTicket = async function (Id_UserInfo) {
	const query = 'DELETE FROM ResetPassword Where Id_UserInfo = ?';
	const result = await executeQueryRun(query, [Id_UserInfo]);
	return result.lastInsertRowid;
};

// Get a valid client
exports.checkUserByEmail = async function (email) {
	const query = 'SELECT COUNT(*) as nb FROM UserInfo WHERE Email = ?';
	const clientCount = await executeQueryWithResult(query, [email]);
	return clientCount[0].nb != 0;
};

// Get a valid client
exports.getClientIdByEmail = async function (email) {
	const query = 'SELECT Id_UserInfo FROM UserInfo WHERE Email = ?';
	const clientCount = await executeQueryWithResult(query, [email]);
	return clientCount[0].Id_UserInfo;
};

getClientIdByEmail = async function (email) {
	const query = 'SELECT Id_UserInfo FROM UserInfo WHERE Email = ?';
	const clientCount = await executeQueryWithResult(query, [email]);
	return clientCount[0].Id_UserInfo;
};

// Update a client (assuming you want to update all fields)
exports.updateClient = async function (client, userId) {
	const query = 'UPDATE UserInfo SET LastName = ?, FirstName = ?, Email = ?, Phone = ?, Adress = ? WHERE Id_UserInfo = ?';
	const result = await executeQueryRun(query, [client.lastName, client.firstName, client.email, client.phone, client.adress, userId]);
	return result.changes; // Number of rows affected (should be 1 for successful update)
};

// Change password
exports.changePassword = async function (newPassword, Id_UserInfo) {
	const query = 'UPDATE UserInfo SET Password = ? WHERE Id_UserInfo = ?';
	const result = await executeQueryRun(query, [newPassword, Id_UserInfo]);
	return result.changes; // Number of rows affected (should be 1 for successful update)
};

exports.deleteUserInfo = function (id) {
	const deleteClient = db.prepare('DELETE FROM Client WHERE Id_UserInfo = ?');
	const deleteEmployee = db.prepare('DELETE FROM Employee WHERE Id_UserInfo = ?');
	const deleteUserReservationHotel = db.prepare('DELETE FROM UserReservation WHERE Id_UserInfo = ?');
	const deleteClientBilling = db.prepare('DELETE FROM ClientBilling WHERE Id_UserInfo = ?');
	const deleteEmployeeHotelAssignment = db.prepare('DELETE FROM EmployeeHotelAssignment WHERE Id_UserInfo = ?');
	const deleteUserInfo = db.prepare('DELETE FROM UserInfo WHERE Id_UserInfo = ?');

	deleteClient.run(id);
	deleteEmployee.run(id);
	deleteUserReservationHotel.run(id);
	deleteClientBilling.run(id);
	deleteEmployeeHotelAssignment.run(id);
	deleteUserInfo.run(id);
};

exports.getReservationFromClient = async function (email) {
	const resultId = await getClientIdByEmail(email);
	const query = 'Select * FROM UserReservation WHERE Id_UserInfo = ?';
	const result = await executeQueryWithResult(query, [resultId]);
	let reservations = [];

	for (const row of result) {
		const reservationInfo = await getReservationDetails(row.Id_Reservation);
		reservations.push(reservationInfo);
	}
	return reservations;
};

// Function to get all the reservation's details using the Id_Reservation
getReservationDetails = async function (reservationId) {
	const reservationQuery = 'SELECT * FROM Reservation WHERE Id_Reservation = ?';
	const hotelQuery = 'SELECT * FROM Hotel WHERE Id_Hotel = (SELECT Id_Hotel FROM UserReservation WHERE Id_Reservation = ?)';
	const roomQuery = 'SELECT * FROM Room WHERE Id_Room = (SELECT Id_Room FROM UserReservation WHERE Id_Reservation = ?)';

	const reservation = await executeQueryWithResult(reservationQuery, [reservationId]);
	const hotel = await executeQueryWithResult(hotelQuery, [reservationId]);
	const room = await executeQueryWithResult(roomQuery, [reservationId]);

	const reservationDetails = {
		...reservation[0],
		...hotel[0],
		...room[0],
	};

	return reservationDetails;
};

// Employee functions --------------------------------------------------------

// Create a new employee
exports.createEmployee = async function (employee) {
	const query = 'INSERT INTO UserInfo (Adress, Phone, Password, Email, FidelityLevel, FirstName, LastName) VALUES (?, ?, ?, ?, ?, ?, ?)';
	const result = await executeQueryRun(query, [employee.address, employee.phone, employee.password, employee.email, employee.fidelityLevel, employee.firstName, employee.lastName]);
	const queryEmployee = 'INSERT INTO Employee (Id_UserInfo) VALUES (?)';
	await executeQueryRun(queryEmployee, [result.lastInsertRowid]);
	return result.lastInsertRowid; // Get the newly created employee ID
};

// See if employee is Admin at least in one hotel
exports.isAdmin = async function (email) {
	try {
		const userInfoQuery = 'SELECT Id_UserInfo FROM UserInfo WHERE Email = ?';
		const userInfoResult = db.prepare(userInfoQuery).get(email);

		if (!userInfoResult) {
			throw new Error('User not found');
		}

		const userId = userInfoResult.Id_UserInfo;
		const isAdminQuery = `
            SELECT COUNT(*) AS adminCount
            FROM EmployeeHotelAssignment
            WHERE Id_UserInfo = ? AND Is_Admin = 'TRUE'
        `;
		const isAdminResult = db.prepare(isAdminQuery).get(userId);

		const isAdmin = isAdminResult && isAdminResult.adminCount > 0;
		return isAdmin;
	} catch (error) {
		throw error;
	}
};

// Get all employees
exports.getEmployees = async function () {
	const query = 'SELECT * FROM UserInfo';
	const employees = await executeQuery(query);
	return employees;
};

// Get an employee by ID
exports.getEmployeeById = async function (Id_UserInfo) {
	const query = 'SELECT * FROM UserInfo WHERE Id_UserInfo = ?';
	const employee = await executeQuery(query, [Id_UserInfo]);
	return employee[0]; // Assuming the result is an array with a single element
};

// Update an employee
exports.updateEmployee = async function (employee) {
	const query = 'UPDATE UserInfo SET LastName = ?, FirstName = ?, Email = ?, Password = ?, Phone = ?, FidelityLevel = ?, Address = ? WHERE Id_UserInfo = ?';
	const result = await executeQuery(query, [
		employee.lastName,
		employee.firstName,
		employee.email,
		employee.password,
		employee.phone,
		employee.fidelityLevel,
		employee.address,
		employee.Id_UserInfo,
	]);
	return result.changes; // Number of rows affected (should be 1 for successful update)
};

exports.getHotelsByAdmin = async function (adminId) {
	try {
		const query = `
            SELECT h.*
            FROM Hotel h
            INNER JOIN EmployeeHotelAssignment ON h.Id_Hotel = EmployeeHotelAssignment.Id_Hotel
            INNER JOIN Employee ON EmployeeHotelAssignment.Id_UserInfo = Employee.Id_UserInfo
            WHERE EmployeeHotelAssignment.Is_Admin = 'TRUE'
              AND EmployeeHotelAssignment.Id_UserInfo = ?
        `;
		const hotels = await executeQueryWithResult(query, [adminId]);
		return hotels;
	} catch (error) {
		throw error;
	}
};

// Reservation functions --------------------------------------------------------

// Create a new reservation
exports.createReservation = function (reservation) {
	const createReservation = db.prepare(`
        INSERT INTO Reservation (CheckDateIn, CheckDateOut, ExactCheckInTime, AccompanyingCount, Duration, Confirmed, CheckedOut, CreatorID) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
	const result = createReservation.run(
		reservation.CheckDateIn,
		reservation.CheckDateOut,
		reservation.ExactCheckInTime,
		reservation.AccompanyingCount,
		reservation.Duration,
		reservation.Confirmed,
		reservation.CheckedOut,
		reservation.CreatorID
	);
	return result.lastInsertRowid;
};

// Get all reservations
async function getReservations() {
	const query = 'SELECT * FROM Reservation';
	const reservations = await executeQuery(query);
	return reservations;
}

// Get a reservation by ID
async function getReservationById(reservationId) {
	const query = 'SELECT * FROM Reservation WHERE Id_Reservation = ?';
	const reservation = await executeQuery(query, [reservationId]);
	return reservation[0];
}

// Update a reservation
async function updateReservation(reservation) {
	const query = `
        UPDATE Reservation
        SET CheckDateIn = ?, CheckDateOut = ?, Duration = ?, Confirmed = ?, CheckedOut = ?, CreatorID = ?, ExactCheckInTime = ?, AccompanyingNames = ?
        WHERE Id_Reservation = ?
    `;
	const result = await executeQuery(query, [
		reservation.checkDateIn,
		reservation.checkDateOut,
		reservation.duration,
		reservation.confirmed,
		reservation.CheckedOut,
		reservation.creatorID,
		reservation.exactCheckInTime || 'Not checked in', // Default value if not provided
		reservation.accompanyingNames || '', // Default value if not provided
		reservation.Id_Reservation,
	]);
	return result.changes;
}

// Check in with exact time and accompanying names
exports.checkIn = async function (reservationId, exactCheckInTime) {
	const query = `
        UPDATE Reservation
        SET Confirmed = ?
        WHERE Id_Reservation = ?
    `;
	const result = await executeQueryRun(query, [exactCheckInTime, reservationId]);
	return result.changes;
};

// Delete a reservation
exports.deleteReservation = function (id) {
	const deleteUsertReservation = db.prepare('DELETE FROM UserReservation WHERE Id_Reservation = ?');
	const deleteReservationServices = db.prepare('DELETE FROM ReservationServices WHERE Id_Reservation = ?');
	const deleteClientBilling = db.prepare('DELETE FROM ClientBilling WHERE Id_Reservation = ?');
	const deleteUserReservationHotel = db.prepare('DELETE FROM UserReservation WHERE Id_Reservation = ?');
	const deleteReservation = db.prepare('DELETE FROM Reservation WHERE Id_Reservation = ?');

	deleteUsertReservation.run(id);
	deleteReservationServices.run(id);
	deleteClientBilling.run(id);
	deleteUserReservationHotel.run(id);
	deleteReservation.run(id);
};

// Get duration  of reservation by id
exports.getDurationReservation = async function (reservationId) {
	const query = 'SELECT Duration FROM Reservation WHERE Id_Reservation = ?';
	const reservation = await executeQuery(query, [reservationId]);
	return reservation[0];
};

// Get all reservations made by a user
async function getReservationsByUser(userId) {
	const query = 'SELECT * FROM Reservation WHERE CreatorID = ?';
	const reservations = await executeQuery(query, [userId]);
	return reservations;
}

// Services functions --------------------------------------------------------

// Create a new service
exports.createServices = async function (service) {
	const query = 'INSERT INTO Services (Name, Price) VALUES (?, ?)';
	const result = await executeQueryRun(query, [service.name, service.price]);
	return result.lastInsertRowid;
};

// Get all services
exports.getServices = async function () {
	const query = 'SELECT * FROM Services';
	const services = await executeQuery(query);
	return services;
};

// Get a service by ID
exports.getServiceById = async function (serviceId) {
	const query = 'SELECT * FROM Services WHERE Id_Service = ?';
	const service = await executeQuery(query, [serviceId]);
	return service[0];
};

// Update a service
exports.updateServicev = async function (service) {
	const query = 'UPDATE Services SET Name = ?, Price = ? WHERE Id_Service = ?';
	const result = await executeQuery(query, [service.name, service.price, service.Id_Service]);
	return result.changes;
};

// Delete a service
exports.deleteService = function (id) {
	const deleteHotelServices = db.prepare('DELETE FROM HotelServices WHERE Id_Services = ?');
	const deleteReservationServices = db.prepare('DELETE FROM ReservationServices WHERE Id_Services = ?');
	const deleteService = db.prepare('DELETE FROM Services WHERE Id_Services = ?');

	deleteHotelServices.run(id);
	deleteReservationServices.run(id);
	deleteService.run(id);
};

// Assignement Service to Hotels
exports.assignementServiceHotel = async function (assignementServiceHotel) {
	const query = 'INSERT INTO HotelServices (Id_Hotel, Id_Services) VALUES (?, ?)';
	const result = await executeQueryRun(query, [assignementServiceHotel.hotelId, assignementServiceHotel.serviceId]);
	return result.changes;
};

// Statistics functions --------------------------------------------------------

// Create new statistics
exports.createStatistics = async function (statistics) {
	const query = 'INSERT INTO Statistics (StatStartDate, StatEndDate, NightsAvailable, NightsBooked, RoomRevenue, ServiceRevenue, TotalRevenue) VALUES (?, ?, ?, ?, ?, ?, ?)';
	const result = await executeQuery(query, [
		statistics.statStartDate,
		statistics.statEndDate,
		statistics.nightsAvailable,
		statistics.nightsBooked,
		statistics.roomRevenue,
		statistics.serviceRevenue,
		statistics.totalRevenue,
	]);
	return result.lastInsertRowid;
};

// Get all statistics
exports.getStatistics = async function () {
	const query = 'SELECT * FROM Statistics';
	const statistics = await executeQuery(query);
	return statistics;
};

// Get statistics by ID
exports.getStatisticsById = async function (statisticsId) {
	const query = 'SELECT * FROM Statistics WHERE Id_Statistics = ?';
	const statistics = await executeQuery(query, [statisticsId]);
	return statistics[0];
};

// Update statistics
exports.updateStatistics = async function (statistics) {
	const query = 'UPDATE Statistics SET StatStartDate = ?, StatEndDate = ?, NightsAvailable = ?, NightsBooked = ?, RoomRevenue = ?, ServiceRevenue = ?, TotalRevenue = ? WHERE Id_Statistics = ?';
	const result = await executeQuery(query, [
		statistics.statStartDate,
		statistics.statEndDate,
		statistics.nightsAvailable,
		statistics.nightsBooked,
		statistics.roomRevenue,
		statistics.serviceRevenue,
		statistics.totalRevenue,
		statistics.Id_Statistics,
	]);
	return result.changes;
};

// Delete statistics
exports.deleteStatistic = function (id) {
	const deleteHotelStats = db.prepare('DELETE FROM HotelStats WHERE Id_Statistic = ?');
	const deleteStatistic = db.prepare('DELETE FROM Statistics WHERE Id_Statistic = ?');

	deleteHotelStats.run(id);
	deleteStatistic.run(id);
};
// Billing functions --------------------------------------------------------

// Create new billing
exports.createBilling = async function (billing) {
	const query = 'INSERT INTO Billing (Total, Paid, RoomTotalCost, ServiceTotalCost) VALUES (?, ?, ?, ?)';
	const result = await executeQueryRun(query, [billing.total, billing.paid, billing.roomTotalCost, billing.serviceTotalCost]);
	return result.lastInsertRowid;
};

// Get all billing
exports.getBilling = async function () {
	const query = 'SELECT * FROM Billing';
	const billing = await executeQuery(query);
	return billing;
};

// Get billing by ID
exports.getBillingById = async function (billingId) {
	const query = 'SELECT * FROM Billing WHERE Id_Billing = ?';
	const billing = await executeQuery(query, [billingId]);
	return billing[0];
};

// Update billing
exports.updateBilling = async function (billing) {
	const query = 'UPDATE Billing SET Total = ?, Paid = ?, RoomTotalCost = ?, ServiceTotalCost = ? WHERE Id_Billing = ?';
	const result = await executeQuery(query, [billing.total, billing.paid, billing.roomTotalCost, billing.serviceTotalCost, billing.Id_Billing]);
	return result.changes;
};

// Delete billing
exports.deleteBilling = function (id) {
	const deleteClientBilling = db.prepare('DELETE FROM ClientBilling WHERE Id_Billing = ?');
	const deleteBilling = db.prepare('DELETE FROM Billing WHERE Id_Billing = ?');

	deleteClientBilling.run(id);
	deleteBilling.run(id);
};

// Image functions --------------------------------------------------------

exports.createImage = async function (path) {
	const query = 'INSERT INTO Images (ImagePath) VALUES (?)';
	const result = await executeQueryRun(query, [path]);
	return result.lastInsertRowid;
};

exports.deleteImage = function (id) {
	const deleteImageHotel = db.prepare('DELETE FROM ImageHotel WHERE Id_Images = ?');
	const deleteImageRoom = db.prepare('DELETE FROM ImageRoom WHERE Id_Images = ?');
	const deleteImage = db.prepare('DELETE FROM Images WHERE Id_Images = ?');

	deleteImageHotel.run(id);
	deleteImageRoom.run(id);
	deleteImage.run(id);
};

exports.changeImage = async function (imageId, newLink) {
	const query = 'UPDATE Images SET ImagePath = ? WHERE Id_Image = ?';
	const result = await executeQuery(query, [newLink, imageId]);
	return result.changes;
};

exports.insertHotelImage = async function (imageHotel) {
	const query = 'INSERT INTO ImageHotel (Id_Hotel, Id_Images) VALUES (?, ?)';
	const result = await executeQueryRun(query, [imageHotel.hotelId, imageHotel.imageId]);
	return result.changes;
};

exports.deleteHotelImage = async function (Id_Hotel) {
	const query = 'DELETE FROM ImageHotel WHERE Id_Hotel = ?';
	const result = await executeQueryRun(query, [Id_Hotel]);
	return result.changes;
};

exports.getImageById = async function (ImageId) {
	const query = 'SELECT * FROM Images WHERE Id_images = ?';
	const image = await executeQuery(query, [ImageId]);
	return image;
};

exports.getImagePath = async function (Id_Image) {
	const query = 'SELECT ImagePath FROM Images WHERE Id_Images = ?';
	const images = await executeQueryWithResult(query, [Id_Image]);
	return images;
};

exports.getImagesForHotel = async function (Id_Hotel) {
	const query = 'SELECT * FROM ImageHotel WHERE Id_Hotel = ?';
	const images = await executeQuery(query, [Id_Hotel]);
	return images;
};

exports.getImageIdsByHotelId = async function (hotelId) {
	const query = 'SELECT Id_Images FROM ImageHotel WHERE Id_Hotel = ?';
	const result = await executeQueryWithResult(query, [hotelId]);
	return result.map((row) => row.Id_Images);
};

exports.getImagesForRoom = async function (Id_RoomType) {
	const query = 'SELECT * FROM ImageRoom WHERE Id_RoomType = ?';
	const images = await executeQuery(query, [Id_RoomType]);
	return images;
};

exports.insertRoomTypeImage = async function (imageRoom) {
	const query = 'INSERT INTO ImageRoom (Id_RoomType, Id_Images) VALUES (?, ?)';
	const result = await executeQueryRun(query, [imageRoom.roomTypeId, imageRoom.imageId]);
	return result.changes;
};

exports.deleteRoomTypeImage = async function (roomTypeId) {
	const query = 'DELETE FROM ImageRoom WHERE Id_RoomType = ?';
	const result = await executeQueryRun(query, [roomTypeId]);
	return result.changes;
};

// EmployeeHotelAssignment functions --------------------------------------------------------

exports.assignEmployeeToHotel = async function (Id_Hotel, Id_UserInfo, isAdmin) {
	const query = 'INSERT INTO EmployeeHotelAssignment (Id_Hotel, Id_UserInfo, Is_Admin) VALUES (?, ?, ?)';
	const result = await executeQueryRun(query, [Id_Hotel, Id_UserInfo, isAdmin]);
	return result.lastInsertRowid;
};

exports.unassignEmployeeFromHotel = async function (hotel, employee) {
	const query = 'DELETE FROM EmployeeHotelAssignment WHERE EmployeeId = ? AND HotelId = ?';
	const result = await executeQuery(query, [employee.Id_UserInfo, hotel.Id_Hotel]);
	return result.changes;
};

exports.getEmployeesForHotel = async function (hotel) {
	const query = 'SELECT * FROM EmployeeHotelAssignment WHERE HotelId = ?';
	const employees = await executeQuery(query, [hotel.Id_Hotel]);
	return employees;
};

exports.mutateEmployeeToHotel = async function (hotel, employee) {
	const query = 'UPDATE EmployeeHotelAssignment SET HotelId = ? WHERE EmployeeId = ?';
	const result = await executeQuery(query, [hotel.Id_Hotel, employee.Id_UserInfo]);
	return result.changes;
};

// User reservation functions --------------------------------------------------------

// Create a new user reservation
exports.createUserReservation = async function (userReservation) {
	const query = 'INSERT INTO UserReservation (Id_Hotel, Id_Reservation, Id_UserInfo, Id_Room) VALUES (?, ?, ?, ?)';
	const result = await executeQueryRun(query, [userReservation.Id_Hotel, userReservation.Id_Reservation, userReservation.Id_UserInfo, userReservation.Id_Room]);
	return result.lastInsertRowid;
};

// Update a user reservation
exports.updateUserReservation = async function (userReservation) {
	const query = 'UPDATE UserReservation SET Id_Hotel = ?, Id_Reservation = ?, Id_UserInfo = ?, Id_Room = ? WHERE Id_Hotel = ? AND Id_Reservation = ? AND Id_UserInfo = ?';
	const result = await executeQuery(query, [
		userReservation.Id_Hotel,
		userReservation.Id_Reservation,
		userReservation.Id_UserInfo,
		userReservation.Id_Room,
		userReservation.Id_Hotel,
		userReservation.Id_Reservation,
		userReservation.Id_UserInfo,
	]);
	return result.changes;
};

// Get all user reservations
exports.getUserReservations = async function () {
	const query = 'SELECT * FROM UserReservation';
	const userReservations = await executeQuery(query);
	return userReservations;
};

// Get a user reservation by ID
exports.getUserReservationById = async function (reservationId) {
	const query = 'SELECT * FROM UserReservation WHERE Id_Reservation = ?';
	const userReservation = await executeQuery(query, [reservationId]);
	return userReservation[0];
};

// Get all reservations made by a user
exports.getUserReservationsByUser = async function (userId) {
	const query = 'SELECT * FROM UserReservation WHERE Id_UserInfo = ?';
	const userReservations = await executeQuery(query, [userId]);
	return userReservations;
};

// Get all reservations made for a hotel
exports.getUserReservationsByHotel = async function (hotelId) {
	const query = 'SELECT * FROM UserReservation WHERE Id_Hotel = ?';
	const userReservations = await executeQuery(query, [hotelId]);
	return userReservations;
};

// Get all reservations made for a room
exports.getUserReservationsByRoom = async function (roomId) {
	const query = 'SELECT * FROM UserReservation WHERE Id_Room = ?';
	const userReservations = await executeQuery(query, [roomId]);
	return userReservations;
};

// Delete a user reservation
exports.deleteUserReservation = async function (Id_Hotel, Id_Reservation, Id_UserInfo) {
	const query = 'DELETE FROM UserReservation WHERE Id_Hotel = ? AND Id_Reservation = ? AND Id_UserInfo = ?';
	const result = await executeQuery(query, [Id_Hotel, Id_Reservation, Id_UserInfo]);
	return result.changes;
};

// ROOM TYPE FUNCTION --------------------------------------------------------

// Create a new room type
exports.createRoomType = async function (roomType) {
	const query = 'INSERT INTO RoomType (Name, Capacity, Television, Phone, PricePerNight) VALUES (?, ?, ?, ?, ?)';
	const result = await executeQueryRun(query, [roomType.name, roomType.capacity, roomType.television, roomType.phone, roomType.pricePerNight]);
	return result.lastInsertRowid;
};

// Get all room types
exports.getAllRoomTypes = async function () {
	const query = 'SELECT * FROM RoomType';
	const roomTypes = await executeQuery(query);
	return roomTypes;
};

exports.getRoomTypesForHotel = async function (Id_hotel) {
	const selectRoomTypes = db.prepare(`
		SELECT RoomType.Id_RoomType, RoomType.Name
		FROM RoomType
		JOIN RoomHotelAssociation ON RoomType.Id_RoomType = RoomHotelAssociation.Id_RoomType
		WHERE RoomHotelAssociation.Id_Hotel = ?
	`);

	const roomTypes = selectRoomTypes.all(Id_hotel);
	return roomTypes;
};

// Get room types by Id
exports.getRoomTypeById = async function (roomTypeId) {
	const query = 'SELECT * FROM RoomType WHERE Id_RoomType = ?';
	const roomType = await executeQueryWithResult(query, [roomTypeId]);
	return roomType[0];
};

// Update a room type
exports.updateRoomType = async function (roomType, id) {
	const query = 'UPDATE RoomType SET Name = ?, Capacity = ?, Television = ?, Phone = ?, PricePERNight = ? WHERE Id_RoomType = ?';
	const result = await executeQueryRun(query, [roomType.name, roomType.capacity, roomType.television, roomType.phone, roomType.pricePerNight, id]);
	return result.changes;
};

// Delete a room type
exports.deleteRoomType = function (id) {
	const deleteRoomHotelAssociation = db.prepare('DELETE FROM RoomHotelAssociation WHERE Id_RoomType = ?');
	const deleteImageRoom = db.prepare('DELETE FROM ImageRoom WHERE Id_RoomType = ?');
	const deleteRoomType = db.prepare('DELETE FROM RoomType WHERE Id_RoomType = ?');

	deleteRoomHotelAssociation.run(id);
	deleteImageRoom.run(id);
	deleteRoomType.run(id);
};

// Set room type to room
exports.setRoomTypeToRoom = async function (room, roomType) {
	const query = 'INSERT INTO RoomTypeAssociation (Id_Room, Id_RoomType) VALUES (?, ?)';
	const result = await executeQuery(query, [room.Id_Room, roomType.Id_RoomType]);
	return result.lastInsertRowid;
};

// Get room type by room
exports.getRoomTypeByRoom = async function (room) {
	const query = 'SELECT * FROM RoomHotelAssociation WHERE Id_Room = ?';
	const roomType = await executeQueryWithResult(query, [room]);
	return roomType[0].Id_RoomType;
};

// Delete room type by room
exports.deleteRoomTypeByRoom = async function (room) {
	const query = 'DELETE FROM RoomTypeAssociation WHERE Id_Room = ?';
	const result = await executeQuery(query, [room.Id_Room]);
	return result.changes;
};

// Get room by room type
exports.getRoomByRoomType = async function (roomType) {
	const query = 'SELECT * FROM RoomTypeAssociation WHERE Id_RoomType = ?';
	const room = await executeQuery(query, [roomType.Id_RoomType]);
	return room[0];
};

// ROOM FUNCTIONS  --------------------------------------------------------

// Create a new room
exports.createRoom = async function (room) {
	const query = 'INSERT INTO Room (isAvailable) VALUES (?)';
	const result = await executeQueryRun(query, [room.isAvailable]);
	return result.lastInsertRowid;
};

exports.deleteRoom = function (id) {
	const deleteRoomHotelAssociation = db.prepare('DELETE FROM RoomHotelAssociation WHERE Id_Room = ?');
	const deleteUserReservationHotel = db.prepare('DELETE FROM UserReservation WHERE Id_Room = ?');
	const deleteRoomDisponibility = db.prepare('DELETE FROM RoomDisponibility WHERE Id_Room = ?');
	const deleteRoom = db.prepare('DELETE FROM Room WHERE Id_Room = ?');

	deleteRoomHotelAssociation.run(id);
	deleteUserReservationHotel.run(id);
	deleteRoomDisponibility.run(id);
	deleteRoom.run(id);
};

// Associate Room, Hotel, RoomType
exports.associateRoomHotelType = async function (roomHotel) {
	const query = 'INSERT INTO RoomHotelAssociation (Id_Hotel, Id_RoomType, Id_Room) VALUES (?, ?, ?)';
	const result = await executeQueryRun(query, [roomHotel.hotel_ID, roomHotel.roomTypeId, roomHotel.roomId]);
	return result.lastInsertRowid;
};

// Remove a room from a hotel
exports.removeRoomFromHotel = async function (room, hotel) {
	const query = 'DELETE FROM RoomHotelAssociation WHERE Id_Room = ? AND Id_Hotel = ?';
	const result = await executeQuery(query, [room.Id_Room, hotel.Id_Hotel]);
	return result.changes;
};

// Get all rooms in a hotel
exports.getRoomsInHotel = async function (Id_Hotel) {
	const query = 'SELECT Id_Room FROM RoomHotelAssociation WHERE Id_Hotel = ?';
	const rooms = await executeQuery(query, [Id_Hotel]);
	return rooms;
};

exports.getRoomsInHotel = async function (Id_Hotel) {
	const query = 'SELECT * FROM RoomHotelAssociation WHERE Id_Hotel = ?';
	const rooms = await executeQuery(query, [Id_Hotel]);

	const roomsWithAvailability = await Promise.all(
		rooms.map(async (room) => {
			const reservedDates = await exports.getRoomAvailabilityNoDate(room.Id_Room);
			return {
				...room,
				reservedDates,
			};
		})
	);

	return roomsWithAvailability;
};

async function testRoomAvailability() {
	const rooms = await exports.getRoomsInHotel(1);

	//console.log('Rooms with availability:', rooms);
}

// Run the test
//testRoomAvailability().catch(console.error);

// RESERVATION SERVICES FUNCTIONS

// remove a service from a reservation
function removeServiceFromReservation(reservation, service) {
	const deleteService = db.prepare('DELETE FROM ReservationServices WHERE Id_Reservation = ? AND Id_Service = ?');
	const result = deleteService.run(reservation, service);
	return result.changes;
}

exports.getServiceIdsByName = async function (serviceNames) {
	const query = 'SELECT Id_Services FROM Services WHERE Name = ?';
	const serviceIds = [];
	for (const name of serviceNames) {
		const result = await executeQueryWithResult(query, [name]);
		if (result.length > 0) {
			serviceIds.push(result[0].Id_Services);
		}
	}
	return serviceIds;
};

exports.createReservationServices = function (reservationId, serviceIds) {
	const createReservationService = db.prepare(`
        INSERT INTO ReservationServices (Id_Reservation, Id_Services) 
        VALUES (?, ?)
    `);
	for (const serviceId of serviceIds) {
		createReservationService.run(reservationId, serviceId);
	}
};

// other functions --------------------------------------------------------

exports.calculateReservationCost = function (reservationId) {
	// Get reservation details
	const reservationQuery = db.prepare(`
      SELECT * FROM Reservation WHERE Id_Reservation = ?
  `);
	const reservation = reservationQuery.get(reservationId);

	// Get room type details
	const idRoom = db.prepare(`SELECT Id_Room FROM UserReservation WHERE Id_Reservation = ?`);
	const idRoomResult = idRoom.get(reservationId);

	const Id_RoomType = db.prepare(`SELECT Id_RoomType FROM RoomHotelAssociation WHERE Id_Room = ?`);
	const Id_RoomTypeResult = Id_RoomType.get(idRoomResult.Id_Room);

	const roomTypeQuery = db.prepare(`SELECT * FROM RoomType WHERE Id_RoomType = ?`);
	const roomTypeQueryResult = roomTypeQuery.get(Id_RoomTypeResult.Id_RoomType);

	// Calculate room rent
	const roomRent = reservation.Duration * roomTypeQueryResult.PricePERNight;
	// Get service total cost
	const serviceQuery = db.prepare(`
      SELECT SUM(Price) AS ServiceTotal FROM Services
      WHERE Id_Services IN (
          SELECT Id_Services FROM ReservationServices WHERE Id_Reservation = ?
      )
  	`);
	var serviceTotal = serviceQuery.get(reservationId);

	if (!serviceTotal.ServiceTotal) {
		serviceTotal.ServiceTotal = 0;
	}
	// Calculate total cost
	const totalCost = roomRent + serviceTotal.ServiceTotal;

	return {
		roomRent: roomRent,
		serviceTotal: serviceTotal,
		totalCost: totalCost,
	};
};

exports.applyDiscountBasedOnFidelityLevel = async function (fidelityLevel, totalPrice) {
	const discountLevels = {
		Basic: 0,
		Silver: 5,
		Gold: 10,
		Platinum: 20,
	};

	if (discountLevels.hasOwnProperty(fidelityLevel)) {
		const discountPercentage = discountLevels[fidelityLevel];
		const discountedPrice = totalPrice - totalPrice * (discountPercentage / 100);
		return {
			discountedPrice: discountedPrice,
			discountPercentage: discountPercentage,
		};
	} else {
		return {
			discountedPrice: totalPrice,
			discountPercentage: 0,
		};
	}
};

exports.updateFidelityLevel = async function (userId) {
	function getTotalReservationDuration(userId) {
		const query = `
          SELECT SUM(Duration) AS TotalDuration
          FROM Reservation
          INNER JOIN UserReservation ON Reservation.Id_Reservation = UserReservation.Id_Reservation
          WHERE UserReservation.Id_UserInfo = ?;
      `;
		const result = db.prepare(query).get(userId);
		return result ? result.TotalDuration : 0;
	}

	const totalDuration = getTotalReservationDuration(userId);

	const fidelityLevels = [
		{ level: 'Basic', minDuration: 0 },
		{ level: 'Silver', minDuration: 50 },
		{ level: 'Gold', minDuration: 200 },
		{ level: 'Platinum', minDuration: 500 },
	];

	let newFidelityLevel = 'Basic';
	for (const levelData of fidelityLevels) {
		if (totalDuration >= levelData.minDuration) {
			newFidelityLevel = levelData.level;
		} else {
			break;
		}
	}

	const updateQuery = `
      UPDATE UserInfo
      SET FidelityLevel = ?
      WHERE Id_UserInfo = ?;
  `;
	db.prepare(updateQuery).run(newFidelityLevel, userId);
};

exports.assignememtClientBillingHotel = async function (clientBilling) {
	const queryId = 'INSERT INTO ClientBilling (Id_Billing, Id_Reservation, Id_Hotel, Id_UserInfo) VALUES (?, ?, ?, ?)';
	const resultId = await executeQuery(queryId, [clientBilling.Id_Billing, clientBilling.Id_Reservation, clientBilling.Id_Hotel, clientBilling.Id_UserInfo]);
	return resultId;
};

exports.getRoomAvailability = async function (roomId, startMonth, startYear, endMonth, endYear) {
	const startDay = 1;
	const endDay = new Date(endYear, endMonth, 0).getDate(); // Get the last day of the end month

	const startDate = `${startYear}-${startMonth.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}`;
	const endDate = `${endYear}-${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}`;

	const query = `
        SELECT CheckDateIn, CheckDateOut
        FROM Reservation
        INNER JOIN UserReservation ON Reservation.Id_Reservation = UserReservation.Id_Reservation
        WHERE UserReservation.Id_Room = ?
          AND Reservation.CheckDateIn >= ? 
          AND Reservation.CheckDateOut <= ? 
    `;

	const reservations = db.prepare(query).all(roomId, startDate, endDate);

	const reservedDates = [];
	reservations.forEach((reservation) => {
		const reservationStartDate = new Date(reservation.CheckDateIn);
		const reservationEndDate = new Date(reservation.CheckDateOut);

		console.log('Reservation Start:', reservationStartDate.toISOString().slice(0, 10));
		'Reservation End:', reservationEndDate.toISOString().slice(0, 10);

		for (let currentDate = new Date(reservationStartDate); currentDate <= reservationEndDate; currentDate.setDate(currentDate.getDate() + 1)) {
			console.log('Current Date:', currentDate.toISOString().slice(0, 10));
			reservedDates.push(new Date(currentDate)); // Create a new Date object for each iteration
		}
	});

	return reservedDates;
};

exports.getRoomAvailabilityNoDate = async function (roomId) {
	const today = new Date();
	const todayDateStr = today.toISOString().slice(0, 10);

	const query = `
        SELECT CheckDateIn, CheckDateOut
        FROM Reservation
        INNER JOIN UserReservation ON Reservation.Id_Reservation = UserReservation.Id_Reservation
        WHERE UserReservation.Id_Room = ?
          AND Reservation.CheckDateOut >= ?
          AND Reservation.CheckedOut != 'FALSE'
          AND Reservation.Confirmed != 'TRUE'
          AND Reservation.CheckDateOut >= ?
    `;

	const reservations = db.prepare(query).all(roomId, todayDateStr, todayDateStr);

	const reservedDates = [];
	reservations.forEach((reservation) => {
		const reservationStartDate = new Date(reservation.CheckDateIn);
		const reservationEndDate = new Date(reservation.CheckDateOut);

		for (let currentDate = new Date(reservationStartDate); currentDate <= reservationEndDate; currentDate.setDate(currentDate.getDate() + 1)) {
			reservedDates.push(currentDate.toISOString().slice(0, 10)); // Push date string in 'yyyy-MM-dd' format
		}
	});

	return reservedDates;
};

exports.getReservationIdsForRoom = async function (roomId, startMonth, startYear, endMonth, endYear) {
	const startDate = `${startYear}-${startMonth.toString().padStart(2, '0')}-01`;
	const endDate = `${endYear}-${endMonth.toString().padStart(2, '0')}-${new Date(endYear, endMonth, 0).getDate()}`;

	const query = `
        SELECT Reservation.Id_Reservation
        FROM Reservation
        INNER JOIN UserReservation ON Reservation.Id_Reservation = UserReservation.Id_Reservation
        WHERE UserReservation.Id_Room = ?
          AND Reservation.CheckDateIn >= ? 
          AND Reservation.CheckDateOut <= ? 
    `;

	const reservations = db.prepare(query).all(roomId, startDate, endDate);

	const reservationIds = reservations.map((reservation) => reservation.Id_Reservation);

	return reservationIds;
};

exports.getAvailableRoomsForHotel = async function (hotelId, startDate, endDate) {
	const query = `
        SELECT Room.Id_Room
        FROM Room
        INNER JOIN RoomHotelAssociation ON Room.Id_Room = RoomHotelAssociation.Id_Room
        WHERE RoomHotelAssociation.Id_Hotel = ? AND
        AND Room.Id_Room NOT IN (
            SELECT Id_Room
            FROM UserReservation
            INNER JOIN Reservation ON UserReservation.Id_Reservation = Reservation.Id_Reservation
            WHERE Reservation.CheckDateIn >= ? AND Reservation.CheckDateOut <= ?
        )
    `;

	const rooms = await executeQueryWithResult(query, [hotelId, startDate, endDate]);
	return rooms.map((room) => room.Id_Room);
};

// STATISTICS FUNCTIONS

exports.getAvailableRoomsForHotelAndRoomType = async function (hotelId, roomTypeId, startDate, endDate) {
	const query = `
        SELECT Room.Id_Room
        FROM Room
        INNER JOIN RoomHotelAssociation ON Room.Id_Room = RoomHotelAssociation.Id_Room
        WHERE RoomHotelAssociation.Id_Hotel = ? AND RoomHotelAssociation.Id_RoomType = ?
        AND Room.Id_Room NOT IN (
            SELECT Id_Room
            FROM UserReservation
            INNER JOIN Reservation ON UserReservation.Id_Reservation = Reservation.Id_Reservation
            WHERE Reservation.CheckDateIn >= ? AND Reservation.CheckDateOut <= ?
        )
    `;

	const rooms = await executeQueryWithResult(query, [hotelId, roomTypeId, startDate, endDate]);
	return rooms.map((room) => room.Id_Room);
};

exports.getBookedRoomsForHotelAndRoomType = async function (hotelId, roomTypeId, startDate, endDate) {
	const query = `
        SELECT Room.Id_Room
        FROM Room
        INNER JOIN RoomHotelAssociation ON Room.Id_Room = RoomHotelAssociation.Id_Room
        INNER JOIN UserReservation ON Room.Id_Room = UserReservation.Id_Room
        INNER JOIN Reservation ON UserReservation.Id_Reservation = Reservation.Id_Reservation
        WHERE RoomHotelAssociation.Id_Hotel = ? AND RoomHotelAssociation.Id_RoomType = ?
        AND Reservation.CheckDateIn >= ? AND Reservation.CheckDateOut <= ?
    `;

	const rooms = await executeQueryWithResult(query, [hotelId, roomTypeId, startDate, endDate]);
	return rooms.map((room) => room.Id_Room);
};

exports.getRoomRevenueForHotel = async function (hotelId, startDate, endDate) {
	const query = `
        SELECT SUM(RoomType.PricePerNight * Reservation.Duration) AS RoomRevenue
        FROM Room
        INNER JOIN RoomHotelAssociation ON Room.Id_Room = RoomHotelAssociation.Id_Room
        INNER JOIN RoomType ON RoomHotelAssociation.Id_RoomType = RoomType.Id_RoomType
        INNER JOIN UserReservation ON Room.Id_Room = UserReservation.Id_Room
        INNER JOIN Reservation ON UserReservation.Id_Reservation = Reservation.Id_Reservation
        WHERE RoomHotelAssociation.Id_Hotel = ? AND Reservation.CheckDateIn >= ? AND Reservation.CheckDateOut <= ?
    `;

	const result = await executeQueryWithResult(query, [hotelId, startDate, endDate]);
	return result[0].RoomRevenue || 0;
};

exports.getServiceRevenueForHotel = async function (hotelId, startDate, endDate) {
	const query = `
        SELECT SUM(Services.Price) AS ServiceRevenue
        FROM Services
        INNER JOIN ReservationServices ON Services.Id_Services = ReservationServices.Id_Services
        INNER JOIN Reservation ON ReservationServices.Id_Reservation = Reservation.Id_Reservation
        INNER JOIN UserReservation ON Reservation.Id_Reservation = UserReservation.Id_Reservation
        INNER JOIN Hotel ON UserReservation.Id_Hotel = Hotel.Id_Hotel
        WHERE Hotel.Id_Hotel = ? AND Reservation.CheckDateIn >= ? AND Reservation.CheckDateOut <= ?
    `;

	const result = await executeQueryWithResult(query, [hotelId, startDate, endDate]);
	return result[0].ServiceRevenue || 0;
};

// Function to get the number of available nights and booked nights for each room type, broken down by hotel
exports.getStatisticsForAllHotels = async function (startDate, endDate) {
	const hotels = await exports.getHotels();
	const statistics = [];

	for (const hotel of hotels) {
		const roomTypes = await exports.getRoomsInHotel(hotel.Id_Hotel);
		const hotelStats = [];

		for (const roomType of roomTypes) {
			const availableRooms = await exports.getAvailableRoomsForHotelAndRoomType(hotel.Id_Hotel, roomType.Id_RoomType, startDate, endDate);
			const bookedRooms = await exports.getBookedRoomsForHotelAndRoomType(hotel.Id_Hotel, roomType.Id_RoomType, startDate, endDate);

			const nightsAvailable = availableRooms.length;
			const nightsBooked = bookedRooms.length;

			hotelStats.push({
				roomType: roomType.Name,
				nightsAvailable,
				nightsBooked,
			});
		}

		statistics.push({
			hotel: hotel.Name,
			stats: hotelStats,
		});
	}

	return statistics;
};

exports.CalculateRoomRevenueForHotelAndRoomType = async function (hotelId, roomTypeId, startDate, endDate) {
	const query = `
      SELECT SUM(RoomType.PricePerNight * Reservation.Duration) AS RoomRevenue
      FROM Room
      INNER JOIN RoomHotelAssociation ON Room.Id_Room = RoomHotelAssociation.Id_Room
      INNER JOIN RoomType ON RoomHotelAssociation.Id_RoomType = RoomType.Id_RoomType
      INNER JOIN UserReservation ON Room.Id_Room = UserReservation.Id_Room
      INNER JOIN Reservation ON UserReservation.Id_Reservation = Reservation.Id_Reservation
      WHERE RoomHotelAssociation.Id_Hotel = ? AND RoomHotelAssociation.Id_RoomType = ? AND Reservation.CheckDateIn >= ? AND Reservation.CheckDateOut <= ?
  `;

	const result = await executeQueryWithResult(query, [hotelId, roomTypeId, startDate, endDate]);
	return result[0].RoomRevenue || 0;
};

exports.CalculateServiceRevenueForHotelAndRoomType = async function (hotelId, roomTypeId, startDate, endDate) {
	const query = `
      SELECT SUM(Services.Price) AS ServiceRevenue
      FROM Services
      INNER JOIN ReservationServices ON Services.Id_Services = ReservationServices.Id_Services
      INNER JOIN Reservation ON ReservationServices.Id_Reservation = Reservation.Id_Reservation
      INNER JOIN UserReservation ON Reservation.Id_Reservation = UserReservation.Id_Reservation
      INNER JOIN RoomHotelAssociation ON UserReservation.Id_Room = RoomHotelAssociation.Id_Room
      INNER JOIN Hotel ON UserReservation.Id_Hotel = Hotel.Id_Hotel
      WHERE Hotel.Id_Hotel = ? AND RoomHotelAssociation.Id_RoomType = ? AND Reservation.CheckDateIn >= ? AND Reservation.CheckDateOut <= ?
  `;

	const result = await executeQueryWithResult(query, [hotelId, roomTypeId, startDate, endDate]);
	return result[0].ServiceRevenue || 0;
};

exports.CalculateHotelStatsForRoomType = async function (hotelId, roomTypeId, startDate, endDate) {
	const hotel = await exports.getHotelById(hotelId);
	const roomType = await exports.getRoomTypeById(roomTypeId);

	if (!hotel || !roomType) {
		return null;
	}

	const stats = {
		hotel: hotel.Name,
		roomType: roomType.Name,
		nightsAvailable: 0,
		nightsBooked: 0,
		roomRevenue: 0,
		serviceRevenue: 0,
	};

	const availableRooms = await exports.getAvailableRoomsForHotelAndRoomType(hotelId, roomTypeId, startDate, endDate);
	const bookedRooms = await exports.getBookedRoomsForHotelAndRoomType(hotelId, roomTypeId, startDate, endDate);

	stats.nightsAvailable = availableRooms.length;
	stats.nightsBooked = bookedRooms.length;

	stats.roomRevenue = await exports.CalculateRoomRevenueForHotelAndRoomType(hotelId, roomTypeId, startDate, endDate);
	stats.serviceRevenue = await exports.CalculateServiceRevenueForHotelAndRoomType(hotelId, roomTypeId, startDate, endDate);

	return stats;
};

exports.createStatistic = async function (hotelId, roomTypeId, startDate, endDate) {
	const stats = await exports.getHotelStats(hotelId, roomTypeId, startDate, endDate);

	if (!stats) {
		return null;
	}

	const totalRevenue = stats.roomRevenue + stats.serviceRevenue;

	const query = `
      INSERT INTO Statistics (StatStartDate, StatEndDate, NightsAvailable, NightsBooked, RoomRevenue, ServiceRevenue, TotalRevenue)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

	const result = await executeQueryRun(query, [startDate, endDate, stats.nightsAvailable, stats.nightsBooked, stats.roomRevenue, stats.serviceRevenue, totalRevenue]);

	return result.lastInsertRowid;
};

exports.createStatistic = async function (hotelId, startDate, endDate) {
	const roomtypes = await exports.getRoomTypesForHotel(hotelId);

	if (!roomtypes) {
		return null;
	}

	for (const roomtype of roomtypes) {
		const stats = await exports.CalculateHotelStatsForRoomType(hotelId, roomtype.Id_RoomType, startDate, endDate);
		const totalRevenue = stats.roomRevenue + stats.serviceRevenue;

		const insertStatisticsQuery = `
          INSERT INTO Statistics (StatStartDate, StatEndDate, NightsAvailable, NightsBooked, RoomRevenue, ServiceRevenue, TotalRevenue)
          VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

		const result = await executeQueryRun(insertStatisticsQuery, [startDate, endDate, stats.nightsAvailable, stats.nightsBooked, stats.roomRevenue, stats.serviceRevenue, totalRevenue]);

		const Id_Statistic = result.lastInsertRowid;
		const insertHotelStatsQuery = `
            INSERT INTO HotelStats (Id_Hotel, Id_RoomType, Id_Statistic)
            VALUES (?, ?, ?)
        `;
		await executeQueryRun(insertHotelStatsQuery, [hotelId, roomtype.Id_RoomType, Id_Statistic]);
	}
};

exports.getRoomReservationsByHotel = function (hotelId) {
	const roomReservations = [];

	// Get all the rooms in a specific hotel
	const roomsQuery = db.prepare(`
        SELECT Room.Id_Room
        FROM RoomHotelAssociation
        JOIN Room ON RoomHotelAssociation.Id_Room = Room.Id_Room
        WHERE RoomHotelAssociation.Id_Hotel = ?
    `);
	const rooms = roomsQuery.all(hotelId);

	// Pour chaque chambre, obtenir les dates de réservation
	const reservationQuery = db.prepare(`
        SELECT Reservation.CheckDateIn, Reservation.CheckDateOut
        FROM UserReservation
        JOIN Reservation ON UserReservation.Id_Reservation = Reservation.Id_Reservation
        WHERE UserReservation.Id_Room = ? AND UserReservation.Id_Hotel = ?
    `);

	rooms.forEach((room) => {
		const reservations = reservationQuery.all(room.Id_Room, hotelId);
		roomReservations.push({
			Id_Room: room.Id_Room,
			Reservations: reservations,
		});
	});

	return roomReservations;
};

async function testCreateStatistic() {
	const hotelId = 1;
	const startDate = '2024-05-01';
	const endDate = '2024-05-31';

	try {
		const statisticId = await exports.createStatistic(hotelId, startDate, endDate);
		console.log('Statistic ID:', statisticId);
	} catch (error) {
		console.error('Error:', error);
	}
}

//testCreateStatistic();

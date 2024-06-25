let model = require('./model.js');
let classList = require('./class.js');
const Sqlite = require('better-sqlite3');
const db = new Sqlite('hotel-management.db');

function testInsertHotel() {
	const hotel = new classList.Hotel('Hotel Avengers', 'Marseille', 'JSp', '500', '44444', 'azeaze@azeaze.fr');
	model.createHotel(hotel);
}

function testInsertClient() {
	const client = new classList.User('123 Main St', '555-5555', 'password123', 'client@example.com', 'Gold', 'John', 'Doe');
	const clientId = model.createClient(client);
}

function testInsertEmployee() {
	const employee = new classList.Employee('789 Oak St', '555-7890', 'password456', 'employee@example.com', 'Silver', 'Alice', 'Johnson');
	const employeeId = model.createEmployee(employee);
}

function testInsertServices() {
	const service1 = new classList.Services('Nettoyage', 20);
	model.createServices(service1);
	const service2 = new classList.Services('Piscine', 30);
	model.createServices(service2);
	const service3 = new classList.Services('Sauna', 40);
	model.createServices(service3);
}

function testInsertRoom() {
	const room1 = new classList.Room('TRUE');
	model.createRoom(room1);

	const room2 = new classList.Room('TRUE');
	model.createRoom(room2);

	const room3 = new classList.Room('TRUE');
	model.createRoom(room3);
}

function testInsertRoomType() {
	const roomtype1 = new classList.RoomType('Suite pas ouf', 4, 0, 565656565, 90);
	model.createRoomType(roomtype1);
	const roomtype2 = new classList.RoomType('Suite bien', 6, 1, 565656565, 150);
	model.createRoomType(roomtype2);
	const roomtype3 = new classList.RoomType('Suite pres', 10, 3, 565656565, 900);
	model.createRoomType(roomtype3);
}

function testInsertBilling() {
	const billing1 = new classList.Billing('200', 'FALSE', '150', '50');
	model.createBilling(billing1);
	const billing2 = new classList.Billing('1000', 'TRUE', '900', '100');
	model.createBilling(billing2);
	const billing3 = new classList.Billing('100', 'FALSE', '90', '10');
	model.createBilling(billing3);
}

function testInsertReservation() {
	const reservation1 = new classList.Reservation('08/05/2024', '15/05/2024', 7, 'TRUE', 'FALSE', 1);
	model.createReservation(reservation1);
	const reservation2 = new classList.Reservation('08/05/2024', '22/05/2024', 14, 'FALSE', 'FALSE', 1);
	model.createReservation(reservation2);
	const reservation3 = new classList.Reservation('01/05/2024', '07/05/2024', 6, 'TRUE', 'TRUE', 1);
	model.createReservation(reservation3);
}

function testAssociateServicesHotel() {
	const associateRoomToHotel1 = new classList.HotelServices(1, 1);
	model.assignementServiceHotel(associateRoomToHotel1);
	const associateRoomToHotel2 = new classList.HotelServices(1, 2);
	model.assignementServiceHotel(associateRoomToHotel2);
	const associateRoomToHotel3 = new classList.HotelServices(1, 3);
	model.assignementServiceHotel(associateRoomToHotel3);
}

function testUserReservationHotel() {
	const associateUserReservationHotel1 = new classList.UserReservation(1, 1, 1, 1);
	model.createUserReservation(associateUserReservationHotel1);
	const associateUserReservationHotel2 = new classList.UserReservation(1, 2, 1, 2);
	model.createUserReservation(associateUserReservationHotel2);
	const associateUserReservationHotel3 = new classList.UserReservation(1, 3, 1, 3);
	model.createUserReservation(associateUserReservationHotel3);
}

function testLinkRoomTypeRoom() {
	const linkRoomTypeRoom1 = new classList.RoomHotel(1, 2, 1);
	model.associateRoomHotelType(linkRoomTypeRoom1);
	const linkRoomTypeRoom2 = new classList.RoomHotel(1, 3, 2);
	model.associateRoomHotelType(linkRoomTypeRoom2);
	const linkRoomTypeRoom3 = new classList.RoomHotel(1, 1, 3);
	model.associateRoomHotelType(linkRoomTypeRoom3);
}

function testAssignementEmployee() {
	model.assignEmployeeToHotel(1, 2, 'TRUE');
}

function ajoutImage() {
	model.createImage('http://localhost:2000/image/room1_imageazeazesqqdsdqsd.jpg');
	model.createImage('http://localhost:2000/image/hotel1_imageaezegfdsgfdghgfd.jpg');
}

function run() {
	testInsertHotel();
	testInsertClient();
	testInsertEmployee();
	testInsertServices();
	testInsertRoom();
	testInsertRoomType();
	testInsertBilling();
	testInsertReservation();
	testAssociateServicesHotel();
	testUserReservationHotel();
	testLinkRoomTypeRoom();
	testAssignementEmployee();
}

//run()

//const query = db.prepare(`DROP TABLE ResetPassword`);
//query.run();

/*
const query = db.prepare('DROP TABLE ImageRoom')
const query2 = db.prepare('DROP TABLE ImageHotel')
const query3 = db.prepare('DROP TABLE Images')

query.run()
query2.run()
query3.run()
*/

/*

async function testGetRoomAvailability() {
    const roomId = 1;
    const startMonth = 5;
    const startYear = 2024;
    const endMonth = 6;
    const endYear = 2024;

    try {
        const reservedDates = await model.getRoomAvailability(roomId, startMonth, startYear, endMonth, endYear);
        console.log('Reserved Dates:', reservedDates);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function testGetReservationIdsForRoom() {
    const roomId = 1;
    const startMonth = 5;
    const startYear = 2024;
    const endMonth = 6;
    const endYear = 2024;

    try {
        const reservationIds = await model.getReservationIdsForRoom(roomId, startMonth, startYear, endMonth, endYear);
        console.log('Reservation IDs:', reservationIds);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function testGetAvailableRoomsForHotelAndRoomType() {
    const hotelId = 1;
    const roomTypeId = 1;
    const startDate = '2024-05-01';
    const endDate = '2024-05-31';

    try {
        const availableRooms = await model.getAvailableRoomsForHotelAndRoomType(hotelId, roomTypeId, startDate, endDate);
        console.log('Available Rooms:', availableRooms);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function testGetBookedRoomsForHotelAndRoomType() {
    const hotelId = 1;
    const roomTypeId = 1;
    const startDate = '2024-05-01';
    const endDate = '2024-05-31';

    try {
        const bookedRooms = await model.getBookedRoomsForHotelAndRoomType(hotelId, roomTypeId, startDate, endDate);
        console.log('Booked Rooms:', bookedRooms);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function testGetRoomRevenueForHotel() {
    const hotelId = 1;
    const startDate = '2024-05-01';
    const endDate = '2024-05-31';

    try {
        const roomRevenue = await model.getRoomRevenueForHotel(hotelId, startDate, endDate);
        console.log('Room Revenue:', roomRevenue);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function testGetServiceRevenueForHotel() {
    const hotelId = 1;
    const startDate = '2024-05-01';
    const endDate = '2024-05-31';

    try {
        const serviceRevenue = await model.getServiceRevenueForHotel(hotelId, startDate, endDate);
        console.log('Service Revenue:', serviceRevenue);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function testGetStatisticsForHotels() {
    const startDate = '2024-05-01';
    const endDate = '2024-05-31';

    try {
        const statistics = await model.getStatisticsForHotels(startDate, endDate);
        console.log('Statistics for Hotels:', statistics);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function testGetRevenueForHotels() {
    const startDate = '2024-05-01';
    const endDate = '2024-05-31';

    try {
        const revenue = await model.getRevenueForHotels(startDate, endDate);
        console.log('Revenue for Hotels:', revenue);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function testGetHotelStats() {
    const hotelId = 1;
    const startDate = '2024-05-01';
    const endDate = '2024-05-31';

    try {
        const stats = await model.getHotelStats(hotelId, startDate, endDate);
        console.log('Statistics for Hotel:', stats);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function testCreateStatistic() {
    const hotelId = 1;
    const startDate = '2024-05-01';
    const endDate = '2024-05-31';

    try {
        const statisticId = await model.createStatistic(hotelId, startDate, endDate);
        console.log('Created Statistic ID:', statisticId);
    } catch (error) {
        console.error('Error:', error);
    }
}


// Call the test functions
(async () => {
    await testGetRoomAvailability();
    await testGetReservationIdsForRoom();
    await testGetAvailableRoomsForHotelAndRoomType();
    await testGetBookedRoomsForHotelAndRoomType();
    await testGetRoomRevenueForHotel();
    await testGetServiceRevenueForHotel();
    await testGetStatisticsForHotels();
    await testGetRevenueForHotels();
    await testGetHotelStats();
    await testCreateStatistic();

})();
*/

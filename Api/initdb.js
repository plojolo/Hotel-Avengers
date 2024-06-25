const Sqlite = require('better-sqlite3');
const db = new Sqlite('hotel-management.db');
//.headers ON and .mode columns to allign everything



// ENTYTIES --------------------------------------------

function initHotelTable() {
    const createHotelTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS Hotel(
            Id_Hotel INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT,
            City TEXT,
            Address TEXT,
            Capacity INTEGER,
            Phone TEXT,
            Email TEXT
        )
    `);

    createHotelTable.run();
}


function initUserInfo() {
    const createClientTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS UserInfo (
            Id_UserInfo INTEGER PRIMARY KEY AUTOINCREMENT,
            Adress TEXT,
            Phone TEXT,
            Password TEXT,
            Email TEXT,
            FidelityLevel TEXT DEFAULT 'BASIC',
            FidelityLevel TEXT DEFAULT 'BASIC',
            FirstName TEXT,
            LastName TEXT
        )
    `);
    createClientTable.run();
}

function initClientTable() {
    const createClientTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS Client (
            Id_UserInfo INTEGER PRIMARY KEY AUTOINCREMENT,
            FOREIGN KEY(Id_UserInfo) REFERENCES UserInfo(Id_UserInfo)
        )
    `);

    createClientTable.run();
}


function initEmployeeTable() {
    const createEmployeeTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS Employee (
            Id_UserInfo INTEGER PRIMARY KEY AUTOINCREMENT,
            FOREIGN KEY(Id_UserInfo) REFERENCES UserInfo(Id_UserInfo)
        )
    `);

    createEmployeeTable.run();
}



function initRoomTypeTable() {
    const createRoomTypeTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS RoomType (
            Id_RoomType INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT,
            Capacity INTEGER,
            Television TEXT,
            Phone TEXT,
            PricePERNight INTEGER
        )
    `);

    createRoomTypeTable.run();
}

function initRoomTable() {
    const createRoomTypeTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS Room (
            Id_Room INTEGER PRIMARY KEY AUTOINCREMENT
            Id_Room INTEGER PRIMARY KEY AUTOINCREMENT
        )
    `);

    createRoomTypeTable.run();

}


function initReservationTable() {
    const createReservationTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS Reservation (
        Id_Reservation INTEGER PRIMARY KEY AUTOINCREMENT,
        CheckDateIn TEXT, -- Date the client is supposed to check in
        CheckDateOut TEXT, -- Date the client is supposed to check out
        ExactCheckInTime TEXT DEFAULT 'NULL', -- Exact date and time the client actually checked in
        AccompanyingCount INTEGER DEFAULT 0,
        ExactCheckInTime TEXT DEFAULT 'NULL', -- Exact date and time the client actually checked in
        AccompanyingCount INTEGER DEFAULT 0,
        Duration INTEGER,
        Confirmed TEXT DEFAULT 'FALSE',
        CheckedOut TEXT DEFAULT 'FALSE',
        Confirmed TEXT DEFAULT 'FALSE',
        CheckedOut TEXT DEFAULT 'FALSE',
        CreatorID INTEGER
        )
    `);

    createReservationTable.run();
    // const createStatTrigger = db.prepare(`
    //     CREATE TRIGGER IF NOT EXISTS update_statistics
    //     AFTER UPDATE OF CONFIRMED ON Reservation
    //     BEGIN
    //         CREATE TEMP TABLE _Temp(ReservationID INTEGER, HotelID INTEGER, RoomTypeID INTEGER);
    //         INSERT INTO _Temp(ReservationID, HotelID, RoomTypeID) VALUES(NEW.Id_Reservation, (SELECT Id_Hotel FROM UserReservation WHERE Id_Reservation = NEW.Id_Reservation),
    //         (SELECT Id_RoomType FROM RoomHotelAssociation WHERE Id_Room = (SELECT Id_Room FROM UserReservation WHERE Id_Reservation = NEW.Id_Reservation)));
    //         INSERT INTO Statistics(StatStartDate, StatEndDate, NightsAvailable, NightsBooked, RoomRevenue, ServiceRevenue, TotalRevenue) VALUES(
    //         `);
    // const createStatTrigger = db.prepare(`
    //     CREATE TRIGGER IF NOT EXISTS update_statistics
    //     AFTER UPDATE OF CONFIRMED ON Reservation
    //     BEGIN
    //         CREATE TEMP TABLE _Temp(ReservationID INTEGER, HotelID INTEGER, RoomTypeID INTEGER);
    //         INSERT INTO _Temp(ReservationID, HotelID, RoomTypeID) VALUES(NEW.Id_Reservation, (SELECT Id_Hotel FROM UserReservation WHERE Id_Reservation = NEW.Id_Reservation),
    //         (SELECT Id_RoomType FROM RoomHotelAssociation WHERE Id_Room = (SELECT Id_Room FROM UserReservation WHERE Id_Reservation = NEW.Id_Reservation)));
    //         INSERT INTO Statistics(StatStartDate, StatEndDate, NightsAvailable, NightsBooked, RoomRevenue, ServiceRevenue, TotalRevenue) VALUES(
    //         `);
}

function initServicesTable() {
    const createServicesTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS Services (
            Id_Services INTEGER PRIMARY KEY AUTOINCREMENT,
            Name TEXT,
            Price Integer
        )
    `);

    createServicesTable.run();
}


function initBillingTable() {
    const createBillingTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS Billing (
            Id_Billing INTEGER PRIMARY KEY AUTOINCREMENT,
            Total TEXT,
            Paid TEXT,
            RoomTotalCost TEXT,
            ServiceTotalCost TEXT
        )
    `);

    createBillingTable.run();
}

function initStatisticsTable() {
    const createStatisticsTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS Statistics (
            Id_Hotel INTEGER PRIMARY KEY AUTOINCREMENT,
            Id_Hotel INTEGER PRIMARY KEY AUTOINCREMENT,
            StatStartDate TEXT,
            StatEndDate TEXT,
            NightsAvailable INTEGER,
            NightsBooked INTEGER,
            RoomRevenue INTEGER,
            ServiceRevenue INTEGER,
            TotalRevenue INTEGER
        )
    `);

    createStatisticsTable.run();
}

function initRoomStats() {
    const delRoomStats = db.prepare(`DROP VIEW IF EXISTS RoomStats;`);
    const createRoomStats = db.prepare(`
CREATE VIEW RoomStats AS
SELECT
    RoomType.Id_RoomType,
    RoomType.Name AS RoomTypeName,
    COUNT(RoomHotelAssociation.Id_Room) AS TotalRooms,
    COUNT(Reservation.Id_Reservation) AS Reservations,
	(COUNT(RoomHotelAssociation.Id_Room) * 90) - COUNT(Reservation.Id_Reservation) as AvailableNights,
    COUNT(Reservation.Id_Reservation) * RoomType.PricePERNight AS TotalRevenue
FROM
    RoomType
LEFT JOIN
    RoomHotelAssociation ON RoomType.Id_RoomType = RoomHotelAssociation.Id_RoomType
LEFT JOIN
    (SELECT Id_Reservation, Id_Room FROM UserReservation) AS UserReservation ON RoomHotelAssociation.Id_Room = UserReservation.Id_Room
LEFT JOIN
    (SELECT Id_Reservation, CheckDateIn FROM Reservation) AS Reservation ON UserReservation.Id_Reservation = Reservation.Id_Reservation
GROUP BY
    RoomType.Id_RoomType,
    RoomType.Name;
        `);
        delRoomStats.run();
        createRoomStats.run();
}

function initRoomStats() {
    const delRoomStats = db.prepare(`DROP VIEW IF EXISTS RoomStats;`);
    const createRoomStats = db.prepare(`
CREATE VIEW RoomStats AS
SELECT
    RoomType.Id_RoomType,
    RoomType.Name AS RoomTypeName,
    COUNT(RoomHotelAssociation.Id_Room) AS TotalRooms,
    COUNT(Reservation.Id_Reservation) AS Reservations,
	(COUNT(RoomHotelAssociation.Id_Room) * 90) - COUNT(Reservation.Id_Reservation) as AvailableNights,
    COUNT(Reservation.Id_Reservation) * RoomType.PricePERNight AS TotalRevenue
FROM
    RoomType
LEFT JOIN
    RoomHotelAssociation ON RoomType.Id_RoomType = RoomHotelAssociation.Id_RoomType
LEFT JOIN
    (SELECT Id_Reservation, Id_Room FROM UserReservation) AS UserReservation ON RoomHotelAssociation.Id_Room = UserReservation.Id_Room
LEFT JOIN
    (SELECT Id_Reservation, CheckDateIn FROM Reservation) AS Reservation ON UserReservation.Id_Reservation = Reservation.Id_Reservation
GROUP BY
    RoomType.Id_RoomType,
    RoomType.Name;
        `);
        delRoomStats.run();
        createRoomStats.run();
}

function initImagesTable() {
    const createImagesTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS Images (
            Id_Images INTEGER PRIMARY KEY AUTOINCREMENT,
            ImagePath TEXT
        )
    `);

    createImagesTable.run();
}

function initResetPasswordTable() {
    const createResetPasswordTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS ResetPassword (
function initResetPasswordTable() {
    const createResetPasswordTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS ResetPassword (
            Id_UserInfo INTEGER,
            Token TEXT,
            TokenExpired TEXT,
            FOREIGN KEY(Id_UserInfo) REFERENCES UserInfo (Id_UserInfo)
            PRIMARY KEY(Id_UserInfo, Token, TokenExpired)
        )
    `);

    createResetPasswordTable.run();
}


function initSessionTable() {
    const createSessionTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS sessions (
            sid text,
            expired TEXT,
            sess TEXT
        )
    `);

    createSessionTable.run();
}

// ASSOCIATIONS --------------------------------------------


    createSessionTable.run();
}

// ASSOCIATIONS --------------------------------------------



function initEmployeeHotelAssignmentTable() {
    const createEmployeeHotelAssignmentTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS EmployeeHotelAssignment (
            Id_Hotel INTEGER,
            Id_UserInfo INTEGER,
            Is_Admin TEXT,
            FOREIGN KEY(Id_Hotel) REFERENCES Hotel(Id_Hotel),
            FOREIGN KEY(Id_UserInfo) REFERENCES Employee(Id_UserInfo)
        )
    `);

    createEmployeeHotelAssignmentTable.run();
}


function initUserReservationHotel() {
    const createClientCurrentReservationsTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS UserReservation (
            Id_Hotel INTEGER,
            Id_Reservation INTEGER,
            Id_UserInfo INTEGER,
            Id_Room INTEGER,
            PRIMARY KEY(Id_Hotel, Id_Reservation, Id_UserInfo, Id_Room),
            FOREIGN KEY(Id_Hotel) REFERENCES Hotel(Id_Hotel),
            FOREIGN KEY(Id_Reservation) REFERENCES Reservation(Id_Reservation),
            FOREIGN KEY(Id_UserInfo) REFERENCES UserInfo(Id_UserInfo),
            FOREIGN KEY(Id_Room) REFERENCES Room(Id_Room)
        )
    `);

    createClientCurrentReservationsTable.run();
}

function initRoomHotelAssociationTable() {
    const createRoomTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS RoomHotelAssociation (
            Id_Hotel INTEGER,
            Id_RoomType INTEGER,
            Id_Room INTEGER,
            PRIMARY KEY(Id_Hotel, Id_Room, Id_RoomType),
            FOREIGN KEY(Id_Hotel) REFERENCES Hotel(Id_Hotel),
            FOREIGN KEY(Id_Room) REFERENCES Room(Id_Room),
            FOREIGN KEY(Id_RoomType) REFERENCES RoomType(Id_RoomType)
        )
    `);

    createRoomTable.run();
}
function initReservationServicesTable() {
    const createReservationServicesTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS ReservationServices (
            Id_Reservation INTEGER,
            Id_Services INTEGER,
            PRIMARY KEY(Id_Reservation, Id_Services),
            FOREIGN KEY(Id_Reservation) REFERENCES Reservation(Id_Reservation),
            FOREIGN KEY(Id_Services) REFERENCES Services(Id_Services)
        )
    `);

    createReservationServicesTable.run();
}

function initClientBillingTable() {
    const createClientBillingTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS ClientBilling (
            Id_Hotel INTEGER,
            Id_Reservation INTEGER,
            Id_Billing INTEGER,
            Id_UserInfo INTEGER,
            PRIMARY KEY(Id_Hotel, Id_Reservation, Id_Billing, Id_UserInfo),
            FOREIGN KEY(Id_Hotel) REFERENCES Hotel(Id_Hotel),
            FOREIGN KEY(Id_Reservation) REFERENCES Reservation(Id_Reservation),
            FOREIGN KEY(Id_Billing) REFERENCES Billing(Id_Billing),
            FOREIGN KEY(Id_UserInfo) REFERENCES UserInfo(Id_UserInfo)
        )
    `);

    createClientBillingTable.run();
}

function initHotelStats() {
    const createHotelStats = db.prepare(`
        CREATE TABLE IF NOT EXISTS HotelStats (
            Id_Hotel INTEGER,
            Id_RoomType INTEGER,
            Id_Statistic INTEGER,
            PRIMARY KEY(Id_Hotel, Id_RoomType, Id_Statistic),
            FOREIGN KEY(Id_Hotel) REFERENCES Hotel(Id_Hotel),
            FOREIGN KEY(Id_RoomType) REFERENCES RoomType(Id_RoomType),
            FOREIGN KEY(Id_Statistic) REFERENCES Statistics(Id_Statistic)
            FOREIGN KEY(Id_Statistic) REFERENCES Statistics(Id_Statistic)
        )
    `);

    createHotelStats.run();

}

function initHotelServices() {
    const createHotelServices = db.prepare(`
        CREATE TABLE IF NOT EXISTS HotelServices (
            Id_Hotel INTEGER,
            Id_Services INTEGER,
            PRIMARY KEY(Id_Hotel, Id_Services),
            FOREIGN KEY(Id_Hotel) REFERENCES Hotel(Id_Hotel),
            FOREIGN KEY(Id_Services) REFERENCES Services(Id_Services)
        )
    `);

    createHotelServices.run();
}

function initImageHotel() {
    const createHotelServices = db.prepare(`
        CREATE TABLE IF NOT EXISTS ImageHotel (
            Id_Hotel INTEGER,
            Id_Images INTEGER,
            PRIMARY KEY(Id_Hotel, Id_Images),
            FOREIGN KEY(Id_Hotel) REFERENCES Hotel(Id_Hotel),
            FOREIGN KEY(Id_Images) REFERENCES Images(Id_Images)
        )
    `);


    createHotelServices.run();
}

function initImageRoom() {
    const createHotelServices = db.prepare(`
        CREATE TABLE IF NOT EXISTS ImageRoom (
            Id_RoomType INTEGER,
            Id_Images INTEGER,
            PRIMARY KEY(Id_RoomType, Id_Images),
            FOREIGN KEY(Id_RoomType) REFERENCES RoomType(Id_RoomType),
            FOREIGN KEY(Id_Images) REFERENCES Images(Id_Images)
        )
    `);

    createHotelServices.run();
}

// INITIALIZATION --------------------------------------------

function initializeDatabase() {
    initHotelTable();
    initClientTable();
    initEmployeeTable();
    initRoomTypeTable();
    initRoomTable();
    initReservationTable();
    initServicesTable();
    initBillingTable();
    initStatisticsTable();
    initImagesTable();
    initEmployeeHotelAssignmentTable();
    initRoomHotelAssociationTable();
    initReservationServicesTable();
    initClientBillingTable();
    initHotelStats();
    initHotelServices();
    initImageRoom();
    initImageHotel();
    initUserReservationHotel();
    initUserInfo();
    initSessionTable();
    initRoomStats();
    initResetPasswordTable();
}

initializeDatabase()






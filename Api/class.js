// Constructeurs

class UserInfo {
  constructor(adress, phone, password, email, fidelityLevel, firstName, lastName) {
    this.adress = adress;
    this.phone = phone;
    this.password = password;
    this.email = email;
    this.fidelityLevel = fidelityLevel;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

class Employee extends UserInfo {
  constructor(adress, phone, password, email, fidelityLevel, firstName, lastName) {
    super(adress, phone, password, email, fidelityLevel, firstName, lastName);
  }
}

class User extends UserInfo {
  constructor(adress, phone, password, email, fidelityLevel, firstName, lastName) {
    super(adress, phone, password, email, fidelityLevel, firstName, lastName);
  }
}

class Hotel {
  constructor(name, city, address, capacity, phone, email) {
    this.name = name;
    this.city = city;
    this.address = address;
    this.capacity = capacity;
    this.phone = phone;
    this.email = email;
  }
}

class RoomType {
  constructor(name, capacity, television, phone, pricePerNight) {
    this.name = name;
    this.capacity = capacity;
    this.television = television;
    this.phone = phone;
    this.pricePerNight = pricePerNight;
  }
}

class Room {
  constructor(isAvailable) {
    this.isAvailable = isAvailable;
  }
}

class RoomHotel {
  constructor(hotel_ID, roomTypeId, roomId) {
    this.hotel_ID = hotel_ID;
    this.roomTypeId = roomTypeId;
    this.roomId = roomId;
  }
}

class Reservation {
  constructor(checkDateIn, checkDateOut, duration, confirmed, hasEnded, creatorId) {
    this.checkDateIn = checkDateIn;
    this.checkDateOut = checkDateOut;
    this.duration = duration;
    this.confirmed = confirmed;
    this.hasEnded = hasEnded;
    this.creatorId = creatorId;
  }
}


class UserReservation {
  constructor(Id_Hotel, Id_Reservation, Id_UserInfo, Id_Room) {
    this.Id_Hotel = Id_Hotel;
    this.Id_Reservation = Id_Reservation;
    this.Id_UserInfo = Id_UserInfo;
    this.Id_Room = Id_Room;
  }
}

class Services {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}

class Billing {
  constructor(total, paid, roomTotalCost, serviceTotalCost) {
    this.total = total;
    this.paid = paid;
    this.roomTotalCost = roomTotalCost;
    this.serviceTotalCost = serviceTotalCost;
  }
}

class Statistics {
  constructor(statStartDate, statEndDate, nightsAvailable, nightsBooked, roomRevenue, serviceRevenue, totalRevenue) {
    this.statStartDate = statStartDate;
    this.statEndDate = statEndDate;
    this.nightsAvailable = nightsAvailable;
    this.nightsBooked = nightsBooked;
    this.roomRevenue = roomRevenue;
    this.serviceRevenue = serviceRevenue;
    this.totalRevenue = totalRevenue;
  }
}

class Image {
  constructor(link) {
    this.link = link;
  }
}

class EmployeeHotelAssignment {
  constructor(employeeId, hotelId, is_Admin) {
    this.employeeId = employeeId;
    this.hotelId = hotelId;
    this.is_Admin = is_Admin;
  }
}

class ClientBilling {
  constructor(clientId, billingId, hotelId, reservationId) {
    this.clientId = clientId;
    this.billingId = billingId;
    this.hotelId = hotelId;
    this.reservationId = reservationId;
  }
}

class HotelStats {
  constructor(hotelId, roomId, statisticId) {
    this.hotelId = hotelId;
    this.roomId = roomId;
    this.statisticId = statisticId;
  }
}

class HotelServices {
  constructor(hotelId, serviceId) {
    this.hotelId = hotelId;
    this.serviceId = serviceId;
  }
}

class ImageHotel {
  constructor(hotelId, imageId) {
    this.hotelId = hotelId;
    this.imageId = imageId;
  }
}

class ImageRoom {
  constructor(roomTypeId, imageId) {
    this.roomTypeId = roomTypeId;
    this.imageId = imageId;
  }
}

module.exports = {
  UserInfo,
  Employee,
  User,
  Hotel,
  RoomType,
  Reservation,
  UserReservation,
  Services,
  Billing,
  Statistics,
  Image,
  EmployeeHotelAssignment,
  ClientBilling,
  HotelStats,
  HotelServices,
  ImageHotel,
  ImageRoom,
  RoomHotel,
  Room,
};

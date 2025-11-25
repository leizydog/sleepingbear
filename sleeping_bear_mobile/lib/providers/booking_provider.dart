import 'package:flutter/material.dart';
import 'package:sleeping_bear_mobile/models/booking.dart';
import 'package:sleeping_bear_mobile/models/property.dart';

class BookingProvider with ChangeNotifier {
  List<Booking> _bookings = [];
  bool _isLoading = false;

  List<Booking> get bookings => _bookings;
  bool get isLoading => _isLoading;

  Future<void> fetchBookings() async {
    _isLoading = true;
    notifyListeners();

    // Simulate network delay
    await Future.delayed(const Duration(seconds: 1));

    // DUMMY DATA
    _bookings = [
      Booking(
        id: 1,
        userId: 101,
        propertyId: 201,
        startDate: DateTime.now().add(const Duration(days: 2)),
        endDate: DateTime.now().add(const Duration(days: 5)),
        totalAmount: 4500.0,
        status: BookingStatus.confirmed,
        createdAt: DateTime.now(),
        
        // DUMMY PROPERTY 1
        property: Property(
          id: 201,
          ownerId: 99,
          name: 'Cozy Studio in Pasig',
          description: 'A beautiful place to stay.',
          address: 'Pasig City, Metro Manila',
          pricePerMonth: 15000,
          bedrooms: 1,
          bathrooms: 1,
          sizeSqm: 30,
          status: 'available', 
          imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),

          // --- FIXED: ADDED MISSING BOOLEANS ---
          // These prevent the "Null can't be assigned to bool" error
          acceptsBpi: true,   
          acceptsGcash: true,
          acceptsCash: false,
          isAvailable: true, 
        ),
      ),
      Booking(
        id: 2,
        userId: 101,
        propertyId: 202,
        startDate: DateTime.now().add(const Duration(days: 10)),
        endDate: DateTime.now().add(const Duration(days: 12)),
        totalAmount: 12000.0,
        status: BookingStatus.pending,
        createdAt: DateTime.now(),
        
        // DUMMY PROPERTY 2
        property: Property(
          id: 202,
          ownerId: 99,
          name: 'Penthouse View',
          description: 'Luxury living at its finest.',
          address: 'Makati City, Metro Manila',
          pricePerMonth: 45000,
          bedrooms: 2,
          bathrooms: 2,
          sizeSqm: 85,
          status: 'available',
          imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),

          // --- FIXED: ADDED MISSING BOOLEANS ---
          acceptsBpi: true,
          acceptsGcash: false,
          acceptsCash: true,
          isAvailable: true,
        ),
      ),
    ];

    _isLoading = false;
    notifyListeners();
  }
}
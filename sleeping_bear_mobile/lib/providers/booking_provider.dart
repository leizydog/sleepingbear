import 'package:flutter/material.dart';
import 'package:sleeping_bear_mobile/models/booking.dart';
import 'package:sleeping_bear_mobile/services/api_service.dart';

class BookingProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<Booking> _bookings = [];
  List<Booking> _ownerBookings = [];
  bool _isLoading = false;
  String? _error;

  List<Booking> get bookings => _bookings;
   List<Booking> get ownerBookings => _ownerBookings;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchBookings() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _bookings = await _apiService.getMyBookings();
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ✅ NEW: Check Status Method
  Future<BookingStatus?> getBookingStatus(int id) async {
    try {
      final booking = await _apiService.getBookingById(id);
      return booking.status;
    } catch (e) {
      print("Error checking status: $e");
      return null;
    }
  }

  Future<Booking?> createBooking({
    required int propertyId,
    required DateTime startDate,
    required DateTime endDate,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final newBooking = await _apiService.createBooking(
        propertyId: propertyId,
        startDate: startDate,
        endDate: endDate,
      );
      
      await fetchBookings();
      
      _isLoading = false;
      notifyListeners();
      
      return newBooking;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  
 

  Future<void> fetchOwnerBookings() async {
    _isLoading = true;
    notifyListeners();
    try {
      _ownerBookings = await _apiService.getOwnerBookings();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> cancelBooking(int id) async {
    try {
      await _apiService.cancelBooking(id);
      _bookings.removeWhere((b) => b.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
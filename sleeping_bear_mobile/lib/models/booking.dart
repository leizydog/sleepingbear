import 'property.dart';
import '../../models/booking.dart';

enum BookingStatus {
  pending,
  confirmed,
  cancelled,
  completed,
}

class Booking {
  final int id;
  final int userId;
  final int propertyId;
  final DateTime startDate;
  final DateTime endDate;
  final double totalAmount;
  final BookingStatus status;
  final DateTime createdAt;
  Property? property; // Optional property details
  
  Booking({
    required this.id,
    required this.userId,
    required this.propertyId,
    required this.startDate,
    required this.endDate,
    required this.totalAmount,
    required this.status,
    required this.createdAt,
    this.property,
  });
  
  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'],
      userId: json['user_id'],
      propertyId: json['property_id'],
      startDate: DateTime.parse(json['start_date']),
      endDate: DateTime.parse(json['end_date']),
      totalAmount: json['total_amount'].toDouble(),
      status: _statusFromString(json['status']),
      createdAt: DateTime.parse(json['created_at']),
      property: json['property'] != null ? Property.fromJson(json['property']) : null,
    );
  }
  
  static BookingStatus _statusFromString(String status) {
    switch (status) {
      case 'pending':
        return BookingStatus.pending;
      case 'confirmed':
        return BookingStatus.confirmed;
      case 'cancelled':
        return BookingStatus.cancelled;
      case 'completed':
        return BookingStatus.completed;
      default:
        return BookingStatus.pending;
    }
  }
  
  String get statusString {
    return status.toString().split('.').last;
  }
  
  String get statusDisplay {
    switch (status) {
      case BookingStatus.pending:
        return 'Pending';
      case BookingStatus.confirmed:
        return 'Confirmed';
      case BookingStatus.cancelled:
        return 'Cancelled';
      case BookingStatus.completed:
        return 'Completed';
    }
  }
}
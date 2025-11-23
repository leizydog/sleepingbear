import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sleeping_bear_mobile/models/booking.dart';
import 'package:sleeping_bear_mobile/models/payment.dart';
import 'package:sleeping_bear_mobile/models/property.dart';

class ApiService {
 static const String baseUrl = 'http://192.168.1.11:8000';
  // Android emulator
  // Use 'http://localhost:8000' for iOS simulator
  // Use your computer's IP for physical devices (e.g., 'http://192.168.1.100:8000')
    
  // Store token
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }
  
  // Get token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }
  
  // Remove token
  Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }
  
  // Get headers with auth
  Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
  
  // Register user
  Future<Map<String, dynamic>> register({
    required String email,
    required String username,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'username': username,
        'password': password,
        'full_name': fullName,
        'phone': phone,
        'role': 'tenant',
      }),
    );
    
    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await saveToken(data['access_token']);
      return data;
    } else {
      throw Exception(jsonDecode(response.body)['detail']);
    }
  }
  
  // Login user
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await saveToken(data['access_token']);
      return data;
    } else {
      throw Exception(jsonDecode(response.body)['detail']);
    }
  }
  
  // Get current user
  Future<Map<String, dynamic>> getCurrentUser() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get user data');
    }
  }
  
  // Logout
  Future<void> logout() async {
    await removeToken();
  }

  Future<List<Property>> getProperties({
    int page = 1,
    int perPage = 10,
    String? search,
    double? minPrice,
    double? maxPrice,
    int? bedrooms,
    bool availableOnly = true,
  }) async {
    final headers = await getHeaders();

    // Build query parameters
    final Map<String, String> queryParams = {
      'page': page.toString(),
      'per_page': perPage.toString(),
      'available_only': availableOnly.toString(),
    };

    if (search != null && search.isNotEmpty) {
      queryParams['search'] = search;
    }
    if (minPrice != null) {
      queryParams['min_price'] = minPrice.toString();
    }
    if (maxPrice != null) {
      queryParams['max_price'] = maxPrice.toString();
    }
    if (bedrooms != null) {
      queryParams['bedrooms'] = bedrooms.toString();
    }

    final uri = Uri.parse('$baseUrl/properties').replace(queryParameters: queryParams);
    final response = await http.get(uri, headers: headers);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> propertiesJson = data['properties'];
      return propertiesJson.map((json) => Property.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load properties');
    }
  }

  // Get single property
  Future<Property> getProperty(int id) async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/properties/$id'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return Property.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load property');
    }
  }

  Future getPaymentMethods() async {}

  Future createPaymentIntent({required int bookingId, required String paymentMethod}) async {}

  Future confirmPayment(intentData) async {}
}
// Add to ApiService class

// Check availability
Future<Map<String, dynamic>> checkAvailability({
  required int propertyId,
  required DateTime startDate,
  required DateTime endDate,
}) async {
  final headers = await getHeaders();
  final response = await http.post(
    Uri.parse('$baseUrl/bookings/check-availability'),
    headers: headers,
    body: jsonEncode({
      'property_id': propertyId,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate.toIso8601String(),
    }),
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to check availability');
  }
}

// Create booking
Future<Booking> createBooking({
  required int propertyId,
  required DateTime startDate,
  required DateTime endDate,
}) async {
  final headers = await getHeaders();
  final response = await http.post(
    Uri.parse('$baseUrl/bookings/'),
    headers: headers,
    body: jsonEncode({
      'property_id': propertyId,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate.toIso8601String(),
    }),
  );
  
  if (response.statusCode == 201) {
    return Booking.fromJson(jsonDecode(response.body));
  } else {
    final error = jsonDecode(response.body);
    throw Exception(error['detail'] ?? 'Failed to create booking');
  }
}

// Get user's bookings
Future<List<Booking>> getMyBookings() async {
  final headers = await getHeaders();
  final response = await http.get(
    Uri.parse('$baseUrl/bookings/my-bookings'),
    headers: headers,
  );
  
  if (response.statusCode == 200) {
    final List<dynamic> bookingsJson = jsonDecode(response.body);
    return bookingsJson.map((json) => Booking.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load bookings');
  }
}

// Cancel booking
Future<void> cancelBooking(int bookingId) async {
  final headers = await getHeaders();
  final response = await http.delete(
    Uri.parse('$baseUrl/bookings/$bookingId'),
    headers: headers,
  );
  
  if (response.statusCode != 204) {
    final error = jsonDecode(response.body);
    throw Exception(error['detail'] ?? 'Failed to cancel booking');
  }
}

// Get payment methods
Future<List<PaymentMethod>> getPaymentMethods() async {
  final headers = await getHeaders();
  final response = await http.get(
    Uri.parse('$baseUrl/payments/methods'),
    headers: headers,
  );
  
  if (response.statusCode == 200) {
    final List<dynamic> methods = jsonDecode(response.body);
    return methods.map((json) => PaymentMethod.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load payment methods');
  }
}

// Create payment intent
Future<Map<String, dynamic>> createPaymentIntent({
  required int bookingId,
  required String paymentMethod,
}) async {
  final headers = await getHeaders();
  final response = await http.post(
    Uri.parse('$baseUrl/payments/create-intent'),
    headers: headers,
    body: jsonEncode({
      'booking_id': bookingId,
      'payment_method': paymentMethod,
    }),
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    final error = jsonDecode(response.body);
    throw Exception(error['detail'] ?? 'Failed to create payment intent');
  }
}

// Confirm payment
Future<Map<String, dynamic>> confirmPayment(String paymentIntentId) async {
  final headers = await getHeaders();
  final response = await http.post(
    Uri.parse('$baseUrl/payments/confirm'),
    headers: headers,
    body: jsonEncode({
      'payment_intent_id': paymentIntentId,
    }),
  );
  
  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    final error = jsonDecode(response.body);
    throw Exception(error['detail'] ?? 'Failed to confirm payment');
  }
}

// Get booking payments
Future<List<Payment>> getBookingPayments(int bookingId) async {
  final headers = await getHeaders();
  final response = await http.get(
    Uri.parse('$baseUrl/payments/booking/$bookingId'),
    headers: headers,
  );
  
  if (response.statusCode == 200) {
    final List<dynamic> paymentsJson = jsonDecode(response.body);
    return paymentsJson.map((json) => Payment.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load payments');
  }
}
Future getHeaders() async {
}

class baseUrl {
}


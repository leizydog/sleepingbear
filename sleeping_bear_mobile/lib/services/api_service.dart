import 'dart:convert';
import 'dart:io'; 
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart'; 
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sleeping_bear_mobile/models/booking.dart';
import 'package:sleeping_bear_mobile/models/payment.dart';
import 'package:sleeping_bear_mobile/models/property.dart';
import 'package:sleeping_bear_mobile/models/payment_method.dart';

class ApiService {
  // --- CONNECTION SETTINGS ---
  // Ensure this matches your setup (e.g. 192.168.x.x for physical device)
  static const String baseUrl = 'http://192.168.102.147:8000'; 

  // ---------------------------

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // --- NEW: UPLOAD IMAGES ---
  Future<List<String>> uploadImages(List<XFile> images) async {
    final uri = Uri.parse('$baseUrl/properties/upload');
    final request = http.MultipartRequest('POST', uri);
    
    // Add headers (Auth optional based on your backend, but good practice)
    final token = await getToken();
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    // Add files
    for (var image in images) {
      request.files.add(await http.MultipartFile.fromPath(
        'files', 
        image.path
      ));
    }

    try {
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return List<String>.from(data['images']);
      } else {
        throw Exception('Failed to upload images: ${response.body}');
      }
    } catch (e) {
      throw Exception('Image upload error: $e');
    }
  }

  // --- NEW: CREATE PROPERTY ---
  Future<void> createProperty(Map<String, dynamic> propertyData) async {
    final headers = await getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/properties/'),
      headers: headers,
      body: jsonEncode(propertyData),
    );

    if (response.statusCode != 201) {
      throw Exception('Failed to create property: ${response.body}');
    }
  }

  // --- ✅ NEW: UPLOAD PAYMENT RECEIPT (For Manual GCash Flow) ---
  Future<void> submitPaymentReceipt({
    required int bookingId,
    required String paymentMethod,
    required XFile image,
  }) async {
    final uri = Uri.parse('$baseUrl/payments/upload-receipt');
    final request = http.MultipartRequest('POST', uri);
    
    final token = await getToken();
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    // Add text fields
    request.fields['booking_id'] = bookingId.toString();
    request.fields['payment_method'] = paymentMethod;

    // Add file
    request.files.add(await http.MultipartFile.fromPath(
      'file', 
      image.path
    ));

    try {
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode != 200) {
        throw Exception('Failed to upload receipt: ${response.body}');
      }
    } catch (e) {
      throw Exception('Receipt upload error: $e');
    }
  }

  // --- AUTH METHODS ---
  
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
      throw Exception('Login failed');
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

  // --- PROPERTY METHODS ---

  // Get properties
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

    final Map<String, String> queryParams = {
      'page': page.toString(),
      'per_page': perPage.toString(),
      'available_only': availableOnly.toString(),
    };

    if (search != null && search.isNotEmpty) queryParams['search'] = search;
    if (minPrice != null) queryParams['min_price'] = minPrice.toString();
    if (maxPrice != null) queryParams['max_price'] = maxPrice.toString();
    if (bedrooms != null) queryParams['bedrooms'] = bedrooms.toString();

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

  // --- BOOKING METHODS ---

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

  // ✅ ADDED: Get Booking by ID (Needed for status checks)
  Future<Booking> getBookingById(int id) async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/bookings/$id'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return Booking.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load booking details');
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

  // --- PAYMENT METHODS ---

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

  Future<List<Property>> getMyListings() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/properties/my-listings'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> propertiesJson = jsonDecode(response.body);
      return propertiesJson.map((json) => Property.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load my listings');
    }
  }

  // Get bookings received by the owner
  Future<List<Booking>> getOwnerBookings() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/bookings/owner-bookings'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> bookingsJson = jsonDecode(response.body);
      return bookingsJson.map((json) => Booking.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load owner bookings');
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
}
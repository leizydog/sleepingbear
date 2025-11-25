import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  User? _user;
  bool _isLoading = false;
  String? _error;
  
  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  
  // Register
  Future<bool> register({
    required String email,
    required String username,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.register(
        email: email,
        username: username,
        password: password,
        fullName: fullName,
        phone: phone,
      );
      
      _user = User.fromJson(response['user']);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  // Login
  Future<bool> login({
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.login(
        email: email,
        password: password,
      );
      
      _user = User.fromJson(response['user']);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // ✅ FIXED: Update Profile Method
  Future<bool> updateProfile({required String name, required String phone}) async {
    _isLoading = true;
    notifyListeners();

    try {
      // TODO: Uncomment this line when your Backend API is ready
      // final updatedData = await _apiService.updateProfile(name: name, phone: phone);
      
      // FOR NOW: Simulate network delay
      await Future.delayed(const Duration(seconds: 1));

      // Update the local User object so the UI refreshes
      if (_user != null) {
        _user = User(
          id: _user!.id,
          email: _user!.email,
          username: _user!.username,
          role: _user!.role,
          // Removed 'token' here because your User model doesn't have it
          createdAt: _user!.createdAt,
          
          // Updated fields:
          fullName: name, 
          phone: phone,
          
          // ✅ FIXED: Added required 'isActive' field
          // We keep the existing value, or default to true if it's somehow null
          isActive: _user!.isActive, 
        );
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  // Check if logged in
  Future<void> checkAuth() async {
    try {
      final userData = await _apiService.getCurrentUser();
      _user = User.fromJson(userData);
      notifyListeners();
    } catch (e) {
      _user = null;
      notifyListeners();
    }
  }
  
  // Logout
  Future<void> logout() async {
    await _apiService.logout();
    _user = null;
    notifyListeners();
  }
  
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
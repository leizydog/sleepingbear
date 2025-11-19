import 'package:flutter/foundation.dart';
import '../models/property.dart';
import '../services/api_service.dart';

class PropertyProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<Property> _properties = [];
  bool _isLoading = false;
  String? _error;
  
  List<Property> get properties => _properties;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  // Fetch properties with filters
  Future<void> fetchProperties({
    String? search,
    double? minPrice,
    double? maxPrice,
    int? bedrooms,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      _properties = await _apiService.getProperties(
        search: search,
        minPrice: minPrice,
        maxPrice: maxPrice,
        bedrooms: bedrooms,
      );
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // Get property by ID
  Property? getPropertyById(int id) {
    try {
      return _properties.firstWhere((prop) => prop.id == id);
    } catch (e) {
      return null;
    }
  }
  
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart'; // Needed for XFile
import '../models/property.dart';
import '../services/api_service.dart';

class PropertyProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<Property> _myListings = [];
  List<Property> _properties = [];
  bool _isLoading = false;
  String? _error;
  
  List<Property> get properties => _properties;
  List<Property> get myListings => _myListings;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  // Getter to access service if needed (Optional, but good for direct access)
  ApiService get apiService => _apiService;

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
  
  Property? getPropertyById(int id) {
    try {
      return _properties.firstWhere((prop) => prop.id == id);
    } catch (e) {
      return null;
    }
  }

  Future<bool> addProperty({
    required Map<String, dynamic> propertyData,
    required List<XFile> images,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      List<String> imageUrls = [];
      if (images.isNotEmpty) {
        imageUrls = await _apiService.uploadImages(images);
      }

      final finalData = {
        ...propertyData,
        'images': imageUrls,
      };

      await _apiService.createProperty(finalData);

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

 
  

  Future<void> fetchMyListings() async {
    _isLoading = true;
    notifyListeners();
    try {
      _myListings = await _apiService.getMyListings();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // ✅ NEW: Helper to upload a single image (for QR Codes)
  Future<String?> uploadSingleImage(XFile image) async {
    try {
      final urls = await _apiService.uploadImages([image]);
      return urls.isNotEmpty ? urls.first : null;
    } catch (e) {
      print("Upload failed: $e");
      return null;
    }
  }
  
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
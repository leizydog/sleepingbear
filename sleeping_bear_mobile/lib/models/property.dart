class Property {
  final int id;
  final String name;
  final String? description;
  final String address;
  final double pricePerMonth;
  final int bedrooms;
  final int bathrooms;
  final double sizeSqm;
  final bool isAvailable;
  final String? imageUrl;
  
  // ✅ Existing Custom Fields
  final List<String> images;
  final int ownerId;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  // ✅ Payment Methods
  final bool acceptsBpi;
  final bool acceptsGcash;
  final bool acceptsCash;

  // ✅ NEW: Account Numbers
  final String? gcashNumber;
  final String? bpiNumber;
  final String? gcashQrImageUrl;

  Property({
    required this.id,
    required this.name,
    this.description,
    required this.address,
    required this.pricePerMonth,
    required this.bedrooms,
    required this.bathrooms,
    required this.sizeSqm,
    required this.isAvailable,
    this.imageUrl,
    
    this.images = const [],
    this.ownerId = 0, 
    this.status = 'active',
    required this.createdAt,
    required this.updatedAt,

    this.acceptsBpi = false,
    this.acceptsGcash = false,
    this.acceptsCash = false,
    
    this.gcashNumber,
    this.bpiNumber,
    this.gcashQrImageUrl,
  });
  
  factory Property.fromJson(Map<String, dynamic> json) {
    return Property(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      address: json['address'],
      pricePerMonth: (json['price_per_month'] as num).toDouble(),
      bedrooms: json['bedrooms'],
      bathrooms: json['bathrooms'],
      sizeSqm: (json['size_sqm'] as num).toDouble(),
      isAvailable: json['is_available'] ?? false,
      imageUrl: json['image_url'],
      
      images: json['images'] != null ? List<String>.from(json['images']) : [],
      ownerId: json['owner_id'] ?? 0,
      status: json['status'] ?? 'active',
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at']) 
          : DateTime.parse(json['created_at']),

      // ✅ Parse Payment Methods
      acceptsBpi: json['accepts_bpi'] ?? false,
      acceptsGcash: json['accepts_gcash'] ?? false,
      acceptsCash: json['accepts_cash'] ?? false,
      
      // ✅ Parse Account Numbers
      gcashNumber: json['gcash_number'],
      bpiNumber: json['bpi_number'],
      gcashQrImageUrl: json['gcash_qr_image_url'],
    );
  }
}
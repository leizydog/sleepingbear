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
  final DateTime createdAt;
  
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
    required this.createdAt,
  });
  
  factory Property.fromJson(Map<String, dynamic> json) {
    return Property(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      address: json['address'],
      pricePerMonth: json['price_per_month'].toDouble(),
      bedrooms: json['bedrooms'],
      bathrooms: json['bathrooms'],
      sizeSqm: json['size_sqm'].toDouble(),
      isAvailable: json['is_available'],
      imageUrl: json['image_url'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
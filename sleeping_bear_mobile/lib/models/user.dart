class User {
  final int id;
  final String email;
  final String username;
  final String? fullName;
  final String? phone;
  final String role;
  final bool isActive;
  final DateTime createdAt;
  
  User({
    required this.id,
    required this.email,
    required this.username,
    this.fullName,
    this.phone,
    required this.role,
    required this.isActive,
    required this.createdAt,
  });
  
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      email: json['email'],
      username: json['username'],
      fullName: json['full_name'],
      phone: json['phone'],
      role: json['role'],
      isActive: json['is_active'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'username': username,
      'full_name': fullName,
      'phone': phone,
      'role': role,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
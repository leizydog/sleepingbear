import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'add_listing_screen.dart';
import '../properties/property_detail_screen.dart';
import '../../models/property.dart';
import 'booking_detail_screen.dart';

// --- MODELS ---
class OwnerProperty {
  final String id;
  final String name;
  final String address;
  final String status; 
  final double price;
  final bool isAvailable;
  final String? imageUrl;
  
  final int bedrooms;
  final int bathrooms;
  final double sizeSqm;
  final String description;

  OwnerProperty({
    required this.id,
    required this.name,
    required this.address,
    required this.status,
    required this.price,
    this.isAvailable = true,
    this.imageUrl,
    this.bedrooms = 1,
    this.bathrooms = 1,
    this.sizeSqm = 24.0,
    this.description = 'No description provided.',
  });
}

class OwnerBooking {
  final String id;
  final String propertyName;
  final String tenantName; 
  final DateTime startDate;
  final DateTime endDate;
  final double totalAmount;
  final String status; 
  final String? imageUrl;

  OwnerBooking({
    required this.id,
    required this.propertyName,
    required this.tenantName,
    required this.startDate,
    required this.endDate,
    required this.totalAmount,
    required this.status,
    this.imageUrl,
  });
}

class OwnerDashboardScreen extends StatelessWidget {
  final VoidCallback? onMenuTap;
  const OwnerDashboardScreen({super.key, this.onMenuTap});

  final Color _primaryDark = const Color(0xFF4A00E0);
  final Color _primaryLight = const Color(0xFF8E2DE2);

  @override
  Widget build(BuildContext context) {
    // ✅ DARK MODE VARIABLES (Using non-nullable fallbacks)
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = Theme.of(context).cardColor;
    
    // Explicitly defining non-nullable colors
    final Color textColor = isDark ? Colors.white : Colors.black87;
    final Color subTextColor = isDark ? Colors.grey[400]! : Colors.grey[600]!;

    // --- MOCK DATA ---
    final pendingProps = [
      OwnerProperty(
        id: '101',
        name: 'SMDC Grass 24-B',
        address: 'Quezon City, Metro Manila',
        status: 'pending',
        price: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        bedrooms: 1, bathrooms: 1, sizeSqm: 26.5,
      ),
      OwnerProperty(
        id: '102',
        name: 'Azure Urban 12',
        address: 'Parañaque City',
        status: 'pending',
        price: 18000,
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        bedrooms: 0, bathrooms: 1, sizeSqm: 22.0,
      ),
    ];

    final activeProps = [
      OwnerProperty(
        id: '201',
        name: 'Jazz Residences 101',
        address: 'Makati City',
        status: 'active',
        price: 18000,
        isAvailable: true,
        imageUrl: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e',
        bedrooms: 1, bathrooms: 1, sizeSqm: 28.0,
      ),
      OwnerProperty(
        id: '205',
        name: 'Shore 2 Tower 3',
        address: 'Pasay City',
        status: 'active',
        price: 30000,
        isAvailable: false,
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-2495db9dc2c3',
        bedrooms: 2, bathrooms: 2, sizeSqm: 45.0,
      ),
    ];

    final bookings = [
      OwnerBooking(
        id: 'BK-901',
        propertyName: 'Jazz Residences 101',
        tenantName: 'John Doe',
        startDate: DateTime(2023, 10, 1),
        endDate: DateTime(2023, 10, 5),
        totalAmount: 5000,
        status: 'confirmed',
        imageUrl: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e',
      ),
      OwnerBooking(
        id: 'BK-902',
        propertyName: 'Shore 2 Tower 3',
        tenantName: 'Maria Clara',
        startDate: DateTime(2023, 11, 12),
        endDate: DateTime(2023, 11, 15),
        totalAmount: 12000,
        status: 'pending',
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-2495db9dc2c3',
      ),
    ];

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        backgroundColor: backgroundColor,
        appBar: AppBar(
          backgroundColor: backgroundColor,
          elevation: 0,
          centerTitle: true,
          leading: IconButton(
            icon: Icon(Icons.menu_rounded, color: textColor),
            onPressed: onMenuTap,
          ),
          title: Text(
            'Owner Dashboard',
            style: TextStyle(fontWeight: FontWeight.w900, color: textColor, letterSpacing: -0.5),
          ),
          bottom: TabBar(
            labelColor: _primaryDark,
            unselectedLabelColor: Colors.grey,
            indicatorColor: _primaryLight,
            indicatorWeight: 3,
            indicatorPadding: const EdgeInsets.symmetric(horizontal: 20),
            labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            tabs: const [
              Tab(text: 'IN PROGRESS'),
              Tab(text: 'LISTINGS'),
              Tab(text: 'BOOKINGS'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildList(context, pendingProps, isBooking: false, isDark: isDark, cardColor: cardColor, textColor: textColor, subTextColor: subTextColor),
            _buildList(context, activeProps, isBooking: false, isDark: isDark, cardColor: cardColor, textColor: textColor, subTextColor: subTextColor),
            _buildList(context, bookings, isBooking: true, isDark: isDark, cardColor: cardColor, textColor: textColor, subTextColor: subTextColor),
          ],
        ),
        
        floatingActionButton: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [_primaryDark, _primaryLight],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: _primaryDark.withValues(alpha: 0.4),
                blurRadius: 12,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const AddListingScreen()),
                );
              },
              borderRadius: BorderRadius.circular(30),
              child: const Padding(
                padding: EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.add_rounded, color: Colors.white, size: 24),
                    SizedBox(width: 8),
                    Text(
                      'Add Listing',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildList(
    BuildContext context, 
    List<dynamic> items, 
    {required bool isBooking, required bool isDark, required Color cardColor, required Color textColor, required Color subTextColor}
  ) {
    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.folder_open_rounded, size: 60, color: Colors.grey[300]),
            const SizedBox(height: 10),
            Text('No records found', style: TextStyle(color: Colors.grey[500], fontSize: 16)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 80), // Extra bottom padding for FAB
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        return _buildCard(context, item, isBooking: isBooking, isDark: isDark, cardColor: cardColor, textColor: textColor, subTextColor: subTextColor);
      },
    );
  }

  Widget _buildCard(
    BuildContext context, 
    dynamic item, 
    {required bool isBooking, required bool isDark, required Color cardColor, required Color textColor, required Color subTextColor}
  ) {
    final currencyFormat = NumberFormat.currency(symbol: '₱', decimalDigits: 0);
    final dateFormat = DateFormat('MMM d');

    String title, subtitle, status;
    double amount;
    String? imageUrl;
    bool? isAvailable;
    // ✅ Removed unused guestName variable

    if (isBooking) {
      final b = item as OwnerBooking;
      title = b.propertyName;
      // guestName = b.tenantName; // We don't use this anymore
      subtitle = '${dateFormat.format(b.startDate)} - ${dateFormat.format(b.endDate)}';
      status = b.status;
      amount = b.totalAmount;
      imageUrl = b.imageUrl;
    } else {
      final p = item as OwnerProperty;
      title = p.name;
      subtitle = p.address;
      status = p.status;
      amount = p.price;
      imageUrl = p.imageUrl;
      isAvailable = p.isAvailable;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20), 
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04), 
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () {
            if (isBooking) {
              final b = item as OwnerBooking;
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => BookingDetailScreen(
                    bookingId: b.id,
                    propertyName: b.propertyName,
                    tenantName: b.tenantName,
                    startDate: b.startDate,
                    endDate: b.endDate,
                    totalAmount: b.totalAmount,
                    status: b.status,
                    imageUrl: b.imageUrl,
                  ),
                ),
              );
            } else {
              final p = item as OwnerProperty;
              final fullProperty = Property(
                id: int.tryParse(p.id) ?? 0,
                name: p.name,
                description: p.description,
                address: p.address,
                pricePerMonth: p.price,
                bedrooms: p.bedrooms,
                bathrooms: p.bathrooms,
                sizeSqm: p.sizeSqm,
                imageUrl: p.imageUrl,
                images: p.imageUrl != null ? [p.imageUrl!] : [],
                isAvailable: p.isAvailable,
                ownerId: 0,
                status: p.status,
                createdAt: DateTime.now(),
                updatedAt: DateTime.now(),
              );

              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => PropertyDetailScreen(property: fullProperty),
                ),
              );
            }
          },
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    height: 85,
                    width: 85,
                    color: Colors.grey[100],
                    child: imageUrl != null
                        ? Image.network(
                            imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (ctx, err, stack) => const Icon(Icons.image_not_supported, color: Colors.grey),
                          )
                        : const Icon(Icons.apartment, color: Colors.grey),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildStatusBadge(status, isDark),
                          if (!isBooking && status == 'active') 
                            _buildAvailabilityBadge(isAvailable!, isDark),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor)),
                      const SizedBox(height: 4),
                      Text(subtitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(color: subTextColor, fontSize: 12)),
                      
                      const SizedBox(height: 8),
                      Text(
                        isBooking ? 'Total: ${currencyFormat.format(amount)}' : '${currencyFormat.format(amount)}/mo',
                        style: TextStyle(fontWeight: FontWeight.bold, color: _primaryDark, fontSize: 15),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status, bool isDark) {
    Color bg = isDark ? Colors.grey[800]! : Colors.grey[100]!;
    Color text = isDark ? Colors.grey[300]! : Colors.grey[600]!;
    
    switch (status.toLowerCase()) {
      case 'active': case 'confirmed': 
        bg = isDark ? const Color(0xFF1B5E20) : const Color(0xFFE8F5E9); 
        text = isDark ? const Color(0xFFA5D6A7) : const Color(0xFF2E7D32); 
        break;
      case 'pending': 
        bg = isDark ? const Color(0xFFE65100).withValues(alpha: 0.2) : const Color(0xFFFFF3E0); 
        text = isDark ? const Color(0xFFFFCC80) : const Color(0xFFEF6C00); 
        break;
      case 'cancelled': case 'rejected': 
        bg = isDark ? const Color(0xFFB71C1C).withValues(alpha: 0.2) : const Color(0xFFFFEBEE); 
        text = isDark ? const Color(0xFFEF9A9A) : const Color(0xFFC62828); 
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
      child: Text(status.toUpperCase(), style: TextStyle(color: text, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 0.5)),
    );
  }

  Widget _buildAvailabilityBadge(bool isAvailable, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isAvailable ? (isDark ? const Color(0xFF0D47A1).withValues(alpha: 0.3) : const Color(0xFFE3F2FD)) : (isDark ? Colors.grey[800] : Colors.grey[100]), 
        borderRadius: BorderRadius.circular(20)
      ),
      child: Row(
        children: [
          Icon(Icons.circle, size: 8, color: isAvailable ? const Color(0xFF1976D2) : Colors.grey),
          const SizedBox(width: 4),
          Text(
            isAvailable ? 'Vacant' : 'Occupied', 
            style: TextStyle(
              color: isAvailable ? (isDark ? const Color(0xFF90CAF9) : const Color(0xFF1565C0)) : (isDark ? Colors.grey[400] : Colors.grey[600]), 
              fontWeight: FontWeight.bold, 
              fontSize: 10
            )
          ),
        ],
      ),
    );
  }
}
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'add_listing_screen.dart';
import '../properties/property_detail_screen.dart';
import '../../models/property.dart';
import '../../models/booking.dart';
import '../../providers/property_provider.dart';
import '../../providers/booking_provider.dart';
import 'booking_detail_screen.dart';

class OwnerDashboardScreen extends StatefulWidget {
  final VoidCallback? onMenuTap;
  const OwnerDashboardScreen({super.key, this.onMenuTap});

  @override
  State<OwnerDashboardScreen> createState() => _OwnerDashboardScreenState();
}

class _OwnerDashboardScreenState extends State<OwnerDashboardScreen> {
  final Color _primaryDark = const Color(0xFF4A00E0);
  final Color _primaryLight = const Color(0xFF8E2DE2);

  @override
  void initState() {
    super.initState();
    // ✅ Load Real Data
    Future.microtask(() {
      Provider.of<PropertyProvider>(context, listen: false).fetchMyListings();
      Provider.of<BookingProvider>(context, listen: false).fetchOwnerBookings();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = Theme.of(context).cardColor;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subTextColor = isDark ? Colors.grey[400]! : Colors.grey[600]!;

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
            onPressed: widget.onMenuTap,
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
          actions: [
             IconButton(
               icon: Icon(Icons.refresh, color: textColor),
               onPressed: () {
                 Provider.of<PropertyProvider>(context, listen: false).fetchMyListings();
                 Provider.of<BookingProvider>(context, listen: false).fetchOwnerBookings();
               },
             )
          ],
        ),
        body: Consumer2<PropertyProvider, BookingProvider>(
          builder: (context, propProvider, bookingProvider, child) {
            if (propProvider.isLoading || bookingProvider.isLoading) {
              return Center(child: CircularProgressIndicator(color: _primaryDark));
            }

            // ✅ Filter Data
            final pendingProps = propProvider.myListings.where((p) => p.status == 'pending').toList();
            final activeProps = propProvider.myListings.where((p) => p.status == 'approved').toList();
            final bookings = bookingProvider.ownerBookings;

            return TabBarView(
              children: [
                _buildList(context, pendingProps, isBooking: false, isDark: isDark, cardColor: cardColor, textColor: textColor, subTextColor: subTextColor),
                _buildList(context, activeProps, isBooking: false, isDark: isDark, cardColor: cardColor, textColor: textColor, subTextColor: subTextColor),
                _buildList(context, bookings, isBooking: true, isDark: isDark, cardColor: cardColor, textColor: textColor, subTextColor: subTextColor),
              ],
            );
          },
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
                color: _primaryDark.withOpacity(0.4),
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
                ).then((_) => Provider.of<PropertyProvider>(context, listen: false).fetchMyListings());
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
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 80), 
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

    String title, subtitle;
    String status = 'unknown';
    double amount;
    String? imageUrl;
    bool? isAvailable;

    // ✅ Map Real Data
    if (isBooking) {
      final b = item as Booking;
      // Try to get property info if available, else fallback
      title = b.property?.name ?? 'Property #${b.propertyId}';
      subtitle = '${dateFormat.format(b.startDate)} - ${dateFormat.format(b.endDate)}';
      status = b.statusDisplay; // Uses helper in Booking model
      amount = b.totalAmount;
      imageUrl = b.property?.imageUrl;
    } else {
      final p = item as Property;
      title = p.name;
      subtitle = p.address;
      status = p.status; // 'pending' or 'approved'
      amount = p.pricePerMonth;
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
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.04), 
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
              final b = item as Booking;
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => BookingDetailScreen(
                    bookingId: b.id.toString(),
                    propertyName: b.property?.name ?? 'Unknown',
                    tenantName: 'Tenant #${b.userId}', // Need extra API to get user name
                    startDate: b.startDate,
                    endDate: b.endDate,
                    totalAmount: b.totalAmount,
                    status: b.statusDisplay,
                    imageUrl: b.property?.imageUrl,
                  ),
                ),
              );
            } else {
              final p = item as Property;
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => PropertyDetailScreen(property: p),
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
                          if (!isBooking && status == 'approved') 
                            _buildAvailabilityBadge(isAvailable ?? false, isDark),
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
    
    final s = status.toLowerCase();

    switch (s) {
      case 'active': case 'confirmed': case 'approved': case 'completed':
        bg = isDark ? const Color(0xFF1B5E20) : const Color(0xFFE8F5E9); 
        text = isDark ? const Color(0xFFA5D6A7) : const Color(0xFF2E7D32); 
        break;
      case 'pending': 
        bg = isDark ? const Color(0xFFE65100).withOpacity(0.2) : const Color(0xFFFFF3E0); 
        text = isDark ? const Color(0xFFFFCC80) : const Color(0xFFEF6C00); 
        break;
      case 'cancelled': case 'rejected': 
        bg = isDark ? const Color(0xFFB71C1C).withOpacity(0.2) : const Color(0xFFFFEBEE); 
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
        color: isAvailable ? (isDark ? const Color(0xFF0D47A1).withOpacity(0.3) : const Color(0xFFE3F2FD)) : (isDark ? Colors.grey[800] : Colors.grey[100]), 
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
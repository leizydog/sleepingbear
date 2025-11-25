import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';

// Ensure these imports point to your actual files
import 'package:sleeping_bear_mobile/models/booking.dart';
import 'package:sleeping_bear_mobile/providers/booking_provider.dart';

class TenantBookingScreen extends StatefulWidget {
  const TenantBookingScreen({super.key});

  @override
  State<TenantBookingScreen> createState() => _TenantBookingScreenState();
}

class _TenantBookingScreenState extends State<TenantBookingScreen> {
  final Color _primaryDark = const Color(0xFF4A00E0);
  final Color _bgGray = const Color(0xFFF9FAFB);
  final Color _textDark = const Color(0xFF1F2937);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // FIX: Ensure BookingProvider is imported correctly above
      Provider.of<BookingProvider>(context, listen: false).fetchBookings();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bgGray,
      appBar: AppBar(
        backgroundColor: _bgGray,
        elevation: 0,
        centerTitle: true,
        leading: const BackButton(color: Colors.black),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.asset(
                'assets/images/sleeping_bear_logo.jpg',
                height: 30,
                width: 30,
                fit: BoxFit.cover,
                // FIX: Removed underscores warnings
                errorBuilder: (context, error, stackTrace) => Icon(Icons.bedtime_rounded, color: _primaryDark),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'My Bookings',
              style: TextStyle(
                color: _textDark,
                fontWeight: FontWeight.bold,
                fontFamily: 'Serif',
                fontSize: 18,
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: Consumer<BookingProvider>(
          builder: (context, provider, child) {
            // FIX: Nullable checks are solved because we use valid Provider type
            if (provider.isLoading) {
              return Center(child: CircularProgressIndicator(color: _primaryDark));
            }

            if (provider.bookings.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.calendar_today_rounded, size: 60, color: Colors.grey[300]),
                    const SizedBox(height: 16),
                    Text('No bookings yet.', style: TextStyle(color: Colors.grey[500], fontSize: 16)),
                  ],
                ),
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(24),
              itemCount: provider.bookings.length,
              separatorBuilder: (context, index) => const SizedBox(height: 20),
              itemBuilder: (context, index) {
                return TenantBookingCard(booking: provider.bookings[index]);
              },
            );
          },
        ),
      ),
    );
  }
}

class TenantBookingCard extends StatelessWidget {
  final Booking booking;

  const TenantBookingCard({super.key, required this.booking});

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMM dd, yyyy');
    
    // FIX: access .name for Enums
    String statusString = booking.status.name.toLowerCase(); 

    Color statusColor;
    Color statusBg;
    
    switch (statusString) {
      case 'confirmed':
      case 'approved':
        statusColor = const Color(0xFF059669); 
        statusBg = const Color(0xFFD1FAE5);
        break;
      case 'pending':
        statusColor = const Color(0xFFD97706); 
        statusBg = const Color(0xFFFEF3C7);
        break;
      case 'cancelled':
      case 'rejected':
        statusColor = const Color(0xFFDC2626); 
        statusBg = const Color(0xFFFEE2E2);
        break;
      default:
        statusColor = const Color(0xFF4B5563); 
        statusBg = const Color(0xFFF3F4F6);
    }

    // FIX: Check for null property or use fallback name
    String propertyTitle = 'Unknown Property';
    // If your Booking model has propertyName directly:
    // propertyTitle = booking.propertyName;
    // If it's inside a property object:
    if (booking.property != null) {
      propertyTitle = booking.property!.name;
    } else {
       // fallback if using direct propertyName string
       // propertyTitle = booking.propertyName; 
       propertyTitle = "Listing #${booking.id}";
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            // FIX: Updated opacity syntax for newer Flutter versions
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    propertyTitle,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'Serif', color: Color(0xFF1F2937)),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(10)),
                  child: Text(
                    statusString.toUpperCase(),
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor, letterSpacing: 0.5),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1, color: Color(0xFFF3F4F6)),
            const SizedBox(height: 16),
            Row(
              children: [
                _buildInfoColumn(Icons.login_rounded, 'Check-in', dateFormat.format(booking.startDate)),
                Container(height: 30, width: 1, color: Colors.grey[200], margin: const EdgeInsets.symmetric(horizontal: 20)),
                _buildInfoColumn(Icons.logout_rounded, 'Check-out', dateFormat.format(booking.endDate)),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(12)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total Price', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w500)),
                  Text(
                    // Ensure 'totalAmount' exists in your Booking model
                    NumberFormat.currency(symbol: '₱', decimalDigits: 0).format(booking.totalAmount), 
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF4A00E0)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoColumn(IconData icon, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 14, color: Colors.grey[400]),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[500], fontWeight: FontWeight.w500)),
          ],
        ),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF374151))),
      ],
    );
  }
}
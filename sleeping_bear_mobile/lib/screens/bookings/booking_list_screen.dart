import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../payments/payment_screen.dart';

// --- LOCAL MODELS ---
enum BookingStatus { pending, confirmed, cancelled, completed }

class Booking {
  final String id;
  final String propertyName;
  final String propertyLocation;
  final DateTime startDate;
  final DateTime endDate;
  final double totalPrice;
  final BookingStatus status;
  final String? imageUrl;

  Booking({
    required this.id,
    required this.propertyName,
    required this.propertyLocation,
    required this.startDate,
    required this.endDate,
    required this.totalPrice,
    required this.status,
    this.imageUrl,
  });
}

class BookingListScreen extends StatelessWidget {
  final VoidCallback? onMenuTap;
  const BookingListScreen({super.key, this.onMenuTap});

  @override
  Widget build(BuildContext context) {
    // ✅ CHECK DARK MODE
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Define Colors based on Mode
    final backgroundColor = isDark ? const Color(0xFF121212) : const Color(0xFFF8F9FA);
    final primaryColor = const Color(0xFF4A00E0);
    final textColor = isDark ? Colors.white : Colors.black87;

    // MOCK DATA
    final List<Booking> bookings = [
      Booking(
        id: 'BK-7829',
        propertyName: 'Luxury Condo in BGC',
        propertyLocation: 'Taguig, Metro Manila',
        startDate: DateTime.now().add(const Duration(days: 2)),
        endDate: DateTime.now().add(const Duration(days: 5)),
        totalPrice: 15000,
        status: BookingStatus.confirmed,
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      ),
      Booking(
        id: 'BK-1102',
        propertyName: 'Skyline Loft',
        propertyLocation: 'Makati City',
        startDate: DateTime.now().add(const Duration(days: 15)),
        endDate: DateTime.now().add(const Duration(days: 20)),
        totalPrice: 25000,
        status: BookingStatus.pending,
        imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
      ),
      Booking(
        id: 'BK-9921',
        propertyName: 'Cozy Studio Unit',
        propertyLocation: 'Pasig City',
        startDate: DateTime.now().subtract(const Duration(days: 10)),
        endDate: DateTime.now().subtract(const Duration(days: 8)),
        totalPrice: 8000,
        status: BookingStatus.completed,
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-2495db9dc2c3',
      ),
    ];

    return Scaffold(
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
          'My Bookings',
          style: TextStyle(fontWeight: FontWeight.w900, color: textColor),
        ),
      ),
      body: bookings.isEmpty
          ? _buildEmptyState(primaryColor, isDark)
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 100),
              itemCount: bookings.length,
              itemBuilder: (context, index) {
                return BookingCard(
                  booking: bookings[index],
                  isDark: isDark,
                  onTap: () => _showBookingDetails(context, bookings[index], isDark),
                );
              },
            ),
    );
  }

  Widget _buildEmptyState(Color color, bool isDark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.calendar_today_rounded, size: 60, color: isDark ? Colors.grey[600] : Colors.grey[300]),
          const SizedBox(height: 16),
          Text(
            'No bookings yet',
            style: TextStyle(fontSize: 20, color: isDark ? Colors.grey[300] : Colors.grey[800], fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // ✨ AESTHETIC POP-UP DIALOG (Dark Mode Ready)
  // ===========================================================================
  void _showBookingDetails(BuildContext context, Booking booking, bool isDark) {
    final currencyFormat = NumberFormat.currency(symbol: '₱', decimalDigits: 0);
    final dateFormat = DateFormat('MMM d, yyyy');
    final nights = booking.endDate.difference(booking.startDate).inDays;

    // Dialog Colors
    final dialogBg = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final titleColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final subTextColor = isDark ? Colors.grey[400] : Colors.grey[600];
    final priceBoxBg = isDark ? Colors.black26 : const Color(0xFFF8F9FA);

    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Booking Details',
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (context, animation, secondaryAnimation) {
        return Center(
          child: Material(
            color: Colors.transparent,
            child: Container(
              width: MediaQuery.of(context).size.width * 0.85,
              decoration: BoxDecoration(
                color: dialogBg,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [BoxShadow(color: Colors.black38, blurRadius: 25, offset: const Offset(0, 10))],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // --- HEADER IMAGE ---
                  Stack(
                    children: [
                      ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                        child: SizedBox(
                          height: 180,
                          width: double.infinity,
                          child: booking.imageUrl != null
                              ? Image.network(booking.imageUrl!, fit: BoxFit.cover)
                              : Container(color: Colors.grey[800], child: const Icon(Icons.apartment, size: 50, color: Colors.grey)),
                        ),
                      ),
                      Positioned(
                        top: 10, right: 10,
                        child: GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: isDark ? Colors.black54 : Colors.white, 
                              shape: BoxShape.circle
                            ),
                            child: const Icon(Icons.close, size: 20, color: Colors.white), // Always white/contrasting
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 10, left: 10,
                        child: _StatusBadge(status: booking.status, isDark: isDark),
                      ),
                    ],
                  ),

                  // --- DETAILS BODY ---
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          booking.propertyName,
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: titleColor, height: 1.2),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.location_on, size: 14, color: subTextColor),
                            const SizedBox(width: 4),
                            Text(booking.propertyLocation, style: TextStyle(color: subTextColor, fontSize: 13)),
                          ],
                        ),
                        
                        const SizedBox(height: 24),
                        Divider(color: isDark ? Colors.grey[800] : Colors.grey[300]),
                        const SizedBox(height: 16),

                        _buildDetailRow(Icons.calendar_month, 'Check-in', dateFormat.format(booking.startDate), titleColor, subTextColor),
                        const SizedBox(height: 12),
                        _buildDetailRow(Icons.calendar_today, 'Check-out', dateFormat.format(booking.endDate), titleColor, subTextColor),
                        const SizedBox(height: 12),
                        _buildDetailRow(Icons.nightlight_round, 'Duration', '$nights Nights', titleColor, subTextColor),
                        
                        const SizedBox(height: 24),
                        
                        // Price & Action
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: priceBoxBg,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Total Price', style: TextStyle(fontWeight: FontWeight.bold, color: subTextColor)),
                              Text(
                                currencyFormat.format(booking.totalPrice),
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF4A00E0)),
                              ),
                            ],
                          ),
                        ),

                        // Pay Button
                        if (booking.status == BookingStatus.confirmed) ...[
                          const SizedBox(height: 20),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () {
                                Navigator.pop(context);
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => PaymentScreen(booking: booking as dynamic), 
                                  ),
                                );
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF4A00E0),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              child: const Text('Proceed to Payment', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ]
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return ScaleTransition(
          scale: CurvedAnimation(parent: animation, curve: Curves.easeOutBack),
          child: child,
        );
      },
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value, Color valueColor, Color? labelColor) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF4A00E0).withOpacity(0.6)),
        const SizedBox(width: 12),
        Expanded(child: Text(label, style: TextStyle(color: labelColor, fontSize: 14))),
        Text(value, style: TextStyle(fontWeight: FontWeight.bold, color: valueColor)),
      ],
    );
  }
}

// --- CARD WIDGET ---
class BookingCard extends StatelessWidget {
  final Booking booking;
  final VoidCallback onTap;
  final bool isDark;

  const BookingCard({super.key, required this.booking, required this.onTap, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subTextColor = isDark ? Colors.grey[400] : Colors.grey;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(isDark ? 0.2 : 0.05), blurRadius: 20, offset: const Offset(0, 8)),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Row(
            children: [
              // Image
              ClipRRect(
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(20)),
                child: SizedBox(
                  height: 100,
                  width: 100,
                  child: booking.imageUrl != null
                      ? Image.network(booking.imageUrl!, fit: BoxFit.cover)
                      : Container(color: Colors.grey[800]),
                ),
              ),
              // Info
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _StatusBadge(status: booking.status, isMini: true, isDark: isDark),
                          Icon(Icons.arrow_forward_ios_rounded, size: 12, color: subTextColor),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        booking.propertyName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        booking.propertyLocation,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(color: subTextColor, fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// --- BADGE WIDGET ---
class _StatusBadge extends StatelessWidget {
  final BookingStatus status;
  final bool isMini;
  final bool isDark;

  const _StatusBadge({required this.status, this.isMini = false, required this.isDark});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    String label;

    // Adjusted colors for Dark Mode to be less jarring (softer backgrounds)
    if (isDark) {
      switch (status) {
        case BookingStatus.confirmed:
          bg = Colors.green.withOpacity(0.2); text = Colors.green.shade300; label = 'Confirmed'; break;
        case BookingStatus.pending:
          bg = Colors.orange.withOpacity(0.2); text = Colors.orange.shade300; label = 'Pending'; break;
        case BookingStatus.cancelled:
          bg = Colors.red.withOpacity(0.2); text = Colors.red.shade300; label = 'Cancelled'; break;
        case BookingStatus.completed:
          bg = Colors.blue.withOpacity(0.2); text = Colors.blue.shade300; label = 'Completed'; break;
      }
    } else {
      switch (status) {
        case BookingStatus.confirmed:
          bg = const Color(0xFFE8F5E9); text = const Color(0xFF2E7D32); label = 'Confirmed'; break;
        case BookingStatus.pending:
          bg = const Color(0xFFFFF3E0); text = const Color(0xFFEF6C00); label = 'Pending'; break;
        case BookingStatus.cancelled:
          bg = const Color(0xFFFFEBEE); text = const Color(0xFFC62828); label = 'Cancelled'; break;
        case BookingStatus.completed:
          bg = const Color(0xFFE3F2FD); text = const Color(0xFF1565C0); label = 'Completed'; break;
      }
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: isMini ? 8 : 12, vertical: isMini ? 4 : 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? Colors.transparent : Colors.white.withOpacity(0.5), width: 1),
      ),
      child: Text(
        label,
        style: TextStyle(color: text, fontWeight: FontWeight.bold, fontSize: isMini ? 10 : 12),
      ),
    );
  }
}
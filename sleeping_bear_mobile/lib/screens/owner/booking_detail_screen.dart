import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class BookingDetailScreen extends StatelessWidget {
  final String bookingId;
  final String propertyName;
  final String tenantName;
  final DateTime startDate;
  final DateTime endDate;
  final double totalAmount;
  final String status;
  final String? imageUrl;
  
  // NEW FIELDS
  final String? guestContact;
  final String? guestAddress;
  final String? guestIdImage; 

  const BookingDetailScreen({
    super.key,
    required this.bookingId,
    required this.propertyName,
    required this.tenantName,
    required this.startDate,
    required this.endDate,
    required this.totalAmount,
    required this.status,
    this.imageUrl,
    this.guestContact = "+63 912 345 6789", 
    this.guestAddress = "123 Rizal St, Quezon City",
    this.guestIdImage = "https://via.placeholder.com/150",
  });

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(symbol: '₱', decimalDigits: 0);
    final dateFormat = DateFormat('MMM d, yyyy');
    final nights = endDate.difference(startDate).inDays;

    // ✅ DARK MODE VARIABLES
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = Theme.of(context).cardColor;
    
    // ✅ FIX: Explicitly defined Color and added '!' to grey shades
    final Color textColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final Color subTextColor = isDark ? Colors.grey[400]! : Colors.grey[600]!;
    final Color primaryColor = const Color(0xFF4A00E0);

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: Text(
          'Booking Details',
          style: TextStyle(fontWeight: FontWeight.bold, color: textColor),
        ),
        backgroundColor: backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: textColor, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- STATUS HEADER ---
            Center(
              child: Column(
                children: [
                  _buildStatusBadge(status, isDark),
                  const SizedBox(height: 8),
                  Text(
                    'Booking #$bookingId',
                    style: TextStyle(color: subTextColor, fontSize: 14),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // --- 1. PROPERTY CARD ---
            Container(
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        height: 70,
                        width: 70,
                        color: isDark ? Colors.grey[800] : Colors.grey[100],
                        child: imageUrl != null
                            ? Image.network(imageUrl!, fit: BoxFit.cover)
                            : const Icon(Icons.apartment, color: Colors.grey),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            propertyName,
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Entire Unit • $nights Nights',
                            style: TextStyle(color: subTextColor, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // --- 2. GUEST DETAILS ---
            Text(
              'Guest Information',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: subTextColor),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Avatar & Name Row
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 25,
                        backgroundColor: primaryColor.withValues(alpha: 0.1),
                        child: Text(
                          tenantName.isNotEmpty ? tenantName[0].toUpperCase() : '?',
                          style: TextStyle(
                            color: primaryColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              tenantName,
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor),
                            ),
                            const Text(
                              'Verified Guest',
                              style: TextStyle(
                                color: Colors.green,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 20),
                  Divider(height: 1, color: isDark ? Colors.grey[800] : Colors.grey[300]), 
                  const SizedBox(height: 20),

                  // Contact & Address
                  _buildInfoRow(Icons.phone_iphone_rounded, 'Contact Number', guestContact ?? 'N/A', textColor, subTextColor),
                  const SizedBox(height: 16),
                  _buildInfoRow(Icons.location_on_outlined, 'Address', guestAddress ?? 'N/A', textColor, subTextColor),
                  
                  const SizedBox(height: 20),
                  
                  // ID Uploaded Section
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.badge_outlined, color: subTextColor, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('ID Uploaded', style: TextStyle(color: subTextColor, fontSize: 12)),
                            const SizedBox(height: 8),
                            GestureDetector(
                              onTap: () {}, // TODO: Fullscreen view
                              child: Container(
                                height: 120,
                                width: double.infinity,
                                decoration: BoxDecoration(
                                  color: isDark ? Colors.grey[900] : Colors.grey[100],
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: isDark ? Colors.grey[800]! : Colors.grey.shade300),
                                  image: guestIdImage != null 
                                    ? DecorationImage(image: NetworkImage(guestIdImage!), fit: BoxFit.cover)
                                    : null,
                                ),
                                child: guestIdImage == null 
                                  ? Center(child: Text('No ID Uploaded', style: TextStyle(color: subTextColor)))
                                  : Container(
                                      alignment: Alignment.center,
                                      decoration: BoxDecoration(
                                        color: Colors.black.withValues(alpha: 0.3),
                                        borderRadius: BorderRadius.circular(12)
                                      ),
                                      child: const Icon(Icons.visibility, color: Colors.white),
                                    ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // --- 3. TIMELINE ---
            Text(
              'Schedule',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: subTextColor),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CHECK-IN',
                          style: TextStyle(fontSize: 10, color: subTextColor, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          dateFormat.format(startDate),
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: textColor),
                        ),
                        Text(
                          '2:00 PM',
                          style: TextStyle(color: subTextColor, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  Container(width: 1, height: 40, color: isDark ? Colors.grey[800] : Colors.grey[200]),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'CHECK-OUT',
                          style: TextStyle(fontSize: 10, color: subTextColor, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          dateFormat.format(endDate),
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: textColor),
                        ),
                        Text(
                          '11:00 AM',
                          style: TextStyle(color: subTextColor, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // --- 4. PAYMENT BREAKDOWN ---
            Text(
              'Payment Details',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: subTextColor),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Price for $nights nights', style: TextStyle(color: subTextColor)),
                      Text(
                        currencyFormat.format(totalAmount),
                        style: TextStyle(fontWeight: FontWeight.bold, color: textColor),
                      ),
                    ],
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Divider(color: isDark ? Colors.grey[800] : Colors.grey[300]),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total Amount', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor)),
                      Text(
                        currencyFormat.format(totalAmount),
                        style: TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 18,
                          color: primaryColor,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),

            // --- ACTION BUTTONS (If Pending) ---
            if (status == 'pending')
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {}, // Implement Reject Logic
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? Colors.red.withValues(alpha: 0.2) : Colors.red.shade50,
                        foregroundColor: Colors.red,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                      ),
                      child: const Text('Decline', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {}, // Implement Accept Logic
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                      ),
                      child: const Text('Approve', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  // Helper for info rows
  Widget _buildInfoRow(IconData icon, String label, String value, Color textColor, Color subTextColor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: subTextColor),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: TextStyle(color: subTextColor, fontSize: 12)),
              const SizedBox(height: 2),
              Text(value, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: textColor)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatusBadge(String status, bool isDark) {
    Color bg = isDark ? Colors.grey[800]! : Colors.grey[100]!;
    Color text = isDark ? Colors.grey[300]! : Colors.grey[600]!;
    IconData icon = Icons.info;

    switch (status.toLowerCase()) {
      case 'confirmed':
        bg = isDark ? const Color(0xFF1B5E20) : Colors.green[50]!;
        text = isDark ? Colors.green[200]! : Colors.green[700]!;
        icon = Icons.check_circle;
        break;
      case 'pending':
        bg = isDark ? const Color(0xFFE65100).withValues(alpha: 0.3) : Colors.orange[50]!;
        text = isDark ? Colors.orange[200]! : Colors.orange[800]!;
        icon = Icons.hourglass_top;
        break;
      case 'cancelled':
        bg = isDark ? const Color(0xFFB71C1C).withValues(alpha: 0.3) : Colors.red[50]!;
        text = isDark ? Colors.red[200]! : Colors.red[700]!;
        icon = Icons.cancel;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: text),
          const SizedBox(width: 6),
          Text(
            status.toUpperCase(),
            style: TextStyle(color: text, fontWeight: FontWeight.bold, fontSize: 12),
          ),
        ],
      ),
    );
  }
}
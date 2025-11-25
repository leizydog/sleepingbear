import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/property.dart';
// import '../../services/api_service.dart'; // Uncomment if you have this service

class PropertyDetailScreen extends StatefulWidget {
  final Property property;
  final dynamic propertyId; 

  const PropertyDetailScreen({
    super.key,
    this.propertyId, 
    required this.property,
  });

  @override
  State<PropertyDetailScreen> createState() => _PropertyDetailScreenState();
}

class _PropertyDetailScreenState extends State<PropertyDetailScreen> {
  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(symbol: '₱', decimalDigits: 0);
    
    // ✅ DARK MODE VARIABLES
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = Theme.of(context).primaryColor;
    final backgroundColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = Theme.of(context).cardColor;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subTextColor = isDark ? Colors.grey[400] : Colors.grey[600];
    // Light violet needs to be much darker in dark mode to look good
    final lightViolet = isDark ? primaryColor.withValues(alpha: 0.2) : Colors.deepPurple.shade50;

    return Scaffold(
      backgroundColor: backgroundColor,
      body: CustomScrollView(
        slivers: [
          // --- 1. HERO IMAGE HEADER ---
          SliverAppBar(
            expandedHeight: 320,
            pinned: true,
            backgroundColor: primaryColor,
            leading: Container(
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isDark ? Colors.black.withValues(alpha: 0.5) : Colors.white.withValues(alpha: 0.8),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: isDark ? Colors.white : Colors.black87),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            actions: [
              Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isDark ? Colors.black.withValues(alpha: 0.5) : Colors.white.withValues(alpha: 0.8),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: Icon(Icons.favorite_border_rounded, size: 20, color: isDark ? Colors.white : Colors.black87),
                  onPressed: () {
                    // TODO: Implement wishlist
                  },
                ),
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: widget.property.imageUrl != null
                  ? Image.network(
                      widget.property.imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: isDark ? Colors.grey[800] : Colors.grey[200],
                          child: Icon(Icons.image_not_supported, size: 60, color: Colors.grey[400]),
                        );
                      },
                    )
                  : Container(
                      color: isDark ? Colors.grey[800] : Colors.grey[200],
                      child: Icon(Icons.apartment, size: 60, color: Colors.grey[400]),
                    ),
            ),
          ),

          // --- 2. CONTENT BODY ---
          SliverToBoxAdapter(
            child: Container(
              decoration: BoxDecoration(
                color: cardColor, // Adapts to dark mode
                borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
              ),
              // Shift up to overlap the image slightly for a modern look
              transform: Matrix4.translationValues(0, -20, 0),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Handle Bar
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(
                          color: isDark ? Colors.grey[700] : Colors.grey[300],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),

                    // Title & Price
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            widget.property.name,
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: textColor,
                            ),
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              currencyFormat.format(widget.property.pricePerMonth),
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: primaryColor,
                              ),
                            ),
                            Text(
                              '/ month',
                              style: TextStyle(fontSize: 14, color: subTextColor),
                            ),
                          ],
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),

                    // Location
                    Row(
                      children: [
                        Icon(Icons.location_on_rounded, color: Colors.grey[400], size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            widget.property.address,
                            style: TextStyle(fontSize: 16, color: subTextColor),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Stats Cards
                    Row(
                      children: [
                        Expanded(
                          child: _buildInfoCard(
                            Icons.bed_rounded,
                            '${widget.property.bedrooms} Beds',
                            isDark, primaryColor, textColor
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildInfoCard(
                            Icons.bathtub_rounded,
                            '${widget.property.bathrooms} Baths',
                            isDark, primaryColor, textColor
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildInfoCard(
                            Icons.square_foot_rounded,
                            '${widget.property.sizeSqm.toInt()} m²',
                            isDark, primaryColor, textColor
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 32),

                    // Description
                    Text(
                      'Description',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      widget.property.description ?? 'No description provided.',
                      style: TextStyle(
                        fontSize: 15,
                        height: 1.6,
                        color: subTextColor,
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Amenities
                    Text(
                      'Amenities',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor),
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        _buildAmenityChip(Icons.wifi_rounded, 'Free WiFi', lightViolet, primaryColor),
                        _buildAmenityChip(Icons.pool_rounded, 'Swimming Pool', lightViolet, primaryColor),
                        _buildAmenityChip(Icons.local_parking_rounded, 'Parking', lightViolet, primaryColor),
                        _buildAmenityChip(Icons.fitness_center_rounded, 'Gym', lightViolet, primaryColor),
                        _buildAmenityChip(Icons.security_rounded, '24/7 Security', lightViolet, primaryColor),
                      ],
                    ),

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(IconData icon, String value, bool isDark, Color primaryColor, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: isDark ? Colors.grey[800] : Colors.grey[50],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey.shade100),
      ),
      child: Column(
        children: [
          Icon(icon, size: 28, color: primaryColor),
          const SizedBox(height: 8),
          Text(
            value,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAmenityChip(IconData icon, String label, Color bgColor, Color iconColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18, color: iconColor),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 13,
              color: iconColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
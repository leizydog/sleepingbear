import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/property_provider.dart';
import '../../models/property.dart';
import 'property_detail_screen.dart';

class PropertyListScreen extends StatefulWidget {
  final VoidCallback? onMenuTap;
  const PropertyListScreen({super.key, this.onMenuTap});

  @override
  State<PropertyListScreen> createState() => _PropertyListScreenState();
}

class _PropertyListScreenState extends State<PropertyListScreen> {
  // --- THEME COLORS ---
  final Color _primaryDark = const Color(0xFF4A00E0);
  final Color _primaryLight = const Color(0xFF8E2DE2);
  
  // Using Theme.of(context) ensures dark mode support later
  Color get _bgGray => Theme.of(context).scaffoldBackgroundColor;
  Color get _textDark => Theme.of(context).textTheme.bodyMedium?.color ?? const Color(0xFF1F2937);

  final _currencyFormat = NumberFormat.currency(symbol: '₱', decimalDigits: 0);

  // --- CONTROLLERS ---
  final _locationController = TextEditingController();
  final _minPriceController = TextEditingController();
  final _maxPriceController = TextEditingController();
  
  String? _selectedUnitType;
  final List<String> _unitTypes = ['Studio', '1-Bedroom', '2-Bedroom', 'Penthouse'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PropertyProvider>(context, listen: false).fetchProperties();
    });
  }

  @override
  void dispose() {
    _locationController.dispose();
    _minPriceController.dispose();
    _maxPriceController.dispose();
    super.dispose();
  }

  void _handleSearch() {
    final double? min = double.tryParse(_minPriceController.text);
    final double? max = double.tryParse(_maxPriceController.text);
    int? bedrooms;
    if (_selectedUnitType == '1-Bedroom') bedrooms = 1;
    else if (_selectedUnitType == '2-Bedroom') bedrooms = 2;

    Provider.of<PropertyProvider>(context, listen: false).fetchProperties(
      search: _locationController.text.isEmpty ? null : _locationController.text,
      minPrice: min, maxPrice: max, bedrooms: bedrooms,
    );
  }

  // --- NOTIFICATION BOTTOM SHEET ---
  void _showNotifications() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      backgroundColor: Theme.of(context).cardColor,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          height: 400,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Notifications', 
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: _textDark)
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context), 
                    child: const Text('Mark all read')
                  )
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  children: [
                    _buildNotificationItem('Booking Confirmed', 'Your stay at Jazz Residences is confirmed.', Icons.check_circle, Colors.green),
                    _buildNotificationItem('Payment Received', 'We received your payment for Unit 101.', Icons.payment, _primaryDark),
                    _buildNotificationItem('New Message', 'Owner sent you a message.', Icons.message, Colors.orange),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildNotificationItem(String title, String subtitle, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1), // Updated from withOpacity
              shape: BoxShape.circle
            ),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: _textDark, fontSize: 15)),
                const SizedBox(height: 4),
                Text(subtitle, style: TextStyle(color: Colors.grey[500], fontSize: 13)),
              ],
            ),
          ),
          Container(
            width: 8, height: 8, 
            decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle)
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Using Theme context for responsiveness to Dark Mode
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      // Background color comes from Theme wrapper in Home Screen
      backgroundColor: _bgGray,
      
      // --- APP BAR ---
      appBar: AppBar(
        backgroundColor: Colors.transparent, // Transparent to show scaffold color
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.menu_rounded, color: _textDark, size: 28),
          onPressed: widget.onMenuTap,
        ),
        title: const SleepingBearLogo(),
        actions: [
          // ✅ NOTIFICATION BUTTON
          Stack(
            children: [
              IconButton(
                icon: Icon(Icons.notifications_outlined, color: _textDark, size: 28),
                onPressed: _showNotifications,
              ),
              // Notification Dot
              Positioned(
                right: 12,
                top: 12,
                child: Container(
                  width: 10, height: 10,
                  decoration: BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                    border: Border.all(color: Theme.of(context).scaffoldBackgroundColor, width: 2)
                  ),
                ),
              )
            ],
          ),
          const SizedBox(width: 12),
        ],
      ),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeroText(),
              const SizedBox(height: 32),
              _buildSearchSection(isDark),
              const SizedBox(height: 40),
              _buildListingsHeader(),
              const SizedBox(height: 16),
              _buildPropertyList(),
            ],
          ),
        ),
      ),
    );
  }

  // --- WIDGET EXTRACTS ---

  Widget _buildHeroText() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichText(
          text: TextSpan(
            style: TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: _textDark, fontFamily: 'Serif', height: 1.1),
            children: [
              const TextSpan(text: 'Find Your \n'),
              TextSpan(
                text: 'Perfect Home',
                style: TextStyle(color: _primaryDark, fontStyle: FontStyle.italic),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Search listing to find your cozy den.',
          style: TextStyle(fontSize: 16, color: Colors.grey[600], fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildSearchSection(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: _primaryDark.withValues(alpha: 0.08), // Updated
            blurRadius: 25,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Start Your Search', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: _textDark)),
          const SizedBox(height: 20),
          
          _buildLabel('TYPE OF UNIT'),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: isDark ? Colors.grey[800] : Colors.grey[50],
              borderRadius: BorderRadius.circular(15),
              border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey.shade200),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _selectedUnitType,
                dropdownColor: Theme.of(context).cardColor,
                hint: Text('Select Unit Type', style: TextStyle(color: Colors.grey[500], fontSize: 14)),
                isExpanded: true,
                icon: Icon(Icons.keyboard_arrow_down_rounded, color: _primaryDark),
                items: _unitTypes.map((t) => DropdownMenuItem(value: t, child: Text(t, style: TextStyle(color: _textDark)))).toList(),
                onChanged: (v) => setState(() => _selectedUnitType = v),
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          _buildLabel('LOCATION'),
          _buildModernTextInput(controller: _locationController, hint: 'Enter location (e.g. Pasig)', icon: Icons.location_on_outlined, isDark: isDark),
          
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('MIN PRICE'),
                  _buildModernTextInput(controller: _minPriceController, hint: '0', inputType: TextInputType.number, isDark: isDark),
                ],
              )),
              const SizedBox(width: 12),
              Expanded(child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('MAX PRICE'),
                  _buildModernTextInput(controller: _maxPriceController, hint: '0', inputType: TextInputType.number, isDark: isDark),
                ],
              )),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // SEARCH BUTTON
          Container(
            width: double.infinity,
            height: 54,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(colors: [_primaryDark, _primaryLight]),
              boxShadow: [BoxShadow(color: _primaryDark.withValues(alpha: 0.3), blurRadius: 15, offset: const Offset(0, 8))],
            ),
            child: ElevatedButton.icon(
              onPressed: _handleSearch,
              icon: const Icon(Icons.search_rounded, color: Colors.white),
              label: const Text('SEARCH NOW', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1)),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildListingsHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text('Featured Listings', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, fontFamily: 'Serif', color: _textDark)),
        Text('See All', style: TextStyle(color: _primaryDark, fontWeight: FontWeight.bold, fontSize: 14)),
      ],
    );
  }

  Widget _buildPropertyList() {
    return Consumer<PropertyProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) return Center(child: Padding(padding: const EdgeInsets.all(40), child: CircularProgressIndicator(color: _primaryDark)));
        if (provider.properties.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                children: [
                  Icon(Icons.house_siding_rounded, size: 60, color: Colors.grey[300]),
                  const SizedBox(height: 10),
                  Text('No properties found.', style: TextStyle(color: Colors.grey[500])),
                ],
              ),
            ),
          );
        }
        return ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: provider.properties.length,
          itemBuilder: (context, index) => PropertyCard(
            property: provider.properties[index],
            currencyFormat: _currencyFormat,
            themeColor: _primaryDark,
            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => PropertyDetailScreen(property: provider.properties[index]))),
          ),
        );
      },
    );
  }

  Widget _buildLabel(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 8, left: 4),
    child: Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey[500], letterSpacing: 0.5)),
  );

  Widget _buildModernTextInput({
    required TextEditingController controller, 
    required String hint, 
    TextInputType inputType = TextInputType.text, 
    IconData? icon,
    required bool isDark,
  }) {
    return TextField(
      controller: controller,
      keyboardType: inputType,
      style: TextStyle(color: _textDark, fontWeight: FontWeight.w600),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.grey[400], fontSize: 14),
        prefixIcon: icon != null ? Icon(icon, color: _primaryDark.withValues(alpha: 0.6), size: 20) : null,
        filled: true,
        fillColor: isDark ? Colors.grey[800] : Colors.grey[50],
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide(color: isDark ? Colors.grey[700]! : Colors.grey.shade200)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide(color: isDark ? Colors.grey[700]! : Colors.grey.shade200)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(15), borderSide: BorderSide(color: _primaryDark, width: 1.5)),
      ),
    );
  }
}

// --- UPDATED LOGO WIDGET ---
class SleepingBearLogo extends StatelessWidget {
  const SleepingBearLogo({super.key});

  @override
  Widget build(BuildContext context) {
    // Dark Mode Check
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : const Color(0xFF1F2937);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.asset(
            'assets/images/sleeping_bear_logo.jpg',
            height: 35, 
            width: 35,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return Icon(Icons.bedtime_rounded, color: const Color(0xFF4A00E0), size: 30);
            },
          ),
        ),
        const SizedBox(width: 10),
        Text(
          'Sleeping Bear',
          style: TextStyle(
            color: textColor,
            fontWeight: FontWeight.bold,
            fontFamily: 'Serif',
            fontSize: 18,
          ),
        ),
      ],
    );
  }
}

// --- PROPERTY CARD ---
class PropertyCard extends StatelessWidget {
  final Property property;
  final NumberFormat currencyFormat;
  final VoidCallback onTap;
  final Color themeColor;

  const PropertyCard({
    super.key,
    required this.property,
    required this.currencyFormat,
    required this.onTap,
    required this.themeColor,
  });

  @override
  Widget build(BuildContext context) {
    // Dark Mode Colors
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = Theme.of(context).cardColor;
    final textColor = isDark ? Colors.white : Colors.black;

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF4A00E0).withValues(alpha: 0.06), // Updated
            blurRadius: 20,
            offset: const Offset(0, 8),
          )
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                child: SizedBox(
                  height: 200,
                  width: double.infinity,
                  child: property.imageUrl != null
                    ? Image.network(
                        property.imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_,__,___) => Container(color: Colors.grey[100], child: Icon(Icons.image_not_supported_outlined, color: Colors.grey[400]))
                      )
                    : Container(color: Colors.grey[100], child: Icon(Icons.apartment_rounded, size: 50, color: Colors.grey[300])),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            property.name,
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, height: 1.2, color: textColor),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          '${currencyFormat.format(property.pricePerMonth)}/mo',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: themeColor),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.location_on, size: 14, color: Colors.grey[400]),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            property.address,
                            style: TextStyle(color: Colors.grey[500], fontSize: 13, fontWeight: FontWeight.w500),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Divider(color: isDark ? Colors.grey[800] : Colors.grey[100], thickness: 1),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildFeatureBadge(Icons.bed_rounded, '${property.bedrooms} Beds', isDark),
                        _buildFeatureBadge(Icons.bathtub_outlined, '${property.bathrooms} Baths', isDark),
                        _buildFeatureBadge(Icons.square_foot_rounded, '${property.sizeSqm.toInt()} m²', isDark),
                      ],
                    )
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureBadge(IconData icon, String text, bool isDark) {
    return Row(
      children: [
        Icon(icon, size: 18, color: Colors.grey[400]),
        const SizedBox(width: 6),
        Text(text, style: TextStyle(fontWeight: FontWeight.bold, color: isDark ? Colors.grey[400] : Colors.grey[700], fontSize: 13)),
      ],
    );
  }
}
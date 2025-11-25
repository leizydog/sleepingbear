import 'dart:io'; 
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart'; 
import 'package:intl/intl.dart';

class AddListingScreen extends StatefulWidget {
  const AddListingScreen({super.key});

  @override
  State<AddListingScreen> createState() => _AddListingScreenState();
}

class _AddListingScreenState extends State<AddListingScreen> {
  // --- STATE VARIABLES ---
  int _currentStep = 1;
  bool _isLoading = false;
  
  // ✅ REAL IMAGE STATE
  final ImagePicker _picker = ImagePicker();
  final List<XFile> _selectedImages = []; 

  // --- FORM CONTROLLERS ---
  final _condoNameController = TextEditingController();
  final _unitNumberController = TextEditingController();
  final _priceController = TextEditingController();
  final _sizeController = TextEditingController();
  final _addressController = TextEditingController();
  final _descriptionController = TextEditingController();
  
  // Payment Controllers
  final _bpiNameController = TextEditingController();
  final _bpiNumberController = TextEditingController();
  final _gcashNameController = TextEditingController();
  final _gcashNumberController = TextEditingController();

  // Dropdown Values
  int _bedrooms = 1;
  int _bathrooms = 1;
  
  // Payment Flags
  bool _acceptsBpi = false;
  bool _acceptsGcash = false;
  bool _acceptsCash = false;

  // --- IMAGE PICKER FUNCTION ---
  Future<void> _pickImages() async {
    if (_selectedImages.length >= 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Maximum of 10 photos reached.'))
      );
      return;
    }

    try {
      final List<XFile> pickedFiles = await _picker.pickMultiImage(
        imageQuality: 80, 
      );

      if (pickedFiles.isNotEmpty) {
        setState(() {
          _selectedImages.addAll(pickedFiles);
          
          if (_selectedImages.length > 10) {
            _selectedImages.removeRange(10, _selectedImages.length);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Limit reached. Only first 10 photos added.'))
            );
          }
        });
      }
    } catch (e) {
      debugPrint('Error picking images: $e');
    }
  }

  void _removeImage(int index) {
    setState(() {
      _selectedImages.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    // ✅ FULL DARK MODE INTEGRATION
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = Theme.of(context).primaryColor; 
    final backgroundColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = Theme.of(context).cardColor;
    
    final textColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final subTextColor = isDark ? Colors.grey[400] : Colors.grey[600];
    final inputFill = isDark ? const Color(0xFF2C2C2C) : const Color(0xFFF9FAFB);

    return Scaffold(
      backgroundColor: backgroundColor,
      
      // --- APP BAR ---
      appBar: AppBar(
        backgroundColor: backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.close_rounded, color: textColor),
          onPressed: () => Navigator.pop(context),
        ),
        centerTitle: true,
        title: Text(
          'New Listing',
          style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 17),
        ),
      ),

      // --- BODY ---
      body: Stack(
        children: [
          Column(
            children: [
              _buildProgressBar(cardColor, primaryColor, isDark),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 100), 
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 400),
                    transitionBuilder: (child, animation) => FadeTransition(opacity: animation, child: child),
                    child: _buildCurrentStep(isDark, inputFill, textColor, subTextColor, cardColor, primaryColor),
                  ),
                ),
              ),
            ],
          ),
          
          if (_isLoading) _buildLoadingOverlay(isDark, primaryColor),
        ],
      ),
      
      bottomNavigationBar: _buildBottomBar(cardColor, isDark, primaryColor),
    );
  }

  // --- WIDGETS: PROGRESS BAR ---
  Widget _buildProgressBar(Color cardColor, Color primaryColor, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 15),
      color: cardColor,
      child: Row(
        children: [
          _buildStepNode(1, 'Details', isDark, primaryColor),
          _buildStepLine(1, isDark, primaryColor),
          _buildStepNode(2, 'Payment', isDark, primaryColor),
          _buildStepLine(2, isDark, primaryColor),
          _buildStepNode(3, 'Review', isDark, primaryColor),
        ],
      ),
    );
  }

  Widget _buildStepNode(int step, String label, bool isDark, Color primaryColor) {
    bool isActive = _currentStep >= step;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          width: 30,
          height: 30,
          decoration: BoxDecoration(
            color: isActive ? primaryColor : (isDark ? Colors.grey[800] : Colors.grey[100]),
            shape: BoxShape.circle,
            border: Border.all(color: isActive ? primaryColor : (isDark ? Colors.grey[700]! : Colors.grey[300]!)),
          ),
          child: Center(
            child: isActive 
              ? const Icon(Icons.check, color: Colors.white, size: 16)
              : Text('$step', style: TextStyle(color: Colors.grey[400], fontWeight: FontWeight.bold, fontSize: 12)),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
            color: isActive ? primaryColor : Colors.grey[400],
          ),
        ),
      ],
    );
  }

  Widget _buildStepLine(int step, bool isDark, Color primaryColor) {
    return Expanded(
      child: Container(
        height: 1,
        margin: const EdgeInsets.only(bottom: 18, left: 5, right: 5),
        color: _currentStep > step ? primaryColor : (isDark ? Colors.grey[800] : Colors.grey[200]),
      ),
    );
  }

  // --- STEP CONTENT SWITCHER ---
  Widget _buildCurrentStep(bool isDark, Color inputFill, Color textColor, Color? subTextColor, Color cardColor, Color primaryColor) {
    switch (_currentStep) {
      case 1: return _buildDetailsStep(isDark, inputFill, textColor, subTextColor, primaryColor);
      case 2: return _buildPaymentStep(isDark, inputFill, textColor, primaryColor);
      case 3: return _buildConfirmationStep(isDark, cardColor, textColor, subTextColor, primaryColor);
      default: return Container();
    }
  }

  // ===========================================================================
  // 📸 STEP 1: PROPERTY DETAILS & IMAGE UPLOAD
  // ===========================================================================
  Widget _buildDetailsStep(bool isDark, Color inputFill, Color textColor, Color? subTextColor, Color primaryColor) {
    return Column(
      key: const ValueKey(1),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // --- IMAGE UPLOAD SECTION ---
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Property Photos', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor)),
            Text('${_selectedImages.length}/10', style: TextStyle(color: _selectedImages.length >= 3 ? Colors.green : Colors.grey)),
          ],
        ),
        const SizedBox(height: 4),
        const Text('Add 3-10 photos. First photo will be the cover.', style: TextStyle(fontSize: 12, color: Colors.grey)),
        const SizedBox(height: 12),
        
        // Gallery Area
        SizedBox(
          height: 110,
          child: ListView(
            scrollDirection: Axis.horizontal,
            clipBehavior: Clip.none,
            children: [
              // Add Button
              if (_selectedImages.length < 10)
                GestureDetector(
                  onTap: _pickImages,
                  child: Container(
                    width: 100,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      color: inputFill,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: primaryColor.withValues(alpha: 0.3), width: 1.5, style: BorderStyle.solid), 
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_photo_alternate_rounded, color: primaryColor, size: 28),
                        const SizedBox(height: 4),
                        Text('Add Photo', style: TextStyle(color: primaryColor, fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              
              // Image List Rendering
              ..._selectedImages.asMap().entries.map((entry) {
                final int index = entry.key;
                final XFile imageFile = entry.value;

                return Stack(
                  children: [
                    Container(
                      width: 100,
                      margin: const EdgeInsets.only(right: 12),
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(16),
                        image: DecorationImage(
                          image: FileImage(File(imageFile.path)), 
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    
                    // Remove Button
                    Positioned(
                      top: 4,
                      right: 16,
                      child: GestureDetector(
                        onTap: () => _removeImage(index),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                          child: const Icon(Icons.close, size: 12, color: Colors.white),
                        ),
                      ),
                    ),
                    
                    // Cover Label
                    if (index == 0)
                      Positioned(
                        bottom: 0,
                        left: 0,
                        right: 12,
                        child: Container(
                          height: 24,
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.6),
                            borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(16), bottomRight: Radius.circular(16))
                          ),
                          alignment: Alignment.center,
                          child: const Text('Cover', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                      )
                  ],
                );
              }),
            ],
          ),
        ),

        const SizedBox(height: 30),

        // --- INPUT FIELDS ---
        _buildSectionTitle('Basic Info', subTextColor),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(child: _buildModernInput(_condoNameController, 'Condo Name', Icons.apartment, isDark, textColor, inputFill, primaryColor)),
            const SizedBox(width: 16),
            Expanded(child: _buildModernInput(_unitNumberController, 'Unit No.', Icons.tag, isDark, textColor, inputFill, primaryColor)),
          ],
        ),
        const SizedBox(height: 16),
        _buildModernInput(_addressController, 'Full Address', Icons.location_on_outlined, isDark, textColor, inputFill, primaryColor),
        const SizedBox(height: 16),
        
        Row(
          children: [
            Expanded(child: _buildModernInput(_priceController, 'Price', Icons.attach_money, isDark, textColor, inputFill, primaryColor, isNumber: true, hint: '0.00')),
            const SizedBox(width: 16),
            Expanded(child: _buildModernInput(_sizeController, 'Size', Icons.square_foot, isDark, textColor, inputFill, primaryColor, isNumber: true, hint: 'sqm')),
          ],
        ),
        const SizedBox(height: 16),

        Row(
          children: [
            Expanded(child: _buildModernDropdown('Bedrooms', _bedrooms, [0, 1, 2, 3], (v) => setState(() => _bedrooms = v!), isDark, textColor, inputFill, primaryColor)),
            const SizedBox(width: 16),
            Expanded(child: _buildModernDropdown('Bathrooms', _bathrooms, [1, 2, 3], (v) => setState(() => _bathrooms = v!), isDark, textColor, inputFill, primaryColor)),
          ],
        ),
        
        const SizedBox(height: 24),
        _buildSectionTitle('Description', subTextColor),
        const SizedBox(height: 8),
        TextField(
          controller: _descriptionController,
          maxLines: 4,
          style: TextStyle(color: textColor, fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Describe features (e.g. Near Mall, Renovated...)',
            hintStyle: TextStyle(color: Colors.grey[400], fontSize: 13),
            filled: true,
            fillColor: inputFill,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.all(16),
          ),
        ),
      ],
    );
  }

  // ===========================================================================
  // 💳 STEP 2: PAYMENT METHODS
  // ===========================================================================
  Widget _buildPaymentStep(bool isDark, Color inputFill, Color textColor, Color primaryColor) {
    final subTextColor = isDark ? Colors.grey[400]! : Colors.grey[600]!;

    return Column(
      key: const ValueKey(2),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Payment Options', subTextColor),
        const Text('Select accepted payment methods for tenants.', style: TextStyle(color: Colors.grey, fontSize: 13)),
        const SizedBox(height: 24),

        _buildBrandedCard(
          title: 'BPI Transfer', 
          brandColor: const Color(0xFFB1000E),
          isSelected: _acceptsBpi, 
          isDark: isDark,
          logo: _buildTextLogo('BPI', const Color(0xFFB1000E)),
          onChanged: (val) => setState(() => _acceptsBpi = val),
          child: Column(children: [
            const SizedBox(height: 12),
            _buildModernInput(_bpiNameController, 'Account Name', null, isDark, textColor, inputFill, primaryColor),
            const SizedBox(height: 12),
            _buildModernInput(_bpiNumberController, 'Account Number', null, isDark, textColor, inputFill, primaryColor, isNumber: true),
          ]),
        ),
        const SizedBox(height: 16),
        _buildBrandedCard(
          title: 'GCash', 
          brandColor: const Color(0xFF007DFE),
          isSelected: _acceptsGcash, 
          isDark: isDark,
          logo: _buildTextLogo('G', const Color(0xFF007DFE)),
          onChanged: (val) => setState(() => _acceptsGcash = val),
          child: Column(children: [
            const SizedBox(height: 12),
            _buildModernInput(_gcashNameController, 'Account Name', null, isDark, textColor, inputFill, primaryColor),
            const SizedBox(height: 12),
            _buildModernInput(_gcashNumberController, 'Mobile Number', null, isDark, textColor, inputFill, primaryColor, isNumber: true),
          ]),
        ),
        const SizedBox(height: 16),
        _buildBrandedCard(
          title: 'Cash', 
          brandColor: const Color(0xFF00C853),
          isSelected: _acceptsCash, 
          isDark: isDark,
          logo: Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: const Color(0xFFE8F5E9), borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.payments_rounded, color: Color(0xFF00C853)),
          ),
          onChanged: (val) => setState(() => _acceptsCash = val),
          child: Container(
            margin: const EdgeInsets.only(top: 8),
            padding: const EdgeInsets.all(12),
            // ✅ FIXED HARDCODED COLORS HERE
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1B5E20).withValues(alpha: 0.2) : const Color(0xFFE8F5E9), 
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: isDark ? const Color(0xFF2E7D32) : const Color(0xFFC8E6C9)),
            ),
            child: Row(children: [
              Icon(Icons.info_outline, size: 16, color: isDark ? const Color(0xFFA5D6A7) : Colors.orange[800]),
              const SizedBox(width: 8),
              Flexible(child: Text(
                'Payment collected at admin office.', 
                style: TextStyle(fontSize: 12, color: isDark ? const Color(0xFFA5D6A7) : Colors.orange[900])
              )),
            ]),
          ),
        ),
      ],
    );
  }

  // ===========================================================================
  // ✅ STEP 3: REVIEW & SUBMIT
  // ===========================================================================
  Widget _buildConfirmationStep(bool isDark, Color cardColor, Color textColor, Color? subTextColor, Color primaryColor) {
    final fmt = NumberFormat.currency(symbol: '₱', decimalDigits: 0);
    final shadowColor = isDark ? Colors.black26 : primaryColor.withValues(alpha: 0.05);

    return Column(
      key: const ValueKey(3),
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: isDark ? Colors.grey[800]! : Colors.grey.shade100),
            boxShadow: [BoxShadow(color: shadowColor, blurRadius: 20, offset: const Offset(0, 10))],
          ),
          child: Column(
            children: [
              // Photo Preview Strip
              SizedBox(
                height: 60,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(_selectedImages.length > 4 ? 4 : _selectedImages.length, (index) {
                    return Align(
                      widthFactor: 0.7,
                      child: Container(
                        width: 50, height: 50,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: cardColor, width: 2),
                          image: DecorationImage(
                            image: FileImage(File(_selectedImages[index].path)), 
                            fit: BoxFit.cover
                          ),
                          boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 5)],
                        ),
                      ),
                    );
                  }),
                ),
              ),
              const SizedBox(height: 16),
              
              Text('Review Listing', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: textColor)),
              const SizedBox(height: 4),
              const Text('Please ensure all details are correct.', style: TextStyle(color: Colors.grey, fontSize: 12)),
              const Divider(height: 32),
              
              _buildReviewRow('Property', '${_condoNameController.text} ${_unitNumberController.text}', textColor, subTextColor, primaryColor),
              const SizedBox(height: 12),
              _buildReviewRow('Location', _addressController.text, textColor, subTextColor, primaryColor),
              const SizedBox(height: 12),
              _buildReviewRow('Price', '${fmt.format(double.tryParse(_priceController.text) ?? 0)} / month', textColor, subTextColor, primaryColor, isHighlight: true),
              
              const SizedBox(height: 24),
              
              // --- ACCEPTED PAYMENTS REVIEW ---
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[800] : const Color(0xFFF9FAFB), 
                  borderRadius: BorderRadius.circular(16)
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Accepted Payments', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: subTextColor)),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        if (_acceptsBpi) 
                          _buildBrandTag('BPI', const Color(0xFFB1000E), isDark ? const Color(0xFF3E0005) : const Color(0xFFFFEBEE)),
                        if (_acceptsGcash) 
                          _buildBrandTag('GCash', const Color(0xFF007DFE), isDark ? const Color(0xFF001E40) : const Color(0xFFE3F2FD)),
                        if (_acceptsCash) 
                          _buildBrandTag('Cash', const Color(0xFF00C853), isDark ? const Color(0xFF003314) : const Color(0xFFE8F5E9)),
                        if (!_acceptsBpi && !_acceptsGcash && !_acceptsCash) 
                          const Text('No payment method selected', style: TextStyle(color: Colors.red, fontSize: 11)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // --- HELPER WIDGETS ---

  Widget _buildSectionTitle(String title, Color? color) {
    return Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color, letterSpacing: 0.5));
  }

  Widget _buildModernInput(
    TextEditingController controller, 
    String label, 
    IconData? icon, 
    bool isDark,
    Color textColor,
    Color inputFill,
    Color primaryColor,
    {bool isNumber = false, String? hint, Color? brandColor}
  ) {
    final activeColor = brandColor ?? primaryColor;
    
    return Container(
      decoration: BoxDecoration(
        color: inputFill,
        borderRadius: BorderRadius.circular(16),
      ),
      child: TextField(
        controller: controller,
        keyboardType: isNumber ? TextInputType.number : TextInputType.text,
        style: TextStyle(fontWeight: FontWeight.w600, color: textColor, fontSize: 14),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          labelStyle: TextStyle(color: Colors.grey[500], fontSize: 13),
          floatingLabelStyle: TextStyle(color: activeColor, fontWeight: FontWeight.bold),
          prefixIcon: icon != null ? Icon(icon, size: 20, color: activeColor.withValues(alpha: 0.6)) : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
    );
  }

  Widget _buildModernDropdown(
    String label, 
    int value, 
    List<int> options, 
    Function(int?) onChanged,
    bool isDark, 
    Color textColor, 
    Color inputFill,
    Color primaryColor
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(color: inputFill, borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 8),
          Text(label, style: TextStyle(fontSize: 11, color: Colors.grey[500], fontWeight: FontWeight.bold)),
          DropdownButtonHideUnderline(
            child: DropdownButton<int>(
              value: value,
              isExpanded: true,
              dropdownColor: isDark ? const Color(0xFF333333) : Colors.white,
              icon: Icon(Icons.keyboard_arrow_down_rounded, color: primaryColor),
              style: TextStyle(fontWeight: FontWeight.w600, color: textColor, fontSize: 15),
              items: options.map((i) => DropdownMenuItem(value: i, child: Text(i == 0 ? 'Studio' : '$i'))).toList(),
              onChanged: onChanged,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBrandedCard({
    required String title,
    required Color brandColor,
    required bool isSelected,
    required bool isDark,
    required Widget logo,
    required Function(bool) onChanged,
    required Widget child,
  }) {
    final cardBg = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final borderColor = isDark ? Colors.grey[800]! : Colors.transparent;
    final textColor = isDark ? Colors.white : const Color(0xFF1F2937);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        color: isSelected ? cardBg : (isDark ? Colors.grey[900] : const Color(0xFFF9FAFB).withValues(alpha: 0.5)),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected ? brandColor : borderColor, 
          width: 2
        ),
        boxShadow: isSelected 
          ? [BoxShadow(color: brandColor.withValues(alpha: 0.08), blurRadius: 10, offset: const Offset(0, 4))] 
          : [],
      ),
      child: Column(
        children: [
          CheckboxListTile(
            value: isSelected,
            onChanged: (v) => onChanged(v ?? false),
            activeColor: brandColor,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: [
                logo,
                const SizedBox(width: 12),
                Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? textColor : Colors.grey[600], fontSize: 14)),
              ],
            ),
          ),
          if (isSelected)
             Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), child: child),
        ],
      ),
    );
  }

  Widget _buildTextLogo(String text, Color color) {
    return Container(
      width: 32, height: 32,
      decoration: BoxDecoration(
        color: color, 
        borderRadius: BorderRadius.circular(8),
        boxShadow: [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 4, offset: const Offset(0, 2))]
      ),
      alignment: Alignment.center,
      child: Text(
        text, 
        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12)
      ),
    );
  }

  Widget _buildReviewRow(String label, String value, Color textColor, Color? subTextColor, Color primaryColor, {bool isHighlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: subTextColor, fontSize: 13, fontWeight: FontWeight.w500)),
        Text(value, style: TextStyle(
          fontWeight: isHighlight ? FontWeight.bold : FontWeight.w600, 
          color: isHighlight ? primaryColor : textColor, 
          fontSize: isHighlight ? 16 : 14
        )),
      ],
    );
  }

  Widget _buildBrandTag(String label, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(8), border: Border.all(color: textColor.withValues(alpha: 0.2))),
      child: Text(label, style: TextStyle(fontSize: 11, color: textColor, fontWeight: FontWeight.w600)),
    );
  }

  Widget _buildBottomBar(Color cardColor, bool isDark, Color primaryColor) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: cardColor, border: Border(top: BorderSide(color: isDark ? Colors.grey[800]! : Colors.grey.shade100))),
      child: SafeArea(
        child: Row(
          children: [
            if (_currentStep > 1)
              Expanded(
                child: TextButton(
                  onPressed: _isLoading ? null : () => setState(() => _currentStep--),
                  child: Text('Back', style: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600], fontWeight: FontWeight.bold)),
                ),
              ),
            const SizedBox(width: 16),
            Expanded(
              flex: 2,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: [primaryColor, primaryColor.withValues(alpha: 0.7)]),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [BoxShadow(color: primaryColor.withValues(alpha: 0.3), blurRadius: 10, offset: const Offset(0, 5))],
                ),
                child: ElevatedButton(
                  onPressed: _isLoading ? null : () {
                    if (_currentStep < 3) {
                      if (_currentStep == 1 && _selectedImages.length < 3) {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please upload at least 3 photos'), backgroundColor: Colors.red));
                        return;
                      }
                      setState(() => _currentStep++);
                    } else {
                      _handleSubmit();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: _isLoading 
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(_currentStep == 3 ? 'Publish Listing' : 'Next Step', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 15)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingOverlay(bool isDark, Color primaryColor) {
    return Container(
      color: Colors.black.withValues(alpha: 0.3),
      child: Center(
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: isDark ? const Color(0xFF1E1E1E) : Colors.white, borderRadius: BorderRadius.circular(20)),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: primaryColor),
              const SizedBox(height: 16),
              Text('Submitting...', style: TextStyle(fontWeight: FontWeight.bold, color: isDark ? Colors.white : Colors.black)),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleSubmit() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 2)); 
    if (!mounted) return;
    setState(() => _isLoading = false);

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dialogBg = isDark ? const Color(0xFF1E1E1E) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1F2937);
    final primaryColor = Theme.of(context).primaryColor;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: dialogBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        contentPadding: const EdgeInsets.all(32),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.green[50], shape: BoxShape.circle),
              child: Icon(Icons.check_rounded, size: 40, color: Colors.green[600]),
            ),
            const SizedBox(height: 24),
            Text('Listing Submitted!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: textColor)),
            const SizedBox(height: 8),
            Text('Admin will review your listing shortly.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[500], fontSize: 13)),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(backgroundColor: primaryColor, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), padding: const EdgeInsets.symmetric(vertical: 14)),
                child: const Text('Back to Dashboard', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
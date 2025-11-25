import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// --- IMPORTS ---
import '../../providers/auth_provider.dart';
import '../properties/property_list_screen.dart';
import '../bookings/booking_list_screen.dart';
import '../owner/owner_dashboard_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  
  // ✅ DARK MODE STATE
  bool _isDarkMode = false;
  
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  
  // DESIGN: Modern Purple Theme Colors
  final Color _primaryDark = const Color(0xFF4A00E0);
  final Color _primaryLight = const Color(0xFF8E2DE2);

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    // Delay closing drawer slightly for better UX
    Future.delayed(const Duration(milliseconds: 150), () {
      _scaffoldKey.currentState?.closeDrawer();
    });
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    // --- SCREEN LIST ---
    // These screens will inherit the Theme defined below
    final List<Widget> screens = [
      PropertyListScreen(onMenuTap: () => _scaffoldKey.currentState?.openDrawer()),
      BookingListScreen(onMenuTap: () => _scaffoldKey.currentState?.openDrawer()),
      ProfileScreen(onMenuTap: () => _scaffoldKey.currentState?.openDrawer()),
      OwnerDashboardScreen(onMenuTap: () => _scaffoldKey.currentState?.openDrawer()),
    ];

    if (_selectedIndex >= screens.length) _selectedIndex = 0;

    // ✅ THEME WRAPPER (Controls Dark Mode for ALL screens inside Scaffold)
    return Theme(
      data: _isDarkMode 
        ? ThemeData.dark().copyWith(
            scaffoldBackgroundColor: const Color(0xFF121212),
            cardColor: const Color(0xFF1E1E1E),
            primaryColor: _primaryLight,
            colorScheme: ColorScheme.dark(primary: _primaryLight, secondary: _primaryDark),
            dividerColor: Colors.grey[800],
          )
        : ThemeData.light().copyWith(
            scaffoldBackgroundColor: const Color(0xFFF8F9FA),
            cardColor: Colors.white,
            primaryColor: _primaryDark,
            colorScheme: ColorScheme.light(primary: _primaryDark, secondary: _primaryLight),
            dividerColor: Colors.grey[200],
          ),
      child: Scaffold(
        key: _scaffoldKey,
        body: IndexedStack(
          index: _selectedIndex,
          children: screens,
        ),
        
        // ✅ MODERN DRAWER DESIGN
        drawer: Drawer(
          width: MediaQuery.of(context).size.width * 0.75,
          // Dynamic Drawer Background based on local state
          backgroundColor: _isDarkMode ? const Color(0xFF1E1E1E) : Colors.white,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.only(
              topRight: Radius.circular(30),
              bottomRight: Radius.circular(30),
            ),
          ),
          child: Column(
            children: [
              // --- 1. BRANDED HEADER ---
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(24, 60, 24, 40),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [_primaryDark, _primaryLight],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: const BorderRadius.only(bottomRight: Radius.circular(30)),
                  boxShadow: [
                    BoxShadow(
                      color: _primaryDark.withValues(alpha: 0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    )
                  ]
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ACCOUNT ICON
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: CircleAvatar(
                        radius: 35, 
                        backgroundColor: Colors.white,
                        child: Text(
                          (user?.username != null && user!.username.isNotEmpty) 
                              ? user.username[0].toUpperCase() 
                              : '?',
                          style: TextStyle(
                            color: _primaryDark, 
                            fontSize: 28, 
                            fontWeight: FontWeight.w900
                          ),
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 20),
                    
                    // USER TEXT
                    Text(
                      user?.fullName ?? user?.username ?? 'Guest',
                      style: const TextStyle(
                        color: Colors.white, 
                        fontSize: 22, 
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5
                      ),
                    ),
                    Text(
                      user?.email ?? '',
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 13),
                    ),
                    const SizedBox(height: 12),
                    
                    // ROLE BADGE
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                      ),
                      child: Text(
                        (user?.role ?? '').toLowerCase() == 'tenant'
                            ? 'USER'
                            : (user?.role.toUpperCase() ?? 'USER'),
                        style: const TextStyle(
                          color: Colors.white, 
                          fontSize: 10, 
                          fontWeight: FontWeight.bold, 
                          letterSpacing: 1
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // --- 2. NAVIGATION ITEMS ---
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
                  children: [
                    _buildModernDrawerItem(0, 'Explore', Icons.explore_rounded),
                    _buildModernDrawerItem(1, 'My Bookings', Icons.calendar_month_rounded),
                    _buildModernDrawerItem(2, 'My Profile', Icons.person_rounded),
                    
                    const SizedBox(height: 20),
                    const Divider(thickness: 1, height: 1), 
                    const SizedBox(height: 20),
                    
                    Padding(
                      padding: const EdgeInsets.only(left: 16, bottom: 10),
                      child: Text(
                        'MANAGEMENT',
                        style: TextStyle(
                          color: _isDarkMode ? Colors.grey[400] : Colors.grey[600], 
                          fontSize: 11, 
                          fontWeight: FontWeight.bold, 
                          letterSpacing: 1.5
                        ),
                      ),
                    ),
                    _buildModernDrawerItem(3, 'Owner Dashboard', Icons.dashboard_rounded),
                    
                    const SizedBox(height: 20),
                    
                    // ✅ DARK MODE SWITCH
                    Container(
                      decoration: BoxDecoration(
                        color: _isDarkMode ? Colors.white.withValues(alpha: 0.05) : Colors.grey[100],
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: SwitchListTile(
                        title: Text(
                          'Dark Mode', 
                          style: TextStyle(
                            fontWeight: FontWeight.w600, 
                            color: _isDarkMode ? Colors.white : Colors.grey[800],
                            fontSize: 15
                          )
                        ),
                        secondary: Icon(
                          _isDarkMode ? Icons.dark_mode_rounded : Icons.light_mode_rounded, 
                          color: _isDarkMode ? Colors.yellow[700] : _primaryDark
                        ),
                        value: _isDarkMode,
                        activeColor: _primaryLight,
                        onChanged: (bool value) {
                          setState(() {
                            _isDarkMode = value;
                          });
                        },
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                  ],
                ),
              ),

              // --- 3. LOGOUT BUTTON ---
              Padding(
                padding: const EdgeInsets.all(24),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: ListTile(
                    leading: const Icon(Icons.logout_rounded, color: Colors.redAccent),
                    title: const Text(
                      'Log Out', 
                      style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)
                    ),
                    onTap: () async {
                      final auth = Provider.of<AuthProvider>(context, listen: false);
                      await auth.logout();
                      if (mounted) {
                        Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
                      }
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // HELPER: Modern Pill-Shaped Drawer Item
  Widget _buildModernDrawerItem(int index, String title, IconData icon) {
    final isSelected = _selectedIndex == index;
    
    // Dynamic Colors based on Dark Mode
    final baseTextColor = _isDarkMode ? Colors.grey[300] : Colors.grey[700];
    final selectedTextColor = _primaryDark; 
    
    final baseIconColor = _isDarkMode ? Colors.grey[500] : Colors.grey[500];
    final selectedIconColor = _primaryDark;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _onItemTapped(index),
          borderRadius: BorderRadius.circular(16),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isSelected ? _primaryDark.withValues(alpha: 0.08) : Colors.transparent,
              borderRadius: BorderRadius.circular(16),
              border: (_isDarkMode && isSelected) 
                  ? Border.all(color: _primaryDark.withValues(alpha: 0.3)) 
                  : null,
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  color: isSelected ? selectedIconColor : baseIconColor,
                  size: 24,
                ),
                const SizedBox(width: 16),
                Text(
                  title,
                  style: TextStyle(
                    color: isSelected ? ( _isDarkMode ? Colors.white : selectedTextColor) : baseTextColor,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    fontSize: 15,
                  ),
                ),
                const Spacer(),
                if (isSelected)
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: _primaryLight,
                      shape: BoxShape.circle,
                    ),
                  )
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// ✅ PROFILE SCREEN (Removed Upload Logic)
// ---------------------------------------------------------------------------

class ProfileScreen extends StatefulWidget {
  final VoidCallback? onMenuTap;
  const ProfileScreen({super.key, this.onMenuTap});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final Color _primaryDark = const Color(0xFF4A00E0);
  final Color _primaryLight = const Color(0xFF8E2DE2);

  // ❌ Removed Image Picker & File State

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;
    
    // Theme Check
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDarkMode ? Colors.white : const Color(0xFF1F2937);

    if (user == null) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      
      body: SingleChildScrollView(
        child: Column(
          children: [
            // --- HEADER SECTION ---
            Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.center,
              children: [
                _buildCurvedHeader(),
                
                // AppBar Buttons
                Positioned(
                  top: 50, left: 20, right: 20,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildGlassButton(Icons.menu_rounded, widget.onMenuTap),
                      _buildGlassButton(
                        Icons.edit_rounded, 
                        () => _showEditProfileDialog(context, authProvider)
                      ),
                    ],
                  ),
                ),

                // ✅ STATIC AVATAR (Not clickable)
                Positioned(
                  bottom: -60,
                  child: _buildAvatar(user.username, isDarkMode),
                ),
              ],
            ),

            const SizedBox(height: 70),

            // --- USER IDENTITY ---
            Text(
              user.fullName ?? user.username,
              style: TextStyle(
                fontSize: 26, 
                fontWeight: FontWeight.w900, 
                color: textColor,
                letterSpacing: -0.5,
              ),
            ),

            const SizedBox(height: 30),

            // --- INFO SECTIONS ---
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  _buildSectionLabel('PERSONAL DETAILS'),
                  const SizedBox(height: 10),
                  
                  Container(
                    decoration: _cardDecoration(context),
                    child: Column(
                      children: [
                        _buildInfoTile(context, Icons.email_outlined, 'Email Address', user.email, isFirst: true),
                        _buildDivider(context),
                        _buildInfoTile(context, Icons.phone_outlined, 'Phone Number', user.phone ?? 'Tap edit to add'),
                        _buildDivider(context),
                        _buildInfoTile(context, Icons.calendar_month_rounded, 'Member Since', 'Year ${user.createdAt.year}', isLast: true),
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),

                  // LOGOUT BUTTON
                  SizedBox(
                    width: double.infinity,
                    child: TextButton.icon(
                      onPressed: () async {
                        await authProvider.logout();
                        if (mounted) Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
                      },
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: Colors.red.withValues(alpha: 0.1),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      icon: Icon(Icons.logout_rounded, color: Colors.red[400]),
                      label: Text('Sign Out', style: TextStyle(color: Colors.red[400], fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- WIDGET BUILDERS ---

  Widget _buildCurvedHeader() {
    return Container(
      height: 240,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [_primaryDark, _primaryLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(40),
          bottomRight: Radius.circular(40),
        ),
        boxShadow: [
          BoxShadow(
            color: _primaryDark.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(top: -50, right: -50, child: CircleAvatar(radius: 100, backgroundColor: Colors.white.withValues(alpha: 0.05))),
          Positioned(bottom: 50, left: -30, child: CircleAvatar(radius: 60, backgroundColor: Colors.white.withValues(alpha: 0.05))),
        ],
      ),
    );
  }

  Widget _buildGlassButton(IconData icon, VoidCallback? onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.2),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white.withValues(alpha: 0.3), width: 1),
        ),
        child: Icon(icon, color: Colors.white, size: 22),
      ),
    );
  }

  // ✅ SIMPLE AVATAR (No upload logic)
  Widget _buildAvatar(String username, bool isDarkMode) {
    final bgColor = isDarkMode ? const Color(0xFF2C2C2C) : const Color(0xFFF8F9FA);
    
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 5))
        ],
      ),
      child: CircleAvatar(
        radius: 60,
        backgroundColor: const Color(0xFFF3E5F5),
        child: Text(
          username.isNotEmpty ? username[0].toUpperCase() : '?',
          style: TextStyle(fontSize: 40, fontWeight: FontWeight.w900, color: _primaryDark),
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(left: 8.0),
        child: Text(
          label,
          style: TextStyle(color: Colors.grey[400], fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.2),
        ),
      ),
    );
  }

  BoxDecoration _cardDecoration(BuildContext context) {
    return BoxDecoration(
      color: Theme.of(context).cardColor, // Adapts to Dark Mode
      borderRadius: BorderRadius.circular(20),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.03), 
          blurRadius: 15, 
          offset: const Offset(0, 4)
        ),
      ],
    );
  }

  Widget _buildInfoTile(BuildContext context, IconData icon, String title, String value, {bool isFirst = false, bool isLast = false}) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final valueColor = isDarkMode ? Colors.white : const Color(0xFF1F2937);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: _primaryDark.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, color: _primaryDark, size: 22),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: Colors.grey[400], fontSize: 11, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(value, style: TextStyle(color: valueColor, fontSize: 15, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider(BuildContext context) {
    return Divider(
      height: 1, 
      thickness: 1, 
      color: Theme.of(context).dividerColor, 
      indent: 60, 
      endIndent: 20
    );
  }

  // --- EDIT DIALOG ---
  void _showEditProfileDialog(BuildContext context, AuthProvider authProvider) {
    final user = authProvider.user!;
    final nameController = TextEditingController(text: user.fullName ?? user.username);
    final phoneController = TextEditingController(text: user.phone ?? '');
    
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final dialogBg = isDarkMode ? const Color(0xFF2C2C2C) : Colors.white;
    final textColor = isDarkMode ? Colors.white : Colors.black;

    bool isSaving = false;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              backgroundColor: dialogBg,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: Text('Edit Profile', style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildDialogInput(context, nameController, 'Full Name', Icons.person_outline),
                  const SizedBox(height: 16),
                  _buildDialogInput(context, phoneController, 'Phone Number', Icons.phone_outlined, isPhone: true),
                ],
              ),
              actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('Cancel', style: TextStyle(color: Colors.grey[500], fontWeight: FontWeight.bold)),
                ),
                ElevatedButton(
                  onPressed: isSaving ? null : () async {
                    setDialogState(() => isSaving = true);
                    bool success = await authProvider.updateProfile(name: nameController.text, phone: phoneController.text);
                    if (mounted) {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(success ? 'Profile Updated' : 'Update Failed'),
                          backgroundColor: success ? _primaryDark : Colors.red,
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _primaryDark,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: isSaving 
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Save'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildDialogInput(BuildContext context, TextEditingController controller, String label, IconData icon, {bool isPhone = false}) {
    final isDarkMode = Theme.of(context).brightness == Brightness.dark;
    final inputFill = isDarkMode ? const Color(0xFF1E1E1E) : const Color(0xFFF8F9FA);
    final textColor = isDarkMode ? Colors.white : const Color(0xFF1F2937);

    return TextField(
      controller: controller,
      keyboardType: isPhone ? TextInputType.phone : TextInputType.text,
      style: TextStyle(fontWeight: FontWeight.w600, color: textColor),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: isDarkMode ? Colors.grey[400] : Colors.grey[600]),
        prefixIcon: Icon(icon, color: _primaryDark.withValues(alpha: 0.5), size: 20),
        filled: true,
        fillColor: inputFill,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: _primaryDark, width: 1.5)),
      ),
    );
  }
}
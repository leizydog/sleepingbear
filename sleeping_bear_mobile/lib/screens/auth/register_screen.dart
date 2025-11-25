import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  
  final _emailController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _middleNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  late AnimationController _controller;
  late Animation<double> _headerAnimation;
  late Animation<double> _formAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _headerAnimation = Tween<double>(begin: -50, end: 0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.6, curve: Curves.easeOutBack)),
    );

    _formAnimation = Tween<double>(begin: 100, end: 0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.3, 1.0, curve: Curves.easeOutCubic)),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    _emailController.dispose();
    _firstNameController.dispose();
    _middleNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (_formKey.currentState!.validate()) {
      FocusScope.of(context).unfocus();
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      String fullName = _firstNameController.text.trim();
      if (_middleNameController.text.isNotEmpty) {
        fullName += " ${_middleNameController.text.trim()}";
      }
      fullName += " ${_lastNameController.text.trim()}";

      final success = await authProvider.register(
        email: _emailController.text.trim(),
        username: _emailController.text.trim().split('@')[0], 
        password: _passwordController.text,
        fullName: fullName,
        phone: _phoneController.text.trim(),
      );

      if (success && mounted) {
        Navigator.of(context).pushReplacementNamed('/home');
      } else if (authProvider.error != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error!),
            backgroundColor: Colors.red.shade400,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            margin: const EdgeInsets.all(10),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    // ✅ DARK MODE VARIABLES
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = Theme.of(context).primaryColor;
    final backgroundColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = Theme.of(context).cardColor;
    final textColor = isDark ? Colors.white : Colors.black87;
    final inputFill = isDark ? const Color(0xFF2C2C2C) : const Color(0xFFF8F9FA);

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Scaffold(
          backgroundColor: backgroundColor,
          body: Stack(
            children: [
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: size.height * 0.35,
                child: Transform.translate(
                  offset: Offset(0, _headerAnimation.value),
                  child: ClipPath(
                    clipper: HeaderWaveClipper(),
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                             const Color(0xFF4A00E0),
                             // If we are in dark mode, maybe make the gradient slightly less intense or keep it
                             // Keeping it consistent usually looks best for branding.
                             const Color(0xFF8E2DE2) 
                          ], 
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              Positioned.fill(
                child: SafeArea(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      children: [
                        const SizedBox(height: 10),
                        Transform.translate(
                          offset: Offset(0, _headerAnimation.value),
                          child: Opacity(
                            opacity: _controller.value.clamp(0.0, 1.0),
                            child: Column(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(3),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.25),
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white.withValues(alpha: 0.4), width: 2),
                                  ),
                                  child: ClipOval(
                                    child: Image.asset(
                                      'assets/images/sleeping_bear_logo.jpg',
                                      height: 70,
                                      width: 70,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                const Text(
                                  'Create Account',
                                  style: TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                Text(
                                  'Join Sleeping Bear today',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.white.withValues(alpha: 0.85),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        
                        const SizedBox(height: 35),

                        Transform.translate(
                          offset: Offset(0, _formAnimation.value),
                          child: Opacity(
                            opacity: (_controller.value - 0.2).clamp(0.0, 1.0) * (1.0 / 0.8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 30),
                              decoration: BoxDecoration(
                                color: cardColor,
                                borderRadius: BorderRadius.circular(25),
                                boxShadow: [
                                  BoxShadow(
                                    color: isDark ? Colors.black26 : const Color(0xFF4A00E0).withValues(alpha: 0.15),
                                    blurRadius: 30,
                                    spreadRadius: 0,
                                    offset: const Offset(0, 15),
                                  ),
                                ],
                              ),
                              child: Form(
                                key: _formKey,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    _buildSectionTitle('Personal Information', isDark),
                                    const SizedBox(height: 16),

                                    Row(
                                      children: [
                                        Expanded(
                                          child: _buildModernTextField(
                                            controller: _firstNameController,
                                            label: 'First Name',
                                            icon: Icons.person_outline,
                                            textColor: textColor,
                                            fillColor: inputFill,
                                            primaryColor: primaryColor,
                                            isDark: isDark
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: _buildModernTextField(
                                            controller: _lastNameController,
                                            label: 'Last Name',
                                            icon: Icons.person_outline,
                                            textColor: textColor,
                                            fillColor: inputFill,
                                            primaryColor: primaryColor,
                                            isDark: isDark
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    _buildModernTextField(
                                      controller: _middleNameController,
                                      label: 'Middle Name (Optional)',
                                      icon: Icons.person_outline,
                                      isOptional: true,
                                      textColor: textColor,
                                      fillColor: inputFill,
                                      primaryColor: primaryColor,
                                      isDark: isDark
                                    ),
                                    
                                    const SizedBox(height: 25),
                                    _buildSectionTitle('Account Details', isDark),
                                    const SizedBox(height: 16),

                                    _buildModernTextField(
                                      controller: _emailController,
                                      label: 'Email Address',
                                      icon: Icons.email_outlined,
                                      inputType: TextInputType.emailAddress,
                                      textColor: textColor,
                                      fillColor: inputFill,
                                      primaryColor: primaryColor,
                                      isDark: isDark
                                    ),
                                    const SizedBox(height: 16),
                                    _buildModernTextField(
                                      controller: _phoneController,
                                      label: 'Phone Number',
                                      icon: Icons.phone_iphone_rounded,
                                      inputType: TextInputType.number,
                                      isPhone: true, 
                                      textColor: textColor,
                                      fillColor: inputFill,
                                      primaryColor: primaryColor,
                                      isDark: isDark
                                    ),

                                    const SizedBox(height: 25),
                                    _buildSectionTitle('Security', isDark),
                                    const SizedBox(height: 16),

                                    _buildModernTextField(
                                      controller: _passwordController,
                                      label: 'Password',
                                      icon: Icons.lock_outline_rounded,
                                      isPassword: true,
                                      textColor: textColor,
                                      fillColor: inputFill,
                                      primaryColor: primaryColor,
                                      isDark: isDark
                                    ),
                                    const SizedBox(height: 16),
                                    _buildModernTextField(
                                      controller: _confirmPasswordController,
                                      label: 'Confirm Password',
                                      icon: Icons.lock_reset_rounded,
                                      isPassword: true,
                                      isConfirmPassword: true,
                                      textColor: textColor,
                                      fillColor: inputFill,
                                      primaryColor: primaryColor,
                                      isDark: isDark
                                    ),

                                    const SizedBox(height: 35),

                                    Consumer<AuthProvider>(
                                      builder: (context, authProvider, child) {
                                        return Container(
                                          height: 55,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(18),
                                            gradient: LinearGradient(
                                              colors: [const Color(0xFF4A00E0), const Color(0xFF8E2DE2)],
                                              begin: Alignment.centerLeft,
                                              end: Alignment.centerRight,
                                            ),
                                            boxShadow: [
                                              BoxShadow(
                                                color: const Color(0xFF4A00E0).withValues(alpha: 0.3),
                                                blurRadius: 15,
                                                offset: const Offset(0, 8),
                                              )
                                            ],
                                          ),
                                          child: ElevatedButton(
                                            onPressed: authProvider.isLoading
                                                ? null
                                                : _handleRegister,
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: Colors.transparent,
                                              shadowColor: Colors.transparent,
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(18),
                                              ),
                                            ),
                                            child: authProvider.isLoading
                                                ? const SizedBox(
                                                    height: 24,
                                                    width: 24,
                                                    child: CircularProgressIndicator(
                                                      strokeWidth: 3,
                                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                                    ),
                                                  )
                                                : const Text(
                                                    'CREATE ACCOUNT',
                                                    style: TextStyle(
                                                      fontSize: 16,
                                                      fontWeight: FontWeight.w800,
                                                      letterSpacing: 1.2,
                                                      color: Colors.white,
                                                    ),
                                                  ),
                                          ),
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),

                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 24),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                "Already have an account? ",
                                style: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600], fontWeight: FontWeight.w500),
                              ),
                              GestureDetector(
                                onTap: () => Navigator.pop(context),
                                child: Text(
                                  "Login",
                                  style: TextStyle(
                                    color: primaryColor,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ),
              
              Positioned(
                top: 50,
                left: 20,
                child: GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSectionTitle(String title, bool isDark) {
    return Text(
      title.toUpperCase(),
      style: TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w700,
        color: isDark ? Colors.grey[400] : Colors.grey[400],
        letterSpacing: 1,
      ),
    );
  }

  Widget _buildModernTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required Color textColor,
    required Color fillColor,
    required Color primaryColor,
    required bool isDark,
    bool isPassword = false,
    bool isConfirmPassword = false,
    bool isOptional = false,
    bool isPhone = false,
    TextInputType inputType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: isPassword
          ? (isConfirmPassword ? _obscureConfirmPassword : _obscurePassword)
          : false,
      keyboardType: inputType,
      maxLength: isPhone ? 11 : null,
      buildCounter: isPhone ? (context, {required currentLength, required isFocused, maxLength}) => null : null,
      style: TextStyle(color: textColor, fontWeight: FontWeight.w600),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[500], fontWeight: FontWeight.w500, fontSize: 14),
        prefixIcon: Icon(icon, color: primaryColor.withValues(alpha: 0.8), size: 22),
        filled: true,
        fillColor: fillColor, 
        contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: BorderSide(color: primaryColor, width: 2),
        ),
        suffixIcon: isPassword
            ? IconButton(
                icon: Icon(
                  (isConfirmPassword ? _obscureConfirmPassword : _obscurePassword)
                      ? Icons.visibility_rounded
                      : Icons.visibility_off_rounded,
                  color: Colors.grey[400],
                ),
                onPressed: () {
                  setState(() {
                    if (isConfirmPassword) {
                      _obscureConfirmPassword = !_obscureConfirmPassword;
                    } else {
                      _obscurePassword = !_obscurePassword;
                    }
                  });
                },
              )
            : null,
      ),
      validator: (value) {
        if (isOptional) return null;
        if (value == null || value.isEmpty) return 'Required';
        if (!isPassword && label.contains('Email') && !value.contains('@')) return 'Invalid email';
        if (isPhone) {
          if (value.length != 11) return 'Must be 11 digits';
          if (!RegExp(r'^[0-9]+$').hasMatch(value)) return 'Numbers only';
        }
        if (isPassword && !isConfirmPassword) {
          if (value.length < 8 || value.length > 12) return 'Must be 8-12 characters';
          if (!RegExp(r'(?=.*[a-z])').hasMatch(value)) return 'Need lowercase letter';
          if (!RegExp(r'(?=.*[A-Z])').hasMatch(value)) return 'Need uppercase letter';
          if (!RegExp(r'(?=.*[0-9])').hasMatch(value)) return 'Need a number';
        }
        if (isConfirmPassword && value != _passwordController.text) return 'Passwords do not match';
        return null;
      },
    );
  }
}

class HeaderWaveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    var path = Path();
    path.lineTo(0, size.height - 60);
    var firstControlPoint = Offset(size.width / 4, size.height);
    var firstEndPoint = Offset(size.width / 2.25, size.height - 30);
    path.quadraticBezierTo(firstControlPoint.dx, firstControlPoint.dy, firstEndPoint.dx, firstEndPoint.dy);
    var secondControlPoint = Offset(size.width - (size.width / 3.25), size.height - 80);
    var secondEndPoint = Offset(size.width, size.height - 40);
    path.quadraticBezierTo(secondControlPoint.dx, secondControlPoint.dy, secondEndPoint.dx, secondEndPoint.dy);
    path.lineTo(size.width, size.height - 40);
    path.lineTo(size.width, 0);
    path.close();
    return path;
  }
  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) => false;
}
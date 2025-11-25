import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import 'register_screen.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  late AnimationController _controller;
  late Animation<double> _headerAnimation;
  late Animation<double> _formAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: const Duration(milliseconds: 1200), vsync: this);
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
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      FocusScope.of(context).unfocus();
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final success = await authProvider.login(
        email: _emailController.text.trim(),
        password: _passwordController.text,
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
              // --- 1. MODERN WAVE HEADER ---
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: size.height * 0.45,
                child: Transform.translate(
                  offset: Offset(0, _headerAnimation.value),
                  child: ClipPath(
                    clipper: HeaderWaveClipper(),
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [const Color(0xFF4A00E0), const Color(0xFF8E2DE2)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              // --- 2. CONTENT ---
              Positioned.fill(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    children: [
                      const SizedBox(height: 70),

                      // --- HEADER TEXT & LOGO ---
                      Transform.translate(
                        offset: Offset(0, _headerAnimation.value),
                        child: Opacity(
                          opacity: _controller.value.clamp(0.0, 1.0),
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(3),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white.withValues(alpha: 0.25),
                                  border: Border.all(color: Colors.white.withValues(alpha: 0.4), width: 2),
                                ),
                                child: ClipOval(
                                  child: Image.asset(
                                    'assets/images/sleeping_bear_logo.jpg',
                                    height: 85,
                                    width: 85,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 20),
                              const Text(
                                'Welcome Back!',
                                style: TextStyle(
                                  fontSize: 32,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Sign in to continue to your cozy den.',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.white.withValues(alpha: 0.85),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 45),

                      // --- MODERN FLOATING FORM CARD ---
                      Transform.translate(
                        offset: Offset(0, _formAnimation.value),
                        child: Opacity(
                          opacity: (_controller.value - 0.2).clamp(0.0, 1.0) * (1.0 / 0.8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 35, horizontal: 25),
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
                                 
                                  // EMAIL
                                  _buildModernTextField(
                                    controller: _emailController,
                                    label: 'Email',
                                    icon: Icons.alternate_email_rounded,
                                    inputType: TextInputType.emailAddress,
                                    textColor: textColor,
                                    fillColor: inputFill,
                                    primaryColor: primaryColor,
                                    isDark: isDark
                                  ),

                                  const SizedBox(height: 25),

                                  // PASSWORD
                                  _buildModernTextField(
                                    controller: _passwordController,
                                    label: 'Password',
                                    icon: Icons.lock_rounded,
                                    isPassword: true,
                                    textColor: textColor,
                                    fillColor: inputFill,
                                    primaryColor: primaryColor,
                                    isDark: isDark
                                  ),

                                  // FORGOT PASS
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: TextButton(
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) => const ForgotPasswordScreen(),
                                          ),
                                        );
                                      },
                                      child: Text(
                                        "Forgot Password?",
                                        style: TextStyle(
                                          color: primaryColor,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ),
                                  ),

                                  const SizedBox(height: 25),

                                  // MODERN GRADIENT BUTTON
                                  Consumer<AuthProvider>(
                                    builder: (context, authProvider, child) {
                                      return Container(
                                        height: 60,
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
                                            ]
                                        ),
                                        child: ElevatedButton(
                                          onPressed: authProvider.isLoading ? null : _handleLogin,
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.transparent,
                                            shadowColor: Colors.transparent,
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(18),
                                            ),
                                          ),
                                          child: authProvider.isLoading
                                              ? const SizedBox(
                                                  height: 26,
                                                  width: 26,
                                                  child: CircularProgressIndicator(
                                                    strokeWidth: 3,
                                                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                                  ),
                                                )
                                              : const Text(
                                                  'SIGN IN',
                                                  style: TextStyle(
                                                    fontSize: 18,
                                                    fontWeight: FontWeight.w800,
                                                    letterSpacing: 1.5,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                        ),
                                      );
                                    },
                                  ),

                                  const SizedBox(height: 30),

                                  // REGISTER LINK
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        "Don't have an account yet? ",
                                        style: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[600], fontWeight: FontWeight.w500),
                                      ),
                                      GestureDetector(
                                        onTap: () {
                                          Navigator.of(context).push(
                                            MaterialPageRoute(
                                              builder: (context) => const RegisterScreen(),
                                            ),
                                          );
                                        },
                                        child: Text(
                                          "Sign Up",
                                          style: TextStyle(
                                            color: primaryColor,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
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
    TextInputType inputType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: isPassword ? _obscurePassword : false,
      keyboardType: inputType,
      style: TextStyle(color: textColor, fontWeight: FontWeight.w600),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: isDark ? Colors.grey[400] : Colors.grey[500], fontWeight: FontWeight.w500),
        prefixIcon: Icon(icon, color: primaryColor.withValues(alpha: 0.8)),
        filled: true,
        fillColor: fillColor, 
        contentPadding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: BorderSide.none, 
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: BorderSide(color: primaryColor, width: 2),
        ),
        suffixIcon: isPassword
            ? IconButton(
                icon: Icon(
                  _obscurePassword ? Icons.visibility_rounded : Icons.visibility_off_rounded,
                  color: Colors.grey[400],
                ),
                onPressed: () {
                  setState(() {
                    _obscurePassword = !_obscurePassword;
                  });
                },
              )
            : null,
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter your $label';
        }
        if (!isPassword && label.contains('Email') && !value.contains('@')) {
          return 'Please enter a valid email';
        }
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
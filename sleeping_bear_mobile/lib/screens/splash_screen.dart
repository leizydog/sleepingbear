import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'dart:async';
import 'auth/login_screen.dart'; // 1. IMPORTANT: I-import ang LoginScreen mo

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _waveController;
  late Animation<double> _waveAnimation;
  
  late AnimationController _breathingController;
  late Animation<double> _breathingAnimation;

  double _bearScale = 0.0;
  double _opacity = 0.0;
  bool _showText = false;

  @override
  void initState() {
    super.initState();

    // --- ANIMATION SETUPS (Walang pagbabago dito) ---
    _waveController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _waveAnimation = Tween<double>(begin: -0.2, end: 0.2).animate(
      CurvedAnimation(parent: _waveController, curve: Curves.easeInOut),
    );

    _breathingController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    _breathingAnimation = Tween<double>(begin: 1.0, end: 1.05).animate(
      CurvedAnimation(parent: _breathingController, curve: Curves.easeInOut),
    );

    // --- ANIMATION SEQUENCE ---

    // 1. Bear Drops In
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) {
        setState(() {
          _bearScale = 1.0; 
          _opacity = 1.0;
        });
        _breathingController.repeat(reverse: true);
      }
    });

    // 2. Hand Waves & Text Appears
    Future.delayed(const Duration(milliseconds: 1000), () {
      if (mounted) {
        setState(() {
          _showText = true;
        });
        _waveController.repeat(reverse: true); 
      }
    });

    // 3. NAVIGATE TO LOGIN (UPDATED PART) ✅
    Future.delayed(const Duration(seconds: 5), () {
      if (!mounted) return;
      _waveController.stop();
      _breathingController.stop();
      
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 1000),
          pageBuilder: (_, __, ___) => const LoginScreen(), // ✅ Dito diretso sa LoginScreen
          transitionsBuilder: (_, animation, __, child) {
            return FadeTransition(opacity: animation, child: child);
          },
        ),
      );
    });
  }

  @override
  void dispose() {
    _waveController.dispose();
    _breathingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.purple.shade50,
              Colors.purple.shade100,
            ],
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(), 

            // --- ANIMATED BEAR ---
            SizedBox(
              height: 260,
              width: 300,
              child: Stack(
                alignment: Alignment.center,
                clipBehavior: Clip.none,
                children: [
                  // Breathing Bear
                  AnimatedScale(
                    scale: _bearScale,
                    duration: const Duration(seconds: 1),
                    curve: Curves.elasticOut,
                    child: AnimatedBuilder(
                      animation: _breathingAnimation,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: _breathingAnimation.value,
                          child: Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.purple.withOpacity(0.15),
                                  blurRadius: 40,
                                  spreadRadius: 10,
                                )
                              ],
                            ),
                            child: ClipOval(
                              child: Image.asset(
                                'assets/images/sleeping_bear_logo.jpg',
                                width: 220,
                                height: 220,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  // Waving Hand
                  AnimatedPositioned(
                    duration: const Duration(milliseconds: 600),
                    curve: Curves.easeOutBack,
                    top: _showText ? 0 : 80,
                    right: 40,
                    child: AnimatedOpacity(
                      opacity: _showText ? 1.0 : 0.0,
                      duration: const Duration(milliseconds: 400),
                      child: AnimatedBuilder(
                        animation: _waveAnimation,
                        builder: (context, child) {
                          return Transform.rotate(
                            angle: _waveAnimation.value,
                            alignment: Alignment.bottomCenter,
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: const BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black12,
                                    blurRadius: 5,
                                    offset: Offset(0, 3)
                                  )
                                ]
                              ),
                              child: const Text(
                                "💤",
                                style: TextStyle(fontSize: 45),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 40),

            // --- TEXT ---
            AnimatedOpacity(
              opacity: _showText ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 800),
              child: Column(
                children: [
                  Text(
                    "Hello there!",
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.deepPurple.shade700,
                      letterSpacing: 1.1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "Please login to continue.", // Binago ko text para match sa Login
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.deepPurple.shade400,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ],
              ),
            ),

            const Spacer(), 

            // --- LOADING BAR ---
            Padding(
              padding: const EdgeInsets.only(bottom: 50.0),
              child: AnimatedOpacity(
                opacity: _showText ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 1000),
                child: SizedBox(
                  width: 150,
                  child: LinearProgressIndicator(
                    backgroundColor: Colors.purple.shade100,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.purple.shade300),
                    minHeight: 4,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
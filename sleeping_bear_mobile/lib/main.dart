import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:async'; // Kailangan ito para sa Timer

import 'providers/auth_provider.dart';
import 'providers/property_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/splash_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => PropertyProvider()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Sleeping Bear Rental',
        theme: ThemeData(
          primarySwatch: Colors.purple, // Ginawa kong purple para match sa logo
          useMaterial3: true,
        ),
       home: const SplashScreen(),
        routes: {
          '/login': (context) => const LoginScreen(),
          '/home': (context) => const HomeScreen(),
        },
      ),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({Key? key}) : super(key: key);

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _showSplash = true; // Control kung ipapakita ang splash o ang app
  double _opacity = 0.0;   // Para sa fade-in effect

  @override
  void initState() {
    super.initState();
    
    // 1. Check Auth (Sa background)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AuthProvider>(context, listen: false).checkAuth();
    });

    // 2. Start Animation (Fade In)
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        setState(() {
          _opacity = 1.0; // Lilitaw ang logo
        });
      }
    });

    // 3. Tapusin ang Splash Screen pagkalipas ng 3 seconds
    Timer(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() {
          _showSplash = false; // Ilipat na sa Login o Home
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Kung true ang _showSplash, ipakita ang Logo Animation
    if (_showSplash) {
      return Scaffold(
        backgroundColor: Colors.white, // White background para sa .jpg logo
        body: Center(
          child: AnimatedOpacity(
            duration: const Duration(seconds: 2), // 2 seconds na dahan-dahang paglitaw
            opacity: _opacity,
            curve: Curves.easeOut,
            child: colSplashContent(),
          ),
        ),
      );
    }

    // Kung tapos na ang splash, gamitin ang dating logic mo (Auth Check)
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        if (authProvider.isAuthenticated) {
          return const HomeScreen();
        } else {
          return const LoginScreen();
        }
      },
    );
  }

  // Hiniwalay ko lang para malinis tignan
  Widget colSplashContent() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          height: 200,
          width: 200,
          // Siguraduhin na tama ang path ng image mo dito
          child: Image.asset('assets/images/sleeping_bear_logo.jpg'),
        ),
        const SizedBox(height: 20),
        const Text(
          "Sleeping Bear Rental",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.purple,
            fontFamily: 'Sans-serif', // Pwede mong baguhin font
          ),
        ),
        const SizedBox(height: 30),
        // Loading indicator sa baba
        const CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Colors.purple),
        ),
      ],
    );
  }
}
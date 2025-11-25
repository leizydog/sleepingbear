import 'package:flutter/material.dart';

class ThemeProvider extends ChangeNotifier {
  bool _isDarkMode = false;

  bool get isDarkMode => _isDarkMode;

  ThemeData get currentTheme => _isDarkMode 
      ? ThemeData.dark().copyWith(
          scaffoldBackgroundColor: const Color(0xFF121212),
          cardColor: const Color(0xFF1E1E1E),
          primaryColor: const Color(0xFF8E2DE2), // Light Purple for Dark Mode
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF8E2DE2),
            secondary: Color(0xFF4A00E0),
            surface: Color(0xFF1E1E1E),
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF1E1E1E),
            foregroundColor: Colors.white,
            elevation: 0,
          ),
          dividerColor: Colors.grey[800],
        )
      : ThemeData.light().copyWith(
          scaffoldBackgroundColor: const Color(0xFFF8F9FA),
          cardColor: Colors.white,
          primaryColor: const Color(0xFF4A00E0), // Dark Purple for Light Mode
          colorScheme: const ColorScheme.light(
            primary: Color(0xFF4A00E0),
            secondary: Color(0xFF8E2DE2),
            surface: Colors.white,
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Colors.white,
            foregroundColor: Color(0xFF1F2937),
            elevation: 0,
          ),
          dividerColor: Colors.grey[200],
        );

  void toggleTheme(bool isOn) {
    _isDarkMode = isOn;
    notifyListeners();
  }
}
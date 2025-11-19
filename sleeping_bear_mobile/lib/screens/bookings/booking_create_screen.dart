import 'package:flutter/material.dart';
import '../../models/property.dart';

class BookingCreateScreen extends StatelessWidget {
  final Property property;
  
  const BookingCreateScreen({Key? key, required this.property}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Book Property'),
      ),
      body: const Center(
        child: Text('Booking form coming in Day 7...'),
      ),
    );
  }
}
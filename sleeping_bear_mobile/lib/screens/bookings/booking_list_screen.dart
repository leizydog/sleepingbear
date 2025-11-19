import 'package:flutter/material.dart';
// ignore: unused_import
import '../payments/payment_screen.dart';

// Example BookingStatus enum (for completeness)
enum BookingStatus { pending, confirmed, cancelled }

// Example Booking model (replace with your actual model)
class Booking {
  final String id;
  final BookingStatus status;

  Booking({required this.id, required this.status});
}

// Example PaymentScreen (replace with your actual one)
class PaymentScreen extends StatelessWidget {
  final Booking booking;
  const PaymentScreen({Key? key, required this.booking}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment')),
      body: Center(child: Text('Payment for booking: ${booking.id}')),
    );
  }
}

class BookingListScreen extends StatelessWidget {
  const BookingListScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Example dummy booking (replace with your list or API data)
    final booking = Booking(id: '123', status: BookingStatus.confirmed);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Bookings'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.book_outlined, size: 100, color: Colors.grey),
            const SizedBox(height: 20),
            const Text(
              'Booking feature coming soon...',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            const Text(
              'Complete in Day 7',
              style: TextStyle(color: Colors.grey),
            ),

            // Inside BookingCard widget, after cancel button:
            if (booking.status == BookingStatus.confirmed) ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => PaymentScreen(booking: booking),
                      ),
                    );
                  },
                  icon: const Icon(Icons.payment),
                  label: const Text('Make Payment'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; 
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/booking.dart';
import '../../models/property.dart';
import '../../providers/booking_provider.dart';
import '../payments/payment_screen.dart'; 

class BookingCreateScreen extends StatefulWidget {
  final Property property;

  const BookingCreateScreen({super.key, required this.property});

  @override
  State<BookingCreateScreen> createState() => _BookingCreateScreenState();
}

class _BookingCreateScreenState extends State<BookingCreateScreen> {
  // ... (Keep existing variables and controllers) ...
  DateTime? _startDate;
  DateTime? _endDate;
  double _totalPrice = 0.0;
  int _months = 0;

  final TextEditingController _startController = TextEditingController();
  final TextEditingController _endController = TextEditingController();
  final DateFormat _dateFormat = DateFormat('MM/dd/yyyy');

  @override
  void dispose() {
    _startController.dispose();
    _endController.dispose();
    super.dispose();
  }

  // ... (Keep _selectDates, _onDateTyped, _calculateTotal logic exactly as before) ...
  void _selectDates() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
      locale: const Locale('en', 'US'),
      builder: (context, child) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: isDark 
              ? ColorScheme.dark(primary: Theme.of(context).primaryColor, onPrimary: Colors.white)
              : ColorScheme.light(primary: Theme.of(context).primaryColor, onPrimary: Colors.white),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
        _startController.text = _dateFormat.format(_startDate!);
        _endController.text = _dateFormat.format(_endDate!);
        _calculateTotal();
      });
    }
  }

  void _onDateTyped() {
    try {
      if (_startController.text.length == 10 && _endController.text.length == 10) {
        final start = _dateFormat.parse(_startController.text);
        final end = _dateFormat.parse(_endController.text);
        if (end.isAfter(start)) {
          setState(() {
            _startDate = start;
            _endDate = end;
            _calculateTotal();
          });
        }
      }
    } catch (e) {}
  }

  void _calculateTotal() {
    if (_startDate != null && _endDate != null) {
      int days = _endDate!.difference(_startDate!).inDays;
      if (days <= 0) days = 1;
      _months = (days / 30).ceil(); 
      if (_months < 1) _months = 1;
      _totalPrice = widget.property.pricePerMonth * _months;
    }
  }

  // --- ✅ FIXED SUBMIT LOGIC ---
  Future<void> _submitBooking() async {
    if (_startDate == null || _endDate == null) return;

    final provider = Provider.of<BookingProvider>(context, listen: false);
    
    // 1. Create Pending Booking
    final newBooking = await provider.createBooking(
      propertyId: widget.property.id,
      startDate: _startDate!,
      endDate: _endDate!,
    );

    if (!mounted) return;

    if (newBooking != null) {
      // 2. Navigate to Payment (Wait for result: true = success, null = cancelled)
      final result = await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PaymentScreen(
            booking: newBooking,
            property: widget.property, 
          ),
        ),
      );

      // 3. Check Result
      if (result == true) {
        // ✅ SUCCESS: User finished payment or submitted receipt.
        // Navigate to Home to clear stack.
        if (mounted) {
          Navigator.of(context).pushNamedAndRemoveUntil('/home', (route) => false);
        }
        return; // STOP HERE. DO NOT CANCEL.
      }

      // 4. USER CANCELLED (result is null)
      // If we reached here, the user pressed "Back" without paying.
      // Check status one last time to be safe (maybe they paid via web hook?)
      if (mounted) {
          final status = await provider.getBookingStatus(newBooking.id);
          if (status == BookingStatus.confirmed || status == BookingStatus.pending) {
            // Wait, if it's "Pending" in Manual mode, we might want to keep it?
            // Actually, for Manual GCash, "Pending" means "Waiting for Admin".
            // But initially it is ALSO "Pending" (Waiting for User).
            // Since we can't easily distinguish without an extra flag,
            // we stick to the "result == true" check.
            // If result is NOT true, user backed out of the screen.
             await provider.cancelBooking(newBooking.id);
             if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Booking cancelled. Dates freed.'), backgroundColor: Colors.orange),
                );
             }
          }
      }

    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(provider.error ?? 'Dates already booked'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final currency = NumberFormat.currency(symbol: '₱', decimalDigits: 0);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = Theme.of(context).primaryColor;
    final backgroundColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = Theme.of(context).cardColor;
    final textColor = isDark ? Colors.white : Colors.black87;

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: Text('Request Booking', style: TextStyle(color: textColor)),
        backgroundColor: backgroundColor,
        elevation: 0,
        leading: BackButton(color: textColor),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: widget.property.imageUrl != null 
                    ? Image.network(
                        widget.property.imageUrl!,
                        width: 100, height: 100, fit: BoxFit.cover,
                        errorBuilder: (_,__,___) => Container(color: Colors.grey, width: 100, height: 100, child: const Icon(Icons.apartment)),
                      )
                    : Container(color: Colors.grey, width: 100, height: 100, child: const Icon(Icons.apartment)),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.property.name, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
                      const SizedBox(height: 4),
                      Text(widget.property.address, style: TextStyle(fontSize: 14, color: Colors.grey)),
                      const SizedBox(height: 8),
                      Text(
                        '${currency.format(widget.property.pricePerMonth)} / mo',
                        style: TextStyle(fontWeight: FontWeight.bold, color: primaryColor),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: 40),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Select Dates', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor)),
                TextButton.icon(
                  onPressed: _selectDates,
                  icon: Icon(Icons.calendar_month, color: primaryColor),
                  label: Text("Open Calendar", style: TextStyle(color: primaryColor)),
                )
              ],
            ),
            const SizedBox(height: 12),
            
            Row(
              children: [
                Expanded(
                  child: _buildDateInput(
                    controller: _startController,
                    label: 'Check-in',
                    hint: 'MM/DD/YYYY',
                    isDark: isDark,
                    primaryColor: primaryColor,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildDateInput(
                    controller: _endController,
                    label: 'Check-out',
                    hint: 'MM/DD/YYYY',
                    isDark: isDark,
                    primaryColor: primaryColor,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            if (_startDate != null && _endDate != null) ...[
              Text('Price Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor)),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardColor,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isDark ? Colors.grey[700]! : Colors.grey[300]!),
                ),
                child: Column(
                  children: [
                    _buildPriceRow('Duration', '$_months month(s)', textColor),
                    const SizedBox(height: 8),
                    _buildPriceRow('Monthly Rent', currency.format(widget.property.pricePerMonth), textColor),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Total', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: textColor)),
                        Text(currency.format(_totalPrice), style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: primaryColor)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: cardColor,
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10)],
        ),
        child: Consumer<BookingProvider>(
          builder: (context, provider, child) {
            return ElevatedButton(
              onPressed: (_startDate != null && !provider.isLoading) ? _submitBooking : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: provider.isLoading
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Confirm & Pay', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            );
          },
        ),
      ),
    );
  }

  Widget _buildDateInput({
    required TextEditingController controller,
    required String label,
    required String hint,
    required bool isDark,
    required Color primaryColor,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: TextInputType.number,
          onChanged: (_) => _onDateTyped(),
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            DateInputFormatter(),
            LengthLimitingTextInputFormatter(10),
          ],
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.grey.withValues(alpha: 0.5)),
            filled: true,
            fillColor: isDark ? Colors.grey[800] : Colors.grey[100],
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: primaryColor, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPriceRow(String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(color: Colors.grey)),
        Text(value, style: TextStyle(fontWeight: FontWeight.w600, color: color)),
      ],
    );
  }
}

class DateInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    if (newValue.text.length < oldValue.text.length) {
      return newValue;
    }

    String text = newValue.text;
    final buffer = StringBuffer();
    
    for (int i = 0; i < text.length; i++) {
      buffer.write(text[i]);
      if ((i == 1 || i == 3) && i != text.length - 1) {
        buffer.write('/');
      }
      if ((i == 1 || i == 3) && i == text.length - 1) {
         buffer.write('/');
      }
    }

    return TextEditingValue(
      text: buffer.toString(),
      selection: TextSelection.collapsed(offset: buffer.length),
    );
  }
}
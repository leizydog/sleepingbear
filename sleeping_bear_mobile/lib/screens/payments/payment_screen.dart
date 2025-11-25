import 'dart:io'; 
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; 
import 'package:intl/intl.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide PaymentMethod; 
import 'package:image_picker/image_picker.dart'; 
import 'package:qr_flutter/qr_flutter.dart'; 
import 'package:sleeping_bear_mobile/services/api_service.dart';
import '../../models/booking.dart';
import '../../models/payment_method.dart';
import '../../models/property.dart'; 

class PaymentScreen extends StatefulWidget {
  final Booking booking;
  final Property property; 
  
  const PaymentScreen({
    super.key, 
    required this.booking,
    required this.property,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final ApiService _apiService = ApiService();
  List<PaymentMethod> _paymentMethods = [];
  PaymentMethod? _selectedMethod;
  bool _isLoading = false;
  bool _isProcessing = false;
  String? _error;
  
  bool _isManualMode = false;
  XFile? _receiptImage;
  final ImagePicker _picker = ImagePicker();
  
  final _currencyFormat = NumberFormat.currency(symbol: '₱', decimalDigits: 0);
  
  @override
  void initState() {
    super.initState();
    _loadPaymentMethods();
  }
  
  Future<void> _loadPaymentMethods() async {
    setState(() => _isLoading = true);
    try {
      var methods = await _apiService.getPaymentMethods();
      final allowedMethods = <PaymentMethod>[];
      for (var method in methods) {
        final id = method.id.toLowerCase();
        if (id == 'cash' && widget.property.acceptsCash) allowedMethods.add(method);
        else if (id == 'gcash' && widget.property.acceptsGcash) allowedMethods.add(method);
        else if ((id == 'card' || id == 'bpi') && widget.property.acceptsBpi) allowedMethods.add(method);
      }
      setState(() { _paymentMethods = allowedMethods; _isLoading = false; });
    } catch (e) {
      final fallbackMethods = <PaymentMethod>[];
      if (widget.property.acceptsCash) fallbackMethods.add(PaymentMethod(id: 'cash', name: 'Cash at Office', icon: 'cash_icon', description: 'Pay in person'));
      if (widget.property.acceptsGcash) fallbackMethods.add(PaymentMethod(id: 'gcash', name: 'GCash', icon: 'gcash_icon', description: 'Scan QR & Upload Receipt'));
      if (widget.property.acceptsBpi) fallbackMethods.add(PaymentMethod(id: 'bpi', name: 'BPI Transfer', icon: 'card_icon', description: 'Pay via Card'));
      setState(() { _paymentMethods = fallbackMethods; _isLoading = false; });
    }
  }
  
  Future<void> _processPayment() async {
    if (_selectedMethod == null) return;
    setState(() { _isProcessing = true; _error = null; });
    
    try {
      final intentData = await _apiService.createPaymentIntent(
        bookingId: widget.booking.id,
        paymentMethod: _selectedMethod!.id,
      );
      
      final clientSecret = intentData['client_secret'];
      final intentId = intentData['payment_intent_id'];

      if (clientSecret == 'manual_flow_gcash') {
        setState(() {
          _isManualMode = true; 
          _isProcessing = false;
        });
        return;
      }

      if (clientSecret.startsWith('mock_') || clientSecret == 'cash_payment') {
        await Future.delayed(const Duration(seconds: 2));
        await _confirmOnBackend(intentId);
      } else {
        await Stripe.instance.initPaymentSheet(
          paymentSheetParameters: SetupPaymentSheetParameters(
            paymentIntentClientSecret: clientSecret,
            merchantDisplayName: 'Sleeping Bear',
            allowsDelayedPaymentMethods: true,
          ),
        );
        await Stripe.instance.presentPaymentSheet();
        await _confirmOnBackend(intentId);
      }

    } catch (e) {
      if (e is StripeException) { _error = 'Payment Cancelled'; } else { _error = e.toString().replaceAll('Exception: ', ''); }
      setState(() => _isProcessing = false);
    }
  }

  Future<void> _submitReceipt() async {
    if (_receiptImage == null) {
      setState(() => _error = "Please upload a screenshot of your payment receipt.");
      return;
    }

    setState(() { _isProcessing = true; _error = null; });

    try {
      await _apiService.submitPaymentReceipt(
        bookingId: widget.booking.id,
        paymentMethod: 'gcash',
        image: _receiptImage!
      );
      
      if (mounted) {
        _showSuccessDialog("Pending Review", isPending: true);
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  Future<void> _confirmOnBackend(String intentId) async {
      final confirmData = await _apiService.confirmPayment(intentId);
      setState(() => _isProcessing = false);
      if (mounted) { _showSuccessDialog(confirmData['receipt_number'] ?? "REF-SUCCESS"); }
  }

  void _showSuccessDialog(String receipt, {bool isPending = false}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Column(
          children: [
            Icon(isPending ? Icons.access_time_filled : Icons.check_circle, 
                 color: isPending ? Colors.orange : Colors.green, size: 50),
            const SizedBox(height: 10),
            Text(isPending ? 'Submitted for Review' : 'Payment Successful!'),
          ],
        ),
        content: Text(
          isPending 
            ? 'Your receipt has been uploaded. The admin will verify your payment shortly.' 
            : 'Your booking is confirmed.\nReceipt: $receipt',
          textAlign: TextAlign.center,
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                // ✅ FIX: Pop with TRUE to signal success
                Navigator.of(context).pop(); // Close Dialog
                Navigator.of(context).pop(true); // Return TRUE to BookingCreateScreen
              },
              child: const Text('Done'),
            ),
          ),
        ],
      ),
    );
  }
  
  Future<void> _pickReceipt() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() => _receiptImage = image);
    }
  }

  void _copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Copied to clipboard!'), duration: Duration(seconds: 1)),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isManualMode) return _buildManualUploadUI();

    return Scaffold(
      appBar: AppBar(title: const Text('Complete Payment')),
      body: _isLoading ? const Center(child: CircularProgressIndicator()) : _buildMethodSelectionUI(),
    );
  }

  Widget _buildMethodSelectionUI() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(child: Column(children: [Text('Total to Pay', style: TextStyle(color: Colors.grey[600])), const SizedBox(height: 4), Text(_currencyFormat.format(widget.booking.totalAmount), style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Theme.of(context).primaryColor))])),
          const SizedBox(height: 30),
          const Text('Select Payment Method', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          if (_paymentMethods.isEmpty) Container(padding: const EdgeInsets.all(16), color: Colors.orange[50], child: const Row(children: [Icon(Icons.warning, color: Colors.orange), SizedBox(width: 12), Expanded(child: Text("No payment methods available."))])),
          ..._paymentMethods.map((method) => _buildPaymentMethodCard(method)),
          if (_error != null) Padding(padding: const EdgeInsets.only(top: 20), child: Text(_error!, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
          const SizedBox(height: 32),
          SizedBox(width: double.infinity, child: ElevatedButton(onPressed: (_selectedMethod == null || _isProcessing) ? null : _processPayment, style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: _isProcessing ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Pay Now', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)))),
        ],
      ),
    );
  }

  Widget _buildManualUploadUI() {
    final gcashNumber = widget.property.gcashNumber ?? "Not Provided";
    final hasRealQr = widget.property.gcashQrImageUrl != null && widget.property.gcashQrImageUrl!.isNotEmpty;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Receipt'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => setState(() => _isManualMode = false),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Text("Pay via GCash", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 22)),
            const SizedBox(height: 8),
            const Text("Scan QR or copy the number below.", style: TextStyle(color: Colors.grey)),
            
            const SizedBox(height: 24),
            
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
              ),
              child: hasRealQr 
                ? Image.network(
                    widget.property.gcashQrImageUrl!,
                    width: 200,
                    height: 200,
                    fit: BoxFit.contain,
                    errorBuilder: (_,__,___) => _buildFallbackQr(gcashNumber),
                  )
                : _buildFallbackQr(gcashNumber),
            ),
            
            const SizedBox(height: 24),
            
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("GCash Number", style: TextStyle(fontSize: 12, color: Colors.grey)),
                      Text(gcashNumber, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1)),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy, color: Colors.blue),
                    onPressed: () => _copyToClipboard(gcashNumber),
                  )
                ],
              ),
            ),

            const SizedBox(height: 24),
            
            const Divider(),
            const SizedBox(height: 16),
            
            Text(
              "Amount: ${_currencyFormat.format(widget.booking.totalAmount)}", 
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.blue)
            ),
            
            const SizedBox(height: 30),
            const Text("After paying, upload the screenshot:", style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 10),
            
            GestureDetector(
              onTap: _pickReceipt,
              child: Container(
                height: 150,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[400]!, style: BorderStyle.solid),
                  image: _receiptImage != null ? DecorationImage(image: FileImage(File(_receiptImage!.path)), fit: BoxFit.cover) : null,
                ),
                child: _receiptImage == null 
                  ? const Column(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.upload_file, size: 40, color: Colors.grey), Text("Tap to Upload")]) 
                  : null,
              ),
            ),
            
            const SizedBox(height: 30),
            if (_error != null) Text(_error!, style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
            const SizedBox(height: 10),
            
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isProcessing ? null : _submitReceipt,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), backgroundColor: const Color(0xFF007DFE), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                child: _isProcessing ? const CircularProgressIndicator() : const Text("Submit for Verification", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFallbackQr(String data) {
    return QrImageView(
      data: data,
      version: QrVersions.auto,
      size: 200.0,
      foregroundColor: const Color(0xFF007DFE), 
    );
  }

  Widget _buildPaymentMethodCard(PaymentMethod method) {
    final isSelected = _selectedMethod?.id == method.id;
    return GestureDetector(
      onTap: () => setState(() => _selectedMethod = method),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: isSelected ? Colors.blue.withValues(alpha: 0.05) : Colors.white, border: Border.all(color: isSelected ? Colors.blue : Colors.grey[300]!, width: isSelected ? 2 : 1), borderRadius: BorderRadius.circular(12)),
        child: Row(children: [Icon(_getPaymentIcon(method.id), color: isSelected ? Colors.blue : Colors.grey[600]), const SizedBox(width: 16), Expanded(child: Text(method.name, style: TextStyle(fontWeight: FontWeight.w600, color: isSelected ? Colors.blue : Colors.black87))), if (isSelected) const Icon(Icons.check_circle, color: Colors.blue)]),
      ),
    );
  }

  IconData _getPaymentIcon(String id) {
    if (id.contains('card') || id.contains('bpi')) return Icons.credit_card;
    if (id.contains('gcash')) return Icons.phone_android;
    if (id.contains('cash')) return Icons.money;
    return Icons.payment;
  }
}
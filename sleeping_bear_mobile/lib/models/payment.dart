enum PaymentStatus {
  pending,
  completed,
  failed,
  refunded,
}

class Payment {
  final int id;
  final int bookingId;
  final double amount;
  final String paymentMethod;
  final String? transactionId;
  final PaymentStatus status;
  final DateTime? paidAt;
  final String? receiptUrl;
  final String? receiptNumber;
  final DateTime createdAt;
  
  Payment({
    required this.id,
    required this.bookingId,
    required this.amount,
    required this.paymentMethod,
    this.transactionId,
    required this.status,
    this.paidAt,
    this.receiptUrl,
    this.receiptNumber,
    required this.createdAt,
  });
  
  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'],
      bookingId: json['booking_id'],
      amount: json['amount'].toDouble(),
      paymentMethod: json['payment_method'],
      transactionId: json['transaction_id'],
      status: _statusFromString(json['status']),
      paidAt: json['paid_at'] != null ? DateTime.parse(json['paid_at']) : null,
      receiptUrl: json['receipt_url'],
      receiptNumber: json['receipt_number'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
  
  static PaymentStatus _statusFromString(String status) {
    switch (status) {
      case 'pending':
        return PaymentStatus.pending;
      case 'completed':
        return PaymentStatus.completed;
      case 'failed':
        return PaymentStatus.failed;
      case 'refunded':
        return PaymentStatus.refunded;
      default:
        return PaymentStatus.pending;
    }
  }
  
  String get statusDisplay {
    switch (status) {
      case PaymentStatus.pending:
        return 'Pending';
      case PaymentStatus.completed:
        return 'Completed';
      case PaymentStatus.failed:
        return 'Failed';
      case PaymentStatus.refunded:
        return 'Refunded';
    }
  }
}

class PaymentMethod {
  final String id;
  final String name;
  final String icon;
  final String description;
  
  PaymentMethod({
    required this.id,
    required this.name,
    required this.icon,
    required this.description,
  });
  
  factory PaymentMethod.fromJson(Map<String, dynamic> json) {
    return PaymentMethod(
      id: json['id'],
      name: json['name'],
      icon: json['icon'],
      description: json['description'],
    );
  }
}
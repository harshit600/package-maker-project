# Payment System API Structure

## Overview

Based on your requirements, you should implement **2 separate APIs** for better separation of concerns and data integrity:

1. **Bank Transaction API** (New) - Handles financial transactions
2. **Enhanced Bank API** (Existing + Updates) - Manages bank accounts with balance tracking

## 1. Bank Transaction API

### Purpose
Handles all payment transactions, balance updates, and payment tracking for leads/packages.

### Endpoints

#### POST `/api/bank-transactions/create`
Creates a new transaction and updates related balances.

**Request Body:**
```json
{
  "bankId": "bank_id",
  "leadId": "lead_id", 
  "packageId": "package_id",
  "transactionType": "IN" | "OUT",
  "amount": 5000,
  "paymentMode": "CASH" | "BANK_TRANSFER" | "UPI" | "CHEQUE" | "CARD",
  "transactionId": "TXN123456",
  "transactionDate": "2025-07-18T00:00:00Z",
  "clearDate": "2025-07-18T00:00:00Z",
  "description": "Advance payment for Leh package",
  "referenceNumbers": ["308293-1935"],
  "paymentBy": "Mrs. Khushbu",
  "gatewayCharge": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "transaction_id",
    "bankId": "bank_id",
    "leadId": "lead_id",
    "packageId": "package_id",
    "transactionType": "IN",
    "amount": 5000,
    "paymentMode": "BANK_TRANSFER",
    "transactionId": "TXN123456",
    "transactionDate": "2025-07-18T00:00:00Z",
    "clearDate": "2025-07-18T00:00:00Z",
    "description": "Advance payment for Leh package",
    "referenceNumbers": ["308293-1935"],
    "paymentBy": "Mrs. Khushbu",
    "gatewayCharge": 0,
    "createdAt": "2025-07-18T00:00:00Z"
  }
}
```

#### GET `/api/bank-transactions/get-by-bank/{bankId}`
Retrieves all transactions for a specific bank.

#### GET `/api/bank-transactions/get-by-lead/{leadId}`
Retrieves all transactions for a specific lead.

#### GET `/api/bank-transactions/get-by-package/{packageId}`
Retrieves all transactions for a specific package.

## 2. Enhanced Bank API

### Purpose
Manages bank accounts with real-time balance tracking.

### Updated Endpoints

#### PATCH `/api/bankaccountdetail/update-balance/{bankId}`
Updates bank balance when transactions occur.

**Request Body:**
```json
{
  "amount": 5000,
  "transactionType": "IN" | "OUT"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "bank_id",
    "bankName": "Glacial Adventures Pvt Ltd. (SBI)",
    "accountNumber": "1234567890",
    "currentBalance": 55000,
    "lastUpdated": "2025-07-18T00:00:00Z"
  }
}
```

#### GET `/api/bankaccountdetail/get/{bankId}`
Retrieves bank details including current balance.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "bank_id",
    "bankName": "Glacial Adventures Pvt Ltd. (SBI)",
    "accountNumber": "1234567890",
    "currentBalance": 55000,
    "lastUpdated": "2025-07-18T00:00:00Z",
    "createdAt": "2025-07-01T00:00:00Z"
  }
}
```

## 3. Lead Payment API

### Purpose
Tracks payment status for leads and packages.

### Endpoints

#### PATCH `/api/leads/update-payment/{leadId}`
Updates lead payment status when transactions occur.

**Request Body:**
```json
{
  "amount": 5000,
  "transactionId": "TXN123456"
}
```

#### GET `/api/leads/get-payments/{leadId}`
Retrieves payment history for a specific lead.

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "amount": 5000,
        "transactionId": "TXN123456",
        "paymentMode": "BANK_TRANSFER",
        "paymentDate": "2025-07-18T00:00:00Z",
        "status": "completed"
      }
    ],
    "totalPaid": 5000,
    "remainingAmount": 45000
  }
}
```

## Database Schema

### Bank Transactions Collection
```javascript
{
  _id: ObjectId,
  bankId: ObjectId,
  leadId: ObjectId,
  packageId: ObjectId,
  transactionType: String, // "IN" | "OUT"
  amount: Number,
  paymentMode: String, // "CASH" | "BANK_TRANSFER" | "UPI" | "CHEQUE" | "CARD"
  transactionId: String,
  transactionDate: Date,
  clearDate: Date,
  description: String,
  referenceNumbers: [String],
  paymentBy: String,
  gatewayCharge: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Banks Collection (Updated)
```javascript
{
  _id: ObjectId,
  bankName: String,
  accountNumber: String,
  currentBalance: Number, // NEW FIELD
  lastUpdated: Date, // NEW FIELD
  createdAt: Date,
  updatedAt: Date
}
```

### Leads Collection (Updated)
```javascript
{
  _id: ObjectId,
  name: String,
  contactNo: String,
  packageAmount: Number, // NEW FIELD
  totalPaid: Number, // NEW FIELD
  remainingAmount: Number, // NEW FIELD
  paymentHistory: [{
    amount: Number,
    transactionId: String,
    paymentDate: Date,
    status: String
  }],
  // ... other existing fields
}
```

## Implementation Flow

### When a payment is made:

1. **Create Transaction** (`POST /api/bank-transactions/create`)
   - Store transaction details
   - Link to bank, lead, and package

2. **Update Bank Balance** (`PATCH /api/bankaccountdetail/update-balance/{bankId}`)
   - Add/subtract amount from bank balance
   - Update lastUpdated timestamp

3. **Update Lead Payment Status** (`PATCH /api/leads/update-payment/{leadId}`)
   - Add payment to lead's payment history
   - Update totalPaid and remainingAmount

### Example Scenario:

**Initial State:**
- Bank Balance: ₹50,000
- Lead Package Amount: ₹50,000
- Lead Total Paid: ₹0
- Lead Remaining: ₹50,000

**Payment of ₹5,000:**
- Bank Balance: ₹55,000 (+₹5,000)
- Lead Total Paid: ₹5,000
- Lead Remaining: ₹45,000

## Benefits of This Structure

1. **Separation of Concerns**: Financial transactions are separate from bank account management
2. **Data Integrity**: Each transaction updates multiple related entities
3. **Audit Trail**: Complete transaction history for compliance
4. **Scalability**: Easy to add new payment modes or transaction types
5. **Real-time Tracking**: Live balance updates across all entities

## Frontend Integration

The provided React components (`BankTransaction.jsx` and `PaymentTracker.jsx`) demonstrate how to:

1. **Create Transactions**: Complete form with validation
2. **Track Balances**: Real-time balance display
3. **Monitor Payments**: Payment progress and history
4. **Generate Reports**: Transaction summaries and analytics

## Security Considerations

1. **Transaction Validation**: Ensure amounts are positive and within limits
2. **Duplicate Prevention**: Check for duplicate transaction IDs
3. **Balance Validation**: Prevent negative balances
4. **Audit Logging**: Log all balance changes for compliance
5. **Access Control**: Restrict transaction creation to authorized users

## Error Handling

```javascript
// Example error responses
{
  "success": false,
  "error": "Insufficient balance",
  "code": "INSUFFICIENT_BALANCE"
}

{
  "success": false,
  "error": "Duplicate transaction ID",
  "code": "DUPLICATE_TRANSACTION"
}

{
  "success": false,
  "error": "Invalid amount",
  "code": "INVALID_AMOUNT"
}
```

This structure provides a robust, scalable payment system that maintains data integrity while providing comprehensive tracking and reporting capabilities.
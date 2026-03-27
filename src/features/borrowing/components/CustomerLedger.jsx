import React, { useState } from 'react';
import { X, User, Download, Printer, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

// Mock transaction data for a customer
const generateMockTransactions = (customerName) => {
  return [
    {
      id: 1,
      date: '2026-01-15',
      type: 'Borrow',
      description: 'Cash borrowed',
      borrowType: 'Cash',
      amount: 50000,
      balance: 50000,
      paymentMode: '-',
      referenceNo: '-'
    },
    {
      id: 2,
      date: '2026-01-22',
      type: 'Payment',
      description: 'Partial payment received',
      borrowType: '-',
      amount: 20000,
      balance: 30000,
      paymentMode: 'UPI',
      referenceNo: 'TXN123456789'
    },
    {
      id: 3,
      date: '2026-02-10',
      type: 'Borrow',
      description: 'Silver borrowed (100g @ ₹2,63,547/kg)',
      borrowType: 'Silver',
      amount: 26354.7,
      balance: 56354.7,
      paymentMode: '-',
      referenceNo: '-'
    },
    {
      id: 4,
      date: '2026-02-18',
      type: 'Payment',
      description: 'Payment received via online transfer',
      borrowType: '-',
      amount: 25000,
      balance: 31354.7,
      paymentMode: 'Online',
      referenceNo: 'REF987654321'
    },
    {
      id: 5,
      date: '2026-02-28',
      type: 'Borrow',
      description: 'Cash borrowed for emergency',
      borrowType: 'Cash',
      amount: 30000,
      balance: 61354.7,
      paymentMode: '-',
      referenceNo: '-'
    },
    {
      id: 6,
      date: '2026-03-05',
      type: 'Payment',
      description: 'Cash payment',
      borrowType: '-',
      amount: 15000,
      balance: 46354.7,
      paymentMode: 'Cash',
      referenceNo: '-'
    },
    {
      id: 7,
      date: '2026-03-10',
      type: 'Payment',
      description: 'Cheque payment',
      borrowType: '-',
      amount: 10000,
      balance: 36354.7,
      paymentMode: 'Cheque',
      referenceNo: 'CHQ456789'
    }
  ];
};

const CustomerLedger = ({ customer, onClose }) => {
  const [transactions] = useState(generateMockTransactions(customer.name));
  const [displayedTransactions, setDisplayedTransactions] = useState(10);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && displayedTransactions < transactions.length) {
      setDisplayedTransactions(prev => Math.min(prev + 10, transactions.length));
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  const totalBorrowed = transactions
    .filter(t => t.type === 'Borrow')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPaid = transactions
    .filter(t => t.type === 'Payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Download functionality will be implemented with backend');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{customer.name}</h2>
              <div className="flex gap-4 mt-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> {customer.phone}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">City:</span> {customer.city}
                </p>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  customer.type === 'B2B' ? 'bg-purple-100 text-purple-700' :
                  customer.type === 'Wholesale' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {customer.type}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Print Ledger"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Download Ledger"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Borrowed</h3>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBorrowed)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Paid</h3>
              <TrendingDown className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Current Balance</h3>
              <Calendar className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalBorrowed - totalPaid)}</p>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 pb-3">
            <h3 className="text-lg font-semibold text-gray-800">Transaction History</h3>
            <p className="text-sm text-gray-600">Complete ledger of all borrows and payments</p>
          </div>

          <div 
            className="flex-1 overflow-x-auto overflow-y-auto px-6 pb-6"
            onScroll={handleScroll}
          >
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Borrow Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Payment Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, displayedTransactions).map((transaction, index) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(transaction.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'Borrow' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                      {transaction.description}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {transaction.borrowType}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${
                        transaction.type === 'Borrow' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'Borrow' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {transaction.paymentMode}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700 font-mono text-xs">
                      {transaction.referenceNo}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                      {formatCurrency(transaction.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayedTransactions < transactions.length && (
              <div className="text-center py-4 text-sm text-gray-500">
                Scroll down to load more transactions...
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Total Transactions: <span className="font-semibold">{transactions.length}</span>
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerLedger;
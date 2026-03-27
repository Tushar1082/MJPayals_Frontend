import React, { useState } from 'react';
import { X, User, CreditCard } from 'lucide-react';

const PaymentEntry = ({ onClose, onSubmit, prefilledCustomer = null }) => {
  const [formData, setFormData] = useState({
    customerName: prefilledCustomer?.name || '',
    phone: prefilledCustomer?.phone || '',
    customerType: prefilledCustomer?.type || 'Retail',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash',
    amount: '',
    referenceNo: '',
    notes: '',
    pendingBefore: prefilledCustomer?.pending || 0
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid payment amount';
    }
    if (parseFloat(formData.amount) > formData.pendingBefore) {
      newErrors.amount = 'Payment amount cannot exceed pending balance';
    }
    if (['UPI', 'Online', 'Cheque'].includes(formData.paymentMode) && !formData.referenceNo.trim()) {
      newErrors.referenceNo = 'Reference/Transaction number is required for this payment mode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const paymentEntry = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        pendingAfter: formData.pendingBefore - parseFloat(formData.amount)
      };
      onSubmit(paymentEntry);
      onClose();
    }
  };

  const calculatePendingAfter = () => {
    if (formData.amount) {
      return formData.pendingBefore - parseFloat(formData.amount);
    }
    return formData.pendingBefore;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Record Payment</h2>
            <p className="text-sm text-gray-600 mt-1">Record customer payment against borrowed amount</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name*
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="Enter customer name"
                  disabled={!!prefilledCustomer}
                  className={`w-full border ${errors.customerName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-green-500 ${prefilledCustomer ? 'bg-gray-100' : ''}`}
                />
                {errors.customerName && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number*
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  disabled={!!prefilledCustomer}
                  className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-green-500 ${prefilledCustomer ? 'bg-gray-100' : ''}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Type
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) => handleChange('customerType', e.target.value)}
                  disabled={!!prefilledCustomer}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 ${prefilledCustomer ? 'bg-gray-100' : 'bg-white'}`}
                >
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="B2B">B2B</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pending Balance
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-orange-50">
                  <span className="text-orange-600 font-semibold">
                    ₹{formData.pendingBefore.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Payment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date*
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => handleChange('paymentDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode*
                </label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => handleChange('paymentMode', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Online">Online Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (₹)*
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="Enter payment amount"
                  className={`w-full border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-green-500`}
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

              {['UPI', 'Online', 'Cheque'].includes(formData.paymentMode) && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.paymentMode === 'Cheque' ? 'Cheque Number' : 'Transaction/Reference Number'}*
                  </label>
                  <input
                    type="text"
                    value={formData.referenceNo}
                    onChange={(e) => handleChange('referenceNo', e.target.value)}
                    placeholder={formData.paymentMode === 'Cheque' ? 'Enter cheque number' : 'Enter transaction ID'}
                    className={`w-full border ${errors.referenceNo ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-green-500`}
                  />
                  {errors.referenceNo && (
                    <p className="text-red-500 text-xs mt-1">{errors.referenceNo}</p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes / Remarks (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {formData.amount && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Pending Before:</span>
                  <span className="font-medium text-orange-600">₹{formData.pendingBefore.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Payment Amount:</span>
                  <span className="font-medium text-green-600">- ₹{parseFloat(formData.amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-green-300 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-800">Pending After:</span>
                  <span className="font-bold text-lg text-gray-800">₹{calculatePendingAfter().toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentEntry;
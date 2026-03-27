import React, { useState } from 'react';
import { X, User, FileText } from 'lucide-react';

const NewBorrowEntry = ({ onClose, onSubmit, prefilledCustomer = null }) => {
  const [formData, setFormData] = useState({
    customerName: prefilledCustomer?.name || '',
    phone: prefilledCustomer?.phone || '',
    city: prefilledCustomer?.city || '',
    customerType: prefilledCustomer?.type || 'Retail',
    borrowDate: new Date().toISOString().split('T')[0],
    borrowType: 'Cash', // Cash or Silver
    amount: '',
    silverWeight: '',
    silverRate: '2,63,547',
    notes: '',
    dueDate: ''
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
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (formData.borrowType === 'Cash') {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      }
    } else {
      if (!formData.silverWeight || parseFloat(formData.silverWeight) <= 0) {
        newErrors.silverWeight = 'Please enter a valid silver weight';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const borrowEntry = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'Active'
      };
      onSubmit(borrowEntry);
      onClose();
    }
  };

  const calculateCashValue = () => {
    if (formData.borrowType === 'Silver' && formData.silverWeight) {
      const rate = parseFloat(formData.silverRate.replace(/,/g, ''));
      const weight = parseFloat(formData.silverWeight);
      return (weight * rate).toLocaleString('en-IN');
    }
    return '0';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">New Borrow Entry</h2>
            <p className="text-sm text-gray-600 mt-1">Record money or silver borrowed by customer</p>
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
              <User className="w-5 h-5 text-indigo-600" />
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
                  className={`w-full border ${errors.customerName ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500`}
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
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City*
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="Enter city"
                  className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500`}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Type*
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) => handleChange('customerType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="B2B">B2B</option>
                </select>
              </div>
            </div>
          </div>

          {/* Borrow Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Borrow Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Borrow Date*
                </label>
                <input
                  type="date"
                  value={formData.borrowDate}
                  onChange={(e) => handleChange('borrowDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Borrow Type*
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="borrowType"
                      value="Cash"
                      checked={formData.borrowType === 'Cash'}
                      onChange={(e) => handleChange('borrowType', e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Cash Amount</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="borrowType"
                      value="Silver"
                      checked={formData.borrowType === 'Silver'}
                      onChange={(e) => handleChange('borrowType', e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm text-gray-700">Silver (Weight)</span>
                  </label>
                </div>
              </div>

              {formData.borrowType === 'Cash' ? (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cash Amount (₹)*
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                    placeholder="Enter amount in rupees"
                    className={`w-full border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500`}
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Silver Weight (grams)*
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.silverWeight}
                      onChange={(e) => handleChange('silverWeight', e.target.value)}
                      placeholder="Enter weight in grams"
                      className={`w-full border ${errors.silverWeight ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500`}
                    />
                    {errors.silverWeight && (
                      <p className="text-red-500 text-xs mt-1">{errors.silverWeight}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Silver Rate (Per kg)
                    </label>
                    <input
                      type="text"
                      value={formData.silverRate}
                      onChange={(e) => handleChange('silverRate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 mb-1">Equivalent Cash Value:</p>
                      <p className="text-2xl font-bold text-indigo-600">₹{calculateCashValue()}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes / Remarks (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>
          </div>

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
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Save Borrow Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBorrowEntry;
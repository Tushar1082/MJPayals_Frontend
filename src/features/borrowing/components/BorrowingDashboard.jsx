import React, { useState } from 'react';
import { Calendar, User, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

// import SideBar from './SideBar';
import SideBar from '../../../components/layout/SideBar/SideBar';
import NewBorrowEntry from './Newborrowentry';
import PaymentEntry from './Paymententry';
import CustomerLedger from './Customerledger';

// Mock data for borrowing summary
const mockSummaryData = {
    totalBorrowed: 2450000,
    totalRecovered: 1680000,
    totalPending: 770000,
    activeCustomers: 12,
    overdueAmount: 125000,
    recentTransactions: 5
};

// Mock data for customers with pending balances
const mockCustomersWithBalance = [
    {
        id: 1,
        name: 'Rajesh Kumar',
        phone: '9876543210',
        city: 'Agra',
        totalBorrowed: 150000,
        totalPaid: 80000,
        pending: 70000,
        lastTransaction: '2026-03-10',
        type: 'Retail'
    },
    {
        id: 2,
        name: 'Priya Sharma',
        phone: '9876543211',
        city: 'Delhi',
        totalBorrowed: 250000,
        totalPaid: 250000,
        pending: 0,
        lastTransaction: '2026-03-12',
        type: 'Wholesale'
    },
    {
        id: 3,
        name: 'Amit Verma',
        phone: '9876543212',
        city: 'Mathura',
        totalBorrowed: 180000,
        totalPaid: 100000,
        pending: 80000,
        lastTransaction: '2026-03-08',
        type: 'Retail'
    },
    {
        id: 4,
        name: 'Sunita Devi',
        phone: '9876543213',
        city: 'Agra',
        totalBorrowed: 320000,
        totalPaid: 200000,
        pending: 120000,
        lastTransaction: '2026-02-28',
        type: 'B2B'
    },
    {
        id: 5,
        name: 'Mohan Singh',
        phone: '9876543214',
        city: 'Firozabad',
        totalBorrowed: 95000,
        totalPaid: 70000,
        pending: 25000,
        lastTransaction: '2026-03-11',
        type: 'Wholesale'
    },
    {
        id: 6,
        name: 'Kavita Agarwal',
        phone: '9876543215',
        city: 'Agra',
        totalBorrowed: 420000,
        totalPaid: 200000,
        pending: 220000,
        lastTransaction: '2026-03-05',
        type: 'B2B'
    },
    {
        id: 7,
        name: 'Vikram Joshi',
        phone: '9876543216',
        city: 'Bharatpur',
        totalBorrowed: 135000,
        totalPaid: 100000,
        pending: 35000,
        lastTransaction: '2026-03-09',
        type: 'Retail'
    },
    {
        id: 8,
        name: 'Neha Gupta',
        phone: '9876543217',
        city: 'Agra',
        totalBorrowed: 280000,
        totalPaid: 150000,
        pending: 130000,
        lastTransaction: '2026-03-07',
        type: 'Wholesale'
    },
    {
        id: 9,
        name: 'Ramesh Yadav',
        phone: '9876543218',
        city: 'Aligarh',
        totalBorrowed: 165000,
        totalPaid: 165000,
        pending: 0,
        lastTransaction: '2026-03-13',
        type: 'Retail'
    },
    {
        id: 10,
        name: 'Pooja Mishra',
        phone: '9876543219',
        city: 'Agra',
        totalBorrowed: 195000,
        totalPaid: 105000,
        pending: 90000,
        lastTransaction: '2026-03-06',
        type: 'B2B'
    }
];

const BorrowingDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customerTypeFilter, setCustomerTypeFilter] = useState('All');
    const [dateRange, setDateRange] = useState({
        start: '01-01-2026',
        end: '13-03-2026'
    });
    const [displayedCustomers, setDisplayedCustomers] = useState(10);
    const [showLoader, setShowLoader] = useState(false);

    // Modal states
    const [showBorrowModal, setShowBorrowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showLedgerModal, setShowLedgerModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
    };

    const filteredCustomers = mockCustomersWithBalance.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm) ||
            customer.city.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = customerTypeFilter === 'All' || customer.type === customerTypeFilter;
        return matchesSearch && matchesType;
    });

    const handleScroll = (e) => {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom && displayedCustomers < filteredCustomers.length) {
            setDisplayedCustomers(prev => Math.min(prev + 10, filteredCustomers.length));
        }
    };

    // Modal handlers
    const onNewBorrow = (customer = null) => {
        setSelectedCustomer(customer);
        setShowBorrowModal(true);
    };

    const onNewPayment = (customer = null) => {
        setSelectedCustomer(customer);
        setShowPaymentModal(true);
    };

    const onViewLedger = (customer) => {
        setSelectedCustomer(customer);
        setShowLedgerModal(true);
    };

    const handleBorrowSubmit = (borrowData) => {
        console.log('New Borrow Entry:', borrowData);
        // Backend integration will be added here
        alert('Borrow entry saved successfully!');
    };

    const handlePaymentSubmit = (paymentData) => {
        console.log('New Payment Entry:', paymentData);
        // Backend integration will be added here
        alert('Payment recorded successfully!');
    };

    return (
        <div className="flex gap-0">
            <SideBar showLoader={showLoader} />
            <div className="p-5 mx-auto min-w-[80%]">
                <div className="p-0 min-h-screen">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Borrowing Management</h1>
                        <p className="text-gray-600">Track and manage customer credit transactions</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-600">Total Borrowed</h3>
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(mockSummaryData.totalBorrowed)}</p>
                            <p className="text-xs text-gray-500 mt-1">Lifetime total</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-600">Total Recovered</h3>
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <TrendingDown className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(mockSummaryData.totalRecovered)}</p>
                            <p className="text-xs text-gray-500 mt-1">Payments received</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-600">Total Pending</h3>
                                <div className="bg-orange-100 p-2 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-orange-600">{formatCurrency(mockSummaryData.totalPending)}</p>
                            <p className="text-xs text-gray-500 mt-1">Outstanding balance</p>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-600">Active Customers</h3>
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <User className="w-5 h-5 text-indigo-600" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-800">{mockSummaryData.activeCustomers}</p>
                            <p className="text-xs text-gray-500 mt-1">With pending balance</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                        <div className="flex gap-3">
                            <button
                                onClick={() => onNewBorrow()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <TrendingUp className="w-4 h-4" />
                                New Borrow Entry
                            </button>
                            <button
                                onClick={() => onNewPayment()}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <TrendingDown className="w-4 h-4" />
                                Record Payment
                            </button>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={`Borrow: ${dateRange.start} - ${dateRange.end}`}
                                    readOnly
                                    className="flex-1 outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={`Payment: ${dateRange.start} - ${dateRange.end}`}
                                    readOnly
                                    className="flex-1 outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
                                />
                            </div>

                            <select
                                value={customerTypeFilter}
                                onChange={(e) => setCustomerTypeFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 outline-none text-sm text-gray-700 bg-white"
                            >
                                <option value="All">All Customer Types</option>
                                <option value="Retail">Retail</option>
                                <option value="Wholesale">Wholesale</option>
                                <option value="B2B">B2B</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search by Name, Phone or City"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none text-sm focus:border-indigo-500"
                                />
                            </div>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-medium transition-colors">
                                Search
                            </button>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setCustomerTypeFilter('All');
                                }}
                                className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Customers Table */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">Customer Balances</h2>
                            <p className="text-sm text-gray-600">View all customers with borrowing history ({filteredCustomers.length} total)</p>
                        </div>

                        <div
                            className="overflow-x-auto"
                            style={{ maxHeight: '500px', overflowY: 'auto' }}
                            onScroll={handleScroll}
                        >
                            <table className="w-full">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-3.5 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">S.No.</th>
                                        <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer Name</th>
                                        <th className="px-3 py-3.5 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                                        <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Mobile No.</th>
                                        <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">City</th>
                                        <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Borrowed</th>
                                        <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total Paid</th>
                                        <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Pending</th>
                                        <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Transaction</th>
                                        <th className="px-3 py-3.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredCustomers.slice(0, displayedCustomers).map((customer, index) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-center whitespace-nowrap text-sm text-gray-700">{index + 1}.</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                                            <td className="px-3 py-2 text-center whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${customer.type === 'B2B' ? 'bg-purple-100 text-purple-700' :
                                                    customer.type === 'Wholesale' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {customer.type}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{customer.phone}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{customer.city}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{formatCurrency(customer.totalBorrowed)}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(customer.totalPaid)}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                <span className={`font-medium ${customer.pending > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                    {formatCurrency(customer.pending)}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">{customer.lastTransaction}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => onViewLedger(customer)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors"
                                                        title="View Ledger"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => onNewPayment(customer)}
                                                        className="bg-gray-800 hover:bg-gray-900 text-white p-2 rounded-lg transition-colors"
                                                        title="Add Payment"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {displayedCustomers < filteredCustomers.length && (
                                <div className="text-center py-4 text-sm text-gray-500">
                                    Scroll down to load more...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modals */}
                {showBorrowModal && (
                    <NewBorrowEntry
                        onClose={() => {
                            setShowBorrowModal(false);
                            setSelectedCustomer(null);
                        }}
                        onSubmit={handleBorrowSubmit}
                        prefilledCustomer={selectedCustomer}
                    />
                )}

                {showPaymentModal && (
                    <PaymentEntry
                        onClose={() => {
                            setShowPaymentModal(false);
                            setSelectedCustomer(null);
                        }}
                        onSubmit={handlePaymentSubmit}
                        prefilledCustomer={selectedCustomer}
                    />
                )}

                {showLedgerModal && selectedCustomer && (
                    <CustomerLedger
                        customer={selectedCustomer}
                        onClose={() => {
                            setShowLedgerModal(false);
                            setSelectedCustomer(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default BorrowingDashboard;
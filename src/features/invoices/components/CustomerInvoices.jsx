import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Search, Calendar, Download, Plus, Edit, X, RotateCcw, Eye, Pencil, PencilLine } from 'lucide-react';
import toast from "react-hot-toast";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";

import SideBar from '../../../components/layout/SideBar/SideBar.jsx';
import ViewInvoices from "./ViewInvoices";
import { BillPDF } from "../../billing/components/BillPDF.jsx";
import { WholeSalerBillPDFA } from "../../billing/components/WholeSalerBillPDF_.jsx";
import { 
    calculateItemAmount,
    roundTo,
    roundToInt
} from "../../../utils/helpers/billingHelper.js";
import CustomerTypeDropdown from '../../customers/components/CustomerTypeDropdown.jsx';


function GroupToggle() {
    const [searchParams, setSearchParams] = useSearchParams();

    const isChecked = searchParams.get("group") === "true";

    const handleToggle = () => {
        if (isChecked) {
            searchParams.delete("group");
            setSearchParams(searchParams);
        } else {
            setSearchParams({ group: "true" });
        }
    };

    return (
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[200px]">
        {/* <div className="flex items-center gap-3 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"> */}
            <span className="text-gray-700 font-medium">
                Group
            </span>

            <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">

                <input
                    id="groupToggle"
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleToggle}
                    className="absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer outline-none focus:ring-0 transition-all right-4 top-0.5 checked:right-[2px]"
                />

                <label
                    htmlFor="groupToggle"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${isChecked
                            ? "bg-[#6366F1]"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                ></label>

            </div>
        </div>
    );
}


const CustomerDirectory = () => {
    const [expandedCustomers, setExpandedCustomers] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    // const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: new Date().toISOString().split('T')[0] });
    // const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginatedCustomers, setPaginatedCustomers] = useState([]);
    const [totalPages, setTotalPages] = useState();

    const [allCustomers, setAllCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [showInvoice, setShowInvoice] = useState({
        show: false,
        cusType: 'R',
        invId: null,
        cusId: null,
        silverRate: 0
    });
    const [cusFilter, setCusFilter] = useState(null);
    const [isInvUpdate, setIsInvUpdate] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        searchQuery: '',
        invoiceDateRange: { start: '2026-01-01', end: new Date().toISOString().split('T')[0] },
        customerDateRange: { start: '2026-01-01', end: new Date().toISOString().split('T')[0] },
        // dateRange: { start: '2026-01-01', end: new Date().toISOString().split('T')[0] },
        cusType: null,
        dateEnabled: false,
    });
    // const datePickerRef = useRef(null);
    // Replace the existing dateRange state with two separate ones:
    const [invoiceDateRange, setInvoiceDateRange] = useState({
        start: '2026-01-01',
        end: new Date().toISOString().split('T')[0]
    });
    const [customerDateRange, setCustomerDateRange] = useState({
        start: '2026-01-01',
        end: new Date().toISOString().split('T')[0]
    });

    // Add separate show states for both date pickers
    const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
    const [showCustomerDatePicker, setShowCustomerDatePicker] = useState(false);

    // Add refs for both date pickers
    const invoiceDatePickerRef = useRef(null);
    const customerDatePickerRef = useRef(null);

    const itemsPerPage = 10;

    const stringFLCMaker = (str) => {
        if (!str) {
            return "";
        }

        const strArr = str.split(" ");

        // Capitalize the first letter of each word
        const word = strArr
            .map((elm) => {
                return elm.charAt(0).toUpperCase() + elm.slice(1).toLowerCase();
            })
            .join(" ");

        return word;
    };

    function formatName(fullName) {
        if (!fullName) return "";

        // Remove extra spaces and split into words
        const parts = fullName.trim().split(/\s+/);

        // If only one name exists, return it
        if (parts.length === 1) {
            return parts[0];
        }

        const firstName = parts[0];
        const lastName = parts[parts.length - 1];

        return `${firstName}-${lastName}`;
    }

    function formatIndianAmount(amount) {
        if (!amount) return "";
        return Number(amount).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        });
    }

    async function fetchAllCustomer() {
        try {
            setShowLoader(true);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/customer/summary`);
            const result = await response.json();

            if (result.status == 'success') {

                if (!Array.isArray(result.data)) {
                    console.log("Customers Data Not Found!");
                    return;
                }
                // console.log(result.data)
                const fResult = result.data.filter((cus) => cus.cusType != 'B')

                setAllCustomers(fResult);
            } else if (result.status == 'error') {
                console.log("Error comes from the server...");
                console.log(result.message);
            } else {
                console.log(result.message);
            }

        } catch (error) {
            console.log("Error occur while fetching existing customer items..");
            console.log(error);
        } finally {
            setShowLoader(false);
        }
    }

    const handleRowClick = (customerId) => {
        setExpandedCustomers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(customerId)) {
                newSet.delete(customerId);
            } else {
                newSet.add(customerId);
            }
            return newSet;
        });
    };

    // const applyDateSearch = () => {
    //     setShowDatePicker(false);

    //     const updated = allCustomers.filter(customer =>
    //         customer.invoices.some(invoice => {
    //             const d = new Date(invoice.invoiceDate);
    //             return d >= new Date(dateRange.start) && d <= new Date(dateRange.end);
    //         })
    //     );

    //     setFilteredCustomers(updated);
    //     setCurrentPage(1);
    // };


    // const applyTextSearch = () => {
    //     if (!searchQuery.trim()) {
    //         setFilteredCustomers(allCustomers);
    //         setCurrentPage(1);
    //         return;
    //     }

    //     const updated = allCustomers.filter(c =>
    //         c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //         c.phone?.includes(searchQuery)
    //     );

    //     setFilteredCustomers(updated);
    //     setCurrentPage(1);
    // };

    // const applyFilters = (filters, customers) => {
    //     let result = [...customers];

    //     if (filters.searchQuery.trim()) {
    //         result = result.filter(c =>
    //             c.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
    //             c.phone?.includes(filters.searchQuery)
    //         );
    //     }

    //     if (filters.cusType) {
    //         result = result.filter(c => c.cusType === filters.cusType);
    //     }

    //     if (filters.dateEnabled) {
    //         result = result.filter(customer =>
    //             customer.invoices.some(invoice => {
    //                 const d = new Date(invoice.invoiceDate);
    //                 const start = new Date(filters.dateRange.start);
    //                 start.setHours(0, 0, 0, 0);
    //                 const end = new Date(filters.dateRange.end);
    //                 end.setHours(23, 59, 59, 999);
    //                 return d >= start && d <= end;
    //             })
    //         );
    //     }

    //     // if (filters.dateEnabled) {
    //     //     result = result.filter(customer =>
    //     //         customer.invoices.some(invoice => {
    //     //             const d = new Date(invoice.invoiceDate);
    //     //             return d >= new Date(filters.dateRange.start) && d <= new Date(filters.dateRange.end);
    //     //         })
    //     //     );
    //     // }

    //     return result;
    // };

    const applyFilters = (filters, customers) => {
        let result = [...customers];

        if (filters.searchQuery.trim()) {
            result = result.filter(c =>
                c.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                c.phone?.includes(filters.searchQuery)
            );
        }

        if (filters.cusType) {
            result = result.filter(c => c.cusType === filters.cusType);
        }

        // Filter by customer creation date
        if (filters.customerDateEnabled) {
            result = result.filter(customer => {
                const createdDate = new Date(customer.createdAt);
                const start = new Date(filters.customerDateRange.start);
                start.setHours(0, 0, 0, 0);
                const end = new Date(filters.customerDateRange.end);
                end.setHours(23, 59, 59, 999);
                return createdDate >= start && createdDate <= end;
            });
        }

        // Filter by invoice date
        if (filters.invoiceDateEnabled) {
            result = result.filter(customer =>
                customer.invoices.some(invoice => {
                    const d = new Date(invoice.invoiceDate);
                    const start = new Date(filters.invoiceDateRange.start);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(filters.invoiceDateRange.end);
                    end.setHours(23, 59, 59, 999);
                    return d >= start && d <= end;
                })
            );
        }

        return result;
    };

    const handleTextSearch = () => {
        setActiveFilters(prev => ({ ...prev, searchQuery }));
    };

    const handleDateApply = () => {
        setShowDatePicker(false);
        setActiveFilters(prev => ({ ...prev, dateRange, dateEnabled: true }));
    };

    const handleCusFilter = (val) => {
        setCusFilter(val);
        setActiveFilters(prev => ({ ...prev, cusType: val }));
    };

    // Replace handleDateApply with two separate handlers:
    const handleInvoiceDateApply = () => {
        setShowInvoiceDatePicker(false);
        setActiveFilters(prev => ({
            ...prev,
            invoiceDateRange,
            invoiceDateEnabled: true
        }));
    };

    const handleCustomerDateApply = () => {
        setShowCustomerDatePicker(false);
        setActiveFilters(prev => ({
            ...prev,
            customerDateRange,
            customerDateEnabled: true
        }));
    };

    // Update handleReset:
    const handleReset = () => {
        setSearchQuery('');
        setCusFilter(null);
        const defaultDateRange = { start: '2026-01-01', end: new Date().toISOString().split('T')[0] };
        setInvoiceDateRange(defaultDateRange);
        setCustomerDateRange(defaultDateRange);
        setActiveFilters({
            searchQuery: '',
            invoiceDateRange: defaultDateRange,
            customerDateRange: defaultDateRange,
            cusType: null,
            invoiceDateEnabled: false,
            customerDateEnabled: false,
        });
    };

    // const handleReset = () => {
    //     setSearchQuery('');
    //     setCusFilter(null);
    //     setActiveFilters({
    //         searchQuery: '',
    //         dateRange: { start: '2026-01-01', end: new Date().toISOString().split('T')[0] },
    //         cusType: null,
    //         dateEnabled: false,
    //     });
    //     setDateRange({ start: '2026-01-01', end: new Date().toISOString().split('T')[0] });
    // };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString)
            .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
            .replace(/\//g, '-');
    };

    // const getTotalPPWeight = (ppRows = []) => {
    //     return ppRows.reduce((sum, row) => {
    //         const count = Number(row.count || 0);
    //         const weight = Number(row.weight || 0);
    //         return sum + count * weight;
    //     }, 0);
    // };

    function convertPolyArray(arr) {
        if (!Array.isArray(arr) || arr.length === 0) {
            return [{ count: 0, weight: 0 }];
        }

        return arr.map(item => ({
            count: item?.noOfPPs ?? 0,
            weight: item?.weightOfOpp ?? 0
        }));
    }

    async function fetchInvoiceItems(invoiceId, cusType, silverRate, invoiceDate) {
        try {
            if (!invoiceId) {
                console.log("Invoice id is required!");
                return;
            }
            setShowLoader(true);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/customer-invoice/${invoiceId}/items`);
            const result = await response.json();

            if (result.status == 'success') {
                if (!Array.isArray(result.items)) {
                    console.log("Invoice Items Not Found!");
                    return;
                }

                // const mappedItems = result.items.map(item => {
                //     const polythenes = item.polythenes ? convertPolyArray(item.polythenes) : [
                //         { count: 0, weight: 0 }
                //     ];
                //     const netWeight = item.grossWeight - getTotalPPWeight(polythenes); // grams only

                //     let itemAmount = 0;

                //     if (item.measurementValue === "G") {
                //         itemAmount = Math.round(netWeight * item.rate);
                //     } else if (item.measurementValue === "P") {
                //         const effectiveRatePerGram = (silverRate * item.rate) / 100 / 1000;
                //         itemAmount = Math.round(netWeight * effectiveRatePerGram);
                //     }
                //     // Note: don't do here labour amount calculation because i already do in WholeSalerBillPDFA component.
                //     return {
                //         itemIdx: item.id,
                //         itemName: stringFLCMaker(item.itemName) || "",

                //         rateGm: item.measurementValue === "G" ? Number(item.rate) : 0,
                //         ratePer: item.measurementValue === "P" ? Number(item.rate) : 0,

                //         weight: Number(item.grossWeight) || 0,
                //         ppRows: polythenes,

                //         amount: itemAmount,
                //         newItems: false,
                //         labourType: item.labourType,
                //         labourNumPieces: item.labourType == 'P' ? Math.floor(item.labourAmount / item.labourRate) : 0,
                //         labourRate: Math.round(item.labourRate),
                //         labourAmount: item.labourAmount
                //     };
                // });

                const mappedItems = result.items.map(item => {
                    const polythenes = item.polythenes ? convertPolyArray(item.polythenes) : [
                        { count: 0, weight: 0 }
                    ];

                    // ✅ Use helper to calculate amount consistently
                    const { amount, labourAmount, netWeight } = calculateItemAmount(cusType, {
                        grossWeight: item.grossWeight,
                        ppRows: polythenes,
                        rateGm: item.measurementValue === "G" ? Number(item.rate) : 0,
                        ratePer: item.measurementValue === "P" ? Number(item.rate) : 0,
                        silverRate: silverRate,
                        labourType: item.labourType,
                        labourRate: item.labourRate,
                        labourNumPieces: item.labourType == 'P'
                            ? Math.floor(item.labourAmount / item.labourRate)
                            : 0
                    });

                    return {
                        itemIdx: item.id,
                        itemName: stringFLCMaker(item.itemName) || "",
                        rateGm: item.measurementValue === "G" ? Number(item.rate) : 0,
                        ratePer: item.measurementValue === "P" ? Number(item.rate) : 0,
                        weight: roundTo(Number(item.grossWeight), 2) || 0,  // ✅ 2 decimals
                        ppRows: polythenes,
                        amount: roundToInt(amount),              // ✅ Integer
                        newItems: false,
                        labourType: item.labourType,
                        labourNumPieces: item.labourType == 'P'
                            ? Math.floor(item.labourAmount / item.labourRate)
                            : 0,
                        labourRate: roundToInt(item.labourRate), // ✅ Integer
                        labourAmount: roundToInt(labourAmount)   // ✅ Integer
                    };
                });

                const blob = await pdf(
                    cusType == 'R' ? <BillPDF items={mappedItems} silverRate={silverRate} invoiceDate={invoiceDate} /> : <WholeSalerBillPDFA items={mappedItems} silverRate={silverRate} invoiceDate={invoiceDate} />
                ).toBlob();

                window.open(URL.createObjectURL(blob));
            } else if (result.status == 'error') {
                console.log("Error comes from the server...");
                console.log(result.message);
            } else {
                console.log(result.message);
            }

        } catch (error) {
            console.log("Error occur while fetching existing customer items..");
            console.log(error);
        } finally {
            setShowLoader(false);
        }
    }

    function customerTypeFinder(customerType) {
        switch (customerType) {
            case 'W':
                return 'WholeSale';
            case 'B':
                return 'B2B';
            default:
                return 'Retail';
        }
    }

    useEffect(() => {
        fetchAllCustomer();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // if (
            //     datePickerRef.current &&
            //     !datePickerRef.current.contains(event.target)
            // ) {
            //     setShowDatePicker(false);
            // }

            if (
                invoiceDatePickerRef.current &&
                !invoiceDatePickerRef.current.contains(event.target)
            ) {
                setShowInvoiceDatePicker(false);
            }
            if (
                customerDatePickerRef.current &&
                !customerDatePickerRef.current.contains(event.target)
            ) {
                setShowCustomerDatePicker(false);
            }

        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    // useEffect(() => {
    //     setFilteredCustomers(allCustomers);

    //     if (!isInvUpdate) {
    //         setCurrentPage(1);
    //     } else
    //         setIsInvUpdate(false);

    // }, [allCustomers]);

    useEffect(() => {
        if (!isInvUpdate) {
            setCurrentPage(1);
        } else {
            setIsInvUpdate(false);
        }
    }, [allCustomers]);

    useEffect(() => {
        const filtered = applyFilters(activeFilters, allCustomers);
        setFilteredCustomers(filtered);
        if (!isInvUpdate) {
            setCurrentPage(1);
        }
    }, [activeFilters, allCustomers]);


    useEffect(() => {
        const total = Math.ceil(filteredCustomers.length / itemsPerPage);

        const safeTotalPages = total > 0 ? total : 1;
        setTotalPages(safeTotalPages);

        const safeCurrentPage =
            currentPage > safeTotalPages ? 1 : currentPage;

        if (safeCurrentPage !== currentPage) {
            setCurrentPage(safeCurrentPage);
            return;
        }

        const start = (safeCurrentPage - 1) * itemsPerPage;
        const end = safeCurrentPage * itemsPerPage;

        setPaginatedCustomers(filteredCustomers.slice(start, end));
    }, [filteredCustomers, currentPage]);

    useEffect(() => {
        setExpandedCustomers(new Set());
    }, [currentPage]);

    function handleCusInvoice(invId, cusType, cusId, silverRate) {
        if (!invId || !cusId || !cusType || !silverRate) {
            return;
        }

        setShowInvoice({ show: true, cusType: cusType, invId, cusId, silverRate });
    }

    // useEffect(() => {
    //     if (cusFilter) {
    //         if (cusFilter != 'R' && cusFilter != 'W' && cusFilter != 'B') {
    //             return;
    //         }
    //         const updatedData = allCustomers.filter((cus) => cus.cusType == cusFilter);
    //         setFilteredCustomers(updatedData);
    //         setCurrentPage(1);
    //     }
    // }, [cusFilter]);

    return (
        <div className="flex gap-4">
            <SideBar showLoader={showLoader} />
            {showInvoice.show &&
                <ViewInvoices
                    invoiceId={showInvoice.invId}
                    customerId={showInvoice.cusId}
                    cusType={showInvoice.cusType}
                    silverRate={showInvoice.silverRate}
                    setShowLoader={setShowLoader}
                    setShowInvoice={setShowInvoice}
                    setAllCustomers={setAllCustomers}
                    setIsInvUpdate={setIsInvUpdate}
                />
            }

            <div className="p-5 pt-8 mb-10 mx-auto w-[80%]">
                <div className="">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Customer Invoices</h1>
                            <p className="text-sm sm:text-base text-gray-600">Manage client profiles, transaction history, and detailed billing data.</p>
                        </div>
                        <div className="bg-white rounded-lg shadow-[0_0_14px_-2px_#d3d3d3] flex items-center gap-4 mb-2 p-4 w-fit">
                            {/* Invoice Date Filter */}
                            <div className="relative w-fit">
                                <button
                                    onClick={() => setShowInvoiceDatePicker(!showInvoiceDatePicker)}
                                    className="flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 gap-2 px-3 bg-white sm:px-4 py-3.5 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto text-sm"
                                >
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                    <span className="text-gray-700 whitespace-nowrap">
                                        Invoice: {formatDate(invoiceDateRange.start)} - {formatDate(invoiceDateRange.end)}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                </button>

                                {showInvoiceDatePicker && (
                                    <div ref={invoiceDatePickerRef} className="absolute -right-[12.3rem] top-16 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[280px]">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900 text-sm">Invoice Date Range</h3>
                                        </div>
                                        <div className="flex gap-4 items-end">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={invoiceDateRange.start}
                                                    onChange={(e) => setInvoiceDateRange({ ...invoiceDateRange, start: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    value={invoiceDateRange.end}
                                                    onChange={(e) => setInvoiceDateRange({ ...invoiceDateRange, end: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <button
                                                onClick={handleInvoiceDateApply}
                                                className="w-full px-4 py-2 bg-[#6366F1] text-white mb-1 rounded-lg hover:bg-indigo-700 text-sm font-medium"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Customer Creation Date Filter */}
                            <div className="relative w-fit ">
                                <button
                                    onClick={() => setShowCustomerDatePicker(!showCustomerDatePicker)}
                                    className="flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 gap-2 px-3 bg-white sm:px-4 py-3.5 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto text-sm"
                                >
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                    <span className="text-gray-700 whitespace-nowrap">
                                        Customer: {formatDate(customerDateRange.start)} - {formatDate(customerDateRange.end)}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-600" />
                                </button>

                                {showCustomerDatePicker && (
                                    <div ref={customerDatePickerRef} className="absolute -right-[12.3rem] top-16 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[280px]">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-gray-900 text-sm">Customer Creation Date Range</h3>
                                        </div>
                                        <div className="flex gap-4 items-end">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    value={customerDateRange.start}
                                                    onChange={(e) => setCustomerDateRange({ ...customerDateRange, start: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    value={customerDateRange.end}
                                                    onChange={(e) => setCustomerDateRange({ ...customerDateRange, end: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <button
                                                onClick={handleCustomerDateApply}
                                                className="w-full px-4 py-2 bg-[#6366F1] text-white mb-1 rounded-lg hover:bg-indigo-700 text-sm font-medium"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="bg-white rounded-lg shadow-[0_0_14px_-2px_#d3d3d3] mb-8 p-3 sm:p-4">
                            <div className="flex flex-col items-center sm:flex-row gap-3">
                                {/* <div className="relative w-fit ">
                                    <button
                                        onClick={() => setShowDatePicker(!showDatePicker)}
                                        className="flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 gap-2 px-3 bg-white sm:px-4 py-3.5 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto text-sm"
                                    >
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                        <span className="text-gray-700 whitespace-nowrap">
                                            {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                    </button>

                                    {showDatePicker && (
                                        <div ref={datePickerRef} id="datePickerMain" className="absolute -right-[12.3rem] top-16 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[280px]">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold text-gray-900 text-sm">Date Range</h3>
                                            </div>
                                            <div className="flex gap-4 items-end">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={dateRange.start}
                                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                                                    <input
                                                        type="date"
                                                        value={dateRange.end}
                                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleDateApply}
                                                    // onClick={applyDateSearch}
                                                    className="w-full px-4 py-2 bg-[#6366F1] text-white mb-1 rounded-lg hover:bg-indigo-700 text-sm font-medium"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div> */}
                                <CustomerTypeDropdown cusFilter={cusFilter} setCusFilter={handleCusFilter} />
                                {/* <CustomerTypeDropdown cusFilter={cusFilter} setCusFilter={setCusFilter} /> */}
                                <GroupToggle />

                                {/* Search */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-6 sm:h-6" />
                                    <input
                                        type="text"
                                        placeholder="Search by Name or Phone"
                                        value={searchQuery}
                                        // onKeyDown={(e) => e.key === "Enter" ? applyTextSearch() : ""}
                                        onKeyDown={(e) => e.key === "Enter" ? handleTextSearch() : ""}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 sm:pl-10 pr-4 py-3 text-md border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>

                                <button
                                    onClick={handleTextSearch}
                                    // onClick={applyTextSearch} 
                                    className="bg-[#6366F1] hover:bg-[#4B50C1] cursor-pointer transition-background duration-500 text-white pl-5 pr-8 py-3 font-medium flex items-center gap-3 rounded-lg text-md w-fit">
                                    <Search className="w-5 h-5" />
                                    Search
                                </button>
                                <button
                                    onClick={handleReset}
                                    // onClick={() => { setFilteredCustomers(allCustomers); setSearchQuery(""); setCusFilter(null) }} 
                                    className="bg-black/80 hover:bg-black/90 cursor-pointer transition-background duration-500 text-white pl-5 pr-8 py-3 font-medium flex items-center gap-3 rounded-lg text-md w-fit">
                                    <RotateCcw className="w-5 h-5" />
                                    Reset
                                </button>

                                {/* Date Range Filter */}


                                {/* Export Button */}
                                {/* <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="font-medium">Export</span>
                                </button> */}

                                {/* New Customer Button */}
                                {/* <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="font-medium">New Customer</span>
                                </button> */}

                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-lg clear-both shadow-[0_0_14px_-2px_#d3d3d3] overflow-hidden">
                            {/* Table Header */}
                            <div className="grid grid-cols-5 gap-2 px-4 py-[1.3rem] bg-gray-50 border-b border-gray-200 font-semibold text-gray-600 uppercase tracking-wider">
                                <div className="text-start ml-8 col-span-1">Customer Name</div>
                                <div className="text-center">Type</div>
                                <div className="text-center">Contact Details</div>
                                {/* <div className="text-center">Created At</div> */}
                                <div className="text-center ml-1">Last Purchase</div>
                                <div className="text-start ml-1">Total Spent</div>
                            </div>

                            {/* Table Body */}
                            <div className="divide-y divide-gray-200">
                                {paginatedCustomers.length > 0 && paginatedCustomers.map((customer) => (
                                    <div key={customer.cusId} className="transition-all duration-200">
                                        {/* Customer Row */}
                                        <div
                                            onClick={() => handleRowClick(customer.cusId)}
                                            className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                                        >
                                            {/* Desktop View */}
                                            <div className="grid grid-cols-5 gap-4 px-4 py-4 items-center">
                                                <div className="flex items-center gap-3 col-span-1">
                                                    <div className="text-gray-400 transition-transform duration-200">
                                                        {expandedCustomers.has(customer.cusId) ? (
                                                            <ChevronDown className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 text-sm">{customer.name ? stringFLCMaker(customer.name) : '-'}</div>
                                                        {/* <div className="text-xs text-gray-500">ID: {customer.cusId}</div> */}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-center text-gray-900">{customerTypeFinder(customer.cusType)}</div>
                                                {(customer.phone || customer.city) ? <div className="text-center">
                                                    <div className="text-sm text-gray-900">{customer.phone ? customer.phone : '-'}</div>
                                                    <div className="text-xs text-gray-500 truncate">{customer.city ? stringFLCMaker(customer.city) : '-'}</div>
                                                </div> : <div className="text-center">-</div>}
                                                {/* <div className="text-sm text-center text-gray-900">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-GB') : '-'}</div> */}
                                                <div className="text-sm text-center text-gray-900">{customer.lastPurchase ? customer.lastPurchase : '-'}</div>
                                                <div className="text-base font-bold text-[#6366F1]">{formatCurrency(customer.totalSpent)}</div>
                                            </div>

                                        </div>

                                        {/* Expanded Billing History */}
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCustomers.has(customer.cusId) ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                                                }`}
                                        >
                                            {expandedCustomers.has(customer.cusId) && (
                                                <div className="bg-white px-4 sm:px-6 py-5 border-t border-gray-200">
                                                    {/* Invoice Table*/}
                                                    {customer?.invoices?.length > 0 ? <div className="bg-white rounded-lg border border-gray-300 mx-4 max-h-[50vh] overflow-auto">
                                                        <table className="w-full">
                                                            <thead className="bg-gray-200/90 border-b border-gray-300">
                                                                <tr>
                                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Invoice ID</th>
                                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                                                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Net Weight (g)</th>
                                                                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total Amount</th>
                                                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {customer.invoices.map((invoice) => (
                                                                    <tr key={invoice.id} className="hover:bg-gray-100 transition-colors">
                                                                        <td className="px-6 py-4">
                                                                            <span className="font-semibold text-[#6366F1]">#{invoice.id}</span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-gray-700">{formatDate(invoice.invoiceDate)}</td>
                                                                        <td className="px-6 py-4 text-gray-700">{invoice.netWeight}g</td>
                                                                        <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(invoice.totalAmount)}</td>
                                                                        <td className="flex items-center justify-center gap-4 py-4">
                                                                            <button onClick={() => fetchInvoiceItems(invoice.id, customer.cusType, invoice.silverRate, invoice.invoiceDate)} className="bg-[#6366F1] text-sm flex items-center gap-2 whitespace-nowrap hover:bg-[#5c5fe3] rounded-lg p-2 px-3 text-white">
                                                                                <Eye size={20} />
                                                                                <span>
                                                                                    View
                                                                                </span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleCusInvoice(invoice.id, customer.cusType, customer.cusId, invoice.silverRate)}
                                                                                className="bg-[#000000cc] text-sm flex items-center gap-2 whitespace-nowrap hover:bg-black rounded-lg p-2 px-3 text-white">
                                                                                <PencilLine size={20} />
                                                                                <span>
                                                                                    Edit
                                                                                </span>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div> : <p className="text-center text-gray-600 text-sm font-semibold ">No Invoice Found</p>}

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="px-4 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-sm text-gray-600">
                                    {filteredCustomers.length === 0 ? (
                                        "No customers found"
                                    ) : (
                                        <>
                                            Showing{" "}
                                            <span className="font-medium">
                                                {(currentPage - 1) * itemsPerPage + 1}
                                            </span>
                                            {" - "}
                                            <span className="font-medium">
                                                {Math.min(currentPage * itemsPerPage, filteredCustomers.length)}
                                            </span>
                                            {" of "}
                                            <span className="font-medium">
                                                {filteredCustomers.length}
                                            </span>{" "}
                                            customers
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {totalPages > 1 &&
                                            [...Array(Math.min(5, totalPages))].map((_, idx) => {
                                                let pageNum;

                                                if (totalPages <= 5) {
                                                    pageNum = idx + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = idx + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + idx;
                                                } else {
                                                    pageNum = currentPage - 2 + idx;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`px-3 py-2 text-sm font-medium rounded-lg ${currentPage === pageNum
                                                            ? "text-white bg-[#6366F1]"
                                                            : "text-gray-700 bg-white border"
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default CustomerDirectory;
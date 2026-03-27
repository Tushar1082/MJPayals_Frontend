import React, { useEffect, useState, useRef } from "react";
import { Search, Calendar, ChevronDown, RotateCcw, Eye, PencilLine } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

import SideBar from "../../../components/layout/SideBar/SideBar.jsx";
import {
    calculateItemAmount,
    roundTo,
    roundToInt
} from '../../../utils/helpers/billingHelper.js';
import { useKeyboardShortcuts } from "../../../hooks/useKeyboardShortcuts.js";
import ViewInvoices from "../../invoices/components/ViewInvoices.jsx";
import { B2BBillPDF } from "../../billing/components/B2BBillPDF.jsx";

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
            {/* <div className="flex items-center gap-3 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"> */}
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

const B2Btransactions = () => {
    const [invoices, setInvoices] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [cusFilter, setCusFilter] = useState(null);

    const [activeFilters, setActiveFilters] = useState({
        invoiceDateStart: null,
        invoiceDateEnd: null,
        customerDateStart: null,
        customerDateEnd: null,
        cusType: 'B',
    });

    const [showInvoice, setShowInvoice] = useState({
        show: false,
        cusType: 'B',
        invId: null,
        cusId: null,
        silverRate: 0
    });

    const [invoiceDateRange, setInvoiceDateRange] = useState({
        start: '2026-01-01',
        end: new Date().toISOString().split('T')[0]
    });

    const [customerDateRange, setCustomerDateRange] = useState({
        start: '2026-01-01',
        end: new Date().toISOString().split('T')[0]
    });

    const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
    const [showCustomerDatePicker, setShowCustomerDatePicker] = useState(false);
    const [invoiceDateEnabled, setInvoiceDateEnabled] = useState(false);
    const [customerDateEnabled, setCustomerDateEnabled] = useState(false);

    const observerRef = useRef(null);
    const invoiceDatePickerRef = useRef(null);   // ADD THIS
    const customerDatePickerRef = useRef(null);
    const navigate = useNavigate();
    const itemsPerLoad = 20;

    // useKeyboardShortcuts([
    //     { key: "n", altKey: true, callback: () => navigate("/") },
    //     { key: "i", altKey: true, callback: () => navigate("/customerInvoices") },
    //     { key: "b", altKey: true, callback: () => navigate("/b2bTransactions") },
    // ]);

    useKeyboardShortcuts([
        { key: "w", altKey: true, callback: () => navigate("/") },             // Wholesale
        { key: "r", altKey: true, callback: () => navigate("/retail") },       // Retail
        { key: "b", altKey: true, callback: () => navigate("/b2b") },          // B2B Bill
        { key: "i", altKey: true, callback: () => navigate("/customerInvoices") }, // Invoices
        { key: "t", altKey: true, callback: () => navigate("/b2bTransactions") },  // Transactions
    ]);

    const stringFLCMaker = (str) => {
        if (!str) return "";
        return str
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString)
            .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, "-");
    };

    const customerTypeFinder = (type) => {
        switch (type) {
            case "W":
                return "WholeSale";
            case "B":
                return "B2B";
            default:
                return "Retail";
        }
    };

    const handleCusFilter = (val) => {
        setCusFilter(val);
        setActiveFilters(prev => ({ ...prev, cusType: val }));
    };

    function handleCusInvoice(invId, cusType, cusId, silverRate) {
        if (!invId || !cusId || !cusType || !silverRate) {
            return;
        }

        setShowInvoice({ show: true, cusType: cusType, invId, cusId, silverRate });
    }

    function convertPolyArray(arr) {
        if (!Array.isArray(arr) || arr.length === 0) {
            return [{ count: 0, weight: 0 }];
        }

        return arr.map(item => ({
            count: item?.noOfPPs ?? 0,
            weight: item?.weightOfOpp ?? 0
        }));
    }

    // const getTotalPPWeight = (ppRows = []) => {
    //     return ppRows.reduce((sum, row) => {
    //         const count = Number(row.count || 0);
    //         const weight = Number(row.weight || 0);
    //         return sum + count * weight;
    //     }, 0);
    // };

    const totalInvAmount = () => {

    }

    const fetchInvoices = async (pageNum, resetData = false) => {
        try {
            setShowLoader(true);

            const params = new URLSearchParams({
                page: pageNum.toString(),
                pageSize: itemsPerLoad.toString(),
            });

            if (activeFilters.searchQuery) {
                params.append('searchQuery', activeFilters.searchQuery);
            }
            if (invoiceDateEnabled && activeFilters.invoiceDateStart) {
                params.append('invoiceDateStart', activeFilters.invoiceDateStart);
            }
            if (invoiceDateEnabled && activeFilters.invoiceDateEnd) {
                params.append('invoiceDateEnd', activeFilters.invoiceDateEnd);
            }
            if (customerDateEnabled && activeFilters.customerDateStart) {
                params.append('customerDateStart', activeFilters.customerDateStart);
            }
            if (customerDateEnabled && activeFilters.customerDateEnd) {
                params.append('customerDateEnd', activeFilters.customerDateEnd);
            }
            if (activeFilters.cusType) {
                params.append('cusType', activeFilters.cusType);
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/customer/invoices?${params}`
            );
            const result = await response.json();

            if (result.status === "success") {
                const newData = result.result.data;
                // console.log(newData);

                if (resetData) {
                    setInvoices(newData);
                } else {
                    setInvoices(prev => [...prev, ...newData]);
                }

                setHasMore(result.result.hasMore);
                setTotalCount(result.result.totalCount);
            }
        } catch (error) {
            console.log("Error fetching invoices:", error);
        } finally {
            setShowLoader(false);
        }
    };

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
                        itemType: item.itemType,
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
                        labourAmount: roundToInt(labourAmount),   // ✅ Integer
                        comment: item.comment
                    };
                });

                const isPExists = mappedItems.some((item) => item.itemType == "P");
                const isSExists = mappedItems.some((item) => item.itemType == "S");

                // console.log(mappedItems)
                const blob = await pdf(
                    <B2BBillPDF items={mappedItems} silverRate={silverRate} invoiceDate={invoiceDate} isPExists={isPExists} isSExists={isSExists} />
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

    // function getBillPDF(cusType, updatedItems, silverRate, invoiceDate) {
    //     const isPExists = updatedItems.some((item) => item.itemType == "R");

    //     switch (cusType) {
    //         case 'R':
    //             return <BillPDF items={updatedItems} silverRate={silverRate} isPExists={isPExists} invoiceDate={invoiceDate} />
    //         case 'W':
    //             return <WholeSalerBillPDFA items={updatedItems} silverRate={silverRate} invoiceDate={invoiceDate} isPExists={isPExists} />
    //         default:
    //             return <B2BBillPDF items={updatedItems} silverRate={silverRate} invoiceDate={invoiceDate} />
    //     }
    // }

    // Initial load and filter changes
    useEffect(() => {
        setPage(1);
        fetchInvoices(1, true);
    }, [activeFilters, invoiceDateEnabled, customerDateEnabled]);

    // Infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !showLoader) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchInvoices(nextPage, false);
            }
        });

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, showLoader, page]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (invoiceDatePickerRef.current && !invoiceDatePickerRef.current.contains(e.target)) {
                setShowInvoiceDatePicker(false);
            }
            if (customerDatePickerRef.current && !customerDatePickerRef.current.contains(e.target)) {
                setShowCustomerDatePicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInvoiceDateApply = () => {
        setInvoiceDateEnabled(true);
        setActiveFilters(prev => ({
            ...prev,
            invoiceDateStart: invoiceDateRange.start,
            invoiceDateEnd: invoiceDateRange.end
        }));
        setShowInvoiceDatePicker(false);
    };

    const handleCustomerDateApply = () => {
        setCustomerDateEnabled(true);
        setActiveFilters(prev => ({
            ...prev,
            customerDateStart: customerDateRange.start,
            customerDateEnd: customerDateRange.end
        }));
        setShowCustomerDatePicker(false);
    };

    const handleTextSearch = () => {
        setActiveFilters(prev => ({ ...prev, searchQuery }));
    };

    const handleReset = () => {
        setSearchQuery('');
        const defaultDateRange = { start: '2026-01-01', end: new Date().toISOString().split('T')[0] };
        setInvoiceDateRange(defaultDateRange);
        setCustomerDateRange(defaultDateRange);
        setInvoiceDateEnabled(false);
        setCustomerDateEnabled(false);
        setActiveFilters({
            searchQuery: '',
            invoiceDateStart: null,
            invoiceDateEnd: null,
            customerDateStart: null,
            customerDateEnd: null,
            cusType: 'B',
        });
        setInvoices([]); // Clear current invoices
        setPage(1); // Reset to page 1
        setHasMore(true); // Reset hasMore flag
    };

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
                />
            }

            <div className="p-5 pt-8 mb-2 mx-auto w-[80%]">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            B2B Transaction Directory
                        </h1>
                        <p className="text-gray-600">
                            View all B2B transactions in one place.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-[0_0_14px_-2px_#d3d3d3] flex items-center gap-4 mb-2 p-4 w-fit">
                        {/* Invoice Date Filter */}
                        <div ref={invoiceDatePickerRef} className="relative w-fit">
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
                                <div className="absolute -right-[9rem] top-14 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[280px]">
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
                        <div ref={customerDatePickerRef} className="relative w-fit">
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
                                <div className="absolute -right-[7.8rem] top-14 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[280px]">
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

                    {/* Search */}
                    <div className="bg-white flex items-center gap-2  rounded-lg shadow p-4 mb-6">
                        {/* <CustomerTypeDropdown cusFilter={cusFilter} setCusFilter={handleCusFilter} /> */}
                        {/* <GroupToggle /> */}

                        <div className="relative mb-0 flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by Invoice No, Name or Phone"
                                value={searchQuery}
                                onKeyDown={(e) => e.key === "Enter" ? handleTextSearch() : ""}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleTextSearch}
                                className="bg-[#6366F1] hover:bg-[#4B50C1] cursor-pointer transition-background duration-500 text-white pl-5 pr-8 py-3 font-medium flex items-center gap-3 rounded-lg text-md w-fit">
                                <Search className="w-5 h-5" />
                                Search
                            </button>
                            <button
                                onClick={handleReset}
                                className="bg-black/80 hover:bg-black/90 cursor-pointer transition-background duration-500 text-white pl-5 pr-8 py-3 font-medium flex items-center gap-3 rounded-lg text-md w-fit">
                                <RotateCcw className="w-5 h-5" />
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 bg-gray-100 border-b border-gray-200 font-semibold text-gray-600 uppercase text-sm">
                            <div className="w-4">S.No.</div>
                            <div className="">Invoice No.</div>
                            <div className="text-left">Customer Name</div>
                            {/* <div className="text-center">Type</div> */}
                            <div className="text-center">Mobile No.</div>
                            <div className="text-center">City</div>
                            <div className="text-center pl-4">Invoice Date</div>
                            <div className="text-center">Actions</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-200">
                            {invoices.length > 0 ? (
                                invoices.map((inv, idx) => (
                                    <div
                                        key={inv.invoiceNo}
                                        className="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 hover:bg-gray-100 cursor-pointer items-center transition"
                                    >
                                        <div className="text-center text-sm w-4">{idx + 1}.</div>
                                        <div className="font-semibold text-sm text-indigo-600">
                                            #{inv.invoiceNo}
                                        </div>
                                        <div className="font-medium text-sm text-gray-900">
                                            {stringFLCMaker(inv.customerName)}
                                        </div>
                                        {/* <div className="text-sm text-center">
                                            {customerTypeFinder(inv.cusType)}
                                        </div> */}
                                        <div className="text-sm text-center">
                                            {inv.phone || "-"}
                                        </div>
                                        <div className="text-sm text-center">{stringFLCMaker(inv.city) || "-"}</div>
                                        <div className="text-sm text-center">
                                            {formatDate(inv.invoiceDate)}
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => fetchInvoiceItems(inv.invoiceNo, inv.cusType, inv.silverRate, inv.invoiceDate)} className="bg-[#6366F1] text-sm flex items-center gap-2 whitespace-nowrap hover:bg-[#5c5fe3] rounded-lg p-2 px-3 text-white">
                                                <Eye size={20} />

                                            </button>
                                            <button
                                                onClick={() => handleCusInvoice(inv.invoiceNo, inv.cusType, inv.cusId, inv.silverRate)}
                                                className="bg-[#000000cc] text-sm flex items-center gap-2 whitespace-nowrap hover:bg-black rounded-lg p-2 px-3 text-white">
                                                <PencilLine size={20} />

                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    {showLoader ? "Loading..." : "No invoices found"}
                                </div>
                            )}
                        </div>

                        {/* Infinite Scroll Trigger */}
                        {hasMore && <div ref={observerRef} className="h-10"></div>}
                    </div>
                </div>
                <div className="text-center text-lg mt-8">
                    <h1 className="text-[#6366F1] font-semibold">DESIGN & DEVELOPED BY ATF LABS</h1>
                </div>
            </div>
        </div>
    );
};

export default B2Btransactions;
import React, { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Users, Eye, Search, Scale, UserPlus, ArrowLeftRight, Phone, Building2, FileText, Trash2, AlertCircle } from "lucide-react";
import SideBar from "../../../components/layout/SideBar/SideBar";
import { Link, useNavigate } from "react-router-dom";
import AddHisabDiaryCustomer from "./AddHisabDiaryCustomer";
import AddHisabDiaryTransaction from "./AddHisabDiaryTransaction";
import ConfirmDialog from "../../../components/ui/Modal/ConfirmDialog";


export default function HisabDiaryCustomers() {
    const [customers, setCustomers] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddCus, setShowAddCus] = useState(false);
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ show: false, customerId: null });
    const navigate = useNavigate();

    // Infinite Scroll States
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const itemsPerLoad = 20;

    const observerRef = useRef(null);

    const fetchCustomers = async (pageNum, resetData = false, query = "") => {
        try {
            setShowLoader(true);
            let url = `${import.meta.env.VITE_API_URL}/hisabDiary/customer?page=${pageNum}&pageSize=${itemsPerLoad}`;

            if (query && query.trim() !== "") {
                url += `&search=${encodeURIComponent(query.trim())}`;
            }

            const response = await fetch(url);
            const result = await response.json();

            if (result.status === "success") {
                const newData = result.data;

                if (resetData) {
                    setCustomers(newData);
                } else {
                    setCustomers(prev => [...prev, ...newData]);
                }

                const { currentPage, totalPages } = result.pagination;
                setHasMore(currentPage < totalPages);
            } else {
                toast.error("Failed to load customers.");
            }
        } catch (error) {
            console.error("Error fetching customers:", error);
            toast.error("Network error! Could not fetch data.");
        } finally {
            setShowLoader(false);
        }
    };

    const handleDeleteCustomer = async () => {
        if (!deleteModal.customerId) return;
        try {
            setShowLoader(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/customer/${deleteModal.customerId}`, { method: "DELETE" });

            if (response.ok) {
                toast.success("Customer deleted successfully");
                setDeleteModal({ show: false, customerId: null });

                // List ko refresh karne ke liye
                setPage(1);
                fetchCustomers(1, true, searchQuery);
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to delete customer");
            }
        } catch (error) {
            toast.error("Network error! Could not delete.");
        } finally {
            setShowLoader(false);
        }
    };

    // Initial Load
    useEffect(() => {
        setPage(1);
        fetchCustomers(1, true, searchQuery);
    }, []);

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !showLoader) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchCustomers(nextPage, false, searchQuery);
            }
        });

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, showLoader, page, searchQuery]);

    const handleSearch = () => {
        setPage(1);
        fetchCustomers(1, true, searchQuery);
    };

    // Weight formatter
    const formatWeight = (val) => {
        if (!val) return "0.00";
        return Number(val).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatCurrency = (val) => {
        if (!val) return "₹0.00";
        return Number(val).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleViewTransactions = (cusId) => {
        navigate(`/hisabDiary/transaction?cusId=${cusId}`);
    };

    // Refresh when Add Customer or Add Transaction modal closes
    useEffect(() => {
        if (!showAddCus && !showAddTransaction) {
            setPage(1);
            fetchCustomers(1, true, searchQuery);
        }
    }, [showAddCus, showAddTransaction]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Jab bhi user search box mein likhega, 1st page aur search text ke sath API call hogi
            setPage(1);
            fetchCustomers(1, true, searchQuery);
        }, 500); // 500ms delay taaki har ek alphabet par API hit na ho (Server bacha rahe)

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <SideBar showLoader={showLoader && customers.length === 0} />
            <AddHisabDiaryCustomer showAddCus={showAddCus} setShowAddCus={setShowAddCus} />
            <AddHisabDiaryTransaction showAddTransaction={showAddTransaction} setShowAddTransaction={setShowAddTransaction} />

            <div className="flex flex-col flex-1">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto">

                        {/* Header Section */}
                        <div className="mb-4">
                            <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-left">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                        Hisab Diary Dashboard
                                    </h1>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mt-4 shadow-[0_1px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] justify-between items-start sm:items-center p-[10px] sm:p-4 bg-white rounded-lg">
                                <div className="flex-1 w-full sm:w-auto">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-[10px] sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder="Search by name, phone or firm..."
                                            className="w-full pl-[1.9rem] placeholder:text-xs sm:placeholder:text-[16px] sm:pl-10 pr-4 py-1.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-stretch sm:items-center gap-1 sm:gap-3">
                                    <button
                                        onClick={() => setShowAddCus(true)}
                                        className="flex items-center justify-center gap-2 px-5 py-[10px] sm:py-3 text-xs sm:text-[16px] bg-[#6366F1] hover:bg-[#5d60e6] text-white rounded-lg focus:outline-none font-semibold transition-all"
                                    >
                                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span>Add Customer</span>
                                    </button>
                                    <button
                                        onClick={() => setShowAddTransaction(true)}
                                        className="flex items-center justify-center gap-2 px-5 py-[10px] sm:py-3 text-xs sm:text-[16px] bg-black hover:bg-black/80 text-white rounded-lg focus:outline-none font-semibold transition-all"
                                    >
                                        <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span>New Transaction</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Customers Table & Mobile Card View */}
                        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6 bg-transparent sm:bg-white sm:border-solid border-none">

                            {/* ================= MOBILE VIEW (CARDS) ================= */}
                            <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:hidden p-0 sm:p-4">
                                {customers.length > 0 ? (
                                    customers.map((cus) => {
                                        const TotalNaamSilver = cus.totalNaamSilver || 0;
                                        const TotalNaamCash = cus.totalNaamCash || 0;
                                        const TotalJamaSilver = cus.totalJamaSilver || 0;
                                        const TotalJamaCash = cus.totalJamaCash || 0;
                                        const balanceSilver = TotalNaamSilver - TotalJamaSilver;
                                        const balanceCash = TotalNaamCash - TotalJamaCash;

                                        return (
                                            <div key={cus.id} onClick={() => handleViewTransactions(cus.id)} className="bg-white rounded-xl border border-gray-200 shadow-sm pt-[10px] pb-[12px] px-4 sm:p-4 relative cursor-pointer active:scale-[0.98] transition-all">
                                                {/* Header: Name, Firm, Phone & Actions */}
                                                <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-0 sm:mb-3">
                                                    <div className="pr-2">
                                                        <span className="text-lg font-semibold text-gray-900 capitalize block leading-tight">{cus.name}</span>
                                                        <div className="flex items-center gap-1 mt-1.5">
                                                            {cus.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {cus.phone}</span>}
                                                            {cus.firmName && <span className="text-xs text-gray-500 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {cus.firmName}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <button onClick={(e) => { e.stopPropagation(); handleViewTransactions(cus.id); }} className="p-2 bg-[#6366F1] hover:bg-[#5c5fe3] text-white rounded-lg"><Eye className="w-4 h-4" /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ show: true, customerId: cus.id }); }} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </div>

                                                {/* Body: Naam, Jama, Balance Grid */}
                                                <div className="grid grid-cols-3 gap-2 mt-1">
                                                    <div className="text-center">
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Naam</div>
                                                        <div className="flex flex-col items-center">
                                                            {TotalNaamSilver > 0 && <span className="text-xs font-bold text-red-600">{formatWeight(TotalNaamSilver)}g</span>}
                                                            {TotalNaamCash > 0 && <span className="text-xs font-bold text-red-600">{formatCurrency(TotalNaamCash)}</span>}
                                                            {TotalNaamSilver === 0 && TotalNaamCash === 0 && <span className="text-xs font-bold text-gray-400">—</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-center border-l border-gray-100">
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Jama</div>
                                                        <div className="flex flex-col items-center">
                                                            {TotalJamaSilver > 0 && <span className="text-xs font-bold text-green-600">{formatWeight(TotalJamaSilver)}g</span>}
                                                            {TotalJamaCash > 0 && <span className="text-xs font-bold text-green-600">{formatCurrency(TotalJamaCash)}</span>}
                                                            {TotalJamaSilver === 0 && TotalJamaCash === 0 && <span className="text-xs font-bold text-gray-400">—</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-center border-l border-gray-100">
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Net Balance</div>
                                                        <div className="flex flex-col items-center">
                                                            {balanceSilver !== 0 && <span className={`text-xs font-bold ${balanceSilver > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatWeight(Math.abs(balanceSilver))}g</span>}
                                                            {balanceCash !== 0 && <span className={`text-xs font-bold ${balanceCash > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(Math.abs(balanceCash))}</span>}
                                                            {balanceSilver === 0 && balanceCash === 0 && <span className="text-xs font-bold text-gray-400">0.00</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    !showLoader && (
                                        <div className="py-12 bg-white rounded-xl border border-gray-200 text-center flex flex-col items-center justify-center">
                                            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                                                <Users className="w-7 h-7 text-indigo-400" />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900 mb-1">No customers found</h3>
                                            <p className="text-gray-500 text-xs px-4">You haven't added any customers yet.</p>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Customers Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">S.No.</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Info</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Naam</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Jama</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Net Balance</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {customers.length > 0 ? (
                                            customers.map((cus, idx) => {
                                                const TotalNaamSilver = cus.totalNaamSilver || 0;
                                                const TotalNaamCash = cus.totalNaamCash || 0;

                                                const TotalJamaSilver = cus.totalJamaSilver || 0;
                                                const TotalJamaCash = cus.totalJamaCash || 0;

                                                let balanceSilver = TotalNaamSilver - TotalJamaSilver;
                                                let balanceCash = TotalNaamCash - TotalJamaCash;

                                                // const balanceSilver = TotalNaamSilver - TotalJamaSilver;
                                                // const balanceCash = TotalNaamCash - TotalJamaCash;
                                                // const remainNaam = balanceSilver < 0; // They owe us (Dr)

                                                return (
                                                    <tr
                                                        key={cus.id}
                                                        onClick={() => handleViewTransactions(cus.id)}
                                                        className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                                                    >
                                                        <td className="pr-6 pl-8 py-4 ">{idx + 1}.</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-semibold text-gray-900 capitalize mb-1">
                                                                    {cus.name}
                                                                </span>
                                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                    {cus.firmName && (
                                                                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                                                                            <Building2 className="w-3 h-3" /> {cus.firmName}
                                                                        </span>
                                                                    )}
                                                                    <span className="flex items-center gap-1">
                                                                        <Phone className="w-3 h-3" /> {cus.phone || "N/A"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                            {TotalNaamSilver > 0 && TotalNaamCash > 0 ? (
                                                                // Condition 1: Dono exist karte hain (Silver + Cash)
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="text-sm font-bold text-red-600">
                                                                        {/* <span className="mr-1 text-xs opacity-80">Silver:</span> */}
                                                                        <span>{formatWeight(TotalNaamSilver)} g</span>
                                                                    </div>
                                                                    <div className="text-sm font-bold text-red-600">
                                                                        {/* <span className="mr-1 text-xs opacity-80">Cash:</span> */}
                                                                        <span>{formatCurrency(TotalNaamCash)}</span>
                                                                    </div>
                                                                </div>
                                                            ) : TotalNaamCash > 0 ? (
                                                                // Condition 2: Sirf Cash exist karta hai (Silver 0 hai)
                                                                <div className="text-sm font-bold text-red-600">
                                                                    {/* <span className="mr-1 text-xs opacity-80">Cash:</span> */}
                                                                    <span>{formatCurrency(TotalNaamCash)}</span>
                                                                </div>
                                                            ) : (
                                                                // Condition 3: Sirf Silver exist karta hai (ya dono 0 hain)
                                                                <div className="text-sm font-bold text-red-600">
                                                                    {formatWeight(TotalNaamSilver)} g
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                            {TotalJamaSilver > 0 && TotalJamaCash > 0 ? (
                                                                // Condition 1: Dono exist karte hain (Silver + Cash)
                                                                <div className="flex flex-col gap-1">
                                                                    <div className="text-sm font-bold text-green-600">
                                                                        {/* <span className="mr-1 text-xs opacity-80">Silver:</span> */}
                                                                        <span>{formatWeight(TotalJamaSilver)} g</span>
                                                                    </div>
                                                                    <div className="text-sm font-bold text-green-600">
                                                                        {/* <span className="mr-1 text-xs opacity-80">Cash:</span> */}
                                                                        <span>{formatCurrency(TotalJamaCash)}</span>
                                                                    </div>
                                                                </div>
                                                            ) : TotalJamaCash > 0 ? (
                                                                // Condition 2: Sirf Cash exist karta hai (Silver 0 hai)
                                                                <div className="text-sm font-bold text-green-600">
                                                                    {/* <span className="mr-1 text-xs opacity-80">Cash:</span> */}
                                                                    <span>{formatCurrency(TotalJamaCash)}</span>
                                                                </div>
                                                            ) : (
                                                                // Condition 3: Sirf Silver exist karta hai (ya dono 0 hain)
                                                                <div className="text-sm font-bold text-green-600">
                                                                    {formatWeight(TotalJamaSilver)} g
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                                            {balanceSilver !== 0 && balanceCash !== 0 ? (
                                                                // Condition 1: Dono exist karte hain (Silver + Cash)
                                                                <div className="flex flex-col gap-1">
                                                                    <div className={`text-sm font-bold ${balanceSilver > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                        {/* <span className="mr-1 text-xs opacity-80">Silver:</span> */}
                                                                        <span>{formatWeight(Math.abs(balanceSilver))} g</span>
                                                                    </div>
                                                                    <div className={`text-sm font-bold ${balanceCash > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                        {/* <span className="mr-1 text-xs opacity-80">Cash:</span> */}
                                                                        <span>{formatCurrency(Math.abs(balanceCash))}</span>
                                                                    </div>
                                                                </div>
                                                            ) : balanceCash !== 0 ? (
                                                                // Condition 2: Sirf Cash exist karta hai
                                                                <div className={`text-sm font-bold ${balanceCash > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                    {/* <span className="mr-1 text-xs opacity-80">Cash:</span> */}
                                                                    <span>{formatCurrency(Math.abs(balanceCash))}</span>
                                                                </div>
                                                            ) : (
                                                                // Condition 3: Sirf Silver exist karta hai (ya dono 0 hain default)
                                                                <div className={`text-sm font-bold ${balanceSilver > 0 ? 'text-red-600' : balanceSilver < 0 ? 'text-green-600' : 'text-slate-600'}`}>
                                                                    {formatWeight(Math.abs(balanceSilver))} g
                                                                </div>
                                                            )}

                                                        </td>

                                                        {/* <td className="px-6 py-4 flex justify-center">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewTransactions(cus.id);
                                                                }}
                                                                title="Action"
                                                                className="bg-[#6366F1] text-sm flex items-center gap-2 hover:bg-[#5c5fe3] rounded-lg p-2 px-3 text-white">
                                                                <Eye className="w-5 h-5" />

                                                            </button>
                                                        </td> */}
                                                        <td className="px-6 py-4 flex justify-center gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewTransactions(cus.id);
                                                                }}
                                                                title="View Transactions"
                                                                className="bg-[#6366F1] text-sm flex items-center gap-2 hover:bg-[#5c5fe3] rounded-lg p-2 px-3 text-white">
                                                                <Eye className="w-5 h-5" />
                                                            </button>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteModal({ show: true, customerId: cus.id });
                                                                }}
                                                                title="Delete Customer"
                                                                className="bg-red-600 hover:bg-red-700 text-sm flex items-center gap-2 rounded-lg p-2 px-3 text-white transition-colors"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            !showLoader && (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-16 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 border border-indigo-200">
                                                                <Users className="w-8 h-8 text-indigo-400" />
                                                            </div>
                                                            <h3 className="text-lg font-bold text-gray-900 mb-1">No customers found</h3>
                                                            <p className="text-gray-500 text-sm mb-4">
                                                                You haven't added any customers to your Hisab Diary yet.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </div>

                        {/* Infinite Scroll Loader */}
                        {hasMore && (
                            <div ref={observerRef} className="py-8 flex items-center justify-center">
                                {showLoader && customers.length > 0 && (
                                    <div className="flex items-center gap-3 text-sm text-indigo-600 font-semibold">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading more customers...
                                    </div>
                                )}
                            </div>
                        )}


                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-0 py-6">
                    <h1 className="text-[#6366F1] text-md sm:text-lg font-semibold uppercase">
                        Design & Developed by ATF Labs
                    </h1>
                </div>
            </div>

            <ConfirmDialog
                isOpen={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, customerId: null })}
                onConfirm={handleDeleteCustomer}
                title="Confirm Deletion"
                message="This will permanently delete the customer and all their associated transactions."
                confirmText={showLoader ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                variant="danger"
            />

            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        pointerEvents: "none", // does not interrupt loader
                    }
                }}
            />
        </div>
    );
}
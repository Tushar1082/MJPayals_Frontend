import React, { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
    ArrowLeft, FileText, Trash2, AlertCircle,
    Phone, Building2, X, ArrowLeftRight,
    PenLine, Plus, MessageCircle
} from "lucide-react";
import SideBar from "../../../components/layout/SideBar/SideBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddHisabDiaryTransaction from "./AddHisabDiaryTransaction";
import ConfirmDialog from "../../../components/ui/Modal/ConfirmDialog";

export default function HisabDiaryTransactions() {
    const [showLoader, setShowLoader] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [summary, setSummary] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isSendingWa, setIsSendingWa] = useState(false);
    const [commentModal, setCommentModal] = useState({ show: false, text: "" });

    // Modals State
    const [deleteModal, setDeleteModal] = useState({ show: false, transactionId: null });
    // const [commentModal, setCommentModal] = useState({ show: false, text: "" });
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [initialTransactionData, setInitialTransactionData] = useState(null);

    // Infinite Scroll States
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const itemsPerLoad = 20;
    const observerRef = useRef(null);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cusId = searchParams.get('cusId');

    // ================= DATA FETCHING =================
    useEffect(() => {
        if (cusId) {
            fetchCustomerInfo();
            setPage(1);
            fetchTransactions(1, true);
        }
    }, [cusId]);

    const handleQuickJama = (txn) => {
        setInitialTransactionData({
            transactionType: "J", // Jama auto-select hoga
            silverInGram: "",     // DANGEROUS: Isko khali chhod diya taaki double entry na ho
            cash: "",             // Isko bhi khali chhod diya
            comment: `Jama against Naam entry of ${new Date(txn.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
        });

        setShowAddTransaction(true);
    };

    const handleEdit = (txn) => {
        setInitialTransactionData({
            isEdit: true,           // Flag taaki Modal ko pata chale ye edit hai
            id: txn.id,             // ID bhejni zaroori hai update ke liye
            transactionType: txn.transactionType,
            silverInGram: txn.silverInGram || "",
            cash: txn.cash || "",
            comment: txn.comment || "",
            transactionDate: new Date(txn.transactionDate) // Purani date set karna
        });
        setShowAddTransaction(true);
    };

    const fetchCustomerInfo = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/customer/${cusId}`);
            const result = await response.json();
            if (result.status === "success") setCustomerInfo(result.data);
        } catch (error) {
            toast.error("Failed to load customer info");
        }
    };

    const fetchTransactions = async (pageNum, resetData = false) => {
        try {
            setShowLoader(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/transaction/customer/${cusId}?page=${pageNum}&pageSize=${itemsPerLoad}`);
            const result = await response.json();

            if (result.status === "success") {
                if (resetData) {
                    setTransactions(result.data);
                } else {
                    setTransactions(prev => [...prev, ...result.data]);
                }

                // Directly backend ka summary set karo
                if (result.summary) setSummary(result.summary);

                const { currentPage, totalPages, totalRecords: tr } = result.pagination;
                setTotalRecords(tr);
                setHasMore(currentPage < totalPages);
            } else {
                toast.error(result.message);
                if (resetData) setTimeout(() => navigate("/hisabDiary"), 1500);
            }
        } catch (error) {
            toast.error("Failed to load transactions");
        } finally {
            setShowLoader(false);
        }
    };

    const handleDeleteTransaction = async () => {
        if (!deleteModal.transactionId) return;
        try {
            setShowLoader(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/transaction/${deleteModal.transactionId}`, { method: "DELETE" });
            if (response.ok) {
                toast.success("Entry deleted successfully");
                setDeleteModal({ show: false, transactionId: null });
                setPage(1);
                fetchTransactions(1, true); // Refresh to update server-side balances
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setShowLoader(false);
        }
    };

    const handleSendWhatsApp = async () => {
        try {
            setIsSendingWa(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/transaction/customer/${cusId}/whatsapp`, {
                method: "POST"
            });
            const result = await response.json();

            if (response.ok && result.status === "success") {
                toast.success(result.message || "WhatsApp Report Sent!");
            } else {
                toast.error(result.message || "Failed to send WhatsApp");
            }
        } catch (error) {
            toast.error("Network error while sending WhatsApp");
        } finally {
            setIsSendingWa(false);
        }
    };

    // Trigger next page fetch on scroll
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !showLoader) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchTransactions(nextPage, false);
            }
        });

        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [hasMore, showLoader, page]);

    // Refresh when modal closes (in case a new transaction was added)
    useEffect(() => {
        if (!showAddTransaction && cusId) {
            setPage(1);
            fetchTransactions(1, true);
        }
    }, [showAddTransaction]);

    // ================= FORMATTERS =================
    const formatWeight = (val) => {
        if (!val) return "0.000";
        return Number(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const formatCurrency = (val) => {
        if (!val) return "₹0.00";
        return Number(val).toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <SideBar showLoader={showLoader && transactions.length === 0} />

            {/* Add Transaction Modal with Preselected Customer */}
            {/* <AddHisabDiaryTransaction
                showAddTransaction={showAddTransaction}
                setShowAddTransaction={setShowAddTransaction}
                preselectedCustomer={customerInfo} // Auto-select fix
            /> */}
            <AddHisabDiaryTransaction
                showAddTransaction={showAddTransaction}
                setShowAddTransaction={(val) => {
                    setShowAddTransaction(val);
                    if (!val) setInitialTransactionData(null);
                }}
                preselectedCustomer={customerInfo}
                initialData={initialTransactionData}
            />

            <div className="flex flex-col flex-1">
                <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-[1600px] mx-auto">

                        {/* Top Navigation & Actions */}
                        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <button
                                    onClick={() => navigate("/hisabDiary")}
                                    className="group flex items-center text-gray-500 hover:text-gray-900 transition-all text-sm font-medium mb-2"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                    Back
                                </button>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                                    Transaction History
                                </h1>
                            </div>
                            <div className="flex whitespace-nowrap sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                <button
                                    onClick={() => setShowAddTransaction(true)}
                                    className="flex text-xs sm:text-[16px] items-center justify-center gap-2 px-5 py-[9px] sm:py-3 bg-black hover:bg-black/80 text-white rounded-lg focus:outline-none font-semibold transition-all"
                                >
                                    <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="">New Transaction</span>
                                </button>

                                <button
                                    onClick={handleSendWhatsApp}
                                    disabled={isSendingWa}
                                    className="flex text-xs sm:text-[16px] items-center justify-center gap-2 px-5 py-[9px] sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg focus:outline-none font-semibold transition-all disabled:opacity-70"
                                    title="Send report to configured WhatsApp number"
                                >
                                    <svg className="w-5 sm:h-5" fill="white" width="25px" height="25px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" stroke=""><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M11.42 9.49c-.19-.09-1.1-.54-1.27-.61s-.29-.09-.42.1-.48.6-.59.73-.21.14-.4 0a5.13 5.13 0 0 1-1.49-.92 5.25 5.25 0 0 1-1-1.29c-.11-.18 0-.28.08-.38s.18-.21.28-.32a1.39 1.39 0 0 0 .18-.31.38.38 0 0 0 0-.33c0-.09-.42-1-.58-1.37s-.3-.32-.41-.32h-.4a.72.72 0 0 0-.5.23 2.1 2.1 0 0 0-.65 1.55A3.59 3.59 0 0 0 5 8.2 8.32 8.32 0 0 0 8.19 11c.44.19.78.3 1.05.39a2.53 2.53 0 0 0 1.17.07 1.93 1.93 0 0 0 1.26-.88 1.67 1.67 0 0 0 .11-.88c-.05-.07-.17-.12-.36-.21z"></path><path d="M13.29 2.68A7.36 7.36 0 0 0 8 .5a7.44 7.44 0 0 0-6.41 11.15l-1 3.85 3.94-1a7.4 7.4 0 0 0 3.55.9H8a7.44 7.44 0 0 0 5.29-12.72zM8 14.12a6.12 6.12 0 0 1-3.15-.87l-.22-.13-2.34.61.62-2.28-.14-.23a6.18 6.18 0 0 1 9.6-7.65 6.12 6.12 0 0 1 1.81 4.37A6.19 6.19 0 0 1 8 14.12z"></path></g></svg>
                                    <span className="whitespace-nowrap">{isSendingWa ? "Sending..." : "Send Report"}</span>
                                </button>

                            </div>
                            {/* <button
                                onClick={() => setShowAddTransaction(true)}
                                className="flex items-center justify-center gap-2 px-5 py-3 bg-black hover:bg-black/80 text-white rounded-lg focus:outline-none font-semibold transition-all"
                            >
                                <ArrowLeftRight className="w-5 h-5" />
                                <span>New Transaction</span>
                            </button> */}
                        </div>

                        {/* Customer Profile Header */}
                        {customerInfo && summary && (
                            <div className="bg-white rounded-xl shadow-[0_1px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] border border-gray-200 p-4 sm:px-6 py-4 mb-4 sm:mb-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8 items-center">
                                    <div className="lg:col-span-5 flex items-center gap-5">
                                        <div>
                                            <h2 className="text-2xl font-semibold sm:font-bold text-gray-900 capitalize leading-tight">
                                                {customerInfo.name}
                                            </h2>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-gray-500 text-sm">
                                                {customerInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {customerInfo.phone}</span>}
                                                {customerInfo.firmName && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {customerInfo.firmName}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                                        <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Net Balance</p>
                                            {summary.netSilver !== 0 && summary.netCash !== 0 ? (
                                                <div className="flex flex-col">
                                                    <div className={`text-sm font-bold ${summary.netSilver < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        <span className="mr-1 text-xs opacity-80">Silver:</span>{formatWeight(Math.abs(summary.netSilver))} g
                                                    </div>
                                                    <div className={`text-sm font-bold ${summary.netCash < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                        <span className="mr-1 text-xs opacity-80">Cash:</span>{formatCurrency(Math.abs(summary.netCash))}
                                                    </div>
                                                </div>
                                            ) : summary.netCash !== 0 ? (
                                                <div className={`text-lg font-bold ${summary.netCash < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {formatCurrency(Math.abs(summary.netCash))}
                                                </div>
                                            ) : (
                                                // <div className={`text-lg font-bold text-gray-700`}>
                                                //     0
                                                // </div>
                                                <div className={`text-lg font-bold ${summary.netSilver < 0 ? 'text-red-600' : summary.netSilver > 0 ? 'text-green-600' : 'text-gray-700'}`}>
                                                    {formatWeight(Math.abs(summary.netSilver))} g
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-green-50 border border-green-200">
                                            <p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-1">Total Jama</p>
                                            <div className="flex flex-col">
                                                {summary.totalJamaSilver > 0 && <span className="text-sm font-bold text-green-700">{formatWeight(summary.totalJamaSilver)} g</span>}
                                                {summary.totalJamaCash > 0 && <span className="text-sm font-bold text-green-700">{formatCurrency(summary.totalJamaCash)}</span>}
                                                {summary.totalJamaSilver === 0 && summary.totalJamaCash === 0 && <span className="text-sm font-bold text-green-700">0.000 g</span>}
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 col-span-2 md:col-span-1">
                                            <p className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-1">Total Naam</p>
                                            <div className="flex flex-col">
                                                {summary.totalNaamSilver > 0 && <span className="text-sm font-bold text-rose-700">{formatWeight(summary.totalNaamSilver)} g</span>}
                                                {summary.totalNaamCash > 0 && <span className="text-sm font-bold text-rose-700">{formatCurrency(summary.totalNaamCash)}</span>}
                                                {summary.totalNaamSilver === 0 && summary.totalNaamCash === 0 && <span className="text-sm font-bold text-rose-700">0.000 g</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Data Table */}
                        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6 bg-transparent md:bg-white md:border-solid border-none">                            {/* ================= MOBILE VIEW (CARDS) ================= */}
                            {/* ============== Mobile View ====================== */}
                            <div className="grid grid-cols-1 gap-2 sm:gap-4 md:hidden p-0 sm:p-4">
                                {transactions.length > 0 ? (
                                    transactions.map((txn) => {
                                        const isNaam = txn.transactionType === "N";
                                        const silver = Number(txn.silverInGram || 0);
                                        const cash = Number(txn.cash || 0);

                                        return (
                                            <div key={txn.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 relative">
                                                {/* Header: Date, Comment & Actions */}
                                                <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-3">
                                                    <div className="pr-3">
                                                        <div className="text-sm font-bold text-gray-800">
                                                            {new Date(txn.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </div>
                                                        {txn.comment ? (
                                                            <div
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCommentModal({ show: true, text: txn.comment });
                                                                }}
                                                                className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2 cursor-pointer hover:text-indigo-600 transition-colors"
                                                                title="Tap to read full comment"
                                                            >
                                                                {txn.comment}
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs text-gray-400 italic mt-1.5">No comment</div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {isNaam && (
                                                            <button onClick={() => handleQuickJama(txn)} className="p-1.5 bg-green-500 text-white hover:bg-green-600 rounded-md transition-colors"><Plus className="w-[20px] h-[20px]" /></button>
                                                        )}
                                                        <button onClick={() => handleEdit(txn)} className="p-1.5 bg-[#000000cc] text-white hover:bg-black rounded-md transition-colors"><PenLine className="w-[20px] h-[20px]" /></button>
                                                        <button onClick={() => setDeleteModal({ show: true, transactionId: txn.id })} className="p-1.5 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"><Trash2 className="w-[20px] h-[20px]" /></button>
                                                    </div>
                                                </div>

                                                {/* Body: Naam & Jama Grid */}
                                                <div className="grid grid-cols-2 gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Naam</div>
                                                        {isNaam ? (
                                                            <div className="flex flex-col gap-0">
                                                                {silver > 0 && <span className="text-sm font-bold text-red-600">{formatWeight(silver)} g</span>}
                                                                {cash > 0 && <span className="text-sm font-bold text-red-600">{formatCurrency(cash)}</span>}
                                                            </div>
                                                        ) : <span className="text-gray-300 font-bold">—</span>}
                                                    </div>
                                                    <div className="text-right border-l border-gray-400 pl-3">
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Jama</div>
                                                        {!isNaam ? (
                                                            <div className="flex flex-col items-end gap-0">
                                                                {silver > 0 && <span className="text-sm font-bold text-green-600">{formatWeight(silver)} g</span>}
                                                                {cash > 0 && <span className="text-sm font-bold text-green-600">{formatCurrency(cash)}</span>}
                                                            </div>
                                                        ) : <span className="text-gray-300 font-bold">—</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    !showLoader && (
                                        <div className="py-12 bg-white rounded-xl border border-gray-200 text-center flex flex-col items-center justify-center">
                                            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                                                <FileText className="w-7 h-7 text-indigo-400" />
                                            </div>
                                            <h3 className="text-base font-bold text-gray-900 mb-1">No entries found</h3>
                                            <p className="text-gray-500 text-xs px-4">Start by adding a transaction for this customer.</p>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* ================= DESKTOP VIEW (TABLE) ================= */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            {/* <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">S.No.</th> */}
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="w-full px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Comment</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Naam</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Jama</th>
                                            {/* <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Running Balance</th> */}
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {transactions.map((txn, idx) => {
                                            const isNaam = txn.transactionType === "N";
                                            const silver = Number(txn.silverInGram || 0);
                                            const cash = Number(txn.cash || 0);
                                            const runSilver = Number(txn.runningSilver || 0);
                                            const runCash = Number(txn.runningCash || 0);

                                            // S.No Formula (Since we display latest first)
                                            // const serialNumber = totalRecords - idx;

                                            return (
                                                <tr key={txn.id} className="transition-colors group">
                                                    {/* <td className="pr-6 pl-8 py-4 text-sm text-gray-500 font-medium">
                                                        {serialNumber}.
                                                    </td> */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-700">
                                                            {new Date(txn.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </div>
                                                    </td>

                                                    {/* Comment Column */}
                                                    <td className="px-6 py-4 max-w-[200px]">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {txn.comment ? (
                                                                <div className="leading-snug">
                                                                    {txn.comment}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400 italic">No comment</span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Naam Column */}
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        {isNaam ? (
                                                            <div className="flex flex-col items-end gap-1">
                                                                {silver > 0 && <div className="text-sm font-bold text-red-600">{formatWeight(silver)} g</div>}
                                                                {cash > 0 && <div className="text-sm font-bold text-red-600">{formatCurrency(cash)}</div>}
                                                            </div>
                                                        ) : <span className="text-gray-300 font-bold">—</span>}
                                                    </td>

                                                    {/* Jama Column */}
                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        {!isNaam ? (
                                                            <div className="flex flex-col items-end gap-1">
                                                                {silver > 0 && <div className="text-sm font-bold text-green-600">{formatWeight(silver)} g</div>}
                                                                {cash > 0 && <div className="text-sm font-bold text-green-600">{formatCurrency(cash)}</div>}
                                                            </div>
                                                        ) : <span className="text-gray-300 font-bold">—</span>}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 flex items-center gap-2">

                                                        {/* NEW PLUS BUTTON - Sirf Naam entries par dikhega */}
                                                        {isNaam && (
                                                            <button
                                                                onClick={() => handleQuickJama(txn)}
                                                                className="bg-green-500 hover:bg-green-600 transition-colors duration-300 text-white p-2 px-3 font-semibold rounded-lg shadow-sm"
                                                                title="Add Jama (Repayment)"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => handleEdit(txn)}
                                                            className="bg-[#000000cc] text-sm flex items-center gap-2 whitespace-nowrap hover:bg-black rounded-lg p-2 px-3 text-white"
                                                            title="Edit Entry"
                                                        >
                                                            <PenLine className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            onClick={() => setDeleteModal({ show: true, transactionId: txn.id })}
                                                            className="bg-red-600 hover:bg-red-700 transition-colors duration-300 text-white p-2 px-3 font-semibold rounded-lg shadow-sm"
                                                            title="Delete Entry"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                    {/* <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                                                        <button class="bg-[#000000cc] text-sm flex items-center gap-2 whitespace-nowrap hover:bg-black rounded-lg p-2 px-3 text-white">
                                                            <PenLine className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteModal({ show: true, transactionId: txn.id })}
                                                            className="bg-red-600 hover:bg-red-700 transition-colors duration-300 text-white p-2 px-3 font-semibold rounded-lg shadow-sm"
                                                            title="Delete Entry"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td> */}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Empty State */}
                                {transactions.length === 0 && !showLoader && (
                                    <div className="py-20 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 border border-indigo-200">
                                            <FileText className="w-8 h-8 text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">No entries found</h3>
                                        <p className="text-gray-500 text-sm">Start by adding a transaction for this customer.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Server-side Infinite Scroll Loader Indicator */}
                        {hasMore && (
                            <div ref={observerRef} className="py-6 flex items-center justify-center">
                                {transactions.length > 0 && (
                                    <div className="flex items-center gap-3 text-sm text-indigo-600 font-semibold">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading more transactions...
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 py-6">
                    <h1 className="text-[#6366F1] text-md sm:text-lg font-semibold uppercase">
                        Design & Developed by ATF Labs
                    </h1>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, transactionId: null })}
                onConfirm={handleDeleteTransaction}
                title="Confirm Deletion"
                message="This will permanently remove the record."
                confirmText={showLoader ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                variant="danger"
            />

            {commentModal.show && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[110] p-4"
                    onClick={() => setCommentModal({ show: false, text: "" })}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-0 border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-0 border-b border-gray-100 py-2 px-4">
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-500" />
                                Comment Note
                            </h3>
                            <button
                                onClick={() => setCommentModal({ show: false, text: "" })}
                                className="text-white bg-red-400 hover:bg-red-500 p-1.5 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto py-2 px-4 pb-4">
                            {commentModal.text}
                        </div>
                    </div>
                </div>
            )}

            <Toaster position="top-right" toastOptions={{ style: { pointerEvents: "none", fontWeight: '600' } }} />
        </div>
    );
}
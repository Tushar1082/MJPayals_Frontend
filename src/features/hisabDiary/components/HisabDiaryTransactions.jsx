import React, { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
    ArrowLeft, FileText, Trash2, AlertCircle,
    Phone, Building2, X, ArrowLeftRight
} from "lucide-react";
import SideBar from "../../../components/layout/SideBar/SideBar";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddHisabDiaryTransaction from "./AddHisabDiaryTransaction";

export default function HisabDiaryTransactions() {
    const [showLoader, setShowLoader] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [summary, setSummary] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);

    // Modals State
    const [deleteModal, setDeleteModal] = useState({ show: false, transactionId: null });
    const [commentModal, setCommentModal] = useState({ show: false, text: "" });
    const [showAddTransaction, setShowAddTransaction] = useState(false);

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
        return Number(val).toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
    };

    const formatCurrency = (val) => {
        if (!val) return "₹0.00";
        return Number(val).toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <SideBar showLoader={showLoader && transactions.length === 0} />

            {/* Add Transaction Modal with Preselected Customer */}
            <AddHisabDiaryTransaction
                showAddTransaction={showAddTransaction}
                setShowAddTransaction={setShowAddTransaction}
                preselectedCustomer={customerInfo} // Auto-select fix
            />

            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-[1600px] mx-auto">

                    {/* Top Navigation & Actions */}
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <button
                                onClick={() => navigate("/hisabDiary")}
                                className="group flex items-center text-gray-500 hover:text-gray-900 transition-all text-sm font-medium mb-2"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back
                            </button>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Transaction History
                            </h1>
                        </div>
                        <button
                            onClick={() => setShowAddTransaction(true)}
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-black hover:bg-black/80 text-white rounded-lg focus:outline-none font-semibold transition-all shadow-md"
                        >
                            <ArrowLeftRight className="w-5 h-5" />
                            <span>New Transaction</span>
                        </button>
                    </div>

                    {/* Customer Profile Header */}
                    {customerInfo && summary && (
                        <div className="bg-white rounded-xl shadow-[0_1px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] border border-gray-200 px-6 py-4 mb-6">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                <div className="lg:col-span-5 flex items-center gap-5">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 capitalize leading-tight">
                                            {customerInfo.name}
                                        </h2>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-gray-500 text-sm">
                                            {customerInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {customerInfo.phone}</span>}
                                            {customerInfo.firmName && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {customerInfo.firmName}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200">
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Net Balance</p>
                                        {summary.netSilver !== 0 && summary.netCash !== 0 ? (
                                            <div className="flex flex-col">
                                                <div className={`text-sm font-bold ${summary.netSilver < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    <span className="mr-1 text-xs opacity-80">Silver:</span>{formatWeight(Math.abs(summary.netSilver))} g
                                                </div>
                                                <div className={`text-sm font-bold ${summary.netCash < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                    <span className="mr-1 text-xs opacity-80">Cash:</span>{formatCurrency(Math.abs(summary.netCash))}
                                                </div>
                                            </div>
                                        ) : summary.netCash !== 0 ? (
                                            <div className={`text-lg font-bold ${summary.netCash < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                {formatCurrency(Math.abs(summary.netCash))}
                                            </div>
                                        ) : (
                                            <div className={`text-lg font-bold text-gray-700`}>
                                                0
                                            </div>
                                            // <div className={`text-lg font-bold ${summary.netSilver < 0 ? 'text-red-600' : summary.netSilver > 0 ? 'text-emerald-600' : 'text-gray-700'}`}>
                                            //     {formatWeight(Math.abs(summary.netSilver))} g
                                            // </div>
                                        )}
                                    </div>
                                    <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                                        <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Jama</p>
                                        <div className="flex flex-col">
                                            {summary.totalJamaSilver > 0 && <span className="text-sm font-bold text-emerald-700">{formatWeight(summary.totalJamaSilver)} g</span>}
                                            {summary.totalJamaCash > 0 && <span className="text-sm font-bold text-emerald-700">{formatCurrency(summary.totalJamaCash)}</span>}
                                            {summary.totalJamaSilver === 0 && summary.totalJamaCash === 0 && <span className="text-sm font-bold text-emerald-700">0.000 g</span>}
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
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        {/* <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">S.No.</th> */}
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-48">Comment</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Naam</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Jama</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Running Balance</th>
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
                                            <tr key={txn.id} className="hover:bg-indigo-50/30 transition-colors group">
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
                                                    <div
                                                        className={`text-sm font-medium text-gray-900 ${txn.comment ? 'cursor-pointer hover:text-indigo-600' : ''}`}
                                                        onClick={() => txn.comment && setCommentModal({ show: true, text: txn.comment })}
                                                        title={txn.comment ? "Click to read full comment" : ""}
                                                    >
                                                        {txn.comment ? (
                                                            <div className="line-clamp-2 leading-snug">
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
                                                            {cash > 0 && <div className="text-sm font-bold text-red-500">{formatCurrency(cash)}</div>}
                                                        </div>
                                                    ) : <span className="text-gray-300 font-bold">—</span>}
                                                </td>

                                                {/* Jama Column */}
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    {!isNaam ? (
                                                        <div className="flex flex-col items-end gap-1">
                                                            {silver > 0 && <div className="text-sm font-bold text-emerald-600">{formatWeight(silver)} g</div>}
                                                            {cash > 0 && <div className="text-sm font-bold text-emerald-500">{formatCurrency(cash)}</div>}
                                                        </div>
                                                    ) : <span className="text-gray-300 font-bold">—</span>}
                                                </td>

                                                {/* Running Balance Column (Backend Provided) */}
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex flex-col items-end gap-1">
                                                        {runSilver !== 0 && runCash !== 0 ? (
                                                            <>
                                                                <div className={`text-sm font-bold ${runSilver < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatWeight(Math.abs(runSilver))} g</div>
                                                                <div className={`text-xs font-bold ${runCash < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(Math.abs(runCash))}</div>
                                                            </>
                                                        ) : runCash !== 0 ? (
                                                            <div className={`text-sm font-bold ${runCash < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(Math.abs(runCash))}</div>
                                                        ) : (
                                                            // <div className={`text-sm font-bold ${runSilver < 0 ? 'text-red-600' : runSilver > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>{formatWeight(Math.abs(runSilver))} g</div>
                                                            <div className={`text-sm font-bold text-gray-600`}>0</div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Delete Action */}
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => setDeleteModal({ show: true, transactionId: txn.id })}
                                                        className="bg-red-600 hover:bg-red-700 transition-colors duration-300 text-white p-2 px-3 font-semibold rounded-lg mx-auto flex items-center justify-center shadow-sm"
                                                        title="Delete Entry"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
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

                    <div className="text-center mt-8 py-6">
                        <h1 className="text-[#6366F1] text-lg font-semibold uppercase">
                            Design & Developed by ATF Labs
                        </h1>
                    </div>
                </div>
            </div>

            {/* Read Full Comment Modal */}
            {commentModal.show && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                Full Comment
                            </h3>
                            <button
                                onClick={() => setCommentModal({ show: false, text: "" })}
                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm font-medium">
                                {commentModal.text}
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-right">
                            <button
                                onClick={() => setCommentModal({ show: false, text: "" })}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4 border border-red-100">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                            <p className="text-sm text-gray-500 mt-1">This will permanently remove the record and recalculate running balances.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, transactionId: null })}
                                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTransaction}
                                disabled={showLoader}
                                className="px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50 flex justify-center items-center"
                            >
                                {showLoader ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <Toaster position="top-right" toastOptions={{ style: { pointerEvents: "none", fontWeight: '600' } }} />
        </div>
    );
}
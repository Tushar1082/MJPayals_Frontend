// import React, { useState, useEffect } from "react";
// import { toast, Toaster } from "react-hot-toast";
// import { ArrowLeft, TrendingDown, TrendingUp, Calendar, IndianRupee, FileText, Trash2, AlertCircle, Scale, User, Phone, Building2 } from "lucide-react";
// import SideBar from "../../../components/layout/SideBar/SideBar";
// import { useNavigate, useSearchParams } from "react-router-dom";

// export default function HisabDiaryTransactions() {
//     const [showLoader, setShowLoader] = useState(false);
//     const [transactions, setTransactions] = useState([]);
//     const [customerInfo, setCustomerInfo] = useState(null);
//     const [deleteModal, setDeleteModal] = useState({ show: false, transactionId: null });
//     const [transactionsWithBalance, setTransactionsWithBalance] = useState([]);
//     const navigate = useNavigate();
//     const [searchParams] = useSearchParams();
//     const cusId = searchParams.get('cusId');

//     // Fetch customer info and transactions
//     useEffect(() => {
//         if (cusId) {
//             fetchCustomerInfo();
//             fetchTransactions();
//         }
//     }, [cusId]);

//     const fetchCustomerInfo = async () => {
//         try {
//             const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/customer/${cusId}`);
//             const result = await response.json();
//             if (result.status === "success") {
//                 setCustomerInfo(result.data);
//             }
//         } catch (error) {
//             console.error("Error fetching customer info:", error);
//             toast.error("Failed to load customer information");
//         }
//     };

//     const fetchTransactions = async () => {
//         try {
//             setShowLoader(true);
//             const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/transaction/customer/${cusId}`);
//             const result = await response.json();
            
//             if (result.status === "success") {
//                 setTransactions(result.data);
//             } else if (result.status === "error") {
//                 toast.error(result.message);
//                 setTimeout(() => navigate("/hisabDiary"), 1500);
//             }
//         } catch (error) {
//             console.error("Error fetching transactions:", error);
//             toast.error("Failed to load transactions");
//         } finally {
//             setShowLoader(false);
//         }
//     };

//     const handleDeleteTransaction = async () => {
//         if (!deleteModal.transactionId) return;

//         try {
//             setShowLoader(true);
//             const response = await fetch(
//                 `${import.meta.env.VITE_API_URL}/hisabDiary/transaction/${deleteModal.transactionId}`,
//                 { method: "DELETE" }
//             );

//             const result = await response.json();

//             if (result.status === "success" || response.ok) {
//                 toast.success("Transaction deleted successfully!");
//                 setDeleteModal({ show: false, transactionId: null });
//                 fetchTransactions();
//             } else {
//                 toast.error(result.message || "Failed to delete transaction");
//             }
//         } catch (error) {
//             console.error("Error deleting transaction:", error);
//             toast.error("Network error! Could not delete transaction.");
//         } finally {
//             setShowLoader(false);
//         }
//     };

//     const formatDate = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleDateString('en-IN', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric'
//         });
//     };

//     const formatWeight = (val) => {
//         if (!val) return "0.000";
//         return Number(val).toLocaleString("en-IN", {
//             minimumFractionDigits: 3,
//             maximumFractionDigits: 3
//         });
//     };

//     const formatCurrency = (val) => {
//         if (!val) return "0.00";
//         return Number(val).toLocaleString("en-IN", {
//             minimumFractionDigits: 2,
//             maximumFractionDigits: 2
//         });
//     };

//     // Calculate running balance for ladder view
//     // const transactionsWithBalance = transactions.map((txn, index) => {
//     //     const previousBalance = index === 0 ? 0 : transactionsWithBalance[index - 1].runningBalance;
//     //     const currentAmount = txn.transactionType === "J" ? txn.silverInGram : -txn.silverInGram;
//     //     const runningBalance = previousBalance + currentAmount;
        
//     //     return {
//     //         ...txn,
//     //         runningBalance
//     //     };
//     // });

//     // Calculate totals
//     const totalNaam = transactions
//         .filter(t => t.transactionType === "N")
//         .reduce((sum, t) => sum + t.silverInGram, 0);
    
//     const totalJama = transactions
//         .filter(t => t.transactionType === "J")
//         .reduce((sum, t) => sum + t.silverInGram, 0);
    
//     const finalBalance = totalJama - totalNaam;

//     // Calculate running balance using useEffect
// useEffect(() => {
//     let currentRunningBalance = 0;
    
//     const calculatedTransactions = transactions.map((txn) => {
//         // Jama hai toh plus, Naam hai toh minus
//         const currentAmount = txn.transactionType === "J" ? txn.silverInGram : -txn.silverInGram;
//         currentRunningBalance += currentAmount;
        
//         return {
//             ...txn,
//             runningBalance: currentRunningBalance
//         };
//     });

//     setTransactionsWithBalance(calculatedTransactions);
// }, [transactions]); // Jab bhi transactions update honge, ye khud chal jayega

//     return (
//         <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
//             <SideBar showLoader={showLoader && transactions.length === 0} />
            
//             <div className="flex-1 p-4 sm:p-6 lg:p-8">
//                 <div className="max-w-7xl mx-auto">
                    
//                     {/* Header */}
//                     <div className="mb-6 sm:mb-8">
//                         <button 
//                             onClick={() => navigate("/hisabDiary")}
//                             className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4 group"
//                         >
//                             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
//                             <span className="font-semibold">Back to Dashboard</span>
//                         </button>
                        
//                         {customerInfo && (
//                             <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
//                                 <div className="flex items-start justify-between flex-wrap gap-4">
//                                     <div className="flex-1 min-w-0">
//                                         <div className="flex items-center gap-3 mb-3">
//                                             <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
//                                                 <User className="w-6 h-6 text-white" />
//                                             </div>
//                                             <div>
//                                                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 capitalize">
//                                                     {customerInfo.name}
//                                                 </h1>
//                                                 <p className="text-sm text-gray-600">Customer Ledger</p>
//                                             </div>
//                                         </div>
                                        
//                                         <div className="flex flex-wrap gap-4 text-sm">
//                                             {customerInfo.phone && (
//                                                 <div className="flex items-center gap-2 text-gray-700">
//                                                     <Phone className="w-4 h-4 text-gray-400" />
//                                                     <span className="font-medium">{customerInfo.phone}</span>
//                                                 </div>
//                                             )}
//                                             {customerInfo.firmName && (
//                                                 <div className="flex items-center gap-2 text-gray-700">
//                                                     <Building2 className="w-4 h-4 text-gray-400" />
//                                                     <span className="font-medium">{customerInfo.firmName}</span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Summary Cards */}
//                                     <div className="flex flex-wrap gap-3">
//                                         <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200 min-w-[140px]">
//                                             <div className="text-xs font-bold text-red-600 uppercase mb-1">Total Naam</div>
//                                             <div className="text-xl font-black text-red-700">
//                                                 {formatWeight(totalNaam)} <span className="text-xs">g</span>
//                                             </div>
//                                         </div>
                                        
//                                         <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200 min-w-[140px]">
//                                             <div className="text-xs font-bold text-emerald-600 uppercase mb-1">Total Jama</div>
//                                             <div className="text-xl font-black text-emerald-700">
//                                                 {formatWeight(totalJama)} <span className="text-xs">g</span>
//                                             </div>
//                                         </div>
                                        
//                                         <div className={`rounded-xl p-4 border-2 min-w-[140px] ${
//                                             finalBalance < 0 
//                                                 ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200' 
//                                                 : finalBalance > 0
//                                                 ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
//                                                 : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
//                                         }`}>
//                                             <div className="text-xs font-bold text-gray-700 uppercase mb-1">Net Balance</div>
//                                             <div className={`text-xl font-black ${
//                                                 finalBalance < 0 ? 'text-orange-700' : finalBalance > 0 ? 'text-blue-700' : 'text-gray-700'
//                                             }`}>
//                                                 {formatWeight(Math.abs(finalBalance))} <span className="text-xs">g</span>
//                                                 {finalBalance !== 0 && (
//                                                     <span className="text-xs ml-1">
//                                                         {finalBalance < 0 ? '(Dr)' : '(Cr)'}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Ledger - Ladder Style */}
//                     <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden">
//                         <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 sm:px-8 py-5 text-white">
//                             <div className="flex items-center justify-between">
//                                 <h2 className="text-xl font-bold flex items-center gap-2">
//                                     <Scale className="w-6 h-6" />
//                                     Transaction Ledger
//                                 </h2>
//                                 <div className="text-sm font-semibold">
//                                     {transactions.length} {transactions.length === 1 ? 'Entry' : 'Entries'}
//                                 </div>
//                             </div>
//                         </div>

//                         {transactions.length > 0 ? (
//                             <div className="divide-y divide-gray-200">
//                                 {transactionsWithBalance.map((txn, index) => {
//                                     const isNaam = txn.transactionType === "N";
//                                     const balanceIsNegative = txn.runningBalance < 0;
                                    
//                                     return (
//                                         <div
//                                             key={txn.id}
//                                             className="hover:bg-slate-50 transition-colors"
//                                         >
//                                             {/* Desktop View */}
//                                             <div className="hidden lg:grid grid-cols-[120px_1fr_140px_140px_140px_60px] gap-4 items-center p-6">
//                                                 {/* Date */}
//                                                 <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
//                                                     <Calendar className="w-4 h-4 text-gray-400" />
//                                                     <span>{formatDate(txn.transactionDate)}</span>
//                                                 </div>

//                                                 {/* Transaction Type & Comment */}
//                                                 <div>
//                                                     <div className="flex items-center gap-2 mb-1">
//                                                         {isNaam ? (
//                                                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200">
//                                                                 <TrendingDown className="w-3.5 h-3.5" />
//                                                                 Naam
//                                                             </span>
//                                                         ) : (
//                                                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
//                                                                 <TrendingUp className="w-3.5 h-3.5" />
//                                                                 Jama
//                                                             </span>
//                                                         )}
//                                                         <span className="text-sm font-bold text-gray-900">
//                                                             {formatWeight(txn.silverInGram)} g
//                                                         </span>
//                                                     </div>
//                                                     {txn.comment && (
//                                                         <div className="flex items-start gap-1.5 mt-1">
//                                                             <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
//                                                             <span className="text-xs text-gray-600 line-clamp-1">{txn.comment}</span>
//                                                         </div>
//                                                     )}
//                                                 </div>

//                                                 {/* Naam Column */}
//                                                 <div className="text-right">
//                                                     {isNaam && (
//                                                         <div className="inline-flex flex-col items-end gap-1">
//                                                             <span className="text-base font-bold text-red-700">
//                                                                 {formatWeight(txn.silverInGram)} g
//                                                             </span>
//                                                             <span className="text-xs text-red-600">
//                                                                 ₹ {formatCurrency(txn.cash)}
//                                                             </span>
//                                                         </div>
//                                                     )}
//                                                 </div>

//                                                 {/* Jama Column */}
//                                                 <div className="text-right">
//                                                     {!isNaam && (
//                                                         <div className="inline-flex flex-col items-end gap-1">
//                                                             <span className="text-base font-bold text-emerald-700">
//                                                                 {formatWeight(txn.silverInGram)} g
//                                                             </span>
//                                                             <span className="text-xs text-emerald-600">
//                                                                 ₹ {formatCurrency(txn.cash)}
//                                                             </span>
//                                                         </div>
//                                                     )}
//                                                 </div>

//                                                 {/* Running Balance */}
//                                                 <div className="text-right">
//                                                     <div className={`inline-flex flex-col items-end px-3 py-2 rounded-lg ${
//                                                         balanceIsNegative 
//                                                             ? 'bg-orange-50 border border-orange-200' 
//                                                             : txn.runningBalance > 0
//                                                             ? 'bg-blue-50 border border-blue-200'
//                                                             : 'bg-gray-50 border border-gray-200'
//                                                     }`}>
//                                                         <span className={`text-sm font-black ${
//                                                             balanceIsNegative ? 'text-orange-700' : txn.runningBalance > 0 ? 'text-blue-700' : 'text-gray-700'
//                                                         }`}>
//                                                             {formatWeight(Math.abs(txn.runningBalance))} g
//                                                         </span>
//                                                         {txn.runningBalance !== 0 && (
//                                                             <span className="text-[10px] font-bold text-gray-600">
//                                                                 {balanceIsNegative ? 'Dr' : 'Cr'}
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </div>

//                                                 {/* Delete */}
//                                                 <div className="text-center">
//                                                     <button
//                                                         onClick={() => setDeleteModal({ show: true, transactionId: txn.id })}
//                                                         className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//                                                         title="Delete"
//                                                     >
//                                                         <Trash2 className="w-4 h-4" />
//                                                     </button>
//                                                 </div>
//                                             </div>

//                                             {/* Mobile View */}
//                                             <div className="lg:hidden p-5 space-y-3">
//                                                 <div className="flex items-center justify-between">
//                                                     <div className="flex items-center gap-2 text-sm text-gray-600">
//                                                         <Calendar className="w-4 h-4" />
//                                                         {formatDate(txn.transactionDate)}
//                                                     </div>
//                                                     <button
//                                                         onClick={() => setDeleteModal({ show: true, transactionId: txn.id })}
//                                                         className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
//                                                     >
//                                                         <Trash2 className="w-4 h-4" />
//                                                     </button>
//                                                 </div>

//                                                 <div className="flex items-center gap-2">
//                                                     {isNaam ? (
//                                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg">
//                                                             <TrendingDown className="w-3.5 h-3.5" />
//                                                             Naam
//                                                         </span>
//                                                     ) : (
//                                                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">
//                                                             <TrendingUp className="w-3.5 h-3.5" />
//                                                             Jama
//                                                         </span>
//                                                     )}
//                                                     <span className="font-bold text-gray-900">
//                                                         {formatWeight(txn.silverInGram)} g
//                                                     </span>
//                                                     <span className="text-sm text-gray-600">
//                                                         • ₹ {formatCurrency(txn.cash)}
//                                                     </span>
//                                                 </div>

//                                                 <div className={`p-3 rounded-lg ${
//                                                     balanceIsNegative ? 'bg-orange-50' : txn.runningBalance > 0 ? 'bg-blue-50' : 'bg-gray-50'
//                                                 }`}>
//                                                     <div className="text-xs text-gray-600 mb-1">Running Balance:</div>
//                                                     <div className={`text-base font-black ${
//                                                         balanceIsNegative ? 'text-orange-700' : txn.runningBalance > 0 ? 'text-blue-700' : 'text-gray-700'
//                                                     }`}>
//                                                         {formatWeight(Math.abs(txn.runningBalance))} g
//                                                         {txn.runningBalance !== 0 && (
//                                                             <span className="text-xs ml-1">
//                                                                 ({balanceIsNegative ? 'Dr' : 'Cr'})
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </div>

//                                                 {txn.comment && (
//                                                     <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
//                                                         <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
//                                                         <span>{txn.comment}</span>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         ) : (
//                             <div className="py-20 flex flex-col items-center justify-center text-center">
//                                 <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 border-2 border-indigo-200">
//                                     <FileText className="w-10 h-10 text-indigo-400" />
//                                 </div>
//                                 <h3 className="text-xl font-bold text-gray-900 mb-2">No transactions yet</h3>
//                                 <p className="text-gray-500 text-sm max-w-sm">
//                                     No transactions have been recorded for this customer.
//                                 </p>
//                             </div>
//                         )}
//                     </div>

//                     {/* Footer */}
//                     <div className="text-center mt-8 py-4">
//                         <h1 className="text-xs font-bold tracking-widest text-indigo-600/70 uppercase">
//                             Design & Developed by ATF Labs
//                         </h1>
//                     </div>
//                 </div>
//             </div>

//             {/* Delete Modal */}
//             {deleteModal.show && (
//                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8">
//                         <div className="flex items-center gap-4 mb-6">
//                             <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
//                                 <AlertCircle className="w-7 h-7 text-red-600" />
//                             </div>
//                             <div>
//                                 <h3 className="text-xl font-bold text-gray-900">Delete Transaction?</h3>
//                                 <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
//                             </div>
//                         </div>
                        
//                         <p className="text-gray-700 mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
//                             Deleting this transaction will permanently remove it and recalculate the customer's balance.
//                         </p>
                        
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={() => setDeleteModal({ show: false, transactionId: null })}
//                                 className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
//                                 disabled={showLoader}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={handleDeleteTransaction}
//                                 className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 disabled:from-red-300 disabled:to-red-400"
//                                 disabled={showLoader}
//                             >
//                                 {showLoader ? "Deleting..." : "Delete"}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <Toaster 
//                 position="top-right"
//                 toastOptions={{
//                     duration: 3000,
//                     style: {
//                         background: '#333',
//                         color: '#fff',
//                         fontWeight: '600',
//                     },
//                 }}
//             />
//         </div>
//     );
// }



import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { 
    ArrowLeft, TrendingDown, TrendingUp, Calendar, 
    FileText, Trash2, AlertCircle, Scale, User, 
    Phone, Building2, ChevronRight, Download
} from "lucide-react";
import SideBar from "../../../components/layout/SideBar/SideBar";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function HisabDiaryTransactions() {
    const [showLoader, setShowLoader] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, transactionId: null });
    const [transactionsWithBalance, setTransactionsWithBalance] = useState([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cusId = searchParams.get('cusId');

    useEffect(() => {
        if (cusId) {
            fetchCustomerInfo();
            fetchTransactions();
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

    const fetchTransactions = async () => {
        try {
            setShowLoader(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/transaction/customer/${cusId}`);
            const result = await response.json();
            if (result.status === "success") {
                setTransactions(result.data);
            } else {
                toast.error(result.message);
                setTimeout(() => navigate("/hisabDiary"), 1500);
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
                toast.success("Entry deleted");
                setDeleteModal({ show: false, transactionId: null });
                fetchTransactions();
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setShowLoader(false);
        }
    };

    useEffect(() => {
        let currentRunningBalance = 0;
        const calculatedTransactions = transactions.map((txn) => {
            const currentAmount = txn.transactionType === "J" ? txn.silverInGram : -txn.silverInGram;
            currentRunningBalance += currentAmount;
            return { ...txn, runningBalance: currentRunningBalance };
        }).reverse(); // Latest transaction on top for professional view
        setTransactionsWithBalance(calculatedTransactions);
    }, [transactions]);

    const formatWeight = (val) => Number(val || 0).toFixed(3);
    const formatCurrency = (val) => Number(val || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    
    const totalNaam = transactions.filter(t => t.transactionType === "N").reduce((sum, t) => sum + t.silverInGram, 0);
    const totalJama = transactions.filter(t => t.transactionType === "J").reduce((sum, t) => sum + t.silverInGram, 0);
    const finalBalance = totalJama - totalNaam;

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <SideBar showLoader={showLoader && transactions.length === 0} />
            
            <div className="flex-1 lg:pl-4">
                <div className="p-4 py-6">
                    
                    {/* Top Navigation & Action */}
                    {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"> */}
                        <div className="mb-4">
                            <button 
                                onClick={() => navigate("/hisabDiary")}
                                className="group flex items-center text-slate-500 hover:text-slate-900 transition-all text-sm font-medium mb-2"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                                Back to Ledger
                            </button>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                Transaction History
                            </h1>
                        </div>
                        {/* <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all shadow-sm">
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                        </div> */}
                    {/* </div> */}

                    {/* Customer Profile Header */}
                    {customerInfo && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4 mb-5">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                <div className="lg:col-span-5 flex items-center gap-5">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 capitalize leading-tight">
                                            {customerInfo.name}
                                        </h2>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-slate-500 text-sm">
                                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> {customerInfo.phone}</span>
                                            {customerInfo.firmName && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5"/> {customerInfo.firmName}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="px-4 py-2  rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Net Balance</p>
                                        <p className={`text-xl font-bold ${finalBalance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {formatWeight(Math.abs(finalBalance))} <span className="text-xs font-medium italic">g {finalBalance < 0 ? 'Dr' : 'Cr'}</span>
                                        </p>
                                    </div>
                                    <div className="px-4 py-2  rounded-xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Jama</p>
                                        <p className="text-xl font-bold text-slate-800">{formatWeight(totalJama)} <span className="text-xs font-medium">g</span></p>
                                    </div>
                                    <div className="px-4 py-2  rounded-xl bg-slate-50 border border-slate-100 col-span-2 md:col-span-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Naam</p>
                                        <p className="text-xl font-bold text-slate-800">{formatWeight(totalNaam)} <span className="text-xs font-medium">g</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Naam (Dr)</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Jama (Cr)</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Balance</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactionsWithBalance.map((txn) => {
                                        const isNaam = txn.transactionType === "N";
                                        return (
                                            <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-slate-700">
                                                        {new Date(txn.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-900">{txn.comment || "Self Entry"}</span>
                                                        <span className="text-[11px] text-slate-400 mt-0.5">ID: #{txn.id.toString().slice(-6)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isNaam ? (
                                                        <div className="text-sm font-bold text-rose-600">{formatWeight(txn.silverInGram)} g</div>
                                                    ) : <span className="text-slate-300 text-xs">—</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {!isNaam ? (
                                                        <div className="text-sm font-bold text-emerald-600">{formatWeight(txn.silverInGram)} g</div>
                                                    ) : <span className="text-slate-300 text-xs">—</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${txn.runningBalance < 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                                        {formatWeight(Math.abs(txn.runningBalance))} g {txn.runningBalance < 0 ? 'Dr' : 'Cr'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => setDeleteModal({ show: true, transactionId: txn.id })}
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            
                            {transactions.length === 0 && (
                                <div className="py-24 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-slate-900 font-bold">No entries found</h3>
                                    <p className="text-slate-500 text-sm">Start by adding a transaction for this customer.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className="mt-12 mb-6 text-center">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                            Enterprise Ledger System • ATF Labs
                        </p>
                    </footer>
                </div>
            </div>

            {/* Delete Modal - Refined */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-4">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                            <p className="text-sm text-slate-500 mt-1">This will permanently remove the record and update the balance.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setDeleteModal({ show: false, transactionId: null })}
                                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteTransaction}
                                className="px-4 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-100"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
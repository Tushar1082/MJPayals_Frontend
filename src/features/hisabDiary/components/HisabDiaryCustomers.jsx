// import React, { useState, useEffect, useRef } from "react";
// import { toast, Toaster } from "react-hot-toast";
// import { Users, Eye, Search, Scale, UserPlus, ArrowLeftRight, Phone, Building2 } from "lucide-react";
// import SideBar from "../../../components/layout/SideBar/SideBar";
// import { Link, useNavigate } from "react-router-dom";

// export default function HisabDiaryCustomers() {
//     const [customers, setCustomers] = useState([]);
//     const [showLoader, setShowLoader] = useState(false);
//     const [searchQuery, setSearchQuery] = useState("");
//     const navigate = useNavigate();

//     // Infinite Scroll States
//     const [page, setPage] = useState(1);
//     const [hasMore, setHasMore] = useState(true);
//     const itemsPerLoad = 20;

//     const observerRef = useRef(null);

//     const fetchCustomers = async (pageNum, resetData = false, query = "") => {
//         try {
//             setShowLoader(true);
//             const url = `${import.meta.env.VITE_API_URL}/hisabDiary/customer?page=${pageNum}&pageSize=${itemsPerLoad}`;

//             const response = await fetch(url);
//             const result = await response.json();

//             if (result.status === "success") {
//                 const newData = result.data;

//                 if (resetData) {
//                     setCustomers(newData);
//                 } else {
//                     setCustomers(prev => [...prev, ...newData]);
//                 }

//                 const { currentPage, totalPages } = result.pagination;
//                 setHasMore(currentPage < totalPages);
//             } else {
//                 toast.error("Failed to load customers.");
//             }
//         } catch (error) {
//             console.error("Error fetching customers:", error);
//             toast.error("Network error! Could not fetch data.");
//         } finally {
//             setShowLoader(false);
//         }
//     };

//     // Initial Load
//     useEffect(() => {
//         setPage(1);
//         fetchCustomers(1, true, searchQuery);
//     }, []);

//     // Infinite Scroll Observer
//     useEffect(() => {
//         const observer = new IntersectionObserver((entries) => {
//             if (entries[0].isIntersecting && hasMore && !showLoader) {
//                 const nextPage = page + 1;
//                 setPage(nextPage);
//                 fetchCustomers(nextPage, false, searchQuery);
//             }
//         });

//         if (observerRef.current) {
//             observer.observe(observerRef.current);
//         }

//         return () => observer.disconnect();
//     }, [hasMore, showLoader, page, searchQuery]);

//     const handleSearch = () => {
//         setPage(1);
//         fetchCustomers(1, true, searchQuery);
//     };

//     // Weight formatter
//     const formatWeight = (val) => {
//         if (!val) return "0.000";
//         return Number(val).toLocaleString("en-IN", {
//             minimumFractionDigits: 3,
//             maximumFractionDigits: 3
//         });
//     };

//     const handleViewTransactions = (cusId) => {
//         navigate(`/hisabDiary/transaction?cusId=${cusId}`);
//     };

//     return (
//         <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
//             <SideBar showLoader={showLoader && customers.length === 0} />

//             <div className="flex-1 p-4 sm:p-6 lg:p-8">
//                 <div className="max-w-[1600px] mx-auto">

//                     {/* Header Section */}
//                     <div className="mb-6 sm:mb-4">
//                         <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
//                             <div className="text-left">
//                                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//                                     Hisab Diary Dashboard
//                                 </h1>
//                                 <p className="text-sm sm:text-base text-gray-600 ml-0">
//                                     Manage silver weight balances across all customers
//                                 </p>
//                             </div>


//                         </div>

//                         {/* Search Bar */}
//                         <div className="flex gap-4 mt-4 justify-between items-center p-4 bg-white rounded-lg border border-gray-300">
//                             <div className="flex-1">
//                                 <div className="relative flex-1">
//                                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                                     <input
//                                         type="text"
//                                         value={searchQuery}
//                                         onChange={(e) => setSearchQuery(e.target.value)}
//                                         onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//                                         placeholder="Search by name, phone or firm..."
//                                         className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                                     />
//                                 </div>
//                             </div>
//                             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//                                 <Link
//                                     to="/hisabDiary/customer/add"
//                                     className="flex items-center justify-center gap-2 px-5 py-3 bg-[#6366F1] hover:bg-[#5d60e6] text-white rounded-lg focus:outline-none font-semibold transition-all"
//                                 >
//                                     <UserPlus className="w-5 h-5" />
//                                     <span>Add Customer</span>
//                                 </Link>
//                                 <Link
//                                     to="/hisabDiary/transaction/add"
//                                     className="flex items-center justify-center gap-2 px-5 py-3 bg-black hover:bg-black/80 text-white rounded-lg focus:outline-none font-semibold transition-all"
//                                 >
//                                     <ArrowLeftRight className="w-5 h-5" />
//                                     <span>New Transaction</span>
//                                 </Link>
//                             </div>

//                         </div>
//                     </div>

//                     {/* Customers Grid */}
//                     <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
//                         {customers.length > 0 ? (
//                             customers.map((cus, idx) => {
//                                 const totalNaam = cus.totalNaam || 0;
//                                 const totalJama = cus.totalJama || 0;
//                                 const balance = totalJama - totalNaam;
//                                 const isOwedByThem = balance < 0; // They owe us (Dr)
//                                 const isOwedByUs = balance > 0; // We owe them (Cr)

//                                 return (
//                                     <div
//                                         key={cus.id}
//                                         onClick={() => handleViewTransactions(cus.id)}
//                                         className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/30 rounded-2xl border border-gray-200 hover:border-indigo-300 p-5 sm:p-6 transition-all duration-200 cursor-pointer"
//                                     >
//                                         {/* Customer Header */}
//                                         <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
//                                             <div className="flex-1 min-w-0">
//                                                 <h3 className="text-lg sm:text-xl font-bold text-gray-900 capitalize truncate mb-1">
//                                                     {cus.name}
//                                                 </h3>
//                                                 {cus.firmName && (
//                                                     <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-2">
//                                                         <Building2 className="w-4 h-4 flex-shrink-0" />
//                                                         <span className="truncate">{cus.firmName}</span>
//                                                     </div>
//                                                 )}
//                                                 <div className="flex items-center gap-1.5 text-sm text-gray-600">
//                                                     <Phone className="w-4 h-4 flex-shrink-0" />
//                                                     <span>{cus.phone || "N/A"}</span>
//                                                 </div>
//                                             </div>

//                                             <button
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleViewTransactions(cus.id);
//                                                 }}
//                                                 className="p-2.5 text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-100 rounded-xl transition-all"
//                                             >
//                                                 <Eye className="w-5 h-5" />
//                                             </button>
//                                         </div>

//                                         {/* Balance Cards */}
//                                         <div className="grid grid-cols-2 gap-3 mb-4">
//                                             {/* Naam Card */}
//                                             <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-xl p-3 border border-red-200">
//                                                 <div className="text-xs font-bold text-red-600 uppercase mb-1">
//                                                     Naam (उधार)
//                                                 </div>
//                                                 <div className="text-lg font-bold text-red-700">
//                                                     {formatWeight(totalNaam)}
//                                                     <span className="text-xs font-semibold ml-1">g</span>
//                                                 </div>
//                                             </div>

//                                             {/* Jama Card */}
//                                             <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-3 border border-emerald-200">
//                                                 <div className="text-xs font-bold text-emerald-600 uppercase mb-1">
//                                                     Jama (जमा)
//                                                 </div>
//                                                 <div className="text-lg font-bold text-emerald-700">
//                                                     {formatWeight(totalJama)}
//                                                     <span className="text-xs font-semibold ml-1">g</span>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         {/* Net Balance */}
//                                         <div className={`rounded-xl p-4 ${isOwedByThem ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200' :
//                                                 isOwedByUs ? 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200' :
//                                                     'bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200'
//                                             }`}>
//                                             <div className="flex items-center justify-between">
//                                                 <span className="text-xs font-bold text-gray-700 uppercase">
//                                                     Net Balance
//                                                 </span>
//                                                 <span className={`text-xl font-black ${isOwedByThem ? 'text-orange-700' :
//                                                         isOwedByUs ? 'text-blue-700' :
//                                                             'text-gray-700'
//                                                     }`}>
//                                                     {formatWeight(Math.abs(balance))}
//                                                     <span className="text-sm ml-1">g</span>
//                                                     {balance !== 0 && (
//                                                         <span className="text-xs ml-2 font-black">
//                                                             {isOwedByThem ? '(Dr)' : '(Cr)'}
//                                                         </span>
//                                                     )}
//                                                 </span>
//                                             </div>
//                                             {balance !== 0 && (
//                                                 <div className="mt-2 text-xs font-semibold text-gray-600">
//                                                     {isOwedByThem
//                                                         ? '↓ Customer owes silver'
//                                                         : '↑ We owe customer silver'}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 );
//                             })
//                         ) : (
//                             !showLoader && (
//                                 <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
//                                     <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 border border-indigo-200">
//                                         <Users className="w-10 h-10 text-indigo-400" />
//                                     </div>
//                                     <h3 className="text-xl font-bold text-gray-900 mb-2">No customers found</h3>
//                                     <p className="text-gray-500 text-sm max-w-sm mb-6">
//                                         You haven't added any customers to your Hisab Diary yet. Get started by adding your first customer.
//                                     </p>
//                                     <Link
//                                         to="/hisabDiary/customer/add"
//                                         className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold transition-all"
//                                     >
//                                         Add Your First Customer
//                                     </Link>
//                                 </div>
//                             )
//                         )}
//                     </div>

//                     {/* Infinite Scroll Loader */}
//                     {hasMore && (
//                         <div ref={observerRef} className="py-8 flex items-center justify-center">
//                             {showLoader && customers.length > 0 && (
//                                 <div className="flex items-center gap-3 text-sm text-indigo-600 font-semibold">
//                                     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                     Loading more customers...
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {/* Footer */}
//                     <div className="text-center mt-12 py-6">
//                         <h1 className="text-xs font-bold tracking-widest text-indigo-600/70 uppercase">
//                             Design & Developed by ATF Labs
//                         </h1>
//                     </div>
//                 </div>
//             </div>

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


import React, { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Users, Eye, Search, Scale, UserPlus, ArrowLeftRight, Phone, Building2, FileText } from "lucide-react";
import SideBar from "../../../components/layout/SideBar/SideBar";
import { Link, useNavigate } from "react-router-dom";
import AddHisabDiaryCustomer from "./AddHisabDiaryCustomer";
import AddHisabDiaryTransaction from "./AddHisabDiaryTransaction";

export default function HisabDiaryCustomers() {
    const [customers, setCustomers] = useState([]);
    const [showLoader, setShowLoader] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddCus, setShowAddCus] = useState(false);
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const navigate = useNavigate();

    // Infinite Scroll States
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const itemsPerLoad = 20;

    const observerRef = useRef(null);

    const fetchCustomers = async (pageNum, resetData = false, query = "") => {
        try {
            setShowLoader(true);
            const url = `${import.meta.env.VITE_API_URL}/hisabDiary/customer?page=${pageNum}&pageSize=${itemsPerLoad}`;

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
        if (!val) return "0.000";
        return Number(val).toLocaleString("en-IN", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        });
    };

    const handleViewTransactions = (cusId) => {
        navigate(`/hisabDiary/transaction?cusId=${cusId}`);
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <SideBar showLoader={showLoader && customers.length === 0} />
            <AddHisabDiaryCustomer showAddCus={showAddCus} setShowAddCus={setShowAddCus} />
            <AddHisabDiaryTransaction showAddTransaction={showAddTransaction} setShowAddTransaction={setShowAddTransaction} />
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-[1600px] mx-auto">

                    {/* Header Section */}
                    <div className="mb-6 sm:mb-4">
                        <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-left">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    Hisab Diary Dashboard
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 ml-0">
                                    Manage silver weight balances across all customers
                                </p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex gap-4 mt-4 justify-between items-center p-4 bg-white rounded-lg border border-gray-300">
                            <div className="flex-1">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        placeholder="Search by name, phone or firm..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <button
                                    onClick={() => setShowAddCus(true)}
                                    className="flex items-center justify-center gap-2 px-5 py-3 bg-[#6366F1] hover:bg-[#5d60e6] text-white rounded-lg focus:outline-none font-semibold transition-all"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    <span>Add Customer</span>
                                </button>
                                <button
                                    onClick={() => setShowAddTransaction(true)}
                                    className="flex items-center justify-center gap-2 px-5 py-3 bg-black hover:bg-black/80 text-white rounded-lg focus:outline-none font-semibold transition-all"
                                >
                                    <ArrowLeftRight className="w-5 h-5" />
                                    <span>New Transaction</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Customers Table View */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Info</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Naam</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Jama</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Net Balance</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {customers.length > 0 ? (
                                        customers.map((cus) => {
                                            const totalNaam = cus.totalNaam || 0;
                                            const totalJama = cus.totalJama || 0;
                                            const balance = totalJama - totalNaam;
                                            const isOwedByThem = balance < 0; // They owe us (Dr)
                                            const isOwedByUs = balance > 0; // We owe them (Cr)

                                            return (
                                                <tr
                                                    key={cus.id}
                                                    // onClick={() => handleViewTransactions(cus.id)}
                                                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900 capitalize mb-1">
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
                                                        <span className="text-sm font-bold text-red-600">
                                                            {formatWeight(totalNaam)} g
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <span className="text-sm font-bold text-emerald-600">
                                                            {formatWeight(totalJama)} g
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                                        <div className="flex flex-col items-end">
                                                            <span className={`text-sm font-black ${isOwedByThem ? 'text-orange-600' : isOwedByUs ? 'text-blue-600' : 'text-gray-700'
                                                                }`}>
                                                                {formatWeight(Math.abs(balance))} g
                                                            </span>
                                                            {/* {balance !== 0 && (
                                                                <span className={`text-[10px] font-bold mt-0.5 px-1.5 py-0.5 rounded ${
                                                                    isOwedByThem ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                                }`}>
                                                                    {isOwedByThem ? 'Dr (Customer Owes)' : 'Cr (We Owe)'}
                                                                </span>
                                                            )} */}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewTransactions(cus.id);
                                                            }}
                                                            className="p-2 text-gray-400 group-hover:text-indigo-600 group-hover:bg-indigo-100 rounded-lg transition-all"
                                                            title="View Transactions"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        !showLoader && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4 border border-indigo-200">
                                                            <Users className="w-8 h-8 text-indigo-400" />
                                                        </div>
                                                        <h3 className="text-lg font-bold text-gray-900 mb-1">No customers found</h3>
                                                        <p className="text-gray-500 text-sm mb-4">
                                                            You haven't added any customers to your Hisab Diary yet.
                                                        </p>
                                                        <Link
                                                            to="/hisabDiary/customer/add"
                                                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all"
                                                        >
                                                            Add Your First Customer
                                                        </Link>
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

                    {/* Footer */}
                    <div className="text-center mt-12 py-6">
                        <h1 className="text-xs font-bold tracking-widest text-indigo-600/70 uppercase">
                            Design & Developed by ATF Labs
                        </h1>
                    </div>
                </div>
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#333',
                        color: '#fff',
                        fontWeight: '600',
                    },
                }}
            />
        </div>
    );
}
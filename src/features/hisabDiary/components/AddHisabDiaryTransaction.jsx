import React, { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Calendar, Search, Mic, MicOff, Save, Scale, IndianRupee, FileText, ArrowLeft, TrendingDown, TrendingUp, X, ArrowLeftRight } from "lucide-react";
import SideBar from "../../../components/layout/SideBar/SideBar";
import { useNavigate } from "react-router-dom";

export default function AddHisabDiaryTransaction({ showAddTransaction, setShowAddTransaction }) {
    const [showLoader, setShowLoader] = useState(false);
    const navigate = useNavigate();

    // Form States
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [transactionType, setTransactionType] = useState("N"); // 'N' for Naam, 'J' for Jama
    const [silverInGram, setSilverInGram] = useState("");
    const [cash, setCash] = useState("");
    const [comment, setComment] = useState("");

    // Customer Search States
    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [customerOptions, setCustomerOptions] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Voice Recognition State
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'hi-IN';

            recognitionRef.current.onresult = (event) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }
                if (transcript) {
                    setComment((prev) => (prev ? prev + " " : "") + transcript.trim());
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
                if (event.error !== 'no-speech') {
                    toast.error("Microphone error: " + event.error);
                }
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }
    }, []);

    const toggleVoiceRecording = (e) => {
        e.preventDefault();
        if (!recognitionRef.current) {
            toast.error("Voice recognition is not supported in this browser.");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
            toast.success("Listening... Speak now", { duration: 1500 });
        }
    };

    // Handle Customer Search with Debounce
    useEffect(() => {
        if (!customerSearchTerm.trim()) {
            setCustomerOptions([]);
            return;
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/customer/search?term=${customerSearchTerm}`);
                const result = await response.json();
                if (result.status === "success") {
                    setCustomerOptions(result.data);
                    setIsDropdownOpen(true);
                }
            } catch (error) {
                console.error("Error searching customers:", error);
            }
        }, 300);

        return () => clearTimeout(searchTimeoutRef.current);
    }, [customerSearchTerm]);

    const handleSelectCustomer = (cus) => {
        setSelectedCustomer(cus);
        setCustomerSearchTerm(cus.name);
        setIsDropdownOpen(false);
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();

        if (!selectedCustomer) {
            toast.error("Please select a customer first!");
            return;
        }

        if (!silverInGram || parseFloat(silverInGram) <= 0) {
            toast.error("Please enter valid Silver weight!");
            return;
        }

        if (!cash || parseFloat(cash) <= 0) {
            toast.error("Please enter valid Cash amount!");
            return;
        }

        try {
            setShowLoader(true);

            const payload = {
                cusId: selectedCustomer.id,
                transactionType: transactionType,
                silverInGram: parseFloat(silverInGram),
                cash: parseFloat(cash),
                comment: comment.trim(),
                date: transactionDate
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/transaction/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status === "success" || response.ok) {
                toast.success(`${transactionType === 'N' ? 'Naam' : 'Jama'} Transaction Added Successfully!`);

                // Reset form
                setSilverInGram("");
                setCash("");
                setComment("");
                setSelectedCustomer(null);
                setCustomerSearchTerm("");
                setTransactionDate(new Date().toISOString().split('T')[0]);

                setTimeout(() => {
                    navigate("/hisabDiary");
                }, 1500);
            } else {
                toast.error(result.message || "Failed to add transaction");
            }

        } catch (error) {
            toast.error("Network error! Something went wrong.");
            console.error("Error adding transaction:", error);
        } finally {
            setShowLoader(false);
        }
    };

    return (
        <div className={`${showAddTransaction ? "flex" : "hidden"} fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[100] items-center justify-center p-4 overflow-y-auto`}>

            {/* Modal Container */}
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-visible relative animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Form Card */}
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">

                <form onSubmit={handleAddTransaction}>
                    <div className="flex items-center justify-between gap-1 mb-0 py-4 px-6 border-b border-gray-300">
                        <div className="flex items-center gap-2 ">
                            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-bold text-gray-900">New Transaction</h2>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowAddTransaction(false)} // Aapka state false karne ka logic
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-4 pt-4 px-6">
                        <div className="">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Transaction Date
                            </label>
                            <input
                                type="date"
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                                // className="w-full border-2 border-gray-200 pl-12 pr-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all font-medium bg-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Customer <span className="text-red-500">*</span>
                            </label>
                            {selectedCustomer ? (
                                <div className="flex items-center justify-between px-4 py-1 bg-white border-2 border-indigo-300 rounded-xl">
                                    <div>
                                        <div className="font-bold text-gray-900">{selectedCustomer.name}</div>
                                        <div className="text-sm text-gray-600">{selectedCustomer.phone}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedCustomer(null);
                                            setCustomerSearchTerm("");
                                        }}
                                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customerSearchTerm}
                                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                        onFocus={() => customerOptions.length > 0 && setIsDropdownOpen(true)}
                                        placeholder="Search customer by name or phone..."
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                                    // className="w-full border-2 border-gray-200 pl-12 pr-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all font-medium bg-white"
                                    />

                                    {isDropdownOpen && customerOptions.length > 0 && (
                                        <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                            {customerOptions.map((cus) => (
                                                <div
                                                    key={cus.id}
                                                    onClick={() => handleSelectCustomer(cus)}
                                                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                                >
                                                    <div className="font-semibold text-gray-900">{cus.name}</div>
                                                    <div className="text-sm text-gray-600">{cus.phone}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Chrome-Style Tabs for Naam/Jama */}
                    <div className="border-b border-gray-200 bg-gray-50/50">
                        <div className="flex p-4 pb-0">
                            <button
                                type="button"
                                onClick={() => setTransactionType("N")}
                                className={`relative px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${transactionType === "N"
                                    ? 'bg-white text-red-600 shadow-sm border-t-4 border-red-500 z-10'
                                    : 'bg-transparent text-gray-500 hover:text-red-500 hover:bg-white/50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5" />
                                    <span>Naam</span>
                                </div>
                                {transactionType === "N" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setTransactionType("J")}
                                className={`relative px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${transactionType === "J"
                                    ? 'bg-white text-emerald-600 shadow-sm border-t-4 border-emerald-500 z-10'
                                    : 'bg-transparent text-gray-500 hover:text-emerald-500 hover:bg-white/50'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    <span>Jama</span>
                                </div>
                                {transactionType === "J" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Tab Content - Input Fields */}
                    <div className="py-5 px-6 bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            {/* Silver Input */}
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${transactionType === 'N' ? 'text-red-600' : 'text-emerald-600'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        Silver Weight (in grams)
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.001"
                                        placeholder="e.g. 150.500"
                                        value={silverInGram}
                                        onChange={(e) => setSilverInGram(e.target.value)}
                                        className={`w-full border border-gray-300 px-4 py-2.5 rounded-lg outline-none ${transactionType === 'N'
                                            ? 'border-red-200 focus:ring-red-300 focus:border-red-400 bg-red-50/30'
                                            : 'border-emerald-200 focus:ring-emerald-300 focus:border-emerald-400 bg-emerald-50/30'
                                            }`}
                                        required
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">g</span>
                                </div>
                            </div>

                            {/* Cash Input */}
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${transactionType === 'N' ? 'text-red-600' : 'text-emerald-600'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        Cash Amount
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g. 11,287.50"
                                        value={cash}
                                        onChange={(e) => setCash(e.target.value)}
                                        className={`w-full border border-gray-300 px-4 py-2.5 rounded-lg outline-none ${transactionType === 'N'
                                            ? 'border-red-200 focus:ring-red-300 focus:border-red-400 bg-red-50/30'
                                            : 'border-emerald-200 focus:ring-emerald-300 focus:border-emerald-400 bg-emerald-50/30'
                                            }`}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Info Display */}
                        {/* {(silverInGram && cash) && (
                                    <div className={`mt-6 p-5 rounded-xl border-2 ${transactionType === 'N'
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-emerald-50 border-emerald-200'
                                        }`}>
                                        <div className="text-sm font-semibold text-gray-700 mb-2">Transaction Summary:</div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">
                                                {silverInGram} g of silver
                                            </span>
                                            <span className={`text-2xl font-bold ${transactionType === 'N' ? 'text-red-600' : 'text-emerald-600'
                                                }`}>
                                                ₹ {Number(cash).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-2 text-right">
                                            Rate: ₹{(cash / silverInGram).toFixed(2)} per gram
                                        </div>
                                    </div>
                                )} */}
                    </div>

                    {/* Comment Section with Voice */}
                    <div className="px-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-indigo-500" />
                                    <span>Comments / Remarks</span>
                                </div>
                            </div>
                        </label>
                        <div className="relative">
                            <textarea
                                rows="3"
                                placeholder="Enter additional details or use voice input..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full border-2 border-gray-200 px-4 py-3 pr-14 rounded-xl outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all resize-none font-medium bg-white"
                            />
                            <button
                                type="button"
                                onClick={toggleVoiceRecording}
                                className={`absolute right-3 bottom-3 p-2.5 rounded-lg transition-all ${isRecording
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600 hover:from-indigo-200 hover:to-indigo-300'
                                    }`}
                                title={isRecording ? "Recording... Click to stop" : "Voice input (Hindi & English)"}
                            >
                                {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 mb-2 flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 bg-indigo-400 rounded-full"></span>
                            Voice input supports Hindi & English
                        </p>
                    </div>

                    {/* Submit Section */}
                    <div className="py-2.5 px-6 bg-white border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <p className="text-sm text-gray-600">
                                All fields marked with <span className="text-red-500 font-bold">*</span> are required
                            </p>
                            {/* <button
                                        type="submit"
                                        disabled={showLoader || !silverInGram || !cash || !selectedCustomer}
                                        className={`w-full sm:w-auto px-8 py-3.5 font-bold flex items-center justify-center gap-3 rounded-xl shadow-lg transition-all ${transactionType === 'N'
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-200 disabled:from-red-300 disabled:to-red-400'
                                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-200 disabled:from-emerald-300 disabled:to-emerald-400'
                                            } disabled:cursor-not-allowed hover:shadow-xl`}
                                    > */}
                            <button
                                type="submit"
                                disabled={showLoader || !selectedCustomer}
                                className={`w-full sm:w-auto px-8 py-3.5 font-bold flex items-center justify-center gap-3 rounded-lg transition-all ${transactionType === 'N'
                                    ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-emerald-300'
                                    } disabled:cursor-not-allowed`}
                            >
                                <Save className="w-5 h-5" />
                                {showLoader ? "Saving..." : `Save ${transactionType === 'N' ? 'Naam' : 'Jama'} Entry`}
                            </button>
                        </div>
                    </div>
                </form>
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
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </div>
    );
}
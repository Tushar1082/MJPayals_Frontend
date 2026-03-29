import React, { useState, useEffect, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { Calendar, Search, Mic, MicOff, Save, Scale, IndianRupee, FileText, ArrowLeft, TrendingDown, TrendingUp, X, ArrowLeftRight } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AddHisabDiaryTransaction({ showAddTransaction, setShowAddTransaction, preselectedCustomer, initialData }) {
    const [showLoader, setShowLoader] = useState(false);
    const [editTransactionId, setEditTransactionId] = useState(null);

    // Form States
    const [transactionDate, setTransactionDate] = useState(new Date());
    const [transactionType, setTransactionType] = useState("N"); // 'N' for Naam, 'J' for Jama
    const [silverInGram, setSilverInGram] = useState("");
    const [cash, setCash] = useState("");
    const [comment, setComment] = useState("");

    // Customer Search States
    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [customerOptions, setCustomerOptions] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef(null);

    // Voice Recognition State
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    const dateInputRef = useRef(null);

    const handleDateWrapperClick = () => {
        if (dateInputRef.current) {
            dateInputRef.current.showPicker(); // Calendar automatically khul jayega
        }
    };

    const resetForm = () => {
        setSilverInGram("");
        setCash("");
        setComment("");
        setSelectedCustomer(null);
        setCustomerSearchTerm("");
        setTransactionDate(new Date());
        setCustomerOptions([]);
        setIsDropdownOpen(false);
        setFocusedIndex(-1); // For keyboard navigation
    };

    const handleKeyDown = (e) => {
        if (!isDropdownOpen || customerOptions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex(prev => (prev < customerOptions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter" && focusedIndex !== -1) {
            e.preventDefault();
            handleSelectCustomer(customerOptions[focusedIndex]);
        } else if (e.key === "Escape") {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        if (focusedIndex !== -1 && isDropdownOpen) {
            const activeItem = document.querySelectorAll('.max-h-60 > div')[focusedIndex];
            if (activeItem) {
                activeItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [focusedIndex]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setFocusedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (showAddTransaction && preselectedCustomer) {
            setSelectedCustomer(preselectedCustomer);
            setCustomerSearchTerm(preselectedCustomer.name);
        }
    }, [showAddTransaction, preselectedCustomer]);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-IN';

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

        const silverValue = parseFloat(silverInGram) || 0;
        const cashValue = parseFloat(cash) || 0;

        if (silverValue <= 0 && cashValue <= 0) {
            toast.error("Please enter either Silver weight or Cash amount!");
            return;
        }

        try {
            setShowLoader(true);

            const offset = transactionDate.getTimezoneOffset();
            const apiDate = new Date(transactionDate.getTime() - (offset * 60000)).toISOString().split('T')[0];

            const payload = {
                cusId: selectedCustomer.id,
                transactionType: transactionType,
                silverInGram: silverValue,
                cash: cashValue,
                comment: comment.trim(),
                date: apiDate
            };

            const apiMethod = editTransactionId ? "PUT" : "POST";
            const apiUrl = editTransactionId
                ? `${import.meta.env.VITE_API_URL}/hisabDiary/transaction/update/${editTransactionId}`
                : `${import.meta.env.VITE_API_URL}/hisabDiary/transaction/add`;

            // const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/transaction/add`, {
            const response = await fetch(apiUrl, {
                method: apiMethod,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status === "success" || response.ok) {
                // toast.success(`${transactionType === 'N' ? 'Naam' : 'Jama'} Transaction Added Successfully!`);
                toast.success(editTransactionId ? "Transaction Updated Successfully!" : "Transaction Added Successfully!");

                // Reset form
                setSilverInGram("");
                setCash("");
                setComment("");
                setSelectedCustomer(null);
                setCustomerSearchTerm("");
                setTransactionDate(new Date());

                setTimeout(() => {
                    setShowAddTransaction(false);
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

    // useEffect(() => {
    //     if (showAddTransaction) {
    //         setTransactionDate(new Date());
    //     }
    // }, [showAddTransaction]);

    // useEffect(() => {
    //     if (showAddTransaction) {
    //         setTransactionDate(new Date());

    //         if (initialData) {
    //             // Agar plus button dab kar aaye hain toh Jama auto select aur values fill hongi
    //             setTransactionType("J");
    //             setSilverInGram(initialData.silverInGram);
    //             setCash(initialData.cash);
    //             if (initialData.comment) setComment(initialData.comment);
    //         } else {
    //             // Normal "New Transaction" click par default 'Naam' rahega
    //             setTransactionType("N");
    //         }
    //     }
    // }, [showAddTransaction, initialData]);

    useEffect(() => {
        if (showAddTransaction) {
            if (initialData && initialData.isEdit) {
                // Edit Mode: Purani values fill karo
                setEditTransactionId(initialData.id);
                setTransactionType(initialData.transactionType);
                setSilverInGram(initialData.silverInGram);
                setCash(initialData.cash);
                setComment(initialData.comment);
                setTransactionDate(initialData.transactionDate);
            } else if (initialData && !initialData.isEdit) {
                // Quick Jama Mode (Plus button wala)
                setEditTransactionId(null);
                setTransactionType(initialData.transactionType);
                setSilverInGram(initialData.silverInGram);
                setCash(initialData.cash);
                setComment(initialData.comment);
                setTransactionDate(new Date());
            } else {
                // Normal New Transaction
                setEditTransactionId(null);
                setTransactionType("N");
                setSilverInGram("");
                setCash("");
                setComment("");
                setTransactionDate(new Date());
            }
        } else {
            // Jab modal close ho toh reset kar do
            setEditTransactionId(null);
        }
    }, [showAddTransaction, initialData]);

    return (
        <div className={`${showAddTransaction ? "flex" : "hidden"} fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[100] items-center justify-center p-4 overflow-y-auto`}>

            {/* Modal Container */}
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-visible relative animate-in fade-in zoom-in-95 duration-200 my-auto">
                {/* Form Card */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">

                    <form onSubmit={handleAddTransaction}>
                        <div className="flex items-center justify-between gap-1 mb-0 py-4 px-5 border-b border-gray-300">
                            <div className="flex items-center gap-2 ">
                                <ArrowLeftRight className="w-6.5 h-6.5 text-indigo-600" />
                                <h1 className="text-2xl font-bold text-gray-900">Add Transaction</h1>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm(); // Reset fields
                                        setShowAddTransaction(false); // Close modal
                                    }}
                                    className=" text-white bg-red-400 p-1 cursor-pointer hover:bg-red-600 rounded-full transition-colors z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 items-baseline gap-2.5 pt-4 px-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Transaction Date
                                </label>
                                <div className="relative w-full">
                                    <DatePicker
                                        selected={transactionDate}
                                        onChange={(date) => setTransactionDate(date)}
                                        dateFormat="dd/MM/yyyy" /* Ye fixed format dega jo Indians use karte hain */
                                        maxDate={new Date()} /* Aaj se aage ki date block karne ke liye */
                                        className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all bg-white cursor-pointer"
                                        wrapperClassName="w-full"
                                    />
                                    {/* Calendar Icon for visual cue */}
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Select Customer <span className="text-red-500">*</span>
                                </label>
                                {selectedCustomer ? (
                                    <div className="flex items-center justify-between px-4 py-1 bg-white border-2 border-indigo-300 rounded-xl">
                                        <div className="flex flex-col">
                                            <p className="mb-0 font-semibold text-gray-900">{selectedCustomer.name}</p>
                                            <p className="mb-0 text-sm text-gray-600">{selectedCustomer.phone}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedCustomer(null);
                                                setCustomerSearchTerm("");
                                            }}
                                            className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative" ref={dropdownRef}>
                                        <input
                                            type="text"
                                            value={customerSearchTerm}
                                            onChange={(e) => {
                                                setCustomerSearchTerm(e.target.value);
                                                setFocusedIndex(-1); // Reset focus on type
                                            }}
                                            onKeyDown={handleKeyDown}
                                            onFocus={() => customerOptions.length > 0 && setIsDropdownOpen(true)}
                                            placeholder="Search customer by name..."
                                            className="w-full border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                                        // className="w-full border-2 border-gray-200 pl-12 pr-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all font-medium bg-white"
                                        />

                                        {isDropdownOpen && customerOptions.length > 0 && (
                                            <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                {customerOptions.map((cus, index) => (
                                                    <div
                                                        key={cus.id}
                                                        onClick={() => handleSelectCustomer(cus)}
                                                        className={`px-4 py-2 cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${index === focusedIndex ? "bg-indigo-100" : "hover:bg-indigo-50"
                                                            }`}
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
                        <div className="bg-gray-50/50">
                            <div className="flex p-4 pb-0">
                                <button
                                    type="button"
                                    onClick={() => setTransactionType("N")}
                                    // className={`relative px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${transactionType === "N"
                                    //     ? 'bg-white text-red-600 shadow-sm border-t-4 border-red-500 z-10'
                                    //     : 'bg-transparent text-gray-500 hover:text-red-500 hover:bg-white/50'
                                    //     }`}
                                    className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-all outline-none ${transactionType === "N"
                                        ? 'text-white bg-red-600/80'
                                        : 'bg-transparent text-gray-500 hover:text-red-500 hover:bg-white/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="w-5 h-5" />
                                        <span>Naam</span>
                                    </div>
                                    {/* {transactionType === "N" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                                    )} */}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTransactionType("J")}
                                    // className={`relative px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${transactionType === "J"
                                    //     ? 'bg-white text-green-600 shadow-sm border-t-4 border-green-500 z-10'
                                    //     : 'bg-transparent text-gray-500 hover:text-green-500 hover:bg-white/50'
                                    //     }`}
                                    className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-all outline-none ${transactionType === "J"
                                        ? 'text-white bg-green-600/80'
                                        : 'bg-transparent text-gray-500 hover:text-green-500 hover:bg-white/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        <span>Jama</span>
                                    </div>
                                    {/* {transactionType === "J" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                                    )} */}
                                </button>
                            </div>
                        </div>

                        {/* Tab Content - Input Fields */}
                        <div className={`py-5 px-6 mx-4 rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] ${transactionType === "N" ? "bg-red-500/80" : "bg-green-500/80 rounded-tl-[12px]"}`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                {/* Silver Input */}
                                <div>
                                    <label className={`block text-sm text-white font-bold mb-1`}>
                                        <div className="flex items-center gap-2">
                                            Silver Weight (in grams)
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="e.g. 150.500"
                                            min={0}
                                            value={silverInGram}
                                            onChange={(e) => setSilverInGram(e.target.value)}
                                            className={`w-full border placeholder:text-grey-400 border-gray-300 px-4 py-2.5 rounded-lg outline-none bg-white`}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 font-bold text-sm">g</span>
                                    </div>
                                </div>

                                {/* Cash Input */}
                                <div>
                                    <label className={`block text-sm text-white font-bold mb-1`}>
                                        <div className="flex items-center gap-2">
                                            Amount
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={0}
                                            placeholder="e.g. 11,287.50"
                                            value={cash}
                                            onChange={(e) => setCash(e.target.value)}
                                            className={`w-full placeholder:text-grey-400 border border-gray-300 px-4 py-2.5 rounded-lg outline-none bg-white`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Comment Section with Voice */}
                            <div className="mt-3.5">
                                <label className="block text-sm font-semibold text-white mb-1">
                                    <div className="flex items-center justify-between">
                                        <span>Comments / Remarks</span>
                                    </div>
                                </label>
                                <div className="relative">
                                    <textarea
                                        rows="3"
                                        placeholder="Enter additional details or use voice input..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className={`w-full bg-white placeholder:text-grey-400 border border-white px-4 py-3 pr-14 rounded-xl outline-none transition-all resize-none`}
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleVoiceRecording}
                                        // className={`absolute right-3 bottom-3 p-2.5 rounded-lg transition-all ${isRecording
                                        //     ? 'bg-red-500 text-white animate-pulse'
                                        //     : 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600 hover:from-indigo-200 hover:to-indigo-300'
                                        //     }`}
                                        className={`absolute right-3 bottom-3 p-2.5 rounded-lg transition-all
                                                    ${isRecording
                                                ? 'bg-gray-700 text-white' // active (stop state)
                                                : transactionType === 'N'
                                                    ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-600 hover:from-red-200 hover:to-red-300'
                                                    : 'bg-gradient-to-br from-green-100 to-green-200 text-green-600 hover:from-green-200 hover:to-green-300'
                                            }`}
                                        title={isRecording ? "Recording... Click to stop" : "Voice input (Hindi & English)"}
                                    >
                                        {isRecording ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* Submit Section */}
                        <div className="py-2.5 px-6 mt-2 border-t border-gray-200 bg-gray-100">
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    All fields marked with <span className="text-red-500 font-bold">*</span> are required
                                </p>
                                {/* <button
                                        type="submit"
                                        disabled={showLoader || !silverInGram || !cash || !selectedCustomer}
                                        className={`w-full sm:w-auto px-8 py-3.5 font-bold flex items-center justify-center gap-3 rounded-xl shadow-lg transition-all ${transactionType === 'N'
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-200 disabled:from-red-300 disabled:to-red-400'
                                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200 disabled:from-green-300 disabled:to-green-400'
                                            } disabled:cursor-not-allowed hover:shadow-xl`}
                                    > */}
                                <button
                                    type="submit"
                                    disabled={showLoader || !selectedCustomer || !(cash || silverInGram) }
                                    className={`w-full sm:w-auto px-5 py-3 flex items-center justify-center gap-3 rounded-lg transition-all bg-[#6366F1] hover:bg-[#5d60e6] font-semibold text-white disabled:opacity-70`}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>


        </div>
    );
}
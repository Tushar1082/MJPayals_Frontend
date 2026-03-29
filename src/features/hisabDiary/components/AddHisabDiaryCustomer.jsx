import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { User, X } from "lucide-react";

export default function AddHisabDiaryCustomer({ showAddCus, setShowAddCus }) {
    const [customer, setCustomer] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        firmName: ""
    });
    const [showLoader, setShowLoader] = useState(false);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setCustomer((prev) => ({
    //         ...prev,
    //         [name]: value
    //     }));
    // };

    const resetForm = () => {
        setCustomer({
            name: "",
            phone: "",
            address: "",
            city: "",
            firmName: ""
        });
    };

    const handleClose = () => {
        resetForm();
        setShowAddCus(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let updatedValue = value;

        if (name === "phone") {
            // allow only digits and limit to 10
            updatedValue = value.replace(/\D/g, "").slice(0, 10);
        }

        setCustomer((prev) => ({
            ...prev,
            [name]: updatedValue
        }));
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();

        if (!customer.name.trim() || !customer.phone.trim()) {
            toast.error("Name and Mobile Number are required!");
            return;
        }

        if (customer.phone.trim().length < 10) {
            toast.error("Please enter a valid Mobile Number!");
            return;
        }

        try {
            setShowLoader(true);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/hisabDiary/customer/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(customer)
            });

            const result = await response.json();

            if (response.ok || result.status === 'success') {
                toast.success(result.message || "Customer Added Successfully!");

                setCustomer({
                    name: "",
                    phone: "",
                    address: "",
                    city: "",
                    firmName: ""
                });

                setTimeout(() => {
                    resetForm();
                    setShowAddCus(false);
                }, 1000);
            } else {
                toast.error(result.message || "Failed to add customer. Try again.");
                console.log("Server Error:", result);
            }

        } catch (error) {
            toast.error("Network error! Something went wrong.");
            console.error("Error adding hisab diary customer:", error);
        } finally {
            setShowLoader(false);
        }
    };

    return (
        <div className={`${showAddCus ? "flex" : "hidden"} fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[100] items-center justify-center p-4`}>

            {/* Modal Container */}
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">


                <form onSubmit={handleAddCustomer}>

                    {/* Personal Information */}
                    <div className="p-6 sm:p-0">
                        <div className="flex items-center justify-between gap-2 mb-0 py-4 px-5 border-b border-gray-300">
                            <div className="flex items-center gap-1">

                                <User className="w-6.5 h-6.5 text-indigo-600" />
                                <h1 className="text-2xl font-bold text-gray-900">Add Customer</h1>
                            </div>

                            {/* Close Button */}
                            <div>
                                <button
                                    type="button"
                                    onClick={handleClose} // Aapka state false karne ka logic
                                    className=" text-white bg-red-400 p-1 cursor-pointer hover:bg-red-600 rounded-full transition-colors z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 px-6">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={customer.name}
                                        onChange={handleChange}
                                        placeholder="Enter customer's full name"
                                        className="w-full placeholder:text-sm placeholder:text-gray-400 border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                                        required
                                    />
                                </div>

                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={customer.phone}
                                        onChange={handleChange}
                                        placeholder="Enter 10-digit mobile number"
                                        pattern="[0-9]{10}"
                                        inputMode="numeric"
                                        maxLength={10}
                                        className="w-full placeholder:text-sm placeholder:text-gray-400 border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Firm Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firmName"
                                        value={customer.firmName}
                                        onChange={handleChange}
                                        placeholder="Enter firm name"
                                        className=" w-full placeholder:text-sm placeholder:text-gray-400 border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                                    />
                                </div>

                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={customer.city}
                                        onChange={handleChange}
                                        placeholder="Enter city"
                                        className=" w-full placeholder:text-sm placeholder:text-gray-400 border border-gray-300 px-4 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Address */}
                    <div className="p-6 sm:pt-4 border-b border-gray-200">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Full Address
                        </label>
                        <textarea
                            name="address"
                            value={customer.address}
                            onChange={handleChange}
                            placeholder="Enter complete address with landmarks"
                            rows="3"
                            className="w-full bg-white placeholder:text-sm placeholder:text-gray-400 border border-gray-300 px-4 py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all resize-none"
                        />
                        {/* <textarea
                            name="address"
                            value={customer.address}
                            onChange={handleChange}
                            placeholder="Enter complete address with landmarks"
                            rows="3"
                            className="w-full placeholder:text-sm placeholder:text-gray-400 border-2 border-gray-200 px-4 py-3 rounded-xl outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 transition-all resize-none bg-white"
                        /> */}
                    </div>

                    {/* Submit Section */}
                    <div className="py-2.5 px-6 bg-gray-50">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Fields marked with <span className="text-red-500 font-bold">*</span> are required
                            </p>
                            <button
                                type="submit"
                                disabled={showLoader || !customer.name.trim() || customer.phone.trim().length !== 10}
                                className="flex items-center cursor-pointer justify-center gap-2 px-5 py-3 bg-[#6366F1] hover:bg-[#5d60e6] text-white rounded-lg focus:outline-none font-semibold transition-all disabled:opacity-70"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    );
}
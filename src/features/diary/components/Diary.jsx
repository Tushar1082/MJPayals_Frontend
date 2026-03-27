import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import { Camera, Menu, NotebookPen, PlusIcon, RotateCcw, Trash2, X } from "lucide-react";
import SideBar from "../../../components/layout/SideBar/SideBar";
import DiaryCustomerNamesComplete from "./Diarycustomernamescomplete";

export default function Diary() {
    const [customer, setCustomer] = useState({
        cus_id: null,
        name: "",
        phone: ""
    });
    const [showLoader, setShowLoader] = useState(false);
    const [isOldCustomer, setIsOldCustomer] = useState(false);
    const [wasUpdated, setWasUpdated] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [items, setItems] = useState([
        {
            fineSilver: "",
            lbrBalance: "",
            comment: "",
            images: [] // Array of base64 images
        }
    ]);

    const lastRowRef = useRef(null);
    const fileInputRefs = useRef([]);

    const handleRegenerate = () => {
        window.location.reload();
    };

    const handleInputChange = (idx, field, value) => {
        setItems((prev) =>
            prev.map((item, i) => {
                if (i === idx) {
                    return { ...item, [field]: value };
                }
                return item;
            })
        );
    };

    const handleImageUpload = (idx, event) => {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;

        // Validate file size (max 5MB per image)
        const maxSize = 5 * 1024 * 1024; // 5MB
        for (const file of files) {
            if (file.size > maxSize) {
                toast.error(`Image ${file.name} is too large. Max 5MB per image.`);
                return;
            }
        }

        // Convert files to base64
        const promises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises)
            .then(base64Images => {
                setItems(prev =>
                    prev.map((item, i) => {
                        if (i === idx) {
                            return {
                                ...item,
                                images: [...(item.images || []), ...base64Images]
                            };
                        }
                        return item;
                    })
                );
                toast.success(`${files.length} image(s) uploaded!`);
            })
            .catch(err => {
                console.error("Image upload error:", err);
                toast.error("Failed to upload images");
            });

        event.target.value = '';
    };

    const removeImage = (itemIdx, imageIdx) => {
        setItems(prev =>
            prev.map((item, i) => {
                if (i === itemIdx) {
                    return {
                        ...item,
                        images: item.images.filter((_, imgI) => imgI !== imageIdx)
                    };
                }
                return item;
            })
        );
        toast.success("Image removed");
    };

    const addRow = () => {
        setItems((prev) => [
            ...prev,
            {
                fineSilver: "",
                lbrBalance: "",
                comment: "",
                images: []
            }
        ]);
    };

    const deleteCusItem = (itemIdx) => {
        setItems((prev) => {
            const updated = prev.filter((item, idx) => idx !== itemIdx);

            if (updated.length === 0) {
                return [
                    {
                        fineSilver: "",
                        lbrBalance: "",
                        comment: "",
                        images: []
                    }
                ];
            }

            return updated;
        });
    };

    const validateCustomer = () => {
        if (!customer.name?.trim()) {
            toast.error("Please Enter Customer Name.");
            return false;
        }

        if (customer.phone && customer.phone.length !== 10) {
            toast.error("Phone Number Should be 10 Digits.");
            return false;
        }

        return true;
    };

    const validateItems = () => {
        const validItems = items.filter(item => {
            const hasSilver = item.fineSilver && parseFloat(item.fineSilver) !== 0;
            const hasBalance = item.lbrBalance && parseFloat(item.lbrBalance) !== 0;
            const hasComment = item.comment?.trim();
            const hasImages = item.images?.length > 0;
            
            return hasSilver || hasBalance || hasComment || hasImages;
        });

        if (validItems.length === 0) {
            toast.error("Please add at least one item with data.");
            return false;
        }

        for (let i = 0; i < validItems.length; i++) {
            const item = validItems[i];
            const row = i + 1;

            if (item.fineSilver && parseFloat(item.fineSilver) < 0) {
                toast.error(`Row ${row}: Fine Silver cannot be negative.`);
                return false;
            }

            if (item.lbrBalance && parseFloat(item.lbrBalance) < 0) {
                toast.error(`Row ${row}: Labour Balance cannot be negative.`);
                return false;
            }
        }

        return true;
    };

    const addOrUpdateCustomer = async () => {
        if (!validateCustomer()) {
            return null;
        }

        setShowLoader(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/diary/customer`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: customer.name.trim(),
                    phone: customer.phone?.trim() || null,
                    currentCusId: customer.cus_id
                })
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message || "Failed to save customer");
                return null;
            }

            setCustomer((prev) => ({
                ...prev,
                cus_id: result.data.id,
                name: result.data.name,
                phone: result.data.phone || ""
            }));

            setIsOldCustomer(result.isOldCustomer || false);
            setWasUpdated(result.wasUpdated || false);

            toast.success(result.message);

            return result.data;
        } catch (error) {
            console.error("Error saving customer:", error);
            toast.error("Network error. Please try again.");
            return null;
        } finally {
            setShowLoader(false);
        }
    };

    const saveItems = async (cusId, isUpdate = false) => {
        const validItems = items.filter(item => {
            const hasSilver = item.fineSilver && parseFloat(item.fineSilver) !== 0;
            const hasBalance = item.lbrBalance && parseFloat(item.lbrBalance) !== 0;
            const hasComment = item.comment?.trim();
            const hasImages = item.images?.length > 0;
            
            return hasSilver || hasBalance || hasComment || hasImages;
        });

        if (validItems.length === 0) {
            toast.error("No valid items to save.");
            return false;
        }

        setShowLoader(true);

        try {
            const endpoint = `${import.meta.env.VITE_API_URL}/diary/items`;
            const method = isUpdate ? "PUT" : "POST";

            // Prepare items payload with images
            const itemsPayload = validItems.map(item => ({
                fineSilver: parseFloat(item.fineSilver) || 0,
                lbrBalance: parseFloat(item.lbrBalance) || 0,
                comment: item.comment?.trim() || null,
                images: item.images || [] // Send base64 images array
            }));

            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cusId: cusId,
                    items: itemsPayload
                })
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message || result.error || "Failed to save items");
                return false;
            }

            toast.success(result.message);
            return true;
        } catch (error) {
            console.error("Error saving items:", error);
            toast.error("Network error. Please try again.");
            return false;
        } finally {
            setShowLoader(false);
        }
    };

    const handleSave = async () => {
        if (!validateCustomer()) return;
        if (!validateItems()) return;

        const savedCustomer = await addOrUpdateCustomer();
        if (!savedCustomer) return;

        const isUpdate = customer.cus_id !== null;
        const itemsSaved = await saveItems(savedCustomer.id, isUpdate);

        if (itemsSaved) {
            toast.success("Diary entry saved successfully!", {
                duration: 3000
            });
        }
    };

    useEffect(() => {
        if (lastRowRef.current) {
            lastRowRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }, [items.length]);

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.altKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                handleRegenerate();
            }
            if (e.altKey && e.key.toLowerCase() === 'x') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [customer, items]);

    return (
        <div className="flex gap-0">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:sticky top-0 h-screen z-50 lg:z-auto
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <SideBar showLoader={showLoader} />
            </div>

            {/* Main Content */}
            <div className="w-full lg:w-[90%] mx-auto p-3 sm:p-5">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden fixed top-4 left-4 z-30 bg-[#6366F1] text-white p-2 rounded-lg shadow-lg"
                >
                    <Menu size={24} />
                </button>

                {/* Customer Info Container */}
                <div className="bg-white mb-3 shadow-[3px_2px_10px_-1px_lightgrey] rounded-xl">
                    <div className="flex items-center justify-between border-b-2 border-gray-200 py-2 px-4 sm:px-7">
                        <h1 className="text-center whitespace-nowrap flex gap-2 sm:gap-3 font-semibold text-lg sm:text-xl mb-0">
                            <svg 
                                width="20px" 
                                height="20px" 
                                viewBox="0 0 16 16" 
                                fill="#6366F1" 
                                xmlns="http://www.w3.org/2000/svg"
                                className="sm:w-[23px] sm:h-[24px]"
                            >
                                <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" />
                                <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
                            </svg>
                            <span className="hidden sm:inline">Customer Information</span>
                            <span className="sm:hidden">Customer</span>
                        </h1>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-5 px-4 sm:px-7 pt-3 pb-4">
                        <div className="flex flex-col w-full sm:w-auto">
                            <label htmlFor="customer-name" className="text-sm font-medium text-gray-600">
                                Name<span style={{ color: 'red' }}>*</span>
                            </label>
                            <DiaryCustomerNamesComplete
                                value={customer.name}
                                setCustomer={setCustomer}
                                setIsOldCus={setIsOldCustomer}
                                setItems={setItems}
                            />
                        </div>
                        <div className="flex flex-col w-full sm:w-auto">
                            <label htmlFor="customer-phone" className="text-sm font-medium text-gray-600">
                                Phone No
                            </label>
                            <input 
                                id="customer-phone"
                                type="tel" 
                                maxLength={10}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '');
                                    setCustomer((prev) => ({ ...prev, phone: value }));
                                }} 
                                value={customer.phone || ""} 
                                placeholder="10-digit Phone" 
                                className="border border-gray-300 px-4 py-2 rounded-lg outline-none" 
                            />
                        </div>
                    </div>
                </div>

                {/* Items Container */}
                <div className="flex">
                    <div className="w-full">
                        <div className="rounded-xl shadow-[3px_2px_10px_-1px_lightgrey] bg-white mb-3">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center justify-between border-b-2 border-gray-200 py-3 px-4 sm:px-7">
                                <div className="flex gap-3 sm:gap-6 items-center w-full sm:w-auto">
                                    <div className="flex gap-2 sm:gap-3 items-center">
                                        <img src="/billIcon.svg" width={25} className="sm:w-[30px]" alt="error" />
                                        <h1 className="font-semibold text-xl sm:text-2xl">Diary Items</h1>
                                    </div>
                                    <button
                                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-800 hover:bg-gray-200/80 transition"
                                        onClick={handleRegenerate}
                                    >
                                        <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                                        <span className="hidden sm:inline">Re-generate</span>
                                    </button>
                                </div>
                                <div className="px-3 sm:px-4 py-1 sm:py-1.5 bg-green-200 border-2 border-green-600 rounded-md">
                                    <p className="text-xs sm:text-sm text-green-600 font-semibold">
                                        {customer.cus_id ? `ID: #${customer.cus_id}` : "New"}
                                    </p>
                                </div>
                            </div>

                            {/* Items Table - Scroll on mobile */}
                            <div className="overflow-x-auto px-2 sm:px-4 pt-2 pb-2">
                                <table className="border-separate border-spacing-2 w-full min-w-[800px]">
                                    <thead>
                                        <tr className="text-xs sm:text-sm">
                                            <th className="text-left font-semibold w-[150px]">FINE SILVER</th>
                                            <th className="text-left font-semibold w-[150px]">LABOUR BAL.</th>
                                            <th className="text-left font-semibold">COMMENTS</th>
                                            <th className="text-left font-semibold w-[100px]">IMAGES</th>
                                            <th className="w-[100px]"></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {items.map((item, idx) => (
                                            <tr 
                                                key={idx} 
                                                ref={idx === items.length - 1 ? lastRowRef : null} 
                                                className="align-top"
                                            >
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.fineSilver}
                                                        onChange={(e) =>
                                                            handleInputChange(idx, "fineSilver", e.target.value)
                                                        }
                                                        className="border w-full border-gray-300 px-3 py-2 rounded-lg outline-none text-sm"
                                                        placeholder="Fine Silver"
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item.lbrBalance}
                                                        onChange={(e) =>
                                                            handleInputChange(idx, "lbrBalance", e.target.value)
                                                        }
                                                        className="border w-full border-gray-300 px-3 py-2 rounded-lg outline-none text-sm"
                                                        placeholder="Labour Bal."
                                                    />
                                                </td>
                                                <td>
                                                    <textarea
                                                        className="w-full h-20 border border-gray-300 px-3 py-2 rounded-lg outline-none resize-none text-sm"
                                                        placeholder="Enter Comment"
                                                        value={item.comment}
                                                        onChange={(e) => handleInputChange(idx, 'comment', e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="flex flex-col gap-2">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            capture="environment"
                                                            ref={el => fileInputRefs.current[idx] = el}
                                                            onChange={(e) => handleImageUpload(idx, e)}
                                                            className="hidden"
                                                        />
                                                        <button
                                                            onClick={() => fileInputRefs.current[idx]?.click()}
                                                            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition"
                                                        >
                                                            <Camera size={16} />
                                                            <span>{item.images?.length || 0}</span>
                                                        </button>
                                                        {item.images?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.images.map((img, imgIdx) => (
                                                                    <div key={imgIdx} className="relative group">
                                                                        <img 
                                                                            src={`${import.meta.env.VITE_API_URL}${img}`} 
                                                                            alt={`Preview ${imgIdx + 1}`}
                                                                            className="w-12 h-12 object-cover rounded border"
                                                                        />
                                                                        <button
                                                                            onClick={() => removeImage(idx, imgIdx)}
                                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
                                                        <button
                                                            onClick={addRow}
                                                            className="bg-[#6366F1] hover:bg-[#4B50C1] transition-all duration-300 text-white p-2 rounded-lg"
                                                            title="Add Row"
                                                        >
                                                            <PlusIcon size={20} />
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteCusItem(idx)} 
                                                            className="bg-red-600 hover:bg-red-700 transition-all duration-300 text-white p-2 rounded-lg"
                                                            title="Delete Row"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 border border-[#6366F1] rounded-xl shadow-[3px_2px_10px_-1px_lightgrey] bg-white px-4 sm:px-8 py-3 sm:py-4">
                            <button
                                data-tooltip-id="regen-tip"
                                data-tooltip-content="Re-generate • Alt + Z"
                                className="flex items-center justify-center gap-3 rounded-lg border border-gray-200 bg-gray-100 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-md font-medium text-gray-800 hover:bg-gray-200/80 transition"
                                onClick={handleRegenerate}
                                disabled={showLoader}
                            >
                                <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                                Re-generate
                            </button>
                            <button 
                                onClick={handleSave}
                                data-tooltip-id="save-tip"
                                data-tooltip-content="Save • Alt + X"
                                className="bg-[#6366F1] hover:bg-[#4B50C1] cursor-pointer transition-all duration-300 text-white px-6 sm:px-8 py-3 sm:py-3.5 font-medium flex items-center justify-center gap-3 rounded-lg text-sm sm:text-md disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={showLoader}
                            >
                                {showLoader ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <NotebookPen className="h-5 w-5" />
                                        <span>Save</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster position="top-right" />
            <Tooltip id="regen-tip" place="top" className="!rounded-lg" />
            <Tooltip id="save-tip" place="top" className="!rounded-lg" />
        </div>
    );
}
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { Tooltip } from "react-tooltip";

import CustomerNamesComplete from "./CustomerNamesComplete";
import SideBar from "../../../components/layout/SideBar/SideBar";
import AddItems from "../../items/components/AddItems";

// export function RetailWholesaleToggle({ cusType = "R", setCusType, isOldCus }) {

//     return (
//         <>
//         <div
//             data-tooltip-id="cus-type-tip"
//             data-tooltip-content="Toggle customer type • Shortcut: Alt + Q"
//             className={`flex items-center bg-gray-200/80 p-1 rounded-2xl w-fit ${isOldCus ? 'opacity-80' : 'opacity-100'}`}>
//             {/* Wholesale Button */}
//             <button
//                 onClick={() => setCusType('W')}
//                 className={`px-5 py-2 rounded-2xl text-sm font-medium transition-all duration-300 outline-none
//           ${cusType === 'W'
//                         ? "bg-[#6366F1] hover:bg-[#4B50C1] text-white shadow-md"
//                         : "text-gray-700"
//                     }`}
//                 disabled={isOldCus}
//             >
//                 Wholesale
//             </button>

//             {/* Retail Button */}
//             <button
//                 onClick={() => setCusType('R')}
//                 className={`px-5 py-2 rounded-2xl text-sm font-medium transition-all duration-300 outline-none
//           ${cusType === 'R'
//                         ? "bg-[#6366F1] hover:bg-[#4B50C1] text-white shadow-md"
//                         : "text-gray-700"
//                     }`}
//                 disabled={isOldCus}
//             >
//                 Retail
//             </button>

//             <button
//                 onClick={() => setCusType('B')}
//                 className={`px-5 py-2 rounded-2xl text-sm font-medium transition-all duration-300 outline-none
//           ${cusType === 'B'
//                         ? "bg-[#6366F1] hover:bg-[#4B50C1] text-white shadow-md"
//                         : "text-gray-700"
//                     }`}
//                 disabled={isOldCus}
//             >
//                 B2B
//             </button>

//         </div>
//         <Tooltip id="cus-type-tip" place="bottom"  className="!rounded-lg" />
//         </>
//     );
// }


export default function AddCustomers({ billType = "W" }) {
    const [customer, setCustomer] = useState({
        cus_id: null,
        name: "",
        phone: null,
        address: null,
        city: null,
        silverRate: 0
    });
    const [showLoader, setShowLoader] = useState(false);
    const [cusType, setCusType] = useState(billType);
    const [isOldCus, setIsOldCus] = useState(false);
    const [silverRateInput, setSilverRateInput] = useState("");
    const [isBillGenFCur, setisBillGenFCur] = useState(null); //it contain current customer id when once bill generated

    async function handleAddCustomer() {
        try {
            setShowLoader(true);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/customer`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({ ...customer, cusType, currentCusId: isBillGenFCur })
            });
            const result = await response.json();
            // console.log(result)
            if (result.status == 'success') {
                console.log(result.message);
                const cusD = result.data;
                localStorage.setItem('mj_silver_rate', customer.silverRate);

                setCustomer((prev) => ({
                    ...prev,
                    cus_id: cusD.id,
                    phone: cusD.phone,
                    address: cusD.address,
                    city: cusD.city
                }));


                return cusD.id;
            } else if (result.status == 'error') {
                console.log("Error comes from the server...");
                console.log(result.message);
                toast.error("Something Went Wrong, Try again later!");
                return false;
            } else {
                toast.error("Something Went Wrong, Try again later!");
                console.log(result.message);
                return false;
            }

        } catch (error) {
            toast.error("Something Went Wrong, Try again later!");
            console.log("Error occur while adding new customer..");
            console.log(error);
            return false;
        } finally {
            setShowLoader(false);
        }

    }

    function formatIndianAmount(amount) {
        if (!amount) return "";
        return Number(amount).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        });
    }

    const handleSilverRateChange = (e) => {
        const rawValue = e.target.value.replace(/,/g, "");

        if (/^\d*$/.test(rawValue)) {
            setSilverRateInput(rawValue);   // raw
            setCustomer((prev) => ({
                ...prev,
                silverRate: rawValue,
            }));
        }
    };

    const handleBlur = () => {
        if (silverRateInput) {
            setSilverRateInput(
                formatIndianAmount(silverRateInput)
            );
        }
    };



    useEffect(() => {
        setCustomer((prev) => ({
            ...prev,
            cus_id: null,
            name: "",
            phone: null,
            address: null,
            city: null
        }));
    }, [cusType]);

    useEffect(() => {
        if (silverRateInput > 0) {
            setCustomer((prev) => ({ ...prev, silverRate: silverRateInput }));
        }
    }, [silverRateInput])

    // Listen to route changes to update type dynamically
    useEffect(() => {
        setCusType(billType);
    }, [billType]);

    useEffect(() => {
        const silverRate = localStorage.getItem('mj_silver_rate') ?? 0;
        setCustomer((prev) => ({ ...prev, silverRate: silverRate }));

        if (silverRate > 0) {
            setSilverRateInput(formatIndianAmount(silverRate));
        }

    }, []);

    return (
        <div className="flex gap-0">
            <SideBar showLoader={showLoader} />
            <div className="p-5 mx-auto w-[90%]">
                <div className="bg-white mb-3 shadow-[3px_2px_10px_-1px_lightgrey] rounded-xl">
                    <div className="flex items-center justify-between border-b-2 border-gray-200 py-2 px-7">
                        <h1 style={{ alignItems: 'anchor-center' }} className="text-center whitespace-nowrap flex gap-3 font-semibold text-xl mb-0">
                            <svg width="23px" height="24px" viewBox="0 0 16 16" fill="#6366F1" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" />
                                <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" />
                            </svg>
                            Customer Information ({cusType === 'W' ? 'Wholesale' : cusType === 'B' ? 'B2B' : 'Retail'})
                        </h1>
                        {/* <RetailWholesaleToggle cusType={cusType} setCusType={setCusType} isOldCus={isOldCus} /> */}
                    </div>
                    <div className="grid items-end grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-5 px-7 pt-3 pb-4">
                        <div className="flex flex-col">
                            <label htmlFor="" className="text-sm font-medium text-gray-600">Name<span style={{ color: 'red' }}>*</span></label>
                            <CustomerNamesComplete
                                value={customer.name}
                                setCustomer={setCustomer}
                                setCusType={setCusType}
                                setIsOldCus={setIsOldCus}
                                cusType={cusType}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="text-sm font-medium text-gray-600">Phone No</label>
                            <input type="number" onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))} value={customer.phone || ""} placeholder="Enter Customer Phone Number" className="border border-gray-300 px-4 py-2 rounded-lg outline-none" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="text-sm font-medium text-gray-600">Silver Rate(Per kg)<span style={{ color: 'red' }}>*</span></label>
                            <input
                                type="text"
                                value={silverRateInput}
                                onChange={handleSilverRateChange}
                                onBlur={handleBlur}
                                onFocus={() =>
                                    setSilverRateInput(
                                        customer.silverRate?.toString() || ""
                                    )
                                }
                                placeholder="Enter Silver rate"
                                className="border border-gray-300 px-4 py-2 rounded-lg outline-none"
                            />

                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="text-sm font-medium text-gray-600">Address</label>
                            <input type="text" onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))} value={customer.address || ""} placeholder="Enter Customer Address" className="border border-gray-300 px-4 py-2 rounded-lg outline-none" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="text-sm font-medium text-gray-600">City</label>
                            <input type="text" onChange={(e) => setCustomer((prev) => ({ ...prev, city: e.target.value }))} value={customer.city || ""} placeholder="Enter Customer City" className="border border-gray-300 px-4 py-2 rounded-lg outline-none" />
                        </div>

                    </div>
                </div>
                <AddItems customer={customer} cusType={cusType} setCusType={setCusType} setShowLoader={setShowLoader} handleAddCustomer={handleAddCustomer} setisBillGenFCur={setisBillGenFCur} isOldCus={isOldCus} setIsOldCus={setIsOldCus} />
            </div>
        </div>
    );
}
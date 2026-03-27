import { useState, useEffect, useRef } from "react";
import { CircleX, IndianRupee, PlusIcon, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

import {
    calculateItemAmount,
    transformPPRows,
    formatPolythenes,
    calculateNetWeight,
    roundToInt,
    roundTo,
    calculateWholesaleGrandTotal
} from '../../../utils/helpers/billingHelper.js';
import ItemAutocomplete from "../../items/components/ItemAutocomplete.jsx";
import ConfirmDialog from "../../../components/ui/Modal/ConfirmDialog.jsx";
import PPColumn from "../../../components/ui/PPColumn/PPColumn.jsx";

export default function ViewInvoices({ invoiceId, customerId, cusType, silverRate, setShowLoader, setShowInvoice, onUpdateSilverRate }) {
    const [items, setItems] = useState([
        {
            itemType: "S",
            itemIdx: null,
            itemName: '',
            rateGm: 0,
            rateKg: 0,
            ratePer: 0,
            weight: 0, // gross weight
            ppRows: [
                { count: 0, weight: 0 }
            ],
            amount: 0,
            newItems: true,
            labourType: null,
            labourNumPieces: 0,
            labourRate: 0,
            labourAmount: 0,
            comment: '' //for b2b
        }
    ]);

    const [totalAmount, setTotalAmount] = useState(0);
    const [open, setOpen] = useState(false);
    const [isAddingRow, setIsAddingRow] = useState(false);
    const [noIssItem, setNoIssItem] = useState(false);
    const [currentSilverRate, setCurrentSilverRate] = useState(silverRate || 0);
    const lastRowRef = useRef(null);

    const stringFLCMaker = (str) => {
        if (!str) {
            return "";
        }

        const strArr = str.split(" ");

        // Capitalize the first letter of each word
        const word = strArr
            .map((elm) => {
                return elm.charAt(0).toUpperCase() + elm.slice(1).toLowerCase();
            })
            .join(" ");

        return word;
    };

    function formatIndianAmount(amount) {
        return Number(amount).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        });
    }

    function convertPolyArray(arr) {
        if (!Array.isArray(arr) || arr.length === 0) {
            return [{ count: 0, weight: 0 }];
        }

        return arr.map(item => ({
            count: item?.noOfPPs ?? 0,
            weight: item?.weightOfOpp ?? 0
        }));
    }


    const closeInvoice = () => {
        setShowInvoice({
            show: false,
            invId: null,
            invoiceNo: null
        });
        setItems([]);
        setTotalAmount(0);
    }


    const handleInputChange = (idx, field, value) => {
        setItems((prev) =>
            prev.map((item, i) => {
                if (i === idx) {
                    const updatedItem = { ...item, [field]: value };

                    // Clear rateGm when switching to itemType "P" to prevent Rate % from being disabled
                    if (field === "itemType" && value === "P") {
                        updatedItem.rateGm = 0;
                        updatedItem.rateKg = 0;
                    }

                    return updatedItem;
                }
                return item;
            })
        );

    };

    const handleLabourTypeChange = (idx, value) => {
        setItems(prev =>
            prev.map((item, i) => {
                if (i === idx) {
                    return {
                        ...item,
                        labourType: value,
                        labourNumPieces: value === "P" ? item.labourNumPieces : 0
                    };
                }
                return item;
            })
        );
    };

    const addRow = () => {
        setItems((prev) => [
            ...prev,
            {
                itemType: "S",
                itemIdx: null,
                itemName: '',
                rateGm: 0,
                rateKg: 0,
                ratePer: 0,
                weight: 0, // gross weight
                ppRows: [
                    { count: 0, weight: 0 }
                ],
                amount: 0,
                newItems: true,
                labourType: null,
                labourNumPieces: 0,
                labourRate: 0,
                labourAmount: 0,
                comment: ''
            }
        ]);

        setIsAddingRow(true);
    };

    const deleteCusItem = async (idx) => {
        try {
            if (items.length === 1) {
                setOpen(true);
                return;
            }

            setItems((prev) => {
                const updated = prev.filter((item, elmIdx) => (
                    elmIdx !== idx
                ))

                // If everything is deleted, reset to one empty row
                if (updated.length === 0) {
                    // isLastItem = true;
                    return [
                        {
                            itemType: "S",
                            itemIdx: null,
                            itemName: '',
                            rateGm: 0,
                            rateKg: 0,
                            ratePer: 0,
                            weight: 0, // gross weight
                            ppRows: [
                                { count: 0, weight: 0 }
                            ],
                            amount: 0,
                            newItems: true,
                            labourType: null,
                            labourNumPieces: 0,
                            labourRate: 0,
                            labourAmount: 0,
                            comment: ''
                        }
                    ];
                }

                return updated;
            });

        } catch (error) {
            console.error(error);
            toast.error('Something Went Wrong, Try again later!');
        }
    }

    // Add this function after formatIndianAmount function
    const handlePercentageInput = (value, silverRate) => {
        if (!value) return 0;

        const strValue = String(value).trim();

        // Check if input contains '%' symbol
        if (strValue.includes('%')) {
            const percentValue = parseFloat(strValue.replace('%', '').trim());
            if (!isNaN(percentValue) && silverRate > 0) {
                // Calculate rate per kg based on percentage of silver rate
                // Formula: (silverRate * percentage) / 100
                return roundTo((silverRate * percentValue) / 100, 2);
            }
        }

        // If no '%', return the number as is
        return parseFloat(strValue) || 0;
    };

    const deleteInvoice = async () => {
        try {
            if (!invoiceId) {
                console.log("invoiceId is missing...");
                return;
            }

            setShowLoader(true);

            const delRes = await fetch(
                `${import.meta.env.VITE_API_URL}/customer-invoice/delete?invoiceId=${invoiceId}`,
                {
                    method: "DELETE"
                }
            );

            const delResult = await delRes.json();

            if (delResult.status !== 'success') {
                toast.error('Something went wrong while deleting invoice and items');
                console.log(delResult);
                return;
            }
            toast.success(delResult.message);
            setOpen(false);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error(error);
            toast.error('Something Went Wrong, Try again later!');
        }
        finally {
            setShowLoader(false);
        }
    }

    const validateAll = () => {
        // if (!silverRate || parseInt(silverRate) <= 0) {
        if (!currentSilverRate || parseInt(currentSilverRate) <= 0) {
            toast.error("Please Provide Valid Sliver Rate.");
            return false;
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const row = i + 1;

            // 1️⃣ Item name
            if (!item.itemName?.trim()) {
                toast.error(`Row ${row}: Item name is required.`);
                return false;
            }

            // 2️⃣ Rate validation
            const hasRateGm = Number(item.rateGm) > 0;
            const hasRateKg = Number(item.rateKg) > 0;
            const hasRatePer = Number(item.ratePer) > 0;

            if (!hasRateGm && !hasRateKg && !hasRatePer && cusType != 'B') {
                toast.error(`Row ${row}: Enter Rate / Gram OR Rate / KG OR Rate / %.`);
                return false;
            }

            // 3️⃣ Gross weight
            if (!item.weight || Number(item.weight) <= 0) {
                toast.error(`Row ${row}: Gross weight is required.`);
                return false;
            }

            // 4️⃣ PP rows validation
            if (!Array.isArray(item.ppRows) || item.ppRows.length === 0) {
                toast.error(`Row ${row}: At least one PP row is required.`);
                return false;
            }
            let ppW = 0;

            for (let j = 0; j < item.ppRows.length; j++) {
                const pp = item.ppRows[j];
                const ppRow = j + 1;

                if (Number(pp.count) < 0) {
                    toast.error(
                        `Row ${row}, PP ${ppRow}: No of polythenes must be greater than 0.`
                    );
                    return false;
                }

                if (Number(pp.weight) < 0) {
                    toast.error(
                        `Row ${row}, PP ${ppRow}: PP weight cannot be negative.`
                    );
                    return false;
                }

                ppW += (Number(pp.count || 0) * Number(pp.weight || 0));
            }


            // 5️⃣ Labour Validation (ONLY if customer type is W)
            if (cusType === "W") {

                if (item.labourType === "P") {
                    if (!item.labourNumPieces || Number(item.labourNumPieces) <= 0) {
                        toast.error(`Row ${row}: Number of pieces is required.`);
                        return false;
                    }
                }

            }

            if (Number(item.weight) - ppW < 0) {
                toast.error(`Row ${row}: Net Weight cannot be negative.`);
                return false;
            }

        }

        return true;
    };


    const transformItemsForBackend = (items) => {
        let total = 0;

        const updatedItems = items.map((item) => {
            // 1️⃣ Transform ppRows (swap if decimal count) using helper
            const transformedPPRows = transformPPRows(item.ppRows);

            // 2️⃣ Format polythenes for backend using helper
            const polythenes = formatPolythenes(transformedPPRows);

            // 3️⃣ Calculate gross and net weight using helper
            const grossWeight = Number(item.weight) || 0;
            const netWeight = calculateNetWeight(grossWeight, transformedPPRows);

            // 4️⃣ Calculate amount and labour using unified helper function
            const { amount, labourAmount } = calculateItemAmount(cusType, {
                grossWeight,
                ppRows: transformedPPRows,
                rateGm: item.rateGm,
                rateKg: item.rateKg,
                ratePer: item.ratePer,
                // silverRate: silverRate,
                silverRate: currentSilverRate,
                labourType: item.labourType,
                labourRate: item.labourRate,
                labourNumPieces: item.labourNumPieces
            });

            // 5️⃣ Add to total
            // total += amount;
            if (item.itemType === "S") {
                total += amount;   // customer buying
            } else if (item.itemType === "P") {
                total -= amount;   // customer giving silver
            }

            // 6️⃣ Return clean backend object with 2 decimal weights
            return {
                itemType: item.itemType,
                itemIdx: item.itemIdx,
                itemName: item.itemName,
                rateGm: item.rateGm || null,
                rateKg: item.rateKg || null,
                ratePer: item.ratePer || null,
                weight: roundTo(grossWeight, 2),      // ✅ 2 decimals
                grossWeight: roundTo(grossWeight, 2), // ✅ 2 decimals
                netWeight: roundTo(netWeight, 2),     // ✅ 2 decimals
                polythenes,
                ppRows: transformedPPRows, // use transformed!
                // ppRows: item.ppRows,
                newItems: item.newItems,
                labourType: item.labourType || null,
                labourNumPieces: item.labourNumPieces,
                labourRate: roundToInt(item.labourRate),  // ✅ Integer
                labourAmount: roundToInt(labourAmount),   // ✅ Integer
                amount: roundToInt(amount),               // ✅ Integer
                comment: item.comment
            };
        });

        return {
            updatedItems,
            total: roundToInt(total) // ✅ Total as integer
        };
    };


    const updateBill = async () => {
        try {
            if (!validateAll()) return;
            setShowLoader(true);

            // ADD ITEMS
            const { updatedItems, total } = transformItemsForBackend(items);

            if (!customerId && !invoiceId) {
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/invoice-items/add`,
                {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        Items: updatedItems,
                        CusId: customerId,
                        InvoiceNo: invoiceId + "",
                        CusType: cusType,
                        SilverRate: Number(currentSilverRate)
                        // SilverRate: Number(silverRate)
                    })
                }
            );
            const result = await response.json();

            if (result.status !== 'success') {
                toast.error('Something went wrong while adding items');
                console.log(result);
                return;
            }
            setItems(updatedItems);
            
            if(cusType == "W"){
                const val = calculateWholesaleGrandTotal(updatedItems, silverRate);
                setTotalAmount(val);
            }else{
                setTotalAmount(total);
            }
            // generateBill(isGenBill, total);

            // setAllCustomers(prev =>
            //     prev.map(customer => {
            //         if (customer.cusId !== customerId) return customer;

            //         const updatedInvoices = customer.invoices.map(inv =>
            //             inv.id === invoiceId
            //                 ? { ...inv, totalAmount: total }
            //                 : inv
            //         );

            //         const invTotalSpent = updatedInvoices.reduce(
            //             (sum, inv) => sum + inv.totalAmount,
            //             0
            //         );

            //         return {
            //             ...customer,
            //             totalSpent: invTotalSpent,
            //             invoices: updatedInvoices
            //         };
            //     })
            // );
            // updateInvoiceSilverRate();

            if (onUpdateSilverRate) {
                onUpdateSilverRate(Number(currentSilverRate));
            }

            toast.success("Items Updated Successfully!");
        } catch (error) {
            console.error(error);
            toast.error('Something Went Wrong, Try again later!');
        } finally {
            setShowLoader(false);
        }
    };

    async function fetchInvoiceItems() {
        try {
            if (!invoiceId) {
                console.log("Invoice id is required!");
                return;
            }
            setShowLoader(true);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/customer-invoice/${invoiceId}/items`);
            const result = await response.json();

            if (result.status == 'success') {
                if (!Array.isArray(result.items)) {
                    console.log("Invoice Items Not Found!");
                    return;
                }
                // console.log(result)
                let totalAm = 0;

                const mappedItems = result.items.map(item => {
                    const polythenes = item.polythenes ? convertPolyArray(item.polythenes) : [
                        { count: 0, weight: 0 }
                    ];

                    const { amount, labourAmount, netWeight } = calculateItemAmount(cusType, {
                        grossWeight: item.grossWeight,
                        ppRows: polythenes,
                        rateGm: item.measurementValue === "G" ? Number(item.rate) : 0,
                        rateKg: item.measurementValue === "K" ? Number(item.rate) : 0,
                        ratePer: item.measurementValue === "P" ? Number(item.rate) : 0,
                        // silverRate: silverRate,
                        silverRate: currentSilverRate,
                        labourType: item.labourType,
                        labourRate: item.labourRate,
                        labourNumPieces: item.labourType == 'P' ? Math.floor(item.labourAmount / item.labourRate) : 0
                    });

                    if (item.itemType === "S") {
                        totalAm += amount;   // customer buying
                    } else if (item.itemType === "P") {
                        totalAm -= amount;   // customer giving silver
                    }

                    return {
                        itemType: item.itemType,
                        itemIdx: item.id,
                        itemName: stringFLCMaker(item.itemName) || "",

                        rateGm: item.measurementValue === "G" ? Number(item.rate) : 0,
                        rateKg: item.measurementValue === "K" ? Number(item.rate) : 0,
                        ratePer: item.measurementValue === "P" ? Number(item.rate) : 0,

                        weight: roundTo(Number(item.grossWeight), 2) || 0,
                        ppRows: polythenes,

                        amount: roundToInt(amount),
                        newItems: false,
                        labourType: item.labourType,
                        labourNumPieces: (item.labourType === 'P' && Number(item.labourRate) > 0) ? Math.floor(Number(item.labourAmount) / Number(item.labourRate)) : 0,
                        // labourNumPieces: item.labourType == 'P' ? Math.floor(item.labourAmount / item.labourRate) : 0,
                        labourRate: roundToInt(item.labourRate),
                        labourAmount: roundToInt(labourAmount),
                        comment: item.comment
                    };
                });

                setItems(mappedItems);

                if(cusType == "W"){
                    const val = calculateWholesaleGrandTotal(mappedItems, silverRate);
                    setTotalAmount(val);
                }else{
                    setTotalAmount(roundToInt(totalAm));
                }
            } else if (result.status == 'error') {
                console.log("Error comes from the server...");
                console.log(result.message);
            } else {
                console.log(result.message);
            }

        } catch (error) {
            console.log("Error occur while fetching existing customer items..");
            console.log(error);
        } finally {
            setShowLoader(false);
        }
    }

    function totalNetWeightCal(grossWeight, ppRows) {
        return calculateNetWeight(grossWeight, ppRows);
    }

    useEffect(() => {
        fetchInvoiceItems();
    }, []);

    useEffect(() => {
        if (Array.isArray(items) && items.length > 0) {
            const bool = items.some((elm) => elm.itemType == "S");
            setNoIssItem(bool);
        }
    }, [items]);

    useEffect(() => {
        if (isAddingRow && lastRowRef.current) {
            lastRowRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            setIsAddingRow(false);
        }
    }, [items, isAddingRow]);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[50]">
            <ConfirmDialog
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={deleteInvoice}
                title="Delete Item"
                message="Are you sure you want to delete this last item? If you delete then Invoice will delete."
                confirmText="Delete"
                variant="danger"
            />

            <div className="w-[95%]">
                {/* Items container */}
                <div className="rounded-xl bg-white mb-3">
                    <div className="flex gap-6 items-center justify-between  border-b-2 border-gray-200 pt-5 px-7 pb-5">
                        <div style={{ alignItems: 'anchor-center' }} className="flex gap-3">
                            <img src="/billIcon.svg" width={30} alt="error" />
                            <h1 className="font-semibold text-2xl">Itemized Billing</h1>
                        </div>
                        <div className="flex gap-4 items-center">
                            {/* <div className="px-4 py-2 bg-indigo-200 border-2 border-indigo-600 rounded-md">
                                <p className="text-sm text-indigo-600 font-semibold">Silver Rate: {silverRate ?? 0}</p>
                            </div> */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-200 border-2 border-indigo-600 rounded-md">
                                <label className="text-sm text-indigo-600 font-semibold whitespace-nowrap">Silver Rate:</label>
                                <input
                                    type="number"
                                    value={currentSilverRate}
                                    onChange={(e) => setCurrentSilverRate(e.target.value)}
                                    className="w-20 bg-white/60 px-2 py-1 rounded outline-none text-sm text-indigo-700 font-bold focus:bg-white transition-colors"
                                />
                                {/* NEW BUTTON HERE */}
                                {/* <button
                                    onClick={updateInvoiceSilverRate}
                                    className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 transition duration-300"
                                    title="Save Silver Rate"
                                >
                                    <RefreshCw size={14} />
                                </button> */}
                            </div>
                            <div className="px-4 py-2 bg-green-200 border-2 border-green-600 rounded-md">
                                <p className="text-sm text-green-600 font-semibold">INV: {invoiceId ? ("#" + invoiceId) : "New"}</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 pt-2 pb-2 max-h-[60vh] overflow-auto">
                        <table className="border-separate border-spacing-2">
                            <thead>
                                <tr className="text-sm">
                                    <th></th>
                                    <th className="text-left font-semibold w-full">NAME</th>
                                    <th className="text-left font-semibold whitespace-nowrap" colSpan={!noIssItem ? 2 : 0}>GR. WT(g)</th>
                                    {noIssItem && <th className="text-left font-semibold">PP</th>}
                                    {cusType != 'B' ? <th className="text-left font-semibold whitespace-nowrap" colSpan={!noIssItem ? 2 : 0}>RATE %</th> : <></>}
                                    {(cusType != 'B' && noIssItem) ? <th className="text-left font-semibold whitespace-nowrap">RATE / KG</th> : ''}
                                    {(cusType != 'B' && noIssItem) ? <th className="text-left font-semibold whitespace-nowrap">RATE / G</th> : <></>}
                                    {cusType == 'W' ? <th className="text-left font-semibold whitespace-nowrap">LBR TYPE</th> : ""}
                                    {cusType == 'W' ? <th className="text-left font-semibold whitespace-nowrap">LBR RATE</th> : ""}
                                    {/* {cusType == 'W' ? <th className="text-left font-semibold whitespace-nowrap">LBR AMT.</th> : ""} */}
                                    {/* {cusType != 'B' ? <th className="text-left font-semibold">AMT.</th> : <></>} */}
                                    {/* {cusType == 'B' ? <th className="text-center font-semibold">NET. WT.</th> : ''} */}
                                    <th className="text-center font-semibold">ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items
                                    .map((item, idx) => (
                                        <tr key={idx} ref={idx === items.length - 1 ? lastRowRef : null} className="align-top">
                                            <td>
                                                <div className="flex items-center bg-gray-200/80 p-1 rounded-lg w-fit">
                                                    <button
                                                        onClick={() => handleInputChange(idx, "itemType", "S")}
                                                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 outline-none
                                                            ${item.itemType === 'S' ? "bg-[#6366F1] hover:bg-[#4B50C1] text-white shadow-md" : "text-gray-700"}    
                                                            `
                                                        }
                                                    >S</button>
                                                    <button
                                                        onClick={() => handleInputChange(idx, "itemType", "P")}
                                                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 outline-none
                                                            ${item.itemType === 'P' ? "bg-[#6366F1] hover:bg-[#4B50C1] text-white shadow-md" : "text-gray-700"}`
                                                        }
                                                    >
                                                        P
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <ItemAutocomplete
                                                    value={item.itemName}
                                                    idx={idx}
                                                    onChange={(val) =>
                                                        handleInputChange(idx, "itemName", val)
                                                    }
                                                    setItems={setItems}
                                                    cusType={cusType}
                                                />
                                            </td>
                                            {/* <td>
                                                <input
                                                    type="number"
                                                    value={item.weight}
                                                    onChange={(e) =>
                                                        handleInputChange(idx, "weight", parseFloat(e.target.value))
                                                    }
                                                    className="border w-full border-gray-300 px-4 py-2 rounded-lg outline-none"
                                                    placeholder="Gross Weight"
                                                />
                                            </td> */}
                                            {/* {(item.itemType == 'I') && <td>
                                                <PPColumn
                                                    itemIndex={idx}
                                                    ppRows={item.ppRows}
                                                    setItems={setItems}
                                                />
                                            </td>} */}
                                            {item.itemType === "P" ? (
                                                <td className="w-24" colSpan={2}>
                                                    <input
                                                        type="number"
                                                        value={item.weight ?? ""}
                                                        onChange={(e) =>
                                                            handleInputChange(idx, "weight", parseFloat(e.target.value))
                                                        }
                                                        className="border w-full border-gray-300 px-4 py-2 rounded-lg outline-none"
                                                        placeholder="Gross Weight"
                                                    />
                                                </td>
                                            ) : (
                                                <>
                                                    <td className="w-24">
                                                        <input
                                                            type="number"
                                                            value={item.weight ?? ""}
                                                            onChange={(e) =>
                                                                handleInputChange(idx, "weight", parseFloat(e.target.value))
                                                            }
                                                            className="border w-full border-gray-300 px-4 py-2 rounded-lg outline-none"
                                                            placeholder="Gross Weight"
                                                        />
                                                    </td>

                                                    <td>
                                                        <PPColumn
                                                            itemIndex={idx}
                                                            ppRows={item.ppRows}
                                                            setItems={setItems}
                                                        />
                                                    </td>
                                                </>
                                            )}

                                            {cusType != 'B' ? <td className="min-w-[60px]" colSpan={item.itemType === "P" ? 2 : 0} >
                                                <input
                                                    type="number"
                                                    value={item.ratePer}
                                                    onChange={(e) =>
                                                        handleInputChange(idx, "ratePer", parseFloat(e.target.value))
                                                    }
                                                    disabled={item.rateGm > 0 || item.rateKg > 0}
                                                    className={`border w-full border-gray-300 px-4 py-2 rounded-lg outline-none ${item.rateGm > 0 || item.rateKg > 0 ? 'bg-[#d3d3d39e]' : ''}`}
                                                    placeholder="Rate (%)"
                                                />
                                            </td> : <></>}

                                            {cusType != 'B' && item.itemType !== "P" &&
                                                <td className="min-w-[75px]">
                                                    <input
                                                        type="text"
                                                        value={item.rateKg ?? ""}
                                                        onChange={(e) => {
                                                            const inputValue = e.target.value;

                                                            // Allow only numbers and %
                                                            if (!/^\d*\.?\d*%?$/.test(inputValue)) return;

                                                            // If input contains '%', convert immediately
                                                            if (inputValue.includes('%')) {
                                                                // const convertedValue = handlePercentageInput(inputValue, silverRate);
                                                                const convertedValue = handlePercentageInput(inputValue, currentSilverRate);
                                                                handleInputChange(idx, "rateKg", convertedValue);
                                                            } else {
                                                                handleInputChange(idx, "rateKg", inputValue);
                                                            }
                                                        }}
                                                        disabled={item.ratePer > 0 || item.rateGm > 0}
                                                        className={`border w-full border-gray-300 px-4 py-2 rounded-lg outline-none ${item.ratePer > 0 || item.rateGm > 0 ? 'bg-[#d3d3d39e]' : ''}`}
                                                        placeholder="Rate (kg)"
                                                    />
                                                </td>
                                            }

                                            {cusType != 'B' && item.itemType !== "P" ? <td className="min-w-[70px]">
                                                <input
                                                    type="number"
                                                    value={item.rateGm}
                                                    onChange={(e) =>
                                                        handleInputChange(idx, "rateGm", parseFloat(e.target.value))
                                                    }
                                                    disabled={item.ratePer > 0 || item.rateKg > 0}
                                                    className={`border w-full border-gray-300 px-4 py-2 rounded-lg outline-none ${item.ratePer > 0 || item.rateKg > 0 ? 'bg-[#d3d3d39e]' : ''}`}
                                                    placeholder="Rate (gm)"
                                                />
                                            </td> : <></>}

                                            {cusType == 'W' ? <><td className="min-w-[110px]">
                                                <div className="flex border border-gray-300 rounded-lg">
                                                    <select
                                                        value={item.labourType || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;

                                                            handleLabourTypeChange(idx, value);
                                                        }}
                                                        className={`w-full px-4 text-sm py-2 rounded-lg outline-none`}
                                                    >
                                                        <option value="" className="text-sm">Select Type</option>
                                                        <option value="P" className="text-sm">Pieces</option>
                                                        <option value="K" className="text-sm">Kilo</option>
                                                        <option value="G" className="text-sm">Gram</option>
                                                    </select>

                                                    {item.labourType == 'P' &&
                                                        <input
                                                            type="number"
                                                            value={item.labourNumPieces}
                                                            onChange={(e) =>
                                                                handleInputChange(idx, "labourNumPieces", parseFloat(e.target.value))
                                                            }
                                                            className="border-l w-full border-gray-300 px-4 py-2 rounded-tr-lg rounded-br-lg outline-none"
                                                            placeholder="No. of pieces"
                                                        />
                                                    }
                                                </div>
                                            </td>
                                                <td className="min-w-[75px]">
                                                    <input
                                                        type="number"
                                                        value={item.labourRate}
                                                        onChange={(e) =>
                                                            handleInputChange(idx, "labourRate", parseFloat(e.target.value))
                                                        }
                                                        className="border w-full border-gray-300 px-4 py-2 rounded-lg outline-none"
                                                        placeholder="Labour Rate"
                                                    />
                                                </td>
                                            </> : ""}


                                            {/* {cusType == 'W' ?
                                                <td className="pr-4 whitespace-nowrap font-semibold">
                                                    Rs. {formatIndianAmount(item.labourAmount)}
                                                </td> : <></>} */}
                                            {/* {cusType != 'B' ? <td className="pr-4 whitespace-nowrap font-semibold">
                                                Rs. {formatIndianAmount(item.amount)}
                                            </td> : <></>} */}
                                            {/* {cusType == 'B' ? <td className="pr-4 whitespace-nowrap font-semibold"> */}
                                            {/* {totalNetWeightCal(item.weight, item.ppRows) || 0}/g */}
                                            {/* {item.netWeight ?? 0}/g */}
                                            {/* </td> : <></>} */}
                                            <td className="text-center flex items-center gap-2">
                                                <button
                                                    onClick={addRow}
                                                    className="bg-[#6366F1] hover:bg-[#4B50C1] transition-background duration-500 text-white p-2 font-semibold flex items-center gap-2 rounded-lg text-md w-fit"
                                                >
                                                    <PlusIcon />
                                                </button>
                                                <button onClick={() => deleteCusItem(idx, item.itemIdx)} className="bg-red-600 hover:bg-red-700 transition-background duration-500 text-white cursor-pointer p-2 px-3 font-semibold rounded-lg text-md w-fit mx-auto outline-none border-none"><Trash2 size={23} /></button>
                                            </td>
                                            {cusType == 'B' &&
                                                <td className="">
                                                    <textarea
                                                        className="ml-2 w-[45vh] relative bottom-4 h-20 border border-gray-300 px-4 py-2 rounded-lg outline-none"
                                                        name=""
                                                        id=""
                                                        placeholder="Enter Your Comment"
                                                        value={item.comment}
                                                        onChange={(e) => handleInputChange(idx, 'comment', e.target.value)}
                                                    ></textarea>
                                                </td>
                                            }
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between border border-[#6366F1] rounded-xl bg-white overflow-hidden px-8 py-6">
                    <div className="ml-1">
                        <p className="text-gray-600 font-semibold text-sm">NET AMOUNT</p>
                        <h1 className="font-bold text-[#6366F1] flex items-center text-3xl"><IndianRupee strokeWidth={3} size={28} /> {formatIndianAmount(totalAmount)}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={updateBill} className="bg-black/80 hover:bg-black/90 cursor-pointer transition-background duration-500 text-white pl-5 pr-8 py-3 font-medium flex items-center gap-3 rounded-lg text-md w-fit">
                            <RefreshCw className="w-5 h-5" />
                            Update
                        </button>
                        <button
                            className="
                                    flex items-center gap-3
                                    rounded-lg
                                    bg-red-500 px-8 py-3.5
                                    text-md font-medium text-white
                                    hover:bg-red-600
                                    transition
                                "
                            onClick={closeInvoice}
                        >
                            <CircleX className="h-6 w-6 text-white" />
                            Close
                        </button>
                    </div>
                </div>
            </div>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        pointerEvents: "none",
                    },
                }}
            />
        </div>
    );
}
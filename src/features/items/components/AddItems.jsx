import { useState, useEffect, useRef } from "react";
import { IndianRupee, PlusIcon, RotateCcw, Trash2 } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

import { BillPDF } from "../../billing/components/BillPDF.jsx";
import { WholeSalerBillPDFA } from "../../billing/components/WholeSalerBillPDF_.jsx";
import { B2BBillPDF } from "../../billing/components/B2BBillPDF.jsx";
import ItemAutocomplete from "./ItemAutocomplete.jsx";
import PPColumn from "../../../components/ui/PPColumn/PPColumn.jsx";
import {
    calculateItemAmount,
    transformPPRows,
    formatPolythenes,
    roundTo,
    calculateNetWeight,
    roundToInt,
    calculateWholesaleGrandTotal 
} from '../../../utils/helpers/billingHelper.js';
import { useKeyboardShortcuts } from "../../../hooks/useKeyboardShortcuts.js";

const BILL_TYPES = ["W", "R", "B"];
const TYPE_LABELS = { W: "Wholesale", R: "Retail", B: "B2B" };

export default function AddItems({ customer, cusType, setCusType, setShowLoader, handleAddCustomer, setisBillGenFCur, isOldCus, setIsOldCus }) {
    const [items, setItems] = useState([
        {
            itemType: "S", //S mean Sell and P mean Purchase
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
    const [invoiceNo, setInvoiceNo] = useState(null);
    const [noIssItem, setNoIssItem] = useState(false);

    const lastRowRef = useRef(null);
    const navigate = useNavigate();

    const cycleBillType = () => {
        if (isOldCus) {
            // alert("hola")
            return;
        }
        setCusType(prev => {
            const next = BILL_TYPES[(BILL_TYPES.indexOf(prev) + 1) % BILL_TYPES.length];
            toast.success(`Switched to ${TYPE_LABELS[next]}`);
            return next;
        });
    };
    // useEffect(()=>{
    //     console.log(cusType);
    // },[cusType])
    // useKeyboardShortcuts([
    //     { key: "q", altKey: true, callback: cycleBillType },           // Q → cycle W→R→B→W
    //     { key: "z", altKey: true, callback: () => handleRegenerate() },// Alt+Z → Re-generate
    //     { key: "x", altKey: true, callback: () => previewBill() },
    //     { key: "n", altKey: true, callback: () => navigate("/") },
    //     { key: "i", altKey: true, callback: () => navigate("/customerInvoices") },
    //     { key: "b", altKey: true, callback: () => navigate("/b2bTransactions") },
    // ]);

    useKeyboardShortcuts([
        { key: "z", altKey: true, callback: () => handleRegenerate() },
        { key: "x", altKey: true, callback: () => previewBill() },
        { key: "r", altKey: true, callback: () => navigate("/retail") },             // Retail
        { key: "w", altKey: true, callback: () => navigate("/") },    // Wholesale
        { key: "b", altKey: true, callback: () => navigate("/b2b") },          // B2B Bill
        { key: "i", altKey: true, callback: () => navigate("/customerInvoices") },
        { key: "t", altKey: true, callback: () => navigate("/b2bTransactions") }, // Transactions
    ]);

    function formatIndianAmount(amount) {
        return Number(amount).toLocaleString("en-IN", {
            maximumFractionDigits: 2,
        });
    }

    const handleRegenerate = () => {
        window.location.reload();
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
    };

    const deleteCusItem = async (itemIdx, db_item_idx) => {
        setItems((prev) => {
            const updated = prev.filter((item, idx) => (
                idx !== itemIdx
            ))

            // If everything is deleted, reset to one empty row
            if (updated.length === 0) {
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

    }

    const validateAll = () => {
        if (!customer.name?.trim()) {
            toast.error("Please Enter Customer Name.");
            return false;
        }

        if (!customer.silverRate || Number(customer.silverRate) <= 0) {
            toast.error("Please Enter Valid Silver Rate.");
            return false;
        }

        if (customer.phone && customer.phone.length !== 10) {
            toast.error("Phone Number Size Should be 10 Digits.");
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

    const transformItemsForBackend = (items, cusType, customer) => {
        let total = 0;

        const updatedItems = items.map((item) => {
            // 1️⃣ Transform ppRows (swap count/weight if count is decimal)
            const transformedPPRows = transformPPRows(item.ppRows);

            // 2️⃣ Format polythenes for backend
            const polythenes = formatPolythenes(transformedPPRows);

            // 3️⃣ Calculate net weight
            const grossWeight = Number(item.weight) || 0;
            const netWeight = calculateNetWeight(grossWeight, transformedPPRows);
            // console.log(customer);

            // 4️⃣ Calculate item amount using unified helper function
            const { amount, labourAmount } = calculateItemAmount(cusType, {
                grossWeight,
                ppRows: transformedPPRows,
                rateGm: item.rateGm,
                rateKg: item.rateKg,
                ratePer: item.ratePer,
                silverRate: customer.silverRate,
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

            // 6️⃣ Return clean backend object
            return {
                itemType: item.itemType,
                itemIdx: item.itemIdx,
                itemName: item.itemName,
                rateGm: item.rateGm || null,
                rateKg: item.rateKg || null,
                ratePer: item.ratePer || null,
                weight: roundTo(grossWeight, 2),
                grossWeight: roundTo(grossWeight, 2),
                netWeight: roundTo(netWeight, 2),
                polythenes,
                ppRows: transformedPPRows, // use transformed!
                // ppRows: item.ppRows, // Keep original for reference
                newItems: item.newItems,
                labourType: item.labourType || null,
                labourNumPieces: item.labourNumPieces,
                labourRate: roundToInt(item.labourRate) || 0,
                labourAmount: labourAmount,
                amount: amount,
                comment: item.comment
            };
        });

        return {
            updatedItems,
            total: roundToInt(total)
        };
    };

    async function previewBill() {
        try {
            if (!validateAll()) return;
            setShowLoader(true);

            const cusId = await handleAddCustomer();

            if (!cusId) {
                return;
            }

            const { updatedItems, total } = transformItemsForBackend(items, cusType, customer);
            // console.log(updatedItems);
            // console.log(total);
            // return;

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/invoice-items/add`,
                {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({
                        Items: updatedItems,
                        CusId: cusId,
                        CusType: cusType,
                        CustomerName: customer.name, //sending this for msg
                        InvoiceNo: invoiceNo,
                        SilverRate: Number(customer.silverRate),
                        SendWhatsAppMsg: true //sending this for msg
                    })
                }
            );
            const result = await response.json();


            if (result.status !== 'success') {
                toast.error('Something went wrong while adding items');
                console.log(result);
                return;
            }

            setInvoiceNo(result.inv_no);
            setisBillGenFCur(cusId);
            setItems(updatedItems);
            
            if(cusType == "W"){
                const val =  calculateWholesaleGrandTotal(items, customer.silverRate);
                setTotalAmount(val);
            }else{
                setTotalAmount(total);
            }

            const blob = await pdf(getBillPDF(cusType, updatedItems, customer.silverRate)
            ).toBlob();

            window.open(URL.createObjectURL(blob));

        } catch (error) {
            console.error(error);
            toast.error('Something Went Wrong, Try again later!');
        } finally {
            setShowLoader(false);
        }
    };

    function getBillPDF(cusType, updatedItems, silverRate) {
        const isPExists = updatedItems.some((item) => item.itemType == "P");
        const isSExists = updatedItems.some((item) => item.itemType == "S");

        switch (cusType) {
            case 'R':
                return <BillPDF items={updatedItems} silverRate={silverRate} isPExists={isPExists} isSExists={isSExists} />
            case 'W':
                return <WholeSalerBillPDFA items={updatedItems} silverRate={silverRate} isPExists={isPExists} isSExists={isSExists} />
            default:
                return <B2BBillPDF items={updatedItems} silverRate={silverRate} isPExists={isPExists} isSExists={isSExists} />
        }
    }

    useEffect(() => {
        if (Array.isArray(items) && items.length > 0) {
            const bool = items.some((elm) => elm.itemType == "S");
            setNoIssItem(bool);
        }
    }, [items]);

    useEffect(() => {
        if (lastRowRef.current) {
            lastRowRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }, [items.length]);

    useEffect(() => {
        setInvoiceNo(null);
        setItems([
            {
                itemType: "S",
                itemIdx: null,
                itemName: '',
                rateGm: 0,
                ratePer: 0,
                rateKg: 0,
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
    }, [cusType])

    useEffect(() => {
        if (invoiceNo) {
            setIsOldCus(true);
        }
    }, [invoiceNo]);

    return (
        <div className="flex">
            <div className="w-full">
                {/* Items container */}
                <div className="rounded-xl shadow-[3px_2px_10px_-1px_lightgrey] bg-white mb-3">
                    <div className="flex gap-6 items-center justify-between  border-b-2 border-gray-200 py-3 px-7">
                        <div className="flex gap-6 items-end">
                            <div style={{ alignItems: 'anchor-center' }} className="flex gap-3">
                                <img src="/billIcon.svg" width={30} alt="error" />
                                <h1 className="font-semibold text-2xl">Itemized Billing</h1>
                            </div>
                            <div>
                                <button
                                    className="
                                        flex items-center gap-2
                                        rounded-lg border border-gray-200
                                        bg-gray-100 px-4 py-2
                                        text-sm font-medium text-gray-800
                                        hover:bg-gray-200/80
                                        transition
                                    "
                                    onClick={handleRegenerate}
                                >
                                    <RotateCcw className="h-4 w-4 text-gray-600" />
                                    Re-generate
                                </button>
                            </div>
                        </div>
                        <div className="px-4 py-1.5 bg-green-200 border-2 border-green-600 rounded-md">
                            <p className="text-sm text-green-600 font-semibold">INV: {invoiceNo ? ("#" + invoiceNo) : "New"}</p>
                        </div>
                    </div>
                    <div className="px-4 pt-2 pb-2">
                        <table className="border-separate border-spacing-2">
                            <thead>
                                <tr className="text-sm">
                                    <th></th>
                                    <th className="text-left font-semibold w-full">NAME</th>
                                    <th className="text-left font-semibold whitespace-nowrap" colSpan={!noIssItem ? 2 : 0}>GR. WT(g)</th>
                                    {noIssItem && <th className="text-left font-semibold">PP</th>}
                                    {cusType != 'B' ? <th className="text-left font-semibold whitespace-nowrap" colSpan={!noIssItem ? 2 : 0}>RATE %</th> : ''}
                                    {(cusType != 'B' && noIssItem) ? <th className="text-left font-semibold whitespace-nowrap">RATE / KG</th> : ''}
                                    {(cusType != 'B' && noIssItem) ? <th className="text-left font-semibold whitespace-nowrap">RATE / G</th> : ''}
                                    {cusType == 'W' ? <th className="text-left font-semibold whitespace-nowrap">LBR TYPE</th> : ""}
                                    {cusType == 'W' ? <th className="text-left font-semibold whitespace-nowrap">LBR RATE</th> : ""}
                                    {/* {cusType == 'W' ? <th className="text-left font-semibold whitespace-nowrap">LBR AMT.</th> : ""} */}
                                    {/* {cusType != 'B' ? <th className="text-left font-semibold">AMT.</th> : ''} */}
                                    {/* {cusType == 'B' ? <th className="text-center font-semibold">NET. WT.</th> : ''} */}
                                    <th className="text-center font-semibold">ACTION</th>
                                    <th></th>
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
                                            <td className="">
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
                                            {/* <td className="w-24" colSpan={item.itemType == 'R'?2:0}>
                                                <input
                                                    type="number"
                                                    value={item.weight ?? ""}
                                                    onChange={(e) =>
                                                        handleInputChange(idx, "weight", parseFloat(e.target.value))
                                                    }
                                                    className="border w-full border-gray-300 px-4 py-2 rounded-lg outline-none"
                                                    placeholder="Gross Weight"
                                                />
                                            </td> */}
                                            {item.itemType === "P" ? (
                                                <td className="w-20" colSpan={2}>
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
                                                    <td className="w-20">
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
                                            {/* <td> {(item.itemType == 'I') &&
                                                <PPColumn
                                                    itemIndex={idx}
                                                    ppRows={item.ppRows}
                                                    setItems={setItems}
                                                />}
                                            </td> */}
                                            {cusType != 'B' &&
                                                <td className="min-w-[60px]" colSpan={item.itemType === "P" ? 2 : 0} >
                                                    <input
                                                        type="number"
                                                        value={item.ratePer ?? ""}
                                                        onChange={(e) =>
                                                            handleInputChange(idx, "ratePer", parseFloat(e.target.value))
                                                        }
                                                        disabled={item.rateGm > 0 || item.rateKg > 0}
                                                        className={`border w-full border-gray-300 px-4 py-2 rounded-lg outline-none ${item.rateGm > 0 || item.rateKg > 0 ? 'bg-[#d3d3d39e]' : ''}`}
                                                        placeholder="Rate (%)"
                                                    />
                                                </td>}
                                            {cusType != 'B' && item.itemType !== "P" &&
                                                <td className="min-w-[75px]">
                                                    <input
                                                        type="text"
                                                        value={item.rateKg ?? ""}
                                                        onChange={(e) => {
                                                            let inputValue = e.target.value;

                                                            // Allow only numbers and %
                                                            if (!/^\d*\.?\d*%?$/.test(inputValue)) return;

                                                            // If input contains '%', convert immediately
                                                            if (inputValue.includes('%')) {
                                                                const convertedValue = handlePercentageInput(inputValue, customer.silverRate);
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
                                            {cusType != 'B' && item.itemType !== "P" &&
                                                <td className="min-w-[70px]">
                                                    <input
                                                        type="number"
                                                        value={item.rateGm ?? ""}
                                                        onChange={(e) =>
                                                            handleInputChange(idx, "rateGm", parseFloat(e.target.value))
                                                        }
                                                        disabled={item.ratePer > 0 || item.rateKg > 0}
                                                        className={`border w-full border-gray-300 px-4 py-2 rounded-lg outline-none ${item.ratePer > 0 || item.rateKg > 0 ? 'bg-[#d3d3d39e]' : ''}`}
                                                        placeholder="Rate (gm)"
                                                    />
                                                </td>
                                            }

                                            {cusType == 'W' &&
                                                <td className="min-w-[100px]">
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
                                                                value={item.labourNumPieces ?? ""}
                                                                onChange={(e) =>
                                                                    handleInputChange(idx, "labourNumPieces", parseInt(e.target.value))
                                                                }
                                                                className="border-l w-full border-gray-300 px-4 py-2 rounded-tr-lg rounded-br-lg outline-none"
                                                                placeholder="No. of pieces"
                                                            />
                                                        }
                                                    </div>
                                                </td>
                                            }
                                            {cusType == 'W' &&
                                                <td className="min-w-[80px]">
                                                    <input
                                                        type="number"
                                                        value={item.labourRate ?? ""}
                                                        onChange={(e) =>
                                                            handleInputChange(idx, "labourRate", parseFloat(e.target.value))
                                                        }
                                                        className="border w-full border-gray-300 px-4 py-2 rounded-lg outline-none"
                                                        placeholder="Labour Rate"
                                                    />
                                                </td>
                                            }


                                            {/* {cusType == 'W' ?
                                                <td className="pr-4 whitespace-nowrap font-semibold">
                                                    Rs. {formatIndianAmount(item.labourAmount)}
                                                </td> : <></>}
                                            {cusType != 'B' ? <td className="pr-4 whitespace-nowrap font-semibold">
                                                Rs. {formatIndianAmount(item.amount)}
                                            </td> : <></>} */}
                                            {/* {cusType == 'B' ? <td className="pr-4 whitespace-nowrap font-semibold">
                                                {item.netWeight ?? 0}/g
                                            </td> : <></>} */}

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
                                                        className="ml-2 w-[45vh] relative bottom-3.5 h-20 border border-gray-300 px-4 py-2 rounded-lg outline-none"
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

                <div className="flex items-center justify-between border border-[#6366F1] rounded-xl shadow-[3px_2px_10px_-1px_lightgrey] bg-white overflow-hidden px-8 py-4">
                    <div className="ml-1">
                        <p className="text-gray-600 font-semibold text-sm">NET AMOUNT</p>
                        <h1 className="font-bold text-[#6366F1] flex items-center text-3xl"><IndianRupee strokeWidth={3} size={28} /> {formatIndianAmount(totalAmount)}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            data-tooltip-id="regen-tip"
                            data-tooltip-content="Re-generate bill • Shortcut: Alt + Z"
                            className="
                                    flex items-center gap-3
                                    rounded-lg border border-gray-200
                                    bg-gray-100 px-8 py-3.5
                                    text-md font-medium text-gray-800
                                    hover:bg-gray-200/80
                                    transition
                                "
                            onClick={handleRegenerate}
                        >
                            <RotateCcw className="h-6 w-6 text-gray-600" />
                            Re-generate
                        </button>
                        <button onClick={previewBill}
                            data-tooltip-id="bill-tip"
                            data-tooltip-content="Generate bill • Shortcut: Alt + X"
                            className="bg-[#6366F1] hover:bg-[#4B50C1] cursor-pointer transition-background duration-500 text-white px-8 py-3.5 font-medium flex items-center gap-3 rounded-lg text-md w-fit"
                        >
                            <img src="/printer-white.svg" width={25} alt="error" />
                            <span>
                                Generate Bill
                            </span>
                        </button>
                    </div>
                    <Tooltip id="regen-tip" place="top" className="!rounded-lg" />
                    <Tooltip id="bill-tip" place="top" className="!rounded-lg" />
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
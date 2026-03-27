import { Minus, Plus } from "lucide-react";

const PPColumn = ({ itemIndex, ppRows, setItems }) => {
    const HIGHLIGHT = "#6366F1";

    const formatNoRound = (num, decimals = 2) => {
        if (Number.isInteger(num)) return num;

        const [int, dec = ""] = num.toString().split(".");
        return dec
            ? Number(`${int}.${dec.slice(0, decimals)}`)
            : num;
    };

    const updatePP = (ppIndex, field, value) => {
        setItems(prev =>
            prev.map((item, i) =>
                i === itemIndex
                    ? {
                        ...item,
                        ppRows: item.ppRows.map((pp, j) =>
                            j === ppIndex ? { ...pp, [field]: value } : pp
                        )
                    }
                    : item
            )
        );
    };

    const addPP = () => {
        setItems(prev =>
            prev.map((item, i) =>
                i === itemIndex
                    ? { ...item, ppRows: [...item.ppRows, { count: 0, weight: 0 }] }
                    : item
            )
        );
    };

    const removePP = (ppIndex) => {
        setItems(prev =>
            prev.map((item, i) => {
                if (i !== itemIndex) return item;

                const updatedPPRows = item.ppRows.filter((_, j) => j !== ppIndex);

                return {
                    ...item,
                    ppRows:
                        updatedPPRows.length > 0
                            ? updatedPPRows
                            : [{ count: 0, weight: 0 }] // empty row
                };
            })
        );
    };



    const totalPP = () => {
        return ppRows.reduce((sum, pp) => {
            return sum + (pp.count * pp.weight);
        }, 0);
    };


    return (
        <div className="flex flex-col gap-1 min-w-[160px]">
            {ppRows.map((pp, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                    <input
                        type="number"
                        value={pp.count}
                        min={0}
                        onChange={(e) =>
                            updatePP(idx, "count", parseFloat(e.target.value))
                        }
                        className="w-11 border border-gray-300 px-2.5 py-1.5 rounded-md outline-none"
                    />

                    <input
                        type="number"
                        value={pp.weight}
                        min={0}
                        onChange={(e) =>
                            updatePP(idx, "weight", parseFloat(e.target.value))
                        }
                        className="w-11 border border-gray-300 px-2.5 py-1.5 rounded-md outline-none"
                    />

                    <div className="flex items-center gap-1">
                        <button
                            onClick={addPP}
                            className="bg-indigo-100 text-indigo-600 hover:border-indigo-600 border border-white transition-border duration-500 px-2 py-2 rounded-full"
                        >
                            <Plus size={14} />
                        </button>
                        <button
                            onClick={() => removePP(idx)}
                            className="bg-red-100 text-red-600 hover:border-red-600 border border-white transition-border duration-500 px-2 py-2 rounded-full"
                        >
                            <Minus size={14} />
                        </button>
                    </div>
                </div>
            ))}

            {/* <button
                onClick={addPP}
                className="text-sm font-semibold mt-1 text-start"
                style={{ color: HIGHLIGHT }}
            >
                + ADD PP
            </button> */}

            {/* <div className="flex justify-between text-sm pt-1 px-2 border-t border-gray-200">
                <span className="text-gray-400 font-semibold">TOTAL PP:</span>
                <span className="font-semibold" style={{ color: HIGHLIGHT }}>
                    {formatNoRound(totalPP()) || 0} g
                </span>
            </div> */}
        </div>
    );
};

export default PPColumn;

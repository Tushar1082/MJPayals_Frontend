import { Combobox } from "@headlessui/react";
import { useState, useEffect } from "react";

export default function ItemAutocomplete({ value, onChange, onSelect, idx, setItems, cusType }) {
    const [query, setQuery] = useState("");
    const [fetchItems, setFetchItems] = useState([]);

    const fetchSuggestions = async (q) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/invoice-items/search?q=${encodeURIComponent(q)}&&cusType=${cusType}`
            );
            const data = await res.json();

            if (data.status === "success") {
                setFetchItems(data.data);
            }
        } catch (err) {
            console.error("Suggestion error:", err);
        }
    };

    const fetchRate = async (itemName) => {
        try {

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/invoice-items/fetch-rate?item_name=${encodeURIComponent(itemName)}&&cusType=${cusType}`
            );
            const data = await res.json();

            if (data.status === "success") {

                if (data?.rate == null || !data?.rateType) {
                    return;
                }

                let ppRows= [];

                if(data?.polythenes){
                    if(Array.isArray(data.polythenes)){
                        data.polythenes.forEach((elm)=>{
                            ppRows.push({
                                // count: elm.noOfPPs,
                                count: 0,
                                weight: elm.weightOfOpp
                            });
                        });
                    }
                }

                if(ppRows.length==0){
                    ppRows.push({ count: 0, weight: 0 });
                }

                setItems((prev) =>
                    prev.map((it, i) => {
                        if (i === idx) {

                            return {
                                ...it,
                                rateGm: data.rateType === "gram" ? data.rate : 0,
                                ratePer: data.rateType === "percentage" ? data.rate : 0,
                                rateKg: data.rateType === "kilogram" ? data.rate : 0,
                                ppRows,
                                labourType: data.labourType,
                                labourNumPieces: data.labourType == "P"? Math.floor(data.labourAmount/data.labourRate):0, 
                                labourRate: data.labourRate,
                                labourAmount: data.labourAmount
                            };
                        }
                        return it;
                    })
                );
            }
        } catch (error) {
            console.error("Rate fetch error:", error);
        }
    };

    useEffect(() => {
        if (!query.trim()) {
            setFetchItems([]);
            return;
        }

        fetchSuggestions(query);
        // const timer = setTimeout(() => {
        // }, 500); // 1 second delay

        // return () => clearTimeout(timer); // clear if user types again
    }, [query]);

    useEffect(()=>{
        if(cusType){
            setQuery('');
            setFetchItems([]);
        }
    },[cusType]);

    return (
        <Combobox
            value={value}
            onChange={(val) => {
                onChange(val);
                fetchRate(val);
                onSelect?.(val);
            }}
        >
            <div className="relative">
                <Combobox.Input
                    autoComplete="off"
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Item"
                    value={value}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        onChange(e.target.value);
                    }}
                />

                {fetchItems.length > 0 && (
                    <Combobox.Options style={{ width: "max-content" }} className="absolute z-50 mt-1  w-max min-w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                        {fetchItems.map((item, idx) => (
                            <Combobox.Option
                                key={idx}
                                value={item}
                                className={({ active }) =>
                                    `px-4 py-2  whitespace-nowrap cursor-pointer ${active ? "bg-blue-100" : ""
                                    }`
                                }
                            >
                                {item}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                )}
            </div>
        </Combobox>
    );
}

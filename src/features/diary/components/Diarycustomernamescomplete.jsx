import { Combobox } from "@headlessui/react";
import { useEffect, useState, useRef } from "react";

export default function DiaryCustomerNamesComplete({ value, setCustomer, setIsOldCus, setItems }) {
    const [query, setQuery] = useState("");
    const [fetchItems, setFetchItems] = useState([]);
    const dropdownRef = useRef(null);

    const stringFLCMaker = (str) => {
        if (!str) return "";
        const strArr = str.split(" ");
        return strArr
            .map((elm) => elm.charAt(0).toUpperCase() + elm.slice(1).toLowerCase())
            .join(" ");
    };

    const fetchSuggestions = async (q) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/diary/customer/search?q=${encodeURIComponent(q)}`
            );
            const data = await res.json();

            if (data.status === "success") {
                setFetchItems(data.data);
            }
        } catch (error) {
            console.error("Search error:", error);
        }
    };

    const fetchCustomer = async (id) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/diary/customer/details?cusId=${Number(id)}`
            );
            const result = await res.json();

            if (result.status === "success") {
                const c = result.data.customer;

                // SET CUSTOMER DATA
                setCustomer(prev => ({
                    ...prev,
                    cus_id: c.id,
                    name: stringFLCMaker(c.name),
                    phone: c.phone || ""
                }));
                setIsOldCus(true);

                // SET ITEMS DATA IF EXISTS
                if (result.data.items && result.data.items.length > 0) {
                    const fetchedItems = result.data.items.map(item => ({
                        fineSilver: item.fineSilver || "",
                        lbrBalance: item.labourBalance || "",
                        comment: item.comment || "",
                        images: item.commentMediaLinks
                            ? item.commentMediaLinks.split(',').map(url => url.trim())
                            : []
                    }));

                    // CALL PARENT COMPONENT TO SET ITEMS
                    if (typeof setItems === 'function') {
                        setItems(fetchedItems);
                    }
                }
            } else {
                setCustomer(prev => ({
                    ...prev,
                    cus_id: null,
                    name: value,
                    phone: ""
                }));
            }
        } catch (err) {
            console.error("Customer fetch error:", err);
        }
    };

    useEffect(() => {
        if (!query.trim()) {
            setFetchItems([]);
            return;
        }
        fetchSuggestions(query);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setFetchItems([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <Combobox
            nullable
            value={fetchItems.find(i => i.name === value) || value}
            onChange={(item) => {
                if (!item) return;
                setQuery("");
                setFetchItems([]);
                fetchCustomer(item.id);
            }}
        >
            <div className="relative" ref={dropdownRef}>
                <Combobox.Input
                    autoComplete="off"
                    displayValue={(item) =>
                        typeof item === "string" ? item : item?.name ?? ""
                    }
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Customer name"
                    onChange={(e) => {
                        const name = e.target.value;
                        setCustomer(prev => ({ ...prev, name }));
                        setQuery(name);
                    }}
                />

                {fetchItems.length > 0 && (
                    <Combobox.Options
                        style={{ width: "max-content" }}
                        className="absolute z-50 mt-1 w-max min-w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto"
                    >
                        {fetchItems.map((item, idx) => (
                            <Combobox.Option
                                key={idx}
                                value={item}
                                className={({ active }) =>
                                    `px-4 py-2 whitespace-nowrap cursor-pointer ${active ? "bg-blue-100" : ""
                                    }`
                                }
                            >
                                <span>{stringFLCMaker(item.name)}</span>
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                )}
            </div>
        </Combobox>
    );
}
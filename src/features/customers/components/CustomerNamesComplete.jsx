import { Combobox } from "@headlessui/react";
import { useEffect, useState, useRef } from "react";


export default function CustomerNamesComplete({ value, setCustomer, setCusType, setIsOldCus, cusType }) {
    const [query, setQuery] = useState("");
    const [fetchItems, setFetchItems] = useState([]);
    const [keepDropdownOpen, setKeepDropdownOpen] = useState(false); // ADD THIS
    const dropdownRef = useRef(null); // ADD THIS

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

    const fetchSuggestions = async (q) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/customer/search?q=${encodeURIComponent(q)}&&cusType=${cusType}`
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
                `${import.meta.env.VITE_API_URL}/customer/details?cusId=${Number(id)}&&cusType=${cusType}`
            );
            const result = await res.json();

            if (result.status === "success") {
                const c = result.data;

                setCustomer(prev => ({
                    ...prev,
                    cus_id: c.id,
                    name: stringFLCMaker(c.name),
                    phone: c.phone,
                    address: c.address,
                    city: c.city
                }));
                setIsOldCus(true);
            } else {
                // customer not found → keep typed name, clear rest
                setCustomer(prev => ({
                    ...prev,
                    cus_id: null,
                    name: query,
                    phone: null,
                    address: null,
                    city: null
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
        // const timer = setTimeout(() => {
        // }, 500); // 1 second delay

        // return () => clearTimeout(timer); // clear if user types again
    }, [query, cusType]);

    // Add this useEffect after the existing one
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setKeepDropdownOpen(false);
                setFetchItems([]);
            }
        };

        if (keepDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [keepDropdownOpen]);

    return (
        <Combobox
            nullable
            value={fetchItems.find(i => i.name === value) || value}
            // onChange={(item) => {
            //     if (!item) {
            //         return;
            //     }

            //     // if default term selected
            //     if (item.isDefault) {

            //         setCusType(item.cusType);

            //         setCustomer(prev => ({
            //             ...prev,
            //             cus_id: null,
            //             name: item.name,
            //             phone: null,
            //             address: null,
            //             city: null
            //         }));

            //         setIsOldCus(false);
            //         return;
            //     }

            //     fetchCustomer(item.id);
            // }}

            onChange={async (item) => {
                if (!item) {
                    return;
                }

                // Regular customer selection
                setKeepDropdownOpen(false);
                setQuery("");
                setFetchItems([]);
                fetchCustomer(item.id);
            }}
        >
            <div className="relative" ref={dropdownRef}>
                <Combobox.Input
                    autoComplete="off"
                    displayValue={(item) =>
                        typeof item === "string"
                            ? item
                            : item?.name ?? ""
                    }
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Customer name"
                    onChange={(e) => {
                        const name = e.target.value;
                        setCustomer(prev => ({ ...prev, name }));
                        setQuery(name);
                        setKeepDropdownOpen(false); // ADD THIS - reset flag when user types
                    }}
                />

                {fetchItems.length > 0 && (
                    <Combobox.Options
                        static={keepDropdownOpen}  // ADD THIS - forces dropdown to stay open
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
                                <span>
                                    {stringFLCMaker(item.name) + (item.city ? " | " + stringFLCMaker(item.city) : '')}
                                </span>
                                
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                )}
            </div>
        </Combobox>
    );
}

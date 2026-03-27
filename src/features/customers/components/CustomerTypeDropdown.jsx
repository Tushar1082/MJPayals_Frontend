import React, { useState, useRef, useEffect } from 'react';

export default function CustomerTypeDropdown({cusFilter, setCusFilter}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('Select type');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (type, val) => {
    setSelectedType(type);
    setIsOpen(false);
    setCusFilter(val);
  };

  useEffect(()=>{
    if(cusFilter== null){
        setSelectedType('Select type');
    }
  },[cusFilter]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[200px]"
      >
        <span className="text-gray-700 font-medium">
          {selectedType === 'Select type' ? 'Customer Type' : selectedType}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <button
            onClick={() => handleSelect('Retail', 'R')}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Retail
          </button>
          <button
            onClick={() => handleSelect('Wholesale', 'W')}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Wholesale
          </button>
          {/* <button
            onClick={() => handleSelect('B2B', 'B')}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            B2B
          </button> */}
        </div>
      )}
    </div>
  );
}
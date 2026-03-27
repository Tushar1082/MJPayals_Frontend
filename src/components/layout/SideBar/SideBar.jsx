import { HandCoins, Receipt, Handshake, FilePlus, Book, BookOpen, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Loader from "../../ui/Loader/Loader";
import { Tooltip } from "react-tooltip";

export default function SideBar({ showLoader = false }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(null);

    function getActiveTab() {
        const currentTab = location.pathname;
        setActiveTab(currentTab);
    }

    function handleNavigation(path) {
        if (location.pathname === path) {
            window.location.reload(); // refresh component
        } else {
            navigate(path);
        }
    }

    useEffect(() => {
        getActiveTab();
    }, [location.pathname]);

    return (
        <div className="flex sticky top-0 bg-white h-[100vh] shadow-[0_0_14px_-2px_#d3d3d3]">
            {
                activeTab ?
                    <div className="items-left w-full p-8 pl-0 pr-4 flex flex-col gap-4">
                        {/* <div
                            data-tooltip-id="sidebar-tip"
                            data-tooltip-content="Create a new bill • Shortcut: Alt + N"
                            onClick={() => handleNavigation("/")}
                            className={`${activeTab == "/"
                                ? "text-white bg-[#6366F1]"
                                : "text-black bg-white hover:bg-[#6366F1] hover:text-white"} 
        flex items-center p-3 pl-8 px-6 cursor-pointer whitespace-nowrap font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}
                        >
                            <FilePlus className="mr-3" /> New Bills
                        </div> */}

                        {/* 1. Wholesale Bill */}
                        <div
                            data-tooltip-id="sidebar-tip"
                            data-tooltip-content="Wholesale Bill • Shortcut: Alt + W"
                            onClick={() => handleNavigation("/")}
                            className={`${activeTab == "/"
                                ? "text-white bg-[#6366F1]"
                                : "text-black bg-white hover:bg-[#6366F1] hover:text-white"} 
        flex items-center p-3 pl-8 px-6 cursor-pointer whitespace-nowrap font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}
                        >
                            <FilePlus className="mr-3" /> Wholesale Bill
                        </div>

                        {/* 2. Retail Bill */}
                        <div
                            data-tooltip-id="sidebar-tip"
                            data-tooltip-content="Retail Bill • Shortcut: Alt + R"
                            onClick={() => handleNavigation("/retail")}
                            className={`${activeTab == "/retail"
                                ? "text-white bg-[#6366F1]"
                                : "text-black bg-white hover:bg-[#6366F1] hover:text-white"} 
        flex items-center p-3 pl-8 px-6 cursor-pointer whitespace-nowrap font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}
                        >
                            <FilePlus className="mr-3" /> Retail Bill
                        </div>

                        {/* 3. B2B Bill */}
                        <div
                            data-tooltip-id="sidebar-tip"
                            data-tooltip-content="B2B Bill • Shortcut: Alt + B"
                            onClick={() => handleNavigation("/b2b")}
                            className={`${activeTab == "/b2b"
                                ? "text-white bg-[#6366F1]"
                                : "text-black bg-white hover:bg-[#6366F1] hover:text-white"} 
        flex items-center p-3 pl-8 px-6 cursor-pointer whitespace-nowrap font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}
                        >
                            <FilePlus className="mr-3" /> B2B Bill
                        </div>

                        <div
                            data-tooltip-id="sidebar-tip"
                            data-tooltip-content="View customer invoices • Shortcut: Alt + I"
                            onClick={() => handleNavigation("/customerInvoices")}
                            className={`${activeTab == "/customerInvoices"
                                ? "text-white bg-[#6366F1]"
                                : "text-black bg-white hover:bg-[#6366F1] hover:text-white"} 
        flex items-center p-3 pl-8 px-6 cursor-pointer whitespace-nowrap font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}
                        >
                            <Receipt className="mr-3" /> Customer Invoices
                        </div>
                        <div
                            data-tooltip-id="sidebar-tip"
                            data-tooltip-content="Manage B2B transactions • Shortcut: Alt + T"
                            onClick={() => handleNavigation("/b2bTransactions")}
                            className={`${activeTab == "/b2bTransactions"
                                ? "text-white bg-[#6366F1]"
                                : "text-black bg-white hover:bg-[#6366F1] hover:text-white"} 
        flex items-center p-3 pl-8 px-6 cursor-pointer whitespace-nowrap font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}
                        >
                            <Handshake className="mr-3" /> B2B Transactions
                        </div>
                        <div
                            onClick={() => handleNavigation("/hisabDiary")}
                            className={`${activeTab == "/hisabDiary"
                                ? "text-white bg-[#6366F1]"
                                : "text-black bg-white hover:bg-[#6366F1] hover:text-white"} 
        flex items-center p-3 pl-8 px-6 cursor-pointer whitespace-nowrap font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}
                        >
                            <FileText className="mr-3" />
                            Hisab Diary
                        </div>
                        <Link to="/borrowingDashboard" className={`hidden ${activeTab == "/borrowingDashboard" ? "text-white bg-[#6366F1]" : "text-black bg-white hover:bg-[#6366F1] hover:text-white"} flex whitespace-nowrap items-center p-3 pl-8 px-6 cursor-pointer font-semibold rounded-[0px_30px_30px_0px] transition-background duration-300`}> <HandCoins className="mr-3" /> Borrowing Dashboard</Link>
                    </div> : <></>
            }
            <Loader open={showLoader} />
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        pointerEvents: "none", // does not interrupt loader
                    },
                }}
            />
            {/* Note: I put tooltip component in side app.jsx. So tooltip is rendered globally in App.jsx to prevent stacking issues with the customer dropdown (HeadlessUI Combobox). */}
        </div>
    );
}
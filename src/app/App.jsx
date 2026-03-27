import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import { useEffect } from "react";
import B2bTransactions from "../features/transactions/components/B2BTransactions";
import CustomerInvoiceRoute from "../routes/CustomerInvoiceRoute";
import { Tooltip } from "react-tooltip";
import AddCustomers from "../features/customers/components/AddCustomers";
import BorrowingDashboard from "../features/borrowing/components/BorrowingDashboard";
import Diary from "../features/diary/components/Diary";

function App() {

  useEffect(() => {
    const disableWheel = (e) => {
      if (document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    };

    document.addEventListener("wheel", disableWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", disableWheel);
    };
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AddCustomers billType="W" />} />
          <Route path="/retail" element={<AddCustomers billType="R" />} />
          <Route path="/b2b" element={<AddCustomers billType="B" />} />
          <Route path="/customerInvoices" element={<CustomerInvoiceRoute />} />
          <Route path="/b2bTransactions" element={<B2bTransactions />} />
          <Route path="/borrowingDashboard" element={<BorrowingDashboard />} />
          <Route path="/diary" element={<Diary />} />
        </Routes>
      </BrowserRouter>

      {/* Global Tooltip for Sidebar: Placed here to avoid z-index conflicts with dropdown components like CustomerNamesComplete. */}
      <Tooltip
        id="sidebar-tip"
        place="right"
        positionStrategy="fixed"
        className="!rounded-lg"
      />
    </>
  )
}

export default App

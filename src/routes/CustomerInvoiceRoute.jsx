import { useSearchParams } from "react-router-dom";
import InvoiceList from "../features/invoices/components/InvoicesList";
import CustomerDirectory from "../features/invoices/components/CustomerInvoices";

function CustomerInvoiceRoute() {
  const [searchParams] = useSearchParams();

  const isGroup = searchParams.get("group") === "true";

  if (isGroup) {
    return <CustomerDirectory />;
  }

  return <InvoiceList />;
}

export default CustomerInvoiceRoute;
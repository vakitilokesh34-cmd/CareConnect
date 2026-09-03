import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Printer, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const InvoicePage = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/${id}`);
        if (res.data.success) setInvoice(res.data.data.invoice || res.data.data);
      } catch (err) {
        console.error('Failed to load invoice:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading invoice..." />;
  if (!invoice) return <div className="p-8 text-center text-slate-500">Invoice not found</div>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/dashboard/customer/bookings" className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg space-y-8 print:border-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-display">CareConnect</h2>
              <p className="text-xs text-slate-500">Home Services Operations Platform</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold font-mono text-indigo-600 uppercase block">{invoice.invoiceNumber}</span>
            <span className="text-[11px] text-slate-400">Date: {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Customer & Provider Details */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Billed To (Customer):</span>
            <p className="font-bold text-slate-900 text-sm">{invoice.customer?.name || 'Valued Customer'}</p>
            <p className="text-slate-500">{invoice.customer?.email}</p>
            <p className="text-slate-500">{invoice.customer?.phone}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Service Provider:</span>
            <p className="font-bold text-slate-900 text-sm">{invoice.provider?.businessName || invoice.provider?.user?.name || 'Service Provider'}</p>
            <p className="text-slate-500">Verified Platform Contractor</p>
          </div>
        </div>

        {/* Services Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Service Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(invoice.services || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-medium">{item.description}</td>
                  <td className="p-3 text-center">{item.quantity || 1}</td>
                  <td className="p-3 text-right">₹{item.unitPrice}</td>
                  <td className="p-3 text-right font-bold text-slate-900">₹{(item.quantity || 1) * item.unitPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Summary */}
        <div className="flex justify-end pt-2 text-xs">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₹{invoice.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxes & Platform Fees:</span>
              <span>₹{invoice.taxes}</span>
            </div>
            <div className="flex justify-between font-extrabold text-slate-900 text-base border-t border-slate-200 pt-2 font-display">
              <span>Total Paid:</span>
              <span className="text-indigo-600">₹{invoice.totalAmount}</span>
            </div>

            <div className="pt-2 text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" /> Payment Status: {invoice.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;

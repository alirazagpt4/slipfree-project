import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { FbrBarcodeModule } from './components/FbrCodeSection';

function mapReceiptData(invoice: any) {
  return {
    brandName: "LOGO",
    invoiceNo: invoice.invoice_no,
    fbrInvoiceNo: invoice.fbr_invoice_no,
    date: new Date(invoice.created_at).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).replace(' at ', ', '),
    shopName: invoice.shop_name || "LOGO",
    shopAddress: invoice.shop_address || "Location details not available",
    cashierName: invoice.cashier_name || "N/A",
    billTo: invoice.customer_name || "Valued Customer",
    customerPhone: invoice.customer_phone || null,
    timings: "Open 11:00 AM - 11:00 PM",
    storeNo: String(invoice.store_id),

    bottomBanners: [
      { img: `${import.meta.env.BASE_URL}men.webp` },
      { img: `${import.meta.env.BASE_URL}banner.webp` }
    ],

    items: invoice.items.map((item: any) => ({
      name: item.item_name,
      qty: item.quantity,
      price: parseFloat(item.unit_price) || 0,
      total: parseFloat(item.total_price) || 0,
      gstPercent: parseFloat(item.gst_percent) || 0
    })),

    summary: {
      price_excl_tax: parseFloat(invoice.price_excl_tax) || 0,
      total: parseFloat(invoice.total_amount) || 0,
      discount: parseFloat(invoice.discount) || 0,
      gst: parseFloat(invoice.gst_amount) || 0,
      posFee: parseFloat(invoice.pos_fee) || 0,
      payable: parseFloat(invoice.payable_amount) || 0
    },

    paymentMode: invoice.payment_mode,
    receiptId: invoice.receipt_hash.slice(0, 8)
  };
}

const RATING_MAP: Record<string, string> = {
  'Worst': 'worst',
  'Not Good': 'not_good',
  'Fine': 'fine',
  'Good': 'good',
  'Best': 'best'
};

// const REVERSE_RATING_MAP: Record<string, string> = {
//   'worst': 'Worst',
//   'not_good': 'Not Good',
//   'fine': 'Fine',
//   'good': 'Good',
//   'best': 'Best'
// };


// String ko strip aur normalize karke matching mapping
const normalizeRating = (rawRating: string | number): string => {
  if (!rawRating) return '';

  const str = String(rawRating).toLowerCase().trim().replace(/[-_]/g, ' ');

  if (str.includes('worst')) return 'Worst';
  if (str.includes('not good') || str.includes('notgood')) return 'Not Good';
  if (str.includes('fine')) return 'Fine';
  if (str.includes('good')) return 'Good';
  if (str.includes('best')) return 'Best';

  return String(rawRating); // Fallback
};

// Helper for strict Comma Separation across numbers
const formatMoney = (val: number) => {
  return (val || 0).toLocaleString('en-US');
};

export default function App() {
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bottomSlide, setBottomSlide] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [toast, setToast] = useState<{ show: boolean; text: string; error?: boolean }>({
    show: false,
    text: '',
    error: false
  });

  const { hash } = useParams();

  const triggerToast = (text: string, isError: boolean = false) => {
    setToast({ show: true, text, error: isError });
    setTimeout(() => {
      setToast({ show: false, text: '', error: false });
    }, 1000);
  };

  useEffect(() => {
    async function loadReceipt() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${hash}`);

        if (!response.ok) {
          throw new Error('Receipt not found');
        }

        const data = await response.json();
        console.log("FULL BACKEND RESPONSE:", data);
        setReceipt(data.invoice);

        console.log("RAW BACKEND FEEDBACK:", data.invoice?.feedback);
        console.log("NORMALIZED FEEDBACK:", normalizeRating(data.invoice?.feedback));


        // Raw backend key (e.g. 'not_good', 'NOT_GOOD', 'Not Good') ko decode karo
        if (data.invoice?.feedback) {
          const decodedLabel = normalizeRating(data.invoice.feedback);
          setFeedback(decodedLabel);
          setFeedbackSubmitted(true);
        }
      } catch (err) {
        setError('Could not load receipt');
      } finally {
        setLoading(false);
      }
    }

    loadReceipt();
  }, [hash]);
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">{error}</div>;
  }

  if (!receipt) {
    return <div className="min-h-screen flex items-center justify-center">Receipt not found</div>;
  }

  const data = mapReceiptData(receipt);

  const nextBottomSlide = () => {
    setBottomSlide((prev) => (prev + 1) % data.bottomBanners.length);
  };

  const prevBottomSlide = () => {
    setBottomSlide((prev) => (prev - 1 + data.bottomBanners.length) % data.bottomBanners.length);
  };

  async function handleFeedback(label: string) {
    if (feedbackSubmitted) {
      triggerToast('Feedback already submitted!');
      return;
    }

    setFeedback(label);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${hash}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: RATING_MAP[label] })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback');
      }

      setFeedbackSubmitted(true);
      triggerToast('Thank you for your feedback!');
    } catch (err: any) {
      triggerToast(err.message || 'Error submitting feedback', true);
    }
  }

  return (
    <main className="min-h-screen bg-[#e4ecf5] text-slate-700 font-sans tracking-normal antialiased flex flex-col items-center justify-center py-10 px-4 relative">

      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 z-50 text-white font-medium text-sm px-6 py-3 rounded-full shadow-lg transition-all duration-300 animate-bounce ${toast.error ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
        >
          {toast.text}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
        
        .balanced-brand-title {
          font-family: 'Poppins', sans-serif !important;
          font-weight: 300 !important;
          letter-spacing: 0.55em !important;
          margin-right: -0.55em !important;
          text-transform: uppercase;
          color: #1e293b;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>

      <article className="w-full max-w-[440px] space-y-3.5">

        {/* SECTION 1: Brand Header Card */}
        <header className="bg-white rounded-[18px] pt-5 pb-6 px-6 border border-slate-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.01)] text-center">
          <h1 className="text-[52px] balanced-brand-title select-none inline-block w-full leading-none pt-3">
            LOGO
          </h1>

          <div className="mt-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <p className="text-[14px] text-slate-800 font-semibold">{data.shopName}</p>
          </div>

          <div className="w-full h-[1px] bg-slate-100 my-4"></div>

          <div
            className="text-[13px] text-slate-500 space-y-3 text-left"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100/70">
              <span>Invoice Number</span>
              <span className="text-slate-800 font-medium font-mono">{data.invoiceNo}</span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100/70">
              <span>Date &amp; Time</span>
              <span className="text-slate-800 font-medium">{data.date}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Cashier Personnel</span>
              <span className="text-slate-800 font-medium">{data.cashierName}</span>
            </div>
          </div>
        </header>

        {/* SECTION 2: Experience Survey (Feedback) Block */}
        <section aria-label="Brand Survey" className="bg-white rounded-[18px] p-6 border border-slate-200/50 text-center">
          <h3 className="text-base font-normal text-slate-800 mb-5">How was our service?</h3>
          <div className="flex justify-between max-w-sm mx-auto">
            {[
              { label: 'Worst', emoji: '😠' },
              { label: 'Not Good', emoji: '😐' },
              { label: 'Fine', emoji: '😑' },
              { label: 'Good', emoji: '😊' },
              { label: 'Best', emoji: '😍' }
            ].map((item) => {
              const isSelected = feedback === item.label;

              return (
                <button
                  key={item.label}
                  disabled={feedbackSubmitted}
                  onClick={() => handleFeedback(item.label)}
                  className={`flex flex-col items-center px-2 py-1 rounded-lg transition-all ${isSelected
                    ? 'bg-slate-100 scale-105 opacity-100 ring-2 ring-amber-400'
                    : feedbackSubmitted
                      ? 'opacity-20 grayscale cursor-not-allowed'
                      : 'opacity-60 hover:opacity-100'
                    }`}
                  aria-label={`Rate as ${item.label}`}
                >
                  <span
                    className={`text-3xl transition-all duration-200 ${isSelected
                      ? 'opacity-100 scale-110 grayscale-0'
                      : feedbackSubmitted
                        ? 'opacity-20 grayscale'
                        : 'opacity-90 hover:opacity-100'
                      }`}
                    role="img"
                    aria-hidden="true"
                  >
                    {item.emoji}
                  </span>

                  <span
                    className={`text-[11px] font-normal mt-1.5 transition-colors ${isSelected ? 'text-slate-800 font-semibold' : 'text-slate-400'
                      }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: Customer Account Profiles */}
        <section aria-label="Customer Profiling" className="bg-white rounded-[18px] p-6 border border-slate-200/50 text-[13px] text-slate-500 space-y-2.5">
          <div className="flex justify-between">
            <span className="text-slate-500 font-normal">Bill to</span>
            <span className="font-normal text-slate-400">{data.billTo}</span>
          </div>
          {data.customerPhone && (
            <div className="flex justify-between">
              <span className="text-slate-500 font-normal">Phone</span>
              <span className="font-mono text-slate-400">{data.customerPhone}</span>
            </div>
          )}
        </section>

        {/* SECTION 4: Stock Line Items (GST Line Item Removed) */}
        <section aria-label="Billed Items" className="bg-white rounded-[18px] p-6 border border-slate-200/50">
          <div className="space-y-4">
            {data.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-[13px] items-start">
                <div className="space-y-1">
                  <span className="font-normal text-slate-800 block leading-tight">{item.name}</span>
                  <div className="text-slate-400 text-xs font-normal space-y-0.5">
                    <p>Quantity: {item.qty}</p>
                  </div>
                </div>
                <div className="text-right space-y-1 flex-shrink-0">
                  <span className="font-normal text-slate-800 block">Total: Rs. {formatMoney(item.total)}</span>
                  <div className="text-slate-400 text-xs font-normal space-y-0.5">
                    <p>Unit Price: Rs. {formatMoney(item.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: Fiscal Accumulation Ledger (Reordered & Formatted) */}
        <section aria-label="Ledger Summary" className="bg-white rounded-[18px] p-6 border border-slate-200/50 text-[13px] space-y-2.5 text-slate-500">
          <div className="flex justify-between">
            <span>Excluded Tax</span>
            <span className="text-slate-400">Rs. {formatMoney(data.summary.price_excl_tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total GST</span>
            <span className="text-slate-400">Rs. {formatMoney(data.summary.gst)}</span>
          </div>
          <div className="flex justify-between">
            <span>POS Fee</span>
            <span className="text-slate-400">Rs. {formatMoney(data.summary.posFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span className="text-slate-400">Rs. {formatMoney(data.summary.discount)}</span>
          </div>
          <div className="flex justify-between pb-3.5 border-b border-slate-100">
            <span>Total</span>
            <span className="text-slate-400">Rs. {formatMoney(data.summary.total)}</span>
          </div>
          <div className="flex justify-between text-lg font-normal text-slate-800 pt-2">
            <span className="font-semibold tracking-wide">Paid</span>
            <span className="text-black font-semibold">Rs. {formatMoney(data.summary.payable)}</span>
          </div>
        </section>

        {/* SECTION 6: Execution Instrument Details */}
        <section
          aria-label="Payment Method Details"
          className="bg-white rounded-[18px] p-6 border border-slate-200/50 flex justify-between items-center text-[13px]"
        >
          <span className="text-slate-500 font-normal">
            Payment Mode
          </span>
          <div className="flex items-center gap-2.5 text-slate-400" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.2"
              stroke="currentColor"
              className="w-5.5 h-5.5 opacity-70"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
              />
            </svg>
            <span className="font-normal text-slate-400">
              {data.paymentMode}
            </span>
          </div>
        </section>

        {/* SECTION 7: Bottom Marketing Slider */}
        <section
          aria-label="Ongoing Promotional Campaign"
          role="region"
          aria-roledescription="carousel"
          className="bg-white rounded-[18px] p-2 border border-slate-200/50 relative"
        >
          <div className="rounded-[12px] overflow-hidden relative h-72 bg-slate-50" aria-live="polite">
            {data.bottomBanners.map((slide: any, index: number) => (
              <div
                key={index}
                role="group"
                aria-roledescription="slide"
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === bottomSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
              >
                <img
                  src={slide.img}
                  alt={slide.text}
                  className="w-full h-full object-cover select-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-5">
                  <span className="text-white font-medium text-xs tracking-widest uppercase leading-relaxed">{slide.text}</span>
                </div>
              </div>
            ))}

            <button
              onClick={prevBottomSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm"
              aria-label="Previous Promo"
            >
              &#x276E;
            </button>

            <button
              onClick={nextBottomSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm"
              aria-label="Next Promo"
            >
              &#x276F;
            </button>
          </div>

          <div className="flex justify-center space-x-1 mt-2.5">
            {data.bottomBanners.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setBottomSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${index === bottomSlide ? "w-4 bg-slate-900" : "w-1 bg-slate-200"
                  }`}
                aria-label={`Go to promo slide ${index + 1}`}
                aria-current={index === bottomSlide ? "true" : "false"}
              />
            ))}
          </div>
        </section>

        {/* SECTION 8: FBR Barcode Module */}
        <FbrBarcodeModule data={data} />

        {/* SECTION 9: Legal Entity Policy Footer */}
        <footer className="bg-white rounded-[18px] p-6 border border-slate-200/50 text-center space-y-4">

          {/* Let's Go Green Header with Right-Aligned Leaf Icon */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 text-left">
            <div className="space-y-0.5">
              <h4 className="font-semibold text-emerald-600 tracking-wider text-[13px] uppercase">
                Let's Go Green
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                Paperless environment
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                Contributing to healthy society
              </p>
            </div>

            {/* Right-Aligned Adjustable Leaf Asset */}
            <div className="flex-shrink-0 ml-3">
              <img
                src="/leaf.jpeg"
                alt="Green Leaf"
                className="w-10 h-10 object-contain mix-blend-multiply border-none outline-none shadow-none"
              />
            </div>
          </div>

          <div className="text-[10px] text-slate-400 space-y-1 text-left pt-1">
            <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Terms &amp; Conditions</p>
            <ul className="space-y-1 list-none">
              <li>• Refunds can be done within 4 days of purchase date along with sale receipt.</li>
              <li>• Used products are not exchangeable / refundable.</li>
              <li>• All refunds / claims will be given on current price.</li>
              <li>• Exchanges can be done within 15 days of purchase date.</li>
              <li>• Repairing will be charged after 1 month of purchase (if product is repairable).</li>
              <li>• Company decision regarding product claim would be final and cannot be challenged in court.</li>
              <li>• Sale items are not exchangeable / claimable / refundable.</li>
              <li>• Exchanges can be done within 15 days of purchase date.</li>
            </ul>
          </div>

          <div className="text-[9px] text-slate-400/80 font-medium pt-2 border-t border-slate-100 tracking-wide">
            Powered by SlipFree Systems
          </div>
        </footer>

      </article>
    </main>
  );
}
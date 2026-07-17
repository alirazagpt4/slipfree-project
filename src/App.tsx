import { useState } from 'react';

const LOGO_RECEIPT_DATA = {
  brandName: "LOGO",
  taxFormation: "RTO Lahore",
  invoiceNo: "LG-2026-88412",
  date: "17/07/2026 05:20:10 PM",
  ntn: "NTN-4139821-4",
  cashier: "ALI.RAZA",
  billTo: "Zain Ul Hassan",
  strn: "STRN-3211124421890",
  storeAddress: "24 km Ferozepur Road, Lahore, Pakistan",
  timings: "Open 11:00 AM - 11:00 PM",

  topBanners: [
    {
      img: "logo2.webp",
      text: "NEW IN: PREMIUM SUMMER SANDLES & SNEAKERS"
    },
    {
      img: "logo3.webp",
      text: "HANDCRAFTED LUXURY LEATHER LOAFERS"
    }
  ],

  bottomBanners: [
    {
      img: "men.webp",
      text: "DOT SALE: BUY 1 GET 1 FREE ENDS SOON"
    },
    {
      img: "banner.webp",
      text: "EXCLUSIVE WESTFORD WALLET SERIES"
    }
  ],

  items: [
    { name: "LOGO MONTELARION LOAFER - TAN", qty: 1, price: 9594, gstPercent: 18 },
    { name: "LOGO KINGSFORDON CARD HOLDER", qty: 1, price: 2450, gstPercent: 18 }
  ],
  summary: {
    total: 12044,
    discount: 1500,
    gst: 1897.92,
    posFee: 5,
    payable: 12446.92
  },
  paymentMode: "Card (HBL Debit)",
  receiptId: "LGO9982736154129983120092837123"
};

export default function App() {
  const [topSlide, setTopSlide] = useState<number>(0);
  const [bottomSlide, setBottomSlide] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const nextTopSlide = () => {
    setTopSlide((prev) => (prev + 1) % LOGO_RECEIPT_DATA.topBanners.length);
  };

  const prevTopSlide = () => {
    setTopSlide((prev) => (prev - 1 + LOGO_RECEIPT_DATA.topBanners.length) % LOGO_RECEIPT_DATA.topBanners.length);
  };

  const nextBottomSlide = () => {
    setBottomSlide((prev) => (prev + 1) % LOGO_RECEIPT_DATA.bottomBanners.length);
  };

  const prevBottomSlide = () => {
    setBottomSlide((prev) => (prev - 1 + LOGO_RECEIPT_DATA.bottomBanners.length) % LOGO_RECEIPT_DATA.bottomBanners.length);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans tracking-normal antialiased flex flex-col items-center justify-center py-8 px-4">

      <article className="w-full max-w-md space-y-4">

        {/* SECTION 1: Brand Header */}
        <header className="bg-white rounded-xl p-8 border border-slate-200/60 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <h1 className="text-4xl font-light tracking-[0.4em] mr-[-0.4em] text-black uppercase transition-all select-none">
            {LOGO_RECEIPT_DATA.brandName}
          </h1>
          <div className="w-8 h-[1px] bg-slate-200 mx-auto mt-5 mb-4"></div>
          <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">{LOGO_RECEIPT_DATA.taxFormation}</p>
        </header>

        {/* SECTION 2: Transaction Metadata */}
        <section className="bg-white rounded-xl p-5 border border-slate-200/60 space-y-2 text-xs text-slate-600" aria-label="Transaction Metadata">
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-slate-400 font-medium">Invoice Number</span>
            <strong className="text-slate-900 font-mono tracking-tight font-semibold">{LOGO_RECEIPT_DATA.invoiceNo}</strong>
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-slate-400 font-medium">Date & Time</span>
            <span className="text-slate-800 font-medium">{LOGO_RECEIPT_DATA.date}</span>
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-slate-400 font-medium">NTN Number</span>
            <span className="text-slate-800 font-mono">{LOGO_RECEIPT_DATA.ntn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Cashier Personnel</span>
            <span className="text-slate-900 font-semibold">{LOGO_RECEIPT_DATA.cashier}</span>
          </div>
        </section>

        {/* SECTION 3: TOP IMAGE SLIDER - HEIGHT MAXED TO h-96 */}
        <section
          aria-label="New Arrivals Footwear Showreel"
          role="region"
          aria-roledescription="carousel"
          className="bg-white rounded-xl p-2 border border-slate-200/60 relative"
        >
          <div className="rounded-lg overflow-hidden relative shadow-inner h-96 bg-slate-50" aria-live="polite">
            {LOGO_RECEIPT_DATA.topBanners.map((slide: any, index: number) => (
              <div
                key={index}
                role="group"
                aria-roledescription="slide"
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === topSlide ? "opacity-100 z-10" : "opacity-0 z-0"
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
              onClick={prevTopSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md"
              aria-label="Previous Banner"
            >
              &#x276E;
            </button>

            <button
              onClick={nextTopSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md"
              aria-label="Next Banner"
            >
              &#x276F;
            </button>
          </div>

          <div className="flex justify-center space-x-1 mt-2.5">
            {LOGO_RECEIPT_DATA.topBanners.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setTopSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${index === topSlide ? "w-4 bg-slate-900" : "w-1 bg-slate-200"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === topSlide ? "true" : "false"}
              />
            ))}
          </div>
        </section>

        {/* SECTION 4: Experience Rating Box */}
        <section aria-label="Brand Survey" className="bg-white rounded-xl p-5 border border-slate-200/60 text-center">
          <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3.5">Store Feedback Survey</h3>
          <div className="flex justify-between max-w-xs mx-auto">
            {[
              { label: 'Poor', emoji: '😠' },
              { label: 'Average', emoji: '😐' },
              { label: 'Good', emoji: '😊' },
              { label: 'Excellent', emoji: '😍' }
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setFeedback(item.label)}
                className={`flex flex-col items-center px-3 py-1.5 rounded-lg transition-all ${feedback === item.label ? 'bg-slate-50 border border-slate-200 scale-105' : 'hover:bg-slate-50/50'
                  }`}
                aria-label={`Rate as ${item.label}`}
              >
                <span className="text-2xl" role="img" aria-hidden="true">{item.emoji}</span>
                <span className="text-[9px] text-slate-400 font-medium tracking-wider mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 5: Customer Billing Profile */}
        <section aria-label="Customer Profiling" className="bg-white rounded-xl p-4 border border-slate-200/60 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Account Owner</span>
            <span className="font-medium text-slate-800">{LOGO_RECEIPT_DATA.billTo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">STRN Registry</span>
            <span className="font-mono text-slate-700">{LOGO_RECEIPT_DATA.strn}</span>
          </div>
        </section>

        {/* SECTION 6: Purchased Line Items */}
        <section aria-label="Billed Items" className="bg-white rounded-xl p-5 border border-slate-200/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[9px] uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">
                <th className="pb-2 font-medium">Product Description</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {LOGO_RECEIPT_DATA.items.map((item: any, idx: number) => (
                <tr key={idx} className="text-xs">
                  <td className="py-3.5 pr-2">
                    <span className="font-medium text-slate-900 block leading-tight">{item.name}</span>
                    <span className="text-slate-400 text-[10px] mt-0.5 block">Qty: {item.qty} | Standard GST: {item.gstPercent}%</span>
                  </td>
                  <td className="py-3.5 text-right font-medium text-slate-900">
                    Rs. {item.price.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* SECTION 7: Fiscal Ledger Breakdown */}
        <section aria-label="Ledger Summary" className="bg-white rounded-xl p-5 border border-slate-200/60 text-xs space-y-2.5">
          <div className="flex justify-between text-slate-500"><span>Gross Subtotal</span> <span className="text-slate-800">Rs. {LOGO_RECEIPT_DATA.summary.total.toLocaleString()}</span></div>
          {LOGO_RECEIPT_DATA.summary.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium bg-emerald-50/50 px-2 py-1.5 rounded-md border border-dashed border-emerald-200/40">
              <span>Dynamic Loyalty Discount</span>
              <span>-Rs. {LOGO_RECEIPT_DATA.summary.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500"><span>Net FBR GST Amount</span> <span className="text-slate-800">Rs. {LOGO_RECEIPT_DATA.summary.gst.toLocaleString()}</span></div>
          <div className="flex justify-between text-slate-500"><span>POS Service Fee Charge</span> <span className="text-slate-800">Rs. {LOGO_RECEIPT_DATA.summary.posFee.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm font-semibold text-slate-900 pt-3.5 border-t border-slate-100">
            <span className="tracking-wide">TOTAL NET PAYABLE</span>
            <span className="text-black font-bold">Rs. {LOGO_RECEIPT_DATA.summary.payable.toLocaleString()}</span>
          </div>
        </section>

        {/* SECTION 8: Settlement Instrument Details */}
        <section
          aria-label="Payment Method Details"
          className="bg-white rounded-xl p-5 border border-slate-200/60 flex justify-between items-center"
        >
          {/* Left Side: Clean & Lightweight Label */}
          <span className="text-slate-600 text-sm font-normal tracking-wide">
            Payment Mode
          </span>

          {/* Right Side: Aesthetic Icon + Muted Value */}
          <div className="flex items-center gap-3 text-slate-400" aria-hidden="true">
            {/* Clean, Lightweight Inline SVG Card Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.2"
              stroke="currentColor"
              className="w-6 h-6 opacity-80"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
              />
            </svg>

            {/* Value matching the exact smooth, lightweight color from your reference */}
            <span className="text-sm font-normal text-slate-400">
              {LOGO_RECEIPT_DATA.paymentMode}
            </span>
          </div>

          {/* Screen Reader Accessible Text */}
          <span className="sr-only">
            Payment Mode is {LOGO_RECEIPT_DATA.paymentMode}
          </span>
        </section>

        {/* SECTION 9: BOTTOM CAROUSEL - HEIGHT MAXED TO h-72 */}
        <section
          aria-label="Ongoing Promotional Campaign"
          role="region"
          aria-roledescription="carousel"
          className="bg-white rounded-xl p-2 border border-slate-200/60 relative"
        >
          <div className="rounded-lg overflow-hidden relative shadow-inner h-72 bg-slate-50" aria-live="polite">
            {LOGO_RECEIPT_DATA.bottomBanners.map((slide: any, index: number) => (
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
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md"
              aria-label="Previous Promo"
            >
              &#x276E;
            </button>

            <button
              onClick={nextBottomSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-md"
              aria-label="Next Promo"
            >
              &#x276F;
            </button>
          </div>

          <div className="flex justify-center space-x-1 mt-2.5">
            {LOGO_RECEIPT_DATA.bottomBanners.map((_: any, index: number) => (
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

        {/* SECTION 10: Barcode Card */}
        <section aria-label="Barcode Scanner Module" className="bg-white rounded-xl p-5 border border-slate-200/60 text-center">
          <p className="text-[9px] text-slate-400 font-semibold tracking-widest mb-1">TRANSACTION TRACKING VERIFICATION</p>
          <p className="text-[9px] font-mono break-all text-slate-400/80 mb-4">{LOGO_RECEIPT_DATA.receiptId}</p>
          <div className="h-12 w-full bg-slate-950 flex items-stretch justify-between p-1.5 rounded" aria-hidden="true">
            {[...Array(38)].map((_, i) => (
              <div key={i} className={`bg-white ${i % 5 === 0 ? 'w-[1px]' : i % 3 === 0 ? 'w-[2.5px]' : 'w-[1.2px]'}`} />
            ))}
          </div>
          <p className="text-xs font-semibold tracking-widest mt-2.5 text-slate-800 font-mono">{LOGO_RECEIPT_DATA.invoiceNo}</p>
        </section>

        {/* SECTION 11: Legal Terms Footer */}
        <footer className="bg-white rounded-xl p-6 border border-slate-200/60 text-center space-y-4">
          <div className="text-xs text-slate-500">
            <h4 className="font-semibold text-slate-900 tracking-widest text-[11px] uppercase">{LOGO_RECEIPT_DATA.brandName} OFFICIAL OUTLET</h4>
            <p className="mt-1 leading-relaxed text-[11px] text-slate-400">{LOGO_RECEIPT_DATA.storeAddress}</p>
            <p className="text-emerald-600 font-medium mt-1 text-[11px]">{LOGO_RECEIPT_DATA.timings}</p>
          </div>

          <div className="text-[10px] text-slate-400 space-y-1 text-left border-t border-slate-100 pt-3.5">
            <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">Exchange Policy Details</p>
            <p>1. Product can be claimed or exchanged within 14 days of acquisition with unhampered packaging.</p>
            <p>2. Sales/Discounted campaigns are completely non-refundable and non-exchangeable.</p>
          </div>

          <div className="text-[9px] text-slate-400/80 font-medium pt-2 border-t border-slate-100 tracking-wide">
            Powered by SlipFree Systems
          </div>
        </footer>

      </article>
    </main>
  );
}
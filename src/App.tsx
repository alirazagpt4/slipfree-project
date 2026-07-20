import { useState } from 'react';

const LOGO_RECEIPT_DATA = {
  brandName: "LOGO",
  taxFormation: "RTO Lahore",
  invoiceNo: "LG-2026-88412",
  date: "17/07/2026 05:20:10 PM",
  ntn: "NTN-4139821-4",
  cashier: "ZAHID.MA",
  billTo: "Zain Ul Hassan",
  strn: "3277876231416",
  storeAddress: "24 km Ferozepur Road, Lahore, Pakistan",
  timings: "Open 11:00 AM - 11:00 PM",
  storeNo: "004",

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
    { name: "WAG1151198 MTP FREE", qty: 1, price: 490, gstPercent: 18 }
  ],
  summary: {
    total: 490,
    discount: 0, 
    gst: 74.75,
    posFee: 1,
    payable: 491
  },
  paymentMode: "Cash",
  receiptId: "6F241ea4"
};

export default function App() {
  const [bottomSlide, setBottomSlide] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const nextBottomSlide = () => {
    setBottomSlide((prev) => (prev + 1) % LOGO_RECEIPT_DATA.bottomBanners.length);
  };

  const prevBottomSlide = () => {
    setBottomSlide((prev) => (prev - 1 + LOGO_RECEIPT_DATA.bottomBanners.length) % LOGO_RECEIPT_DATA.bottomBanners.length);
  };

  return (
    <main className="min-h-screen bg-[#e4ecf5] text-slate-700 font-sans tracking-normal antialiased flex flex-col items-center justify-center py-10 px-4">
      
      {/* Absolute Injection Point for Poppins Standard Balanced Weights */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
        
        .balanced-brand-title {
          font-family: 'Poppins', sans-serif !important;
          font-weight: 300 !important;
          letter-spacing: 0.55em !important;
          margin-right: -0.55em !important;
          text-transform: uppercase;
          color: #1e293b; /* Matches exact dark slate gray of invoice values */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
      
      <article className="w-full max-w-[440px] space-y-3.5">
        
        {/* SECTION 1: Brand Header Card */}
        <header className="bg-white rounded-[18px] pt-5 pb-6 px-6 border border-slate-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.01)] text-center">
          
          {/* Scaled Up to text-[52px] for a bolder high-end retail identity asset presence */}
          <h1 className="text-[52px] balanced-brand-title select-none inline-block w-full leading-none pt-3">
            LOGO
          </h1>
          
          {/* Tax Formation Details Line */}
          <p 
            className="text-[13px] text-slate-500 font-normal mt-5" 
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Tax Formation: <span className="text-slate-800 font-medium">{LOGO_RECEIPT_DATA.taxFormation}</span>
          </p>
          
          {/* Structural Layout Separator Line */}
          <div className="w-full h-[1px] bg-slate-100 my-4"></div>
          
          {/* Purchase Slip */}
          <div 
            className="text-[13px] text-slate-500 space-y-3 text-left"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100/70">
              <span>Invoice Number</span>
              <span className="text-slate-800 font-medium font-mono">{LOGO_RECEIPT_DATA.invoiceNo}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100/70">
              <span>Date & Time</span>
              <span className="text-slate-800 font-medium">{LOGO_RECEIPT_DATA.date}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100/70">
              <span>NTN Number</span>
              <span className="text-slate-800 font-medium font-mono">{LOGO_RECEIPT_DATA.ntn}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Cashier Personnel</span>
              <span className="text-slate-800 font-medium">{LOGO_RECEIPT_DATA.cashier}</span>
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
            ].map((item) => (
              <button 
                key={item.label}
                onClick={() => setFeedback(item.label)}
                className={`flex flex-col items-center px-2 py-1 rounded-lg transition-all ${
                  feedback === item.label ? 'bg-slate-50 scale-105' : 'hover:bg-slate-50/50'
                }`}
                aria-label={`Rate as ${item.label}`}
              >
                <span className="text-3xl opacity-85" role="img" aria-hidden="true">{item.emoji}</span>
                <span className="text-[11px] text-slate-400 font-normal mt-1.5">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 4: Customer Account Profiles */}
        <section aria-label="Customer Profiling" className="bg-white rounded-[18px] p-6 border border-slate-200/50 text-[13px] text-slate-500 space-y-2.5">
          <div className="flex justify-between">
            <span className="text-slate-500 font-normal">Bill to</span> 
            <span className="font-normal text-slate-400">{LOGO_RECEIPT_DATA.billTo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-normal">STRN:</span> 
            <span className="font-mono text-slate-400">{LOGO_RECEIPT_DATA.strn}</span>
          </div>
        </section>

        {/* SECTION 5: Stock Line Items */}
        <section aria-label="Billed Items" className="bg-white rounded-[18px] p-6 border border-slate-200/50">
          <div className="space-y-4">
            {LOGO_RECEIPT_DATA.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-[13px] items-start">
                <div className="space-y-1">
                  <span className="font-normal text-slate-800 block leading-tight">{item.name}</span>
                  <div className="text-slate-400 text-xs font-normal space-y-0.5">
                    <p>Quantity: {item.qty}</p>
                    <p>GST%: {item.gstPercent}</p>
                  </div>
                </div>
                <div className="text-right space-y-1 flex-shrink-0">
                  <span className="font-normal text-slate-800 block">Total: Rs. {item.price.toLocaleString()}</span>
                  <div className="text-slate-400 text-xs font-normal space-y-0.5">
                    <p>Price: Rs. {item.price.toLocaleString()}</p>
                    <p>GST: Rs. {((item.price * item.gstPercent) / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Fiscal Accumulation Ledger */}
        <section aria-label="Ledger Summary" className="bg-white rounded-[18px] p-6 border border-slate-200/50 text-[13px] space-y-2.5 text-slate-500">
          <div className="flex justify-between">
            <span>Total</span> 
            <span className="text-slate-400">Rs. {LOGO_RECEIPT_DATA.summary.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount (If any)</span> 
            <span className="text-slate-400">{LOGO_RECEIPT_DATA.summary.discount}</span>
          </div>
          <div className="flex justify-between">
            <span>Total GST</span> 
            <span className="text-slate-400">Rs. {LOGO_RECEIPT_DATA.summary.gst.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pb-3.5 border-b border-slate-100">
            <span>POS Service Fee</span> 
            <span className="text-slate-400">Rs. {LOGO_RECEIPT_DATA.summary.posFee}</span>
          </div>
          <div className="flex justify-between text-lg font-normal text-slate-800 pt-2">
            <span className="font-semibold tracking-wide">Payable</span>
            <span className="text-black font-semibold">Rs. {LOGO_RECEIPT_DATA.summary.payable.toLocaleString()}</span>
          </div>
        </section>

        {/* SECTION 7: Execution Instrument Details */}
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
              {LOGO_RECEIPT_DATA.paymentMode}
            </span>
          </div>
        </section>

        {/* SECTION 8: BOTTOM MARKETING SLIDER */}
        <section 
          aria-label="Ongoing Promotional Campaign" 
          role="region" 
          aria-roledescription="carousel"
          className="bg-white rounded-[18px] p-2 border border-slate-200/50 relative"
        >
          <div className="rounded-[12px] overflow-hidden relative h-72 bg-slate-50" aria-live="polite">
            {LOGO_RECEIPT_DATA.bottomBanners.map((slide: any, index: number) => (
              <div
                key={index}
                role="group"
                aria-roledescription="slide"
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  index === bottomSlide ? "opacity-100 z-10" : "opacity-0 z-0"
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
            {LOGO_RECEIPT_DATA.bottomBanners.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setBottomSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === bottomSlide ? "w-4 bg-slate-900" : "w-1 bg-slate-200"
                }`}
                aria-label={`Go to promo slide ${index + 1}`}
                aria-current={index === bottomSlide ? "true" : "false"}
              />
            ))}
          </div>
        </section>

        {/* SECTION 9: Barcode Cryptographic Tracker */}
        <section aria-label="Barcode Scanner Module" className="bg-white rounded-[18px] p-6 border border-slate-200/50 text-center">
          <p className="text-[9px] text-slate-400 font-semibold tracking-widest mb-1">TRANSACTION TRACKING VERIFICATION</p>
          <p className="text-[9px] font-mono break-all text-slate-400/80 mb-4">{LOGO_RECEIPT_DATA.receiptId}</p>
          <div className="h-12 w-full bg-slate-950 flex items-stretch justify-between p-1.5 rounded" aria-hidden="true">
            {[...Array(38)].map((_, i) => (
              <div key={i} className={`bg-white ${i % 5 === 0 ? 'w-[1px]' : i % 3 === 0 ? 'w-[2.5px]' : 'w-[1.2px]'}`} />
            ))}
          </div>
          <p className="text-xs font-semibold tracking-widest mt-2.5 text-slate-800 font-mono">{LOGO_RECEIPT_DATA.invoiceNo}</p>
        </section>

        {/* SECTION 10: Legal Entity Policy Footer */}
        <footer className="bg-white rounded-[18px] p-6 border border-slate-200/50 text-center space-y-4">
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
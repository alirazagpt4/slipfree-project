import { useState } from 'react';

const OUTFITTERS_RECEIPT_DATA = {
  brandName: "OUTFITTERS",
  taxFormation: "RTO Lahore",
  invoiceNo: "88412",
  date: "17/07/2026 05:20:10 PM",
  ntn: "B992140",
  cashier: "ALI.RAZA",
  billTo: "WALK-IN CUSTOMER",
  strn: "4421890321112",
  storeAddress: "Shop # 12, Ground Floor, Emporium Mall, Johar Town, Lahore",
  timings: "Open 10:00am - 12:00am",
  
  // Top Banner Slides - New Arrivals focus
  topBanners: [
    {
      img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
      text: "NEW ARRIVALS - STREETWEAR '26"
    },
    {
      img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
      text: "SUMMER ESSENTIALS DROP"
    },
    {
      img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
      text: "URBAN ESSENTIALS CO."
    }
  ],

  // Bottom Banner Slides - Store End Promo focus
  bottomBanners: [
    {
      img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80",
      text: "FLAT 30% OFF ON SELECTED ITEMS"
    },
    {
      img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
      text: "PREMIUM LEATHERWEAR DEALS"
    }
  ],

  items: [
    { name: "MENS OVERSIZED TEE - BLACK", qty: 2, price: 2490, gstPercent: 18 },
    { name: "CARGO PANTS - OLIVE", qty: 1, price: 4500, gstPercent: 18 }
  ],
  summary: {
    total: 9480,
    discount: 500, 
    gst: 1616.40,
    posFee: 5,
    payable: 10601.40
  },
  paymentMode: "Card (HBL Debit)",
  receiptId: "9982736154129983120092837123"
};

export default function App() {
  const [topSlide, setTopSlide] = useState<number>(0);
  const [bottomSlide, setBottomSlide] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const nextTopSlide = () => {
    setTopSlide((prev) => (prev + 1) % OUTFITTERS_RECEIPT_DATA.topBanners.length);
  };

  const prevTopSlide = () => {
    setTopSlide((prev) => (prev - 1 + OUTFITTERS_RECEIPT_DATA.topBanners.length) % OUTFITTERS_RECEIPT_DATA.topBanners.length);
  };

  const nextBottomSlide = () => {
    setBottomSlide((prev) => (prev + 1) % OUTFITTERS_RECEIPT_DATA.bottomBanners.length);
  };

  const prevBottomSlide = () => {
    setBottomSlide((prev) => (prev - 1 + OUTFITTERS_RECEIPT_DATA.bottomBanners.length) % OUTFITTERS_RECEIPT_DATA.bottomBanners.length);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col items-center justify-center py-6 px-4 md:py-12">
      
      <article className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        
        {/* Invoice Header */}
        <header className="p-6 text-center border-b border-dashed border-slate-200">
          <h1 className="text-3xl font-black tracking-widest text-slate-900">{OUTFITTERS_RECEIPT_DATA.brandName}</h1>
          <p className="text-xs text-slate-500 font-semibold tracking-wider mt-1">Tax Formation: {OUTFITTERS_RECEIPT_DATA.taxFormation}</p>
          
          <section className="mt-6 bg-slate-50 p-4 rounded-xl text-left text-xs text-slate-600 space-y-1.5" aria-label="Transaction Meta Information">
            <div className="flex justify-between"><span>Invoice Number:</span> <strong className="text-slate-800">{OUTFITTERS_RECEIPT_DATA.invoiceNo}</strong></div>
            <div className="flex justify-between"><span>Date & Time:</span> <span>{OUTFITTERS_RECEIPT_DATA.date}</span></div>
            <div className="flex justify-between"><span>NTN:</span> <span>{OUTFITTERS_RECEIPT_DATA.ntn}</span></div>
            <div className="flex justify-between"><span>Cashier:</span> <span>{OUTFITTERS_RECEIPT_DATA.cashier}</span></div>
          </section>
        </header>

        {/* 1. TOP CAROUSEL: New Arrivals Slider */}
        <section 
          aria-label="New Arrivals Campaigns" 
          role="region" 
          aria-roledescription="carousel"
          className="px-6 py-4 relative"
        >
          <div className="rounded-xl overflow-hidden relative shadow-inner h-44 bg-slate-100" aria-live="polite">
            {OUTFITTERS_RECEIPT_DATA.topBanners.map((slide: any, index: number) => (
              <div
                key={index}
                role="group"
                aria-roledescription="slide"
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  index === topSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img 
                  src={slide.img} 
                  alt={slide.text} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end p-4">
                  <span className="text-white font-black text-xs tracking-wider uppercase">{slide.text}</span>
                </div>
              </div>
            ))}

            <button
              onClick={prevTopSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 text-sm font-bold"
              aria-label="Previous Top Slide"
            >
              &#x276E;
            </button>

            <button
              onClick={nextTopSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 text-sm font-bold"
              aria-label="Next Top Slide"
            >
              &#x276F;
            </button>
          </div>

          {/* Indicator Dots */}
          <div className="flex justify-center space-x-2 mt-3">
            {OUTFITTERS_RECEIPT_DATA.topBanners.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setTopSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === topSlide ? "w-6 bg-slate-800" : "w-2 bg-slate-300"
                }`}
                aria-label={`Go to top slide ${index + 1}`}
                aria-current={index === topSlide ? "true" : "false"}
              />
            ))}
          </div>
        </section>

        {/* Customer Service Rating Section */}
        <section aria-label="Customer Satisfaction Feedback" className="px-6 py-4 border-y border-slate-100 bg-slate-50/50 text-center">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">How was your service today?</h3>
          <div className="flex justify-between mt-3 max-w-sm mx-auto">
            {[
              { label: 'Worst', emoji: '😠' },
              { label: 'Fine', emoji: '😐' },
              { label: 'Good', emoji: '😊' },
              { label: 'Best', emoji: '😍' }
            ].map((item) => (
              <button 
                key={item.label}
                onClick={() => setFeedback(item.label)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  feedback === item.label ? 'bg-slate-200 scale-105' : 'hover:bg-slate-100'
                }`}
                aria-label={`Rate service as ${item.label}`}
              >
                <span className="text-2xl" role="img" aria-hidden="true">{item.emoji}</span>
                <span className="text-[10px] text-slate-500 font-bold mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Billed To Customer Details */}
        <section aria-label="Billing Details" className="px-6 py-4 text-xs text-slate-600 space-y-1">
          <div className="flex justify-between"><span>Billed To:</span> <span className="font-semibold text-slate-800">{OUTFITTERS_RECEIPT_DATA.billTo}</span></div>
          <div className="flex justify-between"><span>STRN:</span> <span>{OUTFITTERS_RECEIPT_DATA.strn}</span></div>
        </section>

        {/* Purchased Items List */}
        <section aria-label="Purchased Products" className="px-6 py-4 border-t border-slate-100">
          <table className="w-full text-left border-collapse">
            <caption className="sr-only">List of purchased items</caption>
            <thead>
              <tr className="text-[10px] uppercase text-slate-400 tracking-wider border-b border-slate-100">
                <th className="pb-2 font-bold">Item Description</th>
                <th className="pb-2 text-right font-bold">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {OUTFITTERS_RECEIPT_DATA.items.map((item: any, idx: number) => (
                <tr key={idx} className="text-xs">
                  <td className="py-3 pr-2">
                    <span className="font-bold text-slate-800 block">{item.name}</span>
                    <span className="text-slate-500 text-[10px]">Qty: {item.qty} | GST: {item.gstPercent}%</span>
                  </td>
                  <td className="py-3 text-right font-bold text-slate-800">
                    Rs. {(item.price * item.qty).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Calculations and Breakdown */}
        <section aria-label="Invoice Balance Summary" className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs space-y-2">
          <div className="flex justify-between text-slate-600"><span>Sub Total:</span> <span>Rs. {OUTFITTERS_RECEIPT_DATA.summary.total.toFixed(2)}</span></div>
          {OUTFITTERS_RECEIPT_DATA.summary.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold"><span>Discount Applied:</span> <span>-Rs. {OUTFITTERS_RECEIPT_DATA.summary.discount.toFixed(2)}</span></div>
          )}
          <div className="flex justify-between text-slate-600"><span>Total GST Amount:</span> <span>Rs. {OUTFITTERS_RECEIPT_DATA.summary.gst.toFixed(2)}</span></div>
          <div className="flex justify-between text-slate-600"><span>POS Service Fee:</span> <span>Rs. {OUTFITTERS_RECEIPT_DATA.summary.posFee.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm font-black text-slate-900 pt-3 border-t border-slate-200">
            <span>TOTAL PAYABLE</span>
            <span>Rs. {OUTFITTERS_RECEIPT_DATA.summary.payable.toFixed(2)}</span>
          </div>
        </section>

        {/* Payment Instrument Details */}
        <div className="px-6 py-3 flex justify-between items-center text-xs border-t border-slate-100">
          <span className="text-slate-500">Method of Payment:</span>
          <span className="font-bold text-slate-800 uppercase tracking-wider">{OUTFITTERS_RECEIPT_DATA.paymentMode}</span>
        </div>

        {/* 2. BOTTOM CAROUSEL: Special End Offers Slider */}
        <section 
          aria-label="Loyalty Discounts and Promos" 
          role="region" 
          aria-roledescription="carousel"
          className="px-6 py-4 relative border-t border-slate-100"
        >
          <div className="rounded-xl overflow-hidden relative shadow-inner h-32 bg-slate-100" aria-live="polite">
            {OUTFITTERS_RECEIPT_DATA.bottomBanners.map((slide: any, index: number) => (
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
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex items-end p-4">
                  <span className="text-white font-black text-xs tracking-wider uppercase">{slide.text}</span>
                </div>
              </div>
            ))}

            <button
              onClick={prevBottomSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 text-sm font-bold"
              aria-label="Previous Bottom Slide"
            >
              &#x276E;
            </button>

            <button
              onClick={nextBottomSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 text-sm font-bold"
              aria-label="Next Bottom Slide"
            >
              &#x276F;
            </button>
          </div>

          {/* Indicator Dots */}
          <div className="flex justify-center space-x-2 mt-3">
            {OUTFITTERS_RECEIPT_DATA.bottomBanners.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setBottomSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === bottomSlide ? "w-6 bg-slate-800" : "w-2 bg-slate-300"
                }`}
                aria-label={`Go to bottom slide ${index + 1}`}
                aria-current={index === bottomSlide ? "true" : "false"}
              />
            ))}
          </div>
        </section>

        {/* Barcode Mock Section */}
        <section aria-label="Barcode Module" className="px-6 py-6 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold tracking-widest mb-1 text-center">RECEIPT IDENTIFIER</p>
          <p className="text-[9px] font-mono break-all text-slate-500 mb-4 text-center">{OUTFITTERS_RECEIPT_DATA.receiptId}</p>
          <div className="h-14 w-full bg-slate-900 flex items-stretch justify-between p-1.5 rounded" aria-hidden="true">
            {[...Array(32)].map((_, i) => (
              <div key={i} className={`bg-white ${i % 4 === 0 ? 'w-[1px]' : i % 3 === 0 ? 'w-[2.5px]' : 'w-[1.5px]'}`} />
            ))}
          </div>
          <p className="text-sm font-bold tracking-widest mt-2 text-slate-800 text-center">{OUTFITTERS_RECEIPT_DATA.invoiceNo}</p>
        </section>

        {/* Legal Terms and Branch Footnote */}
        <footer className="p-6 bg-slate-50 border-t border-slate-100 text-center space-y-4">
          <div className="text-xs text-slate-500">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide">{OUTFITTERS_RECEIPT_DATA.brandName} STORE</h4>
            <p className="mt-1 leading-relaxed text-[11px]">{OUTFITTERS_RECEIPT_DATA.storeAddress}</p>
            <p className="text-emerald-600 font-semibold mt-1 text-[11px]">{OUTFITTERS_RECEIPT_DATA.timings}</p>
          </div>

          <div className="text-[10px] text-slate-400 space-y-1 text-left border-t border-slate-200 pt-4">
            <p className="font-bold text-slate-500 uppercase">Terms & Exchange Policy</p>
            <p>1. Exchange possible within 14 days with unused tags.</p>
            <p>2. No exchange/refund on sale items or inner wear.</p>
          </div>

          <div className="text-[10px] text-slate-400 font-semibold pt-2">
            Powered by SlipFree Pvt Ltd
          </div>
        </footer>

      </article>
    </main>
  );
}
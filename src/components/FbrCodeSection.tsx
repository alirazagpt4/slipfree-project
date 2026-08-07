import Barcode from 'react-barcode';

export function FbrBarcodeModule({ data }: { data: any }) {
    const hasFbrNo = Boolean(data?.fbrInvoiceNo && data.fbrInvoiceNo.trim() !== '');

    return (
        <section
            aria-label="Barcode Scanner Module"
            className="bg-white rounded-[18px] p-5 border border-slate-200/50 text-center"
        >
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">
                FBR Information
            </p>

            {hasFbrNo ? (
                <>
                    {/* FBR Invoice Available: Render Dynamic Barcode */}
                    <div className="flex justify-center overflow-hidden py-1">
                        <Barcode
                            value={data.fbrInvoiceNo}
                            format="CODE128"
                            width={1.4}
                            height={45}
                            displayValue={false}
                            margin={0}
                        />
                    </div>
                    <p className="text-xs font-semibold tracking-widest mt-2 text-slate-800 font-mono">
                        {data.fbrInvoiceNo}
                    </p>
                </>
            ) : (
                /* Fallback: Jab FBR Invoice Number nahi ho */
                <div className="py-2.5 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 my-1">
                    <p className="text-[12px] font-medium text-slate-500">
                        Non-FBR Registered Sale / Manual Receipt
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                        FBR Invoice Number Not Applicable
                    </span>
                </div>
            )}
        </section>
    );
}
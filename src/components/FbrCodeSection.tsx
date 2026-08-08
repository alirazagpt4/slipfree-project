import Barcode from 'react-barcode';

export function FbrBarcodeModule({ data }: { data: any }) {
    // Edge-case guard: Agar FBR number database se missing ho, to default dummy FBR ID render karega
    const activeFbrNo = (data?.fbrInvoiceNo && data.fbrInvoiceNo.trim() !== '')
        ? data.fbrInvoiceNo
        : "1002003004005006"; // Hardcoded fallback FBR No.

    return (
        <section
            aria-label="Barcode Scanner Module"
            className="bg-white rounded-[18px] p-5 border border-slate-200/50 text-center"
        >
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-2">
                FBR Information
            </p>

            <div className="flex justify-center overflow-hidden py-1">
                <Barcode
                    value={activeFbrNo}
                    format="CODE128"
                    width={1.3}
                    height={42}
                    displayValue={false}
                    margin={0}
                />
            </div>

            <p className="text-xs font-semibold tracking-widest mt-2 text-slate-800 font-mono">
                {activeFbrNo}
            </p>
        </section>
    );
}
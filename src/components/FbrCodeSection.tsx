// src/components/FbrBarcodeModule.tsx
import React from 'react';
import Barcode from 'react-barcode';

interface FbrBarcodeProps {
    data: {
        fbrInvoiceNo?: string | null;
    };
}

export const FbrBarcodeModule: React.FC<FbrBarcodeProps> = ({ data }) => {
    // Guard clause: Safe check agar fbrInvoiceNo na ho
    if (!data?.fbrInvoiceNo) return null;

    return (
        <section aria-label="FBR Barcode Information" className="bg-white rounded-[18px] p-6 border border-slate-200/50 text-center">
            <p className="text-[9px] text-slate-400 font-semibold tracking-widest mb-1">FBR Information.</p>



            <div className="flex justify-center items-center mt-2" aria-hidden="true">
                <Barcode
                    value={data.fbrInvoiceNo}
                    format="CODE128"
                    width={1.4}
                    height={48}
                    displayValue={false}
                    background="transparent"
                    margin={0}
                />
            </div>

            <p className="text-xs font-semibold tracking-widest my-1 text-slate-800 font-mono">
                {data.fbrInvoiceNo}
            </p>
        </section>
    );
};
import React from 'react';
import { FileText, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';

export default function AgreementPdfViewer({ companyData, signatureData, signatoryName, signatoryTitle }) {
  const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Document Header Bar */}
      <div className="p-3 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-appSecondary/10 border border-appSecondary/20 flex items-center justify-center text-appSecondary">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-appTextLight">Watt Charge™ mCaaS Master Agreement</h4>
            <p className="text-[10px] text-appTextGray">Generated for: {companyData?.name || 'Fleet Subscriber'}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg font-mono">
          <ShieldCheck className="w-3 h-3" /> OFFICIAL DOCUMENT
        </span>
      </div>

      {/* Styled Agreement Document Paper */}
      <div className="p-6 bg-slate-900 border border-white/10 rounded-2xl space-y-5 max-h-[360px] overflow-y-auto font-sans text-xs text-slate-300 leading-relaxed shadow-2xl">
        <div className="text-center pb-4 border-b border-white/10 space-y-1">
          <h2 className="text-sm font-black tracking-wide text-white uppercase">
            Sinatra Electric Vehicles Charging Stations Management & Operation
          </h2>
          <p className="text-[11px] text-appSecondary font-bold">referred to as Watt Charge ™</p>
          <p className="text-[10px] text-slate-400">Head Office, Dubai, United Arab Emirates</p>
          <div className="mt-3 inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono font-bold">
            CONTRACT NO: mCaaS-{companyData?.fleetCode || 'FLT01'}-{Date.now().toString().slice(-4)}
          </div>
        </div>

        {/* Parties */}
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 text-[11px]">
          <p className="font-bold text-white uppercase tracking-wider text-[10px]">BETWEEN:</p>
          <p>
            <strong className="text-white">(1) SINATRA ELECTRIC VEHICLES CHARGING STATIONS MANAGEMENT & OPERATION</strong>, a company incorporated in Dubai, UAE (License No: <strong>1354218</strong>).
          </p>
          <p className="text-center font-bold text-appSecondary">AND</p>
          <p>
            <strong className="text-white">(2) {companyData?.name || 'SUBSCRIBER COMPANY L.L.C'}</strong>, a company incorporated in the UAE (License No: <strong>{companyData?.licenseNo || '1362672'}</strong>), having address at <strong>{companyData?.address || 'Dubai, UAE'}</strong>.
          </p>
          <p className="pt-1 text-[10px] text-slate-400">Entered into on: {dateStr}</p>
        </div>

        {/* Terms & Conditions Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">1. KEY TERMS & COMMERCIAL CONDITIONS</h3>
          
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Unit Rate</span>
              <strong className="text-appSecondary">AED 1.20 per kW</strong>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Minimum Utilization</span>
              <strong className="text-white">105,000.00 kW / month</strong>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">Grace Period</span>
              <strong className="text-white">3 Consecutive Months</strong>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block uppercase">SLA Maintenance</span>
              <strong className="text-green-400">2 - 4 Business Hours</strong>
            </div>
          </div>

          <h3 className="text-xs font-bold text-white uppercase tracking-wider pt-2">2. OBLIGATIONS & COMPLIANCE</h3>
          <p className="text-[11px]">
            The Subscriber agrees to comply with the charging station usage guidelines, data protection regulations (Schedule 2), and vehicle access authorization rules (Schedule 4). Watt Charge will provide labor and parts coverage for WCMS infrastructure.
          </p>
        </div>

        {/* Signature Box Preview */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Watt Charge Representative</span>
            <div className="h-12 flex items-center justify-center border-b border-dashed border-white/20">
              <span className="font-serif italic text-appSecondary font-bold text-sm">Sofia Chaouni</span>
            </div>
            <p className="text-[10px] font-semibold text-white">SOFIA CHAOUNI</p>
            <p className="text-[9px] text-slate-400">HEAD OF ADMIN</p>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Subscriber Authorized Signature</span>
            <div className="h-12 flex items-center justify-center border-b border-dashed border-white/20">
              {signatureData ? (
                <img src={signatureData} alt="Signature Stamp" className="h-10 object-contain filter invert" />
              ) : (
                <span className="text-[10px] text-slate-500 italic">Pending E-Sign Step</span>
              )}
            </div>
            <p className="text-[10px] font-semibold text-white">{signatoryName || companyData?.contactEmail || 'SIGNATORY'}</p>
            <p className="text-[9px] text-slate-400">{signatoryTitle || 'AUTHORIZED REPRESENTATIVE'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

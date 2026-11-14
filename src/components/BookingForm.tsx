"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Court = { id:number; namaLapangan:string; jenisOlahraga:string; tarifRegulerPerJam:string; tarifMalamPerJam:string };
type Addon = { id:number; namaItem:string; tipe:"SEWA"|"JUAL"; hargaSatuan:string; stok:number };
type Item = { addonId:number; kuantiti:number };
const money = (n:number) => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);

export default function BookingForm() {
  const router = useRouter();
  const [courts,setCourts]=useState<Court[]>([]);
  const [addons,setAddons]=useState<Addon[]>([]);
  const [loadingData,setLoadingData]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [form,setForm]=useState({namaPemesan:"",namaTim:"",noHp:"",courtId:"",tanggalMain:"",jamMulai:"08:00",jamSelesai:"10:00",uangDp:"",diskon:"0"});
  const [items,setItems]=useState<Item[]>([]);
  useEffect(()=>{ Promise.all([fetch("/api/courts").then(r=>r.json()),fetch("/api/addons").then(r=>r.json())]).then(([c,a])=>{if(Array.isArray(c))setCourts(c);if(Array.isArray(a))setAddons(a);}).catch(()=>setError("Gagal memuat data master.")).finally(()=>setLoadingData(false)); },[]);
  const selectedCourt=courts.find(c=>String(c.id)===form.courtId);
  const duration=useMemo(()=>{const [sh,sm]=form.jamMulai.split(":").map(Number);const [eh,em]=form.jamSelesai.split(":").map(Number);return (eh*60+em-sh*60-sm)/60;},[form.jamMulai,form.jamSelesai]);
  const estimate=useMemo(()=>{if(!selectedCourt||duration<=0)return 0;let sum=0;for(let t=Number(form.jamMulai.split(":")[0])*60+Number(form.jamMulai.split(":")[1]);t<Number(form.jamSelesai.split(":")[0])*60+Number(form.jamSelesai.split(":")[1]);t++){const h=Math.floor(t/60);sum+=(h>=18||h<6?Number(selectedCourt.tarifMalamPerJam):Number(selectedCourt.tarifRegulerPerJam))/60;}return Math.round(sum);},[selectedCourt,form.jamMulai,form.jamSelesai,duration]);
  const addonTotal=items.reduce((s,i)=>s+(Number(addons.find(a=>a.id===i.addonId)?.hargaSatuan??0)*i.kuantiti),0);
  const total=Math.max(0,estimate+addonTotal-Number(form.diskon||0));
  function update(key:string,value:string){setForm(p=>({...p,[key]:value}));}
  function changeItem(addonId:number,quantity:number){setItems(p=>quantity<=0?p.filter(i=>i.addonId!==addonId):p.some(i=>i.addonId===addonId)?p.map(i=>i.addonId===addonId?{...i,kuantiti:quantity}:i):[...p,{addonId,kuantiti:quantity}]);}
  async function submit(e:React.FormEvent){e.preventDefault();setError("");setSuccess("");setSaving(true);try{const res=await fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,courtId:Number(form.courtId),uangDp:Number(form.uangDp||0),diskon:Number(form.diskon||0),items})});const data=await res.json();if(!res.ok)throw new Error(data.error||"Booking gagal disimpan.");setSuccess(`Booking berhasil: ${data.booking.noBooking}`);setTimeout(()=>router.push(`/transaksi/${data.booking.id}`),800);}catch(e){setError(e instanceof Error?e.message:"Terjadi kesalahan.");}finally{setSaving(false);}}
  if(loadingData)return <p className="rounded-xl bg-white p-6 text-slate-500">Memuat data lapangan dan perlengkapan...</p>;
  return <form onSubmit={submit} className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h3 className="text-lg font-bold">1. Data Pemesan</h3><p className="mt-1 text-sm text-slate-500">Isi informasi orang atau tim yang melakukan reservasi.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium">Nama pemesan *<input required minLength={2} maxLength={120} value={form.namaPemesan} onChange={e=>update("namaPemesan",e.target.value)} className="field" placeholder="Nama lengkap"/></label>
      <label className="text-sm font-medium">Nama tim (opsional)<input value={form.namaTim} onChange={e=>update("namaTim",e.target.value)} className="field" placeholder="Nama tim/komunitas"/></label>
      <label className="text-sm font-medium sm:col-span-2">Nomor telepon/WhatsApp *<input required minLength={8} value={form.noHp} onChange={e=>update("noHp",e.target.value)} className="field" placeholder="08xxxxxxxxxx"/></label>
    </div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h3 className="text-lg font-bold">2. Lapangan dan Jadwal</h3><div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium sm:col-span-2">Pilih lapangan *<select required value={form.courtId} onChange={e=>update("courtId",e.target.value)} className="field"><option value="">Pilih lapangan</option>{courts.map(c=><option key={c.id} value={c.id}>{c.namaLapangan} — {c.jenisOlahraga} (reguler {money(Number(c.tarifRegulerPerJam))})</option>)}</select></label>
      <label className="text-sm font-medium">Tanggal main *<input required type="date" min={new Date().toLocaleDateString("en-CA")} value={form.tanggalMain} onChange={e=>update("tanggalMain",e.target.value)} className="field"/></label>
      <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Mulai *<input required type="time" value={form.jamMulai} onChange={e=>update("jamMulai",e.target.value)} className="field"/></label><label className="text-sm font-medium">Selesai *<input required type="time" value={form.jamSelesai} onChange={e=>update("jamSelesai",e.target.value)} className="field"/></label></div>
      <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900 sm:col-span-2"><p>Durasi: <b>{duration>0?duration.toLocaleString("id-ID")+" jam":"Periksa jam mulai dan selesai"}</b></p><p className="mt-1">Tarif reguler: {selectedCourt?money(Number(selectedCourt.tarifRegulerPerJam)):"—"}/jam · Tarif malam: {selectedCourt?money(Number(selectedCourt.tarifMalamPerJam)):"—"}/jam</p></div>
    </div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h3 className="text-lg font-bold">3. Perlengkapan Tambahan</h3><p className="mt-1 text-sm text-slate-500">Pilih item jika diperlukan. Harga mengikuti master data.</p><div className="mt-4 divide-y divide-slate-100">{addons.map(a=><div key={a.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-medium">{a.namaItem}</p><p className="text-sm text-slate-500">{money(Number(a.hargaSatuan))} · stok {a.stok} · {a.tipe==="SEWA"?"Sewa":"Jual"}</p></div><input aria-label={`Kuantitas ${a.namaItem}`} type="number" min="0" max={a.stok} value={items.find(i=>i.addonId===a.id)?.kuantiti??0} onChange={e=>changeItem(a.id,Math.min(a.stok,Number(e.target.value)))} className="w-24 rounded-lg border border-slate-200 px-3 py-2"/></div>)}{addons.length===0&&<p className="py-4 text-sm text-slate-500">Belum ada perlengkapan aktif.</p>}</div></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h3 className="text-lg font-bold">4. Pembayaran</h3><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Diskon (Rp)<input type="number" min="0" max={estimate+addonTotal} value={form.diskon} onChange={e=>update("diskon",e.target.value)} className="field"/></label><label className="text-sm font-medium">DP awal (Rp)<input type="number" required min="0" max={total} value={form.uangDp} onChange={e=>update("uangDp",e.target.value)} className="field" placeholder="0"/></label></div><div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4"><div className="flex justify-between gap-3 text-sm"><span>Biaya lapangan</span><b>{money(estimate)}</b></div><div className="flex justify-between gap-3 text-sm"><span>Perlengkapan</span><b>{money(addonTotal)}</b></div><div className="flex justify-between gap-3 text-sm"><span>Diskon</span><b>-{money(Number(form.diskon||0))}</b></div><div className="flex justify-between gap-3 border-t border-slate-200 pt-3"><span className="font-bold">Grand total</span><b className="text-xl text-blue-700">{money(total)}</b></div><div className="flex justify-between gap-3 text-sm"><span>Sisa tagihan</span><b>{money(Math.max(0,total-Number(form.uangDp||0)))}</b></div></div></section>
    {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{success&&<p className="rounded-xl bg-green-50 p-4 text-sm text-green-700">{success}</p>}
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/transaksi" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold">Batal</Link><button disabled={saving||!courts.length} className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{saving?"Menyimpan...":"Simpan Booking"}</button></div>
  </form>;
}

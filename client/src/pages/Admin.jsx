import {useCallback,useEffect,useState} from 'react';import {api,money} from '../api.js';
const ST=['new','confirmed','shipped','delivered','cancelled'],PS=['pending','paid','cod_collected','refunded'];
const patch=(u,b)=>api(u,{method:'PATCH',body:b}).catch(e=>alert(e.message));
function Orders({rows}){const rev=rows.filter(o=>['paid','cod_collected'].includes(o.pay_status)).reduce((a,o)=>a+o.total,0);
  return<><p className="muted">{rows.length} orders · {money(rev)} paid or collected · <a href="/api/admin/export.csv">Download CSV</a></p>
  {rows.map(o=>{const ph=o.phone.replace(/\D/g,'');return<div className="card" key={o.id}><div className="top"><b>#{o.id} · {o.name} · {money(o.total)}</b><span className="muted">{new Date(o.created).toLocaleString('en-IN')}</span></div>
    <div>{o.items.map(i=>`${i.qty}×${i.size}ml`).join(', ')} — {o.method==='cod'?'Cash on Delivery':'Online'}</div><div className="muted">{o.address}, {o.city} {o.pin} · {o.phone}</div>
    <div className="row" style={{marginTop:8}}>Order <select defaultValue={o.status} onChange={e=>patch('/api/admin/orders/'+o.id,{status:e.target.value})}>{ST.map(s=><option key={s}>{s}</option>)}</select>
      Payment <select defaultValue={o.pay_status} onChange={e=>patch('/api/admin/orders/'+o.id,{pay_status:e.target.value})}>{PS.map(s=><option key={s}>{s}</option>)}</select>
      <a href={`https://wa.me/${ph.length===10?'91'+ph:ph}?text=${encodeURIComponent(`Hello ${o.name}, your SHAHEE ORGANIC order #${o.id} (${money(o.total)})`)}`} target="_blank" rel="noopener noreferrer">WhatsApp customer</a></div></div>})}
  {!rows.length&&<p className="muted">No orders yet.</p>}</>}
function Products({rows,reload}){return<>{rows.map(p=><PriceRow key={p.id} p={p} reload={reload}/>)}</>}
function PriceRow({p,reload}){const[v,setV]=useState(p.price);return<div className="card row">{p.size} ml · ₹<input type="number" value={v} onChange={e=>setV(e.target.value)} style={{width:100}} aria-label={`Price for ${p.size} ml`}/>
  <button className="s" onClick={async()=>{await patch('/api/admin/products/'+p.id,{price:+v});alert('Saved')}}>Save price</button>
  <label><input type="checkbox" defaultChecked={p.active!==false} onChange={async e=>{await api('/api/admin/products/'+p.id,{method:'PUT',body:{active:e.target.checked}}).catch(x=>alert(x.message))}}/> Available for sale</label></div>}
function Gallery({rows,reload}){const[busy,setBusy]=useState(false);
  const up=async e=>{e.preventDefault();setBusy(true);try{await api('/api/admin/gallery',{method:'POST',body:new FormData(e.target)});e.target.reset();reload()}catch(x){alert(x.message)}setBusy(false)};
  return<><form className="card row" onSubmit={up}><input name="title" placeholder="Caption" aria-label="Caption"/><input name="image" type="file" accept="image/jpeg,image/png,image/webp" required aria-label="Image"/><button className="s" disabled={busy}>{busy?'Uploading…':'Add to gallery'}</button><span className="muted">JPG, PNG or WebP, up to 3 MB. Only upload photos you have the right to use.</span></form>
  <div className="row">{rows.map(g=><div className="card" key={g.id}><img className="thumb" src={g.image} alt={g.title}/><div>{g.title}</div><button className="s" onClick={async()=>{if(confirm('Delete this image?')){await api('/api/admin/gallery/'+g.id,{method:'DELETE'});reload()}}}>Delete</button></div>)}</div></>}
function Enq({rows,reload}){return<>{rows.map(e=><div className="card" key={e.id}><div className="top"><b>{e.name} · {e.phone}</b><span className="muted">{new Date(e.created).toLocaleString('en-IN')}</span></div><p>{e.message}</p>
  <label><input type="checkbox" defaultChecked={e.handled} onChange={ev=>patch('/api/admin/enquiries/'+e.id,{handled:ev.target.checked})}/> Handled</label></div>)}{!rows.length&&<p className="muted">No messages yet.</p>}</>}
export default function Admin(){
  const[auth,setAuth]=useState(null),[tab,setTab]=useState('orders'),[d,setD]=useState({orders:[],products:[],gallery:[],enquiries:[]}),[pw,setPw]=useState(''),[err,setErr]=useState('');
  const load=useCallback(async()=>{try{const[orders,products,gallery,enquiries]=await Promise.all([api('/api/admin/orders'),api('/api/admin/products'),api('/api/gallery'),api('/api/admin/enquiries')]);setD({orders,products,gallery,enquiries});setAuth(true)}catch(e){setAuth(false)}},[]);
  useEffect(()=>{load()},[load]);
  const login=async e=>{e.preventDefault();setErr('');try{await api('/api/admin/login',{method:'POST',body:{password:pw}});setPw('');load()}catch(x){setErr(x.message)}};
  if(auth===null)return<div className="adm">Loading…</div>;
  if(!auth)return<div className="adm"><h1 className="gold" style={{fontSize:'2.4rem'}}>SHAHEE Admin</h1><form className="row" onSubmit={login}><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Admin password" autoComplete="current-password" aria-label="Admin password"/><button className="s">Log in</button></form>{err&&<p className="err">{err}</p>}</div>;
  return<div className="adm"><div className="row" style={{justifyContent:'space-between'}}><h1 className="gold" style={{fontSize:'2.4rem'}}>SHAHEE Admin</h1><span><a href="/">View site</a> · <button className="s" onClick={async()=>{await api('/api/admin/logout',{method:'POST'});setAuth(false)}}>Log out</button></span></div>
    <div className="tabs">{[['orders','Orders'],['products','Products'],['gallery','Gallery'],['enquiries','Messages']].map(([k,l])=><button key={k} aria-selected={tab===k} onClick={()=>setTab(k)}>{l}{k==='enquiries'&&d.enquiries.some(e=>!e.handled)?' •':''}</button>)}</div>
    {tab==='orders'&&<Orders rows={d.orders}/>}{tab==='products'&&<Products rows={d.products} reload={load}/>}{tab==='gallery'&&<Gallery rows={d.gallery} reload={load}/>}{tab==='enquiries'&&<Enq rows={d.enquiries} reload={load}/>}</div>;
}

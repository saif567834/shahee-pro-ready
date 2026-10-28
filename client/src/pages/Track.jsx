import {useEffect,useState} from 'react';import {useSearchParams} from 'react-router-dom';import {api,money} from '../api.js';
const STEPS=['new','confirmed','shipped','delivered'];
export default function Track(){
  const[sp]=useSearchParams(),[id,setId]=useState(sp.get('id')||''),[phone,setPhone]=useState(sp.get('phone')||''),[o,setO]=useState(null),[err,setErr]=useState('');
  const go=async e=>{e?.preventDefault();setErr('');setO(null);try{setO(await api(`/api/orders/track?id=${encodeURIComponent(id)}&phone=${encodeURIComponent(phone)}`))}catch(x){setErr(x.message)}};
  useEffect(()=>{if(id&&phone)go()},[]);
  return<div className="page"><h2 className="gold">Track your order</h2><div className="rule"/>
    <form className="fld" onSubmit={go}><input placeholder="Order number" aria-label="Order number" value={id} onChange={e=>setId(e.target.value)} inputMode="numeric" required/>
      <input placeholder="Mobile number used for the order" aria-label="Mobile number" value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" required/><button className="btn solid" type="submit">TRACK</button></form>
    {err&&<p className="err" role="alert">{err}</p>}
    {o&&<div><h3 style={{fontSize:'1.8rem'}}>Order #{o.id}</h3>
      {o.status==='cancelled'?<p className="err">This order was cancelled.</p>:<div className="steps">{STEPS.map((s,i)=><span key={s} className={i<=STEPS.indexOf(o.status)?'on':''}>{s}</span>)}</div>}
      <p>{o.items.map(i=>`${i.qty} × ${i.size} ml`).join(', ')} — {money(o.total)}</p>
      <p className="muted">{o.method==='cod'?'Cash on Delivery':'Online payment'} · payment {o.pay_status.replace('_',' ')}</p></div>}</div>;
}

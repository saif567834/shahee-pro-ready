import {useEffect,useRef,useState} from 'react';import {Link} from 'react-router-dom';import {api,money} from './api.js';import {useShop} from './shop.jsx';
const loadRzp=()=>new Promise((res,rej)=>{if(window.Razorpay)return res();const s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';s.onload=res;s.onerror=()=>rej(new Error('Payment page failed to load'));document.head.appendChild(s)});
export default function CartDrawer(){
  const{cart,remove,clear,total,price,open,setOpen,toast}=useShop(),[pay,setPay]=useState('cod'),[busy,setBusy]=useState(false),[err,setErr]=useState(''),[done,setDone]=useState(null),x=useRef();
  useEffect(()=>{if(open)x.current?.focus();const k=e=>e.key==='Escape'&&setOpen(false);addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[open]);
  async function submit(e){e.preventDefault();setErr('');if(!cart.length)return setErr('Your cart is empty');
    const f=new FormData(e.target);setBusy(true);
    try{const o=await api('/api/orders',{method:'POST',body:{name:f.get('name'),phone:f.get('phone'),address:f.get('address'),city:f.get('city'),pin:f.get('pin'),method:pay,items:cart}});
      if(o.rzp){await loadRzp();await new Promise((res,rej)=>new window.Razorpay({key:o.rzp.key,amount:o.rzp.amount,currency:'INR',order_id:o.rzp.order_id,name:'SHAHEE ORGANIC',prefill:{name:f.get('name'),contact:f.get('phone')},
        handler:async p=>{try{await api('/api/payments/verify',{method:'POST',body:{order_id:o.id,...p}});res()}catch{rej(new Error('Payment could not be verified. Contact us on WhatsApp with order #'+o.id))}},
        modal:{ondismiss:()=>rej(new Error('Payment cancelled. Order #'+o.id+' is saved; we will contact you.'))}}).open())}
      setDone({...o,phone:f.get('phone')});clear();e.target.reset()}catch(ex){setErr(ex.message)}setBusy(false)}
  return<><div id="scrim" className={open?'on':''} onClick={()=>setOpen(false)}/>
  <aside id="drawer" className={open?'open':''} aria-label="Cart" aria-hidden={!open} inert={!open?'':undefined}>
    <div className="row" style={{justifyContent:'space-between'}}><h2 style={{fontSize:'2rem',margin:0}}>{done?'Order placed':'Your cart'}</h2><button className="cartbtn" ref={x} onClick={()=>setOpen(false)}>Close</button></div>
    {done?<div style={{marginTop:20}}><p className="ok">Thank you! Your order number is <b>#{done.id}</b> (total {money(done.total)}).</p>
      {done.method==='online'&&!done.rzp&&<p className="muted">We will send a secure payment link on WhatsApp shortly.</p>}
      {done.method==='cod'&&<p className="muted">Pay in cash when your order arrives.</p>}
      <p><Link className="btn" to={`/track?id=${done.id}&phone=${done.phone}`} onClick={()=>{setOpen(false);setDone(null)}}>TRACK THIS ORDER</Link></p></div>
    :<>
    <div style={{flex:1}}>{cart.length?cart.map(c=><div className="li" key={c.size}><span>{c.size} ml × {c.qty}<br/>{money(price(c.size)*c.qty)}</span><button onClick={()=>remove(c.size)}>Remove</button></div>):<p className="note">Your cart is empty.</p>}</div>
    <div style={{font:"600 1.6rem 'Cormorant Garamond',serif",margin:'14px 0'}}>Total {money(total)}</div>
    <form id="of" onSubmit={submit}>
      <input type="text" name="name" placeholder="Full name" aria-label="Full name" autoComplete="name" required/>
      <input type="tel" name="phone" placeholder="Mobile number" aria-label="Mobile number" autoComplete="tel" inputMode="numeric" pattern="\+?[0-9 ]{10,14}" required/>
      <textarea name="address" placeholder="Delivery address (house, street, landmark)" aria-label="Delivery address" autoComplete="street-address" required/>
      <div className="two"><input type="text" name="city" placeholder="City" aria-label="City" autoComplete="address-level2" required/><input type="text" name="pin" placeholder="Pincode" aria-label="Pincode" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{6}" required/></div>
      <fieldset><legend>Payment method</legend>
        <label><input type="radio" name="pay" checked={pay==='cod'} onChange={()=>setPay('cod')}/> Cash on Delivery</label>
        <label><input type="radio" name="pay" checked={pay==='online'} onChange={()=>setPay('online')}/> Online payment (UPI / card)</label></fieldset>
      {err&&<p className="err" role="alert">{err}</p>}
      <button className="btn solid" type="submit" disabled={busy||!cart.length}>{busy?'PLACING ORDER…':'PLACE ORDER'}</button>
    </form></>}
  </aside></>;
}

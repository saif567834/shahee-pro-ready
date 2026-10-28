import {useEffect,useRef,useState} from 'react';import {motion,useReducedMotion} from 'framer-motion';
import {api,IG,WA,money} from '../api.js';import {useShop} from '../shop.jsx';
const ING=['Amla','Bhringraj','Hibiscus','Aloe Vera','Fenugreek','Black Seed','Coconut Oil'];
function Particles(){const ref=useRef();const rm=useReducedMotion();
  useEffect(()=>{if(rm)return;const c=ref.current,g=c.getContext('2d');let w,h,id;const n=innerWidth<860?18:40;
    const rs=()=>{w=c.width=c.offsetWidth;h=c.height=c.offsetHeight};rs();addEventListener('resize',rs);
    const P=Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*2+.6,l:Math.random()<.3,a:Math.random()*6,v:Math.random()*.4+.15}));
    const f=()=>{g.clearRect(0,0,w,h);for(const p of P){p.y-=p.v*(p.l?.6:1);p.a+=.01;p.x+=Math.sin(p.a)*.4;if(p.y<-10){p.y=h+10;p.x=Math.random()*w}
      if(p.l){g.save();g.translate(p.x,p.y);g.rotate(p.a);g.fillStyle='#3f8a45aa';g.beginPath();g.ellipse(0,0,9,4,0,0,7);g.fill();g.restore()}else{g.fillStyle=`rgba(240,205,120,${.3+Math.sin(p.a)*.25})`;g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill()}}id=requestAnimationFrame(f)};f();
    return()=>{cancelAnimationFrame(id);removeEventListener('resize',rs)}},[rm]);
  return<canvas id="fx" ref={ref} aria-hidden="true"/>}
function Hero(){const rm=useReducedMotion(),[t,setT]=useState('');
  const mv=e=>{if(rm)return;setT(`rotateY(${(e.clientX/innerWidth-.5)*16}deg) rotateX(${-(e.clientY/innerHeight-.5)*10}deg)`)};
  return<header className="hero" onMouseMove={mv}><Particles/>
    <div className="in"><p style={{letterSpacing:'.25em',color:'var(--gold)',fontSize:'.8rem'}}>PURE AYURVEDIC HAIR OIL</p>
      <h1><span className="gold">Nature’s Finest Ritual.</span><br/>Hair’s Timeless Beauty.</h1>
      <p>Discover SHAHEE ORGANIC Ayurvedic Hair Oil — inspired by nature and traditional hair-care rituals.</p>
      <div className="cta"><a className="btn solid" href="#shop">EXPLORE OUR OIL</a><a className="btn" href="#film">EXPERIENCE OUR BRAND FILM</a><a className="btn" href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello SHAHEE ORGANIC, I would like to order the hair oil.')}`} target="_blank" rel="noopener noreferrer">ORDER ON WHATSAPP</a></div></div>
    <div className="stage"><div className="glow"/><div className="bottle" style={{transform:t}}><img src="/img/hero.jpg" alt="SHAHEE ORGANIC Ayurvedic Hair Oil 200 ml and 500 ml bottles" width="560" height="640"/></div></div></header>}
function Tilt({children}){const rm=useReducedMotion(),[s,setS]=useState('');
  return<div className="tilt" onMouseMove={e=>{if(rm)return;const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;setS(`rotateY(${x*18}deg) rotateX(${-y*18}deg)`)}} onMouseLeave={()=>setS('')}><div style={{transform:s}}>{children}</div></div>}
function Brand(){return<section className="brand" id="brand"><div><h2 className="gold">Made in Madanapalle</h2><div className="rule"/>
  <p>SHAHEE ORGANIC is a pure Ayurvedic hair oil for men and women, made for thicker, stronger and healthier hair. The label promises no sulphates, no parabens, no mineral oil and chemical-free, with the tagline “Quality Matters Not The Quantity.”</p>
  <div className="ben">{['Reduces hair fall','Promotes hair growth','Nourishes scalp','Adds natural shine','Controls dandruff'].map(b=><div key={b}>{b}</div>)}</div></div>
  <motion.img className="logo" src="/img/logo.jpg" alt="SHAHEE ORGANIC logo — Pure Ayurvedic Hair Oil" loading="lazy" initial={{clipPath:'inset(0 100% 0 0)'}} whileInView={{clipPath:'inset(0 0% 0 0)'}} viewport={{once:true,amount:.3}} transition={{duration:1.2,ease:[.7,0,.2,1]}}/></section>}
function Ingredients(){return<section id="ingredients"><h2>Ingredients from the poster</h2><div className="rule"/><p>Seven botanicals featured on the SHAHEE ORGANIC campaign.</p>
  <div className="ing">{ING.map((n,i)=><Tilt key={n}><img src={`/img/ing${i}.jpg`} alt={n} loading="lazy" width="92" height="92"/><h3>{n}</h3></Tilt>)}</div>
  <p className="note">Ingredient names are taken from the official poster. Confirm the full formulation with the brand before publishing detailed claims.</p></section>}
function Shop(){const{products,add,setOpen,price,toast}=useShop(),[sz,setSz]=useState(200),[q,setQ]=useState(1),[tab,setTab]=useState(0),[ok,setOk]=useState(false),[rot,setRot]=useState(0),drag=useRef(null);
  const A=()=>{add(sz,q);toast(`Added ${q} × ${sz} ml`);setOk(true);setTimeout(()=>setOk(false),1200)};
  const TABS=[['Details','Pure Ayurvedic hair oil in 200 ml and 500 ml bottles. Made in Madanapalle. Quality Matters Not The Quantity.'],['Directions','Directions for use will be added by the brand.'],['Ingredients',ING.join(', ')+' are featured on the poster.']];
  return<section className="shop" id="shop"><div className="pv" onPointerDown={e=>drag.current=e.clientX} onPointerUp={()=>{drag.current=null;setRot(0)}} onPointerLeave={()=>{drag.current=null;setRot(0)}} onPointerMove={e=>drag.current!=null&&setRot(Math.max(-40,Math.min(40,(e.clientX-drag.current)*.4)))}>
    <motion.img key={sz} src={`/img/b${sz}.jpg`} alt={`SHAHEE ORGANIC Ayurvedic Hair Oil ${sz} ml bottle`} draggable="false" initial={{opacity:0,y:12}} animate={{opacity:1,y:0,rotateY:rot}} transition={{duration:.4}}/></div>
    <div><h2>Ayurvedic Hair Oil</h2><div className="rule"/><p>For men &amp; women. Reduces hair loss, promotes strong hair, new hair growth, controls dandruff.</p>
      <div className="sizes" role="group" aria-label="Choose size">{products.map(p=><button key={p.size} aria-pressed={sz===p.size} onClick={()=>setSz(p.size)}>{p.size} ml<b>{money(p.price)}</b></button>)}</div>
      <div className="row"><div className="qty"><button aria-label="Decrease quantity" onClick={()=>setQ(Math.max(1,q-1))}>−</button><span>{q}</span><button aria-label="Increase quantity" onClick={()=>setQ(Math.min(20,q+1))}>+</button></div>
        <button className="btn solid" onClick={A}>{ok?'ADDED ✓':'ADD TO CART'}</button><button className="btn" onClick={()=>{add(sz,q);setOpen(true)}}>BUY NOW</button></div>
      <p className="note">Total for this selection: {money(price(sz)*q)}. Drag the bottle to tilt it.</p>
      <div className="tabs" role="tablist">{TABS.map((t,i)=><button key={t[0]} role="tab" aria-selected={tab===i} onClick={()=>setTab(i)}>{t[0]}</button>)}</div><div className="panel">{TABS[tab][1]}</div></div></section>}
function Film(){const v=import.meta.env.VITE_BRAND_VIDEO;return<section id="film" style={{background:'var(--bg2)'}}><h2>Brand film</h2><div className="rule"/>
  {v?<video controls preload="none" poster="/img/poster.jpg" style={{width:'100%',maxWidth:900}}><source src={v}/></video>
  :<><p>Add your promotional video by setting <code>VITE_BRAND_VIDEO</code> (see README). Until then the poster is shown.</p><img src="/img/poster.jpg" alt="SHAHEE ORGANIC poster" style={{maxWidth:360,width:'100%',marginTop:20,border:'1px solid #d9b25f55'}} loading="lazy"/></>}</section>}
function Gallery(){const[g,setG]=useState([]);useEffect(()=>{api('/api/gallery').then(setG).catch(()=>{})},[]);
  return<section id="gallery"><h2 className="gold">Follow Our Natural Beauty Journey</h2><div className="rule"/>
  <div className="gal">{g.map((x,i)=><motion.a key={x.id} className={i<4?'g'+(i+1):''} data-t={x.title} href={IG} target="_blank" rel="noopener noreferrer" initial={{opacity:0,scale:.96}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{duration:.6,delay:(i%4)*.08}}><img src={x.image} alt={x.title} loading="lazy"/></motion.a>)}</div>
  <div className="ig"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6"/></svg><div><b style={{font:"600 1.5rem 'Cormorant Garamond',serif"}}>@madanapalli_promotions</b><br/><span className="note">Official Instagram profile</span></div><a className="btn solid" href={IG} target="_blank" rel="noopener noreferrer">FOLLOW US ON INSTAGRAM</a></div></section>}
function Contact(){const[st,setSt]=useState(''),[busy,setBusy]=useState(false);
  const go=async e=>{e.preventDefault();const f=new FormData(e.target);setBusy(true);setSt('');try{await api('/api/enquiries',{method:'POST',body:Object.fromEntries(f)});setSt('ok');e.target.reset()}catch(x){setSt(x.message)}setBusy(false)};
  return<section className="contact" id="contact"><div><h2>Contact us</h2><div className="rule"/><p>Questions about the oil, bulk orders or delivery? Send us a message and we will call you back.</p>
    <p>WhatsApp / call: <a href={`https://wa.me/${WA}`}>+91 9666977654</a><br/>Instagram: <a href={IG} target="_blank" rel="noopener noreferrer">@madanapalli_promotions</a></p></div>
    <form className="fld" onSubmit={go} style={{margin:0}}><input name="name" placeholder="Your name" aria-label="Your name" required/><input name="phone" placeholder="Mobile number" aria-label="Mobile number" inputMode="tel" required/><textarea name="message" placeholder="Your message" aria-label="Your message" rows="4" required/>
      <button className="btn solid" disabled={busy}>{busy?'SENDING…':'SEND MESSAGE'}</button>{st==='ok'?<p className="ok" role="status">Thank you. We will contact you soon.</p>:st&&<p className="err" role="alert">{st}</p>}</form></section>}
function FAQ(){return<section id="faq"><h2>Questions</h2><div className="rule"/>
  <details><summary>How do I order?</summary><p>Add the oil to your cart, enter your delivery details and choose Cash on Delivery or online payment.</p></details>
  <details><summary>How do I track my order?</summary><p>Use the Track order page with your order number and mobile number.</p></details>
  <details><summary>Who can use it?</summary><p>The label says it is for men and women.</p></details></section>}
export default function Home(){return<><Hero/><Brand/><Ingredients/><Shop/><Film/><Gallery/><Contact/><FAQ/></>}

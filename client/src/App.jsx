import {useEffect,useState} from 'react';import {Routes,Route,Link,useLocation} from 'react-router-dom';
import {useShop} from './shop.jsx';import {IG} from './api.js';
import Home from './pages/Home.jsx';import Track from './pages/Track.jsx';import Admin from './pages/Admin.jsx';import CartDrawer from './CartDrawer.jsx';
function Progress(){const[w,setW]=useState(0);useEffect(()=>{const f=()=>setW(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)*100);addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[]);return<div id="prog" style={{width:w+'%'}}/>}
export default function App(){
  const{count,setOpen,msg}=useShop(),loc=useLocation(),[load,setLoad]=useState(true),[menu,setMenu]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setLoad(false),900);return()=>clearTimeout(t)},[]);
  useEffect(()=>{setMenu(false);if(loc.hash){setTimeout(()=>document.getElementById(loc.hash.slice(1))?.scrollIntoView(),60)}else scrollTo(0,0)},[loc.pathname,loc.hash]);
  const admin=loc.pathname.startsWith('/admin');
  return<>
    <Progress/><div id="load" className={load?'':'off'} aria-hidden="true"><div>SHAHEE</div></div>
    {!admin&&<nav><Link to="/"><b>SHAHEE</b></Link>
      <ul id="nl" className={menu?'open':''}><li><Link to="/#brand">Brand</Link></li><li><Link to="/#ingredients">Ingredients</Link></li><li><Link to="/#shop">Shop</Link></li><li><Link to="/#gallery">Gallery</Link></li><li><Link to="/#contact">Contact</Link></li><li><Link to="/track">Track order</Link></li><li><a href={IG} target="_blank" rel="noopener noreferrer">Instagram</a></li></ul>
      <span><button className="menu" aria-expanded={menu} aria-controls="nl" onClick={()=>setMenu(!menu)}>Menu</button> <button className="cartbtn" onClick={()=>setOpen(true)}>Cart ({count})</button></span></nav>}
    <Routes><Route path="/" element={<Home/>}/><Route path="/track" element={<Track/>}/><Route path="/admin" element={<Admin/>}/><Route path="*" element={<div className="page"><h2>Page not found</h2><Link className="btn" to="/">Back to home</Link></div>}/></Routes>
    {!admin&&<footer><div className="big gold">SHAHEE</div><p>Pure Ayurvedic Hair Oil · Made in Madanapalle</p><p><a href="https://wa.me/919666977654">WhatsApp +91 9666977654</a> · <a href={IG} target="_blank" rel="noopener noreferrer">@madanapalli_promotions</a></p></footer>}
    {!admin&&<a className="fab" href={IG} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg></a>}
    <CartDrawer/><div className={'toast'+(msg?' on':'')} role="status">{msg}</div>
  </>;
}

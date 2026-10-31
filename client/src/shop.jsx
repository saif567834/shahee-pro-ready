import {createContext,useContext,useEffect,useState} from 'react';import {api} from './api.js';
const Ctx=createContext();export const useShop=()=>useContext(Ctx);
export function ShopProvider({children}){
  const [products,setProducts]=useState([{id:200,size:200,price:499},{id:500,size:500,price:999}]);
  const [cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem('cart'))||[]}catch{return[]}});
  const [open,setOpen]=useState(false),[msg,setMsg]=useState('');
  useEffect(()=>{api('/api/products').then(setProducts).catch(()=>{})},[]);
  useEffect(()=>{try{localStorage.setItem('cart',JSON.stringify(cart))}catch{}},[cart]);
  const price=s=>products.find(p=>p.size===s)?.price||0;
  const add=(size,qty)=>setCart(c=>c.some(i=>i.size===size)?c.map(i=>i.size===size?{...i,qty:Math.min(20,i.qty+qty)}:i):[...c,{size,qty}]);
  const remove=size=>setCart(c=>c.filter(i=>i.size!==size));
  const toast=t=>{setMsg(t);clearTimeout(window.__t);window.__t=setTimeout(()=>setMsg(''),4500)};
  const total=cart.reduce((a,i)=>a+price(i.size)*i.qty,0),count=cart.reduce((a,i)=>a+i.qty,0);
  return <Ctx.Provider value={{products,cart,add,remove,clear:()=>setCart([]),price,total,count,open,setOpen,toast,msg}}>{children}</Ctx.Provider>;
}

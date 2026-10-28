export async function api(url,{method='GET',body}={}){
  const form=body instanceof FormData;
  const r=await fetch(url,{method,credentials:'same-origin',headers:body&&!form?{'Content-Type':'application/json'}:{},body:body&&!form?JSON.stringify(body):body});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw Object.assign(new Error(j.error||'Something went wrong. Please try again.'),{status:r.status});
  return j;
}
export const WA='919666977654',IG='https://www.instagram.com/madanapalli_promotions/';
export const money=n=>'₹'+Number(n).toLocaleString('en-IN');

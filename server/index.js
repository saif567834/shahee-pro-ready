const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express=require('express'),crypto=require('crypto'),path=require('path'),fs=require('fs'),multer=require('multer');
const D=require('./store'),E=process.env,PORT=E.PORT||3000,PASS=E.ADMIN_PASSWORD,SECRET=E.SESSION_SECRET,PROD=E.NODE_ENV==='production';
if(!PASS||!SECRET){console.error('Set ADMIN_PASSWORD and SESSION_SECRET (see .env.example)');process.exit(1)}
if(PROD&&!E.MONGODB_URI)console.warn('WARNING: production without MONGODB_URI. Data is stored in a local file and may be lost on redeploy.');
const RZP=E.RAZORPAY_KEY_ID&&E.RAZORPAY_KEY_SECRET;
const UP=path.join(__dirname,'..','uploads'),DIST=path.join(__dirname,'..','client','dist');fs.mkdirSync(UP,{recursive:true});
const EXT={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'};
const upload=multer({storage:multer.diskStorage({destination:UP,filename:(q,f,cb)=>cb(null,crypto.randomBytes(12).toString('hex')+EXT[f.mimetype])}),limits:{fileSize:3e6,files:1},fileFilter:(q,f,cb)=>cb(null,!!EXT[f.mimetype])});
const app=express();app.disable('x-powered-by');app.set('trust proxy',1);app.use(express.json({limit:'20kb'}));
app.use((q,s,n)=>{s.set({'X-Content-Type-Options':'nosniff','X-Frame-Options':'DENY','Referrer-Policy':'same-origin'});n()});
const wrap=f=>(a,b,c)=>Promise.resolve(f(a,b,c)).catch(e=>{console.error(e.message);b.status(e.status||500).json({error:e.status?e.message:'Server error'})});
const bad=(m,status=400)=>Object.assign(new Error(m),{status});
const sign=v=>crypto.createHmac('sha256',SECRET).update(v).digest('hex');
const eq=(a,b)=>{a=Buffer.from(String(a));b=Buffer.from(String(b));return a.length===b.length&&crypto.timingSafeEqual(a,b)};
const limit=(max,ms)=>{const h=new Map();return(q,s,n)=>{const t=Date.now(),a=(h.get(q.ip)||[]).filter(x=>t-x<ms);if(a.length>=max)return s.status(429).json({error:'Too many requests. Please try again later.'});a.push(t);h.set(q.ip,a);n()}};
const ck=`adm=%s; HttpOnly; SameSite=Strict; Path=/${PROD?'; Secure':''}`;
app.post('/api/admin/login',limit(8,9e5),(q,s)=>{if(!eq(q.body.password||'',PASS))return s.status(401).json({error:'Wrong password'});
  const exp=Date.now()+6048e5;s.set('Set-Cookie',ck.replace('%s',exp+'.'+sign(String(exp)))+'; Max-Age=604800');s.json({ok:true})});
app.post('/api/admin/logout',(q,s)=>{s.set('Set-Cookie',ck.replace('%s','')+'; Max-Age=0');s.json({ok:true})});
const auth=(q,s,n)=>{const m=/(?:^|; )adm=(\d+)\.([a-f0-9]+)/.exec(q.headers.cookie||'');if(m&&+m[1]>Date.now()&&eq(m[2],sign(m[1])))return n();s.status(401).json({error:'Login required'})};
const clean=(v,n)=>String(v??'').trim().slice(0,n);
// ---- public
app.get('/api/products',wrap(async(q,s)=>s.json((await D.list('products')).filter(p=>p.active!==false).map(({id,size,price})=>({id,size,price})))));
app.get('/api/gallery',wrap(async(q,s)=>s.json((await D.list('gallery')).sort((a,b)=>a.sort-b.sort||a.id-b.id))));
app.post('/api/orders',limit(15,36e5),wrap(async(q,s)=>{const b=q.body,c={name:clean(b.name,80),phone:clean(b.phone,16).replace(/[^\d+]/g,''),address:clean(b.address,300),city:clean(b.city,60),pin:clean(b.pin,6)};
  if(!c.name||!c.address||!c.city)throw bad('Please fill all details');if(!/^\+?\d{10,13}$/.test(c.phone))throw bad('Enter a valid mobile number');if(!/^\d{6}$/.test(c.pin))throw bad('Enter a valid 6-digit pincode');
  const method=b.method==='online'?'online':'cod',price=Object.fromEntries((await D.list('products')).filter(p=>p.active!==false).map(p=>[p.size,p.price]));
  if(!Array.isArray(b.items)||!b.items.length||b.items.length>10)throw bad('Your cart is empty');
  let total=0;const items=b.items.map(i=>{const size=+i.size,qty=Math.floor(+i.qty);if(!price[size]||!(qty>=1&&qty<=20))throw bad('Invalid item in cart');total+=price[size]*qty;return{size,qty,price:price[size]}});
  const o=await D.insert('orders',{...c,items,total,method,pay_status:'pending',status:'new',created:new Date().toISOString()}),out={id:o.id,total,method};
  if(method==='online'&&RZP){const z=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Basic '+Buffer.from(E.RAZORPAY_KEY_ID+':'+E.RAZORPAY_KEY_SECRET).toString('base64')},body:JSON.stringify({amount:total*100,currency:'INR',receipt:'order_'+o.id})});
    const j=await z.json();if(!z.ok)throw bad('Payment provider error',502);await D.patch('orders',o.id,{rzp_order:j.id});out.rzp={key:E.RAZORPAY_KEY_ID,order_id:j.id,amount:total*100}}
  s.json(out)}));
app.post('/api/payments/verify',wrap(async(q,s)=>{const{order_id,razorpay_order_id,razorpay_payment_id,razorpay_signature}=q.body;if(!RZP)throw bad('Online payments not enabled');
  const o=await D.get('orders',+order_id),good=crypto.createHmac('sha256',E.RAZORPAY_KEY_SECRET).update(razorpay_order_id+'|'+razorpay_payment_id).digest('hex');
  if(!o||o.rzp_order!==razorpay_order_id||!eq(good,razorpay_signature||''))throw bad('Verification failed');
  await D.patch('orders',o.id,{pay_status:'paid',rzp_payment:razorpay_payment_id});s.json({ok:true})}));
app.get('/api/orders/track',limit(30,36e5),wrap(async(q,s)=>{const o=await D.get('orders',+q.query.id),ph=String(q.query.phone||'').replace(/\D/g,'').slice(-10);
  if(!o||ph.length<10||o.phone.replace(/\D/g,'').slice(-10)!==ph)throw bad('No order found for those details',404);
  const{id,status,pay_status,total,items,created,method}=o;s.json({id,status,pay_status,total,items,created,method})}));
app.post('/api/enquiries',limit(10,36e5),wrap(async(q,s)=>{const e={name:clean(q.body.name,80),phone:clean(q.body.phone,16),message:clean(q.body.message,1000)};
  if(!e.name||!e.message||!/^\+?[\d ]{10,15}$/.test(e.phone))throw bad('Please enter your name, a valid phone number and a message');
  await D.insert('enquiries',{...e,handled:false,created:new Date().toISOString()});s.json({ok:true})}));
// ---- admin
const ST=['new','confirmed','shipped','delivered','cancelled'],PS=['pending','paid','cod_collected','refunded'];
app.get('/api/admin/orders',auth,wrap(async(q,s)=>s.json((await D.list('orders',true)).slice(0,500))));
app.patch('/api/admin/orders/:id',auth,wrap(async(q,s)=>{const f={};if(ST.includes(q.body.status))f.status=q.body.status;if(PS.includes(q.body.pay_status))f.pay_status=q.body.pay_status;await D.patch('orders',+q.params.id,f);s.json({ok:true})}));
const cell=v=>{v=typeof v==='object'?JSON.stringify(v):String(v??'');if(/^[=+\-@]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
app.get('/api/admin/export.csv',auth,wrap(async(q,s)=>{const rows=await D.list('orders'),cols=['id','created','name','phone','address','city','pin','items','total','method','pay_status','status'];
  s.set({'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="shahee-orders.csv"'});s.send(cols.join(',')+'\n'+rows.map(o=>cols.map(c=>cell(o[c])).join(',')).join('\n'))}));
app.get('/api/admin/products',auth,wrap(async(q,s)=>s.json(await D.list('products'))));
app.put('/api/admin/products/:id',auth,wrap(async(q,s)=>{const f={};if(q.body.price!==undefined){const p=Math.floor(+q.body.price);if(!(p>0&&p<100000))throw bad('Invalid price');f.price=p}if(typeof q.body.active==='boolean')f.active=q.body.active;await D.patch('products',+q.params.id,f);s.json({ok:true})}));
app.post('/api/admin/gallery',auth,upload.single('image'),wrap(async(q,s)=>{if(!q.file)throw bad('Choose a JPG, PNG or WebP image under 3 MB');const n=(await D.list('gallery')).length;
  s.json(await D.insert('gallery',{title:clean(q.body.title,80)||'Untitled',image:'/uploads/'+q.file.filename,sort:n+1}))}));
app.delete('/api/admin/gallery/:id',auth,wrap(async(q,s)=>{const g=await D.get('gallery',+q.params.id);if(g?.image?.startsWith('/uploads/'))fs.unlink(path.join(UP,path.basename(g.image)),()=>{});await D.remove('gallery',+q.params.id);s.json({ok:true})}));
app.get('/api/admin/enquiries',auth,wrap(async(q,s)=>s.json(await D.list('enquiries',true))));
app.patch('/api/admin/enquiries/:id',auth,wrap(async(q,s)=>{await D.patch('enquiries',+q.params.id,{handled:!!q.body.handled});s.json({ok:true})}));
// ---- static + SPA
app.use('/uploads',express.static(UP,{maxAge:'7d'}));
if(fs.existsSync(DIST)){app.use(express.static(DIST,{maxAge:'1h'}));app.get(/^\/(?!api\/|uploads\/).*/,(q,s)=>s.sendFile(path.join(DIST,'index.html')))}
app.use((e,q,s,n)=>s.status(400).json({error:e.message||'Bad request'}));
D.init().then(()=>app.listen(PORT,()=>console.log(`SHAHEE ORGANIC [${D.kind}] on http://localhost:${PORT}${RZP?' (Razorpay on)':''}`))).catch(e=>{console.error('Database error:',e.message);process.exit(1)});

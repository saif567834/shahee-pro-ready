// Storage: MongoDB when MONGODB_URI is set; otherwise a JSON file for local development.
const fs=require('fs'),path=require('path'),E=process.env;
const SEED={products:[{id:200,size:200,price:499,active:true},{id:500,size:500,price:999,active:true}],
gallery:[{title:'Brand poster',image:'/img/poster.jpg',sort:1},{title:'200 ml & 500 ml',image:'/img/hero.jpg',sort:2},{title:'500 ml bottle',image:'/img/b500.jpg',sort:3},{title:'SHAHEE ORGANIC',image:'/img/logo.jpg',sort:4}]};
function mongo(){
  const {MongoClient}=require('mongodb');const cl=new MongoClient(E.MONGODB_URI);let d;
  const fix=o=>{if(!o)return o;const{_id,...r}=o;return{id:_id,...r}};
  const next=async c=>(await d.collection('counters').findOneAndUpdate({_id:c},{$inc:{n:1}},{upsert:true,returnDocument:'after'})).n;
  return{kind:'MongoDB',
    async init(){await cl.connect();d=cl.db(E.MONGODB_DB||'shahee');
      for(const c of Object.keys(SEED))if(!await d.collection(c).countDocuments())for(const x of SEED[c])await this.insert(c,x);
      await d.collection('orders').createIndex({created:-1})},
    list:async(c,desc)=>(await d.collection(c).find().sort({_id:desc?-1:1}).limit(1000).toArray()).map(fix),
    get:async(c,id)=>fix(await d.collection(c).findOne({_id:id})),
    async insert(c,doc){const{id,...r}=doc;const _id=id??await next(c);await d.collection(c).insertOne({_id,...r});return{id:_id,...r}},
    patch:async(c,id,f)=>{await d.collection(c).updateOne({_id:id},{$set:f})},
    remove:async(c,id)=>{await d.collection(c).deleteOne({_id:id})}};
}
function file(){
  const F=E.DATA_FILE||path.join(__dirname,'..','data','db.json');let db={counters:{}};
  const save=()=>{fs.mkdirSync(path.dirname(F),{recursive:true});fs.writeFileSync(F+'.tmp',JSON.stringify(db));fs.renameSync(F+'.tmp',F)};
  const col=c=>db[c]||(db[c]=[]);
  return{kind:'JSON file (local dev only)',
    async init(){if(fs.existsSync(F))db=JSON.parse(fs.readFileSync(F,'utf8'));
      for(const c of Object.keys(SEED))if(!col(c).length)for(const x of SEED[c])await this.insert(c,x);save()},
    list:async(c,desc)=>{const a=col(c).slice().sort((x,y)=>x.id-y.id);return desc?a.reverse():a},
    get:async(c,id)=>col(c).find(x=>x.id===id),
    async insert(c,doc){const id=doc.id??(db.counters[c]=(db.counters[c]||0)+1);const o={...doc,id};col(c).push(o);save();return o},
    patch:async(c,id,f)=>{const o=col(c).find(x=>x.id===id);if(o){Object.assign(o,f);save()}},
    remove:async(c,id)=>{db[c]=col(c).filter(x=>x.id!==id);save()}};
}
module.exports=E.MONGODB_URI?mongo():file();

import React,{useEffect,useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import'./style.css';

type Stats={sucKhoe:number;triTue:number;theLuc:number;danhTieng:number;taiSan:number};
type Log={age:number;text:string;kind?:'event'|'cause'|'effect'|'business'};
type Seed={id:string;createdAge:number;dueAge:number;label:string;resolved:boolean};
type NPC={id:string;name:string;role:string;relation:string;bond:number;memory:string;alive:boolean};
type Role={id:string;name:string;since:number;active:boolean;level:number};
type Company={name:string;foundedAge:number;cash:number;market:number;reputation:number;staff:number;rivalPressure:number;status:'active'|'distressed'|'closed'};
type BusinessAction='price_war'|'quality'|'supplier'|'retain_staff'|'promote_staff'|'lose_staff'|'expand'|'reserve'|'fight_rival_son'|'legal_response'|'walk_away';
type Choice={text:string;result:string;effect:Partial<Stats>;seed?:{id:string;label:string;delay:number};role?:string;businessAction?:BusinessAction};
type Event={title:string;body:string;min:number;max:number;choices:Choice[];role?:string};

const careerEvent:Event={
 title:'Ngã rẽ trưởng thành',
 body:'Bạn bắt đầu phải tự định hình cách kiếm sống. Không lựa chọn nào buộc bạn phải đi theo nó cả đời.',
 min:18,max:18,
 choices:[
  {text:'Tìm một công việc ổn định',result:'Bạn bước vào môi trường công sở và học cách sống bằng nghề nghiệp ổn định.',effect:{taiSan:5},role:'employee'},
  {text:'Theo đuổi học thuật và nghiên cứu',result:'Bạn chọn con đường cần nhiều tri thức và kiên nhẫn.',effect:{triTue:5,taiSan:-2},role:'researcher'},
  {text:'Tự kiếm sống bằng kỹ năng của mình',result:'Bạn chọn cuộc sống tự do hơn, đổi lại là nhiều bất định.',effect:{danhTieng:2},role:'freelancer'},
  {text:'Thử gây dựng việc kinh doanh riêng',result:'Bạn gom vốn, tìm khách hàng đầu tiên và bước vào một cuộc chơi nhiều cơ hội lẫn rủi ro.',effect:{taiSan:-5,triTue:2},role:'entrepreneur'}
 ]};

const roleEvents:Event[]=[
 {title:'Áp lực nơi làm việc',body:'Một dự án ở nơi làm việc gặp trục trặc. Đồng nghiệp đang chờ xem bạn phản ứng thế nào.',min:19,max:70,role:'employee',choices:[
  {text:'Nhận thêm trách nhiệm',result:'Bạn đứng ra xử lý phần việc khó.',effect:{danhTieng:4,sucKhoe:-2}},
  {text:'Rủ đồng nghiệp cùng giải quyết',result:'Bạn biến áp lực thành một lần hợp tác.',effect:{triTue:2}},
  {text:'Tan làm đúng giờ',result:'Công việc quan trọng, nhưng không phải toàn bộ cuộc sống.',effect:{sucKhoe:3}}
 ]},
 {title:'Một hướng nghiên cứu bế tắc',body:'Nhiều tháng làm việc không cho kết quả như mong muốn.',min:19,max:70,role:'researcher',choices:[
  {text:'Kiên trì thử hướng mới',result:'Bạn tiếp tục đào sâu vấn đề.',effect:{triTue:5,taiSan:-2}},
  {text:'Tìm người cộng tác',result:'Một góc nhìn khác mở ra vài khả năng.',effect:{danhTieng:2,triTue:2}},
  {text:'Tạm gác nghiên cứu',result:'Bạn dành thời gian sống bên ngoài phòng làm việc.',effect:{sucKhoe:4}}
 ]},
 {title:'Một hợp đồng khó',body:'Khách hàng đưa ra một công việc nhiều tiền nhưng thời hạn rất gấp.',min:19,max:70,role:'freelancer',choices:[
  {text:'Nhận hợp đồng',result:'Bạn lao vào làm việc để kịp thời hạn.',effect:{taiSan:8,sucKhoe:-4}},
  {text:'Đàm phán lại',result:'Bạn thử bảo vệ giá trị và thời gian của mình.',effect:{danhTieng:3,taiSan:3}},
  {text:'Từ chối để làm việc riêng',result:'Bạn bỏ tiền trước mắt để giữ quyền tự quyết.',effect:{triTue:3}}
 ]}
];

const businessEvents:Event[]=[
 {title:'Thương chiến: đối thủ phá giá',body:'Đối thủ trực tiếp giảm giá mạnh để kéo khách hàng khỏi công ty bạn. Nhân viên muốn biết bạn sẽ đáp trả thế nào.',min:19,max:75,role:'entrepreneur',choices:[
  {text:'Giảm giá đối đầu trực diện',result:'Bạn chấp nhận đốt tiền để giữ thị phần. Cuộc chiến lập tức nóng lên.',effect:{taiSan:-2},businessAction:'price_war'},
  {text:'Giữ giá, nâng chất lượng',result:'Bạn không chạy theo đối thủ mà dồn nguồn lực vào sản phẩm và uy tín.',effect:{triTue:2},businessAction:'quality'},
  {text:'Khóa nguồn cung bằng hợp đồng dài hạn',result:'Bạn dùng tiền và quan hệ để bảo vệ nguồn hàng trước khi đối thủ kịp phản ứng.',effect:{danhTieng:1},businessAction:'supplier'}
 ]},
 {title:'Nhân sự chủ chốt bị săn đón',body:'Một đối thủ đưa đề nghị rất hậu hĩnh cho người giỏi nhất trong đội ngũ của bạn.',min:20,max:75,role:'entrepreneur',choices:[
  {text:'Tăng đãi ngộ để giữ người',result:'Bạn trả giá cao hơn để giữ người chủ chốt ở lại.',effect:{taiSan:-2},businessAction:'retain_staff'},
  {text:'Trao quyền và cơ hội lớn hơn',result:'Bạn đặt niềm tin vào họ thay vì chỉ dùng tiền.',effect:{danhTieng:2},businessAction:'promote_staff'},
  {text:'Để họ ra đi',result:'Bạn chấp nhận mất người và tái cấu trúc đội ngũ.',effect:{triTue:1},businessAction:'lose_staff'}
 ]},
 {title:'Cơ hội mở rộng',body:'Một địa điểm tốt bất ngờ xuất hiện. Nếu hành động nhanh, công ty có thể mở rộng trước đối thủ.',min:21,max:70,role:'entrepreneur',choices:[
  {text:'Đầu tư mở rộng ngay',result:'Bạn đặt một phần lớn nguồn lực vào tăng trưởng.',effect:{taiSan:-3},businessAction:'expand'},
  {text:'Giữ tiền mặt, quan sát thêm',result:'Bạn bỏ qua cơ hội trước mắt để giữ sức cho biến động tiếp theo.',effect:{triTue:2},businessAction:'reserve'},
  {text:'Rủ đối tác cùng tham gia',result:'Bạn chia lợi ích để giảm rủi ro và mở rộng mạng lưới.',effect:{danhTieng:3},businessAction:'supplier'}
 ]},
 {title:'Chuyện ngoài thương trường',body:'Sau một buổi đàm phán căng thẳng, bạn bắt gặp con trai của đối thủ đang hành hung một người bán hàng già bên đường. Đây không phải chuyện kinh doanh.',min:22,max:70,role:'entrepreneur',choices:[
  {text:'Trực tiếp lao vào can ngăn',result:'Bạn đánh nhau ngay giữa đường. Người bán hàng được cứu, nhưng video nhanh chóng lan lên mạng.',effect:{theLuc:-4,danhTieng:2},businessAction:'fight_rival_son',seed:{id:'viral_ceo_fight',label:'Đoạn video bên đường',delay:2}},
  {text:'Gọi công an và giữ bằng chứng',result:'Bạn chọn cách ít bốc đồng hơn nhưng vẫn đứng ra bảo vệ người yếu thế.',effect:{triTue:2,danhTieng:2},businessAction:'legal_response'},
  {text:'Rời đi để tránh kéo công ty vào rắc rối',result:'Bạn bước đi, nhưng hình ảnh người bán hàng vẫn ở lại trong đầu.',effect:{},businessAction:'walk_away'}
 ]}
];

const events:Event[]=[
 {title:'Một món đồ bị đánh rơi',body:'Trên đường về nhà, bạn thấy một chiếc ví nằm bên vệ đường. Không có ai ở gần.',min:7,max:15,choices:[
  {text:'Tìm cách trả lại người mất',result:'Bạn mất cả buổi nhưng cuối cùng tìm được chủ nhân.',effect:{danhTieng:5},seed:{id:'returned_wallet',label:'Một lòng tốt tưởng như rất nhỏ',delay:8}},
  {text:'Giữ lấy tiền bên trong',result:'Bạn mang bí mật nhỏ ấy về nhà.',effect:{taiSan:8},seed:{id:'kept_wallet',label:'Chiếc ví năm ấy',delay:6}},
  {text:'Bỏ qua và đi tiếp',result:'Bạn quyết định chuyện này không liên quan tới mình.',effect:{}}
 ]},
 {title:'Một cuộc tranh cãi',body:'Hai người xa lạ xô xát ngay trước mặt bạn. Một người có vẻ yếu thế hơn.',min:13,max:80,choices:[
  {text:'Can ngăn trực tiếp',result:'Bạn lao vào giữa cuộc xô xát.',effect:{theLuc:-4,danhTieng:4}},
  {text:'Tìm người giúp đỡ',result:'Bạn chọn cách ít liều lĩnh hơn.',effect:{triTue:2}},
  {text:'Không can dự',result:'Bạn rời đi trước khi rắc rối kéo mình vào.',effect:{}}
 ]},
 {title:'Cơ hội học một điều mới',body:'Một người quen giới thiệu cho bạn một khóa học khó nhưng rất đáng thử.',min:10,max:45,choices:[
  {text:'Dành thời gian học',result:'Những ngày vất vả giúp đầu óc bạn sắc bén hơn.',effect:{triTue:6,taiSan:-3}},
  {text:'Tập trung kiếm tiền',result:'Bạn bỏ qua cơ hội và dành thời gian cho công việc.',effect:{taiSan:7}},
  {text:'Tập luyện cơ thể',result:'Bạn chọn rèn luyện bản thân theo một hướng khác.',effect:{theLuc:6}}
 ]},
 {title:'Một lời mời bất ngờ',body:'Một người bạn rủ bạn tham gia một dự án nhỏ. Chưa ai biết nó sẽ đi đến đâu.',min:18,max:65,choices:[
  {text:'Góp tiền và tham gia',result:'Bạn đặt một phần tài sản vào một tương lai chưa rõ ràng.',effect:{taiSan:-8,triTue:3}},
  {text:'Chỉ góp sức',result:'Bạn tham gia nhưng giữ cho mình một đường lui.',effect:{danhTieng:3,triTue:2}},
  {text:'Từ chối',result:'Bạn tiếp tục con đường hiện tại.',effect:{}}
 ]},
 {title:'Một năm bình lặng',body:'Không có biến cố lớn. Bạn có thời gian nhìn lại cách mình đang sống.',min:0,max:100,choices:[
  {text:'Chăm sóc sức khỏe',result:'Bạn sống chậm lại và hồi phục.',effect:{sucKhoe:7}},
  {text:'Đọc và học hỏi',result:'Bạn tích lũy thêm hiểu biết.',effect:{triTue:4}},
  {text:'Làm việc nhiều hơn',result:'Bạn đổi thời gian lấy tiền bạc.',effect:{taiSan:6,sucKhoe:-3}}
 ]}
];

function rng(seed:number){let t=seed+0x6D2B79F5;return()=>{t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const names=['An','Minh','Lâm','Khánh','Hạ','Vy','Nam','Phong','Linh','Nguyên'];
const companyNames=['Mộc Phong','Bắc Minh','Hải Đăng','Tân Lộ','Thiên Hà','Minh Việt'];
const clamp=(n:number)=>Math.max(0,Math.min(100,n));

function fresh(seed=Math.floor(Math.random()*99999999)){
 const r=rng(seed);
 return{
  seed,age:0,name:names[Math.floor(r()*names.length)],
  stats:{sucKhoe:80+Math.floor(r()*16),triTue:25+Math.floor(r()*31),theLuc:25+Math.floor(r()*31),danhTieng:0,taiSan:10},
  logs:[{age:0,text:'Bạn cất tiếng khóc chào đời. Một nhân sinh mới bắt đầu.',kind:'event'}]as Log[],
  seeds:[]as Seed[],flags:{}as Record<string,boolean>,roles:[]as Role[],company:null as Company|null,
  npcs:[
   {id:'me',name:'Mẹ',role:'Gia đình',relation:'Mẹ',bond:78,memory:'Người đã chăm sóc bạn từ thuở nhỏ.',alive:true},
   {id:'friend',name:['Huy','Mai','Tùng','Lan'][Math.floor(r()*4)],role:'Bạn thuở nhỏ',relation:'Bạn bè',bond:45,memory:'Hai người từng chia sẻ những ngày tuổi thơ.',alive:true}
  ]as NPC[],
  turn:0,dead:false,current:events[4]
 }
}
type Game=ReturnType<typeof fresh>;
const KEY='nhan-sinh-lo-v01';
const labels:any={sucKhoe:'Sức khỏe',triTue:'Trí tuệ',theLuc:'Thể lực',danhTieng:'Danh tiếng',taiSan:'Tài sản'};
const icons:any={sucKhoe:'♥',triTue:'◆',theLuc:'⚔',danhTieng:'★',taiSan:'●'};
const roleNames:any={employee:'Nhân viên',researcher:'Nhà nghiên cứu',freelancer:'Làm nghề tự do',entrepreneur:'Doanh nhân'};

function App(){
 const[g,setG]=useState<Game>(()=>{
  try{
   const old=JSON.parse(localStorage.getItem(KEY)||'null');
   if(!old)return fresh();
   if(!old.npcs){const base=fresh(old.seed);old.npcs=base.npcs}
   if(!old.roles)old.roles=[];
   if(old.company===undefined)old.company=null;
   return old
  }catch{return fresh()}
 });
 const[tab,setTab]=useState<'life'|'history'|'relations'|'roles'|'business'>('life');
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(g)),[g]);
 const title=useMemo(()=>g.dead?'Một đời đã khép lại':g.age<13?'Tuổi thơ':g.age<20?'Tuổi trẻ':g.age<60?'Trưởng thành':'Hậu vận',[g.age,g.dead]);

 function nextEvent(age:number,seed:number,turn:number,roles:Role[]=[],company:Company|null=null){
  if(age===18&&roles.length===0)return careerEvent;
  const active=roles.filter(x=>x.active).map(x=>x.id);
  if(active.includes('entrepreneur')&&company&&company.status!=='closed'&&age===19)return businessEvents[0];
  const profession=roleEvents.filter(e=>age>=e.min&&age<=e.max&&e.role&&active.includes(e.role));
  const business=company&&company.status!=='closed'?businessEvents.filter(e=>age>=e.min&&age<=e.max&&e.role&&active.includes(e.role)):[];
  const generic=events.filter(e=>age>=e.min&&age<=e.max);
  const r=rng(seed+turn*9973);
  let pool=[...generic,...profession];
  if(business.length&&r()<.58)pool=[...business,...business,...generic];
  else if(profession.length&&r()<.42)pool=[...profession,...profession,...generic];
  return pool[Math.floor(r()*pool.length)]||events[4]
 }

 function applyBusiness(action:BusinessAction|undefined,company:Company|null,stats:Stats){
  if(!company||!action)return company;
  const c={...company};
  if(action==='price_war'){c.cash-=12;c.market+=8;c.rivalPressure+=12}
  if(action==='quality'){c.cash-=6;c.market+=4;c.reputation+=10;c.rivalPressure-=4}
  if(action==='supplier'){c.cash-=8;c.market+=6;c.rivalPressure-=10}
  if(action==='retain_staff'){c.cash-=7;c.staff+=4;c.reputation+=3}
  if(action==='promote_staff'){c.staff+=8;c.reputation+=6}
  if(action==='lose_staff'){c.staff-=12;c.cash+=3}
  if(action==='expand'){c.cash-=15;c.market+=14;c.staff+=8;c.rivalPressure+=5}
  if(action==='reserve'){c.cash+=5;c.rivalPressure-=3}
  if(action==='fight_rival_son'){c.reputation-=12;c.cash-=6;c.rivalPressure+=18;stats.danhTieng=clamp(stats.danhTieng-4)}
  if(action==='legal_response'){c.reputation+=7;c.rivalPressure-=5}
  if(action==='walk_away'){c.reputation-=2}
  c.cash=clamp(c.cash);c.market=clamp(c.market);c.reputation=clamp(c.reputation);c.staff=clamp(c.staff);c.rivalPressure=clamp(c.rivalPressure);
  c.status=c.cash<=4||c.market<=5?'distressed':'active';
  return c
 }

 function choose(c:Choice){
  if(g.dead)return;
  const age=g.age+1,s={...g.stats},roles=(g.roles||[]).map((x:Role)=>({...x})),npcs=(g.npcs||[]).map((n:NPC)=>({...n}));
  let company=g.company?{...g.company}:null;
  if(c.role&&!roles.some((x:Role)=>x.id===c.role)){
   roles.push({id:c.role,name:roleNames[c.role],since:g.age,active:true,level:1});
   if(c.role==='entrepreneur'){
    const r=rng(g.seed+g.turn+991);
    company={name:companyNames[Math.floor(r()*companyNames.length)],foundedAge:g.age,cash:42,market:18,reputation:22,staff:12,rivalPressure:20,status:'active'};
    if(!npcs.some((n:NPC)=>n.id==='business_rival'))npcs.push({id:'business_rival',name:['Quang','Vũ','Đức','Sơn'][Math.floor(r()*4)],role:'Chủ doanh nghiệp đối thủ',relation:'Đối thủ',bond:12,memory:'Hai bên bắt đầu cạnh tranh cùng một nhóm khách hàng.',alive:true})
   }
  }
  for(const[k,v]of Object.entries(c.effect))s[k as keyof Stats]=clamp(s[k as keyof Stats]+(v||0));
  company=applyBusiness(c.businessAction,company,s);
  s.sucKhoe=clamp(s.sucKhoe-(age>55?2:age>30?1:0));

  let seeds=[...(g.seeds||[])],flags={...(g.flags||{})},logs=[...g.logs,{age:g.age,text:g.current.title+' — '+c.result,kind:c.businessAction?'business':'event'}as Log];
  if(c.seed&&!flags[c.seed.id]){
   seeds.push({id:c.seed.id,createdAge:g.age,dueAge:g.age+c.seed.delay,label:c.seed.label,resolved:false});
   flags[c.seed.id]=true
  }
  for(const q of seeds){
   if(!q.resolved&&age>=q.dueAge){
    q.resolved=true;
    if(q.id==='returned_wallet'){s.danhTieng=clamp(s.danhTieng+10);s.taiSan=clamp(s.taiSan+7);logs.push({age,text:'Nhân → Quả: Người từng được bạn trả lại chiếc ví năm xưa nhận ra bạn và chủ động giúp đỡ lúc bạn cần.',kind:'effect'})}
    if(q.id==='kept_wallet'){s.danhTieng=clamp(s.danhTieng-8);logs.push({age,text:'Nhân → Quả: Chuyện chiếc ví năm xưa bất ngờ bị nhắc lại. Một người biết sự thật khiến danh tiếng của bạn bị tổn hại.',kind:'effect'})}
    if(q.id==='viral_ceo_fight'){
     s.danhTieng=clamp(s.danhTieng-6);
     if(company){company.reputation=clamp(company.reputation-10);company.rivalPressure=clamp(company.rivalPressure+8)}
     logs.push({age,text:'Nhân → Quả: Video vụ ẩu đả năm trước bị đào lại đúng lúc công ty cần ký hợp đồng lớn. Đối thủ dùng nó để công kích uy tín của bạn.',kind:'effect'})
    }
   }
  }

  if(g.current.title==='Một cuộc tranh cãi'){
   const friend=npcs.find((n:NPC)=>n.id==='friend');
   if(friend){
    if(c.text==='Can ngăn trực tiếp'){friend.bond=clamp(friend.bond+8);friend.memory='Bạn từng không ngần ngại đứng ra can thiệp khi thấy người khác bị bắt nạt.'}
    else if(c.text==='Không can dự'){friend.bond=clamp(friend.bond-4);friend.memory='Bạn thường tránh những rắc rối không liên quan trực tiếp tới mình.'}
   }
  }
  if(g.current.title==='Một năm bình lặng'&&c.text==='Chăm sóc sức khỏe'){
   const me=npcs.find((n:NPC)=>n.id==='me');
   if(me){me.bond=clamp(me.bond+2);me.memory='Bạn vẫn dành thời gian cho bản thân và gia đình giữa những năm tháng bình lặng.'}
  }
  if(g.current.title==='Chuyện ngoài thương trường'){
   const rival=npcs.find((n:NPC)=>n.id==='business_rival');
   if(rival&&c.businessAction==='fight_rival_son'){rival.bond=0;rival.memory='Sau vụ ẩu đả liên quan tới con trai họ, cạnh tranh đã biến thành thù địch cá nhân.'}
   if(rival&&c.businessAction==='legal_response'){rival.bond=clamp(rival.bond-5);rival.memory='Bạn từng khiến gia đình họ vướng vào một vụ việc pháp lý, nhưng không trực tiếp dùng bạo lực.'}
  }

  const dead=s.sucKhoe<=0||age>=82+(g.seed%17);
  if(dead)logs.push({age,text:'Cuộc đời khép lại. Những lựa chọn đã trở thành câu chuyện của riêng bạn.',kind:'event'});
  setG({...g,age,stats:s,logs,seeds,flags,npcs,roles,company,turn:g.turn+1,dead,current:nextEvent(age,g.seed,g.turn+1,roles,company)})
 }

 function newLife(){if(confirm('Bắt đầu một nhân sinh mới? Tiến trình hiện tại sẽ được thay thế.')){setG(fresh());setTab('life')}}

 return <main>
  <header><div className="brand"><span>NHÂN SINH LỘ</span><b>V0.5</b></div><button className="ghost" onClick={newLife}>↻ Tân Sinh</button></header>
  <section className="hud">
   <div className="identity"><div className="avatar">{g.name[0]}</div><div><h1>{g.name}</h1><p>{g.age} tuổi · {title}</p></div></div>
   <div className="stats">{Object.entries(g.stats).map(([k,v])=><div className="stat" key={k}><span>{icons[k]} {labels[k]}</span><b>{v}</b></div>)}</div>
  </section>
  <nav>
   <button className={tab==='life'?'active':''} onClick={()=>setTab('life')}>Nhân sinh</button>
   <button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>Dòng đời <i>{g.logs.length}</i></button>
   <button className={tab==='relations'?'active':''} onClick={()=>setTab('relations')}>Quan hệ <i>{(g.npcs||[]).length}</i></button>
   <button className={tab==='roles'?'active':''} onClick={()=>setTab('roles')}>Vai trò <i>{(g.roles||[]).length}</i></button>
   {g.company&&<button className={tab==='business'?'active':''} onClick={()=>setTab('business')}>Doanh nghiệp</button>}
  </nav>

  {tab==='business'&&g.company?<section className="history business">
   <div className="historyHead"><div><span className="chapter">THƯƠNG TRƯỜNG</span><h2>{g.company.name}</h2></div><span>Thành lập năm {g.company.foundedAge} tuổi</span></div>
   <div className="businessGrid">
    <div><span>Tiền mặt</span><b>{g.company.cash}</b><i><em style={{width:g.company.cash+'%'}}/></i></div>
    <div><span>Thị phần</span><b>{g.company.market}</b><i><em style={{width:g.company.market+'%'}}/></i></div>
    <div><span>Uy tín DN</span><b>{g.company.reputation}</b><i><em style={{width:g.company.reputation+'%'}}/></i></div>
    <div><span>Nhân sự</span><b>{g.company.staff}</b><i><em style={{width:g.company.staff+'%'}}/></i></div>
    <div><span>Áp lực đối thủ</span><b>{g.company.rivalPressure}</b><i><em style={{width:g.company.rivalPressure+'%'}}/></i></div>
   </div>
   <div className="businessNote"><b>{g.company.status==='distressed'?'Cảnh báo: doanh nghiệp đang chịu áp lực lớn.':'Doanh nghiệp đang hoạt động.'}</b><p>Thương chiến tác động tới tiền, thị phần, uy tín, nhân sự và quan hệ. Biến cố cá nhân cũng có thể làm cả công ty chệch hướng.</p></div>
  </section>:tab==='roles'?<section className="history roles">
   <div className="historyHead"><div><span className="chapter">NGHỀ NGHIỆP KHÔNG PHẢI CLASS</span><h2>Vai trò của {g.name}</h2></div></div>
   {(g.roles||[]).length?<div className="roleList">{(g.roles||[]).map((r:Role)=><article key={r.id}><strong>{r.name}</strong><span>Từ {r.since} tuổi · {r.active?'Đang hoạt động':'Đã rời'}</span><p>Vai trò này mở thêm hoàn cảnh và sự kiện riêng, nhưng không khóa những biến cố khác trong cuộc đời.</p></article>)}</div>:<p className="emptyRole">Bạn chưa có nghề nghiệp rõ ràng. Cuộc đời vẫn đang mở ra nhiều hướng.</p>}
  </section>:tab==='relations'?<section className="history relations">
   <div className="historyHead"><div><span className="chapter">NHỮNG NGƯỜI TRONG ĐỜI</span><h2>Quan hệ của {g.name}</h2></div></div>
   <div className="relationList">{(g.npcs||[]).map((n:NPC)=><article key={n.id}><div className="npcAvatar">{n.name[0]}</div><div className="npcBody"><strong>{n.name}</strong><span>{n.relation} · {n.role}</span><p>{n.memory}</p><div className="bond"><i style={{width:n.bond+'%'}}/></div></div><b>{n.bond}</b></article>)}</div>
  </section>:tab==='life'?<section className="event">
   {g.dead?<><span className="chapter">BIÊN NIÊN SỬ</span><h2>Nhân sinh đã tận</h2><p>Bạn sống đến {g.age} tuổi. Không có một điểm số duy nhất để phán xét cuộc đời này.</p><button className="choice primary" onClick={newLife}>Tân Sinh một cuộc đời khác</button></>:<>
    <span className="chapter">NĂM {g.age} · {title.toUpperCase()}</span><h2>{g.current.title}</h2><p>{g.current.body}</p>
    <div className="choices">{g.current.choices.map((c,i)=><button className="choice" onClick={()=>choose(c)} key={i}><small>{i+1}</small><span>{c.text}</span></button>)}</div>
    <div className="latest"><b>Gần nhất</b><span>{g.logs[g.logs.length-1].text}</span>{(g.seeds||[]).some((x:Seed)=>!x.resolved)&&<em className="fate">Nhân đã gieo · Quả chưa tới</em>}</div>
   </>}
  </section>:<section className="history">
   <div className="historyHead"><div><span className="chapter">BIÊN NIÊN SỬ</span><h2>Dòng đời của {g.name}</h2></div><span>Mệnh số #{g.seed}</span></div>
   <div className="historyList">{[...g.logs].reverse().map((l,i)=><article key={i}><b>{l.age}</b><div><strong>{l.age} tuổi</strong><p>{l.text}</p>{l.kind==='effect'&&<small className="karma">NHÂN → QUẢ</small>}{l.kind==='business'&&<small className="trade">THƯƠNG TRƯỜNG</small>}</div></article>)}</div>
  </section>}
  <footer>Tự động lưu trên thiết bị</footer>
 </main>
}
createRoot(document.getElementById('root')!).render(<App/>);

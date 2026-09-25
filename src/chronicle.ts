/** V0.12: Pure chronicle, ending and multi-life archive rules. No UI or storage side effects. */
export type LifeLog={age:number;text:string;kind?:string};
export type LifeStats={sucKhoe:number;triTue:number;theLuc:number;danhTieng:number;taiSan:number};
export type LifeSnapshot={
 lifeId?:string;seed:number;name:string;age:number;dead:boolean;stats:LifeStats;logs:LifeLog[];
 roles?:{id:string;name:string;since:number;active:boolean;level:number}[];
 npcs?:{id:string;name:string;role:string;relation:string;bond:number;memory:string;alive:boolean}[];
 seeds?:{id:string;createdAge:number;dueAge:number;label:string;resolved:boolean}[];
 company?:{name:string;market:number;reputation:number;staff:number;status:string}|null;
 martial?:{discovered:boolean;power:number;techniques:{id:string;name:string;level:number}[];grudges?:{active:boolean}[]};
 cultivation?:{discovered:boolean;realm:number;sect:string|null;arts?:{name:string}[]};
 science?:{discovered:boolean;innovation:number;aiLevel:number;cyberware:string[];projects:{id:string;name:string;status:string}[]};
 crisis?:{active:boolean;resolved:boolean;name:string;community:number;preparedness:number;severity:number};
};
export type ChronicleStatus='ongoing'|'completed'|'unfinished';
export type ChroniclePerson={name:string;relation:string;bond:number;memory:string};
export type ChroniclePath={id:string;name:string;detail:string;rare:boolean};
export type LifeRecord={
 id:string;seed:number;name:string;age:number;status:ChronicleStatus;archivedAt:number;
 title:string;ending:string;stats:LifeStats;roles:string[];people:ChroniclePerson[];
 paths:ChroniclePath[];resolvedCauses:number;pendingCauses:number;
 highlights:LifeLog[];logs:LifeLog[];company:string|null;
 discoveries:{martial:boolean;cultivation:boolean;science:boolean;crisis:boolean};
};
export const ARCHIVE_KEY='nhan-sinh-lo-chronicles-v1';
export const ARCHIVE_LIMIT=24;

export function discoverPaths(g:LifeSnapshot):ChroniclePath[]{
 const paths:ChroniclePath[]=[];
 const add=(id:string,name:string,detail:string,rare:boolean)=>paths.push({id,name,detail,rare});
 const roles=g.roles||[],people=g.npcs||[],martial=g.martial,cult=g.cultivation,sci=g.science,crisis=g.crisis;
 const completed=g.dead;
 if(sci?.discovered&&cult?.discovered&&sci.innovation>=28&&cult.realm>=1)
  add('science_cult','Đạo lý và thuật toán','Đồng thời nghiên cứu công nghệ và bước vào con đường tu hành.',true);
 if(martial?.discovered&&sci?.discovered&&(sci.cyberware||[]).length)
  add('cyber_martial','Võ giả cơ giới','Kết hợp võ đạo truyền thống với cơ thể tăng cường.',true);
 if(crisis?.resolved&&crisis.community>=54&&crisis.preparedness>=32)
  add('crisis_guardian','Người giữ lửa','Bước qua đại biến và để lại một cộng đồng có khả năng tự đứng vững.',true);
 if(g.age>=45&&people.some(x=>x.id==='former_student'||x.id==='apprentice'))
  add('mentor_legacy','Người gieo hạt','Một học trò hoặc người học việc được bạn giúp đỡ đã trưởng thành và tìm thấy con đường riêng.',true);
 if(g.company&&g.company.market>=62&&g.company.staff>=14&&g.company.status!=='closed')
  add('company_legacy','Người dựng nghiệp','Gây dựng doanh nghiệp đủ lớn để tác động tới nhiều người.',true);
 if(completed&&g.age>=98&&cult?.discovered&&cult.realm>=3)
  add('long_life','Trường thọ tu hành','Một đời vượt qua tuổi thọ thông thường nhờ tu luyện.',true);
 if(completed&&g.age>=75&&!sci?.discovered&&!cult?.discovered&&!martial?.discovered&&!g.company)
  add('ordinary_legacy','Một đời bình dị','Đi hết chặng đường dài mà không cần một sức mạnh hay đế chế nào.',true);
 if(sci?.discovered)add('science','Dấu chân khoa học','Đời này đã chạm tới nghiên cứu và công nghệ.',false);
 if(cult?.discovered)add('cultivation','Dấu chân tu hành','Đời này đã khai mở con đường linh khí.',false);
 if(martial?.discovered)add('martial','Dấu chân võ đạo','Đời này đã biết thế nào là luyện võ và xung đột.',false);
 if(g.company)add('business','Dấu chân thương trường','Đã từng điều hành một doanh nghiệp trong thế giới biến động.',false);
 if(crisis?.active||crisis?.resolved)add('crisis','Bước qua thời biến','Cuộc đời đã bị cuốn vào một biến cố lớn của thế giới.',false);
 if(roles.length)add('career','Một nghề trong đời','Đã lựa chọn cách mưu sinh giữa vô số ngã rẽ.',false);
 return paths;
}
export function describeEnding(g:LifeSnapshot,paths:ChroniclePath[]):{title:string;ending:string}{
 if(!g.dead)return {title:paths.find(p=>p.rare)?.name||'Cuộc đời đang mở',ending:'Hành trình này vẫn còn những trang chưa viết.'};
 const rare=paths.find(p=>p.rare);
 const cause=g.stats.sucKhoe<=0?'Sức khỏe cạn kiệt sau những năm tháng đã sống.':'Khép lại khi chạm giới hạn tuổi thọ của cuộc đời này.';
 if(rare)return {title:rare.name,ending:cause};
 if(g.cultivation?.discovered)return {title:'Người tìm đường giữa hai giới',ending:cause};
 if(g.science?.discovered)return {title:'Người đi cùng thời đại mới',ending:cause};
 if(g.company)return {title:'Một đời trên thương trường',ending:cause};
 if(g.martial?.discovered)return {title:'Dấu ấn người luyện võ',ending:cause};
 return {title:'Một nhân sinh riêng',ending:cause};
}
export function chronicleHighlights(logs:LifeLog[]):LifeLog[]{
 if(logs.length<=14)return logs.slice();
 const scored=logs.map((log,index)=>{
  const priority=log.kind==='effect'?6:log.kind==='crisis'?5:log.kind==='cultivation'||log.kind==='technology'?4:log.kind==='business'||log.kind==='combat'?3:log.kind==='cause'?3:1;
  const ageBonus=(log.age===14||log.age===18||log.age===24||log.age===50||log.age===75)?1:0;
  return {log,index,score:priority+ageBonus};
 });
 const chosen=new Set<number>([0,logs.length-1]);
 for(const x of scored.sort((a,b)=>b.score-a.score||a.index-b.index)){
  if(chosen.size>=14)break;
  chosen.add(x.index);
 }
 return [...chosen].sort((a,b)=>a-b).map(i=>logs[i]);
}
export function makeLifeRecord(g:LifeSnapshot,status:ChronicleStatus,archivedAt=Date.now()):LifeRecord{
 const paths=discoverPaths(g);
 const {title,ending}=describeEnding({...g,dead:status==='completed'},paths);
 const logs=(g.logs||[]).slice();
 const trimmed=logs.length>400?[logs[0],...logs.slice(-399)]:logs;
 return {
  id:g.lifeId||'legacy-'+g.seed,seed:g.seed,name:g.name,age:g.age,status,archivedAt,
  title:status==='unfinished'?'Cuộc đời viết dở':title,
  ending:status==='unfinished'?'Bạn chọn Tân Sinh trước khi cuộc đời này khép lại.':ending,
  stats:{...g.stats},roles:(g.roles||[]).map(r=>r.name),
  people:(g.npcs||[]).filter(n=>n.alive&&n.bond>=32).sort((a,b)=>b.bond-a.bond).slice(0,8).map(n=>({name:n.name,relation:n.relation,bond:n.bond,memory:n.memory})),
  paths,resolvedCauses:(g.seeds||[]).filter(x=>x.resolved).length,pendingCauses:(g.seeds||[]).filter(x=>!x.resolved).length,
  highlights:chronicleHighlights(logs),logs:trimmed,company:g.company?.name||null,
  discoveries:{martial:!!g.martial?.discovered,cultivation:!!g.cultivation?.discovered,science:!!g.science?.discovered,crisis:!!g.crisis?.active||!!g.crisis?.resolved}
 };
}
export function addLifeRecord(archive:LifeRecord[],record:LifeRecord):LifeRecord[]{
 if(record.status==='ongoing')return archive;
 const prior=archive.find(x=>x.id===record.id);
 if(prior?.status==='completed'&&record.status!=='completed')return archive;
 const without=archive.filter(x=>x.id!==record.id);
 return [record,...without].sort((a,b)=>b.archivedAt-a.archivedAt).slice(0,ARCHIVE_LIMIT);
}
export function readLifeArchive(raw:string|null):LifeRecord[]{
 if(!raw)return [];
 try{
  const data=JSON.parse(raw);
  if(!data||data.version!==1||!Array.isArray(data.records))return [];
  return (data.records as LifeRecord[]).filter(r=>r&&typeof r.id==='string'&&typeof r.name==='string'&&Number.isFinite(r.age)&&Array.isArray(r.logs)&&Array.isArray(r.paths)&&r.stats).slice(0,ARCHIVE_LIMIT);
 }catch{return []}
}
export function serializeLifeArchive(records:LifeRecord[]):string{
 return JSON.stringify({version:1,records:records.slice(0,ARCHIVE_LIMIT)});
}
export function archiveSummary(records:LifeRecord[]){
 const finished=records.filter(r=>r.status==='completed');
 const rareNames=[...new Set(records.flatMap(r=>(r.paths||[]).filter(p=>p.rare).map(p=>p.name)))];
 return {
  lives:records.length,completed:finished.length,unfinished:records.filter(r=>r.status==='unfinished').length,
  longest:finished.length?Math.max(...finished.map(r=>r.age)):0,
  average:finished.length?Math.round(finished.reduce((sum,r)=>sum+r.age,0)/finished.length):0,
  rarePaths:rareNames
 };
}

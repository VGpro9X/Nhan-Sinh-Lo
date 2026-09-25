import test from 'node:test';
import assert from 'node:assert/strict';
import {
 ARCHIVE_LIMIT,addLifeRecord,archiveSummary,chronicleHighlights,
 describeEnding,discoverPaths,makeLifeRecord,readLifeArchive,serializeLifeArchive
} from '../src/chronicle.ts';

function game(overrides={}){
 return {
  lifeId:'life-test',seed:12345,name:'An',age:71,dead:true,
  stats:{sucKhoe:55,triTue:61,theLuc:49,danhTieng:35,taiSan:41},
  roles:[{id:'teacher',name:'Giáo viên',since:19,active:true,level:1}],
  npcs:[{id:'friend',name:'Mai',role:'Bạn thuở nhỏ',relation:'Bạn bè',bond:72,memory:'Một cuộc gặp không quên.',alive:true}],
  logs:[{age:0,text:'Chào đời',kind:'event'},{age:19,text:'Bắt đầu nghề nghiệp',kind:'event'},{age:55,text:'Nhân → Quả: một lời hứa trở lại',kind:'effect'},{age:71,text:'Khép lại',kind:'event'}],
  seeds:[{id:'promise',createdAge:18,dueAge:55,label:'Lời hứa',resolved:true}],
  company:null,martial:{discovered:false,power:12,techniques:[]},
  cultivation:{discovered:false,realm:0,sect:null},science:{discovered:false,innovation:0,aiLevel:0,cyberware:[],projects:[]},
  crisis:{active:false,resolved:false,name:'',community:0,preparedness:0,severity:0},
  ...overrides
 };
}

test('A completed life keeps its choices, relationships, and causal records',()=>{
 const record=makeLifeRecord(game(),'completed',100);
 assert.equal(record.title,'Một nhân sinh riêng');
 assert.equal(record.people[0].name,'Mai');
 assert.equal(record.resolvedCauses,1);
 assert.equal(record.logs.length,4);
 assert.equal(record.highlights[0].age,0);
 assert.equal(record.highlights.at(-1).age,71);
});

test('An active life is never added to the archive, but an unfinished life is',()=>{
 const active=makeLifeRecord(game({dead:false}),'ongoing',100);
 const abandoned=makeLifeRecord(game({dead:false}),'unfinished',101);
 assert.equal(addLifeRecord([],active).length,0);
 assert.equal(addLifeRecord([],abandoned)[0].title,'Cuộc đời viết dở');
});

test('A completed record upgrades an unfinished record without duplicates',()=>{
 const partial=makeLifeRecord(game({dead:false}),'unfinished',100);
 const completed=makeLifeRecord(game(),'completed',101);
 const stored=addLifeRecord(addLifeRecord([],partial),completed);
 assert.equal(stored.length,1);
 assert.equal(stored[0].status,'completed');
 assert.equal(addLifeRecord(stored,partial)[0].status,'completed');
});

test('The archive has an upper bound and retains the newest lives',()=>{
 let records=[];
 for(let i=0;i<ARCHIVE_LIMIT+3;i++){
  records=addLifeRecord(records,makeLifeRecord(game({lifeId:'life-'+i,seed:9000+i}),'completed',i));
 }
 assert.equal(records.length,ARCHIVE_LIMIT);
 assert.equal(records[0].id,'life-'+(ARCHIVE_LIMIT+2));
 assert.equal(records.at(-1).id,'life-3');
});

test('Archive serialization restores records and rejects malformed or foreign schemas',()=>{
 const records=[makeLifeRecord(game(),'completed',100)];
 assert.deepEqual(readLifeArchive(serializeLifeArchive(records)),records);
 assert.deepEqual(readLifeArchive('{invalid'),[]);
 assert.deepEqual(readLifeArchive(JSON.stringify({version:3,records})),[]);
 assert.deepEqual(readLifeArchive('null'),[]);
});

test('Statistics distinguish finished and unfinished lives',()=>{
 const records=[makeLifeRecord(game({lifeId:'one',age:71}),'completed',101),
                makeLifeRecord(game({lifeId:'two',age:89}),'completed',102),
                makeLifeRecord(game({lifeId:'three',age:38,dead:false}),'unfinished',103)];
 const summary=archiveSummary(records);
 assert.deepEqual([summary.lives,summary.completed,summary.unfinished,summary.longest,summary.average],[3,2,1,89,80]);
});

test('Rare cross-system discoveries require their real prerequisites',()=>{
 const base=game();
 assert.equal(discoverPaths(base).filter(x=>x.rare).length,0);
 const hybrid=game({
  science:{discovered:true,innovation:42,aiLevel:28,cyberware:['Cánh tay trợ lực'],projects:[]},
  cultivation:{discovered:true,realm:2,sect:null},
  martial:{discovered:true,power:56,techniques:[]},
  crisis:{active:false,resolved:true,name:'Đại Khủng Hoảng',community:75,preparedness:55,severity:12}
 });
 const paths=discoverPaths(hybrid).filter(x=>x.rare).map(x=>x.id);
 assert.ok(paths.includes('science_cult'));
 assert.ok(paths.includes('cyber_martial'));
 assert.ok(paths.includes('crisis_guardian'));
 assert.equal(describeEnding(hybrid,discoverPaths(hybrid)).title,'Đạo lý và thuật toán');
});

test('Long ordinary life is valid, without treating supernatural power as mandatory',()=>{
 const ordinary=game({age:85});
 assert.ok(discoverPaths(ordinary).some(x=>x.id==='ordinary_legacy'));
 assert.equal(describeEnding(ordinary,discoverPaths(ordinary)).title,'Một đời bình dị');
});

test('Highlights preserve the first and last pages and favor consequences',()=>{
 const logs=Array.from({length:50},(_,i)=>({age:i,text:'Năm '+i,kind:i===24?'effect':'event'}));
 const highlights=chronicleHighlights(logs);
 assert.equal(highlights.length,14);
 assert.equal(highlights[0].text,'Năm 0');
 assert.equal(highlights.at(-1).text,'Năm 49');
 assert.ok(highlights.some(x=>x.text==='Năm 24'));
});

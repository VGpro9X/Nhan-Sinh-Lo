import React,{useEffect,useMemo,useState}from'react';
import{createRoot}from'react-dom/client';
import'./style.css';

type Stats={sucKhoe:number;triTue:number;theLuc:number;danhTieng:number;taiSan:number};
type Log={age:number;text:string;kind?:'event'|'cause'|'effect'|'business'|'combat'|'world'|'cultivation'};
type Seed={id:string;createdAge:number;dueAge:number;label:string;resolved:boolean};
type NPC={id:string;name:string;role:string;relation:string;bond:number;memory:string;alive:boolean};
type Role={id:string;name:string;since:number;active:boolean;level:number};
type Company={name:string;foundedAge:number;cash:number;market:number;reputation:number;staff:number;rivalPressure:number;status:'active'|'distressed'|'closed'};
type Technique={id:string;name:string;level:number;kind:'attack'|'defense'|'movement'};
type Grudge={npcId:string;level:number;reason:string;dueAge:number;active:boolean};
type Martial={discovered:boolean;power:number;experience:number;wounds:number;techniques:Technique[];grudges:Grudge[]};
type Organization={id:string;name:string;kind:string;power:number;wealth:number;influence:number;status:string};
type WorldNews={age:number;year:number;title:string;text:string};
type WorldState={year:number;economy:number;stability:number;technology:number;supernatural:number;organizations:Organization[];news:WorldNews[]};
type CultArt={id:string;name:string;level:number;kind:'method'|'spell'|'body'};
type Artifact={id:string;name:string;grade:string;note:string};
type Cultivation={discovered:boolean;spiritRoot:string;realm:number;qi:number;foundation:number;sect:string|null;arts:CultArt[];artifacts:Artifact[];mystery:number};
type BusinessAction='price_war'|'quality'|'supplier'|'retain_staff'|'promote_staff'|'lose_staff'|'expand'|'reserve'|'fight_rival_son'|'legal_response'|'walk_away';
type WorldAction='upskill'|'save'|'invest'|'network'|'observe';
type MartialAction='learn_fist'|'learn_step'|'train_fist'|'train_guard'|'train_step'|'strike'|'guard'|'evade'|'deescalate';
type CultAction='awaken_breath'|'inspect_relic'|'ignore_mystery'|'meditate'|'refine_body'|'seek_clue'|'join_sect'|'refuse_sect'|'breakthrough'|'stabilize'|'delay_breakthrough'|'seal_spirit'|'follow_spirit'|'avoid_spirit';
type CombatSpec={id:string;name:string;power:number;grudgeId?:string};
type Choice={text:string;result:string;effect:Partial<Stats>;seed?:{id:string;label:string;delay:number};role?:string;businessAction?:BusinessAction;martialAction?:MartialAction;worldAction?:WorldAction;cultAction?:CultAction};
type WorldCondition='weak_economy'|'strong_economy'|'tech_wave';
type Event={title:string;body:string;min:number;max:number;choices:Choice[];role?:string;combat?:CombatSpec;worldCondition?:WorldCondition};

const careerEvent:Event={
 title:'Ngã rẽ trưởng thành',
 body:'Bạn bắt đầu phải tự định hình cách kiếm sống. Không lựa chọn nào buộc bạn phải đi theo nó cả đời.',
 min:18,max:100,
 choices:[
  {text:'Tìm một công việc ổn định',result:'Bạn bước vào môi trường công sở và học cách sống bằng nghề nghiệp ổn định.',effect:{taiSan:5},role:'employee'},
  {text:'Theo đuổi học thuật và nghiên cứu',result:'Bạn chọn con đường cần nhiều tri thức và kiên nhẫn.',effect:{triTue:5,taiSan:-2},role:'researcher'},
  {text:'Tự kiếm sống bằng kỹ năng của mình',result:'Bạn chọn cuộc sống tự do hơn, đổi lại là nhiều bất định.',effect:{danhTieng:2},role:'freelancer'},
  {text:'Thử gây dựng việc kinh doanh riêng',result:'Bạn gom vốn, tìm khách hàng đầu tiên và bước vào một cuộc chơi nhiều cơ hội lẫn rủi ro.',effect:{taiSan:-5,triTue:2},role:'entrepreneur'}
 ]};

const martialIntroEvent:Event={
 title:'Ông lão tập quyền bên hồ',
 body:'Một buổi sáng, bạn thấy một ông lão tập những động tác chậm nhưng nặng như đá. Ông nhìn bạn rồi hỏi: “Muốn thử không?”',
 min:14,max:14,
 choices:[
  {text:'Xin học một bài quyền căn bản',result:'Bạn vụng về lặp lại từng thế quyền cho đến khi cánh tay mỏi nhừ.',effect:{theLuc:3},martialAction:'learn_fist'},
  {text:'Chú ý cách ông di chuyển',result:'Bạn không học quyền, chỉ quan sát cách bàn chân đổi hướng và giữ thăng bằng.',effect:{triTue:2},martialAction:'learn_step'},
  {text:'Cảm ơn rồi tiếp tục cuộc sống',result:'Bạn bỏ qua một cánh cửa nhỏ mà không biết nó sẽ dẫn tới đâu.',effect:{}}
 ]};

const firstDuelEvent:Event={
 title:'Lời thách đấu đầu tiên',
 body:'Khải, một thiếu niên thường tập võ gần khu phố, nghe chuyện bạn từng học vài chiêu và cố tình chặn đường. Cậu ta muốn phân thắng bại.',
 min:15,max:70,
 combat:{id:'martial_rival',name:'Khải',power:34,grudgeId:'martial_rival'},
 choices:[
  {text:'Đối mặt và ra đòn trước',result:'Bạn chấp nhận cuộc đối đầu.',effect:{},martialAction:'strike'},
  {text:'Giữ thế, chờ đối phương sơ hở',result:'Bạn không vội tấn công mà tập trung bảo vệ mình.',effect:{},martialAction:'guard'},
  {text:'Cố gắng hạ nhiệt chuyện này',result:'Bạn không muốn một lời thách thức nhỏ biến thành ân oán dài lâu.',effect:{triTue:1},martialAction:'deescalate'}
 ]};

const martialEvents:Event[]=[
 {title:'Buổi tập dưới mưa',body:'Bạn có một buổi tối rảnh. Cơ thể mỏi mệt nhưng đây là lúc tốt để mài giũa thứ mình đã học.',min:15,max:75,choices:[
  {text:'Luyện quyền đến khi tay run',result:'Bạn lặp đi lặp lại những đòn đánh cơ bản.',effect:{theLuc:2},martialAction:'train_fist'},
  {text:'Luyện thủ và chịu va chạm',result:'Bạn tập cách đứng vững khi bị ép lùi.',effect:{sucKhoe:-1,theLuc:2},martialAction:'train_guard'},
  {text:'Luyện bộ pháp và né tránh',result:'Bạn dành phần lớn thời gian để di chuyển thay vì ra đòn.',effect:{triTue:1,theLuc:1},martialAction:'train_step'}
 ]},
 {title:'Một vụ cướp giữa đường',body:'Một kẻ cầm dao giật túi của người đi đường rồi lao qua trước mặt bạn. Khoảnh khắc quyết định chỉ kéo dài vài giây.',min:16,max:70,combat:{id:'street_thug',name:'Kẻ cướp',power:38},choices:[
  {text:'Chặn đường và đánh ngã hắn',result:'Bạn lao vào trước khi kẻ cướp kịp chạy xa.',effect:{danhTieng:2},martialAction:'strike'},
  {text:'Giữ khoảng cách, ép hắn bỏ dao',result:'Bạn ưu tiên an toàn thay vì cố hạ đối phương thật nhanh.',effect:{danhTieng:1},martialAction:'guard'},
  {text:'Bám theo, chờ thời cơ khống chế',result:'Bạn dùng khoảng cách và địa hình để tránh đối đầu trực diện.',effect:{triTue:2},martialAction:'evade'}
 ]},
 {title:'Một lời mời tỷ thí',body:'Một người tập võ nghe về bạn và đề nghị giao đấu kín, không tiền thưởng, không khán giả — chỉ để biết ai hơn ai.',min:18,max:70,combat:{id:'sparring_guest',name:'Người tập võ lạ',power:46},choices:[
  {text:'Nhận lời và đánh áp đảo',result:'Bạn muốn thử giới hạn thực chiến của mình.',effect:{},martialAction:'strike'},
  {text:'Nhận lời nhưng thiên về phòng thủ',result:'Bạn coi đây là cơ hội học cách đọc đối thủ.',effect:{triTue:1},martialAction:'guard'},
  {text:'Từ chối giao đấu',result:'Bạn không thấy cần phải chứng minh điều gì hôm nay.',effect:{sucKhoe:1}}
 ]}
];

function revengeEvent(grudge:Grudge):Event{
 return{
  title:'Ân oán quay lại',
  body:'Khải xuất hiện sau nhiều năm. Chuyện cũ chưa hề biến mất với cậu ta. Lần này, cả hai đều đã khác trước.',
  min:0,max:100,
  combat:{id:'martial_rival_return',name:'Khải',power:42+Math.floor(grudge.level/3),grudgeId:'martial_rival'},
  choices:[
   {text:'Giải quyết bằng một trận cuối',result:'Bạn chấp nhận rằng có những ân oán chỉ kết thúc sau khi một bên chịu dừng.',effect:{},martialAction:'strike'},
   {text:'Đánh chắc, không để cơn giận dẫn đường',result:'Bạn giữ đầu óc tỉnh táo dù đối thủ liên tục khiêu khích.',effect:{triTue:1},martialAction:'guard'},
   {text:'Nói thẳng để chấm dứt ân oán',result:'Bạn thử kết thúc chuyện cũ mà không cần thêm thương tích.',effect:{},martialAction:'deescalate'}
  ]
 }
}


const worldEvents:Event[]=[
 {title:'Thị trường lao động chững lại',body:'Nhiều công ty trong thành phố đồng loạt thắt chặt tuyển dụng. Không ai nhắm riêng vào bạn — cả nền kinh tế đang chậm lại.',min:18,max:70,worldCondition:'weak_economy',choices:[
  {text:'Dành thời gian học thêm kỹ năng',result:'Bạn dùng giai đoạn khó khăn để bổ sung năng lực cho mình.',effect:{triTue:4,taiSan:-2},worldAction:'upskill'},
  {text:'Thắt chặt chi tiêu và giữ tiền',result:'Bạn giảm rủi ro cá nhân để chờ thị trường ổn định hơn.',effect:{taiSan:3},worldAction:'save'},
  {text:'Tiếp tục như bình thường',result:'Bạn không để biến động bên ngoài thay đổi nhịp sống của mình.',effect:{},worldAction:'observe'}
 ]},
 {title:'Một làn sóng công nghệ mới',body:'Công nghệ mới lan nhanh qua trường học, doanh nghiệp và đời sống. Một số công việc biến đổi chỉ trong vài năm.',min:18,max:75,worldCondition:'tech_wave',choices:[
  {text:'Học cách sử dụng công nghệ mới',result:'Bạn chủ động thích nghi trước khi nó trở thành tiêu chuẩn.',effect:{triTue:4},worldAction:'upskill'},
  {text:'Tìm người đang đi trước để kết nối',result:'Bạn mở rộng mạng lưới quanh một xu hướng đang tăng tốc.',effect:{danhTieng:3},worldAction:'network'},
  {text:'Quan sát thêm trước khi nhập cuộc',result:'Bạn chờ xem xu hướng nào thực sự tồn tại lâu dài.',effect:{triTue:1},worldAction:'observe'}
 ]},
 {title:'Thị trường tăng trưởng nóng',body:'Tiền và cơ hội lưu chuyển nhanh hơn. Người ta nói nhiều về mở rộng, đầu tư và những người giàu lên rất nhanh.',min:19,max:70,worldCondition:'strong_economy',choices:[
  {text:'Chấp nhận rủi ro để đầu tư',result:'Bạn đưa một phần nguồn lực vào cơ hội mới.',effect:{taiSan:-2},worldAction:'invest'},
  {text:'Mở rộng quan hệ',result:'Bạn ưu tiên gặp người mới thay vì lao ngay vào một thương vụ.',effect:{danhTieng:3},worldAction:'network'},
  {text:'Không chạy theo đám đông',result:'Bạn giữ nhịp sống riêng dù bên ngoài đang rất sôi động.',effect:{sucKhoe:2},worldAction:'observe'}
 ]}
];


const mysticIntroEvent:Event={
 title:'Cuốn sổ không có chữ',
 body:'Trong một quầy sách cũ, bạn nhặt được cuốn sổ giấy vàng. Dưới ánh đèn không có gì đặc biệt, nhưng khi đặt tay lên bìa, bạn nghe một nhịp rung rất khẽ từ bên trong cơ thể.',
 min:16,max:80,
 choices:[
  {text:'Ngồi yên và thử cảm nhận nhịp rung',result:'Bạn làm theo trực giác, điều hòa hơi thở và lần đầu cảm thấy một dòng khí rất mỏng chạy qua kinh mạch.',effect:{triTue:2},cultAction:'awaken_breath'},
  {text:'Mang cuốn sổ về nghiên cứu',result:'Bạn chưa tin vào chuyện siêu nhiên, nhưng những ký hiệu mờ dần hiện ra khi đêm xuống.',effect:{triTue:3},cultAction:'inspect_relic'},
  {text:'Đặt lại chỗ cũ và rời đi',result:'Bạn quyết định không chạm sâu hơn vào thứ mình chưa hiểu.',effect:{},cultAction:'ignore_mystery'}
 ]
};

const sectInviteEvent:Event={
 title:'Người khách biết tên bạn',
 body:'Một người lạ tìm đến đúng lúc chạng vạng. Họ gọi chính xác tên bạn và nói rằng những gì bạn đang tự mò mẫm chỉ là bước đầu của “con đường luyện khí”.',
 min:16,max:100,
 choices:[
  {text:'Theo họ tới Ẩn Sơn Môn',result:'Bạn bước qua một lối nhỏ trên núi và phát hiện một thế giới tu hành vẫn tồn tại song song với đời thường.',effect:{triTue:2},cultAction:'join_sect'},
  {text:'Chỉ hỏi phương pháp rồi từ chối gia nhập',result:'Bạn giữ tự do của mình, đổi lấy việc phải tự tìm đường nhiều hơn.',effect:{triTue:2},cultAction:'refuse_sect'},
  {text:'Không tin và cắt đứt cuộc nói chuyện',result:'Bạn không muốn một người lạ can thiệp vào cuộc sống hiện tại.',effect:{},cultAction:'ignore_mystery'}
 ]
};

function breakthroughEvent(cult:Cultivation):Event{
 const realms=['Cảm Khí','Luyện Khí tầng 1','Luyện Khí tầng 2','Luyện Khí tầng 3','Trúc Cơ'];
 const next=realms[Math.min(realms.length-1,cult.realm+1)];
 return{
  title:'Bình cảnh tu hành',
  body:'Linh khí tích tụ đã chạm tới giới hạn của '+realms[cult.realm]+'. Nếu tiếp tục, bạn có thể thử đột phá lên '+next+' — nhưng nền tảng chưa chắc đã chịu nổi.',
  min:0,max:120,
  choices:[
   {text:'Thử đột phá ngay',result:'Bạn gom toàn bộ linh khí và ép nó vượt qua bình cảnh.',effect:{},cultAction:'breakthrough'},
   {text:'Củng cố căn cơ trước',result:'Bạn tạm gác cảnh giới để làm nền tảng vững hơn.',effect:{sucKhoe:2},cultAction:'stabilize'},
   {text:'Không mạo hiểm lúc này',result:'Bạn giữ trạng thái hiện tại và tiếp tục sống cuộc đời thường ngày.',effect:{},cultAction:'delay_breakthrough'}
  ]
 }
}

const cultivationEvents:Event[]=[
 {title:'Một đêm tĩnh tọa',body:'Sau một ngày rất bình thường, khi mọi người đã ngủ, bạn cảm thấy linh khí quanh mình rõ hơn thường lệ.',min:16,max:100,choices:[
  {text:'Tĩnh tọa hấp thu linh khí',result:'Bạn dành nhiều giờ điều hòa hơi thở và dẫn khí.',effect:{sucKhoe:1},cultAction:'meditate'},
  {text:'Dùng linh khí rèn cơ thể',result:'Bạn dẫn luồng khí mỏng qua cơ bắp và xương khớp.',effect:{theLuc:2},cultAction:'refine_body'},
  {text:'Ghi lại cảm giác để nghiên cứu sau',result:'Bạn không vội tu luyện mà cố hiểu quy luật phía sau hiện tượng.',effect:{triTue:2},cultAction:'seek_clue'}
 ]},
 {title:'Chiếc chuông đồng ở chợ đồ cũ',body:'Một chiếc chuông nhỏ khiến đầu ngón tay bạn lạnh đi khi chạm vào. Người bán chỉ coi nó là đồ trang trí cũ.',min:18,max:90,choices:[
  {text:'Mua và thử truyền linh khí vào',result:'Những hoa văn dưới lớp gỉ sáng lên trong vài giây.',effect:{taiSan:-3},cultAction:'inspect_relic'},
  {text:'Hỏi nguồn gốc món đồ',result:'Bạn lần theo câu chuyện của những người từng sở hữu nó.',effect:{triTue:2},cultAction:'seek_clue'},
  {text:'Không dây vào đồ lạ',result:'Bạn để chiếc chuông lại giữa hàng trăm món đồ cũ.',effect:{},cultAction:'ignore_mystery'}
 ]},
 {title:'Tiếng gõ trong căn phòng trống',body:'Một căn phòng khóa kín trong khu nhà vẫn phát ra ba tiếng gõ vào cùng một giờ mỗi đêm. Hàng xóm bắt đầu tránh đi qua hành lang đó.',min:18,max:90,choices:[
  {text:'Dùng linh khí thử trấn áp',result:'Bạn đứng trước cánh cửa và thử dùng những gì đã học để ép luồng âm khí lùi lại.',effect:{sucKhoe:-2},cultAction:'seal_spirit'},
  {text:'Đi theo dấu khí lạ để tìm nguyên nhân',result:'Bạn không đối đầu trực tiếp mà lần theo nguồn của hiện tượng.',effect:{triTue:2},cultAction:'follow_spirit'},
  {text:'Không can thiệp',result:'Bạn quyết định bí ẩn này không đáng để đánh cược sức khỏe.',effect:{},cultAction:'avoid_spirit'}
 ]},
 {title:'Một khe đá có linh khí',body:'Trong chuyến đi ngắn ngoài thành phố, bạn phát hiện một khe đá có không khí lạnh bất thường. Cảm giác linh khí ở đây đậm hơn nhiều nơi khác.',min:20,max:100,choices:[
  {text:'Ở lại tu luyện một đêm',result:'Bạn tận dụng nơi hiếm hoi có linh khí dày để tăng tốc tu hành.',effect:{sucKhoe:1},cultAction:'meditate'},
  {text:'Tìm xem có cổ vật hay dấu tích nào không',result:'Bạn khám phá sâu hơn thay vì chỉ hấp thu linh khí.',effect:{triTue:2},cultAction:'inspect_relic'},
  {text:'Ghi nhớ địa điểm rồi trở về',result:'Bạn không để việc tu hành phá hỏng kế hoạch hiện tại của cuộc sống.',effect:{},cultAction:'seek_clue'}
 ]}
];

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
 {title:'Chuyện ngoài thương trường',body:'Sau một buổi đàm phán căng thẳng, bạn bắt gặp con trai của đối thủ đang hành hung một người bán hàng già bên đường. Đây không phải chuyện kinh doanh.',min:22,max:70,role:'entrepreneur',combat:{id:'rival_son',name:'Con trai đối thủ',power:43},choices:[
  {text:'Trực tiếp lao vào can ngăn',result:'Bạn đánh nhau ngay giữa đường. Người bán hàng được cứu, nhưng video nhanh chóng lan lên mạng.',effect:{danhTieng:2},businessAction:'fight_rival_son',martialAction:'strike',seed:{id:'viral_ceo_fight',label:'Đoạn video bên đường',delay:2}},
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
const roleNames:any={employee:'Nhân viên',researcher:'Nhà nghiên cứu',freelancer:'Làm nghề tự do',entrepreneur:'Doanh nhân'};



const realmNames=['Cảm Khí','Luyện Khí tầng 1','Luyện Khí tầng 2','Luyện Khí tầng 3','Trúc Cơ'];
const realmQi=[16,28,42,62,999];

function createCultivation():Cultivation{
 return{discovered:false,spiritRoot:'Chưa rõ',realm:0,qi:0,foundation:20,sect:null,arts:[],artifacts:[],mystery:0}
}

function addCultArt(c:Cultivation,id:string,name:string,kind:CultArt['kind']){
 const found=c.arts.find(x=>x.id===id);
 if(found)found.level=Math.min(5,found.level+1);
 else c.arts.push({id,name,kind,level:1})
}

function addArtifact(c:Cultivation,id:string,name:string,grade:string,note:string){
 if(!c.artifacts.some(x=>x.id===id))c.artifacts.push({id,name,grade,note})
}

function createWorld(seed:number):WorldState{
 const r=rng(seed+4049);
 return{
  year:2026,
  economy:48+Math.floor(r()*17),
  stability:52+Math.floor(r()*17),
  technology:38+Math.floor(r()*12),
  supernatural:3+Math.floor(r()*5),
  organizations:[
   {id:'corp_union',name:'Liên Minh Thương Hội',kind:'Kinh tế',power:52,wealth:64,influence:49,status:'Đang mở rộng'},
   {id:'martial_assoc',name:'Hội Võ Thuật Bắc Thành',kind:'Võ đạo',power:46,wealth:31,influence:42,status:'Hoạt động ổn định'},
   {id:'research_inst',name:'Viện Tân Minh',kind:'Khoa học',power:38,wealth:44,influence:47,status:'Đang nghiên cứu'}
  ],
  news:[{age:0,year:2026,title:'Một thế giới đang vận động',text:'Bạn ra đời trong một xã hội đã có những tổ chức, thị trường và xu hướng riêng — chúng sẽ tiếp tục thay đổi dù bạn có chú ý hay không.'}]
 }
}

function advanceWorld(world:WorldState,seed:number,age:number,company:Company|null,npcs:NPC[],roles:Role[]){
 const r=rng(seed+age*12347+world.year*17);
 world.year+=1;
 const oldEconomy=world.economy,oldTech=world.technology,oldStability=world.stability;
 world.economy=clamp(world.economy+Math.floor(r()*11)-5);
 world.stability=clamp(world.stability+Math.floor(r()*9)-4);
 world.technology=clamp(world.technology+1+Math.floor(r()*3));
 world.supernatural=clamp(world.supernatural+(r()<.16?1:0));

 for(const o of world.organizations){
  o.power=clamp(o.power+Math.floor(r()*9)-4);
  o.wealth=clamp(o.wealth+Math.floor(r()*11)-5+(world.economy>60?2:world.economy<40?-2:0));
  o.influence=clamp(o.influence+Math.floor(r()*9)-4);
  if(o.power<25)o.status='Suy yếu';
  else if(o.influence>70)o.status='Ảnh hưởng mạnh';
  else if(o.wealth>70)o.status='Đang mở rộng';
  else o.status='Hoạt động ổn định';
 }

 if(company&&company.status!=='closed'){
  const eco=world.economy>62?2:world.economy<38?-3:0;
  company.cash=clamp(company.cash+eco);
  company.market=clamp(company.market+(world.economy>68?2:world.economy<34?-2:0));
  if(world.stability<35)company.rivalPressure=clamp(company.rivalPressure+2);
 }

 const friend=npcs.find(n=>n.id==='friend');
 if(friend&&age>=18&&age%6===0){
  const options=[
   'Trong lúc bạn bận với cuộc sống riêng, họ đã chuyển sang một công việc mới ở nơi khác.',
   'Họ đang dần xây dựng cuộc sống riêng và ít xuất hiện hơn trước.',
   'Một thay đổi của thị trường khiến công việc của họ đảo lộn, nhưng họ vẫn đang tự xoay xở.'
  ];
  friend.memory=options[Math.floor(r()*options.length)];
  friend.bond=clamp(friend.bond-2);
 }

 if(age>0&&age%3===0){
  let title='Nhịp thế giới thay đổi',text='Không có biến cố đơn lẻ nào chi phối tất cả, nhưng môi trường quanh bạn đã khác vài năm trước.';
  if(world.economy-oldEconomy>=4){title='Thị trường khởi sắc';text='Hoạt động kinh tế tăng nhanh, doanh nghiệp và người lao động đều cảm nhận rõ cơ hội mới.'}
  else if(world.economy-oldEconomy<=-4){title='Kinh tế chững lại';text='Dòng tiền thận trọng hơn, tuyển dụng và đầu tư bắt đầu chậm lại.'}
  else if(world.technology-oldTech>=3){title='Công nghệ tăng tốc';text='Một lớp công nghệ mới đang dần thay đổi cách người ta học tập và làm việc.'}
  else if(world.stability-oldStability<=-3){title='Xã hội nhiều biến động';text='Những bất ổn nhỏ xuất hiện dày hơn, khiến các tổ chức trở nên dè chừng.'}
  world.news.unshift({age,year:world.year,title,text});
  world.news=world.news.slice(0,12);
 }
}

function addOrLevelTechnique(m:Martial,id:string,name:string,kind:Technique['kind']){
 const found=m.techniques.find(x=>x.id===id);
 if(found)found.level=Math.min(5,found.level+1);
 else m.techniques.push({id,name,kind,level:1});
}

function fresh(seed=Math.floor(Math.random()*99999999)){
 const r=rng(seed);
 return{
  seed,age:0,name:names[Math.floor(r()*names.length)],
  stats:{sucKhoe:80+Math.floor(r()*16),triTue:25+Math.floor(r()*31),theLuc:25+Math.floor(r()*31),danhTieng:0,taiSan:10},
  logs:[{age:0,text:'Bạn cất tiếng khóc chào đời. Một nhân sinh mới bắt đầu.',kind:'event'}]as Log[],
  seeds:[]as Seed[],flags:{}as Record<string,boolean>,roles:[]as Role[],company:null as Company|null,world:createWorld(seed),
  martial:{discovered:false,power:14+Math.floor(r()*8),experience:0,wounds:0,techniques:[],grudges:[]}as Martial,
  cultivation:createCultivation(),
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

function App(){
 const[g,setG]=useState<Game>(()=>{
  try{
   const old=JSON.parse(localStorage.getItem(KEY)||'null');
   if(!old)return fresh();
   if(!old.npcs){const base=fresh(old.seed);old.npcs=base.npcs}
   if(!old.roles)old.roles=[];
   if(old.company===undefined)old.company=null;
   if(!old.world)old.world=createWorld(old.seed);
   if(!old.world.organizations)old.world.organizations=createWorld(old.seed).organizations;
   if(!old.world.news)old.world.news=[];
   if(!old.martial)old.martial={discovered:false,power:16,experience:0,wounds:0,techniques:[],grudges:[]};
   if(!old.martial.techniques)old.martial.techniques=[];
   if(!old.martial.grudges)old.martial.grudges=[];
   if(!old.cultivation)old.cultivation=createCultivation();
   if(!old.cultivation.arts)old.cultivation.arts=[];
   if(!old.cultivation.artifacts)old.cultivation.artifacts=[];
   return old
  }catch{return fresh()}
 });
 const[tab,setTab]=useState<'life'|'history'|'relations'|'roles'|'business'|'martial'|'world'|'cultivation'>('life');
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(g)),[g]);
 const title=useMemo(()=>g.dead?'Một đời đã khép lại':g.age<13?'Tuổi thơ':g.age<20?'Tuổi trẻ':g.age<60?'Trưởng thành':'Hậu vận',[g.age,g.dead]);

 function nextEvent(age:number,seed:number,turn:number,roles:Role[]=[],company:Company|null=null,martial:Martial,flags:Record<string,boolean>={},world:WorldState,cult:Cultivation){
  if(age===14&&!flags.martial_intro_seen)return martialIntroEvent;
  if(martial.discovered&&age>=15&&!flags.martial_first_duel_done)return firstDuelEvent;
  const dueGrudge=martial.grudges.find(x=>x.active&&age>=x.dueAge);
  if(dueGrudge)return revengeEvent(dueGrudge);
  if(age>=18&&roles.length===0)return careerEvent;
  if(age>=20&&!flags.mystic_intro_seen&&world.supernatural>=4)return mysticIntroEvent;
  if(cult.discovered&&!cult.sect&&cult.qi>=10&&!flags.sect_invite_seen)return sectInviteEvent;
  if(cult.discovered&&cult.realm<realmNames.length-1&&cult.qi>=realmQi[cult.realm])return breakthroughEvent(cult);

  const active=roles.filter(x=>x.active).map(x=>x.id);
  if(active.includes('entrepreneur')&&company&&company.status!=='closed'&&age===19)return businessEvents[0];
  const profession=roleEvents.filter(e=>age>=e.min&&age<=e.max&&e.role&&active.includes(e.role));
  const business=company&&company.status!=='closed'?businessEvents.filter(e=>age>=e.min&&age<=e.max&&e.role&&active.includes(e.role)):[];
  const martialPool=martial.discovered?martialEvents.filter(e=>age>=e.min&&age<=e.max):[];
  const cultivationPool=cult.discovered?cultivationEvents.filter(e=>age>=e.min&&age<=e.max):[];
  const generic=events.filter(e=>age>=e.min&&age<=e.max);
  const worldPool=worldEvents.filter(e=>age>=e.min&&age<=e.max&&((e.worldCondition==='weak_economy'&&world.economy<=42)||(e.worldCondition==='strong_economy'&&world.economy>=66)||(e.worldCondition==='tech_wave'&&world.technology>=58)));
  const r=rng(seed+turn*9973);
  let pool=[...generic,...profession,...worldPool];
  const roll=r();
  if(business.length&&roll<.42)pool=[...business,...business,...generic,...martialPool,...cultivationPool];
  else if(cultivationPool.length&&roll<.64)pool=[...cultivationPool,...cultivationPool,...generic,...profession,...martialPool];
  else if(martialPool.length&&roll<.78)pool=[...martialPool,...martialPool,...generic,...profession,...cultivationPool];
  else if(profession.length&&roll<.89)pool=[...profession,...profession,...generic,...cultivationPool];
  else if(worldPool.length&&roll<.96)pool=[...worldPool,...worldPool,...generic,...profession,...martialPool,...cultivationPool];
  else pool=[...generic,...profession,...martialPool,...cultivationPool,...worldPool];
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
  if(action==='fight_rival_son'){c.reputation-=9;c.cash-=5;c.rivalPressure+=16;stats.danhTieng=clamp(stats.danhTieng-3)}
  if(action==='legal_response'){c.reputation+=7;c.rivalPressure-=5}
  if(action==='walk_away'){c.reputation-=2}
  c.cash=clamp(c.cash);c.market=clamp(c.market);c.reputation=clamp(c.reputation);c.staff=clamp(c.staff);c.rivalPressure=clamp(c.rivalPressure);
  c.status=c.cash<=4||c.market<=5?'distressed':'active';
  return c
 }

 function resolveMartial(action:MartialAction|undefined,event:Event,martial:Martial,stats:Stats){
  if(!action)return null;
  const m=martial;
  if(action==='learn_fist'){
   m.discovered=true;m.power=clamp(m.power+9);m.experience+=5;addOrLevelTechnique(m,'basic_fist','Căn Bản Quyền','attack');
   return{outcome:'learn',text:'Bạn chính thức bước chân vào võ đạo với Căn Bản Quyền.'}
  }
  if(action==='learn_step'){
   m.discovered=true;m.power=clamp(m.power+7);m.experience+=5;addOrLevelTechnique(m,'flow_step','Lưu Bộ','movement');
   return{outcome:'learn',text:'Bạn ghi nhớ Lưu Bộ — cách di chuyển giúp mình không đứng yên trước sức mạnh.'}
  }
  if(action==='train_fist'){m.discovered=true;m.power=clamp(m.power+4);m.experience+=6;addOrLevelTechnique(m,'basic_fist','Căn Bản Quyền','attack');return{outcome:'train',text:'Quyền pháp của bạn gọn hơn và nặng hơn.'}}
  if(action==='train_guard'){m.discovered=true;m.power=clamp(m.power+3);m.experience+=6;addOrLevelTechnique(m,'iron_guard','Thiết Thủ','defense');return{outcome:'train',text:'Bạn học cách chịu lực và giữ thế khi bị ép.'}}
  if(action==='train_step'){m.discovered=true;m.power=clamp(m.power+3);m.experience+=6;addOrLevelTechnique(m,'flow_step','Lưu Bộ','movement');return{outcome:'train',text:'Bộ pháp của bạn linh hoạt hơn sau hàng trăm lần đổi hướng.'}}
  if(!event.combat)return null;

  m.discovered=true;
  const atk=m.techniques.filter(x=>x.kind==='attack').reduce((a,x)=>a+x.level*3,0);
  const def=m.techniques.filter(x=>x.kind==='defense').reduce((a,x)=>a+x.level*3,0);
  const move=m.techniques.filter(x=>x.kind==='movement').reduce((a,x)=>a+x.level*3,0);
  const r=rng(g.seed+g.turn*7919+event.combat.power);
  let player=m.power+stats.theLuc*.34+stats.triTue*.10+r()*18;
  let enemy=event.combat.power+r()*16;
  if(action==='strike')player+=8+atk;
  if(action==='guard')player+=4+def+stats.triTue*.06;
  if(action==='evade')player+=3+move+stats.triTue*.12;

  if(action==='deescalate'){
   const social=stats.triTue*.55+stats.danhTieng*.45+m.experience*.15+r()*20;
   const threshold=event.combat.power*.9+18;
   if(social>=threshold){m.experience+=2;return{outcome:'peace',text:'Bạn khiến căng thẳng hạ xuống trước khi có thêm người bị thương.'}}
   stats.sucKhoe=clamp(stats.sucKhoe-4);m.wounds+=1;m.experience+=3;
   return{outcome:'failed_peace',text:'Lời nói không đủ. Cuộc xô xát vẫn nổ ra và bạn chịu một vết thương nhẹ.'}
  }

  const diff=player-enemy;
  if(diff>=8){
   m.experience+=10;m.power=clamp(m.power+3);stats.danhTieng=clamp(stats.danhTieng+2);
   return{outcome:'win',text:'Bạn thắng thế trong cuộc đối đầu nhờ năng lực và lựa chọn chiến thuật của mình.'}
  }
  if(diff>-8){
   m.experience+=7;m.power=clamp(m.power+2);stats.sucKhoe=clamp(stats.sucKhoe-4);m.wounds+=1;
   return{outcome:'draw',text:'Không ai thật sự áp đảo. Bạn rời cuộc đối đầu với thương tích nhưng cũng hiểu mình hơn.'}
  }
  m.experience+=5;stats.sucKhoe=clamp(stats.sucKhoe-(action==='guard'?6:10));m.wounds+=1;
  return{outcome:'loss',text:'Bạn thất thế. Thực chiến cho thấy sức mạnh hiện tại vẫn chưa đủ.'}
 }


 function resolveCultivation(action:CultAction|undefined,cult:Cultivation,stats:Stats,world:WorldState,martial:Martial){
  if(!action)return null;
  const c=cult;
  const r=rng(g.seed+g.turn*6151+world.year);

  if(action==='ignore_mystery'){c.mystery=Math.max(0,c.mystery-1);return{outcome:'ignore',text:'Bạn để bí ẩn trôi qua và tiếp tục cuộc sống hiện tại.'}}
  if(action==='awaken_breath'){
   c.discovered=true;c.spiritRoot=c.spiritRoot==='Chưa rõ'?(['Mộc','Thủy','Kim','Hỏa','Thổ'][Math.floor(r()*5)]+' linh căn'):c.spiritRoot;c.qi+=8;c.foundation+=5;c.mystery+=4;
   addCultArt(c,'breath_method','Dẫn Khí Quyết','method');world.supernatural=clamp(world.supernatural+2);
   return{outcome:'discover',text:'Bạn cảm nhận được linh khí thật sự. '+c.spiritRoot+' của bạn bắt đầu phản ứng.'}
  }
  if(action==='inspect_relic'){
   c.discovered=true;c.mystery+=7;c.qi+=4;addArtifact(c,'old_bell','Cổ Linh Chung','Không rõ','Chiếc chuông phản ứng với linh khí và đôi khi tự rung khi có khí lạ gần đó.');world.supernatural=clamp(world.supernatural+2);
   return{outcome:'artifact',text:'Bạn xác nhận vật này không bình thường và giữ lại Cổ Linh Chung.'}
  }
  if(action==='meditate'){c.qi+=7+Math.floor(r()*5);c.foundation=clamp(c.foundation+2);addCultArt(c,'breath_method','Dẫn Khí Quyết','method');return{outcome:'train',text:'Linh khí tích tụ thêm trong cơ thể, chậm nhưng rõ ràng.'}}
  if(action==='refine_body'){c.qi+=3;c.foundation=clamp(c.foundation+4);stats.theLuc=clamp(stats.theLuc+2);stats.sucKhoe=clamp(stats.sucKhoe+2);if(martial.discovered)martial.power=clamp(martial.power+2);addCultArt(c,'jade_body','Ngọc Cốt Pháp','body');return{outcome:'train',text:'Linh khí thấm vào cơ thể, khiến thể chất và võ đạo cùng được lợi.'}}
  if(action==='seek_clue'){c.mystery+=5;stats.triTue=clamp(stats.triTue+1);return{outcome:'clue',text:'Bạn chưa mạnh hơn ngay, nhưng hiểu thêm một phần quy luật ẩn sau những hiện tượng lạ.'}}
  if(action==='join_sect'){
   c.discovered=true;c.sect='Ẩn Sơn Môn';c.qi+=6;c.foundation=clamp(c.foundation+8);addCultArt(c,'cloud_formula','Thanh Vân Tâm Pháp','method');
   if(!world.organizations.some(o=>o.id==='hidden_sect'))world.organizations.push({id:'hidden_sect',name:'Ẩn Sơn Môn',kind:'Tu hành',power:61,wealth:35,influence:18,status:'Ẩn thế'});
   return{outcome:'sect',text:'Bạn trở thành ngoại môn đệ tử của Ẩn Sơn Môn, nhưng cuộc sống ngoài thế tục vẫn tiếp tục.'}
  }
  if(action==='refuse_sect'){c.mystery+=3;c.foundation=clamp(c.foundation+2);return{outcome:'sect_refuse',text:'Bạn chọn con đường tán tu và giữ khoảng cách với tông môn.'}}
  if(action==='stabilize'){c.foundation=clamp(c.foundation+10);c.qi=Math.max(0,c.qi-3);return{outcome:'stabilize',text:'Bạn dùng linh khí để củng cố kinh mạch thay vì chạy theo cảnh giới.'}}
  if(action==='delay_breakthrough'){c.foundation=clamp(c.foundation+3);return{outcome:'delay',text:'Bạn giữ linh khí lại và chờ một thời điểm phù hợp hơn.'}}
  if(action==='breakthrough'){
   const chance=42+c.foundation*.45+stats.triTue*.12+c.arts.reduce((a,x)=>a+x.level*2,0);
   const roll=r()*100;
   if(roll<chance){
    c.realm=Math.min(realmNames.length-1,c.realm+1);c.qi=Math.max(0,c.qi-Math.floor(realmQi[Math.max(0,c.realm-1)]*.72));c.foundation=clamp(c.foundation-8);stats.sucKhoe=clamp(stats.sucKhoe+5);world.supernatural=clamp(world.supernatural+1);
    return{outcome:'breakthrough',text:'Bạn vượt qua bình cảnh và bước vào '+realmNames[c.realm]+'.'}
   }
   c.qi=Math.max(0,c.qi-7);c.foundation=clamp(c.foundation-5);stats.sucKhoe=clamp(stats.sucKhoe-7);
   return{outcome:'failed_breakthrough',text:'Đột phá thất bại. Linh khí tán loạn khiến cơ thể bị phản phệ.'}
  }
  if(action==='seal_spirit'){
   const power=c.qi+c.foundation*.4+c.realm*14+stats.triTue*.15+r()*16;
   if(power>42){c.qi+=5;c.mystery+=6;addCultArt(c,'spirit_seal','Trấn Linh Ấn','spell');world.supernatural=clamp(world.supernatural-1);return{outcome:'seal',text:'Bạn trấn được luồng âm khí và lĩnh ngộ Trấn Linh Ấn.'}}
   stats.sucKhoe=clamp(stats.sucKhoe-6);c.mystery+=3;return{outcome:'seal_fail',text:'Âm khí phản chấn khiến bạn bị thương trước khi hiện tượng tạm lắng xuống.'}
  }
  if(action==='follow_spirit'){c.mystery+=8;c.qi+=3;addArtifact(c,'yin_shard','Mảnh Âm Ngọc','Phàm phẩm','Một mảnh ngọc lạnh tìm thấy ở nguồn của hiện tượng linh dị.');return{outcome:'occult',text:'Bạn lần ra nguồn dị tượng và nhặt được một Mảnh Âm Ngọc.'}}
  if(action==='avoid_spirit'){return{outcome:'avoid',text:'Bạn tránh xa hiện tượng linh dị và không để nó cuốn cuộc sống mình đi quá xa.'}}
  return null
 }

 function choose(c:Choice){
  if(g.dead)return;
  const age=g.age+1,s={...g.stats},roles=(g.roles||[]).map((x:Role)=>({...x})),npcs=(g.npcs||[]).map((n:NPC)=>({...n}));
  let company=g.company?{...g.company}:null;
  const world:WorldState={...(g.world||createWorld(g.seed)),organizations:(g.world?.organizations||createWorld(g.seed).organizations).map((o:Organization)=>({...o})),news:[...(g.world?.news||[])]};
  const martial:Martial={...(g.martial||{discovered:false,power:16,experience:0,wounds:0,techniques:[],grudges:[]}),techniques:(g.martial?.techniques||[]).map((x:Technique)=>({...x})),grudges:(g.martial?.grudges||[]).map((x:Grudge)=>({...x}))};
  const cultivation:Cultivation={...(g.cultivation||createCultivation()),arts:(g.cultivation?.arts||[]).map((x:CultArt)=>({...x})),artifacts:(g.cultivation?.artifacts||[]).map((x:Artifact)=>({...x}))};
  let flags={...(g.flags||{})};

  if(c.role&&!roles.some((x:Role)=>x.id===c.role)){
   roles.push({id:c.role,name:roleNames[c.role],since:g.age,active:true,level:1});
   if(c.role==='entrepreneur'){
    const r=rng(g.seed+g.turn+991);
    company={name:companyNames[Math.floor(r()*companyNames.length)],foundedAge:g.age,cash:42,market:18,reputation:22,staff:12,rivalPressure:20,status:'active'};
    if(!npcs.some((n:NPC)=>n.id==='business_rival'))npcs.push({id:'business_rival',name:['Quang','Vũ','Đức','Sơn'][Math.floor(r()*4)],role:'Chủ doanh nghiệp đối thủ',relation:'Đối thủ',bond:12,memory:'Hai bên bắt đầu cạnh tranh cùng một nhóm khách hàng.',alive:true})
   }
  }

  for(const[k,v]of Object.entries(c.effect))s[k as keyof Stats]=clamp(s[k as keyof Stats]+(v||0));
  const martialResult=resolveMartial(c.martialAction,g.current,martial,s);
  const cultResult=resolveCultivation(c.cultAction,cultivation,s,world,martial);
  company=applyBusiness(c.businessAction,company,s);

  if(c.worldAction==='invest'){
   if(company&&company.status!=='closed'){company.cash=clamp(company.cash-5);company.market=clamp(company.market+(world.economy>=60?7:3));company.reputation=clamp(company.reputation+2)}
   else s.taiSan=clamp(s.taiSan+(world.economy>=60?6:2));
  }
  if(c.worldAction==='network'&&company)company.reputation=clamp(company.reputation+3);
  if(c.worldAction==='save'&&company)company.cash=clamp(company.cash+3);
  const aging=cultivation.realm>=4?(age>80?1:0):cultivation.realm>=2?(age>60?1:age>35?1:0):(age>55?2:age>30?1:0);
  s.sucKhoe=clamp(s.sucKhoe-aging);

  let seeds=[...(g.seeds||[])],logs=[...g.logs,{age:g.age,text:g.current.title+' — '+c.result,kind:c.businessAction?'business':c.martialAction?'combat':c.cultAction?'cultivation':'event'}as Log];
  if(martialResult)logs.push({age:g.age,text:'Võ đạo — '+martialResult.text,kind:'combat'});
  if(cultResult)logs.push({age:g.age,text:'Tu tiên / Huyền bí — '+cultResult.text,kind:'cultivation'});

  if(g.current===martialIntroEvent)flags.martial_intro_seen=true;
  if(g.current.title==='Cuốn sổ không có chữ')flags.mystic_intro_seen=true;
  if(g.current.title==='Người khách biết tên bạn')flags.sect_invite_seen=true;
  if(g.current.title==='Lời thách đấu đầu tiên'){
   flags.martial_first_duel_done=true;
   let rival=npcs.find((n:NPC)=>n.id==='martial_rival');
   if(!rival){
    rival={id:'martial_rival',name:'Khải',role:'Người tập võ',relation:'Kình địch',bond:5,memory:'Một lời thách đấu tuổi trẻ đã biến hai người thành đối thủ.',alive:true};
    npcs.push(rival)
   }
   const harsh=c.martialAction!=='deescalate';
   rival.bond=harsh?0:12;
   rival.memory=harsh?'Trận đấu đầu tiên để lại lòng hiếu thắng và một ân oán chưa dứt.':'Bạn từng cố dừng cuộc đối đầu trước khi nó trở thành thù hận.';
   const existing=martial.grudges.find(x=>x.npcId==='martial_rival');
   if(existing){existing.active=true;existing.level=harsh?45:22;existing.dueAge=age+4}
   else martial.grudges.push({npcId:'martial_rival',level:harsh?45:22,reason:'Lời thách đấu tuổi trẻ',dueAge:age+4,active:true})
  }

  if(g.current.title==='Ân oán quay lại'){
   const grudge=martial.grudges.find(x=>x.npcId==='martial_rival'&&x.active);
   const rival=npcs.find((n:NPC)=>n.id==='martial_rival');
   if(grudge){
    if(martialResult?.outcome==='peace'||martialResult?.outcome==='win'){grudge.active=false;grudge.level=Math.max(0,grudge.level-30);if(rival){rival.relation='Cựu kình địch';rival.bond=25;rival.memory='Ân oán cũ cuối cùng đã được khép lại.'}}
    else{grudge.level=clamp(grudge.level+15);grudge.dueAge=age+3;if(rival)rival.memory='Cuộc tái ngộ khiến ân oán càng sâu hơn.'}
   }
  }

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
   if(rival&&c.businessAction==='fight_rival_son'){
    rival.bond=0;
    rival.memory=martialResult?.outcome==='win'?'Bạn đánh bại con trai họ giữa phố; thương chiến đã biến thành thù địch cá nhân.':'Vụ ẩu đả liên quan tới con trai họ khiến cạnh tranh biến thành thù địch cá nhân.'
   }
   if(rival&&c.businessAction==='legal_response'){rival.bond=clamp(rival.bond-5);rival.memory='Bạn từng khiến gia đình họ vướng vào một vụ việc pháp lý, nhưng không trực tiếp dùng bạo lực.'}
  }

  advanceWorld(world,g.seed,age,company,npcs,roles);
  const lifespanBonus=cultivation.realm>=4?30:cultivation.realm>=3?16:cultivation.realm>=2?8:0;
  const dead=s.sucKhoe<=0||age>=82+(g.seed%17)+lifespanBonus;
  if(dead)logs.push({age,text:'Cuộc đời khép lại. Những lựa chọn đã trở thành câu chuyện của riêng bạn.',kind:'event'});
  setG({...g,age,stats:s,logs,seeds,flags,npcs,roles,company,martial,cultivation,world,turn:g.turn+1,dead,current:nextEvent(age,g.seed,g.turn+1,roles,company,martial,flags,world,cultivation)})
 }

 function newLife(){if(confirm('Bắt đầu một nhân sinh mới? Tiến trình hiện tại sẽ được thay thế.')){setG(fresh());setTab('life')}}

 return <main>
  <header><div className="brand"><span>NHÂN SINH LỘ</span><b>V0.8</b></div><button className="ghost" onClick={newLife}>↻ Tân Sinh</button></header>
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
   {g.martial?.discovered&&<button className={tab==='martial'?'active':''} onClick={()=>setTab('martial')}>Võ đạo <i>{g.martial.techniques.length}</i></button>}
   <button className={tab==='world'?'active':''} onClick={()=>setTab('world')}>Thế giới</button>
   {g.cultivation?.discovered&&<button className={tab==='cultivation'?'active':''} onClick={()=>setTab('cultivation')}>Tu tiên <i>{g.cultivation.realm+1}</i></button>}
  </nav>

  {tab==='cultivation'&&g.cultivation?.discovered?<section className="history cultivation">
   <div className="historyHead"><div><span className="chapter">TU TIÊN / HUYỀN BÍ</span><h2>{realmNames[g.cultivation.realm]}</h2></div><span>{g.cultivation.sect||'Tán tu'}</span></div>
   <div className="cultStats">
    <div><span>Linh khí</span><b>{g.cultivation.qi}</b><i><em style={{width:Math.min(100,g.cultivation.qi)+'%'}}/></i></div>
    <div><span>Căn cơ</span><b>{g.cultivation.foundation}</b><i><em style={{width:g.cultivation.foundation+'%'}}/></i></div>
    <div><span>Linh căn</span><b>{g.cultivation.spiritRoot}</b></div>
    <div><span>Huyền bí</span><b>{g.cultivation.mystery}</b></div>
   </div>
   <div className="cultColumns">
    <div><h3>Công pháp</h3><div className="cultList">{g.cultivation.arts.length?g.cultivation.arts.map((a:CultArt)=><article key={a.id}><strong>{a.name}</strong><span>{a.kind==='method'?'Tâm pháp':a.kind==='spell'?'Thuật pháp':'Luyện thể'} · Cấp {a.level}/5</span></article>):<p>Chưa có công pháp thành hình.</p>}</div></div>
    <div><h3>Cổ vật</h3><div className="cultList">{g.cultivation.artifacts.length?g.cultivation.artifacts.map((a:Artifact)=><article key={a.id}><strong>{a.name}</strong><span>{a.grade}</span><p>{a.note}</p></article>):<p>Chưa có cổ vật.</p>}</div></div>
   </div>
   <div className="cultNote"><b>{g.cultivation.sect?'Tông môn: '+g.cultivation.sect:'Bạn đang tự tìm đường giữa thế tục.'}</b><p>Tu hành không thay thế nghề nghiệp, gia đình hay cuộc sống thường ngày. Nó chỉ mở thêm một tầng nhân sinh có thể va chạm với mọi hệ thống khác.</p></div>
  </section>:tab==='world'?<section className="history world">
   <div className="historyHead"><div><span className="chapter">THẾ GIỚI KHÔNG CHỜ BẠN</span><h2>Năm {g.world.year}</h2></div><span>Tuổi của bạn: {g.age}</span></div>
   <div className="worldStats">
    <div><span>Kinh tế</span><b>{g.world.economy}</b><i><em style={{width:g.world.economy+'%'}}/></i></div>
    <div><span>Ổn định</span><b>{g.world.stability}</b><i><em style={{width:g.world.stability+'%'}}/></i></div>
    <div><span>Công nghệ</span><b>{g.world.technology}</b><i><em style={{width:g.world.technology+'%'}}/></i></div>
    <div><span>Siêu nhiên</span><b>{g.world.supernatural}</b><i><em style={{width:g.world.supernatural+'%'}}/></i></div>
   </div>
   <h3>Tổ chức</h3>
   <div className="orgList">{g.world.organizations.map((o:Organization)=><article key={o.id}><div><strong>{o.name}</strong><span>{o.kind} · {o.status}</span></div><div className="orgNumbers"><b>{o.power}</b><small>Sức mạnh</small><b>{o.influence}</b><small>Ảnh hưởng</small></div></article>)}</div>
   <h3>Biến động gần đây</h3>
   <div className="worldNews">{g.world.news.length?g.world.news.map((n:WorldNews,i:number)=><article key={i}><b>{n.year}</b><div><strong>{n.title}</strong><p>{n.text}</p></div></article>):<p>Thế giới chưa ghi nhận biến động đáng chú ý.</p>}</div>
  </section>:tab==='martial'&&g.martial?.discovered?<section className="history martial">
   <div className="historyHead"><div><span className="chapter">XUNG ĐỘT & VÕ ĐẠO</span><h2>Võ đạo của {g.name}</h2></div><span>Kinh nghiệm {g.martial.experience}</span></div>
   <div className="martialStats">
    <div><span>Thực lực</span><b>{g.martial.power}</b></div>
    <div><span>Kinh nghiệm</span><b>{g.martial.experience}</b></div>
    <div><span>Thương tích</span><b>{g.martial.wounds}</b></div>
    <div><span>Ân oán</span><b>{g.martial.grudges.filter((x:Grudge)=>x.active).length}</b></div>
   </div>
   <h3>Kỹ năng đã học</h3>
   <div className="techList">{g.martial.techniques.length?g.martial.techniques.map((t:Technique)=><article key={t.id}><strong>{t.name}</strong><span>{t.kind==='attack'?'Tấn công':t.kind==='defense'?'Phòng thủ':'Bộ pháp'} · Cấp {t.level}/5</span></article>):<p>Chưa có kỹ năng thành hình.</p>}</div>
   {g.martial.grudges.some((x:Grudge)=>x.active)&&<div className="grudgeBox"><b>Ân oán chưa dứt</b>{g.martial.grudges.filter((x:Grudge)=>x.active).map((x:Grudge)=><p key={x.npcId}>{x.reason} · Mức {x.level}</p>)}</div>}
  </section>:tab==='business'&&g.company?<section className="history business">
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
    {g.current.combat&&<div className="combatHint"><span>XUNG ĐỘT</span><b>{g.current.combat.name}</b><em>Uy hiếp {g.current.combat.power}</em></div>}
    <div className="choices">{g.current.choices.map((c,i)=><button className="choice" onClick={()=>choose(c)} key={i}><small>{i+1}</small><span>{c.text}</span></button>)}</div>
    <div className="latest"><b>Gần nhất</b><span>{g.logs[g.logs.length-1].text}</span>{(g.seeds||[]).some((x:Seed)=>!x.resolved)&&<em className="fate">Nhân đã gieo · Quả chưa tới</em>}</div>
   </>}
  </section>:<section className="history">
   <div className="historyHead"><div><span className="chapter">BIÊN NIÊN SỬ</span><h2>Dòng đời của {g.name}</h2></div><span>Mệnh số #{g.seed}</span></div>
   <div className="historyList">{[...g.logs].reverse().map((l,i)=><article key={i}><b>{l.age}</b><div><strong>{l.age} tuổi</strong><p>{l.text}</p>{l.kind==='effect'&&<small className="karma">NHÂN → QUẢ</small>}{l.kind==='business'&&<small className="trade">THƯƠNG TRƯỜNG</small>}{l.kind==='combat'&&<small className="combatTag">VÕ ĐẠO</small>}{l.kind==='world'&&<small className="worldTag">THẾ GIỚI</small>}{l.kind==='cultivation'&&<small className="cultTag">TU TIÊN / HUYỀN BÍ</small>}</div></article>)}</div>
  </section>}
  <footer>Tự động lưu trên thiết bị</footer>
 </main>
}
createRoot(document.getElementById('root')!).render(<App/>);

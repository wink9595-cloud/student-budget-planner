const CE=['อาหาร','เดินทาง','การเรียน','อื่นๆ'],CI=['เงินจากผู้ปกครอง','ทุนการศึกษา','งานพิเศษ'],GN=['ซื้อโน้ตบุ๊ก','ซื้อ iPad','ไปเที่ยว','ซื้อโทรศัพท์ใหม่','เงินฉุกเฉิน'];
const MN=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>'฿'+Math.round(n).toLocaleString('en-US');
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const NOW=new Date(),TD=iso(NOW),WK=iso(new Date(Date.now()-6*864e5)),MO=TD.slice(0,7),YR=TD.slice(0,4);
const dayOf=n=>MO+'-'+String(Math.min(n,NOW.getDate())).padStart(2,'0');
let S,U={s:'welcome',type:'expense',cat:'อาหาร',bp:'month',ap:'month',f:'all',q:'',reg:false};
function seed(){let id=0;const t=(type,amt,cat,note,d)=>({id:++id,type,amt,cat,note,date:dayOf(d)});
 return{user:null,remind:true,alert:true,nid:20,
 tx:[t('income',6000,'เงินจากผู้ปกครอง','เงินเดือนนี้',1),t('expense',320,'อาหาร','ข้าวมื้อเย็น',3),t('expense',320,'อาหาร','ซื้อของเข้าห้อง',5),t('expense',60,'อาหาร','ข้าวกลางวัน',99),t('expense',260,'เดินทาง','ค่ารถรายสัปดาห์',4),t('expense',40,'เดินทาง','ค่ารถ',99),t('expense',180,'การเรียน','ถ่ายเอกสาร',2),t('expense',565,'อื่นๆ','ของใช้ส่วนตัว',6),t('expense',55,'อื่นๆ','กาแฟ',99)],
 budgets:{'อาหาร':1800,'เดินทาง':800,'การเรียน':500,'อื่นๆ':700},
 goals:[{id:1,name:'ซื้อโน้ตบุ๊ก',target:12000,saved:4800,months:6},{id:2,name:'ไปเที่ยว',target:5000,saved:750,months:10}]}}
try{S=JSON.parse(localStorage.getItem('sbp'))}catch(e){}
if(!S)S=seed();if(S.user)U.s='dash';
const save=()=>{try{localStorage.setItem('sbp',JSON.stringify(S))}catch(e){}};
const inP=(p,d)=>p==='day'?d===TD:p==='week'?d>=WK:p==='month'?d.slice(0,7)===MO:d.slice(0,4)===YR;
const sum=(type,f=()=>true)=>S.tx.filter(x=>x.type===type&&f(x)).reduce((a,x)=>a+x.amt,0);
const spent=(c,p)=>sum('expense',x=>x.cat===c&&inP(p,x.date));
const fac={day:1/30,week:7/30,month:1};
const lim=(c,p)=>S.budgets[c]*fac[p];
const ch=(items,cur,act)=>items.map(([v,l])=>`<button class="g${v===cur?' on':''}" data-a="${act}" data-v="${esc(v)}">${l}</button>`).join('');
const I=(k,l,type='text',ph='')=>`<label class="m">${l}<input class="i" data-k="${k}" type="${type}" value="${esc(U[k]??'')}" placeholder="${ph}"></label>`;
const row=(a,b,v,k)=>`<div class="r"><div>${a}<div class="m">${b}</div></div><span class="${k}">${v}</span></div>`;
const bud=(c,p)=>{const u=spent(c,p),l=lim(c,p),pc=l?u*100/l:0,bad=pc>85;return`<div class="c"><div class="r"><span>${c}${pc>100?' <b class="ex">เกินงบ</b>':pc>=80?' <b class="ex">ใกล้เกินงบ</b>':''}</span><span class="m">${fmt(u)} / ${fmt(l)}</span></div><div class="bar"><i style="width:${Math.min(100,pc)}%;${bad?'background:var(--er)':''}"></i></div></div>`};
function alerts(){const a=[];if(S.alert)CE.forEach(c=>{const u=spent(c,'month'),l=S.budgets[c];if(u>l)a.push(['ex','เกินงบ',`หมวด “${c}” ใช้ไป ${fmt(u)} เกินงบ ${fmt(u-l)}`]);else if(u>=l*.8)a.push(['ex','ใกล้เกินงบ',`หมวด “${c}” ใช้ไปแล้ว ${Math.round(u*100/l)}% เหลือ ${fmt(l-u)}`])});
 const d=spent('อาหาร','day')+spent('เดินทาง','day')+spent('การเรียน','day')+spent('อื่นๆ','day'),dl=CE.reduce((a,c)=>a+lim(c,'day'),0);
 if(S.alert&&d>dl)a.push(['ex','เกินงบรายวัน',`วันนี้ใช้ไป ${fmt(d)} เกินงบรายวัน ${fmt(dl)}`]);
 if(S.remind)S.goals.forEach(g=>{if(g.saved<g.target)a.push(['','ถึงเวลาออมเงิน',`ออมเข้าเป้าหมาย “${esc(g.name)}” ตามแผนวันนี้ ${fmt((g.target-g.saved)/(g.months*30))}`])});
 S.goals.forEach(g=>{const p=Math.floor(g.saved*100/g.target);if(p>=25)a.push(['in','ความคืบหน้าเป้าหมาย',`“${esc(g.name)}” ถึง ${p}% แล้ว`])});return a}
const V={
welcome:()=>`<div style="text-align:center;padding-top:40px;display:flex;flex-direction:column;gap:16px;align-items:center"><div style="width:88px;height:88px;border-radius:24px;background:var(--pr);color:#fff;font:600 44px Kanit;display:flex;align-items:center;justify-content:center">฿</div><h1>Student Budget Planner</h1><div class="m">รู้ว่าเงินไปไหน วางแผนให้พอตลอดเดือน และเก็บออมได้จริง</div><div class="c" style="text-align:left;width:100%;box-sizing:border-box">บันทึกรายรับ–รายจ่าย พร้อมหมวดหมู่<br>ตั้งงบรายวัน รายสัปดาห์ รายเดือน<br>ตั้งเป้าหมายและติดตามการออม</div></div><button class="b" data-a="go" data-v="login">เริ่มต้นใช้งาน</button>`,
login:()=>`<h1>${U.reg?'สมัครสมาชิก':'เข้าสู่ระบบ'}</h1><div class="ch">${ch([['0','เข้าสู่ระบบ'],['1','สมัครสมาชิก']],U.reg?'1':'0','reg')}</div>${I('em','อีเมล','email','student@email.com')}${I('pw','รหัสผ่าน (อย่างน้อย 8 ตัว)','password')}${U.err?`<div class="ex">${U.err}</div>`:''}<button class="b" data-a="login">${U.reg?'สมัครสมาชิก':'เข้าสู่ระบบ'}</button><div class="m">เดโม: ข้อมูลเก็บไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น</div>`,
dash:()=>{const mi=sum('income',x=>inP('month',x.date)),me=sum('expense',x=>inP('month',x.date)),n=alerts().filter(a=>a[0]==='ex').length;
 return`${U.toast?`<div class="tl warn">${U.toast}</div>`:''}<div class="m">${NOW.getDate()} ${MN[NOW.getMonth()]} ${NOW.getFullYear()+543}</div><div class="hero"><div>ยอดเงินคงเหลือ</div><div class="big">${fmt(sum('income')-sum('expense'))}</div></div><div class="r"><div class="c" style="flex:1"><div class="m">รายรับเดือนนี้</div><div class="in" style="font-size:20px">${fmt(mi)}</div></div><div class="c" style="flex:1"><div class="m">รายจ่ายเดือนนี้</div><div class="ex" style="font-size:20px">${fmt(me)}</div></div></div><button class="b" data-a="new">+ เพิ่มรายการ</button><div class="ch"><button class="g" data-a="go" data-v="savings">เป้าหมายออม</button><button class="g" data-a="go" data-v="notif">แจ้งเตือน${n?` (${n})`:''}</button><button class="g" data-a="go" data-v="coach">Coach</button></div><h2>รายการล่าสุด</h2><div class="c">${tl(S.tx.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,4))||'<div class="m">ยังไม่มีรายการ</div>'}</div>`},
add:()=>{const inc=U.type==='income',cs=inc?CI:CE;return`<button class="lk" data-a="go" data-v="${U.editId?'history':'dash'}">‹ กลับ</button><h1>${U.editId?'แก้ไขรายการ':inc?'เพิ่มรายรับ':'เพิ่มรายจ่าย'}</h1><div class="ch">${ch([['income','รายรับ'],['expense','รายจ่าย']],U.type,'type')}</div>${I('amt','จำนวนเงิน (บาท)','number','0')}<div class="m">หมวดหมู่</div><div class="ch">${ch(cs.map(c=>[c,c]),U.cat,'cat')}</div>${I('date','วันที่','date')}${I('note','หมายเหตุ','text','เช่น ข้าวกลางวัน')}<label class="g" style="display:flex;align-items:center;justify-content:center;min-height:48px;box-sizing:border-box">${U.rc?'แนบแล้ว: '+esc(U.rc):'แนบรูปใบเสร็จ'}<input type="file" accept="image/*" data-k="file" style="display:none"></label>${U.err?`<div class="ex">${U.err}</div>`:''}<button class="b" data-a="save">บันทึก${inc?'รายรับ':'รายจ่าย'}</button>`},
history:()=>{const l=S.tx.filter(x=>(U.f==='all'||x.type===U.f)&&(!U.q||(x.note+x.cat).includes(U.q))).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
 return`<h1>ประวัติรายการ</h1>${I('q','','search','ค้นหารายการ')}<div class="ch">${ch([['all','ทั้งหมด'],['income','รายรับ'],['expense','รายจ่าย']],U.f,'f')}</div><div class="c">${tl(l,1)||'<div class="m">ไม่พบรายการ</div>'}</div>`},
budget:()=>{const p=U.bp,t=CE.reduce((a,c)=>a+lim(c,p),0),u=CE.reduce((a,c)=>a+spent(c,p),0);
 return`<h1>วางแผนงบประมาณ</h1><div class="ch">${ch([['day','รายวัน'],['week','รายสัปดาห์'],['month','รายเดือน']],p,'bp')}</div><div class="c"><div class="m">งบรวม</div><div style="font:600 26px Kanit">${fmt(t)}</div><div class="m">ใช้ไปแล้ว ${fmt(u)} · เหลือ ${fmt(t-u)}</div></div>${CE.map(c=>bud(c,p)).join('')}<div class="c"><h2>ตั้งงบรายเดือน</h2>${CE.map(c=>`<label class="m">${c}<input class="i" type="number" data-b="${c}" value="${S.budgets[c]}"></label>`).join('')}<div class="m" style="margin-top:6px">งบรายวัน/สัปดาห์คำนวณจากงบรายเดือน แจ้งเตือนเมื่อใช้ถึง 80% และเมื่อเกินงบ</div></div>`},
analytics:()=>{const p=U.ap,ex=S.tx.filter(x=>x.type==='expense'&&inP(p,x.date)),te=ex.reduce((a,x)=>a+x.amt,0),ti=sum('income',x=>inP(p,x.date));
 const ms=[2,1,0].map(i=>{const d=new Date(NOW.getFullYear(),NOW.getMonth()-i,1),k=iso(d).slice(0,7);return[MN[d.getMonth()],sum('income',x=>x.date.slice(0,7)===k),sum('expense',x=>x.date.slice(0,7)===k)]}),mx=Math.max(1,...ms.flat().filter(x=>typeof x==='number'));
 const cs=CE.map(c=>[c,ex.filter(x=>x.cat===c).reduce((a,x)=>a+x.amt,0)]).sort((a,b)=>b[1]-a[1]),tb=CE.reduce((a,c)=>a+S.budgets[c],0),fr=NOW.getDate()/new Date(NOW.getFullYear(),NOW.getMonth()+1,0).getDate(),me=ms[2][2],pe=ms[1][2];
 return`<h1>วิเคราะห์การเงิน</h1><div class="ch">${ch([['day','วัน'],['week','สัปดาห์'],['month','เดือน'],['year','ปี']],p,'ap')}</div><div class="r"><div class="c" style="flex:1"><div class="m">รายรับ</div><div class="in" style="font-size:20px">${fmt(ti)}</div></div><div class="c" style="flex:1"><div class="m">รายจ่าย</div><div class="ex" style="font-size:20px">${fmt(te)}</div></div></div><div class="c"><h2>เปรียบเทียบรายเดือน</h2><div class="bars">${ms.map(m=>`<div><i style="height:${m[1]*100/mx}%;background:var(--ok)"></i><i style="height:${m[2]*100/mx}%;background:var(--er)"></i></div>`).join('')}</div><div class="r m" style="margin-top:6px">${ms.map(m=>`<span style="flex:1;text-align:center">${m[0]}</span>`).join('')}</div></div><div class="c"><h2>แยกตามหมวดหมู่</h2>${cs.map(c=>`<div class="r" style="margin-top:8px"><span>${c[0]}</span><span>${te?Math.round(c[1]*100/te):0}% · ${fmt(c[1])}</span></div>`).join('')}</div>${te?`<div class="tl">หมวดที่ใช้เงินมากที่สุด: <b>${cs[0][0]} ${fmt(cs[0][1])}</b></div>`:''}<div class="c"><h2>แนวโน้มการใช้เงิน</h2><div class="m">เดือนนี้ใช้ ${fmt(me)} (เดือนก่อน ${fmt(pe)}) · ผ่านไป ${Math.round(fr*100)}% ของเดือน ใช้ไป ${Math.round(me*100/tb)}% ของงบรวม ${me/tb>fr+.05?'เร็วกว่าแผน':'อยู่ในแผน'}</div></div>`},
savings:()=>`<button class="lk" data-a="go" data-v="dash">‹ กลับ</button><h1>เป้าหมายการออม</h1>${S.goals.map(g=>{const p=Math.min(100,Math.floor(g.saved*100/g.target)),rem=Math.max(0,g.target-g.saved);return`<div class="c"><div class="r"><h2>${esc(g.name)}</h2><span class="in">${p}%</span></div><div class="bar"><i style="width:${p}%;background:var(--ok)"></i></div><div class="r m" style="margin-top:8px"><span>ออมแล้ว ${fmt(g.saved)}</span><span>เป้าหมาย ${fmt(g.target)}</span></div>${rem?`<div class="m" style="margin-top:6px">ต้องออมอีก ${fmt(rem)} · ครบใน ${g.months} เดือน</div><div class="tl" style="margin-top:8px">แนะนำ: ออม ${fmt(rem/(g.months*30))} ต่อวัน หรือ ${fmt(rem/g.months)} ต่อเดือน</div>`:'<div class="in" style="margin-top:6px">ถึงเป้าหมายแล้ว</div>'}<div class="r" style="margin-top:10px"><input class="i" style="margin:0" type="number" placeholder="ยอดที่ออม" data-s="${g.id}"><button class="g" data-a="sv" data-v="${g.id}">ออม</button></div></div>`}).join('')}<div class="c"><h2>สร้างเป้าหมายใหม่</h2><div class="ch" style="margin-top:8px">${ch(GN.map(x=>[x,x]),U.gn,'gn')}</div>${I('gt','จำนวนเงินเป้าหมาย (บาท)','number')}${I('gm','ภายในกี่เดือน','number')}${U.err?`<div class="ex">${U.err}</div>`:''}<button class="b" style="margin-top:10px" data-a="addg">สร้างเป้าหมาย</button></div>`,
notif:()=>{const a=alerts();return`<button class="lk" data-a="go" data-v="dash">‹ กลับ</button><h1>การแจ้งเตือน</h1>${a.map(x=>`<div class="c ${x[0]==='ex'?'warn':''}"><b class="${x[0]}">${x[1]}</b><div>${x[2]}</div></div>`).join('')||'<div class="m">ไม่มีการแจ้งเตือน</div>'}`},
coach:()=>{const ex=S.tx.filter(x=>x.type==='expense'&&inP('month',x.date)),cs=CE.map(c=>[c,spent(c,'month')]).sort((a,b)=>b[1]-a[1]),near=CE.filter(c=>spent(c,'month')>=S.budgets[c]*.8),left=sum('income',x=>inP('month',x.date))-ex.reduce((a,x)=>a+x.amt,0);
 let st=0;for(let i=0;i<60;i++){const d=iso(new Date(Date.now()-i*864e5));if(S.tx.some(x=>x.date===d))st++;else if(i>0)break;else break}
 return`<button class="lk" data-a="go" data-v="dash">‹ กลับ</button><h1>Smart Budget Coach</h1><div class="tl">เดือนนี้คุณใช้จ่ายสูงสุดที่หมวด ${cs[0][0]} (${fmt(cs[0][1])})</div>${near.map(c=>`<div class="c"><h2>ระวังหมวด ${c}</h2><div class="m">ใช้ไป ${fmt(spent(c,'month'))} จากงบ ${fmt(S.budgets[c])} ลองลดรายการเล็กๆ ที่ไม่จำเป็น เช่น ขนมหรือเครื่องดื่ม</div></div>`).join('')}<div class="c"><h2>แบ่งเงินออม</h2><div class="m">${left>0?`เดือนนี้เหลือ ${fmt(left)} ลองแบ่ง ${fmt(left*.2)} เข้าเป้าหมายการออม`:'เดือนนี้ใช้จ่ายเกินรายรับ ลองปรับงบแต่ละหมวด'}</div></div><div class="c"><h2>ภารกิจบันทึกต่อเนื่อง</h2><div class="m">บันทึกต่อเนื่อง ${st} วัน · XP ${st*20+S.tx.length*5}</div><div class="bar"><i style="width:${Math.min(100,st*20)}%"></i></div></div>`},
profile:()=>`<h1>โปรไฟล์และตั้งค่า</h1><div class="c"><b>${esc(S.user||'')}</b><div class="m">นักศึกษา</div></div><div class="c"><label class="r"><span>แจ้งเตือนใกล้เกิน/เกินงบ</span><input type="checkbox" data-t="alert" ${S.alert?'checked':''}></label><hr><label class="r"><span>เตือนให้ออมตามแผน</span><input type="checkbox" data-t="remind" ${S.remind?'checked':''}></label></div><button class="g" data-a="reset">รีเซ็ตข้อมูลตัวอย่าง</button><button class="g" style="color:var(--er)" data-a="out">ออกจากระบบ</button><div class="m">ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น ไม่ได้อัปโหลดไปที่ใด</div>`
};
function tl(l,ed){return l.map(x=>row(esc(x.note||x.cat),`${x.cat} · ${x.date}${x.rc?' · มีใบเสร็จ':''}${ed?` · <button class="lk" style="padding:0" data-a="edit" data-v="${x.id}">แก้ไข</button> <button class="lk" style="padding:0;color:var(--er)" data-a="del" data-v="${x.id}">ลบ</button>`:''}`,(x.type==='income'?'+':'−')+fmt(x.amt),x.type==='income'?'in':'ex')).join('<hr>')}
const TABS=[['dash','หน้าหลัก'],['history','รายการ'],['budget','งบประมาณ'],['analytics','วิเคราะห์'],['profile','โปรไฟล์']];
function render(){const s=U.s,nv=TABS.some(t=>t[0]===s);U.toast&&(U._t=U.toast);
 $('#app').innerHTML=`<main>${V[s]()}</main>${nv?`<nav>${TABS.map(t=>`<button class="${t[0]===s?'on':''}" data-a="go" data-v="${t[0]}">${t[1]}</button>`).join('')}</nav>`:''}`;U.toast='';
 if(U._f){const e=document.querySelector(`[data-k="${U._f}"]`);if(e){e.focus();try{e.setSelectionRange(99,99)}catch(x){}}U._f=''}}
const $=s=>document.querySelector(s);
const go=s=>{U.s=s;U.err='';scrollTo(0,0);render()};
const A={go,
reg:v=>{U.reg=v==='1';render()},
login:()=>{if(!(U.em||'').includes('@'))U.err='กรุณากรอกอีเมลให้ถูกต้อง';else if((U.pw||'').length<8)U.err='รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';else{S.user=U.em;save();U.pw='';return go('dash')}render()},
new:()=>{Object.assign(U,{type:'expense',cat:'อาหาร',amt:'',note:'',date:TD,rc:'',editId:0});go('add')},
type:v=>{U.type=v;U.cat=v==='income'?CI[0]:CE[0];render()},cat:v=>{U.cat=v;render()},
save:()=>{const a=parseFloat(U.amt);if(!(a>0)){U.err='กรุณากรอกจำนวนเงินมากกว่า 0';return render()}
 const o={type:U.type,amt:a,cat:U.cat,note:U.note||'',date:U.date||TD,rc:U.rc||''};
 if(U.editId){Object.assign(S.tx.find(x=>x.id===U.editId),o)}else S.tx.push({id:++S.nid,...o});
 save();if(o.type==='expense'){const u=spent(o.cat,'month'),l=S.budgets[o.cat];if(u>l)U.toast=`หมวด “${o.cat}” เกินงบแล้ว ${fmt(u-l)}`;else if(u>=l*.8)U.toast=`หมวด “${o.cat}” ใช้ไปแล้ว ${Math.round(u*100/l)}% ของงบ`}
 go('dash')},
f:v=>{U.f=v;render()},
edit:v=>{const x=S.tx.find(t=>t.id==v);Object.assign(U,{type:x.type,cat:x.cat,amt:x.amt,note:x.note,date:x.date,rc:x.rc,editId:x.id});go('add')},
del:v=>{if(confirm('ลบรายการนี้?')){S.tx=S.tx.filter(x=>x.id!=v);save();render()}},
bp:v=>{U.bp=v;render()},ap:v=>{U.ap=v;render()},gn:v=>{U.gn=v;render()},
sv:v=>{const e=document.querySelector(`[data-s="${v}"]`),a=parseFloat(e.value);if(a>0){S.goals.find(g=>g.id==v).saved+=a;save();render()}},
addg:()=>{const t=parseFloat(U.gt),m=parseInt(U.gm);if(!U.gn||!(t>0)||!(m>0)){U.err='เลือกประเภท และกรอกจำนวนเงินกับจำนวนเดือน';return render()}
 S.goals.push({id:++S.nid,name:U.gn,target:t,saved:0,months:m});U.gn='';U.gt='';U.gm='';U.err='';save();render()},
reset:()=>{if(confirm('รีเซ็ตเป็นข้อมูลตัวอย่าง?')){const u=S.user;S=seed();S.user=u;save();render()}},
out:()=>{S.user=null;save();go('welcome')}};
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t&&A[t.dataset.a])A[t.dataset.a](t.dataset.v)});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.k&&t.type!=='file'){U[t.dataset.k]=t.value;if(t.dataset.k==='q'){U._f='q';render()}}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.k==='file'&&t.files[0]){U.rc=t.files[0].name;render()}
 if(t.dataset.b){S.budgets[t.dataset.b]=Math.max(0,parseFloat(t.value)||0);save();render()}
 if(t.dataset.t){S[t.dataset.t]=t.checked;save()}});
render();

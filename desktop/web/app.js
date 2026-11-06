(()=>{'use strict';
const Native=window.Native||null,phone=!!Native;
// on the phone the page's origin follows the laptop's IP, so settings live in the app, not in localStorage
const store={get(k,d){try{const v=phone?Native.getValue(k):localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{const s=JSON.stringify(v);if(phone)Native.setValue(k,s);else localStorage.setItem(k,s)}catch{}}};
const LANG=store.get('lang','fa'),LOC=LANG==='fa'?'fa-IR':'en-US';
document.documentElement.lang=LANG;document.documentElement.dir=LANG==='fa'?'rtl':'ltr';
const EN={
 "بایت": "Bytes",
 "کیلوبایت": "KB",
 "مگابایت": "MB",
 "گیگابایت": "GB",
 "کپی شد": "Copied",
 "کپی نشد": "Could not copy",
 "؟": "?",
 " مگابایت/ثانیه": " MB/s",
 "انصراف": "Cancel",
 "هنوز انتخاب نشده": "Not chosen yet",
 "انتخاب پوشه": "Choose folder",
 "پوشه‌ی فایل‌های این گفتگو": "Folder for this chat's files",
 "پوشه انتخاب نشد": "Folder not chosen",
 "گفتگوی جدید": "New chat",
 "مثلاً کارهای دانشگاه": "e.g. University work",
 "ساختن": "Create",
 "نام گفتگو": "Chat name",
 "پوشه‌ی ذخیره‌ی فایل‌ها روی این گوشی": "Folder for files on this phone",
 "پوشه‌ی ذخیره‌ی فایل‌ها روی این کامپیوتر": "Folder for files on this computer",
 "این پوشه قابل استفاده نیست": "This folder can't be used",
 "گفتگو ساخته نشد": "Chat not created",
 "اطلاعات گفتگو": "Chat info",
 "پوشه‌ی فایل‌ها روی این گوشی": "Files folder on this phone",
 "فایل‌ها روی کامپیوتر هم در این مسیر ذخیره می‌شوند:": "Files are also saved on the computer here:",
 "پوشه‌ی فایل‌ها روی این کامپیوتر": "Files folder on this computer",
 "فایل‌های قبلی همان‌جا می‌مانند و فقط فایل‌های تازه به پوشه‌ی جدید می‌روند.": "Old files stay where they are; only new files go to the new folder.",
 "دریافت خودکار فایل‌ها روی گوشی": "Receive files on the phone automatically",
 "ذخیره": "Save",
 "ذخیره نشد": "Not saved",
 "حذف گفتگو": "Delete chat",
 "گفتگوی «{0}» و همه‌ی پیام‌هایش حذف می‌شود.": "Chat “{0}” and all its messages will be deleted.",
 "حذف": "Delete",
 "فایل‌های این گفتگو هم از هر دو دستگاه پاک شوند": "Also delete this chat's files from both devices",
 "حذف نشد": "Not deleted",
 "پاک کردن تاریخچه": "Clear history",
 "همه‌ی پیام‌های این گفتگو پاک می‌شود، ولی خود گفتگو می‌ماند.": "All messages in this chat will be cleared, but the chat stays.",
 "پاک کردن": "Clear",
 "فایل‌ها هم از هر دو دستگاه پاک شوند": "Also delete the files from both devices",
 "پاک نشد": "Not cleared",
 "باز نشد": "Could not open",
 "اتصال گوشی": "Connect phone",
 "گوشی را روشن کنید، هات‌اسپات را بزنید و این کامپیوتر را به آن وصل کنید. بعد این کد را در اپ گوشی وارد کنید.": "Turn on your phone's hotspot and connect this computer to it. Then enter this code in the phone app.",
 "اعتبار کد: {0}": "Code valid for: {0}",
 " — متصل": " — online",
 "این گوشی دیگر دسترسی ندارد": "This phone no longer has access",
 "اجازه در فایروال ویندوز": "Allow in Windows Firewall",
 "پنجره‌ی تأیید ویندوز را قبول کنید": "Accept the Windows prompt",
 "انجام نشد": "Failed",
 "بستن": "Close",
 "حذف پیوست": "Remove attachment",
 "ارسال نشد؛ پیام به کادر نوشتن برگشت": "Not sent; your message is back in the box",
 "٪": "%",
 "فایل در دسترس نیست": "File not available",
 "این فایل دیگر روی کامپیوتر نیست": "This file is no longer on the computer",
 "فایل باز نشد": "Could not open the file",
 "فایل پیدا نشد": "File not found",
 "در صف": "Queued",
 "گفتگوی خالی": "Empty chat",
 "چیزی پیدا نشد": "Nothing found",
 "هنوز گفتگویی نیست. با دکمه‌ی + اولین گفتگو را بسازید.": "No chats yet. Create your first one with the + button.",
 "پیام‌ها": "Messages",
 "اطلاعات و پوشه": "Info and folder",
 "برداشتن سنجاق": "Unpin",
 "سنجاق کردن": "Pin",
 "باز کردن پوشه": "Open folder",
 "پوشه باز نشد": "Could not open the folder",
 "قطع جفت‌شدن با کامپیوتر": "Unpair from computer",
 "قطع اتصال": "Disconnect",
 "برای اتصال دوباره باید کد تازه وارد کنید.": "You will need a new code to connect again.",
 "تم: خودکار": "Theme: Auto",
 "تم: روشن": "Theme: Day",
 "تم: تیره": "Theme: Night",
 "کپی متن": "Copy text",
 "باز کردن با برنامه‌ی دیگر": "Open with another app",
 "نمایش در پوشه": "Show in folder",
 "حذف پیام": "Delete message",
 "این پیام از هر دو دستگاه حذف می‌شود.": "This message will be deleted from both devices.",
 "فایل هم از هر دو دستگاه پاک شود": "Also delete the file from both devices",
 "در حال اتصال…": "Connecting…",
 "متصل به ": "Connected to ",
 " متصل است": " is online",
 "گوشی متصل نیست": "Phone not connected",
 "، ": ", ",
 "برای دریافت فایل‌ها، پوشه‌ی این گفتگو را روی گوشی انتخاب کنید": "Choose this chat's folder on the phone to receive files",
 "این گفتگو در گوشی ساخته شده. پوشه‌ی ذخیره‌ی فایل‌ها را روی کامپیوتر انتخاب کنید": "This chat was created on the phone. Choose where to save its files on the computer",
 "پیام‌ها بارگذاری نشد": "Could not load messages",
 "{0} وصل شد": "{0} connected",
 "گفتگوی مقصد را انتخاب کنید": "Choose a chat to send to",
 "دانلود ناموفق بود": "Download failed",
 "هنوز پیامی نیست. پیام بنویسید یا فایل بفرستید.": "No messages yet. Write something or send a file.",
 "فایل را اینجا رها کنید": "Drop files here",
 "اتصال برقرار نشد": "Connection failed",
 "رفتن به آخرین پیام": "Go to latest message",
 "فایل‌هات رو شلیک کن. اینترنت لازم نیست.": "Fire your files. No internet needed.",
 "پیام": "Message",
 "نمایش فایل": "Show file",
 "جستجو در گفتگوها و پیام‌ها": "Search chats and messages",
 "جستجو": "Search",
 "گزینه‌ها": "Options",
 "یک گفتگو را انتخاب کنید": "Pick a chat",
 "افزودن فایل": "Add file",
 "بازگشت": "Back",
 "منو": "Menu",
 "ارسال": "Send"
};
const tr=(s,...a)=>{let x=LANG==='en'?(EN[s]??s):s;a.forEach((v,i)=>{x=x.replace('{'+i+'}',v)});return x};
const $=s=>document.querySelector(s);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const fa=n=>n.toLocaleString(LOC);
const fmt=n=>{const u=[tr('بایت'),tr('کیلوبایت'),tr('مگابایت'),tr('گیگابایت')];let i=0;while(n>=1024&&i<3){n/=1024;i++}return fa(+n.toFixed(i?1:0))+' '+u[i]};
const hm=ts=>new Date(ts*1000).toLocaleTimeString(LOC,{hour:'2-digit',minute:'2-digit'});
const tfmt=ts=>{const d=new Date(ts*1000);return d.toDateString()===new Date().toDateString()?hm(ts):d.toLocaleDateString(LOC,{month:'short',day:'numeric'})};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const RING='<svg viewBox="0 0 56 56"><circle class="pg" cx="28" cy="28" r="22"/><path class="dl-i" d="M28 18v15M21 27l7 7 7-7"/><path class="x-i" d="M21 21l14 14M35 21L21 35"/></svg>';
const X14='<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const PIN='<svg viewBox="0 0 24 24"><path d="M9 4h6l-1 6 4 4H6l4-4zM12 14v6"/></svg>';
const TICK1='<svg class="tick" viewBox="0 0 24 24"><path d="M5 13l4 4 10-11"/></svg>';
const TICK2='<svg class="tick" viewBox="0 0 24 24"><path d="M2 13l4 4 9-10M10 16l1 1 10-11"/></svg>';
const COLORS=[['#ff885e','#ff516a'],['#ffcd6a','#ffa85c'],['#82b1ff','#665fff'],['#a0de7e','#54cb68'],['#53edd6','#28c9b7'],['#72d5fd','#2a9ef1'],['#e0a2f3','#d669ed']];

const app=$('#app'),msgs=$('#msgs'),ta=$('#ta'),tray=$('#tray'),chatlist=$('#chatlist'),pm=$('#pm'),dlg=$('#dlg'),lb=$('#lb'),lbbody=$('#lbbody');

// ── state
let me={id:'',name:''},host='',online=[],linkUp=true;
let chats=new Map(),cur=null,shown=[],ids=new Set(),hasMore=false,loading=false;
let draft=[],query='',hits=null;
const FILES=new Map(),busy=new Map(),pend=new Map(),speeds=new Map();
let unread=store.get('unread',{});
const saveUnread=()=>store.set('unread',unread);

// ── theme
function applyTheme(){const t=store.get('theme','auto'),dark=t==='dark'||(t==='auto'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';if(phone)Native.theme(dark)}
applyTheme();matchMedia('(prefers-color-scheme:dark)').addEventListener('change',applyTheme);

async function api(method,url,body){
  const r=await fetch(url,{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});
  if(!r.ok){const e=new Error(r.status);e.status=r.status;throw e}
  return r.json();
}
let toastT;function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>e.hidden=true,3200)}
function copyText(t){const x=el('textarea');x.value=t;x.style.cssText='position:fixed;opacity:0';document.body.append(x);x.select();try{document.execCommand('copy');toast(tr('کپی شد'))}catch{toast(tr('کپی نشد'))}x.remove()}
const avatar=(e,c)=>{let h=0;for(const ch of c.id)h=(h*31+ch.charCodeAt(0))>>>0;const[a,b]=COLORS[h%COLORS.length];e.style.background=`linear-gradient(160deg,${a},${b})`;e.textContent=[...c.name][0]||tr('؟')};
const extOf=n=>(n.includes('.')?n.split('.').pop():'FILE').slice(0,4).toUpperCase();

// speed readout for a running transfer
function meter(){let t0=performance.now(),b0=0,txt='';return bytes=>{const t=performance.now(),dt=t-t0;if(dt>=700){txt=fa(+(((bytes-b0)/1048576)/(dt/1000)).toFixed(1))+tr(' مگابایت/ثانیه');t0=t;b0=bytes}return txt}}

// ── dialogs
function closeDlg(){dlg.hidden=true;dlg.textContent=''}
function openDlg(title){dlg.textContent='';const c=el('div','card-d');c.setAttribute('role','dialog');c.setAttribute('aria-modal','true');c.setAttribute('aria-label',title);c.append(el('h3','',title));dlg.append(c);dlg.hidden=false;return c}
dlg.addEventListener('mousedown',e=>{if(e.target===dlg)closeDlg()});
function button(text,cls,fn){const b=el('button','btn '+(cls||''),text);b.type='button';b.onclick=fn;return b}
function confirmBox(title,text,okText,checkText){return new Promise(res=>{
  const c=openDlg(title);if(text)c.append(el('p','',text));let box;
  if(checkText){const l=el('label','chk');box=el('input');box.type='checkbox';l.append(box,el('span','',checkText));c.append(l)}
  const a=el('div','acts');a.append(button(tr('انصراف'),'',()=>{closeDlg();res(null)}),button(okText,'danger',()=>{const v={files:!!(box&&box.checked)};closeDlg();res(v)}));c.append(a);
})}
function field(label,node){const l=el('label','fld');l.append(el('span','',label),node);return l}
function textInput(value,ph){const i=el('input','in');i.value=value||'';i.placeholder=ph||'';i.dir='auto';return i}

// folder row: a real path on the laptop, a system folder picker on the phone
function folderField(key,value,onchange){
  const row=el('div','pick');
  if(phone){
    const i=el('input','in');i.readOnly=true;i.value=value||'';i.placeholder=tr('هنوز انتخاب نشده');i.dir='auto';
    folderWaiters.set(key,label=>{i.value=label;onchange(label)});
    row.append(i,button(tr('انتخاب پوشه'),'line',()=>Native.pickFolder(key)));
    return{row,get:()=>i.value};
  }
  const i=el('input','in');i.value=value||'';i.placeholder='C:\\Users\\…';i.oninput=()=>onchange(i.value);
  row.append(i,button(tr('انتخاب پوشه'),'line',async()=>{try{const r=await api('POST','/api/local/pick-folder',{start:i.value,title:tr('پوشه‌ی فایل‌های این گفتگو')});if(r.path){i.value=r.path;onchange(r.path)}}catch{toast(tr('پوشه انتخاب نشد'))}}));
  return{row,get:()=>i.value.trim()};
}
const folderWaiters=new Map();

function newChatDialog(){
  const c=openDlg(tr('گفتگوی جدید'));
  const name=textInput('',tr('مثلاً کارهای دانشگاه'));
  const ok=button(tr('ساختن'),'solid',create);ok.disabled=true;
  const check=()=>ok.disabled=!(name.value.trim()&&f.get());
  if(phone)Native.clearFolder('new');
  const f=folderField('new','',check);name.oninput=check;
  c.append(field(tr('نام گفتگو'),name),field(phone?tr('پوشه‌ی ذخیره‌ی فایل‌ها روی این گوشی'):tr('پوشه‌ی ذخیره‌ی فایل‌ها روی این کامپیوتر'),f.row));
  const a=el('div','acts');a.append(button(tr('انصراف'),'',closeDlg),ok);c.append(a);name.focus();
  name.onkeydown=e=>{if(e.key==='Enter'&&!ok.disabled)create()};
  async function create(){
    ok.disabled=true;
    try{const r=await api('POST','/api/chats',phone?{name:name.value}:{name:name.value,folder:f.get()});
      if(phone)Native.moveFolder('new',r.id);chats.set(r.id,r);closeDlg();location.hash=r.id;
    }catch(e){ok.disabled=false;toast(e.status===400?tr('این پوشه قابل استفاده نیست'):tr('گفتگو ساخته نشد'))}
  }
}
function infoDialog(id){
  const ch=chats.get(id);if(!ch)return;
  const c=openDlg(tr('اطلاعات گفتگو')),name=textInput(ch.name);c.append(field(tr('نام گفتگو'),name));
  let folderGet=()=>'';
  if(phone){const f=folderField(id,Native.folderLabel(id),()=>{renderNotice()});c.append(field(tr('پوشه‌ی فایل‌ها روی این گوشی'),f.row));c.append(el('p','',tr('فایل‌ها روی کامپیوتر هم در این مسیر ذخیره می‌شوند:')));const pl=el('p','pathline',ch.folder);c.append(pl)}
  else{const f=folderField(id,ch.folder,()=>{});folderGet=f.get;c.append(field(tr('پوشه‌ی فایل‌ها روی این کامپیوتر'),f.row));c.append(el('p','',tr('فایل‌های قبلی همان‌جا می‌مانند و فقط فایل‌های تازه به پوشه‌ی جدید می‌روند.')))}
  const l=el('label','chk'),auto=el('input');auto.type='checkbox';auto.checked=ch.auto;l.append(auto,el('span','',tr('دریافت خودکار فایل‌ها روی گوشی')));c.append(l);
  const a=el('div','acts');a.append(button(tr('انصراف'),'',closeDlg),button(tr('ذخیره'),'solid',async()=>{
    const b={name:name.value,auto:auto.checked};const nf=folderGet();if(nf&&nf!==ch.folder)b.folder=nf;
    try{await api('PATCH','/api/chats/'+id,b);closeDlg()}catch(e){toast(e.status===400?tr('این پوشه قابل استفاده نیست'):tr('ذخیره نشد'))}
  }));c.append(a);
}
async function deleteChat(id){
  const ch=chats.get(id),r=await confirmBox(tr('حذف گفتگو'),tr('گفتگوی «{0}» و همه‌ی پیام‌هایش حذف می‌شود.',ch.name),tr('حذف'),tr('فایل‌های این گفتگو هم از هر دو دستگاه پاک شوند'));
  if(r)try{await api('DELETE',`/api/chats/${id}?files=${r.files?1:0}`)}catch{toast(tr('حذف نشد'))}
}
async function clearChat(id){
  const r=await confirmBox(tr('پاک کردن تاریخچه'),tr('همه‌ی پیام‌های این گفتگو پاک می‌شود، ولی خود گفتگو می‌ماند.'),tr('پاک کردن'),tr('فایل‌ها هم از هر دو دستگاه پاک شوند'));
  if(r)try{await api('POST',`/api/chats/${id}/clear?files=${r.files?1:0}`)}catch{toast(tr('پاک نشد'))}
}
async function pairDialog(){
  let d;try{d=await api('GET','/api/local/pair')}catch{return toast(tr('باز نشد'))}
  const c=openDlg(tr('اتصال گوشی'));
  c.append(el('p','',tr('گوشی را روشن کنید، هات‌اسپات را بزنید و این کامپیوتر را به آن وصل کنید. بعد این کد را در اپ گوشی وارد کنید.')));
  c.append(el('div','code',d.code.slice(0,4)+' '+d.code.slice(4)));
  const left=el('div','tiny');c.append(left);
  const tick=()=>{const s=Math.max(0,Math.round(d.until-Date.now()/1000));left.textContent=tr('اعتبار کد: {0}',fa(Math.floor(s/60))+':'+fa(s%60).padStart(2,fa(0)));if(s<=0||dlg.hidden){clearInterval(t);if(s<=0&&!dlg.hidden)pairDialog()}};
  const t=setInterval(tick,1000);tick();
  if(d.ips.length)c.append(el('div','ipline',d.ips.map(i=>`${i}:${d.port}`).join('   ')));
  for(const v of d.devices){const r=el('div','dev'),n=el('span','',v.name+(d.online.includes(v.name)?tr(' — متصل'):''));r.append(n,button(tr('حذف'),'danger',async()=>{await api('DELETE','/api/local/devices/'+v.id);r.remove();toast(tr('این گوشی دیگر دسترسی ندارد'))}));c.append(r)}
  const a=el('div','acts');
  a.append(button(tr('اجازه در فایروال ویندوز'),'',async()=>{try{await api('POST','/api/local/firewall');toast(tr('پنجره‌ی تأیید ویندوز را قبول کنید'))}catch{toast(tr('انجام نشد'))}}),button(tr('بستن'),'solid',closeDlg));c.append(a);
}

// ── popup menu
function pop(x,y,items){
  pm.textContent='';for(const[t,fn,bad]of items){const b=el('button',bad?'danger':'',t);b.onclick=()=>{pm.hidden=true;fn()};pm.append(b)}
  pm.hidden=false;pm.style.top=Math.max(8,Math.min(innerHeight-pm.offsetHeight-8,y))+'px';pm.style.left=Math.max(8,Math.min(innerWidth-pm.offsetWidth-8,x))+'px';
}
const popAt=(a,items)=>{const r=a.getBoundingClientRect();pop(r.left,r.bottom+4,items)};
document.addEventListener('mousedown',e=>{if(!pm.hidden&&!e.target.closest('#pm'))pm.hidden=true},true);
function longPress(root,fn){
  let t,sx,sy;
  root.addEventListener('touchstart',e=>{const p=e.touches[0];sx=p.clientX;sy=p.clientY;const tg=e.target;t=setTimeout(()=>{t=0;fn(tg,sx,sy)},450)},{passive:true});
  const stop=()=>{clearTimeout(t)};root.addEventListener('touchend',stop);root.addEventListener('touchcancel',stop);
  root.addEventListener('touchmove',e=>{const p=e.touches[0];if(Math.hypot(p.clientX-sx,p.clientY-sy)>10)stop()},{passive:true});
  root.addEventListener('contextmenu',e=>{e.preventDefault();if(!e.sourceCapabilities||!e.sourceCapabilities.firesTouchEvents)fn(e.target,e.clientX,e.clientY)});
}

// ── composer drafts: text is remembered per chat
const autosize=()=>{ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,170)+'px'};
const updateSend=()=>$('#send').disabled=!(ta.value.trim()||draft.length);
const keepText=()=>{if(cur)store.set('draft:'+cur,ta.value)};
function renderTray(){
  tray.textContent='';tray.hidden=!draft.length;
  draft.forEach((f,i)=>{
    const pic=f.file&&/^image\/(png|jpe?g|gif|webp|avif|bmp)$/.test(f.type),c=el('div','tchip'+(pic?' pic':''));
    if(pic){const im=new Image();im.src=f.url||(f.url=URL.createObjectURL(f.file));im.alt='';c.append(im)}
    else{c.append(extOf(f.name));const s=el('small','',f.name);s.dir='auto';c.append(s)}
    const x=el('button','x');x.innerHTML=X14;x.setAttribute('aria-label',tr('حذف پیوست'));
    x.onclick=()=>{draft.splice(i,1);renderTray();updateSend()};c.append(x);tray.append(c);
  });updateSend();
}
function addFiles(list){if(!cur)return;for(const f of list)draft.push({file:f,name:f.name||'file',size:f.size,type:f.type});renderTray();ta.focus({preventScroll:true})}

// ── thumbnails are made by the sender, so the other side shows ~20 KB until the real file arrives
const once=(t,ev,ms)=>new Promise((ok,no)=>{const to=setTimeout(()=>no(new Error('t')),ms);t.addEventListener(ev,()=>{clearTimeout(to);ok()},{once:true});t.addEventListener('error',()=>{clearTimeout(to);no(new Error('e'))},{once:true})});
async function thumb(file){
  try{
    let src,w,h,done=()=>{};
    if(/^image\/(?!svg)/.test(file.type)){src=await createImageBitmap(file);w=src.width;h=src.height;done=()=>src.close()}
    else if(file.type.startsWith('video/')){
      const v=el('video');v.muted=true;v.playsInline=true;v.preload='auto';const u=URL.createObjectURL(file);v.src=u;done=()=>URL.revokeObjectURL(u);
      await once(v,'loadeddata',6000);v.currentTime=Math.min(1,(v.duration||2)/4);await once(v,'seeked',4000);src=v;w=v.videoWidth;h=v.videoHeight;
    }else return null;
    if(!w||!h)return null;
    const k=Math.min(1,512/Math.max(w,h)),c=el('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));
    const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(src,0,0,c.width,c.height);done();
    const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.72));return blob?{blob,w,h}:null;
  }catch{return null}
}

// ── sending: raw bytes, no base64 or compression; a dropped connection resumes where it stopped
const put=(url,body,onp)=>new Promise((ok,no)=>{const x=new XMLHttpRequest();x.open('PUT',url);x.upload.onprogress=e=>onp&&onp(e.loaded);x.onload=()=>x.status===200?ok():no(new Error(x.status));x.onerror=()=>no(new Error('net'));x.send(body)});
async function pool(items,n,fn){const out=[];let i=0;await Promise.all(Array.from({length:Math.min(n,items.length)},async()=>{while(i<items.length){const k=i++;out[k]=await fn(items[k],k)}}));return out}
async function uploadWeb(chat,it,onp){
  const f=it.file,th=await thumb(f);
  const{id}=await api('POST','/api/files',{chat,name:it.name,size:f.size,mime:f.type,w:th?th.w:0,h:th?th.h:0});
  let off=0;
  for(let tries=0;;tries++){
    try{await put(`/api/files/${id}/data?offset=${off}`,f.slice(off),l=>onp(off+l));break}
    catch(e){if(tries>=4)throw e;await sleep(900);off=(await api('GET',`/api/files/${id}/status`)).received}
  }
  if(th)await put(`/api/files/${id}/thumb`,th.blob).catch(()=>{});
  await api('POST',`/api/files/${id}/done`);return id;
}
const nativeUps=new Map();
const uploadNative=(chat,it,onp)=>new Promise((ok,no)=>{nativeUps.set(it.key,{ok,no,onp});Native.upload(it.key,chat)});
async function send(){
  const id=cur;if(!id)return;const text=ta.value.trim(),items=draft.slice();if(!text&&!items.length)return;
  ta.value='';draft=[];renderTray();autosize();updateSend();keepText();
  const p=items.length?pendingEl(text,items):null;if(p)addPend(id,p.el);
  try{
    const done=await pool(items,3,(it,i)=>{const m=meter();return(phone?uploadNative:uploadWeb)(id,it,b=>p.prog(i,b,it.size,m(b)))});
    const r=await api('POST',`/api/chats/${id}/messages`,{text,files:done});
    if(p)delPend(id,p.el);onMsg(id,r.msg,r.sum);
  }catch{
    if(p)delPend(id,p.el);toast(tr('ارسال نشد؛ پیام به کادر نوشتن برگشت'));
    if(cur===id){ta.value=text+(ta.value?'\n'+ta.value:'');draft=items.concat(draft);renderTray();autosize();updateSend()}
  }
}

// ── file bubbles
const localOf=f=>!phone||Native.has(f.id);
function fileState(f){if(busy.has(f.id))return'busy';if(f.gone&&!(phone&&Native.has(f.id)))return'gone';return localOf(f)?'done':'idle'}
function syncFile(e){
  const f=FILES.get(e.dataset.fid),s=fileState(f),p=busy.get(f.id)||0;e.dataset.s=s;
  const pg=e.querySelector('.pg');if(pg)pg.style.strokeDashoffset=138.2*(1-(s==='busy'?p:0));
  const st=e.querySelector('.st');
  if(st)st.textContent=s==='busy'?fa(Math.round(p*100))+tr('٪')+(speeds.get(f.id)?' — '+speeds.get(f.id):''):s==='gone'?tr('فایل در دسترس نیست'):fmt(f.size);
}
const refresh=fid=>document.querySelectorAll(`[data-fid="${fid}"]`).forEach(syncFile);
function fileEl(f){
  FILES.set(f.id,f);
  const media=(f.kind==='image'||f.kind==='video')&&f.thumb,e=el('div','file '+(media?'media':'card'));e.dataset.fid=f.id;
  const dl=el('div','dl');dl.innerHTML=RING;
  if(media){e.dataset.k=f.kind;e.style.aspectRatio=f.w&&f.h?`${f.w}/${f.h}`:'4/3';
    const im=new Image();im.src=`/api/files/${f.id}/thumb`;im.alt=f.name;im.decoding='async';im.loading='lazy';e.append(im,el('span','sz',fmt(f.size)),dl)}
  else{const ic=el('div','ic',extOf(f.name));ic.append(dl);const i=el('div','info'),n=el('span','nm',f.name);n.dir='auto';i.append(n,el('span','st',fmt(f.size)));e.append(ic,i)}
  syncFile(e);return e;
}
function startDownload(f,chat){
  if(!phone||busy.has(f.id)||Native.has(f.id))return;
  if(!Native.folderLabel(chat)){renderNotice();Native.pickFolder(chat);return}
  busy.set(f.id,0);meters.set(f.id,meter());refresh(f.id);Native.download(f.id,chat,f.name,f.mime,String(f.size));
}
const meters=new Map();
function tapFile(fid){
  const f=FILES.get(fid),s=fileState(f);
  if(s==='gone')return toast(tr('این فایل دیگر روی کامپیوتر نیست'));
  if(s==='busy')return Native&&Native.cancel(fid);
  if(s==='idle')return startDownload(f,cur);
  if(f.kind==='image'||f.kind==='video'||f.kind==='audio')return openLB(f);
  openLocal(f);
}
function openLocal(f){if(phone)Native.open(f.id);else api('POST','/api/local/open/'+f.id).catch(()=>toast(tr('فایل باز نشد')))}
function showFile(f){if(phone)Native.open(f.id);else api('POST','/api/local/reveal/'+f.id).catch(()=>toast(tr('فایل پیدا نشد')))}

function openLB(f){
  lbbody.textContent='';let m;
  if(f.kind==='image'){m=new Image();m.alt=f.name}else{m=el(f.kind==='audio'?'audio':'video');m.controls=true;m.autoplay=true;m.playsInline=true}
  m.src='/api/files/'+f.id;lbbody.append(m);$('#lbname').textContent=f.name;lb.dataset.fid=f.id;lb.hidden=false;
}
const closeLB=()=>{lb.hidden=true;lbbody.textContent=''};
$('#lbclose').onclick=closeLB;$('#lbsave').onclick=()=>showFile(FILES.get(lb.dataset.fid));
lbbody.onclick=e=>{if(e.target===lbbody)closeLB()};
addEventListener('keydown',e=>{if(e.key==='Escape'){if(!lb.hidden)closeLB();else if(!dlg.hidden)closeDlg();pm.hidden=true}});

// ── messages
function linkify(n,t){t.split(/(https?:\/\/[^\s<>"']+)/g).forEach((s,i)=>{if(i%2){const a=el('a','',s);a.href=s;a.target='_blank';a.rel='noopener noreferrer';n.append(a)}else if(s)n.append(s)})}
const dayKey=ts=>new Date(ts*1000).toDateString();
const sepEl=ts=>el('div','sep',new Date(ts*1000).toLocaleDateString(LOC,{weekday:'long',day:'numeric',month:'long'}));
function tickHtml(m){return m.files.length&&m.files.every(f=>f.got)?TICK2:TICK1}
function msgEl(m){
  const mine=m.sender.id===me.id,d=el('div','msg '+(mine?'mine':'theirs')),b=el('div','bub');d.dataset.id=m.id;
  const media=m.files.filter(f=>(f.kind==='image'||f.kind==='video')&&f.thumb);
  if(m.files.length){const fw=el('div','files'+(media.length>1&&media.length===m.files.length?' album':''));m.files.forEach(f=>fw.append(fileEl(f)));b.append(fw)}
  if(m.text){const t=el('div','txt');t.dir='auto';linkify(t,m.text);b.append(t)}
  else if(media.length&&media.length===m.files.length)b.classList.add('only-media');
  const ft=el('div','foot');if(mine){const k=el('span');k.innerHTML=tickHtml(m);k.className='tk';ft.append(k)}ft.append(el('span','',hm(m.ts)));b.append(ft);d.append(b);return d;
}
function renderAll(){
  msgs.textContent='';let last='';
  for(const m of shown){const k=dayKey(m.ts);if(k!==last){msgs.append(sepEl(m.ts));last=k}msgs.append(msgEl(m))}
  (pend.get(cur)||[]).forEach(e=>msgs.append(e));
}
function place(n){const p=(pend.get(cur)||new Set()).values().next().value;p&&p.parentNode===msgs?msgs.insertBefore(n,p):msgs.append(n)}
function appendMsg(m){
  const l=shown[shown.length-1];if(!l||dayKey(l.ts)!==dayKey(m.ts))place(sepEl(m.ts));
  shown.push(m);ids.add(m.id);place(msgEl(m));
}
const nearBottom=()=>msgs.scrollHeight-msgs.scrollTop-msgs.clientHeight<180,toBottom=()=>{msgs.scrollTop=msgs.scrollHeight;$('#down').hidden=true};
function removeMsg(id){if(!ids.has(id))return;const t=msgs.scrollTop;shown=shown.filter(m=>m.id!==id);ids.delete(id);renderAll();msgs.scrollTop=t}
function autoFetch(m,chat){
  if(!phone||m.sender.id===me.id)return;const c=chats.get(chat);if(!c||!c.auto||!Native.folderLabel(chat))return;
  m.files.forEach(f=>{if(!f.gone)startDownload(f,chat)});
}
function onMsg(c,m,sum){
  if(sum)chats.set(c,sum);
  if(c===cur){if(!ids.has(m.id)){const stick=nearBottom()||m.sender.id===me.id;appendMsg(m);if(stick)toBottom();else $('#down').hidden=false}}
  else if(m.sender.id!==me.id){unread[c]=(unread[c]||0)+1;saveUnread()}
  m.files.forEach(f=>FILES.set(f.id,f));autoFetch(m,c);renderList();
}
msgs.addEventListener('scroll',()=>{if(msgs.scrollTop<150&&hasMore&&!loading)loadOlder();if(nearBottom())$('#down').hidden=true},{passive:true});
$('#down').onclick=toBottom;
async function loadOlder(){
  if(!shown.length)return;loading=true;const id=cur;
  try{const r=await api('GET',`/api/chats/${id}/messages?limit=60&before=${shown[0].n}`);
    if(cur===id){hasMore=r.more;const t=msgs.scrollTop,h=msgs.scrollHeight;shown=r.messages.concat(shown);r.messages.forEach(m=>ids.add(m.id));renderAll();msgs.scrollTop=msgs.scrollHeight-h+t}}catch{}
  loading=false;
}
async function loadMsgs(id){
  const r=await api('GET',`/api/chats/${id}/messages?limit=60`);if(cur!==id)return;
  shown=r.messages;ids=new Set(shown.map(m=>m.id));hasMore=r.more;renderAll();toBottom();shown.forEach(m=>autoFetch(m,id));
}
function addPend(id,e){if(!pend.has(id))pend.set(id,new Set());pend.get(id).add(e);if(cur===id){msgs.append(e);toBottom()}}
function delPend(id,e){pend.get(id)?.delete(e);e.remove()}
function pendingEl(text,items){
  const d=el('div','msg mine pending'),b=el('div','bub');d.append(b);
  const rows=items.map(f=>{const r=el('div','prow'),n=el('span','nm',f.name);n.dir='auto';const st=el('span','st',tr('در صف')),bar=el('div','pbar'),i=el('i');bar.append(i);r.append(n,st,bar);b.append(r);return{st,i}});
  if(text){const t=el('div','txt');t.dir='auto';t.textContent=text;b.append(t)}
  return{el:d,prog(i,bytes,size,speed){const r=rows[i],p=size?bytes/size:1;if(r){r.i.style.width=p*100+'%';r.st.textContent=fa(Math.round(p*100))+tr('٪')+(speed?' — '+speed:'')}}};
}

// ── chat list
const sorted=()=>[...chats.values()].sort((a,b)=>(b.pinned-a.pinned)||(b.updated-a.updated));
function chatRow(c,preview,time,badge){
  const li=el('li','ci'+(c.id===cur?' on':''));li.dataset.id=c.id;
  const av=el('div','av');avatar(av,c);const mid=el('div','mid'),cn=el('div','cn',c.name),cp=el('div','cp',preview);cn.dir='auto';cp.dir='auto';mid.append(cn,cp);
  const rt=el('div','rt',time);if(badge)rt.append(el('span','badge',fa(badge)));else if(c.pinned){const s=el('span');s.innerHTML=PIN;rt.append(s)}
  li.append(av,mid,rt);return li;
}
function previewOf(c){
  if(!c.last)return tr('گفتگوی خالی');
  if(c.last.files)return'📎 '+c.last.fname+(c.last.files>1?` (+${fa(c.last.files-1)})`:'');
  return c.last.text;
}
function renderList(){
  chatlist.textContent='';const q=query.toLowerCase();
  const arr=sorted().filter(c=>!q||c.name.toLowerCase().includes(q));
  if(!arr.length&&!(hits&&hits.length))chatlist.append(el('div','lempty',q?tr('چیزی پیدا نشد'):tr('هنوز گفتگویی نیست. با دکمه‌ی + اولین گفتگو را بسازید.')));
  for(const c of arr)chatlist.append(chatRow(c,previewOf(c),c.last?tfmt(c.last.ts):'',unread[c.id]));
  if(q&&hits&&hits.length){chatlist.append(el('div','lhead',tr('پیام‌ها')));
    for(const m of hits){const c=chats.get(m.chat);if(c)chatlist.append(chatRow(c,m.text||(m.files[0]&&m.files[0].name)||'',tfmt(m.ts),0))}}
}
chatlist.onclick=e=>{const li=e.target.closest('.ci');if(li){$('#q').value='';query='';hits=null;location.hash=li.dataset.id;renderList()}};
let searchT;$('#q').oninput=e=>{query=e.target.value.trim();hits=null;renderList();clearTimeout(searchT);if(query)searchT=setTimeout(async()=>{try{const r=await api('GET','/api/search?q='+encodeURIComponent(query));hits=r.results;renderList()}catch{}},220)};
function chatMenuItems(id){
  const c=chats.get(id),items=[[tr('اطلاعات و پوشه'),()=>infoDialog(id)],[c.pinned?tr('برداشتن سنجاق'):tr('سنجاق کردن'),()=>api('PATCH','/api/chats/'+id,{pinned:!c.pinned}).catch(()=>{})]];
  if(!phone)items.push([tr('باز کردن پوشه'),()=>api('POST','/api/local/open-folder/'+id).catch(()=>toast(tr('پوشه باز نشد')))]);
  items.push([tr('پاک کردن تاریخچه'),()=>clearChat(id),1],[tr('حذف گفتگو'),()=>deleteChat(id),1]);return items;
}
longPress(chatlist,(t,x,y)=>{const li=t.closest('.ci');if(li)pop(x,y,chatMenuItems(li.dataset.id))});
$('#rmenu').onclick=e=>cur&&popAt(e.currentTarget,chatMenuItems(cur));
$('#head').onclick=()=>cur&&infoDialog(cur);
$('#newchat').onclick=newChatDialog;
$('#back').onclick=()=>history.back();
$('#menu').onclick=e=>{
  const t=store.get('theme','auto'),setT=v=>()=>{store.set('theme',v);applyTheme()},dot=(v,s)=>(t===v?'● ':'')+s,setL=v=>()=>{store.set('lang',v);location.reload()},lang=(v,s)=>[(LANG===v?'● ':'')+s,setL(v)];
  const items=phone?[[tr('قطع جفت‌شدن با کامپیوتر'),async()=>{if(await confirmBox(tr('قطع اتصال'),tr('برای اتصال دوباره باید کد تازه وارد کنید.'),tr('قطع اتصال')))Native.unpair()},1]]:[[tr('اتصال گوشی'),pairDialog]];
  popAt(e.currentTarget,[...items,lang('fa','فارسی'),lang('en','English'),[dot('auto',tr('تم: خودکار')),setT('auto')],[dot('light',tr('تم: روشن')),setT('light')],[dot('dark',tr('تم: تیره')),setT('dark')]]);
};
msgs.addEventListener('click',e=>{const f=e.target.closest('.file');if(f)tapFile(f.dataset.fid)});
longPress(msgs,(t,x,y)=>{
  const d=t.closest('.msg');if(!d||!d.dataset.id)return;const id=d.dataset.id,m=shown.find(v=>v.id===id);if(!m)return;
  const items=[];if(m.text)items.push([tr('کپی متن'),()=>copyText(m.text)]);
  if(m.files.length===1&&localOf(m.files[0]))items.push([phone?tr('باز کردن با برنامه‌ی دیگر'):tr('نمایش در پوشه'),()=>showFile(m.files[0])]);
  items.push([tr('حذف پیام'),()=>deleteMsg(m),1]);pop(x,y,items);
});
async function deleteMsg(m){
  const r=await confirmBox(tr('حذف پیام'),tr('این پیام از هر دو دستگاه حذف می‌شود.'),tr('حذف'),m.files.length?tr('فایل هم از هر دو دستگاه پاک شود'):null);
  if(r)try{await api('DELETE',`/api/chats/${cur}/messages/${m.id}?files=${r.files?1:0}`)}catch{toast(tr('حذف نشد'))}
}

// ── routing
function renderHead(){
  const c=chats.get(cur);if(!c)return;$('#title').textContent=c.name;avatar($('#hav'),c);const s=$('#sub');
  if(!linkUp){s.textContent=tr('در حال اتصال…');s.className='';return}
  if(phone){s.textContent=tr('متصل به ')+host;s.className='on'}
  else{s.textContent=online.length?online[0]+tr(' متصل است'):tr('گوشی متصل نیست');s.className=online.length?'on':''}
}
function renderLink(){
  const l=$('#link');l.textContent='';const on=phone?linkUp:online.length>0;l.className='link'+(on?' on':'');
  l.append(el('span','',phone?(linkUp?tr('متصل به ')+host:tr('در حال اتصال…')):(on?online.join(tr('، '))+tr(' متصل است'):tr('گوشی متصل نیست'))));
  if(!phone&&!on){const b=el('button','',tr('اتصال گوشی'));b.onclick=pairDialog;l.append(b)}
}
function renderNotice(){
  const n=$('#notice'),c=chats.get(cur);n.hidden=true;if(!c)return;
  if(phone&&!Native.folderLabel(c.id)){n.textContent=tr('برای دریافت فایل‌ها، پوشه‌ی این گفتگو را روی گوشی انتخاب کنید');n.onclick=()=>Native.pickFolder(c.id);n.hidden=false}
  else if(!phone&&!c.folderSet){n.textContent=tr('این گفتگو در گوشی ساخته شده. پوشه‌ی ذخیره‌ی فایل‌ها را روی کامپیوتر انتخاب کنید');n.onclick=()=>infoDialog(c.id);n.hidden=false}
}
function leave(){if(cur){keepText();cur=null;draft=[];renderTray()}}
async function openRoom(id){
  leave();cur=id;unread[id]=0;saveUnread();renderList();renderHead();renderNotice();app.classList.remove('idle');shown=[];ids=new Set();msgs.textContent='';
  ta.value=store.get('draft:'+id,'');autosize();updateSend();
  if(shared.length){draft=draft.concat(shared);shared=[];renderTray()}
  try{await loadMsgs(id)}catch{toast(tr('پیام‌ها بارگذاری نشد'))}
}
function route(){
  const id=location.hash.slice(1);
  if(id&&chats.has(id)){app.classList.add('in-room');if(cur!==id)openRoom(id);return}
  app.classList.remove('in-room');
  if(matchMedia('(min-width:761px)').matches&&chats.size){location.replace('#'+sorted()[0].id);return}
  leave();app.classList.add('idle');renderList();
}
addEventListener('hashchange',route);

// the phone's back button: the app closes things in order, then hands over to Android
window.goBack=()=>{
  if(!pm.hidden){pm.hidden=true;return true}
  if(!lb.hidden){closeLB();return true}
  if(!dlg.hidden){closeDlg();return true}
  if(app.classList.contains('in-room')){history.back();return true}
  return false;
};

// ── live sync: the server pushes changes, nothing refreshes unless something changed
function setFiles(m,fid,fn){const x=m.files.find(f=>f.id===fid);if(x)fn(x)}
function purge(list){if(phone)(list||[]).forEach(id=>Native.removeLocal(id))}
function handle(ev){
  switch(ev.t){
    case'msg':onMsg(ev.chat,ev.msg,ev.sum);break;
    case'msgdel':if(ev.sum)chats.set(ev.chat,ev.sum);purge(ev.purged);if(ev.chat===cur)removeMsg(ev.id);renderList();break;
    case'cleared':if(ev.sum)chats.set(ev.chat,ev.sum);purge(ev.purged);if(ev.chat===cur){shown=[];ids=new Set();hasMore=false;renderAll()}renderList();break;
    case'chat':chats.set(ev.chat.id,ev.chat);if(ev.chat.id===cur){renderHead();renderNotice()}renderList();break;
    case'chatdel':chats.delete(ev.id);delete unread[ev.id];saveUnread();purge(ev.purged);if(phone)Native.clearFolder(ev.id);
      if(ev.id===cur){cur=null;draft=[];renderTray();history.replaceState(null,'',location.pathname)}renderList();route();break;
    case'got':{const m=shown.find(v=>v.id===ev.msg);if(m){setFiles(m,ev.id,f=>f.got=true);const d=msgs.querySelector(`[data-id="${ev.msg}"] .tk`);if(d)d.innerHTML=tickHtml(m)}break}
    case'presence':online=ev.online;renderLink();renderHead();break;
    case'paired':closeDlg();toast(tr('{0} وصل شد',ev.name));break;
  }
}
async function loadState(){
  const s=await api('GET','/api/state');me=s.me;host=s.host;online=s.online;chats=new Map(s.chats.map(c=>[c.id,c]));renderList();renderLink();
}
function connect(){
  const es=new EventSource('/api/events');let first=true,lost=0;
  es.onopen=async()=>{linkUp=true;lost=0;renderLink();renderHead();if(!first){try{await loadState();if(cur&&chats.has(cur))await loadMsgs(cur);else route()}catch{}}first=false};
  es.onmessage=e=>handle(JSON.parse(e.data));
  es.onerror=()=>{linkUp=false;renderLink();renderHead();if(phone&&++lost>=4)Native.lost()};
}

// ── events from the phone's native side
let shared=[];
window.onNative=ev=>{
  switch(ev.t){
    case'picked':for(const it of ev.items)draft.push({key:it.key,name:it.name,size:it.size,type:it.mime});renderTray();break;
    case'shared':{const items=ev.items.map(it=>({key:it.key,name:it.name,size:it.size,type:it.mime}));
      if(cur){draft=draft.concat(items);renderTray()}else{shared=shared.concat(items);toast(tr('گفتگوی مقصد را انتخاب کنید'))}break}
    case'folder':{const w=folderWaiters.get(ev.key);if(w)w(ev.label);if(ev.key===cur){renderNotice();shown.forEach(m=>autoFetch(m,cur))}break}
    case'up':nativeUps.get(ev.key)?.onp(ev.bytes);break;
    case'upok':nativeUps.get(ev.key)?.ok(ev.id);nativeUps.delete(ev.key);break;
    case'upfail':nativeUps.get(ev.key)?.no(new Error('native'));nativeUps.delete(ev.key);break;
    case'down':{busy.set(ev.id,ev.size?ev.bytes/ev.size:0);const m=meters.get(ev.id);if(m)speeds.set(ev.id,m(ev.bytes));refresh(ev.id);break}
    case'downok':busy.delete(ev.id);speeds.delete(ev.id);meters.delete(ev.id);refresh(ev.id);break;
    case'downfail':busy.delete(ev.id);speeds.delete(ev.id);meters.delete(ev.id);refresh(ev.id);if(!ev.cancelled)toast(tr('دانلود ناموفق بود'));break;
  }
};

// ── composer
$('#send').onclick=send;
$('#attach').onclick=()=>phone?Native.pickFiles():$('#file').click();
$('#file').onchange=e=>{addFiles([...e.target.files]);e.target.value=''};
ta.addEventListener('input',()=>{autosize();updateSend();keepText()});
ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing&&!phone){e.preventDefault();send()}});
document.addEventListener('paste',e=>{
  if(!cur||phone)return;const cd=e.clipboardData;if(!cd)return;
  const text=cd.getData('text/plain'),files=[...cd.files];
  if(files.length&&!text){e.preventDefault();
    addFiles(files.map(f=>/^image\.\w+$/i.test(f.name)?new File([f],`pasted-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.${(f.type.split('/')[1]||'png').split('+')[0]}`,{type:f.type}):f));
  }
});
let dragN=0;
addEventListener('dragenter',e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes('Files')){dragN++;document.body.classList.add('drag')}});
addEventListener('dragleave',()=>{if(--dragN<=0){dragN=0;document.body.classList.remove('drag')}});
addEventListener('dragover',e=>e.preventDefault());
addEventListener('drop',e=>{e.preventDefault();dragN=0;document.body.classList.remove('drag');if(e.dataTransfer.files.length)addFiles([...e.dataTransfer.files])});

if(LANG==='en'){
  for(const e of document.querySelectorAll('[aria-label]'))e.setAttribute('aria-label',tr(e.getAttribute('aria-label')));
  for(const e of document.querySelectorAll('[title]'))e.title=tr(e.title);
  for(const e of document.querySelectorAll('[placeholder]'))e.placeholder=tr(e.placeholder);
  for(const e of document.querySelectorAll('[data-t]'))e.textContent=tr(e.textContent);
}
msgs.dataset.empty=tr('هنوز پیامی نیست. پیام بنویسید یا فایل بفرستید.');$('#room').dataset.drop=tr('فایل را اینجا رها کنید');

(async()=>{try{await loadState();route();connect();if(phone)Native.ready()}catch{if(phone)Native.lost();else{toast(tr('اتصال برقرار نشد'));setTimeout(()=>location.reload(),3000)}}})();
})();

(()=>{'use strict';
const Native=window.Native||null,phone=!!Native;
// on the phone the page's origin follows the laptop's IP, so settings live in the app, not in localStorage
const store={get(k,d){try{const v=phone?Native.getValue(k):localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{const s=JSON.stringify(v);if(phone)Native.setValue(k,s);else localStorage.setItem(k,s)}catch{}}};
const LANG=store.get('lang','fa'),LOC=LANG==='fa'?'fa-IR':'en-US';
document.documentElement.lang=LANG;document.documentElement.dir=LANG==='fa'?'rtl':'ltr';document.documentElement.classList.add(phone?'phone':'pc');
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
 "اول پوشه‌ی این گفتگو را انتخاب کنید": "First choose a folder for this chat",
 "فایل‌ها و تاریخچه‌ی این گفتگو در این پوشه روی کامپیوتر ذخیره می‌شوند. تا پوشه را انتخاب نکنید، گفتگو باز نمی‌شود.": "This chat's files and history are saved in this folder on the computer. The chat stays closed until you choose one.",
 "فایل‌ها و تاریخچه‌ی این گفتگو در این پوشه روی گوشی ذخیره می‌شوند. تا پوشه را انتخاب نکنید، گفتگو باز نمی‌شود.": "This chat's files and history are saved in this folder on the phone. The chat stays closed until you choose one.",
 "نیاز به انتخاب پوشه": "Needs a folder",
 "دریافت خودکار فایل‌ها روی کامپیوتر": "Receive files on the computer automatically",
 "وقتی خاموش باشد، فایل روی دستگاه فرستنده می‌ماند تا خودتان دانلودش کنید.": "When off, a file stays on the sending device until you download it.",
 "گوشی متصل نیست؛ فایل هنوز روی گوشی است": "Phone not connected; the file is still on the phone",
 "گوشی نتوانست فایل را بفرستد": "The phone could not send the file",
 "کپی عکس": "Copy image",
 "کپی نام فایل": "Copy file name",
 "دانلود": "Download",
 "باز کردن": "Open",
 "این عکس این‌جا نمایش داده نمی‌شود؛ آن را با برنامه‌ی دیگری باز کنید": "This image can't be shown here; open it with another app",
 "گالری": "Gallery",
 "موسیقی": "Music",
 "فایل‌ها": "Files",
 "برنامه‌های دیگر": "Other apps",
 "ارسال از": "Send from",
 "کوچک‌نمایی": "Zoom out",
 "بزرگ‌نمایی": "Zoom in",
 "اندازه‌ی صفحه": "Fit to screen",
 "چرخاندن": "Rotate",
 "قبلی": "Previous",
 "بعدی": "Next",
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
const ICON={copy:'<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15H4a1 1 0 0 1-1-1V5a2 2 0 0 1 2-2h9a1 1 0 0 1 1 1v1"/>',image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',down:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',open:'<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',folder:'<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/>',trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',pin:'<path d="M9 4h6l-1 6 4 4H6l4-4zM12 14v6"/>',broom:'<path d="M14 4l6 6M4 20l7-7M9 11l4 4-3 5H4v-6z"/>',music:'<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',file:'<path d="M6 3h8l5 5v13H6zM14 3v5h5"/>',apps:'<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'};
const icon=k=>`<svg viewBox="0 0 24 24">${ICON[k]}</svg>`;
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
function copyText(t){
  if(phone&&Native.copy){Native.copy(t);return toast(tr('کپی شد'))}
  const x=el('textarea');x.value=t;x.style.cssText='position:fixed;opacity:0';document.body.append(x);x.select();try{document.execCommand('copy');toast(tr('کپی شد'))}catch{toast(tr('کپی نشد'))}x.remove();
}
async function copyImage(f){
  try{const b=await createImageBitmap(await(await fetch('/api/files/'+f.id)).blob()),c=el('canvas');c.width=b.width;c.height=b.height;c.getContext('2d').drawImage(b,0,0);
    const png=await new Promise(r=>c.toBlob(r,'image/png'));await navigator.clipboard.write([new ClipboardItem({'image/png':png})]);toast(tr('کپی شد'))}
  catch{toast(tr('کپی نشد'))}
}
const avatar=(e,c)=>{let h=0;for(const ch of c.id)h=(h*31+ch.charCodeAt(0))>>>0;const[a,b]=COLORS[h%COLORS.length];e.style.background=`linear-gradient(160deg,${a},${b})`;e.textContent=[...c.name][0]||tr('؟')};
const extOf=n=>(n.includes('.')?n.split('.').pop():'FILE').slice(0,4).toUpperCase();

// speed readout for a running transfer
function meter(){let t0=performance.now(),b0=0,txt='';return bytes=>{const t=performance.now(),dt=t-t0;if(dt>=700){txt=fa(+(((bytes-b0)/1048576)/(dt/1000)).toFixed(1))+tr(' مگابایت/ثانیه');t0=t;b0=bytes}return txt}}

// ── dialogs
function closeDlg(){dlg.hidden=true;dlg.textContent=''}
function openDlg(title){dlg.textContent='';dlg.className='';const c=el('div','card-d');c.setAttribute('role','dialog');c.setAttribute('aria-modal','true');c.setAttribute('aria-label',title);c.append(el('h3','',title));dlg.append(c);dlg.hidden=false;return c}
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
  if(phone){const f=folderField(id,Native.folderLabel(id),()=>{});c.append(field(tr('پوشه‌ی فایل‌ها روی این گوشی'),f.row));if(ch.folderSet){c.append(el('p','',tr('فایل‌ها روی کامپیوتر هم در این مسیر ذخیره می‌شوند:')));c.append(el('p','pathline',ch.folder))}}
  else{const f=folderField(id,ch.folderSet?ch.folder:'',()=>{});folderGet=f.get;c.append(field(tr('پوشه‌ی فایل‌ها روی این کامپیوتر'),f.row));c.append(el('p','',tr('فایل‌های قبلی همان‌جا می‌مانند و فقط فایل‌های تازه به پوشه‌ی جدید می‌روند.')))}
  const toggle=(on,text)=>{const l=el('label','chk'),b=el('input');b.type='checkbox';b.checked=on;l.append(b,el('span','',text));c.append(l);return b};
  const auto=toggle(ch.auto,tr('دریافت خودکار فایل‌ها روی گوشی')),autoPc=toggle(ch.autoPc,tr('دریافت خودکار فایل‌ها روی کامپیوتر'));
  c.append(el('p','hint',tr('وقتی خاموش باشد، فایل روی دستگاه فرستنده می‌ماند تا خودتان دانلودش کنید.')));
  const a=el('div','acts');a.append(button(tr('انصراف'),'',closeDlg),button(tr('ذخیره'),'solid',async()=>{
    const b={name:name.value,auto:auto.checked,autoPc:autoPc.checked};const nf=folderGet();if(nf&&nf!==ch.folder)b.folder=nf;
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
  pm.textContent='';for(const[t,fn,bad,ic]of items){const b=el('button',bad?'danger':'');if(ic)b.innerHTML=icon(ic);b.append(el('span','',t));b.onclick=()=>{pm.hidden=true;fn()};pm.append(b)}
  pm.hidden=false;pm.style.top=Math.max(8,Math.min(innerHeight-pm.offsetHeight-8,y))+'px';pm.style.left=Math.max(8,Math.min(innerWidth-pm.offsetWidth-8,x))+'px';
}
const popAt=(a,items)=>{const r=a.getBoundingClientRect();pop(r.left,r.bottom+4,items)};
let pmClosed=0;     // the click that closes a menu must not open another one
document.addEventListener('mousedown',e=>{if(!pm.hidden&&!e.target.closest('#pm')){pm.hidden=true;pmClosed=Date.now()}},true);
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
const localOf=f=>phone?Native.has(f.id):!f.held;
function fileState(f){if(busy.has(f.id))return'busy';if(localOf(f))return f.gone&&!phone?'gone':'done';return f.gone||(phone&&f.held)?'gone':'idle'}
function syncFile(e){
  const f=FILES.get(e.dataset.fid),s=fileState(f),p=busy.get(f.id)||0;e.dataset.s=s;
  const pg=e.querySelector('.pg');if(pg)pg.style.strokeDashoffset=138.2*(1-(s==='busy'?p:0));
  const st=e.querySelector('.st');
  if(st)st.textContent=s==='busy'?fa(Math.round(p*100))+tr('٪')+(speeds.get(f.id)?' — '+speeds.get(f.id):''):s==='gone'?tr('فایل در دسترس نیست'):fmt(f.size);
}
const refresh=fid=>document.querySelectorAll(`[data-fid="${fid}"]`).forEach(syncFile);
function fileEl(f){
  FILES.set(f.id,f);if(f.fetching&&!phone&&!busy.has(f.id))busy.set(f.id,0);
  const media=(f.kind==='image'||f.kind==='video')&&f.thumb,e=el('div','file '+(media?'media':'card'));e.dataset.fid=f.id;
  const dl=el('div','dl');dl.innerHTML=RING;
  if(media){e.dataset.k=f.kind;e.style.aspectRatio=f.w&&f.h?`${f.w}/${f.h}`:'4/3';if(f.w&&f.h)e.style.width=Math.max(150,Math.round(f.w*Math.min(340/f.w,420/f.h)))+'px';
    const im=new Image();im.src=`/api/files/${f.id}/thumb`;im.alt=f.name;im.decoding='async';im.loading='lazy';e.append(im,el('span','sz',fmt(f.size)),dl)}
  else{const ic=el('div','ic',extOf(f.name));ic.append(dl);const i=el('div','info'),n=el('span','nm',f.name);n.dir='auto';i.append(n,el('span','st',fmt(f.size)));e.append(ic,i)}
  syncFile(e);return e;
}
function fetchHeld(f){
  busy.set(f.id,0);meters.set(f.id,meter());refresh(f.id);
  api('POST','/api/local/fetch/'+f.id).catch(e=>{transferEnded(f.id);toast(e.status===409?tr('گوشی متصل نیست؛ فایل هنوز روی گوشی است'):tr('دانلود ناموفق بود'))});
}
function transferEnded(id){busy.delete(id);speeds.delete(id);meters.delete(id);const f=FILES.get(id);if(f)f.fetching=false;refresh(id)}
function startDownload(f,chat){
  if(busy.has(f.id))return;
  if(!phone){if(f.held)fetchHeld(f);return}
  if(Native.has(f.id))return;
  if(!Native.folderLabel(chat)){Native.pickFolder(chat);return}
  busy.set(f.id,0);meters.set(f.id,meter());refresh(f.id);Native.download(f.id,chat,f.name,f.mime,String(f.size));
}
const meters=new Map();
function tapFile(fid){
  const f=FILES.get(fid),s=fileState(f);
  if(s==='gone')return toast(tr('این فایل دیگر روی کامپیوتر نیست'));
  if(s==='busy')return phone?Native.cancel(fid):api('POST',`/api/local/fetch/${fid}/stop`).catch(()=>{});
  if(s==='idle')return startDownload(f,cur);
  openFile(f);
}
const inViewer=f=>f.kind==='image'||((f.kind==='video'||f.kind==='audio')&&!f.held);
function openFile(f){if(inViewer(f))openLB(f);else openLocal(f)}
function openLocal(f){if(phone)Native.open(f.id);else api('POST','/api/local/open/'+f.id).catch(()=>toast(tr('فایل باز نشد')))}
function showFile(f){if(phone)Native.open(f.id);else api('POST','/api/local/reveal/'+f.id).catch(()=>toast(tr('فایل پیدا نشد')))}

// ── viewer: the whole picture fits the screen first; wheel, pinch, drag and double-tap move around it
const stage=$('#lbstage'),V={list:[],i:0,x:0,y:0,s:1,fit:1,rot:0,nw:1,nh:1,img:null,seq:0},rtl=LANG==='fa';
const srcOf=f=>phone&&Native.has(f.id)&&f.kind==='image'?'/local/'+f.id:'/api/files/'+f.id;
const edges=()=>V.rot%180?[V.nh,V.nw]:[V.nw,V.nh];
const maxZoom=()=>Math.max(V.fit*12,4);
function layout(){const[w,h]=edges();V.fit=Math.min(stage.clientWidth/w,stage.clientHeight/h,4)}
function paint(smooth){
  if(!V.img)return;const[w,h]=edges(),lx=Math.max(0,(w*V.s-stage.clientWidth)/2),ly=Math.max(0,(h*V.s-stage.clientHeight)/2);
  V.x=Math.max(-lx,Math.min(lx,V.x));V.y=Math.max(-ly,Math.min(ly,V.y));paintRaw(smooth);
}
function paintRaw(smooth){
  V.img.classList.toggle('smooth',!!smooth);V.img.style.transform=`translate(-50%,-50%) translate(${V.x}px,${V.y}px) rotate(${V.rot}deg) scale(${V.s})`;
  $('#lbzoom').textContent=fa(Math.round(V.s*100))+tr('٪');stage.classList.toggle('zoomed',V.s>V.fit*1.01);
}
const fitView=smooth=>{layout();V.s=V.fit;V.x=V.y=0;paint(smooth)};
function zoomTo(s,px,py,smooth){s=Math.max(V.fit,Math.min(maxZoom(),s));V.x=px-(px-V.x)*s/V.s;V.y=py-(py-V.y)*s/V.s;V.s=s;paint(smooth)}
const fromCenter=e=>{const r=stage.getBoundingClientRect();return[e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2]};
function setSize(w,h){const rel=V.s/V.fit;V.nw=w;V.nh=h;V.img.style.width=w+'px';V.img.style.height=h+'px';layout();V.s=V.fit*rel;paint()}
function lbShow(){
  const f=V.list[V.i],my=++V.seq;stage.textContent='';V.img=null;V.rot=0;V.x=V.y=0;V.s=V.fit=1;
  $('#lbname').textContent=f.name;$('#lbcount').textContent=V.list.length>1?fa(V.i+1)+' / '+fa(V.list.length):'';lb.dataset.fid=f.id;
  $('#lbprev').hidden=V.i<=0;$('#lbnext').hidden=V.i>=V.list.length-1;lb.classList.toggle('pic',f.kind==='image');
  if(f.kind!=='image'){const m=el(f.kind==='audio'?'audio':'video');m.controls=true;m.autoplay=true;m.playsInline=true;m.src='/api/files/'+f.id;stage.append(m);return}
  const im=new Image(),spin=el('div','lbspin');im.alt=f.name;im.draggable=false;im.className='lbimg';V.img=im;stage.append(im,spin);
  if(f.thumb)im.src=`/api/files/${f.id}/thumb`;
  setSize(f.w||800,f.h||600);fitView();
  const full=new Image();let triedServer=false;
  full.onload=()=>{if(my!==V.seq)return;spin.remove();im.src=full.src;setSize(full.naturalWidth,full.naturalHeight)};
  full.onerror=()=>{if(my!==V.seq)return;
    if(full.src.includes('/local/')&&!f.held&&!triedServer){triedServer=true;full.src='/api/files/'+f.id;return}
    spin.remove();toast(tr('این عکس این‌جا نمایش داده نمی‌شود؛ آن را با برنامه‌ی دیگری باز کنید'))};
  full.src=srcOf(f);
}
function openLB(f){
  V.list=shown.flatMap(m=>m.files).filter(x=>{x=FILES.get(x.id)||x;return inViewer(x)&&fileState(x)==='done'}).map(x=>FILES.get(x.id)||x);
  V.i=V.list.findIndex(x=>x.id===f.id);if(V.i<0){V.list=[f];V.i=0}
  lb.hidden=false;lb.classList.remove('bare');lbShow();
}
const lbStep=d=>{const i=V.i+d;if(i>=0&&i<V.list.length){V.i=i;lbShow()}};
const closeLB=()=>{lb.hidden=true;V.seq++;V.img=null;stage.textContent=''};
$('#lbclose').onclick=closeLB;$('#lbsave').onclick=()=>showFile(FILES.get(lb.dataset.fid));
$('#lbprev').onclick=()=>lbStep(-1);$('#lbnext').onclick=()=>lbStep(1);
$('#lbin').onclick=()=>zoomTo(V.s*1.5,0,0,true);$('#lbout').onclick=()=>zoomTo(V.s/1.5,0,0,true);$('#lbfit').onclick=()=>fitView(true);
$('#lbrot').onclick=()=>{V.rot+=90;fitView(true)};
const P=new Map();let G=null,lastTap=0,tapT;
stage.addEventListener('pointerdown',e=>{
  if(!V.img)return;e.preventDefault();stage.setPointerCapture(e.pointerId);P.set(e.pointerId,[e.clientX,e.clientY]);
  if(P.size===1)G={sx:e.clientX,sy:e.clientY,ox:V.x,oy:V.y,moved:false,onImg:e.target===V.img,pinch:false};
  else if(P.size===2){const[a,b]=[...P.values()];G={pinch:true,d:Math.hypot(a[0]-b[0],a[1]-b[1]),s:V.s,ox:V.x,oy:V.y,moved:true,c:mid(a,b)}}
});
const mid=(a,b)=>fromCenter({clientX:(a[0]+b[0])/2,clientY:(a[1]+b[1])/2});
stage.addEventListener('pointermove',e=>{
  if(!G||!P.has(e.pointerId))return;P.set(e.pointerId,[e.clientX,e.clientY]);
  if(G.pinch){if(P.size<2)return;const[a,b]=[...P.values()],k=Math.max(V.fit,Math.min(maxZoom(),G.s*Math.hypot(a[0]-b[0],a[1]-b[1])/G.d))/G.s,c=mid(a,b);V.s=G.s*k;V.x=c[0]-(G.c[0]-G.ox)*k;V.y=c[1]-(G.c[1]-G.oy)*k;paint();return}
  const dx=e.clientX-G.sx,dy=e.clientY-G.sy;if(Math.hypot(dx,dy)>6)G.moved=true;if(!G.moved)return;
  V.x=G.ox+dx;V.y=G.oy+dy;if(V.s>V.fit*1.01)paint();else paintRaw();     // at fit size a drag is a swipe, so it isn't held in place
});
function pointerEnd(e){
  if(!P.delete(e.pointerId)||!G)return;const g=G;
  if(g.pinch){if(!P.size){G=null;if(V.s<=V.fit*1.01)fitView(true)}return}
  G=null;const dx=e.clientX-g.sx,dy=e.clientY-g.sy,free=V.s<=V.fit*1.01;
  if(g.moved){
    if(free){if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy))return lbStep((dx<0)!==rtl?1:-1);if(Math.abs(dy)>120)return closeLB();fitView(true)}
    return;
  }
  const now=Date.now();clearTimeout(tapT);
  if(now-lastTap<300){lastTap=0;const[x,y]=fromCenter(e);free?zoomTo(Math.min(maxZoom(),Math.max(V.fit*2.6,1)),x,y,true):fitView(true);return}
  lastTap=now;tapT=setTimeout(()=>{if(g.onImg)lb.classList.toggle('bare');else closeLB()},300);
}
stage.addEventListener('pointerup',pointerEnd);stage.addEventListener('pointercancel',pointerEnd);
stage.addEventListener('click',e=>{if(!V.img&&e.target===stage)closeLB()});
stage.addEventListener('wheel',e=>{if(!V.img)return;e.preventDefault();const[x,y]=fromCenter(e);zoomTo(V.s*Math.exp(-e.deltaY*.0022),x,y)},{passive:false});
addEventListener('resize',()=>{if(!lb.hidden&&V.img){const rel=V.s/V.fit;layout();V.s=V.fit*rel;paint()}});
addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(!lb.hidden)closeLB();else if(!dlg.hidden)closeDlg();pm.hidden=true;return}
  if(lb.hidden)return;
  if(e.key==='ArrowLeft')lbStep(rtl?1:-1);else if(e.key==='ArrowRight')lbStep(rtl?-1:1);
  else if(!V.img)return;else if(e.key==='+'||e.key==='=')zoomTo(V.s*1.5,0,0,true);else if(e.key==='-')zoomTo(V.s/1.5,0,0,true);else if(e.key==='0')fitView(true);else if(e.key==='r'||e.key==='R')$('#lbrot').click();
});

// ── messages
function linkify(n,t){t.split(/(https?:\/\/[^\s<>"']+)/g).forEach((s,i)=>{if(i%2){const a=el('a','',s);a.href=s;a.target='_blank';a.rel='noopener noreferrer';n.append(a)}else if(s)n.append(s)})}
const dayKey=ts=>new Date(ts*1000).toDateString();
const sepEl=ts=>el('div','sep',new Date(ts*1000).toLocaleDateString(LOC,{weekday:'long',day:'numeric',month:'long'}));
const onlyEmoji=t=>[...t].length<=12&&/\p{Extended_Pictographic}/u.test(t)&&!/[\p{L}\p{N}]/u.test(t);
function tickHtml(m){return m.files.length&&m.files.every(f=>f.got)?TICK2:TICK1}
function msgEl(m){
  const mine=m.sender.id===me.id,d=el('div','msg '+(mine?'mine':'theirs')),b=el('div','bub');d.dataset.id=m.id;
  const mb=el('button','mb');mb.type='button';mb.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>';mb.setAttribute('aria-label',tr('گزینه‌ها'));
  const media=m.files.filter(f=>(f.kind==='image'||f.kind==='video')&&f.thumb);
  if(m.files.length){const fw=el('div','files'+(media.length>1&&media.length===m.files.length?' album':''));m.files.forEach(f=>fw.append(fileEl(f)));b.append(fw)}
  if(m.text){const t=el('div','txt'+(onlyEmoji(m.text)?' big':''));t.dir='auto';linkify(t,m.text);b.append(t)}
  else if(media.length&&media.length===m.files.length)b.classList.add('only-media');
  const ft=el('div','foot');if(mine){const k=el('span');k.innerHTML=tickHtml(m);k.className='tk';ft.append(k)}ft.append(el('span','',hm(m.ts)));b.append(ft);d.append(b,mb);return d;
}
function renderAll(){
  msgs.textContent='';let last='';
  for(const m of shown){const k=dayKey(m.ts);if(k!==last){msgs.append(sepEl(m.ts));last=k}msgs.append(msgEl(m))}
  (pend.get(cur)||[]).forEach(e=>msgs.append(e));
}
function place(n){const p=(pend.get(cur)||new Set()).values().next().value;p&&p.parentNode===msgs?msgs.insertBefore(n,p):msgs.append(n)}
function appendMsg(m){
  const l=shown[shown.length-1];if(!l||dayKey(l.ts)!==dayKey(m.ts))place(sepEl(m.ts));
  shown.push(m);ids.add(m.id);const e=msgEl(m);e.classList.add('new');place(e);
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
  if(!folderReady(c))return tr('نیاز به انتخاب پوشه');
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
  const c=chats.get(id),items=[[tr('اطلاعات و پوشه'),()=>infoDialog(id),0,'info'],[c.pinned?tr('برداشتن سنجاق'):tr('سنجاق کردن'),()=>api('PATCH','/api/chats/'+id,{pinned:!c.pinned}).catch(()=>{}),0,'pin']];
  if(!phone&&c.folderSet)items.push([tr('باز کردن پوشه'),()=>api('POST','/api/local/open-folder/'+id).catch(()=>toast(tr('پوشه باز نشد'))),0,'folder']);
  items.push([tr('پاک کردن تاریخچه'),()=>clearChat(id),1,'broom'],[tr('حذف گفتگو'),()=>deleteChat(id),1,'trash']);return items;
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
function msgMenu(id,x,y){
  const m=shown.find(v=>v.id===id);if(!m)return;
  const items=[],f=m.files.length===1?(FILES.get(m.files[0].id)||m.files[0]):null,s=f&&fileState(f);
  if(m.text)items.push([tr('کپی متن'),()=>copyText(m.text),0,'copy']);
  if(!phone&&s==='done'&&f.kind==='image')items.push([tr('کپی عکس'),()=>copyImage(f),0,'image']);
  if(m.files.length)items.push([tr('کپی نام فایل'),()=>copyText(m.files.map(v=>v.name).join('\n')),0,'copy']);
  if(s==='idle')items.push([tr('دانلود'),()=>startDownload(f,cur),0,'down']);
  if(s==='done'){items.push([tr('باز کردن'),()=>openFile(f),0,'open']);items.push([phone?tr('باز کردن با برنامه‌ی دیگر'):tr('نمایش در پوشه'),()=>showFile(f),0,phone?'open':'folder'])}
  items.push([tr('حذف پیام'),()=>deleteMsg(m),1,'trash']);pop(x,y,items);
}
msgs.addEventListener('click',e=>{
  if(Date.now()-pmClosed<400)return;
  const f=e.target.closest('.file');if(f)return tapFile(f.dataset.fid);
  const d=e.target.closest('.msg');if(!d||!d.dataset.id||e.target.closest('a'))return;
  const b=e.target.closest('.mb');
  if(b){const r=b.getBoundingClientRect();return msgMenu(d.dataset.id,r.left,r.bottom+4)}
  if(!String(getSelection())&&(phone||!e.target.closest('.bub')))msgMenu(d.dataset.id,e.clientX,e.clientY);
});
longPress(msgs,(t,x,y)=>{const d=t.closest('.msg');if(d&&d.dataset.id)msgMenu(d.dataset.id,x,y)});
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
// a chat stays closed on a device until that device knows where the chat's files and history go
function folderReady(c){return phone?!!Native.folderLabel(c.id):c.folderSet}
function renderGate(){
  const was=app.classList.contains('locked'),c=chats.get(cur),locked=!!c&&!folderReady(c);app.classList.toggle('locked',locked);
  if(locked)$('#gatep').textContent=phone?tr('فایل‌ها و تاریخچه‌ی این گفتگو در این پوشه روی گوشی ذخیره می‌شوند. تا پوشه را انتخاب نکنید، گفتگو باز نمی‌شود.'):tr('فایل‌ها و تاریخچه‌ی این گفتگو در این پوشه روی کامپیوتر ذخیره می‌شوند. تا پوشه را انتخاب نکنید، گفتگو باز نمی‌شود.');
  if(was&&!locked&&cur)loadMsgs(cur).catch(()=>{});
  return locked;
}
$('#gatebtn').onclick=async()=>{
  const id=cur;if(!id)return;if(phone)return Native.pickFolder(id);
  try{const r=await api('POST','/api/local/pick-folder',{start:'',title:tr('پوشه‌ی فایل‌های این گفتگو')});if(r.path)await api('PATCH','/api/chats/'+id,{folder:r.path})}
  catch(e){toast(e.status===400?tr('این پوشه قابل استفاده نیست'):tr('پوشه انتخاب نشد'))}
};
function leave(){if(cur){keepText();cur=null;draft=[];renderTray()}}
async function openRoom(id){
  leave();cur=id;unread[id]=0;saveUnread();renderList();renderHead();app.classList.remove('locked','idle');shown=[];ids=new Set();msgs.textContent='';
  ta.value=store.get('draft:'+id,'');autosize();updateSend();
  if(shared.length){draft=draft.concat(shared);shared=[];renderTray()}
  if(renderGate())return;
  try{await loadMsgs(id)}catch{toast(tr('پیام‌ها بارگذاری نشد'))}
}
function route(){
  const id=location.hash.slice(1);app.classList.remove('locked');
  if(id&&chats.has(id)){app.classList.add('in-room');if(cur!==id)openRoom(id);else renderGate();return}
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
function updateFile(ev){
  const m=shown.find(v=>v.id===ev.msg),g=FILES.get(ev.file.id);if(m)setFiles(m,ev.file.id,f=>Object.assign(f,ev.file));if(g)Object.assign(g,ev.file);
  transferEnded(ev.file.id);const d=m&&msgs.querySelector(`[data-id="${ev.msg}"] .tk`);if(d)d.innerHTML=tickHtml(m);
}
function purge(list){if(phone)(list||[]).forEach(id=>Native.removeLocal(id))}
function handle(ev){
  switch(ev.t){
    case'msg':onMsg(ev.chat,ev.msg,ev.sum);break;
    case'msgdel':if(ev.sum)chats.set(ev.chat,ev.sum);purge(ev.purged);if(ev.chat===cur)removeMsg(ev.id);renderList();break;
    case'cleared':if(ev.sum)chats.set(ev.chat,ev.sum);purge(ev.purged);if(ev.chat===cur){shown=[];ids=new Set();hasMore=false;renderAll()}renderList();break;
    case'chat':chats.set(ev.chat.id,ev.chat);if(ev.chat.id===cur){renderHead();renderGate()}renderList();break;
    case'chatdel':chats.delete(ev.id);delete unread[ev.id];saveUnread();purge(ev.purged);if(phone){if(Native.dropChat)Native.dropChat(ev.id);Native.clearFolder(ev.id)}
      if(ev.id===cur){cur=null;draft=[];renderTray();history.replaceState(null,'',location.pathname)}renderList();route();break;
    case'got':{const m=shown.find(v=>v.id===ev.msg);if(m){setFiles(m,ev.id,f=>f.got=true);const d=msgs.querySelector(`[data-id="${ev.msg}"] .tk`);if(d)d.innerHTML=tickHtml(m)}break}
    case'presence':online=ev.online;renderLink();renderHead();if(!phone&&!online.length)[...busy.keys()].forEach(transferEnded);break;
    case'fetch':if(phone&&ev.to===me.id)Native.push(ev.id,ev.name,ev.mime,String(ev.size));break;
    case'fetchstop':if(phone&&ev.to===me.id)Native.cancel(ev.id);break;
    case'prog':if(!phone){busy.set(ev.id,ev.size?ev.bytes/ev.size:0);const m=meters.get(ev.id);if(m)speeds.set(ev.id,m(ev.bytes));refresh(ev.id)}break;
    case'fetchend':if(!phone){transferEnded(ev.id);if(ev.failed)toast(tr('گوشی نتوانست فایل را بفرستد'))}break;
    case'file':updateFile(ev);break;
    case'paired':closeDlg();toast(tr('{0} وصل شد',ev.name));break;
  }
  if(phone&&/^(msg|msgdel|cleared|chat)$/.test(ev.t))saveSoon();
}
// the phone keeps its own copy of each chat's history in that chat's folder
let saveT;const saveSoon=()=>{clearTimeout(saveT);saveT=setTimeout(saveChats,2500)};
function saveChats(){
  if(!phone||!Native.saveChat)return;
  for(const c of chats.values()){if(!Native.folderLabel(c.id))continue;const k=`${c.name}|${c.updated}|${c.count}`;if(store.get('saved:'+c.id)!==k){store.set('saved:'+c.id,k);Native.saveChat(c.id)}}
}
async function loadState(){
  const s=await api('GET','/api/state');me=s.me;host=s.host;online=s.online;chats=new Map(s.chats.map(c=>[c.id,c]));renderList();renderLink();saveChats();
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
    case'folder':{const w=folderWaiters.get(ev.key);if(w)w(ev.label);store.set('saved:'+ev.key,'');saveSoon();renderList();if(ev.key===cur){renderGate();shown.forEach(m=>autoFetch(m,cur))}break}
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
function attachSheet(){
  if(!Native.pick)return Native.pickFiles();
  const c=openDlg(tr('ارسال از'));dlg.className='sheet';const g=el('div','tiles');
  for(const[k,t,ic]of[['gallery',tr('گالری'),'image'],['music',tr('موسیقی'),'music'],['files',tr('فایل‌ها'),'file'],['apps',tr('برنامه‌های دیگر'),'apps']]){
    const b=el('button','tile t-'+k);b.type='button';const i=el('span');i.innerHTML=icon(ic);b.append(i,el('small','',t));b.onclick=()=>{closeDlg();Native.pick(k)};g.append(b)}
  c.append(g);
}
$('#attach').onclick=()=>phone?attachSheet():$('#file').click();
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

new ResizeObserver(()=>{$('#room').style.setProperty('--cb',$('#composer').offsetHeight+'px');if(nearBottom())msgs.scrollTop=msgs.scrollHeight}).observe($('#composer'));
(async()=>{try{await loadState();route();connect();if(phone)Native.ready()}catch{if(phone)Native.lost();else{toast(tr('اتصال برقرار نشد'));setTimeout(()=>location.reload(),3000)}}})();
})();

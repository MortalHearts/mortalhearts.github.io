const svg=document.getElementById("keyboard");
const NS="http://www.w3.org/2000/svg";
const audio=document.getElementById("audio-player");
const image=document.getElementById("sound-image");
const stage=document.getElementById("image-stage");
const title=document.getElementById("sound-title");
const altButton=document.getElementById("alt-toggle");
let sounds=[];let altMode=false;let activeKey=null;let lastCyclingSound={};
const whitePitchClasses=new Set([0,2,4,5,7,9,11]);
function svgEl(name,attrs){const n=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;}
function buildKeyboard(){
  const whites=[],blacks=[];
  for(let i=0;i<88;i++){const midi=21+i,note={key:i+1,midi,pc:midi%12};(whitePitchClasses.has(note.pc)?whites:blacks).push(note);}
  const whiteW=25,whiteH=100,blackW=15,blackH=62,top=22;
  const width=whites.length*whiteW;svg.setAttribute("viewBox",`0 0 ${width} 150`);svg.setAttribute("preserveAspectRatio","none");
  const xByMidi=new Map();
  whites.forEach((note,i)=>{const x=i*whiteW;xByMidi.set(note.midi,x);const r=svgEl("rect",{x,y:top,width:whiteW,height:whiteH,class:"white-key","data-key":note.key,tabindex:"0",role:"button","aria-label":`Key ${note.key}`});attachPress(r,note.key);svg.appendChild(r);const label=svgEl("text",{x:x+whiteW/2,y:139,class:"key-number"});label.textContent=note.key;svg.appendChild(label);});
  blacks.forEach(note=>{const next=whites.find(w=>w.midi>note.midi);if(!next)return;const x=xByMidi.get(next.midi)-blackW/2;const r=svgEl("rect",{x,y:top,width:blackW,height:blackH,class:"black-key","data-key":note.key,tabindex:"0",role:"button","aria-label":`Key ${note.key}`});attachPress(r,note.key);svg.appendChild(r);const label=svgEl("text",{x:x+blackW/2,y:14,class:"key-number"});label.textContent=note.key;svg.appendChild(label);});
}
function attachPress(node,key){
  node.addEventListener("pointerdown",e=>{e.preventDefault();node.setPointerCapture?.(e.pointerId);startKey(key);});
  node.addEventListener("pointerup",()=>stopKey(key));
  node.addEventListener("pointercancel",()=>stopKey(key));
  node.addEventListener("lostpointercapture",()=>stopKey(key));
  node.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&!e.repeat){e.preventDefault();startKey(key);}});
  node.addEventListener("keyup",e=>{if(e.key==="Enter"||e.key===" ")stopKey(key);});
  node.addEventListener("blur",()=>stopKey(key));
}
function startKey(key){
  stopKey(activeKey,false);const item=sounds[key-1];if(!item)return;activeKey=key;
  document.querySelectorAll("#keyboard [data-key]").forEach(n=>n.classList.toggle("active",Number(n.dataset.key)===key));
  title.textContent=item.title;
  title.hidden=false;
  stage.hidden=true;image.removeAttribute("src");
  image.onload=()=>{if(activeKey===key){stage.hidden=false;}};
  image.onerror=()=>{if(activeKey===key){stage.hidden=true;}};
  image.src=item.image;
  audio.pause();audio.currentTime=0;
  let source;

const cyclingPools = {
  18: 27,
  61: 10,
  73: 6
};

if (cyclingPools[key]) {
  const count = cyclingPools[key];
  let choice;

  do {
    choice = Math.floor(Math.random() * count) + 1;
  } while (choice === lastCyclingSound[key]);

  lastCyclingSound[key] = choice;

  source = `assets/audio/${key}/${choice}.mp3`;
} else {
  source = altMode ? item.altAudio : item.audio;
}
  audio.src=source;
  audio.play().catch(()=>{});
}
function stopKey(key,reset=true){
  if(key==null||key!==activeKey)return;
  audio.pause();audio.currentTime=0;activeKey=null;
  document.querySelectorAll("#keyboard [data-key]").forEach(n=>n.classList.remove("active"));
  stage.hidden=true;image.removeAttribute("src");
  if(reset){title.textContent="";title.hidden=true;}
}
altButton.addEventListener("click",()=>{altMode=!altMode;altButton.setAttribute("aria-pressed",String(altMode));altButton.textContent=altMode?"MAIN SOUND":"ALT SOUND";if(activeKey!==null)stopKey(activeKey);});
fetch("sounds.json").then(r=>{if(!r.ok)throw new Error("Could not load sounds.json");return r.json();}).then(data=>{sounds=data;buildKeyboard();}).catch(()=>{title.textContent="";title.hidden=true;});

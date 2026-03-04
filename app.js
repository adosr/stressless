const circle = document.getElementById("circle");
const display = document.getElementById("display");
const controls = document.getElementById("controls");
const stopBtn = document.getElementById("stopBtn");
const startBtn = document.getElementById("startBtn");
const info = document.getElementById("sessionInfo");
const slider = document.getElementById("amount");
const sliderValue = document.getElementById("amount-value");
const select = document.getElementById("mode");

let running = false;
let lang = navigator.language.startsWith("ar") ? "ar" : "en";

if(lang === "ar"){
document.documentElement.lang = "ar";
document.documentElement.dir = "rtl";
}

const text = {
en:{
start:"Start",
stop:"Stop",
inhale:"Inhale",
hold:"Hold",
exhale:"Exhale",
ready:"Ready",
finished:"Session Complete",
remaining:"Remaining Time",
cycle:"Cycle",
time:"Time (Minutes)",
cycles:"Cycles"
},
ar:{
start:"ابدأ",
stop:"إيقاف",
inhale:"شهيق",
hold:"ثبات",
exhale:"زفير",
ready:"استعد",
finished:"انتهى التمرين",
remaining:"الوقت المتبقي",
cycle:"الدورة",
time:"الوقت (دقائق)",
cycles:"الدورات"
}
};

display.innerText = text[lang].start;
startBtn.innerText = text[lang].start;
stopBtn.innerText = text[lang].stop;

for (let option of select.options) {
   if (text[lang][option.value]) {
    option.innerText = text[lang][option.value];
   }
}

sliderValue.innerText = slider.value;
slider.oninput = () => sliderValue.innerText = slider.value;

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function countdown(){
for(let i=3;i>0;i--){
display.innerText=i;
await wait(700);
await wait(300);
}
display.innerText=text[lang].ready;
await wait(800);
}

async function phase(name,seconds,scale,cycle,totalCycles,startTime,totalTime){
circle.classList.add("breathing");
circle.style.transitionDuration=seconds+"s";
circle.style.transform=`scale(${scale})`;

for(let i=seconds;i>0;i--){
display.innerText=`${name} ${i}`;

if(totalTime){
let remain=Math.max(totalTime-Math.floor((Date.now()-startTime)/1000),0);
info.innerText=`${text[lang].remaining}: ${remain}s`;
}else{
info.innerText=`${text[lang].cycle} ${cycle}/${totalCycles}`;
}

await wait(1000);
if(!running) return false;
}
return true;
}

async function start(){
if(running) return;

running=true;
controls.classList.add("hidden");
stopBtn.classList.remove("hidden");

await countdown();

const [inhale,hold,exhale]=document.getElementById("exercise").value.split(",").map(Number);
const mode=document.getElementById("mode").value;
const amount=parseInt(slider.value);

let cycles=0;
let totalCycles=null;
let totalTime=null;
let startTime=Date.now();

if(mode==="time"){ totalTime=amount*60; }
else{ totalCycles=amount; }

while(running){
if(totalTime && (Date.now()-startTime)/1000>=totalTime) break;
if(totalCycles && cycles>=totalCycles) break;

cycles++;

if(!await phase(text[lang].inhale,4,1.8,cycles,totalCycles,startTime,totalTime)) break;
if(!await phase(text[lang].hold,hold,1.8,cycles,totalCycles,startTime,totalTime)) break;
if(!await phase(text[lang].exhale,exhale,1,cycles,totalCycles,startTime,totalTime)) break;
}

stop();
}

function stop(){
running=false;
controls.classList.remove("hidden");
stopBtn.classList.add("hidden");
display.innerText=text[lang].finished;
info.innerText="";
circle.style.transform="scale(1)";
circle.classList.remove("breathing");
}

startBtn.addEventListener("click",start);
stopBtn.addEventListener("click",stop);

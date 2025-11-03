// ------------------ سلايدر (يقرأ الصور تلقائياً) ------------------
// الأسلوب: نحاول تحميل صور بأسماء شائعة تلقائياً داخل مجلد images/
// لو الصور موجودة بأي من الأنماط التالية: pic1.jpg, pic2.jpg, 1.jpg, img1.jpg, photo1.jpg
// السكربت يجرب مجموعة قواعد حتى 30 صورة ويحسب الناجح فقط.
// (تقدر تستخدم أي اسماء لكن يُفضل تسمية الصور بطريقة متسلسلة لتسريع العثور)

const slideImg = document.getElementById('slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const possiblePatterns = [
(n)=>`images/pic${n}.jpg`,
(n)=>`images/pic${n}.jpeg`,
(n)=>`images/${n}.jpg`,
(n)=>`images/img${n}.jpg`,
(n)=>`images/photo${n}.jpg`,
(n)=>`images/${n}.png`,
(n)=>`images/pic${n}.png`,
(n)=>`images/${n}.webp`
];

let imgs = [];
let idx = 0;



// ضبط توقيت مصر (UTC+2)
function getEgyptTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const egyptOffset = 2 * 60 * 60000; // +2 ساعات
    return new Date(utc + egyptOffset);
}

const startDate = new Date("2024-11-29T00:00:00");

function updateCountdown() {
    const now = getEgyptTime();
    let diff = now - startDate;
    if (diff < 0) diff = 0;

    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const days = remainingDaysAfterYears % 30;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const minutes = Math.floor(diff / (1000 * 60)) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    let text = "";
    if (years > 0) text += `<span>${years} سنة،</span> `;
    text += `<span>${months} شهر،</span> <span>${days} يوم،</span> <span>${hours} ساعة،</span> <span>${minutes} دقيقة،</span> <span>${seconds} ثانية</span>`;

    document.getElementById("countdown").innerHTML = text;
}

setInterval(updateCountdown, 1000);
updateCountdown();




// حاول نحمّل صورة ونشوف إذا كانت موجودة
function testImage(url){
return new Promise((res)=> {
const i = new Image();
i.onload = () => res(true);
i.onerror = () => res(false);
i.src = url;
});
}

// ابحث تلقائياً (حتى 30 ملف) بأخر 3 ثواني تحميل كحد أقصى
async function autoDiscoverImages(){
const maxTry = 30;
for (let n=1; n<=maxTry; n++){
for (const p of possiblePatterns){
    const url = p(n);
    // نختبر الصورة
    // ملاحظة: لو تفتح الملفات محلياً (file://) بعض المتصفحات تمنع onerror/load صحيح،
    // الحل المضمون هو فتح المشروع عبر simple server (مثلاً Live Server في VSCode)
    // لكن السكربت سيعمل في معظم الحالات المحلية والـ hosting.
    // نختبر بصبر بسيط
    // eslint-disable-next-line no-await-in-loop
    const ok = await testImage(url);
    if (ok && !imgs.includes(url)) imgs.push(url);
}
}

if (imgs.length === 0){
// لو مفيش صور مُكتشفة – بنعرض صورة افتراضية (placeholder)
imgs = ["images/placeholder.jpg"];
}
// اظهر الصورة الأولى
slideImg.style.opacity = 0;
setTimeout(()=> { slideImg.src = imgs[0]; slideImg.style.opacity = 1; }, 200);
}
autoDiscoverImages();

// التنقل
function showIndex(i){
idx = (i + imgs.length) % imgs.length;
slideImg.style.opacity = 0;
setTimeout(()=> { slideImg.src = imgs[idx]; slideImg.style.opacity = 1; }, 220);
}
function nextSlide(){ showIndex(idx+1) }
function prevSlide(){ showIndex(idx-1) }

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// تبديل تلقائي كل 4 ثواني
let autoTimer = setInterval(nextSlide, 4000);
document.querySelector('.slide-frame').addEventListener('mouseenter', ()=> clearInterval(autoTimer));
document.querySelector('.slide-frame').addEventListener('mouseleave', ()=> { clearInterval(autoTimer); autoTimer = setInterval(nextSlide,4000); });

// ------------------ العداد الزمني ------------------
function updateTimer(){
const start = new Date("2023-11-29T00:00:00");
const now = new Date();
const diff = now - start;
const days = Math.floor(diff / (1000*60*60*24));
const hours = Math.floor((diff/(1000*60*60))%24);
const mins = Math.floor((diff/(1000*60))%60);
const secs = Math.floor((diff/1000)%60);
const el = document.getElementById('time');
if (el) el.textContent = `${days} Days ${hours} Hours ${mins} Minutes ${secs} Seconds`;
}
setInterval(updateTimer, 1000);
updateTimer();

// ------------------ ضمان تشغيل الصوت على الموبايل ------------------
// بعض متصفحات الموبايل تمنع autoplay حتى يتفاعل المستخدم.
// نحاول تشغيل لو المحرك محتاج تفاعل:
const bgm = document.getElementById('bgm');
function ensureAudioPlay(){
if (bgm && bgm.paused) {
const playPromise = bgm.play();
if (playPromise !== undefined) {
    playPromise.catch(()=> {
    // سيعمل عند أول ضغطة من المستخدم (مثلاً على السلايدر أو أي زر)
    // ننشئ حدث لتشغيل أول تفاعل
    const resume = ()=>{
        bgm.play().catch(()=>{});
        window.removeEventListener('click', resume);
    };
    window.addEventListener('click', resume);
    });
}
}
}
ensureAudioPlay();

$(document).ready(function() {
    setTimeout(function() {
        firstQuestion();
        $('.spinner').fadeOut();
        $('#preloader').delay(350).fadeOut('slow');
        $('body').delay(350).css({ 'overflow': 'visible' });
    }, 600);
});

function init(){
    $('#title').text(CONFIG.title);
    $('#desc').text(CONFIG.desc);
    $('#yes').text(CONFIG.btnYes);
    $('#no').text(CONFIG.btnNo);
}

// ============================================================
// SHATTER EFFECT — Hiệu ứng vỡ mảnh khi đóng popup
// ============================================================
function shatterAndRemove(overlayId, _unused, cb) {
    var overlay = document.getElementById(overlayId);
    if (!overlay) { if(cb) cb(); return; }

    var wrap = overlay.querySelector('[id$="-wrap"]') || overlay.firstElementChild;
    if (!wrap) { overlay.remove(); if(cb) cb(); return; }

    var rect = wrap.getBoundingClientRect();
    var W = rect.width, H = rect.height;
    if (W < 1 || H < 1) { overlay.remove(); if(cb) cb(); return; }

    var sc = document.createElement('canvas');
    sc.width = W; sc.height = H;
    sc.style.cssText = 'position:fixed;left:'+rect.left+'px;top:'+rect.top+'px;width:'+W+'px;height:'+H+'px;pointer-events:none;z-index:999999;';
    document.body.appendChild(sc);
    var sctx = sc.getContext('2d');

    sctx.fillStyle = 'rgba(5,5,30,0.92)';
    sctx.fillRect(0, 0, W, H);
    sctx.strokeStyle = 'rgba(0,200,255,0.6)';
    sctx.lineWidth = 2;
    sctx.strokeRect(1, 1, W-2, H-2);

    overlay.style.visibility = 'hidden';

    var COLS = 8, ROWS = 6;
    var pw = W / COLS, ph = H / ROWS;
    var pieces = [];
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            var sx = c * pw, sy = r * ph;
            var cx = sx + pw/2, cy = sy + ph/2;
            var dx = cx - W/2, dy = cy - H/2;
            var dist = Math.sqrt(dx*dx + dy*dy) || 1;
            var speed = 4 + Math.random() * 8;
            pieces.push({
                sx: sx, sy: sy, x: cx, y: cy,
                vx: (dx/dist) * speed + (Math.random()-0.5)*3,
                vy: (dy/dist) * speed + (Math.random()-0.5)*3 - 2,
                gravity: 0.4 + Math.random()*0.3,
                rot: 0, rotSpeed: (Math.random()-0.5) * 0.25,
                alpha: 1, pw: pw, ph: ph
            });
        }
    }

    var startTime = null;
    var duration = 600;

    function animShatter(ts) {
        if (!startTime) startTime = ts;
        var elapsed = ts - startTime;
        var progress = Math.min(elapsed / duration, 1);
        sctx.clearRect(0, 0, W, H);
        for (var i = 0; i < pieces.length; i++) {
            var p = pieces[i];
            p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.rot += p.rotSpeed;
            p.alpha = 1 - progress;
            sctx.save();
            sctx.globalAlpha = Math.max(0, p.alpha);
            sctx.translate(p.x, p.y);
            sctx.rotate(p.rot);
            sctx.fillStyle = 'rgba(5,5,30,0.92)';
            sctx.fillRect(-p.pw/2, -p.ph/2, p.pw, p.ph);
            sctx.strokeStyle = 'rgba(0,200,255,0.8)';
            sctx.lineWidth = 1;
            sctx.strokeRect(-p.pw/2, -p.ph/2, p.pw, p.ph);
            sctx.restore();
        }
        if (progress < 1) requestAnimationFrame(animShatter);
        else { sc.remove(); overlay.remove(); if (cb) cb(); }
    }
    requestAnimationFrame(animShatter);
}
// ============================================================
// SHARED: Dual neon border + tuyết rơi
// ============================================================
function startNeonSnow(wrap, canvas, ctx) {
    var angle = 0, snowflakes = [], SNOW_COUNT = 35;
    var animId;
    function initSnow(w, h) {
        snowflakes = [];
        for (var i = 0; i < SNOW_COUNT; i++) {
            snowflakes.push({
                x: Math.random() * w, y: Math.random() * h,
                r: 1 + Math.random() * 2.5, speed: 0.4 + Math.random() * 0.8,
                drift: (Math.random() - 0.5) * 0.4, alpha: 0.4 + Math.random() * 0.5
            });
        }
    }
    function draw() {
        var w = wrap.offsetWidth, h = wrap.offsetHeight;
        if (w < 1 || h < 1) { animId = requestAnimationFrame(draw); return; }
        canvas.width = w; canvas.height = h;
        if (snowflakes.length === 0) initSnow(w, h);
        ctx.clearRect(0, 0, w, h);
        var pos = (angle/360) * (2*(w+h));
        ctx.strokeStyle = 'hsl('+(angle%360)+',100%,65%)';
        ctx.lineWidth = 5; ctx.shadowBlur = 20; ctx.shadowColor = 'cyan';
        ctx.setLineDash([150, 800]); ctx.lineDashOffset = -pos;
        ctx.strokeRect(0, 0, w, h);
        
        ctx.save();
        for (var i = 0; i < snowflakes.length; i++) {
            var s = snowflakes[i];
            s.y += s.speed; s.x += s.drift;
            if (s.y > h) s.y = 0;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
            ctx.fillStyle = 'rgba(200,230,255,' + s.alpha + ')'; ctx.fill();
        }
        ctx.restore();
        angle = (angle + 1.5) % 360;
        animId = requestAnimationFrame(draw);
    }
    draw();
    return { id: function(){ return animId; } };
}

// ============================================================
// VHS GLITCH: Hiệu ứng nhiễu ảnh
// ============================================================
function startVhsGlitch(imgId, canvasId) {
    var img = document.getElementById(imgId);
    var cv = document.getElementById(canvasId);
    if (!img || !cv) return;
    var ctx = cv.getContext('2d');
    var glitching = false;
    function triggerGlitch() {
        glitching = true;
        setTimeout(function() { glitching = false; ctx.clearRect(0, 0, cv.width, cv.height); schedule(); }, 400);
    }
    function schedule() { setTimeout(triggerGlitch, 2000 + Math.random() * 3000); }
    function draw() {
        if (glitching && img.complete) {
            cv.width = img.offsetWidth; cv.height = img.offsetHeight;
            ctx.drawImage(img, (Math.random()-0.5)*10, 0, cv.width, cv.height);
            ctx.fillStyle = "rgba(255,0,0,0.1)"; ctx.fillRect(0,0,cv.width,cv.height);
        }
        requestAnimationFrame(draw);
    }
    img.complete ? (schedule(), draw()) : img.addEventListener('load', function(){ schedule(); draw(); });
}
// ============================================================
// POPUP 1: Intro
// ============================================================
function firstQuestion(){
    $('body').css('overflow', 'hidden');
    $('#wrapper, header, #yes, #no, .inner-width, center, p, span[id^="a"], #chaffle-title, #slider, footer, #demo-1, #demo-2, #demo-3').hide();
    
    var style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Jura:wght@500&display=swap');
        #glitch-overlay { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(5,5,30,0.8); padding: 16px; }
        #glitch-wrap { position: relative; width: 100%; max-width: 560px; animation: gPopIn 0.6s both; }
        #glitch-box { position: relative; background: rgba(5, 5, 30, 0.95); padding: 32px 24px; text-align: center; border-radius: 6px; box-shadow: 0 0 20px rgba(0,200,255,0.2); }
        .g-avatar-wrap { position: relative; width: 100%; max-width: 400px; aspect-ratio: 1/1; margin: 0 auto 20px; overflow: hidden; border: 1.5px solid #0cf; }
        .g-avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .g-greeting { font-family: 'Orbitron', sans-serif; font-size: 18px; color: #fff; margin-bottom: 10px; }
        .g-btn { padding: 12px 38px; font-family: 'Orbitron', sans-serif; color: #fff; background: transparent; border: 1.5px solid #0cf; cursor: pointer; }
        @keyframes gPopIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    `;
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'glitch-overlay';
    overlay.innerHTML = `
        <div id="glitch-wrap">
            <canvas id="glitch-canvas" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:20;"></canvas>
            <div id="glitch-box">
                <div class="g-avatar-wrap"><img id="g1-img" src="https://manhhung1606.github.io/manhhung/Save = Follow♡「Hương 」♡.jpeg"><canvas id="g1-glitch-cv" style="position:absolute; inset:0;"></canvas></div>
                <div class="g-greeting" id="g-typeText"></div>
                <div class="g-greeting" id="g-sub-scramble" style="font-size:14px; opacity:0.8; margin-bottom:20px;"></div>
                <button class="g-btn" id="g-btn-ok">${CONFIG.btnIntro}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    startNeonSnow(document.getElementById('glitch-wrap'), document.getElementById('glitch-canvas'), document.getElementById('glitch-canvas').getContext('2d'));
    startVhsGlitch('g1-img', 'g1-glitch-cv');

    $('#g-typeText').text(CONFIG.introTitle);
    $('#g-sub-scramble').text(CONFIG.introDesc);

    $('#g-btn-ok').click(function() { shatterAndRemove('glitch-overlay', null, afterFirstPopup); });
}

// ============================================================
// POPUP 2: Question (Fix Firefox)
// ============================================================
function showGlitchPopup2() {
    var style2 = document.createElement('style');
    style2.textContent = `
        #g2-overlay { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,40,0.7); padding: 16px; }
        #g2-wrap { position: relative; width: 100%; max-width: 560px; animation: gPopIn 0.6s both; }
        #g2-box { background: rgba(5, 5, 30, 0.95); padding: 32px 24px; text-align: center; border-radius: 6px; }
        .g2-title { font-family: 'Orbitron', sans-serif; font-size: 20px; color: #fff; margin-bottom: 20px; }
        .g2-input {
            display: block !important; width: 100% !important; height: 50px !important;
            margin: 20px 0 !important; padding: 0 16px !important;
            background: rgba(0, 10, 40, 0.9) !important; border: 1.5px solid #0cf !important;
            color: #fff !important; font-family: 'Jura', sans-serif !important; font-size: 16px !important;
            line-height: normal !important; box-sizing: border-box !important; outline: none !important;
        }
        .g2-input::-moz-placeholder { line-height: 50px !important; color: rgba(255,255,255,0.5); }
        .g2-input::placeholder { line-height: 50px !important; }
        .g2-btn { width: 100%; padding: 12px; font-family: 'Orbitron', sans-serif; font-size: 18px; color: #fff; background: transparent; border: 1.5px solid #0cf; cursor: pointer; }
    `;
    document.head.appendChild(style2);

    var overlay2 = document.createElement('div');
    overlay2.id = 'g2-overlay';
    overlay2.innerHTML = `
        <div id="g2-wrap">
            <canvas id="g2-canvas" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:20;"></canvas>
            <div id="g2-box">
                <div class="g2-avatar-wrap"><img id="g2-img" src="https://manhhung1606.github.io/manhhung/Save = Follow♡「Hương 」♡.jpeg"><canvas id="g2-glitch-cv" style="position:absolute; inset:0;"></canvas></div>
                <div class="g2-title">${CONFIG.question}</div>
                <input type="text" class="g2-input" id="txtReason" oninput="textGenerate()" placeholder="Viết gì cũng được...">
                <button class="g2-btn" id="g2-btn-send">${CONFIG.btnReply}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay2);
    startNeonSnow(document.getElementById('g2-wrap'), document.getElementById('g2-canvas'), document.getElementById('g2-canvas').getContext('2d'));
    startVhsGlitch('g2-img', 'g2-glitch-cv');

    $('#g2-btn-send').click(function() { shatterAndRemove('g2-overlay', null, showGlitchPopup3); });
}
// ============================================================
// POPUP 3: Final (Full ảnh & hiệu ứng)
// ============================================================
function showGlitchPopup3() {
    var style3 = document.createElement('style');
    style3.textContent = `
        #g3-overlay { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,40,0.7); padding: 16px; }
        #g3-wrap { position: relative; width: 100%; max-width: 560px; animation: gPopIn 0.6s both; }
        #g3-box { background: rgba(5,5,30,0.95); padding: 32px 24px; text-align: center; border-radius: 6px; }
        .g3-msg { font-family: 'Share Tech Mono', monospace; font-size: 22px; color: #0cf; margin-bottom: 24px; }
        .g3-btn { width: 100%; padding: 12px; font-family: 'Orbitron', sans-serif; color: #fff; background: transparent; border: 1.5px solid #0cf; cursor: pointer; }
    `;
    document.head.appendChild(style3);

    var overlay3 = document.createElement('div');
    overlay3.id = 'g3-overlay';
    overlay3.innerHTML = `
        <div id="g3-wrap">
            <canvas id="g3-canvas" style="position:absolute; inset:0; width:100%; height:100%; pointer-events:none; z-index:20;"></canvas>
            <div id="g3-box">
                <div class="g3-avatar-wrap">
                    <img id="g3-img" src="https://manhhung1606.github.io/manhhung/1777441906182.png">
                    <canvas id="g3-glitch-cv" style="position:absolute; inset:0;"></canvas>
                </div>
                <div style="font-size: 30px; margin-bottom: 10px;">${CONFIG.mess}</div>
                <div class="g3-msg">${CONFIG.messDesc}</div>
                <button class="g3-btn" id="g3-btn-ok">${CONFIG.btnAccept}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay3);
    startNeonSnow(document.getElementById('g3-wrap'), document.getElementById('g3-canvas'), document.getElementById('g3-canvas').getContext('2d'));
    startVhsGlitch('g3-img', 'g3-glitch-cv');

    $('#g3-btn-ok').click(function() { 
        shatterAndRemove('g3-overlay', null, function() { if (CONFIG.messLink) window.location = CONFIG.messLink; });
    });
}

// ============================================================
// LOGIC CƠ BẢN
// ============================================================
function textGenerate() {
    var text = CONFIG.reply;
    var val = $('#txtReason').val();
    $('#txtReason').val(text.substring(0, val.length));
    if (val.length > text.length) $('#txtReason').val("");
}

function afterFirstPopup() {
    $('#wrapper, header, #yes, #no, .inner-width, center, p, #chaffle-title, footer').show();
    if (typeof playMusic === 'function') playMusic();
}

function moveButton() {
    var audio = new Audio('https://manhhung1606.github.io/manhhung/Cau-noi-ao-that-day-kha-banh-www_tiengdong_com.mp3');
    audio.play();
    var x = Math.random() * ($(window).width() - $('#no').width()) * 0.9;
    var y = Math.random() * ($(window).height() - $('#no').height()) * 0.3;
    $('#no').css({ left: x + 'px', top: y + 'px' });
}

var n = 0;
$('#no').mousemove(function() {
    if (n < 1) { 
        var l = $('#no').css("left"), t = $('#no').css("top");
        $('#no').css({ left: $('#yes').css("left"), top: $('#yes').css("top") });
        $('#yes').css({ left: l, top: t });
    } else moveButton();
    n++;
});

$('#yes').click(function() { showGlitchPopup2(); });

init();

$(document).ready(function() {
    setTimeout(function() {
        firstQuestion();
        $('.spinner').fadeOut();
        $('#preloader').delay(350).fadeOut('slow');
        $('body').delay(350).css({ 'overflow': 'visible' });
    }, 600);
})

function init(){
    $('#title').text(CONFIG.title)
    $('#desc').text(CONFIG.desc)
    $('#yes').text(CONFIG.btnYes)
    $('#no').text(CONFIG.btnNo)
}

// ============================================================
// SHATTER EFFECT — dùng chung cho mọi popup
// canvas: element canvas, targetEl: wrap cần vỡ, cb: callback
// ============================================================
function shatterAndRemove(overlayId, _unused, cb) {
    var overlay = document.getElementById(overlayId);
    if (!overlay) { if(cb) cb(); return; }

    var wrap = overlay.querySelector('[id$="-wrap"]') || overlay.firstElementChild;
    if (!wrap) { overlay.remove(); if(cb) cb(); return; }

    // Chụp snapshot của wrap
    var rect = wrap.getBoundingClientRect();
    var W = rect.width, H = rect.height;
    if (W < 1 || H < 1) { overlay.remove(); if(cb) cb(); return; }

    // Tạo canvas vỡ mảnh
    var sc = document.createElement('canvas');
    sc.width = W; sc.height = H;
    sc.style.cssText = 'position:fixed;left:'+rect.left+'px;top:'+rect.top+'px;width:'+W+'px;height:'+H+'px;pointer-events:none;z-index:999999;';
    document.body.appendChild(sc);
    var sctx = sc.getContext('2d');

    // Vẽ nền đơn giản (snapshot màu) — tránh lỗi cross-origin với canvas neon bên trong
    sctx.fillStyle = 'rgba(5,5,30,0.92)';
    sctx.fillRect(0, 0, W, H);
    // Vẽ border neon giả
    sctx.strokeStyle = 'rgba(0,200,255,0.6)';
    sctx.lineWidth = 2;
    sctx.strokeRect(1, 1, W-2, H-2);

    // Ẩn overlay gốc ngay
    overlay.style.visibility = 'hidden';

    // Tạo mảnh vỡ
    var COLS = 8, ROWS = 6;
    var pw = W / COLS, ph = H / ROWS;
    var pieces = [];
    for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
            var sx = c * pw, sy = r * ph;
            // Mỗi mảnh: vị trí tâm, vận tốc bay, xoay
            var cx = sx + pw/2, cy = sy + ph/2;
            // Hướng bay từ tâm màn hình ra
            var dx = cx - W/2, dy = cy - H/2;
            var dist = Math.sqrt(dx*dx + dy*dy) || 1;
            var speed = 4 + Math.random() * 8;
            pieces.push({
                sx: sx, sy: sy,
                x: cx, y: cy,
                vx: (dx/dist) * speed + (Math.random()-0.5)*3,
                vy: (dy/dist) * speed + (Math.random()-0.5)*3 - 2,
                gravity: 0.4 + Math.random()*0.3,
                rot: 0,
                rotSpeed: (Math.random()-0.5) * 0.25,
                alpha: 1,
                pw: pw, ph: ph
            });
        }
    }

    // Animate mảnh vỡ
    var startTime = null;
    var duration = 600;

    function animShatter(ts) {
        if (!startTime) startTime = ts;
        var elapsed = ts - startTime;
        var progress = Math.min(elapsed / duration, 1);

        sctx.clearRect(0, 0, W, H);

        var allDone = true;
        for (var i = 0; i < pieces.length; i++) {
            var p = pieces[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.rot += p.rotSpeed;
            p.alpha = 1 - progress;
            if (p.alpha > 0) allDone = false;

            sctx.save();
            sctx.globalAlpha = Math.max(0, p.alpha);
            sctx.translate(p.x, p.y);
            sctx.rotate(p.rot);
            // Vẽ mảnh: fill + neon border
            sctx.fillStyle = 'rgba(5,5,30,0.92)';
            sctx.fillRect(-p.pw/2, -p.ph/2, p.pw, p.ph);
            sctx.strokeStyle = 'rgba(0,200,255,0.8)';
            sctx.lineWidth = 1;
            sctx.strokeRect(-p.pw/2, -p.ph/2, p.pw, p.ph);
            // Đường crack
            sctx.strokeStyle = 'rgba(0,220,255,0.5)';
            sctx.lineWidth = 0.5;
            sctx.beginPath();
            sctx.moveTo(-p.pw/2, -p.ph/4);
            sctx.lineTo(p.pw/4, p.ph/2);
            sctx.stroke();
            sctx.restore();
        }

        if (progress < 1) {
            requestAnimationFrame(animShatter);
        } else {
            sc.remove();
            overlay.remove();
            if (cb) cb();
        }
    }
    requestAnimationFrame(animShatter);
}

function firstQuestion(){
    $('body').css('overflow', 'hidden');
    $('#wrapper, header, #yes, #no, .inner-width, center, p, span[id^="a"], #chaffle-title, #slider, footer, #demo-1, #demo-2, #demo-3').hide();
    $('.leaf').remove();

    // CSS chung
    var style = document.createElement('style');
    style.id = 'glitch-main-style';
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');

        #glitch-overlay {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Share Tech Mono', monospace;
            padding: 16px;
        }

        #glitch-wrap {
            position: relative;
            border-radius: 8px;
            width: 100%;
            max-width: 560px;
            animation: gPopIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes gPopIn {
            from { transform: scale(0.7) translateY(30px); opacity: 0; }
            to   { transform: scale(1) translateY(0); opacity: 1; }
        }

        #glitch-canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border-radius: 8px;
            pointer-events: none;
            z-index: 20;
        }

        #glitch-box {
            position: relative;
            width: 100%;
            background: rgba(5, 5, 30, 0.92);
            border-radius: 6px;
            padding: 32px 24px 28px;
            text-align: center;
            box-shadow: inset 0 0 40px rgba(0,50,150,0.15);
        }

        /* ── VHS GLITCH cho ảnh ── */
        .g-avatar-wrap {
            position: relative;
            width: 100%;
            max-width: 500px;
            aspect-ratio: 1 / 1;
            margin: 0 auto 22px;
            z-index: 3;
            overflow: hidden;
            border-radius: 3px;
            /* Neon nhỏ cho khung ảnh bên trong */
            box-shadow: 0 0 0 1.5px rgba(0,200,255,0.5),
                        0 0 8px 2px rgba(0,200,255,0.3),
                        inset 0 0 6px rgba(0,200,255,0.15);
            animation: innerNeonPulse 2.5s ease-in-out infinite;
        }
        @keyframes innerNeonPulse {
            0%,100% { box-shadow: 0 0 0 1.5px rgba(0,200,255,0.5), 0 0 8px 2px rgba(0,200,255,0.3), inset 0 0 6px rgba(0,200,255,0.15); }
            50%     { box-shadow: 0 0 0 1.5px rgba(180,0,255,0.5), 0 0 10px 3px rgba(180,0,255,0.3), inset 0 0 8px rgba(180,0,255,0.15); }
        }
        .g-avatar-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            border-radius: 3px;
            animation: vhsGlitch 4s infinite;
        }
        /* Canvas overlay vẽ glitch VHS lên ảnh */
        .g-glitch-canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 4;
            border-radius: 3px;
        }
        @keyframes vhsGlitch {
            0%,88%,100% { filter: none; transform: translate(0,0); }
            89% { filter: hue-rotate(90deg) saturate(2); transform: translate(-3px,0) skewX(-1deg); }
            90% { filter: hue-rotate(180deg) saturate(3) brightness(1.3); transform: translate(3px,0); }
            91% { filter: none; transform: translate(0,0); }
            94% { filter: hue-rotate(270deg) saturate(2); transform: translate(-2px,1px) skewX(2deg); }
            95% { filter: none; transform: translate(0,0); }
        }

        /* FIX 1: greeting không wrap lộn */
        .g-greeting {
            position: relative;
            z-index: 3;
            font-family: 'Orbitron', sans-serif;
            font-size: 18px;
            font-weight: 900;
            color: #fff;
            text-shadow: 0 0 8px rgba(0,200,255,0.8), 0 0 20px rgba(0,150,255,0.4);
            animation: gTextGlitch 4s infinite;
            line-height: 1.5;
            margin-bottom: 10px;
            word-break: break-word;
            white-space: pre-wrap;
        }
        @keyframes gTextGlitch {
            0%,85%,100% { text-shadow:0 0 8px rgba(0,200,255,0.8),0 0 20px rgba(0,150,255,0.4); transform:translate(0,0); }
            86% { text-shadow:-2px 0 #f03,2px 0 #0cf; transform:translate(-1px,0); }
            87% { text-shadow:2px 0 #f03,-2px 0 #0cf; transform:translate(2px,0); }
            88% { text-shadow:0 0 8px rgba(0,200,255,0.8); transform:translate(0,0); }
            92% { text-shadow:-3px 0 #f03,3px 0 #0cf; transform:translate(1px,0); }
            93% { text-shadow:0 0 8px rgba(0,200,255,0.8); transform:translate(0,0); }
        }

        .g-sub {
            position: relative;
            z-index: 3;
            font-family: 'Orbitron', sans-serif;
            font-size: 18px;
            font-weight: 900;
            color: #fff;
            text-shadow: 0 0 8px rgba(0,200,255,0.8), 0 0 20px rgba(0,150,255,0.4);
            letter-spacing: 1px;
            line-height: 1.5;
            margin-bottom: 24px;
            word-break: break-word;
        }
        @keyframes gBlink { 0%,100%{opacity:0.85} 50%{opacity:0.4} }

        .g-cursor {
            display: inline-block;
            width: 2px; height: 1em;
            background: #0cf;
            margin-left: 2px;
            vertical-align: middle;
            animation: gCursorBlink 0.8s steps(1) infinite;
        }
        @keyframes gCursorBlink { 0%,50%{opacity:1} 51%,100%{opacity:0} }

        .g-btn {
            position: relative;
            z-index: 3;
            display: inline-block;
            padding: 12px 38px;
            font-family: 'Orbitron', sans-serif;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 2px;
            color: #fff;
            background: transparent;
            border: 1.5px solid rgba(0,170,255,0.3);
            border-radius: 2px;
            cursor: pointer;
            text-transform: uppercase;
            overflow: hidden;
            transition: color 0.2s;
            margin-bottom: 0;
        }
        .g-btn:hover { color: #0df; }
    `;
    document.head.appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'glitch-overlay';
    overlay.innerHTML = `
        <div id="glitch-wrap">
            <canvas id="glitch-canvas"></canvas>
            <div id="glitch-box">
                <div class="g-avatar-wrap" id="g1-avatar-wrap">
                    <img id="g1-img" src="https://manhhung1606.github.io/manhhung/Save = Follow♡「Hương 」♡.jpeg"
                         onerror="this.style.background='linear-gradient(135deg,#1a1a4e,#0d0d2b)'"
                         alt="Mạnh Hùng">
                    <canvas class="g-glitch-canvas" id="g1-glitch-cv"></canvas>
                </div>
                <div class="g-greeting"><span id="g-typeText"></span></div>
                <div class="g-sub" id="g-sub-scramble"></div>
                <button class="g-btn" id="g-btn-ok">${CONFIG.btnIntro}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Neon border canvas
    var wrap = document.getElementById('glitch-wrap');
    var canvas = document.getElementById('glitch-canvas');
    var ctx = canvas.getContext('2d');
    var animId;

    animId = startNeonSnow(wrap, canvas, ctx);

    // VHS Glitch canvas cho ảnh popup1
    startVhsGlitch('g1-img', 'g1-glitch-cv');

    // Scramble effect dùng chung cho cả 2 dòng
    function startScramble(targetText, element, delayMs) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&!?';
        var revealed = 0;
        var total = targetText.length;
        var frame = 0;
        var revealEvery = 3;
        var intervalMs = 40;
        function step() {
            if (revealed >= total) {
                element.textContent = targetText;
                return;
            }
            var display = targetText.slice(0, revealed);
            for (var i = revealed; i < total; i++) {
                display += targetText[i] === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)];
            }
            element.textContent = display;
            frame++;
            if (frame % revealEvery === 0) revealed++;
            setTimeout(step, intervalMs);
        }
        setTimeout(step, delayMs);
    }

    // Dòng 1 — introTitle, bắt đầu ngay
    startScramble(CONFIG.introTitle, document.getElementById('g-typeText'), 700);
    // Dòng 2 — introDesc, bắt đầu sau dòng 1 chút
    startScramble(CONFIG.introDesc, document.getElementById('g-sub-scramble'), 700);

    // click ra ngoài → vỡ mảnh
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            cancelAnimationFrame(animId.id());
            shatterAndRemove('glitch-overlay', null, function() {
                afterFirstPopup();
            });
        }
    });

    // Bấm nút OK → vỡ mảnh
    document.getElementById('g-btn-ok').addEventListener('click', function() {
        cancelAnimationFrame(animId.id());
        shatterAndRemove('glitch-overlay', null, function() {
            afterFirstPopup();
        });
    });
}

// ============================================================
// SHARED: Dual neon border (2 tia đối xứng) + tuyết rơi
// ============================================================
function startNeonSnow(wrap, canvas, ctx) {
    var angle = 0;
    var snowflakes = [];
    var SNOW_COUNT = 35;
    var prevW = 0, prevH = 0;
    var animId;

    function initSnow(w, h) {
        snowflakes = [];
        for (var i = 0; i < SNOW_COUNT; i++) {
            snowflakes.push({
                x: Math.random() * w,
                y: Math.random() * h,
                r: 1 + Math.random() * 2.5,
                speed: 0.4 + Math.random() * 0.8,
                drift: (Math.random() - 0.5) * 0.4,
                alpha: 0.4 + Math.random() * 0.5
            });
        }
    }

    function makePath(w, h, r) {
        var p = new Path2D();
        p.moveTo(r,0); p.lineTo(w-r,0); p.arcTo(w,0,w,r,r);
        p.lineTo(w,h-r); p.arcTo(w,h,w-r,h,r);
        p.lineTo(r,h); p.arcTo(0,h,0,h-r,r);
        p.lineTo(0,r); p.arcTo(0,0,r,0,r);
        p.closePath();
        return p;
    }

    function draw() {
        var w = wrap.offsetWidth, h = wrap.offsetHeight;
        if (w < 1 || h < 1) { animId = requestAnimationFrame(draw); return; }
        canvas.width = w; canvas.height = h;
        if (w !== prevW || h !== prevH) { initSnow(w, h); prevW = w; prevH = h; }

        ctx.clearRect(0, 0, w, h);
        var r = 8, perimeter = 2*(w+h), tailLen = perimeter * 0.18;
        var path = makePath(w, h, r);

        // Viền nền mờ
        ctx.save();
        ctx.strokeStyle = 'rgba(0,200,255,0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke(path);
        ctx.restore();

        // Tia 1 — chạy xuôi
        var pos1 = (angle/360) * perimeter;
        var hue1 = (angle * 3) % 360;
        ctx.save();
        ctx.strokeStyle = 'hsl('+hue1+',100%,65%)';
        ctx.lineWidth = 5;
        ctx.shadowColor = 'hsl('+hue1+',100%,70%)';
        ctx.shadowBlur = 30;
        ctx.setLineDash([tailLen, perimeter - tailLen]);
        ctx.lineDashOffset = -pos1;
        ctx.stroke(path);
        ctx.restore();

        // Tia 2 — đối xứng 180°, màu bổ sung
        var pos2 = ((angle + 180)/360) * perimeter;
        var hue2 = (hue1 + 160) % 360;
        ctx.save();
        ctx.strokeStyle = 'hsl('+hue2+',100%,65%)';
        ctx.lineWidth = 5;
        ctx.shadowColor = 'hsl('+hue2+',100%,70%)';
        ctx.shadowBlur = 30;
        ctx.setLineDash([tailLen, perimeter - tailLen]);
        ctx.lineDashOffset = -pos2;
        ctx.stroke(path);
        ctx.restore();

        // Tuyết rơi bên trong popup
        ctx.save();
        for (var i = 0; i < snowflakes.length; i++) {
            var s = snowflakes[i];
            s.y += s.speed;
            s.x += s.drift;
            if (s.y > h + s.r) { s.y = -s.r; s.x = Math.random() * w; }
            if (s.x > w + s.r) s.x = -s.r;
            if (s.x < -s.r) s.x = w + s.r;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200,230,255,' + s.alpha + ')';
            ctx.fill();
        }
        ctx.restore();

        angle = (angle + 1.2) % 360;
        animId = requestAnimationFrame(draw);
    }

    draw();
    return { id: function(){ return animId; } };
}

// ============================================================
// VHS GLITCH: RGB split + scanline displacement trên canvas ảnh
// ============================================================
function startVhsGlitch(imgId, canvasId) {
    var img = document.getElementById(imgId);
    var cv = document.getElementById(canvasId);
    if (!img || !cv) return;

    var ctx = cv.getContext('2d');
    var glitching = false;
    var glitchTimer = null;
    var rafId;

    function scheduleGlitch() {
        // Glitch ngẫu nhiên mỗi 2-5 giây
        var delay = 2000 + Math.random() * 3000;
        glitchTimer = setTimeout(function() {
            triggerGlitch();
        }, delay);
    }

    function triggerGlitch() {
        glitching = true;
        var duration = 300 + Math.random() * 400;
        setTimeout(function() {
            glitching = false;
            ctx.clearRect(0, 0, cv.width, cv.height);
            scheduleGlitch();
        }, duration);
    }

    function draw() {
        var w = img.offsetWidth, h = img.offsetHeight;
        if (w < 1 || h < 1 || !img.complete) { rafId = requestAnimationFrame(draw); return; }
        cv.width = w; cv.height = h;

        if (!glitching) { rafId = requestAnimationFrame(draw); return; }

        ctx.clearRect(0, 0, w, h);

        // Vẽ ảnh gốc làm nền
        try { ctx.drawImage(img, 0, 0, w, h); } catch(e) { rafId = requestAnimationFrame(draw); return; }

        // Tạo scan lines bị lệch (horizontal slice displacement)
        var numSlices = 6 + Math.floor(Math.random() * 8);
        for (var i = 0; i < numSlices; i++) {
            var sy = Math.floor(Math.random() * h);
            var sh = Math.floor(4 + Math.random() * 20);
            if (sy + sh > h) sh = h - sy;
            var offsetX = (Math.random() - 0.5) * 30;

            // Kênh R — lệch trái
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.6;
            // clip vùng slice
            ctx.beginPath();
            ctx.rect(0, sy, w, sh);
            ctx.clip();
            // vẽ ảnh lệch + tint đỏ
            ctx.drawImage(img, offsetX - 6, 0, w, h);
            ctx.fillStyle = 'rgba(255,0,60,0.35)';
            ctx.fillRect(0, sy, w, sh);
            ctx.restore();

            // Kênh B — lệch phải
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.45;
            ctx.beginPath();
            ctx.rect(0, sy, w, sh);
            ctx.clip();
            ctx.drawImage(img, offsetX + 6, 0, w, h);
            ctx.fillStyle = 'rgba(0,200,255,0.35)';
            ctx.fillRect(0, sy, w, sh);
            ctx.restore();
        }

        // Scan line overlay nhẹ
        ctx.save();
        ctx.globalAlpha = 0.07;
        for (var y = 0; y < h; y += 3) {
            ctx.fillStyle = 'rgba(0,0,0,1)';
            ctx.fillRect(0, y, w, 1);
        }
        ctx.restore();

        // Noise ngang trắng random
        if (Math.random() < 0.4) {
            var ny = Math.floor(Math.random() * h);
            ctx.save();
            ctx.globalAlpha = 0.5 + Math.random() * 0.4;
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillRect(0, ny, w, 1 + Math.floor(Math.random() * 2));
            ctx.restore();
        }

        rafId = requestAnimationFrame(draw);
    }

    // Đợi ảnh load xong rồi bắt đầu
    if (img.complete && img.naturalWidth > 0) {
        scheduleGlitch();
        draw();
    } else {
        img.addEventListener('load', function() {
            scheduleGlitch();
            draw();
        });
    }
}

function afterFirstPopup() {
    $('#chaffle-title').css('visibility', 'visible');
    $('#wrapper, header, #yes, #no, .inner-width, center, p, span[id^="a"], #chaffle-title, #slider, footer, #demo-1, #demo-2, #demo-3').show(200);
    $('#demo-1, #demo-2, #demo-3').css('opacity', '1');
    if (typeof window.startTextEffect === 'function') {
        window.startTextEffect();
    }
    setTimeout(function() {
        if (typeof playMusic === 'function') playMusic();
    }, 800);
}

// switch button position
function switchButton() {
    var audio = new Audio('https://manhhung1606.github.io/manhhung/Cau-noi-ao-that-day-kha-banh-www_tiengdong_com.mp3');
    audio.play();
    var leftNo = $('#no').css("left");
    var topNO = $('#no').css("top");
    var leftY = $('#yes').css("left");
    var topY = $('#yes').css("top");
    $('#no').css("left", leftY);
    $('#no').css("top", topY);
    $('#yes').css("left", leftNo);
    $('#yes').css("top", topNO);
}

function moveButton() {
    var audio = new Audio('https://manhhung1606.github.io/manhhung/Cau-noi-ao-that-day-kha-banh-www_tiengdong_com.mp3');
    audio.play();
    var x = Math.random() * ($(window).width() - $('#no').width()) * 0.9;
    var y = Math.random() * ($(window).height() - $('#no').height()) * 0.3;
    $('#no').css("left", x + 'px');
    $('#no').css("top", y + 'px');
}

init();

var n = 0;
$('#no').mousemove(function() {
    if (n < 1) switchButton();
    if (n > 1) moveButton();
    n++;
});
$('#no').click(() => {
    if (screen.width >= 900) switchButton();
})

function textGenerate() {
    var n = "";
    var text = " " + CONFIG.reply;
    var a = Array.from(text);
    var textVal = $('#txtReason').val() ? $('#txtReason').val() : "";
    var count = textVal.length;
    if (count > 0) {
        for (let i = 1; i <= count; i++) {
            n = n + a[i];
            if (i == text.length + 1) {
                $('#txtReason').val("");
                n = "";
                break;
            }
        }
    }
    $('#txtReason').val(n);
    setTimeout("textGenerate()", 1);
}

$('#yes').click(function() {
    var audio = new Audio('https://hungdeptrai.com');
    audio.play();
    showGlitchPopup2();
})

function showGlitchPopup2() {
    var style2 = document.getElementById('glitch-style2');
    if (!style2) {
        style2 = document.createElement('style');
        style2.id = 'glitch-style2';
        style2.textContent = `
            #g2-overlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                background: rgba(0,0,40,0.7);
            }
            #g2-wrap {
                position: relative;
                border-radius: 8px;
                width: 100%;
                max-width: 560px;
                animation: gPopIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
            }
            #g2-canvas {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                border-radius: 8px;
                pointer-events: none;
                z-index: 20;
            }
            #g2-box {
                position: relative;
                width: 100%;
                background: rgba(5, 5, 30, 0.92);
                border-radius: 6px;
                padding: 32px 24px 28px;
                text-align: center;
                box-shadow: inset 0 0 40px rgba(0,50,150,0.15);
            }
            #g2-box::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 6px;
                background: repeating-linear-gradient(
                    0deg, transparent, transparent 2px,
                    rgba(0,200,255,0.03) 2px, rgba(0,200,255,0.03) 4px
                );
                pointer-events: none;
                z-index: 2;
            }
            /* ảnh popup2 — VHS glitch + neon khung nhỏ */
            .g2-avatar-wrap {
                position: relative;
                width: 100%;
                max-width: 320px;
                aspect-ratio: 1 / 1;
                margin: 0 auto 20px;
                z-index: 3;
                overflow: hidden;
                border-radius: 3px;
                box-shadow: 0 0 0 1.5px rgba(0,200,255,0.5),
                            0 0 8px 2px rgba(0,200,255,0.3),
                            inset 0 0 6px rgba(0,200,255,0.15);
                animation: innerNeonPulse 2.5s ease-in-out infinite;
            }
            .g2-avatar-wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                border-radius: 3px;
                animation: vhsGlitch 4s infinite;
            }
            .g2-glitch-canvas {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 4;
                border-radius: 3px;
            }
            .g2-title {
                position: relative;
                z-index: 3;
                font-family: 'Orbitron', sans-serif;
                font-size: 20px;
                font-weight: 900;
                color: #fff;
                text-shadow: 0 0 8px rgba(0,200,255,0.8), 0 0 20px rgba(0,150,255,0.4);
                animation: gTextGlitch 4s infinite;
                margin-bottom: 20px;
                word-break: break-word;
                line-height: 1.4;
            }
            .g2-input {
                position: relative;
                z-index: 3;
                width: 100%;
                padding: 12px 16px;
                font-family: 'Share Tech Mono', monospace;
                font-size: 12px;
                color: #0cf;
                background: rgba(0,10,40,0.8);
                border: 1.5px solid rgba(0,170,255,0.3);
                border-radius: 3px;
                outline: none;
                margin-bottom: 0;
                box-sizing: border-box;
            }
            .g2-input::placeholder { color: rgba(250,250,250,0.35); text-shadow: 0 0 0.5em rgba(0,255,255,0.3); }
            .g2-input:focus { border-color: #0ff; }
            .g2-btn {
                position: relative;
                z-index: 3;
                display: inline-block;
                padding: 12px 38px;
                font-family: 'Orbitron', sans-serif;
                font-size: 20px;
                font-weight: 700;
                letter-spacing: 2px;
                color: #fff;
                background: transparent;
                border: 1.5px solid rgba(0,170,255,0.3);
                border-radius: 2px;
                cursor: pointer;
                text-transform: uppercase;
                transition: color 0.2s;
                width: 100%;
                margin-bottom: 0;
            }
            .g2-btn:hover { color: #0df; }
        `;
        document.head.appendChild(style2);
    }

    var overlay2 = document.createElement('div');
    overlay2.id = 'g2-overlay';
    overlay2.innerHTML = `
        <div id="g2-wrap">
            <canvas id="g2-canvas"></canvas>
            <div id="g2-box">
                <div class="g2-avatar-wrap" id="g2-avatar-wrap">
                    <img id="g2-img" src="https://manhhung1606.github.io/manhhung/Save = Follow♡「Hương 」♡.jpeg"
                         onerror="this.style.background='linear-gradient(135deg,#1a1a4e,#0d0d2b)'"
                         alt="Mạnh Hùng">
                    <canvas class="g2-glitch-canvas" id="g2-glitch-cv"></canvas>
                </div>
                <div class="g2-title">${CONFIG.question}</div>
                <input type="text" class="g2-input" id="txtReason" onmousemove="textGenerate()" placeholder=" Viết gì cũng được... ">
                <button class="g2-btn" id="g2-btn-send">${CONFIG.btnReply}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay2);

    // Neon border
    var wrap2 = document.getElementById('g2-wrap');
    var canvas2 = document.getElementById('g2-canvas');
    var ctx2 = canvas2.getContext('2d');
    var animId2;
    animId2 = startNeonSnow(wrap2, canvas2, ctx2);
    startVhsGlitch('g2-img', 'g2-glitch-cv');

    // Click ra ngoài → chỉ vỡ mảnh đóng lại, KHÔNG mở popup sau
    overlay2.addEventListener('click', function(e) {
        if (e.target === overlay2) {
            cancelAnimationFrame(animId2.id());
            shatterAndRemove('g2-overlay', null, null);
        }
    });

    // Bấm Send → vỡ mảnh rồi mới mở popup3
    document.getElementById('g2-btn-send').addEventListener('click', function() {
        cancelAnimationFrame(animId2.id());
        shatterAndRemove('g2-overlay', null, function() {
            showGlitchPopup3();
        });
    });
}

function showGlitchPopup3() {
    var style3 = document.getElementById('glitch-style3');
    if (!style3) {
        style3 = document.createElement('style');
        style3.id = 'glitch-style3';
        style3.textContent = `
            #g3-overlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                background: rgba(0,0,40,0.7);
            }
            #g3-wrap {
                position: relative;
                border-radius: 8px;
                width: 100%;
                max-width: 560px;
                animation: gPopIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275) both;
            }
            #g3-canvas {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                border-radius: 8px;
                pointer-events: none;
                z-index: 20;
            }
            #g3-box {
                position: relative;
                width: 100%;
                background: rgba(5,5,30,0.92);
                border-radius: 6px;
                padding: 32px 24px 28px;
                text-align: center;
                box-shadow: inset 0 0 40px rgba(0,50,150,0.15);
            }
            .g3-avatar-wrap {
                position: relative;
                width: 100%;
                max-width: 320px;
                aspect-ratio: 1 / 1;
                margin: 0 auto 20px;
                z-index: 3;
                overflow: hidden;
                border-radius: 3px;
                box-shadow: 0 0 0 1.5px rgba(0,200,255,0.5),
                            0 0 8px 2px rgba(0,200,255,0.3),
                            inset 0 0 6px rgba(0,200,255,0.15);
                animation: innerNeonPulse 2.5s ease-in-out infinite;
            }
            .g3-avatar-wrap img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                border-radius: 3px;
                animation: vhsGlitch 4s infinite;
            }
            .g3-glitch-canvas {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 4;
                border-radius: 3px;
            }
            .g3-emoji {
                font-size: 36px;
                margin-bottom: 12px;
                z-index: 3;
                position: relative;
            }
            .g3-msg {
                font-family: 'Share Tech Mono', monospace;
                font-size: 25px;
                color: #0cf;
                margin-bottom: 24px;
                z-index: 3;
                position: relative;
                word-break: break-word;
                line-height: 1.5;
            }
            .g3-btn {
                position: relative;
                z-index: 3;
                display: inline-block;
                padding: 12px 38px;
                font-family: 'Orbitron', sans-serif;
                font-size: 20px;
                font-weight: 700;
                letter-spacing: 2px;
                color: #fff;
                background: transparent;
                border: 1.5px solid rgba(0,170,255,0.3);
                border-radius: 2px;
                cursor: pointer;
                text-transform: uppercase;
                transition: color 0.2s;
                width: 100%;
                margin-bottom: 0;
            }
            .g3-btn:hover { color: #0df; }
        `;
        document.head.appendChild(style3);
    }

    var overlay3 = document.createElement('div');
    overlay3.id = 'g3-overlay';
    overlay3.innerHTML = `
        <div id="g3-wrap">
            <canvas id="g3-canvas"></canvas>
            <div id="g3-box">
                <div class="g3-avatar-wrap" id="g3-avatar-wrap">
                    <img id="g3-img" src="https://manhhung1606.github.io/manhhung/1777441906182.png"
                         onerror="this.style.background='linear-gradient(135deg,#1a1a4e,#0d0d2b)'"
                         alt="Popup 3 Image">
                    <canvas class="g3-glitch-canvas" id="g3-glitch-cv"></canvas>
                </div>
                <div class="g3-emoji">${CONFIG.mess}</div>
                <div class="g3-msg" id="g3-msg-el">${CONFIG.messDesc}</div>
                <button class="g3-btn" id="g3-btn-ok">${CONFIG.btnAccept}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay3);

    var wrap3 = document.getElementById('g3-wrap');
    var canvas3 = document.getElementById('g3-canvas');
    var ctx3 = canvas3.getContext('2d');
    var animId3;
    animId3 = startNeonSnow(wrap3, canvas3, ctx3);
    startVhsGlitch('g3-img', 'g3-glitch-cv');

    // click ra ngoài → vỡ mảnh
    overlay3.addEventListener('click', function(e) {
        if (e.target === overlay3) {
            cancelAnimationFrame(animId3.id());
            shatterAndRemove('g3-overlay', null, function() {
                if (CONFIG.messLink) window.location = CONFIG.messLink;
            });
        }
    });

    document.getElementById('g3-btn-ok').addEventListener('click', function() {
        cancelAnimationFrame(animId3.id());
        shatterAndRemove('g3-overlay', null, function() {
            if (CONFIG.messLink) window.location = CONFIG.messLink;
        });
    });
}

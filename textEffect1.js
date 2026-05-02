const lines = [
    "Tháng năm vẫn vậy...",
    "Nhưng con người thì đã đổi thay...",
    "Chỉ có những kỉ niệm là còn mãi..."
];

// Tạo lá tim rơi
function createLeaf() {
    const leaf = document.createElement('div');
    leaf.classList.add('leaf');
    leaf.innerHTML = '❤️';
    leaf.style.top = Math.random() * 100 + 'vh';
    leaf.style.fontSize = (Math.random() * 20 + 10) + 'px';
    leaf.style.animationDuration = (Math.random() * 3 + 2) + 's';
    leaf.style.opacity = Math.random() * 0.7 + 0.3;
    document.body.appendChild(leaf);
    setTimeout(() => leaf.remove(), 6000);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Render chữ vào element, bay vào từ phải
function renderLine(elId, text) {
    return new Promise(resolve => {
        const el = document.getElementById(elId);
        el.innerHTML = '';
        el.style.opacity = 1;

        for (let char of text) {
            const span = document.createElement('span');
            span.classList.add('fly-char');
            span.textContent = char === ' ' ? '\u00A0' : char;
            el.appendChild(span);
        }

        const spans = el.querySelectorAll('.fly-char');
        spans.forEach((span, i) => {
            setTimeout(() => {
                span.classList.add('landed');
            }, 40 + i * 70);
        });

        const landDuration = 40 + (text.length - 1) * 70 + 750;
        setTimeout(resolve, landDuration);
    });
}

// Từng ký tự bay sang trái kiểu lá — xoay + lắc lư ngẫu nhiên
function flyLineLeft(elId) {
    return new Promise(resolve => {
        const el = document.getElementById(elId);
        const spans = el.querySelectorAll('.fly-char');

        spans.forEach((span, i) => {
            setTimeout(() => {
                // Random hoá từng ký tự như lá rơi
                const rot1 = (Math.random() * 40 - 20) + 'deg';
                const rot2 = (Math.random() * 40 - 20) + 'deg';
                const rot3 = (Math.random() * 60 - 30) + 'deg';
                const y1   = (Math.random() * 24 - 12) + 'px';
                const y2   = (Math.random() * 24 - 12) + 'px';
                const y3   = (Math.random() * 30 - 15) + 'px';
                const dur  = (0.9 + Math.random() * 0.5).toFixed(2) + 's';

                span.style.setProperty('--fly-rot1', rot1);
                span.style.setProperty('--fly-rot2', rot2);
                span.style.setProperty('--fly-rot3', rot3);
                span.style.setProperty('--fly-y1', y1);
                span.style.setProperty('--fly-y2', y2);
                span.style.setProperty('--fly-y3', y3);
                span.style.setProperty('--fly-duration', dur);
                span.style.setProperty('--fly-delay', '0s');

                span.classList.remove('landed');
                span.classList.add('fly-left');
            }, i * 45);
        });

        const flyDuration = (spans.length - 1) * 45 + 1300;
        setTimeout(resolve, flyDuration);
    });
}

function clearLine(elId) {
    document.getElementById(elId).innerHTML = '';
}

async function startLoop() {
    const ids = ['demo-1', 'demo-2', 'demo-3'];

    while (true) {
        // Dòng 1 bay vào, đứng yên 2s
        await renderLine(ids[0], lines[0]);
        await delay(2000);

        // Dòng 1 bay trái + dòng 2 bay vào CÙNG LÚC
        const [, ] = await Promise.all([
            flyLineLeft(ids[0]),
            renderLine(ids[1], lines[1])
        ]);
        clearLine(ids[0]);
        await delay(2000);

        // Dòng 2 bay trái + dòng 3 bay vào CÙNG LÚC
        await Promise.all([
            flyLineLeft(ids[1]),
            renderLine(ids[2], lines[2])
        ]);
        clearLine(ids[1]);
        await delay(2000);

        // Dòng 3 bay trái rồi reset
        await flyLineLeft(ids[2]);
        clearLine(ids[2]);
        await delay(1200);
    }
}

// === Hàm để main.js gọi từ bên ngoài ===
window.startTextEffect = function() {
    setInterval(createLeaf, 400);
    startLoop();
};

window.stopTextEffect = function() {
    document.querySelectorAll('#demo-1, #demo-2, #demo-3').forEach(el => {
        el.style.opacity = '0';
    });
    $('.leaf').remove();
};

// Khởi tạo ban đầu: Ẩn hết
window.addEventListener('load', function () {
    stopTextEffect();
});

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

// Render chữ vào element, trả về Promise resolve sau khi tất cả chữ đã landed
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

        // Resolve sau khi chữ cuối đã landed
        const landDuration = 40 + (text.length - 1) * 70 + 750;
        setTimeout(resolve, landDuration);
    });
}

// Bay tất cả chữ sang trái, từng chữ lần lượt
function flyLineLeft(elId) {
    return new Promise(resolve => {
        const el = document.getElementById(elId);
        const spans = el.querySelectorAll('.fly-char');
        spans.forEach((span, i) => {
            setTimeout(() => {
                span.classList.remove('landed');
                span.classList.add('fly-left');
            }, i * 40);
        });
        // Resolve sau khi chữ cuối bay xong
        const flyDuration = (spans.length - 1) * 40 + 600;
        setTimeout(resolve, flyDuration);
    });
}

// Xóa nội dung element
function clearLine(elId) {
    const el = document.getElementById(elId);
    el.innerHTML = '';
}

async function startLoop() {
    const ids = ['demo-1', 'demo-2', 'demo-3'];

    while (true) {
        // Đứng yên 2s sau khi dòng 1 hiện xong
        await renderLine(ids[0], lines[0]);
        await delay(2000);

        // Dòng 1 bắt đầu bay trái → dòng 2 bắt đầu bay vào CÙNG LÚC
        const fly1 = flyLineLeft(ids[0]);
        const render2 = renderLine(ids[1], lines[1]);
        await Promise.all([fly1, render2]);
        clearLine(ids[0]);

        await delay(2000);

        // Dòng 2 bắt đầu bay trái → dòng 3 bắt đầu bay vào CÙNG LÚC
        const fly2 = flyLineLeft(ids[1]);
        const render3 = renderLine(ids[2], lines[2]);
        await Promise.all([fly2, render3]);
        clearLine(ids[1]);

        await delay(2000);

        // Dòng 3 bay trái rồi reset
        await flyLineLeft(ids[2]);
        clearLine(ids[2]);

        await delay(1200);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

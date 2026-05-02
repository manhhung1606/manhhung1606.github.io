const lines = [
    "Tháng năm vẫn vậy...",
    "Nhưng con người thì đã đổi thay...",
    "Chỉ có những kỉ niệm là còn mãi..."
];

// Tạo lá tim rơi
function createLeaf() {
    const leaf = document.createElement('div');
    leaf.classList.add('leaf');
    leaf.innerHTML = '🍂';
    leaf.style.top = Math.random() * 100 + 'vh';
    leaf.style.fontSize = (Math.random() * 20 + 10) + 'px';
    leaf.style.animationDuration = (Math.random() * 3 + 2) + 's';
    leaf.style.opacity = Math.random() * 0.7 + 0.3;
    document.body.appendChild(leaf);
    setTimeout(() => leaf.remove(), 6000);
}

// Hiển thị chữ bay (đã fix nhảy dòng + bay từng chữ)
function showLine(lineIndex, callback) {
    if (lineIndex >= lines.length) {
        if (callback) callback();
        return;
    }

    const demoIds = ['demo-1', 'demo-2', 'demo-3'];
    const el = document.getElementById(demoIds[lineIndex]);
    
    el.innerHTML = '';
    el.style.opacity = 1;
    el.style.margin = "0";
    el.style.padding = "0";
    el.style.lineHeight = "1";
    el.style.height = "auto";
    el.style.minHeight = "0";

    const text = lines[lineIndex];

    // Pre-render tất cả chữ trước để tránh nhảy dòng
    for (let char of text) {
        const span = document.createElement('span');
        span.classList.add('fly-char');
        span.textContent = char === ' ' ? '\u00A0' : char;
        el.appendChild(span);
    }

    // Bay từng chữ một
    const spans = el.querySelectorAll('.fly-char');
    spans.forEach((span, i) => {
        setTimeout(() => {
            span.classList.add('landed');
        }, 40 + i * 70);
    });

    // Chuyển sang dòng tiếp theo
    setTimeout(() => showLine(lineIndex + 1, callback), 800 + text.length * 70);
}

function fadeOutAll(callback) {
    const demoIds = ['demo-1', 'demo-2', 'demo-3'];
    demoIds.forEach(id => {
        const el = document.getElementById(id);
        el.style.transition = 'opacity 0.8s ease';
        el.style.opacity = 0;
    });
    setTimeout(callback, 900);
}

function startLoop() {
    showLine(0, function() {
        setTimeout(() => {
            fadeOutAll(() => {
                setTimeout(startLoop, 1200);
            });
        }, 2500);
    });
}

// === Hàm để main.js gọi từ bên ngoài ===
window.startTextEffect = function() {
    setInterval(createLeaf, 400);   // Bắt đầu rơi lá
    startLoop();                    // Bắt đầu chữ bay
};

window.stopTextEffect = function() {
    document.querySelectorAll('#demo-1, #demo-2, #demo-3').forEach(el => {
        el.style.opacity = '0';
    });
    $('.leaf').remove(); // xóa lá đang rơi
};

// Khởi tạo ban đầu: Ẩn hết
window.addEventListener('load', function () {
    stopTextEffect();
});

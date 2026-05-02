// Danh sách nhạc
const ManhHung_List = [
  "https://manhhung1606.github.io/manhhung/FDownloader.net-1802929510666143-(320kbps).mp3",
  "https://manhhung1606.github.io/manhhung/游京 - (唐伯虎 Annie) - Du Kinh Remix - Đường Bá Hổ Annie __ 悠悠的古城中 - Hot TikTok Douyin [3p2nUr5zuX4].mp3",
  "https://manhhung1606.github.io/manhhung/Nếu Ánh Trăng Không Đến Remix ( Dj QT FunkyHouse ) [RcmyYv_ZF8M].mp3",
  "https://manhhung1606.github.io/manhhung/Alan Walker - On My Way Remix ( Dj QT Mix ) [iG9FkRGu6Po].mp3",
  "https://manhhung1606.github.io/manhhung/Alan Walker - Play Remix ( Dj QT Mix ).mp3",
  "https://manhhung1606.github.io/manhhung/Everytime We Touch (Original Mix) - xxxCr3 _ 2022抖音最火的歌曲 _ Trending TikTok [TQ_oIxIDKTA].mp3",
  "https://manhhung1606.github.io/manhhung/One More Night Remix ( Dj QT Mix ) [BhI3vT23Wug].mp3",
  "https://manhhung1606.github.io/manhhung/Why Not Me Remix - Enrique Iglesias Remix.mp3",
  "https://manhhung1606.github.io/manhhung/The End Remix ( Dj QT Mix ) [2yA3_gmxeZY].mp3",
  "https://manhhung1606.github.io/manhhung/Alan Walker, Sabrina Carpenter & Farruko - On My Way (McYaoYao Remix V4) Chinese DJ 2020 🔥 [YzIilqoTnm4].mp3",
  "https://manhhung1606.github.io/manhhung/DnB - Feint - We Won t Be Alone (feat. Laura Brehm) Monstercat Release.mp3",
  "https://manhhung1606.github.io/manhhung/Edward Maya Vika Jigulina - Stereo Love (Jay Latune Remix).mp3",
  "https://manhhung1606.github.io/manhhung/Charlie Puth - One Call Away Official Video.mp3",
  "https://manhhung1606.github.io/manhhung/Daniel Powter - Free Loop (Official Music Video) [vEY_mg2y-rg].mp3",
  "https://manhhung1606.github.io/manhhung/M2M - The Day You Went Away.mp3",
  "https://manhhung1606.github.io/manhhung/Michael Learns To Rock - Take Me To Your Heart Official Video (with Lyrics Closed Caption).mp3",
  "https://manhhung1606.github.io/manhhung/Passenger - Let Her Go (Feat. Ed Sheeran - Anniversary Edition) Official Video.mp3",
  "https://manhhung1606.github.io/manhhung/SLANDER - Love Is Gone ft. Dylan Matthew (Acoustic).mp3",
  "https://manhhung1606.github.io/manhhung/So Far Away (Acoustic) - Martin Garrix David Guetta (Cover by Adam Christopher).mp3",
  "https://manhhung1606.github.io/manhhung/shayne_ward_no_promises_video_3739383572241379958.mp3"
];

// Tạo audio một lần
let currentIndex = 0;
const audio = new Audio(ManhHung_List[currentIndex]);

// Hàm phát nhạc - đọc lời chào trước, sau đó mới phát nhạc
function playMusic() {
  if ('speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance('Chào mừng bạn đến với website của Mạnh Hùng. Chúc bạn có những phút giây thư giãn thật vui vẻ.');
    msg.lang = 'vi-VN';
    msg.rate = 0.92;
    msg.onend = function () {
      audio.play().catch(err => console.log("Audio play error:", err));
    };
    // Phòng trường hợp speech bị treo
    setTimeout(function () {
      audio.play().catch(err => console.log("Audio play error:", err));
    }, 8000);
    window.speechSynthesis.speak(msg);
  } else {
    // FB WebView → phát nhạc luôn
    audio.play().catch(err => console.log("Audio play error:", err));
  }
}

// Khi nhạc kết thúc → chuyển bài tiếp theo
audio.addEventListener("ended", function() {
  currentIndex = (currentIndex + 1) % ManhHung_List.length;
  audio.src = ManhHung_List[currentIndex];
  audio.play().catch(err => console.log("Audio play error:", err));
});

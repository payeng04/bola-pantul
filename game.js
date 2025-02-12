// ukuran papan permainan
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

// ukuran balok pemain
let playerWidth = 80;
let playerHeight = 10;

let player = {
    x: boardWidth / 2 - playerWidth / 2, // Posisi awal pemain di tengah
    y: boardHeight - playerHeight - 5, // Ditempatkan sedikit di atas dasar papan
    width: playerWidth,
    height: playerHeight
};

// ukuran bola
let ballRadius = 5;
let ballVelocityX = 3;
let ballVelocityY = 2;

let ball = {
    x: boardWidth / 2, // Posisi awal bola di tengah papan
    y: boardHeight / 2,
    radius: ballRadius,
    velocityX: ballVelocityX,
    velocityY: ballVelocityY
};

// ukuran blok (batu bata)
let blockArray = [];
let blockWidth = 20; // mengatur ukuran blok 
let blockHeight = 10;
let blockColumns = 8; // mengatur banyak balok ke samping
let blockRows = 2; // mengatur jumlah minimal balok
let blockMaxRows = 10; // mengatur jumlah maksimal balok
let blockCount = 0;

// Variabel untuk skor dan level
let level = 1;
let score = 0;
let gameOver = false;

// Mengatur posisi awal blok supaya lebih ke tengah
let blockX = 130;
let blockY = 45;

// Ketika halaman dimuat, jalankan permainan
window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    requestAnimationFrame(update); // Jalankan fungsi update terus-menerus
    document.addEventListener("mousemove", movePlayer); // Deteksi pergerakan mouse

    createBlocks(); // Buat blok untuk pertama kali
};

// Fungsi utama untuk menggambar ulang elemen-elemen permainan
function update() {
    requestAnimationFrame(update);
    if (gameOver) return; // Jika game over, hentikan update

    context.clearRect(0, 0, board.width, board.height); // Hapus gambar lama sebelum menggambar ulang

    // Gambar paddle pemain
    context.fillStyle = "lightgreen";
    context.fillRect(player.x, player.y, player.width, player.height);

    // Gambar bola
    context.fillStyle = "white";
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fill();
    context.closePath();

    // Gerakan bola
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Cek apakah bola menyentuh paddle
    if (topCollision(ball, player)) {
        ball.velocityY *= -1;
    }

    // Cek apakah bola menyentuh dinding atas
    if (ball.y - ball.radius <= 0) {
        ball.velocityY *= -1;
    }

    // Cek apakah bola menyentuh dinding kiri atau kanan
    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= boardWidth) {
        ball.velocityX *= -1;
    }

    // Cek apakah bola jatuh ke bawah (Game Over)
    if (ball.y + ball.radius >= boardHeight) {
        context.font = "20px sans-serif";
        context.fillText("Game Over: Click to Restart", 120, 400);
        gameOver = true;
    }

    // Gambar blok dan cek apakah ada yang terkena bola
    context.fillStyle = "skyblue";
    for (let i = 0; i < blockArray.length; i++) {
        let block = blockArray[i];
        if (!block.break) {
            if (topCollision(ball, block)) { // Jika bola menyentuh blok
                block.break = true; // Tandai blok sebagai hancur
                ball.velocityY *= -1; // Ubah arah bola
                score += 100; // Tambah skor
                blockCount -= 1; // Kurangi jumlah blok yang tersisa
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    // Jika semua blok habis, naik ke level berikutnya
    if (blockCount === 0) {
        level++;
        score += 100 * blockRows * blockColumns; // Tambah skor sesuai jumlah blok
        blockRows = Math.min(blockRows + 1, blockMaxRows); // Tambah jumlah baris blok (maksimal 10)
        ball.velocityX *= 1.1; // Tambah kecepatan bola
        ball.velocityY *= 1.1;
        createBlocks(); // Buat blok baru
    }

    // Tampilkan skor dan level di layar
    context.font = "20px sans-serif";
    context.fillStyle = "red"; // Warna skor merah
    context.fillText("Score: " + score, 10, 25);
    
    context.fillStyle = "white"; // Warna level tetap putih
    context.fillText("Level: " + level, 400, 25);
}

// Fungsi untuk menggerakkan paddle mengikuti posisi mouse
function movePlayer(event) {
    let rect = board.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    player.x = Math.max(0, Math.min(mouseX - player.width / 2, boardWidth - player.width));
}

// Fungsi untuk mendeteksi tabrakan antara bola dan objek lainnya
function detectCollision(ball, block) {
    return ball.x - ball.radius < block.x + block.width &&
        ball.x + ball.radius > block.x &&
        ball.y - ball.radius < block.y + block.height &&
        ball.y + ball.radius > block.y;
}

// Fungsi untuk cek apakah bola mengenai bagian atas objek
function topCollision(ball, block) {
    return detectCollision(ball, block) && ball.y + ball.radius >= block.y;
}

// Fungsi untuk membuat blok di posisi yang telah diatur
function createBlocks() {
    blockArray = [];
    for (let c = 0; c < blockColumns; c++) {
        for (let r = 0; r < blockRows; r++) {
            let block = {
                x: blockX + c * (blockWidth + 10), // Atur posisi blok horizontal
                y: blockY + r * (blockHeight + 10), // Atur posisi blok vertikal
                width: blockWidth,
                height: blockHeight,
                break: false // Status blok belum hancur
            };
            blockArray.push(block);
        }
    }
    blockCount = blockArray.length; // Hitung jumlah blok yang ada
}

// Jika permainan game over, klik untuk restart
document.addEventListener("click", function () {
    if (gameOver) resetGame();
});

// Fungsi untuk mengatur ulang permainan setelah game over
function resetGame() {
    gameOver = false;
    level = 1;
    player.x = boardWidth / 2 - playerWidth / 2; // Kembalikan paddle ke tengah
    ball.x = boardWidth / 2; // Kembalikan bola ke tengah
    ball.y = boardHeight / 2;
    ball.velocityX = ballVelocityX; // Reset kecepatan bola ke awal
    ball.velocityY = ballVelocityY;
    blockRows = 3; // Reset jumlah baris blok ke awal
    score = 0; // Reset skor ke 0
    createBlocks(); // Buat ulang blok
}
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let gameRunning = false;
let items = [];
let spawnRate = 60; // Frames between spawns
let frameCount = 0;

// Assets
const basketImg = new Image(); basketImg.src = 'assets/game-basket.png';
const heartImg = new Image(); heartImg.src = 'assets/game-heart.png';
const starImg = new Image(); starImg.src = 'assets/game-star.png';
const cloudImg = new Image(); cloudImg.src = 'assets/game-cloud.png';

// Player
const player = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 100,
    width: 80,
    height: 80,
    speed: 7
};

// Controls
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Touch support for mobile
canvas.addEventListener('touchmove', touchHandler, {passive: false});

function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") rightPressed = true;
    else if(e.key == "Left" || e.key == "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight") rightPressed = false;
    else if(e.key == "Left" || e.key == "ArrowLeft") leftPressed = false;
}

function touchHandler(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    
    player.x = touchX - player.width / 2;
}

function startGame() {
    score = 0;
    items = [];
    gameRunning = true;
    document.getElementById('startGameBtn').style.display = 'none';
    document.getElementById('gameScore').innerText = 'Điểm: 0';
    update();
}

function update() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Initial resize if needed (simple responsive)
    if (canvas.width !== canvas.offsetWidth) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        player.y = canvas.height - 100; // Reset player Y
    }

    // Move Player
    if(rightPressed && player.x < canvas.width - player.width) player.x += player.speed;
    else if(leftPressed && player.x > 0) player.x -= player.speed;

    // Constrain Player
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

    // Draw Player
    ctx.drawImage(basketImg, player.x, player.y, player.width, player.height);

    // Spawn Items
    frameCount++;
    if (frameCount % spawnRate === 0) {
        spawnItem();
        if (spawnRate > 20) spawnRate--; // Increase difficulty
    }

    // Update & Draw Items
    for (let i = 0; i < items.length; i++) {
        let item = items[i];
        item.y += item.speed;

        // Draw
        let img = heartImg;
        if (item.type === 'star') img = starImg;
        if (item.type === 'cloud') img = cloudImg;
        
        ctx.drawImage(img, item.x, item.y, item.width, item.height);

        // Collaborative Logic
        // 1. Collision with Player
        if (item.y + item.height > player.y && 
            item.y < player.y + player.height &&
            item.x + item.width > player.x &&
            item.x < player.x + player.width) {
            
            if (item.type === 'cloud') {
                gameOver();
                return;
            } else {
                score += (item.type === 'star' ? 10 : 5);
                document.getElementById('gameScore').innerText = 'Điểm: ' + score;
                items.splice(i, 1);
                i--;
                continue;
            }
        }

        // 2. Off screen
        if (item.y > canvas.height) {
            items.splice(i, 1);
            i--;
        }
    }

    requestAnimationFrame(update);
}

function spawnItem() {
    const typeProb = Math.random();
    let type = 'heart';
    if (typeProb > 0.7) type = 'star'; // 30% star
    if (typeProb > 0.9) type = 'cloud'; // 10% cloud

    items.push({
        x: Math.random() * (canvas.width - 50),
        y: -50,
        width: 50,
        height: 50,
        speed: 3 + Math.random() * 2,
        type: type
    });
}

function gameOver() {
    gameRunning = false;
    ctx.font = "40px 'Pacifico'";
    ctx.fillStyle = "#555";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width/2, canvas.height/2);
    ctx.font = "20px 'Varela Round'";
    ctx.fillText("Điểm của bạn: " + score, canvas.width/2, canvas.height/2 + 40);
    
    document.getElementById('startGameBtn').innerText = 'Chơi lại';
    document.getElementById('startGameBtn').style.display = 'block';
    spawnRate = 60; // Reset difficulty
}

// Initial draw
basketImg.onload = () => {
    ctx.drawImage(basketImg, player.x, player.y, player.width, player.height);
};

// === SETUP ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

// === STATE ===
const state = {
    airplane: { x: canvas.width / 2 - 20, y: canvas.height - 60, width: 40, height: 40, speed: 5 },
    obstacles: [],
    particles: [],
    projectiles: [],
    gameOver: false,
    score: 0
};

// === INPUT ===
document.addEventListener("keydown", (event) => handleKeyPress(event, state));

function handleKeyPress(event, state) {
    if (event.key === "a" && state.airplane.x > 0) {
        state.airplane.x -= state.airplane.speed;
    } else if (event.key === "d" && state.airplane.x + state.airplane.width < canvas.width) {
        state.airplane.x += state.airplane.speed;
    } else if (event.key === " ") {
        fireProjectile(state);
    }
}

// === GAME LOOP ===
function gameLoop() {
    if (state.gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawAirplane(ctx, state.airplane);
    updateObstacles(ctx, state);
    updateProjectiles(ctx, state);
    updateParticles(ctx, state);

    requestAnimationFrame(gameLoop);
}

// === INIT ===
function initGame() {
    setInterval(() => spawnObstacle(state), 1000);
    requestAnimationFrame(gameLoop);
}

initGame();

// === DRAW FUNCTIONS ===
function drawAirplane(ctx, airplane) {
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(airplane.x + airplane.width / 2, airplane.y);
    ctx.lineTo(airplane.x, airplane.y + airplane.height);
    ctx.lineTo(airplane.x + airplane.width, airplane.y + airplane.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "gray";
    ctx.beginPath();
    ctx.moveTo(airplane.x - 10, airplane.y + airplane.height / 2);
    ctx.lineTo(airplane.x + airplane.width / 2, airplane.y + airplane.height / 3);
    ctx.lineTo(airplane.x + airplane.width + 10, airplane.y + airplane.height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "darkblue";
    let engineX = airplane.x + airplane.width / 3;
    let engineY = airplane.y + airplane.height;
    let engineW = airplane.width / 3;
    ctx.fillRect(engineX, engineY - 5, engineW, 10);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(engineX + engineW / 2, engineY + 5);
    ctx.lineTo(engineX + engineW / 2 + Math.random() * 10 - 5, engineY + 20);
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
        state.particles.push(spawnParticle(
            engineX + engineW / 2,
            engineY + 10,
            "orange",
            (Math.random() - 0.5) * 0.5,
            Math.random() * 1 + 1
        ));
    }
}

function drawObstacle(ctx, obstacle) {
    ctx.fillStyle = obstacle.color;
    ctx.beginPath();
    ctx.moveTo(obstacle.x, obstacle.y);
    ctx.lineTo(obstacle.x + obstacle.width * 0.8, obstacle.y + obstacle.height * 0.2);
    ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
    ctx.lineTo(obstacle.x + obstacle.width * 0.2, obstacle.y + obstacle.height * 0.8);
    ctx.closePath();
    ctx.fill();

    let fx = obstacle.x + obstacle.width / 2;
    let fy = obstacle.y;
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + Math.random() * 20 - 10, fy - 20);
    ctx.stroke();

    for (let i = 0; i < 2; i++) {
        state.particles.push(spawnParticle(
            fx,
            fy,
            "red",
            (Math.random() - 0.5) * 1.5,
            -Math.random() * 1.5 - 0.5
        ));
    }
}

// === UPDATE FUNCTIONS ===
function updateObstacles(ctx, state) {
    state.obstacles.forEach((obstacle, index) => {
        obstacle.y += 3;
        drawObstacle(ctx, obstacle);

        if (
            obstacle.x < state.airplane.x + state.airplane.width &&
            obstacle.x + obstacle.width > state.airplane.x &&
            obstacle.y < state.airplane.y + state.airplane.height &&
            obstacle.y + obstacle.height > state.airplane.y
        ) {
            state.gameOver = true;
            alert(`Game Over! Score: ${state.score}`);
            location.reload();
        }

        if (obstacle.y > canvas.height) {
            state.obstacles.splice(index, 1);
        }
    });
}

function updateProjectiles(ctx, state) {
    state.projectiles.forEach((projectile, pIndex) => {
        projectile.y -= projectile.speed;
        ctx.fillStyle = "black";
        ctx.fillRect(projectile.x, projectile.y, projectile.width, projectile.height);

        if (projectile.y < 0) {
            state.projectiles.splice(pIndex, 1);
        }

        state.obstacles.forEach((obstacle, oIndex) => {
            if (
                projectile.x < obstacle.x + obstacle.width &&
                projectile.x + projectile.width > obstacle.x &&
                projectile.y < obstacle.y + obstacle.height &&
                projectile.y + projectile.height > obstacle.y
            ) {
                state.obstacles.splice(oIndex, 1);
                state.projectiles.splice(pIndex, 1);
                state.score++;
            }
        });
    });
}

function updateParticles(ctx, state) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
        let p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;

        if (p.alpha <= 0) {
            state.particles.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// === SPAWN FUNCTIONS ===
function spawnObstacle(state) {
    let size = 40;
    let x = Math.random() * (canvas.width - size);
    let colors = ["#FF4500", "#FF6347", "#B22222"];
    let color = colors[Math.floor(Math.random() * colors.length)];

    state.obstacles.push({ x, y: 0, width: size, height: size, color });
}

function fireProjectile(state) {
    let projX = state.airplane.x + state.airplane.width / 2 - 5;
    let projY = state.airplane.y;

    state.projectiles.push({
        x: projX,
        y: projY,
        width: 10,
        height: 20,
        speed: 5
    });

    for (let i = 0; i < 5; i++) {
        state.particles.push(spawnParticle(projX + 5, projY + 10, "white"));
    }
}

function spawnParticle(x, y, color, vx = (Math.random() - 0.5) * 2, vy = Math.random() * -2 - 1) {
    return {
        x,
        y,
        vx,
        vy,
        alpha: 1,
        color,
        size: Math.random() * 3 + 1
    };
}

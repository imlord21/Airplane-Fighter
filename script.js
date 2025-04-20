function game() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 600;

    let state = {
        airplane: { x: canvas.width / 2 - 20, y: canvas.height - 60, width: 40, height: 40, speed: 5 },
        obstacles: [],
        projectiles: [],
        gameOver: false,
        score: 0
    };

    function handleKeyPress(event, state) {
        if (event.key === "a" && state.airplane.x > 0) {
            state.airplane.x -= state.airplane.speed;
        } else if (event.key === "d" && state.airplane.x + state.airplane.width < canvas.width) {
            state.airplane.x += state.airplane.speed;
        } else if (event.key === " ") {
            fireProjectile(state);
        }
    }

    function fireProjectile(state) {
        state.projectiles.push({
            x: state.airplane.x + state.airplane.width / 2 - 5,
            y: state.airplane.y,
            width: 10,
            height: 20,
            speed: 5
        });
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

        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width / 2 + Math.random() * 20 - 5, obstacle.y + obstacle.height + 20);
        ctx.stroke();
    }

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
        ctx.fillRect(airplane.x + airplane.width / 3, airplane.y + airplane.height - 5, airplane.width / 3, 10);
    }

    function spawnObstacle(state) {
        let size = 40;
        let x = Math.random() * (canvas.width - size);
        let colors = ["#FF4500", "#FF6347", "#B22222"];
        let color = colors[Math.floor(Math.random() * colors.length)];

        state.obstacles.push({ x, y: 0, width: size, height: size, color });
    }

    function updateGame(ctx, canvas, state) {
        if (state.gameOver) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "blue";
        drawAirplane(ctx, state.airplane);

        ctx.fillStyle = "red";
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

        ctx.fillStyle = "black";
        state.projectiles.forEach((projectile, pIndex) => {
            projectile.y -= projectile.speed;

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

        requestAnimationFrame(() => updateGame(ctx, canvas, state));
    }

    document.addEventListener("keydown", (event) => handleKeyPress(event, state));
    setInterval(() => spawnObstacle(state), 1000);
    updateGame(ctx, canvas, state);
}

game();
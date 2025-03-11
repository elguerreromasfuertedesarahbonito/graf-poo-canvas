// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Clase Ball (Pelota)
class Ball {
    constructor(x, y, radius, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }
    move() {
        this.x += this.speedX;
        this.y += this.speedY;
        // Colisión con la parte superior e inferior
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.speedY = -this.speedY;
        }
    }
    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speedX = -this.speedX; // Cambia dirección al resetear
    }
}

// Clase Paddle (Paleta)
class Paddle {
    constructor(x, y, width, height, isPlayerControlled = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isPlayerControlled = isPlayerControlled;
        this.speed = 3;
    }
    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    move(direction) {
        if (direction === 'up' && this.y > 0) {
            this.y -= this.speed;
        } else if (direction === 'down' && this.y + this.height < canvas.height) {
            this.y += this.speed;
        }
    }
    // Movimiento de la paleta automática (IA)
    autoMove(ball) {
        if (ball.y < this.y + this.height / 2) {
            this.y -= this.speed;
        } else if (ball.y > this.y + this.height / 2) {
            this.y += this.speed;
        }
    }
}

// Clase Game (Controla el juego)
class Game {
    constructor() {
        this.player1Score = 0; // Score for player 1
        this.player2Score = 0; // Score for player 2
        this.maxScore = 5; // Maximum score to win
        this.gameOver = false; // Flag to check if the game is over
        this.ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 4, 4);
        this.paddle1 = new Paddle(0, canvas.height / 2 - 50, 10, 100, true); // Controlado por el jugador
        this.paddle2 = new Paddle(canvas.width - 10, canvas.height / 2 - 50, 10, 100); // Controlado por la computadora
        this.keys = {}; // Para capturar las teclas
    }
    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.ball.draw();
        this.paddle1.draw();
        this.paddle2.draw();
        
        // Display scores
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Player 1: ${this.player1Score}`, 50, 30);
        ctx.fillText(`Player 2: ${this.player2Score}`, canvas.width - 150, 30);
    }
    update() {
        this.ball.move();
        // Movimiento de la paleta 1 (Jugador) controlado por teclas
        if (this.keys['ArrowUp']) {
            this.paddle1.move('up');
        }
        if (this.keys['ArrowDown']) {
            this.paddle1.move('down');
        }
        // Movimiento de la paleta 2 (Controlada por IA)
        this.paddle2.autoMove(this.ball);
        // Colisiones con las paletas
        if (this.ball.x - this.ball.radius <= this.paddle1.x + this.paddle1.width &&
            this.ball.y >= this.paddle1.y && this.ball.y <= this.paddle1.y + this.paddle1.height) {
            this.ball.speedX = -this.ball.speedX;
            // Do not increment score here
        }
        if (this.ball.x + this.ball.radius >= this.paddle2.x &&
            this.ball.y >= this.paddle2.y && this.ball.y <= this.paddle2.y + this.paddle2.height) {
            this.ball.speedX = -this.ball.speedX;
            // Do not increment score here

        }
        // Detectar cuando la pelota sale de los bordes (punto marcado)
        if (this.ball.x - this.ball.radius <= 0) {
            this.ball.reset(); // Reset ball position
            this.player2Score++; // Increment player 2 score
        }
        if (this.ball.x + this.ball.radius >= canvas.width) {
            this.ball.reset(); // Reset ball position
            this.player1Score++; // Increment player 1 score
        }
    }
    // Captura de teclas para el control de la paleta
    handleInput() {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'r') {
                this.player1Score = 0;
                this.player2Score = 0;
                this.gameOver = false; // Reset game over flag
                this.ball.reset(); // Reset ball position
                this.update(); // Ensure the game state is updated after reset

            }
            this.keys[event.key] = true;
        });
        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
    }
    displayWinner(message) {
        ctx.fillStyle = 'red';
        ctx.font = '30px Arial';
        ctx.fillText(message, canvas.width / 2 - 100, canvas.height / 2);

        this.gameOver = true; // Set game over flag
        showRestartButton(); // Show the restart button when the game is over

    }
    run() {
        this.handleInput();
        const gameLoop = () => {
            if (!this.gameOver) {                
                if (this.player1Score >= this.maxScore) {
                    this.displayWinner("Player 1 Wins!");
                    return;
                }
                if (this.player2Score >= this.maxScore) {
                    this.displayWinner("Player 2 Wins!");
                    return;
                }
                this.update();
                this.draw();
            } else {
                this.displayWinner(this.player1Score >= this.maxScore ? "Player 1 Wins!" : "Player 2 Wins!");
            }
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}
// Crear instancia del juego y ejecutarlo
const game = new Game();
game.run();

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVEMENT_SPEED = 5;
const FRICTION = 0.8;

// Game class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.scoreDisplay = document.getElementById('score-display');
        
        // Game state
        this.score = 0;
        this.gameOver = false;
        
        // Initialize game objects
        this.player = new Player(50, 300, 30, 50);
        this.platforms = [];
        this.coins = [];
        
        // Create platforms
        this.createPlatforms();
        
        // Create coins
        this.createCoins();
        
        // Input handling
        this.keys = {};
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Start game loop
        this.lastTime = 0;
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    createPlatforms() {
        // Ground
        this.platforms.push(new Platform(0, 350, this.width, 50, '#4CAF50'));
        
        // Platforms
        this.platforms.push(new Platform(200, 250, 100, 20, '#8D6E63'));
        this.platforms.push(new Platform(400, 200, 100, 20, '#8D6E63'));
        this.platforms.push(new Platform(600, 150, 100, 20, '#8D6E63'));
        this.platforms.push(new Platform(300, 300, 100, 20, '#8D6E63'));
        this.platforms.push(new Platform(500, 280, 100, 20, '#8D6E63'));
    }
    
    createCoins() {
        this.coins.push(new Coin(230, 220, 15));
        this.coins.push(new Coin(450, 170, 15));
        this.coins.push(new Coin(650, 120, 15));
        this.coins.push(new Coin(350, 270, 15));
        this.coins.push(new Coin(550, 250, 15));
    }
    
    handleKeyDown(e) {
        this.keys[e.code] = true;
    }
    
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }
    
    update(deltaTime) {
        // Player input
        if (this.keys['ArrowLeft']) {
            this.player.velocityX = -MOVEMENT_SPEED;
        } else if (this.keys['ArrowRight']) {
            this.player.velocityX = MOVEMENT_SPEED;
        } else {
            this.player.velocityX *= FRICTION;
        }
        
        if (this.keys['Space'] && this.player.isOnGround) {
            this.player.velocityY = JUMP_FORCE;
            this.player.isOnGround = false;
        }
        
        // Update player
        this.player.update();
        
        // Check platform collisions
        this.player.isOnGround = false;
        for (const platform of this.platforms) {
            if (this.checkCollision(this.player, platform)) {
                // Only handle collision if player is falling
                if (this.player.velocityY > 0) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.isOnGround = true;
                }
            }
        }
        
        // Check coin collisions
        for (let i = this.coins.length - 1; i >= 0; i--) {
            if (this.checkCircleRectCollision(this.coins[i], this.player)) {
                this.score++;
                this.scoreDisplay.textContent = `Coins: ${this.score}`;
                this.coins.splice(i, 1);
            }
        }
        
        // Check boundaries
        if (this.player.x < 0) {
            this.player.x = 0;
        } else if (this.player.x + this.player.width > this.width) {
            this.player.x = this.width - this.player.width;
        }
        
        // Check if player fell off the screen
        if (this.player.y > this.height) {
            this.resetPlayer();
        }
    }
    
    resetPlayer() {
        this.player.x = 50;
        this.player.y = 300;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
    }
    
    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
    
    checkCircleRectCollision(circle, rect) {
        // Find the closest point to the circle within the rectangle
        const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        
        // Calculate the distance between the circle's center and this closest point
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        
        // If the distance is less than the circle's radius, an intersection occurs
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        return distanceSquared < (circle.radius * circle.radius);
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw platforms
        for (const platform of this.platforms) {
            platform.draw(this.ctx);
        }
        
        // Draw coins
        for (const coin of this.coins) {
            coin.draw(this.ctx);
        }
        
        // Draw player
        this.player.draw(this.ctx);
    }
    
    drawBackground() {
        // Draw sky
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.beginPath();
        this.ctx.arc(100, 80, 30, 0, Math.PI * 2);
        this.ctx.arc(130, 70, 40, 0, Math.PI * 2);
        this.ctx.arc(160, 80, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(600, 100, 30, 0, Math.PI * 2);
        this.ctx.arc(630, 90, 40, 0, Math.PI * 2);
        this.ctx.arc(660, 100, 30, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Update game state
        this.update(deltaTime);
        
        // Render game
        this.render();
        
        // Continue game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Player class
class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isOnGround = false;
    }
    
    update() {
        // Apply gravity
        this.velocityY += GRAVITY;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
    }
    
    draw(ctx) {
        // Body
        ctx.fillStyle = '#FF5722';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Eyes
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 7, this.y + 10, 5, 5);
        ctx.fillRect(this.x + 18, this.y + 10, 5, 5);
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 8, this.y + 11, 3, 3);
        ctx.fillRect(this.x + 19, this.y + 11, 3, 3);
    }
}

// Platform class
class Platform {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Platform top detail
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(this.x, this.y, this.width, 5);
    }
}

// Coin class
class Coin {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.rotation = 0;
    }
    
    draw(ctx) {
        // Coin body
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin detail
        ctx.fillStyle = '#FFC107';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize game when window loads
window.onload = function() {
    const game = new Game();
};

const player = document.getElementById('player');
const mainWorld = document.getElementById('main-world');
const miniGameScreen = document.getElementById('mini-game-screen');
const miniGameBanner = document.getElementById('mini-game-banner');
const exitButton = document.getElementById('exit-button');
const miniGameAreas = document.querySelectorAll('.mini-game-area');
const hoverBanner = document.getElementById('hover-banner');

let playerX = 0;
let playerY = 0;
let currentGame = null;
let score = 0;
const beatenGames = new Set();
let hoveredArea = null;

// Initialize player position
player.style.top = `${playerY}px`;
player.style.left = `${playerX}px`;

// Player Movement
document.addEventListener('keydown', (event) => {
    const speed = 10;
    if (currentGame === null) {
        // Main world movement
        switch (event.key) {
            case 'ArrowUp':
                playerY = Math.max(0, playerY - speed);
                break;
            case 'ArrowDown':
                playerY = Math.min(window.innerHeight - 50, playerY + speed);
                break;
            case 'ArrowLeft':
                playerX = Math.max(0, playerX - speed);
                break;
            case 'ArrowRight':
                playerX = Math.min(window.innerWidth - 50, playerX + speed);
                break;
            case 'Enter':
                if (hoveredArea) {
                    startMiniGame(hoveredArea.dataset.game);
                }
                break;
        }
        player.style.top = `${playerY}px`;
        player.style.left = `${playerX}px`;

        // Check if player enters a mini-game area
        miniGameAreas.forEach(area => {
            const rect = area.getBoundingClientRect();
            if (
                playerX >= rect.left &&
                playerX <= rect.right &&
                playerY >= rect.top &&
                playerY <= rect.bottom &&
                !beatenGames.has(area.dataset.game)
            ) {
                hoveredArea = area;
                hoverBanner.style.display = 'block';
                hoverBanner.style.top = `${rect.top - 30}px`;
                hoverBanner.style.left = `${rect.left}px`;
            } else if (hoveredArea === area) {
                hoveredArea = null;
                hoverBanner.style.display = 'none';
            }
        });
    } else if (currentGame === 'obstacle') {
        // Maze movement
        const mazePlayer = document.getElementById('maze-player');
        let mazePlayerX = parseFloat(mazePlayer.style.left || 0);
        let mazePlayerY = parseFloat(mazePlayer.style.top || 0);
        
        let newX = mazePlayerX;
        let newY = mazePlayerY;
        
        switch (event.key) {
            case 'ArrowUp':
                newY -= speed;
                break;
            case 'ArrowDown':
                newY += speed;
                break;
            case 'ArrowLeft':
                newX -= speed;
                break;
            case 'ArrowRight':
                newX += speed;
                break;
        }

        // Check for wall collisions before moving
        const walls = document.querySelectorAll('.maze-wall');
        let collision = false;
        walls.forEach(wall => {
            const wallRect = wall.getBoundingClientRect();
            const playerRect = {
                left: newX,
                right: newX + 50,
                top: newY,
                bottom: newY + 50
            };

            if (
                playerRect.right > wallRect.left &&
                playerRect.left < wallRect.right &&
                playerRect.bottom > wallRect.top &&
                playerRect.top < wallRect.bottom
            ) {
                collision = true;
            }
        });

        if (!collision) {
            mazePlayer.style.top = `${newY}px`;
            mazePlayer.style.left = `${newX}px`;

            // Check for goal
            const goal = document.getElementById('maze-goal');
            const goalRect = goal.getBoundingClientRect();
            const playerRect = mazePlayer.getBoundingClientRect();

            if (
                playerRect.right > goalRect.left &&
                playerRect.left < goalRect.right &&
                playerRect.bottom > goalRect.top &&
                playerRect.top < goalRect.bottom
            ) {
                alert('You won the Maze!');
                markGameAsBeaten('obstacle');
                exitMiniGame();
            }
        }
    } else if (currentGame === 'pong') {
        const paddle = document.getElementById('pong-player');
        let paddleY = parseFloat(paddle.style.top || 0);
        
        if (event.key === 'ArrowUp') {
            paddleY = Math.max(0, paddleY - 20);
        } else if (event.key === 'ArrowDown') {
            paddleY = Math.min(window.innerHeight - 100, paddleY + 20);
        }
        
        paddle.style.top = `${paddleY}px`;
    }
});
let inventory = [];
// Start Mini-Game
function startMiniGame(game) {
    currentGame = game;
    mainWorld.style.display = 'none';
    miniGameScreen.style.display = 'block';
    miniGameBanner.textContent = `${game.charAt(0).toUpperCase() + game.slice(1)} Game`;
    miniGameBanner.style.display = 'block';
    exitButton.style.display = 'block';

    document.querySelectorAll('.mini-game').forEach(game => game.style.display = 'none');
    document.getElementById(`${game}-game`).style.display = 'block';
    if (game === 'inventory') {
        showInventory();
        return;
    }
    else if (game === 'running') {
        startTypingRace();
    } else if (game === 'obstacle') {
        startMaze();
    } else if (game === 'memory') {
        startMemory();
    } else if (game === 'pong') {
        startPong();
    }
}

// Exit Mini-Game
function exitMiniGame() {
    mainWorld.style.display = 'block';
    miniGameScreen.style.display = 'none';
    currentGame = null;
    score = 0;
    player.style.display = 'block';
    player.style.top = `${playerY}px`;
    player.style.left = `${playerX}px`;
}

exitButton.addEventListener('click', exitMiniGame);

// Mark a game as beaten
function markGameAsBeaten(game) {
    beatenGames.add(game);
    miniGameAreas.forEach(area => {
        if (area.dataset.game === game) {
            area.classList.add('beaten');
        }
    });
}

// Typing Race
function startTypingRace() {
    const typingPrompt = document.getElementById('typing-prompt');
    const typingInput = document.getElementById('typing-input');
    const typingTimer = document.getElementById('typing-timer');
    const typingScore = document.getElementById('typing-score');

    let timeLeft = 60;
    let wordsTyped = 0;

    const words = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew"];
    let promptText = "";
    for (let i = 0; i < 60; i++) {
        promptText += words[Math.floor(Math.random() * words.length)] + " ";
    }
    typingPrompt.textContent = promptText.trim();

    const timer = setInterval(() => {
        timeLeft--;
        typingTimer.textContent = `Time: ${timeLeft}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            if (wordsTyped >= 60) {
                alert('You won the Typing Race!');
                addToInventory('running');
                markGameAsBeaten('running');
            } else {
                alert('Times up! You lost.');
            }
            exitMiniGame();
        }
    }, 1000);

    typingInput.addEventListener('input', () => {
        const typedText = typingInput.value.trim();
        const promptWords = promptText.split(" ");
        const typedWords = typedText.split(" ");

        wordsTyped = 0;
        for (let i = 0; i < typedWords.length; i++) {
            if (typedWords[i] === promptWords[i]) {
                wordsTyped++;
            }
        }
        typingScore.textContent = `Words: ${wordsTyped}/60`;
    });
}


// Modified Maze Game
function startMaze() {
    const mazeGame = document.getElementById('obstacle-game');
    const mazePlayer = document.getElementById('maze-player');
    const mazeGoal = document.getElementById('maze-goal');
    
    // Create maze container
    const mazeContainer = document.createElement('div');
    mazeContainer.className = 'maze-container';
    mazeGame.appendChild(mazeContainer);
    
    // Initialize player and goal
    mazePlayer.style.top = '20px';
    mazePlayer.style.left = '20px';
    mazeGoal.style.top = '530px';
    mazeGoal.style.left = '730px';
    
    mazeContainer.appendChild(mazePlayer);
    mazeContainer.appendChild(mazeGoal);
    
    // Create maze walls
    const walls = [
        // Outer walls
        { top: 0, left: 0, width: '800px', height: '10px' },
        { top: 0, left: 0, width: '10px', height: '600px' },
        { top: '590px', left: 0, width: '800px', height: '10px' },
        { top: 0, left: '790px', width: '10px', height: '600px' },
        
        // Inner walls
        { top: '100px', left: '100px', width: '600px', height: '10px' },
        { top: '100px', left: '100px', width: '10px', height: '400px' },
        { top: '500px', left: '100px', width: '600px', height: '10px' },
        { top: '200px', left: '200px', width: '500px', height: '10px' },
        { top: '200px', left: '200px', width: '10px', height: '200px' },
        { top: '400px', left: '200px', width: '500px', height: '10px' },
        { top: '300px', left: '300px', width: '400px', height: '10px' }
    ];
    
    walls.forEach(wallConfig => {
        const wall = document.createElement('div');
        wall.className = 'maze-wall';
        Object.assign(wall.style, wallConfig);
        mazeContainer.appendChild(wall);
    });
}

// Modified Memory Game
function startMemory() {
    const memoryGrid = document.getElementById('memory-grid');
    memoryGrid.innerHTML = "";

    const cards = [];
    for (let i = 1; i <= 8; i++) {
        cards.push(i, i);
    }

    cards.sort(() => Math.random() - 0.5);

    cards.forEach((value, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.value = value;
        card.textContent = "?";
        card.addEventListener('click', () => flipCard(card));
        memoryGrid.appendChild(card);
    });

    let flippedCards = [];
    let matchedPairs = 0;

    function flipCard(card) {
        if (flippedCards.length < 2 && !card.classList.contains('flipped')) {
            card.classList.add('flipped');
            card.textContent = card.dataset.value;
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                const [card1, card2] = flippedCards;
                if (card1.dataset.value === card2.dataset.value) {
                    matchedPairs++;
                    if (matchedPairs === 8) {
                        alert('You won the Memory Game!');
                        addToInventory('memory');
                        markGameAsBeaten('memory');
                        exitMiniGame();
                    }
                    flippedCards = [];
                } else {
                    setTimeout(() => {
                        card1.classList.remove('flipped');
                        card2.classList.remove('flipped');
                        card1.textContent = "?";
                        card2.textContent = "?";
                        flippedCards = [];
                    }, 1000);
                }
            }
        }
    }
}
// Pong Game
function startPong() {
    const pongGame = document.getElementById('pong-game');
    const player = document.getElementById('pong-player');
    const ai = document.getElementById('pong-ai');
    const ball = document.getElementById('pong-ball');
    const scoreDisplay = document.getElementById('pong-score');
    
    let playerScore = 0;
    let aiScore = 0;
    let ballX = window.innerWidth / 2;
    let ballY = window.innerHeight / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 5;
    
    // Initialize positions
    player.style.top = '200px';
    ai.style.top = '200px';
    ball.style.left = `${ballX}px`;
    ball.style.top = `${ballY}px`;
    
    function updateScore() {
        scoreDisplay.textContent = `Player: ${playerScore} | AI: ${aiScore}`;
    }
    
    const gameLoop = setInterval(() => {
        // Move ball
        ballX += ballSpeedX;
        ballY += ballSpeedY;
        
        // Update ball position
        ball.style.left = `${ballX}px`;
        ball.style.top = `${ballY}px`;
        
        // Ball collision with top and bottom
        if (ballY <= 0 || ballY >= window.innerHeight - 20) {
            ballSpeedY = -ballSpeedY;
        }
        
        // AI movement
        const aiY = parseFloat(ai.style.top);
        if (ballY > aiY + 50) {
            ai.style.top = `${Math.min(window.innerHeight - 100, aiY + 4)}px`;
        } else if (ballY < aiY + 50) {
            ai.style.top = `${Math.max(0, aiY - 4)}px`;
        }
        
        // Ball collision with paddles
        const playerRect = player.getBoundingClientRect();
        const aiRect = ai.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();
        
        if (
            ballRect.left <= playerRect.right &&
            ballRect.top + 20 >= playerRect.top &&
            ballRect.bottom - 20 <= playerRect.bottom &&
            ballSpeedX < 0
        ) {
            ballSpeedX = -ballSpeedX;
            ballSpeedX *= 1.1; // Increase speed slightly
        }
        
        if (
            ballRect.right >= aiRect.left &&
            ballRect.top + 20 >= aiRect.top &&
            ballRect.bottom - 20 <= aiRect.bottom &&
            ballSpeedX > 0
        ) {
            ballSpeedX = -ballSpeedX;
            ballSpeedX *= 1.1; // Increase speed slightly
        }
        
        // Scoring
        if (ballX <= 0) {
            aiScore++;
            updateScore();
            if (aiScore >= 3) {
                clearInterval(gameLoop);
                alert('Game Over! AI wins!');
                exitMiniGame();
            } else {
                // Reset ball position
                ballX = window.innerWidth / 2;
                ballY = window.innerHeight / 2;
                ballSpeedX = Math.abs(ballSpeedX) * (Math.random() > 0.5 ? 1 : -1);
                ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
            }
        } else if (ballX >= window.innerWidth - 20) {
            playerScore++;
            updateScore();
            if (playerScore >= 3) {
                clearInterval(gameLoop);
                alert('Congratulations! You won!');
                addToInventory('pong');
                markGameAsBeaten('pong');
                exitMiniGame();
            } else {
                // Reset ball position
                ballX = window.innerWidth / 2;
                ballY = window.innerHeight / 2;
                ballSpeedX = -Math.abs(ballSpeedX) * (Math.random() > 0.5 ? 1 : -1);
                ballSpeedY = 5 * (Math.random() > 0.5 ? 1 : -1);
            }
        }
    }, 1000 / 60); // 60 FPS

    // Clean up when exiting
    exitButton.addEventListener('click', () => {
        clearInterval(gameLoop);
    });
}

function addToInventory(gameType) {
    for (let i = 0; i < 3; i++) {
        inventory.push({
            id: `${gameType}-${Date.now()}-${i}`,
            type: gameType,
            content: "I love balls"
        });
    }
}

function showInventory() {
    currentGame = 'inventory';
    mainWorld.style.display = 'none';
    miniGameScreen.style.display = 'block';
    miniGameBanner.textContent = 'Inventory';
    exitButton.style.display = 'block';

    const inventoryScreen = document.getElementById('inventory-screen');
    const lettersContainer = document.getElementById('letters-container');
    inventoryScreen.style.display = 'block';
    lettersContainer.innerHTML = '';

    inventory.forEach(letter => {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter';
        letterDiv.innerHTML = `
            <h3>Letter from ${letter.type}</h3>
            <div class="letter-content">${letter.content}</div>
        `;
        
        letterDiv.addEventListener('click', () => {
            const content = letterDiv.querySelector('.letter-content');
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
        
        lettersContainer.appendChild(letterDiv);
    });
}

// Game state
let gameState = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    turnCount: 0,
    gameMode: 'easy'
};

// Scores
let scores = {
    X: 0,
    O: 0,
    ties: 0
};

// DOM elements
const gameBoard = document.getElementById('gameBoard');
const currentTurnElement = document.getElementById('currentTurn');
const turnCountElement = document.getElementById('turnCount');
const scoreboard = document.getElementById('scoreboard');
const settingsForm = document.getElementById('settingsForm');
const resultModal = document.getElementById('resultModal');
const resultMessage = document.getElementById('resultMessage');
const rulesModal = document.getElementById('rulesModal');

// Initialize the game
function initGame() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        gameBoard.appendChild(cell);
    }
    updateUI();
}

// Handle cell click
function handleCellClick(event) {
    const index = event.target.dataset.index;
    if (gameState.board[index] || gameState.winner) return;

    gameState.board[index] = gameState.currentPlayer;
    event.target.textContent = gameState.currentPlayer;
    gameState.turnCount++;

    if (checkWinner()) {
        gameState.winner = gameState.currentPlayer;
        endGame();
    } else if (gameState.turnCount === 9) {
        gameState.winner = 'tie';
        endGame();
    } else {
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        updateUI();
        if (gameState.currentPlayer === 'O' && gameState.gameMode !== 'human') {
            setTimeout(computerMove, 500);
        }
    }
}

// Check for a winner
function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c];
    });
}

// End the game
function endGame() {
    if (gameState.winner === 'tie') {
        scores.ties++;
    } else {
        scores[gameState.winner]++;
    }
    updateUI();
    showResultModal();
}

// Show result modal
function showResultModal() {
    if (gameState.winner === 'tie') {
        resultMessage.textContent = "It's a tie!";
    } else {
        resultMessage.textContent = `Player ${gameState.winner} wins!`;
    }
    resultModal.style.display = 'block';
}

// Update UI
function updateUI() {
    currentTurnElement.textContent = `Current Turn: Player ${gameState.currentPlayer}`;
    turnCountElement.textContent = `Turn Count: ${gameState.turnCount}`;
    document.getElementById('xScore').textContent = scores.X;
    document.getElementById('oScore').textContent = scores.O;
    document.getElementById('tieScore').textContent = scores.ties;
}

// Computer move
function computerMove() {
    let index;
    if (gameState.gameMode === 'easy') {
        index = getRandomEmptyCell();
    } else if (gameState.gameMode === 'medium') {
        index = Math.random() < 0.5 ? getBestMove() : getRandomEmptyCell();
    } else {
        index = getBestMove();
    }
    
    const cell = gameBoard.children[index];
    cell.click();
}

// Get random empty cell
function getRandomEmptyCell() {
    const emptyCells = gameState.board.reduce((acc, cell, index) => {
        if (!cell) acc.push(index);
        return acc;
    }, []);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Get best move (minimax algorithm)
function getBestMove() {
    let bestScore = -Infinity;
    let bestMove;
    for (let i = 0; i < 9; i++) {
        if (!gameState.board[i]) {
            gameState.board[i] = 'O';
            let score = minimax(gameState.board, 0, false);
            gameState.board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    if (checkWinnerMinimax('O')) return 10 - depth;
    if (checkWinnerMinimax('X')) return depth - 10;
    if (board.every(cell => cell !== null)) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check winner for minimax
function checkWinnerMinimax(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return gameState.board[a] === player && gameState.board[b] === player && gameState.board[c] === player;
    });
}

// Reset game
function resetGame() {
    gameState = {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        winner: null,
        turnCount: 0,
        gameMode: gameState.gameMode
    };
    initGame();
}

// Event listeners
document.getElementById('startNewGame').addEventListener('click', resetGame);
document.getElementById('resetStats').addEventListener('click', () => {
    scores = { X: 0, O: 0, ties: 0 };
    updateUI();
});
document.getElementById('toggleRules').addEventListener('click', () => {
    rulesModal.style.display = 'block';
});
document.getElementById('toggleSettings').addEventListener('click', () => {
    settingsForm.style.display = settingsForm.style.display === 'none' ? 'block' : 'none';
});
document.getElementById('applySettings').addEventListener('click', (e) => {
    e.preventDefault();
    gameState.gameMode = document.getElementById('difficulty').value;
    settingsForm.style.display = 'none';
});
document.getElementById('playAgain').addEventListener('click', () => {
    resultModal.style.display = 'none';
    resetGame();
});
document.getElementById('updateNames').addEventListener('click', () => {
    const playerXName = document.getElementById('playerNameX').value || 'Player X';
    const playerOName = document.getElementById('playerNameO').value || 'Player O';
    document.querySelector('#scoreboard p:nth-child(1)').textContent = `${playerXName}: `;
    document.querySelector('#scoreboard p:nth-child(2)').textContent = `${playerOName}: `;
});

// Close modals when clicking on the close button or outside the modal
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = () => {
        closeBtn.closest('.modal').style.display = 'none';
    };
});

// Initialize the game when the script loads
initGame();
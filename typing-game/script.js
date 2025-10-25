class Game {
    #score;
    #lives;
    #activeItems;
    #gameSpeed;
    #spawnRate;
    #gameLoopInterval;
    #itemSpawnerInterval;
    #isGameOver;
    #lastSpawnIsSyntax;
    #lastWordIndex;
    #lastSyntaxIndex;
    #elapsedTime;
    #updateTypingSpeedInterval;
    #onGameOver;
    #lastSpawnedItem = null; // Property to track the last spawned item
    #wordZIndexCounter;
    #syntaxZIndexCounter;
    #shuffledWords;
    #shuffledSyntax;
    #currentWordIndex;
    #currentSyntaxIndex;

    constructor(elements, words, syntaxPhrases, onGameOver) {
        this.elements = elements;
        this.words = words;
        this.syntaxPhrases = syntaxPhrases;
        this.#onGameOver = onGameOver; // Callback function for when the game ends

        this.#isGameOver = true;
        this.#activeItems = [];
        this.#lastSpawnIsSyntax = false;
        this.#wordZIndexCounter = 19999;
        this.#syntaxZIndexCounter = 9999;
        this.#shuffledWords = [];
        this.#shuffledSyntax = [];
        this.#currentWordIndex = 0;
        this.#currentSyntaxIndex = 0;
    }

    // Public getter to check game state from outside
    get isGameOver() {
        return this.#isGameOver;
    }

    get currentScore() {
        return this.#score;
    }

    get typingSpeed() {
        if (!this.#elapsedTime || this.#elapsedTime === 0) return 0;
        return this.#score / this.#elapsedTime * 60;
    }

    start() {
        this.#score = 0;
        this.#lives = 5;
        this.#gameSpeed = 1;
        this.#spawnRate = 2500;
        this.#activeItems = [];
        this.#isGameOver = false;
        this.#elapsedTime = 0;
        this.#lastSpawnedItem = null;
        this.#wordZIndexCounter = 19999;
        this.#syntaxZIndexCounter = 9999;
        this.#shuffledWords = this.#shuffleArray([...this.words]);
        this.#shuffledSyntax = this.#shuffleArray([...this.syntaxPhrases]);
        this.#currentWordIndex = 0;
        this.#currentSyntaxIndex = 0;
        this.#updateUI();
        this.elements.gameScreen.innerHTML = '';
        this.elements.inputBox.disabled = false;
        this.elements.inputBox.value = '';
        this.elements.inputBox.focus();

        this.stop(); // Clear any existing intervals before starting new ones

        this.#gameLoopInterval = setInterval(() => this.#gameLoop(), 16);
        this.#itemSpawnerInterval = setInterval(() => this.#spawnItem(), this.#spawnRate);
        this.#updateTypingSpeedInterval = setInterval(() => this.#updateTypingSpeed(), 100);
    }

    stop() {
        clearInterval(this.#gameLoopInterval);
        clearInterval(this.#itemSpawnerInterval);
        clearInterval(this.#updateTypingSpeedInterval);
    }

    #shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    #updateTypingSpeed() {
        this.#elapsedTime += 0.1;
        this.elements.typingSpeedEl.innerText = this.typingSpeed.toFixed(0);
    }

    #increaseScore(amount) {
        if (amount > 0) this.#score += amount;
    }

    #decreaseLife() {
        if (this.#lives > 0) this.#lives--;
    }

                #gameLoop() {
                    if (this.#isGameOver) return;
                    this.#activeItems.forEach((item, index) => {
                        const speed = item.y < 0 ? this.#gameSpeed * 5 : this.#gameSpeed;
                        item.y += speed * item.speedMultiplier;
                        item.element.style.top = `${item.y}px`;
                        if (item.y + item.element.offsetHeight >= this.elements.gameScreen.offsetHeight) {
                            this.#removeItem(item.element, index);
                            this.#loseLife();
                        }
                    });
                }
    #spawnItem() {
        if (this.#isGameOver) return;
        if (this.#activeItems.length >= 7) return;

        // --- MODIFIED: Spawn based on last item's position ---
        if (this.#lastSpawnedItem) {
            const lastItemExists = this.#activeItems.includes(this.#lastSpawnedItem);
            // y starts at -40. After moving 50px, it reaches y=10.
            // Only spawn a new item if the last one has moved at least 50px.
            if (lastItemExists && this.#lastSpawnedItem.y < 10) {
                return;
            }
        }
        // --- End of modification ---

        const hasWords = this.words.length > 0;
        const hasSyntax = this.syntaxPhrases.length > 0;
        if (!hasWords && !hasSyntax) return;

        const shouldSpawnWord = (Math.random() < 0.75 && hasWords) || !hasSyntax;

        if (shouldSpawnWord) {
            if (this.#lastSpawnIsSyntax) {
                this.#lastSpawnIsSyntax = false;
                return;
            }
            this.#spawnEntity('word', 1);
        } else {
            this.#spawnEntity('syntax', 0.5);
            this.#lastSpawnIsSyntax = true;
        }
    }

    #spawnEntity(type, speedMultiplier) {
        let itemText;

        if (type === 'word') {
            if (this.#currentWordIndex >= this.#shuffledWords.length) {
                this.#currentWordIndex = 0;
                this.#shuffledWords = this.#shuffleArray([...this.words]);
            }
            if (this.#shuffledWords.length > 0) {
                itemText = this.#shuffledWords[this.#currentWordIndex];
                this.#currentWordIndex++;
            }
        } else { // syntax
            if (this.#currentSyntaxIndex >= this.#shuffledSyntax.length) {
                this.#currentSyntaxIndex = 0;
                this.#shuffledSyntax = this.#shuffleArray([...this.syntaxPhrases]);
            }
            if (this.#shuffledSyntax.length > 0) {
                itemText = this.#shuffledSyntax[this.#currentSyntaxIndex];
                this.#currentSyntaxIndex++;
            }
        }

        if (!itemText) return;

        const itemElement = document.createElement('div');
        itemElement.className = `item ${type}`;
        itemElement.innerText = itemText;
        if (type === 'word') {
            itemElement.style.zIndex = this.#wordZIndexCounter--;
        } else {
            itemElement.style.zIndex = this.#syntaxZIndexCounter--;
        }
        this.elements.gameScreen.appendChild(itemElement);

        const screenWidth = this.elements.gameScreen.offsetWidth;
        const itemWidth = itemElement.offsetWidth;
        
        let randomX;
        let isOverlapping = false;
        const maxAttempts = 20; 
        let attempts = 0;

        do {
            isOverlapping = false;
            randomX = Math.random() * (screenWidth - itemWidth);
            
            for (const activeItem of this.#activeItems) {
                if (activeItem.y < itemElement.offsetHeight) {
                    const existingElement = activeItem.element;
                    const existingX = parseFloat(existingElement.style.left);
                    const existingWidth = existingElement.offsetWidth;

                    if (randomX < existingX + existingWidth && randomX + itemWidth > existingX) {
                        isOverlapping = true;
                        break; 
                    }
                }
            }
            attempts++;
        } while (isOverlapping && attempts < maxAttempts);

        itemElement.style.left = `${randomX}px`;
        itemElement.style.top = `-40px`;

        const newItem = {
            text: itemText,
            element: itemElement,
            y: -40,
            speedMultiplier: speedMultiplier * (5 / itemText.length)
        };
        
        this.#activeItems.push(newItem);
        this.#lastSpawnedItem = newItem; // --- MODIFIED: Track the newly created item ---
    }

    #loseLife() {
        if (this.#isGameOver) return;
        this.#decreaseLife();
        this.#updateUI();
        this.elements.gameScreen.classList.add('flash-red');
        setTimeout(() => this.elements.gameScreen.classList.remove('flash-red'), 300);
        if (this.#lives <= 0) {
            this.endGame();
        }
    }

    endGame() {
        if (this.#isGameOver) return;
        this.#isGameOver = true;
        this.stop();
        this.elements.inputBox.disabled = true;
        if (this.#onGameOver) {
            this.#onGameOver(); // Call the callback
        }
    }


    #removeItem(element, index) {
        element.remove();
        this.#activeItems.splice(index, 1);
    }

    #updateUI() {
        this.elements.scoreEl.innerText = this.#score;
        this.elements.livesEl.innerText = this.#lives;
    }

    #adjustDifficulty() {
        if (this.#score > 0 && this.#score % 50 === 0) {
            this.#gameSpeed += 0.2;
        }
        if (this.#score > 0 && this.#score % 100 === 0 && this.#spawnRate >= 200) {
            this.#spawnRate -= 50;
            this.stop(); // Stop current intervals
            // Restart intervals with new rate
            this.#itemSpawnerInterval = setInterval(() => this.#spawnItem(), this.#spawnRate);
            this.#gameLoopInterval = setInterval(() => this.#gameLoop(), 16);
            this.#updateTypingSpeedInterval = setInterval(() => this.#updateTypingSpeed(), 100);
        }
    }

    static calculateHangulToScore(hangul) {
        if (typeof hangul !== 'string') return 0;
        let score = 0;
        for (let i = 0; i < hangul.length; i++) {
            const char = hangul[i];
            const charCode = char.charCodeAt(0);
            if (char === ' ') {
                score += 1;
            } else if (charCode >= 44032 && charCode <= 55203) {
                score += ((charCode - 44032) % 28 === 0) ? 2 : 3;
            } else {
                score += 1;
            }
        }
        return score;
    }

    handleInput(typedText) {
        if (!typedText) return;

        let matchedIndex = -1;
        for (let i = 0; i < this.#activeItems.length; i++) {
            const item = this.#activeItems[i];
            const isSyntax = item.element.classList.contains('syntax');
            
            let sourceText;
            let targetText;
            
            if (isSyntax) {
                sourceText = item.text.replace(/\s/g, '');
                targetText = typedText.replace(/\s/g, '');
            } else {
                sourceText = item.text.trim();
                targetText = typedText.trim();
            }

            if (sourceText === targetText) {
                matchedIndex = i;
                break;
            }
        }

        if (matchedIndex !== -1) {
            this.#increaseScore(Game.calculateHangulToScore(this.#activeItems[matchedIndex].text));
            this.#removeItem(this.#activeItems[matchedIndex].element, matchedIndex);
            this.#updateUI();
            this.#adjustDifficulty();
        } else {
            this.elements.inputBox.classList.add('input-error');
            setTimeout(() => this.elements.inputBox.classList.remove('input-error'), 200);
        }
        this.elements.inputBox.value = '';
    }
}

// --- Application Initialization and Management ---
document.addEventListener('DOMContentLoaded', () => {
    const gameElements = {
        gameUI: document.getElementById('game-ui'),
        scoreEl: document.getElementById('score'),
        livesEl: document.getElementById('lives'),
        typingSpeedEl: document.getElementById('typing-speed'),
        gameScreen: document.getElementById('game-screen'),
        inputBox: document.getElementById('input-box'),
        settingsModal: document.getElementById('settings-modal'),
        gameOverModal: document.getElementById('game-over-modal'),
        modalScore: document.getElementById('modal-score'),
        modalTypingSpeed: document.getElementById('modal-typing-speed'),
        startButton: document.getElementById('start-button'),
        restartButton: document.getElementById('restart-button'),
        fullscreenBtn: document.getElementById('fullscreen-btn'),
        fullscreenOpenIcon: document.getElementById('fullscreen-open-icon'),
        fullscreenCloseIcon: document.getElementById('fullscreen-close-icon'),
        customWords: document.getElementById('custom-words'),
        customSyntax: document.getElementById('custom-syntax'),
        importBtn: document.getElementById('import-btn'),
        exportBtn: document.getElementById('export-btn'),
        importFile: document.getElementById('import-file'),
    };

    let typingGame = null;

    // --- LocalStorage Functions ---
    const saveDataToLocalStorage = () => {
        const data = {
            words: gameElements.customWords.value,
            syntax: gameElements.customSyntax.value,
        };
        localStorage.setItem('typingGameSettings', JSON.stringify(data));
    };

    const loadDataFromLocalStorage = () => {
        const savedSettings = localStorage.getItem('typingGameSettings');
        if (savedSettings) {
            try {
                const data = JSON.parse(savedSettings);
                // Ensure loaded data is a string
                gameElements.customWords.value = typeof data.words === 'string' ? data.words : '';
                gameElements.customSyntax.value = typeof data.syntax === 'string' ? data.syntax : '';
            } catch (e) {
                console.error('Failed to parse settings from localStorage', e);
                loadDefaultData();
            }
        } else {
            loadDefaultData();
        }
    };

    const loadDefaultData = () => {
        const defaultWords = ["네트워크", "프로토콜", "알고리즘", "데이터베이스", "서버", "클라이언트", "프레임워크", "라이브러리"];
        const defaultSyntax = ["public static void main", "System.out.println()", "document.getElementById", "addEventListener('click', () => {})"];
        gameElements.customWords.value = defaultWords.join('\n');
        gameElements.customSyntax.value = defaultSyntax.join('\n');
    };

    // Initial data load
    loadDataFromLocalStorage();
    // --- End LocalStorage Functions ---

    const processTextarea = (textarea) => {
        return textarea.value.split('\n').map(line => line.trim()).filter(line => line);
    };

    const startGame = () => {
        saveDataToLocalStorage(); // Save current settings when game starts

        const words = processTextarea(gameElements.customWords);
        const syntaxPhrases = processTextarea(gameElements.customSyntax);

        if (words.length === 0 && syntaxPhrases.length === 0) {
            alert('Please enter at least one word or syntax phrase to start the game.');
            return;
        }

        gameElements.settingsModal.style.display = 'none';
        gameElements.gameUI.classList.remove('hidden');
        gameElements.gameUI.classList.add('flex');


        typingGame = new Game(gameElements, words, syntaxPhrases, endGame);
        typingGame.start();
    };

    const endGame = () => {
        if (!typingGame) return;
        gameElements.modalScore.innerText = `Final Score: ${typingGame.currentScore}`;
        gameElements.modalTypingSpeed.innerText = `분당타수: ${typingGame.typingSpeed.toFixed(0)} 타`;
        gameElements.gameOverModal.classList.remove('hidden');
        gameElements.gameOverModal.classList.add('flex');
    };

    const resetToSettings = () => {
        gameElements.gameOverModal.classList.add('hidden');
        gameElements.gameOverModal.classList.remove('flex');
        gameElements.gameUI.classList.add('hidden');
        gameElements.gameUI.classList.remove('flex');
        gameElements.settingsModal.style.display = 'flex';
    };

    const handleExport = () => {
        saveDataToLocalStorage(); // Also save to local storage on export
        const data = {
            words: processTextarea(gameElements.customWords),
            syntax: processTextarea(gameElements.customSyntax),
        };
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'typing_settings.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data.words) && Array.isArray(data.syntax)) {
                    // Import and immediately save to local storage
                    gameElements.customWords.value = data.words.join('\n');
                    gameElements.customSyntax.value = data.syntax.join('\n');
                    saveDataToLocalStorage();
                } else {
                    alert('Invalid JSON format. The file must contain "words" and "syntax" arrays.');
                }
            } catch (error) {
                alert('Error parsing JSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(`Fullscreen Error: ${err.message}`));
        } else {
            document.exitFullscreen();
        }
    };

    const onFullscreenChange = () => {
        const {
            fullscreenOpenIcon,
            fullscreenCloseIcon
        } = gameElements;
        if (document.fullscreenElement) {
            fullscreenOpenIcon.classList.add('hidden');
            fullscreenCloseIcon.classList.remove('hidden');
        } else {
            fullscreenOpenIcon.classList.remove('hidden');
            fullscreenCloseIcon.classList.add('hidden');
        }
    }

    // Event Listeners
    gameElements.startButton.addEventListener('click', startGame);
    gameElements.restartButton.addEventListener('click', resetToSettings);
    gameElements.exportBtn.addEventListener('click', handleExport);
    gameElements.importBtn.addEventListener('click', () => gameElements.importFile.click());
    gameElements.importFile.addEventListener('change', handleImport);
    gameElements.fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    gameElements.inputBox.addEventListener('keydown', (event) => {
        if (typingGame && !typingGame.isGameOver && event.key === 'Enter') {
            event.preventDefault();
            typingGame.handleInput(gameElements.inputBox.value);
        }
    });
});

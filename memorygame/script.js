const symbols = ['🍎','🍌','🍒','🍇','🍉','🍋','🍓','🍍'];
const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
const gameBoard = document.getElementById('gameBoard');
let flipped = [];
let locked = false;

function createCard(symbol, idx) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.symbol = symbol;
    card.dataset.idx = idx;
    card.innerHTML = '<span style="opacity:0;">' + symbol + '</span>';
    card.addEventListener('click', () => onCardClick(card));
    return card;
}

function onCardClick(card) {
    if (locked || card.classList.contains('flipped') || flipped.includes(card)) return;
    card.classList.add('flipped');
    card.querySelector('span').style.opacity = 1;
    flipped.push(card);
    if (flipped.length === 2) {
        locked = true;
        animateCards(flipped[0], flipped[1]);
    }
}

function moveToCenter(rect, card, scale, leftSide) {
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const cardWidth = rect.width;
    const cardHeight = rect.height;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    let destinationX;
    if (leftSide) {
        // Move the *right* edge of the card to the center, after scaling
        destinationX = centerX - (cardWidth * scale);
    } else {
        // Move the *center* of the card to the center, after scaling
        destinationX = centerX + (cardWidth * scale) / 2;
    }
    const destinationY = centerY - cardHeight/2;

    const currentX = rect.left + scrollX;
    const currentY = rect.top + scrollY;

    // Adjust for scaling: how much to move before scaling is applied
    const translateX = (destinationX - currentX) / scale;
    const translateY = (destinationY - currentY) / scale;

    card.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
}

function animateCards(card1, card2) {
    const gameBoardRect = gameBoard.getBoundingClientRect();
    // Get current positions
    const rect1 = card1.getBoundingClientRect();
    const rect2 = card2.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Create placeholders
    const placeholder1 = document.createElement('div');
    const placeholder2 = document.createElement('div');
    placeholder1.className = 'card placeholder';
    placeholder2.className = 'card placeholder';
    card1.parentNode.insertBefore(placeholder1, card1);
    card2.parentNode.insertBefore(placeholder2, card2);

    // Set fixed position at current location
    [card1, card2].forEach((card, i) => {
        const rect = i === 0 ? rect1 : rect2;
        card.style.position = 'fixed';
        card.style.left = (rect.left - gameBoardRect.left + scrollX) + 'px';
        card.style.top = (rect.top - gameBoardRect.top + scrollY) + 'px';
        card.style.width = rect.width + 'px';
        card.style.height = rect.height + 'px';
        card.style.margin = '0';
        card.style.zIndex = 10;
    });
    // Force reflow
    void card1.offsetWidth;
    // Animate to left/right
    card1.classList.add('animate-left');
    card2.classList.add('animate-right');
    // Calculate center position for card1
    moveToCenter(rect1, card1, 2.2, true);
    moveToCenter(rect2, card2, 2.2, false);

    // Wait for animation, then return
    setTimeout(() => {
        card1.classList.remove('animate-left');
        card2.classList.remove('animate-right');
        // Animate back to grid
        card1.style.transform = '';
        card2.style.transform = '';
        card1.style.transition = 'all 0.7s cubic-bezier(.68,-0.55,.27,1.55)';
        card2.style.transition = 'all 0.7s cubic-bezier(.68,-0.55,.27,1.55)';
        card1.style.left = (rect1.left - gameBoardRect.left + scrollX) + 'px';
        card1.style.top = (rect1.top - gameBoardRect.top + scrollY) + 'px';
        card2.style.left = (rect2.left - gameBoardRect.left + scrollX) + 'px';
        card2.style.right = '';
        card2.style.top = (rect2.top - gameBoardRect.top + scrollY) + 'px';
        setTimeout(() => {
            // Remove placeholders and restore cards
            placeholder1.parentNode.replaceChild(card1, placeholder1);
            placeholder2.parentNode.replaceChild(card2, placeholder2);
            [card1, card2].forEach(card => {
                card.style.position = '';
                card.style.left = '';
                card.style.top = '';
                card.style.width = '';
                card.style.height = '';
                card.style.margin = '';
                card.style.zIndex = '';
                card.style.transition = '';
                card.style.right = '';
            });
            if (card1.dataset.symbol !== card2.dataset.symbol) {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                card1.querySelector('span').style.opacity = 0;
                card2.querySelector('span').style.opacity = 0;
            }
            flipped = [];
            locked = false;
        }, 700);
    }, 1800);
}

function setupBoard() {
    gameBoard.innerHTML = '';
    cards.forEach((symbol, idx) => {
        gameBoard.appendChild(createCard(symbol, idx));
    });
}

setupBoard();

class finishGame {
    constructor() {
        this.popUp = document.body.querySelector(".popup-container");
        this.title = this.popUp.querySelector('h2');
        this.winMsg = "You Won !";
        this.loseMsg = "You Lost !";
    }

    win() {
        this.title.textContent = this.winMsg;
        this.popUp.style.display = "flex";
    }

    lose() {
        this.title.textContent = this.loseMsg;
        this.popUp.style.display = "flex"; 
    }
}

class UpdateUI extends finishGame {
    constructor(index, arr) {
        super();
        this.index = index;
        this.array = arr;
        this.paragraphs = document.querySelectorAll(".word p");
        this.wrongLettersEl = document.getElementById('wrong-letters');
        this.figure = document.querySelectorAll(".figure-part");
    }

    showLetter() {
        for (const item of this.index) {
            this.paragraphs[item].textContent = this.array[item];
        }

        if (Array.from(this.paragraphs).every(el => el.textContent !== "")) {
            const reset = new finishGame();
            reset.win();
        }
    }

    addWrongLetter() {
        const wrongLetter = document.createElement('span');
        wrongLetter.textContent = `${this.index} `;
        this.wrongLettersEl.appendChild(wrongLetter);
    }

    showWrongLetter() {
        if (this.wrongLettersEl.childElementCount === 0) {
            const title = document.createElement('p')
            title.textContent = "Wrong";
            this.wrongLettersEl.appendChild(title);
            this.addWrongLetter();
        } else {
            this.addWrongLetter();
        }
        

        for (let i = 0; i < this.figure.length; i++) {
            if (this.figure[i].style.display !== "block") {
                this.figure[i].style.display = "block";
                break;
            }  
        }

        if (Array.from(this.figure).every(el => el.style.display === "block")) {
            for (let i = 0; i < this.array.length; i++) {
                this.paragraphs[i].textContent = this.array[i];
            }
            const reset = new finishGame();
            reset.lose();
        }
    }
}

class Guess extends UpdateUI {
    constructor(array) {
        super();
        this.array = array;
        this.indexes = [];
        this.enteredLetters = [];
        this.notification = document.getElementById('notification-container');
    }

    guess() {
        document.onkeydown = (event) => {
            const enteredLetter = event.key.toUpperCase();
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (alphabet.includes(enteredLetter)) {
            this.verify(enteredLetter);
            this.checkRepetition(enteredLetter);
        }
      }
    }

    checkRepetition(letter) {
        let hasDuplicate = this.enteredLetters.includes(letter);
        this.enteredLetters.push(letter);
        if (hasDuplicate) {
            this.notification.classList.add("show");
            setTimeout(() => {
                this.notification.classList.remove("show");
            }, 3000);
        } else {
            this.notification.classList.remove("show");
        }
    }

    verify(letter) {
        if (this.array.includes(letter)) {
            const indexes = this.array.reduce((acc, el, i) => (el === letter ? [...acc, i] : acc), []);
            const controller = new UpdateUI(indexes, this.array);
            controller.showLetter();
        } else if (!this.array.includes(letter) && !this.enteredLetters.includes(letter)) {  
            let wrongLetter = letter;
            const controller = new UpdateUI(wrongLetter, this.array);
            controller.showWrongLetter();
        } else {
            return;
        }
    }
}

class Game extends Guess{
    constructor(data) {
        super();
        this.wordEl = document.getElementById('word');
        this.word = data;
        this.wordArr = [];
    }

    composeWord() {
        let word = this.word[Math.floor(Math.random() * this.word.length)];
        word.split('').forEach(el => {
            let letter = document.createElement('p');
            letter.classList.add('letter');
            letter.textContent = "";
            this.wordEl.appendChild(letter);
            this.wordArr.push(el);
        });
        const guess = new Guess(this.wordArr);
        guess.guess();
    }
}

class App extends Game{
    constructor() {
        super();
        this.playAgainBtn = document.getElementById('play-button');
        this.popup = document.getElementById('popup-container');
        this.wordContainer = document.body.querySelector(".word");
        this.wrongLettersEl = document.getElementById('wrong-letters');
        this.figure = document.querySelectorAll(".figure-part");
        this.playAgainBtn.addEventListener('click', this.restart.bind(this));
        this.fetchedArray = [];
    }

    cleanUI(...args) {
        this.popup.style.display = "none";
        this.figure.forEach(el => el.style.display = "none");
        args.forEach(el => {
            let child = el.lastElementChild;
            while (child) {
                el.removeChild(child);
                child = el.lastElementChild;
            }
        });
    }

    restart() {
        this.cleanUI(this.wordContainer, this.wrongLettersEl);
        const game = new Game(this.fetchedArray);
        game.composeWord();
    }

    async getWords() {
        try {
            const words = await fetch('https://random-word-api.vercel.app/api?words=100&type=uppercase');
            if (!words.ok) {
                throw new Error("Failed to fetch words.");
            }
            const data = await words.json(); 
            this.fetchedArray = data;
            const game = new Game(data);
            game.composeWord();
        } catch (err) {
            console.error("Fetching error: ", err.message);
        }
    }
}

const app = new App();
app.getWords()

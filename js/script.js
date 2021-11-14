class Option {
    constructor(name, amount, color) {
        this.name = name;
        this.amount = (amount > 0) ? amount: 0;
        this.color = color;
    }

    addAmount(amount) {
        this.amount = (this.amount + amount > 0) ? this.amount + amount : 0;
    }
}

var options = [
    new Option('Doki Doki Literature Club', Math.floor(500 * Math.random() + 50), getRandomColor()),
    new Option('Everlasting Summer', Math.floor(500 * Math.random() + 50), getRandomColor()),
    new Option('S.T.A.L.K.E.R.: Call of Prypyat', Math.floor(500 * Math.random() + 50), getRandomColor()),
    new Option('Fallout 76', Math.floor(500 * Math.random() + 50), getRandomColor()),
    new Option('Saya No Uta', Math.floor(500 * Math.random() + 50), getRandomColor()),
];

var canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let w = canvas.width;
let h = canvas.height;

ctx.lineWidth = 3;
ctx.strokeStyle = 'black';
ctx.lineJoin = 'round';

let requestId = undefined;
let probas = [0.1, 0.2, 0.3, 0.4];
let colors = [getRandomColor(), getRandomColor(), getRandomColor(), getRandomColor()];
let startAngle = 0;
let angleVelocity = 0.2;
let running = false;
let windNumber = 5 * Math.random() + 5;

render();

function drawWheel(options, startAngle = -Math.PI / 2) {
    ctx.clearRect(0, 0, w, h);

    if (options && options.length > 0) {
        let totalAmount = options.map(option => option.amount).reduce((accum, next) => accum + next);

        for (let i = 0; i < options.length; i++) {
            ctx.fillStyle = options[i].color;
            let angle = 2 * Math.PI * options[i].amount / totalAmount;
            drawSector(w / 2, h / 2, w / 2 - 10, angle, startAngle);
            startAngle += angle;
        }
    }
}

function drawSector(x, y, radius, angle, rotateAngle = 0) {
    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(rotateAngle);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.arc(0, 0, radius, 0, angle, false);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    
    ctx.restore();
}

function drawPointer(x, y, radius, rotateAngle) {
    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(rotateAngle);
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';
    
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(radius + 10, 4);
    ctx.lineTo(radius + 10, -4);
    ctx.lineTo(radius, 0);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
    
    ctx.restore();
}

function degToRad(deg) {
    return Math.PI / 180 * deg;
} 

function getRandomColor() {
    const hex = 'A47F2B19D03C8F56';
    let color = '#';

    for (let i = 0; i < 6; i++) {
        color += hex[Math.floor(Math.random() * hex.length)];
    }

    return color;
}

function spinWheel() {
    ctx.clearRect(0, 0, w, h);
    startAngle += angleVelocity;
    if (startAngle > windNumber * 2 * Math.PI) {
        angleVelocity *= 0.995;
    }
    drawWheel(options, startAngle);
    drawPointer(w / 2, h / 2, w / 2 - 10, 0);
    requestId = window.requestAnimationFrame(spinWheel);
    pickWinner();
    if (angleVelocity < 1E-3) {
        let winner = document.getElementById('winner');
        winner.style.fontWeight = 700;

        window.cancelAnimationFrame(requestId);
        running = false;
        angleVelocity = 0.2;        
    }
}

function runWheel() {
    let winner = document.getElementById('winner');
    winner.style.fontWeight = 'normal';

    if (running) {
        window.cancelAnimationFrame(requestId);
        running = false;    
    } else {
        requestId = window.requestAnimationFrame(spinWheel);
        running = true;
    }
}

function pickWinner() {
    if (options && options.length > 0) {
        let totalAmount = options.map(option => option.amount).reduce((accum, next) => accum + next);

        let rotAngle = 2 * Math.PI - (startAngle - 2 * Math.PI * Math.floor(startAngle / 2 / Math.PI));
        let sum = 0;
        let index = undefined;
        for (let i = 0; i < options.length; i++) {
            if (sum < rotAngle && rotAngle < sum + options[i].amount * 2 * Math.PI / totalAmount) {
                index = i;
            }
            sum += options[i].amount * 2 * Math.PI / totalAmount;
        }

        let winnerName = options[index].name;
        document.getElementById('winner').innerHTML = winnerName;
    }
}

function renderOptions(options) {
    var optionList = document.getElementById('option-list');
    let innerHtml = '';
    for (let i = 0; i < options.length; i++) {
       innerHtml += `
       <li class="option-item">
            <span class="color-span" style="background-color: ${options[i].color}" onclick='onDeleteOptionBtnClick(event)'></span>
            <div class="option-name">${options[i].name}</div>
            <div class='amount-container'>
                <div class="option-amount">${options[i].amount}</div>
                <div class="amount-buttons-container">
                    <button onclick='onSubtractAmountBtnClick(event)'>-</button>
                    <input type="number">
                    <button onclick='onAddAmountBtnClick(event)'>+</button>
                </div>
            </div>
        </li>
        `
    }
    optionList.innerHTML = innerHtml;
}

function render() {
    renderOptions(options);
    drawWheel(options, 0);
    drawPointer(w / 2, h / 2, w / 2 - 10, 0);
}

function addOption(name, amount) {
    let newOption = new Option(name, amount, getRandomColor());
    options.push(newOption);
    render();
}

function onAddBtnClick() {
    let optionNameElement = document.getElementById('optionname');
    let optionName = optionNameElement.value;
    optionNameElement.value = '';

    let optionAmountElement = document.getElementById('optionamount');
    let optionAmount = optionAmountElement.value;
    optionAmountElement.value = '';

    if (optionName && optionAmount) {
        let amount = parseInt(optionAmount, 10);
        if (!isNaN(amount)) {        
            addOption(optionName, amount);
        }
    }
}

function onAddAmountBtnClick(event) {
    let index = 0;
    let li = event.currentTarget.parentElement.parentElement.parentElement;
    let addAmountInput = event.currentTarget.previousElementSibling;
    let addAmountValue = addAmountInput.value;

    if (addAmountValue) {
        let amount = parseInt(addAmountValue, 10);
        if (!isNaN(amount)) {
            while (li = li.previousElementSibling) {
                index++;
            }
            options[index].addAmount(amount);
            render();
        }   
    }
}

function onSubtractAmountBtnClick(event) {
    let index = 0;
    let li = event.currentTarget.parentElement.parentElement.parentElement;
    let addAmountInput = event.currentTarget.nextElementSibling;
    let addAmountValue = addAmountInput.value;

    if (addAmountValue) {
        let amount = parseInt(addAmountValue, 10);
        if (!isNaN(amount)) {
            while (li = li.previousElementSibling) {
                index++;
            }
            options[index].addAmount(-amount);
            render();
        }   
    }
}

function onDeleteOptionBtnClick(event) {
    let index = 0;
    let li = event.currentTarget.parentElement;

    while (li = li.previousElementSibling) {
        index++;
    }

    options.splice(index, 1);
    render();
}
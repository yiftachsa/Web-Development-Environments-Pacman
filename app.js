/*
* Main canvas gaming space
*/
var context;
/*
* Pacman position
*/
var pacmanPosition = new Object();
/*
* Board for thw walls and blank cells. The outline of the game.
*/
var baseBoard;
/*
* Board for Pacman, food and special food - all have a single interaction between them
*/
var pacmanBoard;
/*
* Board for the non-playable characters - interact only with pacman (do not interact withe the food and with each other)
 * each cell is a bollean array. index i is true if enemy i is in the cell. 
 * npcCell: [firstEnemy, secondEnemy, thirdEnemy ,forthEnemy, Wild]
 * exp. npcCell = [t,t,f,f,f] -> the first and the second enemies are in npcCell at the same time.
*/
var npcBoard;

var npcPosition;

var wildPosition;

var moveInterval;

var isMouthOpen = true;
var npcMoveCycle = 0;

var cellSize = 60;

var isEaten;

const baseBoardCellType = { BLANK: "blank", WALL: "wall" };
Object.freeze(baseBoardCellType);
const pacmanBoardCellType = { LOWSCOREFOOD: "lowScoreFood", MEDSCOREFOOD: "medScoreFood", HIGHSCOREFOOD: "highScoreFood", PACMAN: "pacman", CLOCK: "clock", AVIVBERRY: "avivBerry" };
Object.freeze(pacmanBoardCellType);
const npcMoveType = { RIGHT: 1, LEFT: 2 , UP: 3 , DOWN: 4};
Object.freeze(npcMoveType);

//Game variables
var lifesRemain;
var foodRemain;
var lastKeyPressed = 39;
var score;
var pac_color;
var start_time;
var time_elapsed;

//Definitions
var upKeyCode = 38;
var downKeyCode = 40;
var leftKeyCode = 37;
var rightKeyCode = 39;
var foodAmount = 50;
var lowColor = "#ff0000";
var medColor = "#E9FF00";
var highColor = "#00FF1B";
var timeLimit = 60;
var enemiesAmount = 2;


$(document).ready(function () {
    //context = canvas.getContext("2d");
    //Start();
    startDefs();
});

function startDefs() {
    $("#chooseKeysDiv>:button").click(function (e) { keySelection(this.id); });
    $("#randomButton").click(function (e) { randomizeDefs(); });
    $("#startButton").click(function (e) { startGame(); });
}



function startGame() {
    initGameEnvironment();

    initBoards();
    //startBoard();
    score = 0;
    foodRemain = foodAmount;
    lifesRemain = 5;
    start_time = new Date();
    pac_color = "yellow";
    isEaten = false;

    //updating the user postion - also impacts player's speed
    moveInterval = setInterval(UpdatePosition, 140);

    //switchDevs
    $("#defsForm").hide();
    $("#game").show();
}

function initGameEnvironment() {
    context = canvas.getContext("2d");
    keysDown = {};
    //The keydown event is fired when a key is pressed. Unlike the keypress event, the keydown event is fired for all keys, regardless of whether they produce a character value
    addEventListener("keydown", function (e) { keysDown[e.keyCode] = true; }, false);
    //The keyup event occurs when the user releases a key
    addEventListener("keyup", function (e) { keysDown[e.keyCode] = false; }, false);
    //update values
    foodAmount = $("#foodQuantity").val();
    medColor = $("#medScoreColor").val();
    lowColor = $("#lowScoreColor").val();
    highColor = $("#highScoreColor").val();
    timeLimit = $("#timeLimitNum").val();
    enemiesAmount = $("#enemiesQuantity").val();
}

/*
 * Handels the key selection keys being pressed. 
 * Captures a single key stroke and updates the relevent key code.
 */
function keySelection(buttonID) {
    var button = $("#" + buttonID);
    button.keydown(function (event) {
        button.prop("value", event.key);
        switch (buttonID) {
            case "upKeybutton":
                upKeyCode = event.keyCode;
                break;
            case "downKeybutton":
                downKeyCode = event.keyCode;
                break;
            case "leftKeybutton":
                leftKeyCode = event.keyCode;
                break;
            case "rightKeybutton":
                rightKeyCode = event.keyCode;
                break;
        }
        button.off("keydown");
    });
}

/*
 * Randomize values for the game definitions.
 */
function randomizeDefs() {
    //food quantity
    foodAmount = getRandomInt(50, 90);
    //colors
    lowColor = getRandomColor();
    medColor = getRandomColor();
    highColor = getRandomColor();
    //time limit
    timeLimit = getRandomInt(60, 360);
    //enemies
    enemiesAmount = getRandomInt(1, 4);
    //keys
    upKeyCode = 38;
    downKeyCode = 40;
    leftKeyCode = 37;
    rightKeyCode = 39;

    //update DOM
    $("#foodQuantity").prop("value", foodAmount);
    $("#lowScoreColor").prop("value", lowColor);
    $("#medScoreColor").prop("value", medColor);
    $("#highScoreColor").prop("value", highColor);
    $("#timeLimitNum").prop("value", timeLimit);
    $("#enemiesQuantity").prop("value", enemiesAmount);
    $("#upKeybutton").prop("value", ArrowUp);
    $("#downKeybutton").prop("value", ArrowDown);
    $("#leftKeybutton").prop("value", ArrowLeft);
    $("#rightKeybutton").prop("value", ArrowRight);

}

function initBoards() {
    var food_remain = foodAmount;
    var lowFoodRemain = Math.floor(foodAmount * 0.6);
    var medFoodRemain = Math.floor(foodAmount * 0.3);
    var highFoodRemain = Math.floor(foodAmount - lowFoodRemain - medFoodRemain);

    initBaseBoard();

    initNpcBoard();

    initPacmanBoard();



    
   

    function initPacmanBoard() {
        pacmanBoard = new Array();
        let cnt = 100;

        for (let i = 0; i < 10; i++) {
            pacmanBoard[i] = new Array();
            for (let j = 0; j < 10; j++) {
                if (baseBoard[i][j] == baseBoardCellType.WALL) {
                    pacmanBoard[i][j] = baseBoardCellType.WALL;
                    continue;
                } else {
                    pacmanBoard[i][j] = baseBoardCellType.BLANK;
                }
                let randomNum = Math.random();
                if (randomNum <= (1.0 * food_remain) / cnt) { //FOOD
                    if (placeFood(randomNum, i, j)) {
                        food_remain--;
                    }
                }
                cnt--;
            }
        }
        let pacmanCell = findRandomEmptyCell(pacmanBoard);
        while (npcBoard[pacmanCell[0]][pacmanCell[1]] == new Array()) {
            pacmanCell = findRandomEmptyCell(pacmanBoard);
        }
        pacmanPosition.i = pacmanCell[0];
        pacmanPosition.j = pacmanCell[1];
        pacmanBoard[pacmanCell[0]][pacmanCell[1]] = pacmanBoardCellType.PACMAN;


        while (food_remain > 0) { //Remaining food
            let emptyCell = findRandomEmptyCell(pacmanBoard);
            if (lowFoodRemain > 0) { //low score food
                pacmanBoard[emptyCell[0]][emptyCell[1]] = pacmanBoardCellType.LOWSCOREFOOD;
                lowFoodRemain--;
            }
            else if (medFoodRemain > 0) { //medium score food
                pacmanBoard[emptyCell[0]][emptyCell[1]] = pacmanBoardCellType.MEDSCOREFOOD;
                medFoodRemain--;
            }
            else if (highFoodRemain > 0) { //high score food
                pacmanBoard[emptyCell[0]][emptyCell[1]] = pacmanBoardCellType.HIGHSCOREFOOD;
                highFoodRemain--;
            }
            food_remain--;
        }
        //Special Berry
        let emptyBerryCell = findRandomEmptyCell(pacmanBoard);
        pacmanBoard[emptyBerryCell[0]][emptyBerryCell[1]] = pacmanBoardCellType.AVIVBERRY;
        //clock
        emptyClockCell = findRandomEmptyCell(pacmanBoard);
        pacmanBoard[emptyClockCell[0]][emptyClockCell[1]] = pacmanBoardCellType.CLOCK;
    }

    function placeFood(randomNum, x, y) {
        if (randomNum <= 0.6 && lowFoodRemain > 0) { //low score food
            pacmanBoard[x][y] = pacmanBoardCellType.LOWSCOREFOOD;
            lowFoodRemain--;
            return true;
        }
        else if (randomNum > 0.6 && randomNum <= 0.9 && medFoodRemain > 0) { //medium score food
            pacmanBoard[x][y] = pacmanBoardCellType.MEDSCOREFOOD;
            medFoodRemain--;
            return true;
        }
        else if (highFoodRemain > 0) { //high score food
            pacmanBoard[x][y] = pacmanBoardCellType.HIGHSCOREFOOD;
            highFoodRemain--;
            return true;
        }
        return false;
    }

    function initBaseBoard() {
        baseBoard = new Array(); //new game board
        for (let i = 0; i < 10; i++) {
            baseBoard[i] = new Array();
            //put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2) - MAX WALLS QUANTITY= 8
            for (let j = 0; j < 10; j++) {
                if ((i == 3 && j == 3) ||
                    (i == 3 && j == 4) ||
                    (i == 3 && j == 5) ||
                    (i == 6 && j == 1) ||
                    (i == 6 && j == 2)) {
                    baseBoard[i][j] = baseBoardCellType.WALL; //Wall=4
                }
                else {
                    baseBoard[i][j] = baseBoardCellType.BLANK;
                }
            }
        }
    }
}


function initNpcBoard() {
    npcBoard = new Array();
    npcPosition = new Array();
    for (let i = 0; i < 10; i++) {
        npcBoard[i] = new Array();
        for (let j = 0; j < 10; j++) {
            if (baseBoard[i][j] == baseBoardCellType.WALL) {
                npcBoard[i][j] = baseBoardCellType.WALL;
            }
            else {
                npcBoard[i][j] = baseBoardCellType.BLANK;
            }
        }
    }
    let enemiesCount = 0;
    while (enemiesAmount > enemiesCount) { //Remaining enemies;
        /*let emptyCell = findRandomEmptyCell(npcBoard);
        while (pacmanBoard[emptyCell[0]][emptyCell[1]] == pacmanBoardCellType.PACMAN) {
            emptyCell = findRandomEmptyCell(npcBoard);
        }
        let npcCell = [false, false, false, false, false];
        npcCell[enemiesCount] = true;
        npcBoard[emptyCell[0]][emptyCell[1]] = npcCell;
        npcPosition[enemiesCount] = new Object();
        npcPosition[enemiesCount].i = emptyCell[0]
        npcPosition[enemiesCount].j = emptyCell[1]
        enemiesCount++;
        */

        let emptyCell = new Array(2);
        let npcCell = [false, false, false, false, false];
        npcCell[enemiesCount] = true;
        if (enemiesCount == 0) {
            emptyCell[0] = 0;
            emptyCell[1] = 0;
        }
        else if (enemiesCount == 1) {
            emptyCell[0] = 9;
            emptyCell[1] = 9;
        }

        else if (enemiesCount == 2) {
            emptyCell[0] = 0;
            emptyCell[1] = 9;
        }
        else if (enemiesCount == 3) {
            emptyCell[0] = 9;
            emptyCell[1] = 0;
        }
        npcBoard[emptyCell[0]][emptyCell[1]] = npcCell;
        npcPosition[enemiesCount] = new Object();
        npcPosition[enemiesCount].i = emptyCell[0]
        npcPosition[enemiesCount].j = emptyCell[1]
        enemiesCount++;
    }

    if (!isEaten) {
        initNpcWild();
    }

}


function initNpcWild() {

    if (wildPosition == undefined) {
        //Wild npc
        let emptyCell = findRandomEmptyCell(npcBoard);
        /*while (pacmanBoard[emptyCell[0]][emptyCell[1]] == pacmanBoardCellType.PACMAN) {
            emptyCell = findRandomEmptyCell(npcBoard);
        }
        */
        wildPosition = new Object();
        wildPosition.i = emptyCell[0]
        wildPosition.j = emptyCell[1]
    }

    let npcCell = [false, false, false, false, false];
    npcCell[4] = true;

    npcBoard[wildPosition.i][wildPosition.j] = npcCell;

}

/*
function startBoard() {
    board = new Array(); //new game board
    score = 0;
    pac_color = "yellow";
    var cnt = 100;
    var food_remain = foodAmount;
    var pacman_remain = 1;
    start_time = new Date();
    for (var i = 0; i < 10; i++) {
        board[i] = new Array();
        //put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
        for (var j = 0; j < 10; j++) {
            if ((i == 3 && j == 3) ||
                (i == 3 && j == 4) ||
                (i == 3 && j == 5) ||
                (i == 6 && j == 1) ||
                (i == 6 && j == 2)) {
                board[i][j] = baseBoardCellType.WALL; //Wall=4
            }
            else {
                var randomNum = Math.random();
                if (randomNum <= (1.0 * food_remain) / cnt) {
                    food_remain--;
                    board[i][j] = baseBoardCellType.FOOD; //food = 1
                }
                else if (randomNum < (1.0 * (pacman_remain + food_remain)) / cnt) {
                    pacmanPosition.i = i;
                    pacmanPosition.j = j;
                    pacman_remain--;
                    board[i][j] = baseBoardCellType.PACMAN; //pacman = 2
                }
                else {
                    board[i][j] = baseBoardCellType.BLANK; //blank = 0
                }
                cnt--;
            }
        }
    }
    while (food_remain > 0) {
        var emptyCell = findRandomEmptyCell(board);
        board[emptyCell[0]][emptyCell[1]] = baseBoardCellType.FOOD; //food = 1
        food_remain--;
    }
}
*/

function findRandomEmptyCell(board) {
    var i = Math.floor(Math.random() * 9 + 1);
    var j = Math.floor(Math.random() * 9 + 1);
    while (board[i][j] != baseBoardCellType.BLANK) {
        i = Math.floor(Math.random() * 9 + 1);
        j = Math.floor(Math.random() * 9 + 1);
    }
    return [i, j];
}


function Draw() {
    canvas.width = canvas.width; //clean board
    lblScore.value = score;
    lblTime.value = time_elapsed;
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            //position 
            let center = new Object();
            center.x = i * cellSize + 30;
            center.y = j * cellSize + 30;
            //FIRST layer - pacmanBoard
            if (pacmanBoard[i][j] == pacmanBoard.PACMAN) {
                drawPacman(center);
            } else if (pacmanBoard[i][j] == pacmanBoardCellType.LOWSCOREFOOD) {
                drawFood(center, pacmanBoardCellType.LOWSCOREFOOD);
            } else if (pacmanBoard[i][j] == pacmanBoardCellType.MEDSCOREFOOD) {
                drawFood(center, pacmanBoardCellType.MEDSCOREFOOD);
            } else if (pacmanBoard[i][j] == pacmanBoardCellType.HIGHSCOREFOOD) {
                drawFood(center, pacmanBoardCellType.HIGHSCOREFOOD);
            } else if (pacmanBoard[i][j] == pacmanBoardCellType.AVIVBERRY) {
                drawBerry(center);
            } else if (pacmanBoard[i][j] == pacmanBoardCellType.CLOCK) {
                drawClock(center);
            } else if (pacmanBoard[i][j] == baseBoardCellType.WALL) {
                context.beginPath();
                context.rect(center.x - 30, center.y - 30, cellSize, cellSize);
                context.fillStyle = "grey"; //color
                context.fill();
            }

            //SECOND layer - npcBoard
            if (npcBoard[i][j] != baseBoardCellType.BLANK && baseBoard[i][j] != baseBoardCellType.WALL) {
                let npcCell = npcBoard[i][j];
                for (let k = 0; k < 5; k++) {
                    if (npcCell[k] == true) {
                        drawNPC(center, k);
                    }
                }
            }
        }
    }

    function drawFood(center, foodType) {
        context.beginPath();
        context.arc(center.x, center.y, 15, 0, 2 * Math.PI);
        let text = "";
        switch (foodType) {
            case pacmanBoardCellType.LOWSCOREFOOD:
                context.fillStyle = lowColor;
                text = "5";
                break;
            case pacmanBoardCellType.MEDSCOREFOOD:
                context.fillStyle = medColor;
                text = "15";
                break;
            case pacmanBoardCellType.HIGHSCOREFOOD:
                context.fillStyle = highColor;
                text = "25";
                break;
        }
        context.fill();

        context.beginPath();
        context.font = '10px serif';
        context.fillStyle = "Black";
        context.fillText(text, center.x - 4, center.y + 3);
        context.fill();
    }
    function drawBerry(center) {
        context.beginPath();
        context.arc(center.x + 10, center.y + 10, 7, 0, 2 * Math.PI);
        context.arc(center.x + 5, center.y + 5, 7, 0, 2 * Math.PI);
        context.arc(center.x, center.y, 7, 0, 2 * Math.PI);
        context.arc(center.x - 10, center.y - 10, 7, 0, 2 * Math.PI);
        context.arc(center.x - 5, center.y - 5, 7, 0, 2 * Math.PI);

        context.fillStyle = "Red";
        context.fill();
    }
    function drawClock(center) {
        context.beginPath();
        context.font = '10px serif';
        context.fillText("clock", center.x, center.y);
        context.fillStyle = "Black";
        context.fill();
    }

    function drawNPC(center, k) {
        //context.beginPath();
        //context.arc(center.x, center.y, 20, 0, 2 * Math.PI);
        let text = "";
        let color;
        switch (k) {
            case 0:
                color = "#8A0000";
                text = "enemy1";
                break;
            case 1:
                color = "#FAFF00";
                text = "enemy2";
                break;
            case 2:
                color = "#0039C1";
                text = "enemy3";
                break;
            case 3:
                color = "#E900FF";
                text = "enemy4";
                break;
            case 4:
                color = getRandomColor();
                text = "wild";
                break;
        }
        //context.fill();

        context.beginPath();
        context.fillStyle = color;
        context.arc(center.x, center.y, 20, Math.PI, 2 * Math.PI);
        context.lineTo(center.x + 20, center.y + 20);
        context.arc(center.x + 20 / 2, center.y + 20, 20 * 0.5, 0, Math.PI);
        context.arc(center.x + 20 / 2 - 20, center.y + 20, 20 * 0.5, 0, Math.PI);
        context.closePath();
        context.fill();

        context.beginPath();
        context.font = '10px serif';
        context.fillStyle = "Black";
        context.fillText(text, center.x - 15, center.y + 2);
        context.fill();

    }
}

function getAngle() {
    switch (lastKeyPressed) {
        case upKeyCode:
            return (-0.5 * Math.PI);
            break;
        case downKeyCode:
            return (0.5 * Math.PI);
            break;
        case leftKeyCode:
            return Math.PI;
            break;
        case rightKeyCode:
            return 0;
        default:
            return 0;
    }
}

function drawPacman(center) {
    //body - half circle
    context.beginPath();
    let angle = getAngle();
    if (!isMouthOpen) {
        context.arc(center.x, center.y, 30, 0.15 * Math.PI + angle, 1.85 * Math.PI + angle);
        isMouthOpen = true;
    }
    else {
        context.arc(center.x, center.y, 30, angle, 1.97 * Math.PI + angle);
        isMouthOpen = false;
    }
    context.lineTo(center.x, center.y);
    context.fillStyle = pac_color; //color
    context.fill();
    //eye
    context.beginPath();
    if (lastKeyPressed == upKeyCode) {
        context.arc(center.x - 15, center.y + 5, 5, angle, 2 * Math.PI + angle); // circle
    } else if (lastKeyPressed == downKeyCode) {
        context.arc(center.x - 15, center.y + 5, 5, angle, 2 * Math.PI + angle); // circle
    } else if (lastKeyPressed == leftKeyCode) {
        context.arc(center.x - 5, center.y - 15, 5, angle, 2 * Math.PI + angle); // !
    } else {
        context.arc(center.x + 5, center.y - 15, 5, angle, 2 * Math.PI + angle);
    }
    context.fillStyle = "black"; //color
    context.fill();
}



function UpdatePosition() {
    //removing previous pacman location
    pacmanBoard[pacmanPosition.i][pacmanPosition.j] = baseBoardCellType.BLANK;

    //updating packman location
    movePacman();
    moveNPCs();

    let enconteredEnemy = false;

    
    
    if (npcBoard[pacmanPosition.i][pacmanPosition.j] != baseBoardCellType.BLANK) {
        //interaction with enemies
        if (doesContainsEnemy(npcBoard[pacmanPosition.i][pacmanPosition.j])) {
            alert("remove 1 life");
            lifesRemain--;
            score = score-10;
            enconteredEnemy = true;
            initNpcBoard();
            let pacmanCell = findRandomEmptyCell(pacmanBoard);
            while (npcBoard[pacmanCell[0]][pacmanCell[1]] == new Array()) {
                pacmanCell = findRandomEmptyCell(pacmanBoard);
            }
            pacmanPosition.i = pacmanCell[0];
            pacmanPosition.j = pacmanCell[1];
            pacmanBoard[pacmanCell[0]][pacmanCell[1]] = pacmanBoardCellType.PACMAN;


        }
    }
    if (!enconteredEnemy) {
        //interaction with special character
        if (npcBoard[pacmanPosition.i][pacmanPosition.j] != baseBoardCellType.BLANK) {
            if (npcBoard[pacmanPosition.i][pacmanPosition.j][4] == true) {
                score = score + 50;
                npcBoard[pacmanPosition.i][pacmanPosition.j] = baseBoardCellType.BLANK;
                isEaten = true;
            }
        }
        //interaction with pacmanBoard elements
        if (pacmanBoard[pacmanPosition.i][pacmanPosition.j] == pacmanBoardCellType.LOWSCOREFOOD) {
            score = score + 5;
            foodRemain--;
        } else if (pacmanBoard[pacmanPosition.i][pacmanPosition.j] == pacmanBoardCellType.MEDSCOREFOOD) {
            score = score + 15;
            foodRemain--;
        } else if (pacmanBoard[pacmanPosition.i][pacmanPosition.j] == pacmanBoardCellType.HIGHSCOREFOOD) {
            score = score + 25;
            foodRemain--;
        } else if (pacmanBoard[pacmanPosition.i][pacmanPosition.j] == pacmanBoardCellType.AVIVBERRY) {
            lifesRemain++;
            alert("added a life");
        } else if (pacmanBoard[pacmanPosition.i][pacmanPosition.j] == pacmanBoardCellType.CLOCK) {
            timeLimit = timeLimit + 60;
            alert("increased time limit");
        }

        //actually move pacman
        pacmanBoard[pacmanPosition.i][pacmanPosition.j] = baseBoardCellType.PACMAN;
    }
    //updating time
    var currentTime = new Date();
    time_elapsed = (currentTime - start_time) / 1000;

    //Game logic
    if (score >= 20 && time_elapsed <= 10) {
        pac_color = "lime";
    }
    if (foodRemain == 0) { //All food eaten
        window.clearInterval(moveInterval);
        window.alert("Game completed");
    } else if (lifesRemain <= 0) {
        window.alert("Loser!");
    } else if (false) { //todo:TIME LIMIT
        if (score >= 100) {
            window.alert("Winner!");
        } else {
            window.alert("You are better than " + score + " points!");
        }
    } else {
        Draw();
    }

    function movePacman() {
        if (keysDown[upKeyCode]) {
            if (pacmanPosition.j > 0 && baseBoard[pacmanPosition.i][pacmanPosition.j - 1] != baseBoardCellType.WALL) {
                pacmanPosition.j--;
                lastKeyPressed = upKeyCode;
            }
        }
        if (keysDown[downKeyCode]) {
            if (pacmanPosition.j < 9 && baseBoard[pacmanPosition.i][pacmanPosition.j + 1] != baseBoardCellType.WALL) {
                pacmanPosition.j++;
                lastKeyPressed = downKeyCode;
            }
        }
        if (keysDown[leftKeyCode]) {
            if (pacmanPosition.i > 0 && baseBoard[pacmanPosition.i - 1][pacmanPosition.j] != baseBoardCellType.WALL) {
                pacmanPosition.i--;
                lastKeyPressed = leftKeyCode;
            }
        }
        if (keysDown[rightKeyCode]) {
            if (pacmanPosition.i < 9 && baseBoard[pacmanPosition.i + 1][pacmanPosition.j] != baseBoardCellType.WALL) {
                pacmanPosition.i++;
                lastKeyPressed = rightKeyCode;
            }
        }
    }

    function moveNPCs() {
        //todo
        npcMoveCycle = (npcMoveCycle + 1) % 4 //MPCs move every 4 cycles
        if (npcMoveCycle == 3) {
            //todo:move npcs
            let counter = 0;
            
            while(counter < enemiesAmount)
            {
                let npcCell = [false, false, false, false, false];
                npcCell[counter] = true;
                if (JSON.stringify(npcBoard [npcPosition[counter].i][npcPosition[counter].j]) == JSON.stringify(npcCell))
                {
                    npcBoard[npcPosition[counter].i][npcPosition[counter].j] = baseBoardCellType.BLANK;
                }
                else
                {
                    npcCell = npcBoard[npcPosition[counter].i][npcPosition[counter].j];
                    npcCell[counter] = false;
                    npcBoard[npcPosition[counter].i][npcPosition[counter].j] = npcCell;
                }
                moveNPC(counter);
                npcCell = [false, false, false, false, false];
                if (npcBoard[npcPosition[counter].i][npcPosition[counter].j] != baseBoardCellType.BLANK)
                {
                    npcCell = npcBoard[npcPosition[counter].i][npcPosition[counter].j];
                }
                npcCell[counter] = true;
                npcBoard[npcPosition[counter].i][ npcPosition[counter].j] = npcCell;
                counter++;

            }

           


        }
    }

    function doesContainsEnemy(npcCell) {
        if (npcCell == null) {
            return false;
        }
        for (let i = 0; i < 4; i++) {
            if (npcCell[i] == true) {
                return true;
            }
        }
    }
}


function moveNPC(npcCount) {
    while (true) {
        moveType = getRandomInt(1, 4);
        if (moveType == npcMoveType.RIGHT ) {
            if (npcPosition[npcCount].i < 9 && baseBoard[npcPosition[npcCount].i+1][npcPosition[npcCount].j] != baseBoardCellType.WALL) {
                npcPosition[npcCount].i++;
                return;
            }
        }
        else if (moveType == npcMoveType.LEFT) {
            if (npcPosition[npcCount].i > 0 && baseBoard[npcPosition[npcCount].i -1 ][npcPosition[npcCount].j] != baseBoardCellType.WALL) {
                npcPosition[npcCount].i--;
                return;
            }
        }
        else if (moveType == npcMoveType.UP) {
            if (npcPosition[npcCount].j > 0 && baseBoard[npcPosition[npcCount].i][npcPosition[npcCount].j - 1] != baseBoardCellType.WALL) {
                npcPosition[npcCount].j--;
                return;
            }
        }
        else if (moveType == npcMoveType.DOWN) {
            if (npcPosition[npcCount].j < 9  && baseBoard[npcPosition[npcCount].i][npcPosition[npcCount].j + 1] != baseBoardCellType.WALL) {
                npcPosition[npcCount].j++;
                return;
            }
        }

    }
}

/*
 * Returns a random integer between min(inclusive) and max(inclusive).
 * from: https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
*/
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Returns a random integer.
 * from: https://stackoverflow.com/questions/1484506/random-color-generator
 * */
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
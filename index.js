var table;
var gameId = 0;
var puzzle = [];
var solution = [];
var remaining = [9, 9, 9, 9, 9, 9, 9, 9, 9];
var isSolved = false;
var canSolved = true;
var timer = 0;
var pauseTimer = false;
var intervalId;
var gameOn = false;

// char-is stringad gadaqceva
function replaceCharAt(string, index, char) {
  if (index > string.length - 1) return string;
  return string.substr(0, index) + char + string.substr(index + 1);
}

function getGridInit() {
  var rand = [];
  for (var i = 1; i <= 9; i++) {
    var row = Math.floor(Math.random() * 9);
    var col = Math.floor(Math.random() * 9);
    var accept = true;
    for (var j = 0; j < rand.length; j++) {
      if ((rand[j][0] == i) | ((rand[j][1] == row) & (rand[j][2] == col))) {
        accept = false;
        i--;
        break;
      }
    }
    if (accept) {
      rand.push([i, row, col]);
    }
  }

  // axali carieli cxrilis inicializacia
  var result = [];
  for (var i = 0; i < 9; i++) {
    var row = "000000000";
    result.push(row);
  }

  // ricxvebis r
  for (var i = 0; i < rand.length; i++) {
    result[rand[i][1]] = replaceCharAt(
      result[rand[i][1]],
      rand[i][2],
      rand[i][0]
    );
  }

  return result;
}

// abrunebs scvetebs
function getColumns(grid) {
  var result = ["", "", "", "", "", "", "", "", ""];
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) result[j] += grid[i][j];
   
  }
  return result;
}

// abrunebs ujrebis ertobliobas/blokebs
function getBlocks(grid) {
  var result = ["", "", "", "", "", "", "", "", ""];
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++)
      result[Math.floor(i / 3) * 3 + Math.floor(j / 3)] += grid[i][j];
  }
  return result;
}

function generatePossibleNumber(rows, columns, blocks) {
  var psb = [];

  // titoeuli ujristvis amowmebs tu konkretuli ricxvi xom ar aris svetshi an sadme sadac emtxveva
  // tu ujrashi ukve weria ricxvi mashin savaraudo ricxvi swored es ricxvia
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      psb[i * 9 + j] = "";
      if (rows[i][j] != 0) {
        psb[i * 9 + j] += rows[i][j];
      } else {
        for (var k = "1"; k <= "9"; k++) {
          if (!rows[i].includes(k))
            if (!columns[j].includes(k))
              if (
                !blocks[Math.floor(i / 3) * 3 + Math.floor(j / 3)].includes(k)
              )
                psb[i * 9 + j] += k;
        }
      }
    }
  }
  return psb;
}

// cxrilis html-shi gamotana
function ViewPuzzle(grid) {
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[i].length; j++) {
      var input = table.rows[i].cells[j].getElementsByTagName("input")[0];
      addClassToCell(table.rows[i].cells[j].getElementsByTagName("input")[0]);
      if (grid[i][j] == "0") {
        input.disabled = false;
        input.value = "";
      } else {
        input.disabled = true;
        input.value = grid[i][j];
        remaining[grid[i][j] - 1]--;
      }
    }
  }
}

// konkretuli inputis wakitxva
function readInput() {
  var result = [];
  for (var i = 0; i < 9; i++) {
    result.push("");
    for (var j = 0; j < 9; j++) {
      var input = table.rows[i].cells[j].getElementsByTagName("input")[0];
      if (input.value == "" || input.value.length > 1 || input.value == "0") {
        input.value = "";
        result[i] += "0";
      } else result[i] += input.value;
    }
  }
  return result;
}

function checkValue(value, row, column, block, defaultValue, currectValue) {
  if (value === "" || value === "0") return 0;
  if (!(value > "0" && value < ":")) return 4;
  if (value === defaultValue) return 0;
  if (
    row.indexOf(value) != row.lastIndexOf(value) ||
    column.indexOf(value) != column.lastIndexOf(value) ||
    block.indexOf(value) != block.lastIndexOf(value)
  ) {
    return 3;
  }
  if (value !== currectValue) return 2;
  return 1;
}

function addClassToCell(input, className) {
  input.classList.remove("right-cell");
  input.classList.remove("worning-cell");
  input.classList.remove("wrong-cell");

  if (className != undefined) input.classList.add(className);
}

function updateRemainingTable() {
  for (var i = 1; i < 10; i++) {
    var item = document.getElementById("remain-" + i);
    item.innerText = remaining[i - 1];
    item.classList.remove("red");
    item.classList.remove("gray");
    if (remaining[i - 1] === 0) item.classList.add("gray");
    else if (remaining[i - 1] < 0 || remaining[i - 1] > 9)
      item.classList.add("red");
  }
}

function startTimer() {
  var timerDiv = document.getElementById("timer");
  clearInterval(intervalId);
  pauseTimer = false;
  intervalId = setInterval(function () {
    if (!pauseTimer) {
      timer++;
      var min = Math.floor(timer / 60);
      var sec = timer % 60;
      timerDiv.innerText =
        (("" + min).length < 2 ? "0" + min : min) +
        ":" +
        (("" + sec).length < 2 ? "0" + sec : sec);
    }
  }, 1000);
}

//****************************************************************************************************** */

// es funqcia aucileblad gaeshveba roca momxmarebeli gauchvebs programas
window.onload = function () {

  table = document.getElementById("puzzle-grid");
  var rippleButtons = document.getElementsByClassName("button");
  for (var i = 0; i < rippleButtons.length; i++) {
    rippleButtons[i].onmousedown = function (e) {
     
      var x = e.pageX - this.offsetLeft;
      var y = e.pageY - this.offsetTop;
   
      var rippleItem = document.createElement("div");
      rippleItem.classList.add("ripple");
      rippleItem.setAttribute("style", "left: " + x + "px; top: " + y + "px");

      var rippleColor = this.getAttribute("ripple-color");
      if (rippleColor) rippleItem.style.background = rippleColor;
      this.appendChild(rippleItem);

      setTimeout(function () {
        rippleItem.parentElement.removeChild(rippleItem);
      }, 1500);
    };
  }
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      var input = table.rows[i].cells[j].getElementsByTagName("input")[0];
      input.onchange = function () {
        //remove color from cell
        addClassToCell(this);

        function checkInput(input) {
          if (input.value[0] < "1" || input.value[0] > "9") {
            if (input.value != "?" && input.value != "؟") {
              input.value = "";
              alert("only numbers [1-9] and question mark '?' are allowed!!");
              input.focus();
            }
          }
        }
        checkInput(this);

      
        if (this.value > 0 && this.value < 10) remaining[this.value - 1]--;
        if (this.oldvalue !== "") {
          if (this.oldvalue > 0 && this.oldvalue < 10)
            remaining[this.oldvalue - 1]++;
        }

       
        canSolved = true;

        updateRemainingTable();
      };
      input.onfocus = function () {
        this.oldvalue = this.value;
      };
    }
  }
};

function newGame(difficulty) {
  var grid = getGridInit();

  var rows = grid;
  var cols = getColumns(grid);
  var blks = getBlocks(grid);

  var psNum = generatePossibleNumber(rows, cols, blks);

  solution = solveGrid(psNum, rows, true);

  timer = 0;
  for (var i in remaining) remaining[i] = 9;

  puzzle = makeItPuzzle(solution, difficulty);
  
  gameOn = difficulty < 5 && difficulty >= 0;

  ViewPuzzle(puzzle);
  updateRemainingTable();

  if (gameOn) startTimer();
}

//carieli ujrebis raodenoba damokidebulia sirtuleze, 
//shesabamisi formulis mixedvit rcheba konkretuli raodenoba ricxvebis
function makeItPuzzle(grid, difficulty) {
  /*
        difficulty:
        // expert   : 0;
        // hard     : 1;
        // Normal   : 2;
        // easy     : 3;
        // very easy: 4;
    */
  // 5 * difficulty + 20

  if (!(difficulty < 5 && difficulty > -1)) difficulty = 13;
  var remainedValues = 81;
  var puzzle = grid.slice(0);

  // funqcia shlis cifrebs ujrebidan da mat shesabamis simetrilobas da abrunebs darchenil mnisvhnelobebs
  function clearValue(grid, x, y, remainedValues) {
    function getSymmetry(x, y) {
      var symX = 8 - x;
      var symY = 8 - y;
      return [symX, symY];
    }
    var sym = getSymmetry(x, y);
    if (grid[y][x] != 0) {
      grid[y] = replaceCharAt(grid[y], x, "0");
      remainedValues--;
      if (x != sym[0] && y != sym[1]) {
        grid[sym[1]] = replaceCharAt(grid[sym[1]], sym[0], "0");
        remainedValues--;
      }
    }
    return remainedValues;
  }

  while (remainedValues > difficulty * 5 + 20) {
    var x = Math.floor(Math.random() * 9);
    var y = Math.floor(Math.random() * 9);
    remainedValues = clearValue(puzzle, x, y, remainedValues);
  }
  return puzzle;
}

function startGameButtonClick() {
  var difficulties = document.getElementsByName("difficulty");
  // difficulty:
  //  0 expert
  //  1 hard
  //  2 normal
  //  3 easy
  //  4 very easy
  //  5 solved

  var difficulty

  // get difficulty value
  for (var i = 0; i < difficulties.length; i++) {

    //romeli indexsic aris monishnuli array-shi
    if (difficulties[i].checked) {
      newGame(4 - i);
      difficulty = i;
      break;
    }
  }
  if (difficulty > 4) newGame(5);




  hideDialogButtonClick("dialog");
  // view for new game 
  document.getElementById("timer-label").innerText = "Time";
  document.getElementById("timer").innerText = "00:00";
  document.getElementById("game-difficulty-label").innerText =
    "Game difficulty";

  document.getElementById("game-difficulty").innerText =
    difficulty < difficulties.length
      ? difficulties[difficulty].value
      : "solved";
}

//****************************************************************************************************** */

//finish
function checkfinishclick() {
  if (gameOn) {
    var currentGrid = [];
    currentGrid = readInput();
    var columns = getColumns(currentGrid);
    var blocks = getBlocks(currentGrid);

    var errors = 0;
    var currects = 0;

    for (var i = 0; i < currentGrid.length; i++) {
      for (var j = 0; j < currentGrid[i].length; j++) {
        if (currentGrid[i][j] == "0") continue;

        var result = checkValue(
          currentGrid[i][j],
          currentGrid[i],
          columns[j],
          blocks[Math.floor(i / 3) * 3 + Math.floor(j / 3)],
          puzzle[i][j],
          solution[i][j]
        );

        addClassToCell(
          table.rows[i].cells[j].getElementsByTagName("input")[0],
          result === 1
            ? "right-cell"
            : result === 2
            ? "worning-cell"
            : result === 3
            ? "wrong-cell"
            : undefined
        );

        if (result === 1 || result === 0) {
          currects++;
        } else if (result === 3) {
          errors++;
        }
      }
    }

    if (currects ==81) {
      gameOn = false;
      pauseTimer = true;
      document.getElementById("game-difficulty").innerText = "Solved";
      clearInterval(intervalId);
      alert("Congrats, You solved it.");
    } 
    else{
      alert("It is not filled correctly!!!!!!");
    }
  }
}

// pause \ continue button click function
function pauseGameButtonClick() {
  var icon = document.getElementById("pause-icon");
  var label = document.getElementById("pause-text");

  if (pauseTimer) {
    icon.innerText = "";
    label.innerText = "Pause";
    table.style.opacity = 1;
  } else {
    icon.innerText = "";
    label.innerText = "Continue";
    table.style.opacity = 0;
  }

  pauseTimer = !pauseTimer;
}

function StopGameButtonClick() {
  var icon = document.getElementById("pause-icon");
  var label = document.getElementById("pause-text");

  
  let age = prompt('do you want to solve it?',"yes");
  if(age=="yes"){

    if (gameOn) {
      for (var i in remaining) remaining[i] = 9;
  
      ViewPuzzle(solution);
  
     updateRemainingTable();
     gameOn = false;
     pauseTimer = true;
   clearInterval(intervalId);
     document.getElementById("game-difficulty").innerText = "Solved";
  }}
  else{
    gameOn = false;
    pauseTimer = true;
    clearInterval(intervalId);
    document.getElementById("game-difficulty").innerText = "stoped";
  
  }
  }



window.onclick = function (event) {
  var d1 = document.getElementById("dialog");
  var d2 = document.getElementById("about-dialog");
  var m1 = document.getElementById("more-option-list");

  if (event.target == d1) {
    hideDialogButtonClick("dialog");
  } else if (event.target == d2) {
    hideDialogButtonClick("about-dialog");
  } else if (m1.style.visibility == "visible") {
    hideMoreOptionMenu();
  }
};


// show more option menu
function moreOptionButtonClick() {
  var moreOptionList = document.getElementById("more-option-list");
  setTimeout(function () {
    if (moreOptionList.style.visibility == "hidden") {
      moreOptionList.style.visibility = "visible";
      setTimeout(function () {
        moreOptionList.style.maxWidth = "160px";
        moreOptionList.style.minWidth = "160px";
        moreOptionList.style.maxHeight = "160px";
        moreOptionList.style.opacity = "1";
      }, 50);
    }
  }, 50);
}
// hide more option menu
function hideMoreOptionMenu() {
  var moreOptionList = document.getElementById("more-option-list");
  if (moreOptionList.style.visibility == "visible") {
    moreOptionList.style.maxWidth = "40px";
    moreOptionList.style.minWidth = "40px";
    moreOptionList.style.maxHeight = "10px";
    moreOptionList.style.opacity = "0";
    setTimeout(function () {
      moreOptionList.style.visibility = "hidden";
    }, 175);
  }
}

// restart game
function restartButtonClick() {
  if (gameOn) {
    for (var i in remaining) remaining[i] = 9;

    ViewPuzzle(puzzle);
   updateRemainingTable();
    timer = -1;
  }
}

// danebeba
function SurrenderButtonClick() {
  let age = prompt('Are you sure you cannot solve this and need help?',"yes");
  if(age=="yes"){
    alert(  "I will help the loser like you, but then you must give me your left KIDNEY okay? ");
  if (gameOn) {
    for (var i in remaining) remaining[i] = 9;

    ViewPuzzle(solution);

   updateRemainingTable();
   gameOn = false;
   pauseTimer = true;
 clearInterval(intervalId);
   document.getElementById("game-difficulty").innerText = "Solved";
}}}


function showDialogClick(dialogId) {
  var dialog = document.getElementById(dialogId);
  var dialogBox = document.getElementById(dialogId + "-box");
  dialogBox.focus();
  dialog.style.opacity = 0;
  dialogBox.style.marginTop = "-500px";
  dialog.style.display = "block";
  dialog.style.visibility = "visible";

  setTimeout(function () {
    dialog.style.opacity = 1;
    dialogBox.style.marginTop = "64px";
  }, 200);
}
function hideDialogButtonClick(dialogId) {
  var dialog = document.getElementById(dialogId);
  var dialogBox = document.getElementById(dialogId + "-box");
  dialog.style.opacity = 0;
  dialogBox.style.marginTop = "-500px";

  setTimeout(function () {
    dialog.style.visibility = "collapse";
    //dialog.style.display = "none";
  }, 500);
}

//////////////////////////////////////////////////////////////
function solveGrid(possibleNumber, rows, startFromZero) {
  var solution = [];
  var result = nextStep(0, possibleNumber, rows, solution, startFromZero);
  if (result == 1) return solution;
}
function nextStep(level, possibleNumber, rows, solution, startFromZero) {
 
  var x = possibleNumber.slice(level * 9, (level + 1) * 9);
  var y = generatePossibleRows(x);
  if (y.length == 0) return 0;

  var start = startFromZero ? 0 : y.length - 1;
  var stop = startFromZero ? y.length - 1 : 0;
  var step = startFromZero ? 1 : -1;
  var condition = startFromZero ? start <= stop : start >= stop;

  for (var num = start; condition; num += step) {
    var condition = startFromZero ? num + step <= stop : num + step >= stop;
    for (var i = level + 1; i < 9; i++) solution[i] = rows[i];
    solution[level] = y[num];
    if (level < 8) {
      /*if (solution[4] === undefined) {
                var x = 0;
                x++;
            }*/
      var cols = getColumns(solution);
      var blocks = getBlocks(solution);

      var poss = generatePossibleNumber(solution, cols, blocks);
      if (nextStep(level + 1, poss, rows, solution, startFromZero) == 1)
        return 1;
    }
    if (level == 8) return 1;
  }
  return -1;
}
function generatePossibleRows(possibleNumber) {
  var result = [];

  function step(level, PossibleRow) {
    if (level == 9) {
      result.push(PossibleRow);
      return;
    }

    for (var i in possibleNumber[level]) {
      if (PossibleRow.includes(possibleNumber[level][i])) continue;
      step(level + 1, PossibleRow + possibleNumber[level][i]);
    }
  }
  step(0, "");
  return result;
}

var STATE = {
    init: 0,
    afterCal: 1,
    err: 2,
};

var resultStr = "0";
var calState = STATE.init;
var operator = null;
var inputNumStr = null;
let DIGITAL_LIMIT = 14;

$(document).ready(function() {
  // do nothing
});

$( document ).on( "keydown", function( event ) {
  console.log("keycode:" + event.keyCode); 
  var keyCode = event.which || event.keyCode;
  if (keyCode >= 48 && keyCode <= 57) {
    // 0 -> 9
    dispatchInput("Num", String(keyCode - 48));
  } else if (keyCode == 67) {
    // C
    dispatchInput('C', null);
  } else {
    // TODO: do not have time to implement here. 
  }
});

$(document).on("click","button", function() {
  var value = $(this).attr("value");
  var type = $(this).attr("type");

  dispatchInput(type, value);
});

function dispatchInput(type, value) {
  if (calState == STATE.err) {
    if (type !== 'C') {
      return;
    }
  }

  switch (type) {
    case 'C':
      clearResult();
      break;
    case '!':
      setReverseNumber();
      break;
    case '%':
      calPercentage();
      break;
    case 'Ope':
      storeOperator(value);
      break;
    case '.':
      setFloatDot();
      break;
    case '=':
      makeCal();
      break;
    case 'ClH':
      clearHistory();
      break;
    case 'Num':
      inputNumber(value);
      break;
    case 'HNum':
      inputHistoryNumber(value);
      break;
    default:
      console.log("bad type=" + type + ", value" + value);
  }
}

function displayInfo(resultString) {
  if (resultString === "" || resultString == null) {
    $(".infoScreen").text(" ");
  } else {
    $(".infoScreen").text(resultString);
  }
}

function displayResult(resultString, isCalResult) {
  
  console.log("resultString=" + resultString);
  
  if (resultString === "" || resultString == null) {
    $(".screen").text("0");
  } else if (!isNumber(resultString)) {
    $(".screen").text("0");
    $(".infoScreen").text("Err: " + resultString);
    calState = STATE.err;
  } else if (resultString.match(/[-0-9]/g).length >= DIGITAL_LIMIT) {
    
    if (isCalResult) {
      // user made a calculation, and the result met digital limit.
      var dotIndex = resultString.indexOf('.');
      console.log("dotIndex=" + dotIndex);
      if (dotIndex < DIGITAL_LIMIT && dotIndex > -1) {
        resultString = resultString.substring(0, DIGITAL_LIMIT);
        $(".screen").text(resultString);
        return;
      }
    }
    
    $(".screen").text("0");
    $(".infoScreen").text("Err: Digit Limit Met");
    calState = STATE.err;
  } else {
    $(".screen").text(resultString);
  }
}
  
function isFloatStr(n){
    return (!isNaN(value) && value.toString().indexOf('.') != -1);
}

function isNumber(x){ 
  if (typeof(x) != 'number' && typeof(x) != 'string') {
    return false;
  } else { 
    return (x == parseFloat(x) && isFinite(x));
  }
}

function clearResult() {
  resultStr = "0";
  operator = null;
  inputNumStr = null;
  calState = STATE.init;
  displayResult("");
  displayInfo("");
}

function setFloatDot() {
  if (resultStr == null) {
    resultStr = "0.";
    displayResult(resultStr);
    return;
  }
  
  var hasDot = (resultStr.indexOf('.') >= 0);
  console.log("hasDot:" + hasDot);
  if (!hasDot) {
    // need to add a '.' to the number 
    // for example: 0  ->  0.
    resultStr = resultStr + '.';
    displayResult(resultStr);
  }
}

function inputNumber(entry) {
  switch(calState) {
    case STATE.afterCal:
      resultStr = entry;
      calState = STATE.init;
      break;
    case STATE.init:
      if (resultStr === "0" || resultStr == null) {
        resultStr = entry;
      } else {
        resultStr = resultStr + entry;
      }
      break;
  }
  
  displayResult(resultStr);
}

function storeOperator(entry) {
  
  if (operator == null) { 
    // user input 9 -> +
    inputNumStr = resultStr;
    resultStr = null;
    operator = entry;
    displayInfo(entry);
  } else {
    // operator != null
    if (inputNumStr != null && resultStr != null)  {
      // user input 9 -> + -> 3 -> +
      makeCal();
      if (calState == STATE.err) {
        return;
      }
      storeOperator(entry)
    }
  } 
}

function makeCal() {
  if (resultStr == null || operator == null) {
    console.log("resultStr = " + resultStr + ", operator = " + operator);
    return;
  }
  
  var result;
  
  switch(operator) {
    case "+":
      result = Decimal(inputNumStr).add(resultStr);
      break;
    case "-":
      result = Decimal(inputNumStr).sub(resultStr);
      break;
    case "x":
      result = Decimal(inputNumStr).mul(resultStr);
      break;
    case "/":
      result = Decimal(inputNumStr).div(resultStr);
      break;
    default:
      console.log("err operator:" + operator);
  }
  var historyRecord =  '<tr><td>' + 
                       '<button type="HNum" value="' + inputNumStr + '" class="btn btn-info">' + inputNumStr + '</button> ' + 
                       operator + ' ' +
                       '<button type="HNum" value="' + resultStr + '" class="btn btn-info">' + resultStr + '</button> = ' +
                       '<button type="HNum" value="' + result.toString() + '" class="btn btn-info">' + result.toString() + '</button>' +
                       '</td></tr>';
  //console.log(historyRecord);
  resultStr = result.toString();
  inputNumStr = null;
  operator = null;
  displayInfo("");
  displayResult(resultStr, true);
  
  if (calState != STATE.err) {
    $( ".resultHistory" ).prepend(historyRecord);
    calState = STATE.afterCal;
  }
}

function setReverseNumber() {
  var result = Decimal(resultStr);
  if (result.isZero()) {
    //do nothing;
    return;
  } else if (result.isNeg()) {
    resultStr = result.abs().toString();
  } else {
    resultStr = Decimal(0).minus(result).toString();
  }
  displayResult(resultStr);
}
  
function calPercentage() {
  
  var result = Decimal(resultStr);
  if (result.isZero()) {
    //do nothing;
    return;
  }
  
  resultStr = result.div(100).toString();
  displayResult(resultStr);
}

function clearHistory() {
  $( ".resultHistory" ).html("");
}

function inputHistoryNumber(value) {
  switch(calState) {
    case STATE.afterCal:
      resultStr = value;
      calState = STATE.init;
      break;
    case STATE.init:
      resultStr = value;
      break;
  }
  
  displayResult(resultStr);
}
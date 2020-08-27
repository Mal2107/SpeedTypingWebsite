const api = "http://api.quotable.io/random";



const quoteInput = document.getElementById('quote-input');
const quoteDisplay = document.getElementById('quote-content');
const timer = document.getElementById('timer');
const resultsContainer  = document.getElementById('resultsContainer');
var quoteLettersArr = [];
var keypress = 0;
var quote = '';
var myTimer;
var input = [];
var startTyping = false;
var correctStrokes = 0;
var incorrectStrokes = 0;
var strokes = 0;
var counter = 0;
var userInputSplitIntoWords = [];




var currWordIndex = 0;
var currWord;
var inputLetters = [];
var newWord = "";
var prevLengthOfUserInput;
var currLengthOfUserInput;
var readyToGoToPrevWord = false;

var userInputStack = [[]];



var currentWordIndex = 0;
var prevLengthOfUserInputString = 0;
var eitherBackOrFront = false;
var userCurrentWord = "";

function emptyAll(){
    userCurrentWord=0;
    eitherBackOrFront = false;
    currWordIndex=0;
    userCurrentWord = "";
    startTyping = false;
    userInputStack = [[]];
    prevLengthOfUserInputString = 0;
}

quoteInput.addEventListener('input',()=>{
    
    if(startTyping===false){
        startTyping = true;
        startTimer();
    }
    const actualWord = quote.split(' ')[currWordIndex];
    const letters = quoteInput.value.split('')
    const newChar = letters[letters.length-1];
    console.log("new char is "+newChar);
    console.log("current word length is "+userCurrentWord.length);
    

    if(prevLengthOfUserInputString<letters.length){
        console.log("Adding letters! "+currWordIndex);
        if(newChar===' ' && userInputStack[currWordIndex].length>0 && userInputStack[currWordIndex].join('').replace(/\s+/g, '').length>0){
            console.log("Current word is "+userInputStack[currWordIndex].join().replace(/\s+/g, ''));
            console.log("New word");
            if((userInputStack.length)===quote.split(' ').length){
                calcWordPerMin();
                stopTimer();
                emptyAll();
                //renderNextQuote();
                return ;
            }
            currWordIndex+=1;
            userInputStack[currWordIndex] = [];
            const wordSpanList = document.getElementsByClassName('wordSpans');
            wordSpanList[currWordIndex].classList.add('highlight');
            wordSpanList[currWordIndex-1].classList.remove('highlight');
        }else{
            userInputStack[currWordIndex].push(newChar);
            const currWord = userInputStack[currWordIndex].join('');
            const wordSpanList = document.getElementsByClassName('wordSpans');
            if(currWord.length<=actualWord.length){
                if(currWord[currWord.length-1]===actualWord[currWord.length-1]){
                    console.log("Correct character");
                    correctStrokes+=1;
                    const charSpanList = wordSpanList[currWordIndex].getElementsByClassName('charSpan');
                    charSpanList[currWord.length-1].classList.add('correct');
                    charSpanList[currWord.length-1].classList.remove('incorrect');
                }else{
                    const charSpanList = wordSpanList[currWordIndex].getElementsByClassName('charSpan');
                    incorrectStrokes+=1;
                    charSpanList[currWord.length-1].classList.add('incorrect');
                    charSpanList[currWord.length-1].classList.remove('correct');
                }
            }
            console.log(userInputStack);
        }
        
    }else{
        console.log("Removing letters "+currWordIndex);
        if(userInputStack[currWordIndex].length!==0){
            console.log("Deleting letters");
            userInputStack[currWordIndex].pop();
            console.log(userInputStack);
        }else{
            console.log("Going back one word");
            const wordSpanList = document.getElementsByClassName('wordSpans');
            wordSpanList[currWordIndex].classList.remove('highlight');
            wordSpanList[currWordIndex-1].classList.add('highlight');
            currWordIndex-=1;
        }
    }
    prevLengthOfUserInputString = letters.length;   
});

quoteInput.addEventListener('click',function(event){
    console.log("I was clicked");
    if(startTyping){
        console.log("Prevent default");
        quoteInput.blur();
        setTimeout(function(){ 
            quoteInput.focus();
        }, 50);
        
    }
});
quoteInput.addEventListener('keydown',function(e){
    if([37, 38, 39, 40].indexOf(e.keyCode) > -1){ 
        e.preventDefault(); 
    }
});

function getRandomQuote(){
   return fetch(api).then(response=>response.json()).then(data=>data.content);
}


let startTime;
function startTimer(){
    timer.innerText = 0;
    startTime = new Date();
    myTimer = setInterval(() => {
        timer.innerText = getTimerTime();
    }, 1000);
}

function calcWordPerMin(){
    const timeTake = timer.innerText/60;
    console.log("Time taken is "+timeTake);
    var wrongWords = 0;
    const finalUserInput = quoteInput.value.split(' ');
    const quoteWords = quote.split(' ');
    var totalEntries = 0;
    quoteWords.forEach((actualWord,index)=>{
        totalEntries+=finalUserInput[index].length;
        if(actualWord!==finalUserInput[index]){
            wrongWords+=1;
        }
        totalEntries+=1;
    });
    console.log("Total enteries are "+totalEntries);
    console.log("The total uncorrected errors are "+wrongWords);
    console.log("Time in minutes is "+timeTake);
    const grossWPM = Math.floor((finalUserInput.length-1)/timeTake);
    var netWPM = Math.floor(grossWPM - (wrongWords/timeTake));
    if(netWPM<0){
        netWPM=0;
    }

    const displayGrossWPM = document.getElementById('displayGrossWPM');
    const displayNetWPM = document.getElementById('displayNetWPM');
    const displayWS = document.getElementById('displayWrongKeyStrokes');
    const displayKS = document.getElementById('displayTotalKeyStrokes');
    const displayAcc = document.getElementById('displayAccuracy');
    displayWS.innerText = incorrectStrokes;
    displayAcc.innerText = round(((correctStrokes/(correctStrokes+incorrectStrokes))*100),2)+"%";
    displayKS.innerText = incorrectStrokes+correctStrokes;
    resultsContainer.classList.remove('hide');
    
    displayGrossWPM.innerText = grossWPM;
    displayNetWPM.innerText = netWPM;

    console.log("Wrong words "+wrongWords);



}
function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
} 

function stopTimer(){
    clearInterval(myTimer);
    timer.innerText = 0;
}

function getTimerTime(){
    return Math.floor((new Date() -startTime)/1000);
}

async function renderNextQuote(){
    correctStrokes = 0;
    incorrectStrokes = 0;
    strokes = 0;
    counter = 0;
    keypress = 0;
    resultsContainer.classList.add('hide');
    quote = await getRandomQuote();
    const characters= quote.split('');
    const words = quote.split(' ');
    quoteLettersArr = characters;
    quoteDisplay.innerText = '';
    quoteInput.value = null;
    var count = 0;
    words.forEach((word,index)=>{
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('wordSpans');
        if(index==0){
            wordSpan.classList.add('highlight');
        }
        var characters = word.split('');
        characters.forEach(char => {
            const charSpan = document.createElement('span');
            charSpan.classList.add('charSpan');
            count+=1;
            charSpan.innerText = char; 
            wordSpan.append(charSpan);
        });
        const spaceSpan = document.createElement('span');
        spaceSpan.innerText = ' '; 
        spaceSpan.classList.add('charSpan');
        quoteDisplay.append(spaceSpan);
        quoteDisplay.append(wordSpan);
    });
    currWord = quote.split(' ')[0];
    console.log(currWord);
    startTyping=false;   
}

renderNextQuote();
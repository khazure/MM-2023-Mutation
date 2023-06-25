/**
 * Unused code for old effects
 */

  // https://codepen.io/alvarotrigo/pen/eYEqPZa 
  // new plan:
  // - doMorph when phrasechange detected within a time frame
  // --> ex. 0.25s to nextphrase's start time, initiate morph (morph out)
  // --> ex. 0.25s after currentPhrase's start time, be morphing (morph in)
  // - else doCooldown 
  //    
  function morphAnimate(time) {
}

function textHighlighting() {
    // unit is at word level
    if (unit.contains(now)) {
     if (currPhrase === null || currPhrase !== unit.parent) {

       // if new phrase, create the span objects
       currPhrase = unit.parent;
       let textContainer = id("text1");

       // clear previous
       textContainer.innerHTML = "";

       unit.parent.children.forEach(child => {
         let word = document.createElement("span");
         word.textContent = child.text;
         word.id = child.text.replace(" ", "-");

         textContainer.append(word);
       });
     }

     // if word is new,
     // then identify current word in span objects and highlight
     if (currWord === null || currWord !== unit) {
       currWord = unit;

       let activeWord = qs(".active-word")
       if (activeWord) {
         activeWord.classList.remove("active-word");
       }
       let wordId = unit.text.replace(" ", "-");
  

       id(wordId).classList.add("active-word"); 
     }
   }
 }

 function oldTextMorphing() {
   if (unit.contains(now)) {
     id("text1").textContent = unit.text;
     id("text2").textContent = unit.next.text;  

     let unitInterval = unit.endTime - unit.startTime;

     // num from 0 to 1 representing progress of current unit. x
     let intervalFrac = (now - unit.startTime) / unitInterval;

     // follows an upsidedown parabola, max is 1, min is 0
     let y = -Math.pow(((2 * intervalFrac) - 1), 2) + 1;

     //id("text1").style.opacity = y;
     id("text1").style.filter = "blur(" + (1 - y) * 6 + "px)";

     // if next phrase comes within morphTime
     // if (unit.next.startTime - now <= morphTime) {
     //   const diff = (unit.next.startTime - now) / morphTime;
     //   console.log("morph into next word with diff: " + diff);

     //   id("text1").textContent = unit.text;
     //   id("text2").textContent = unit.next.text;  

     //   // here, diff 1 --> 0
     //   id("text1").style.opacity = diff;
     //   id("text2").style.opacity = 1 - diff;
     // } else if (now - unit.previous.endTime < morphTime) {
     //   // if current phrase is within [morphTime] of the previous page
     //   const diff = (now - unit.previous.endTime) / morphTime;

     //   console.log("morphing from last word with diff: " + diff)

     //   id("text1").textContent = unit.previous.text;
     //   id("text2").textContent = unit.text;  

     //   // here, diff 0 --> 1
     //   id("text1").style.opacity = 1 - diff;
     //   id("text2").style.opacity = diff;
     // } else {
     //   id("text1").textContent = unit.text;
     //   id("text2").textContent = unit.next.text;  

     //   console.log("solid text");
     //   id("text1").style.opacity = 1;
     //   id("text2").style.opacity = 0;
     // }
   }
 }


 // goes inside animate, animates per word
        // if (currWord.text.includes("（")) {
        //   inParen = true;
        //   console.log("in paren");
        // } else if (currWord.text.includes("）")) {
        //   inParen = false;
        //   console.log("exiting paren")
        // }

        // let word = document.createElement("span");
        // word.textContent = currWord.text;

        // let textContainer = qs(".lyric:last-child");

        // textContainer.append(word);

        // let activeWord = qs(".active-word")
        // if (activeWord) {
        //   activeWord.classList.remove("active-word");
        // }
        // let wordId = unit.text.replace(" ", "-");
   

        // id(wordId).classList.add("active-word"); 
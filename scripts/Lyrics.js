import { Player } from "textalive-app-api";

'use strict';

/**
 * Animates the lyrics of the composition,
 * and any other HTML element
 */

  const player = new Player(
  { 
    app: {token: "8oZeCHYcDmC9Olyu"},
    mediaElement: document.querySelector("#media"),
    mediaBannerPosition: "bottom right",
    valenceArousalEnabled: true
  });

  const FIRST_CHORUS_START = 54754.3;
  const FIRST_CHORUS_END = 80359.1;

  const SECOND_CHORUS_START = 110764.6;
  const SECOND_CHORUS_END = 136369.4;

  const END_TIME = 165015;

  // intro animation duration (ms)
  const INTRO_DURATION = 500;

  // outro animation duration (ms)
  const OUTRO_DURATION = 200;

  // Keeps track of the current lyric unit at phrase level
  let currPhrase = null;

  // Keeps track of current lyric at word level
  let currWord = null;

  // keeps track of current beat
  let currBeat = null;

  let currBeatRatio = null;

  // keeps track of current chord
  let currChord = null;

  let currChordRatio = null;

  // keeps track of starting time for miku's speech in parenthesises
  let parenStart = null;

  // keeps track of mouse position
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  /**
   * Called when app is ready, before TextAlive is finished loading completely
   */
  function beforeLoad() {
    // enable drag on draggable elements
    qsa(".window").forEach(element => {
      element.querySelector(".window-header").addEventListener("mousedown", dragMouseDown);
    });
  }

/**
 * Called when all TextAlive processes are done loading
 */
function init() {

  qsa(".play-btn").forEach(btn => {
    btn.addEventListener("click", playMusic);
  });

  id("pause-btn").addEventListener("click", pauseMusic);
  id("reset-btn").addEventListener("click", resetMusic);
  id("volume-level").addEventListener("input", changeVolume);
  qs("body").addEventListener("mousemove", moveGradient);

  // set volume initially
  changeVolume();

  //temp:
  id("chorus-btn").addEventListener("click", jumpChorus);
  id("jump-btn").addEventListener("click", jumpMusic);
  id("2nd-chorus-btn").addEventListener("click", jumpSecondChorus);

  // show finished loading pop up
  id('finished-loading-pop-up').classList.remove("hidden");
  
  // remove loading pop up
  qs('.window').classList.add("hidden");
}

// for draggable windows
// https://www.w3schools.com/howto/howto_js_draggable.asp
function dragMouseDown(e) {
  e = e || window.event;
  e.preventDefault();
  let currTarget = e.currentTarget.parentNode;
  // get the mouse cursor position at startup:
  pos3 = e.clientX;
  pos4 = e.clientY;
  document.onmouseup = closeDragElement;
  // call a function whenever the cursor moves:
  document.onmousemove = (event) => {
    elementDrag(event, currTarget);
  };
}

function elementDrag(e, elmnt) {
  e = e || window.event;
  e.preventDefault();
  // calculate the new cursor position:
  pos1 = pos3 - e.clientX;
  pos2 = pos4 - e.clientY;
  pos3 = e.clientX;
  pos4 = e.clientY;
  // set the element's new position:
  elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
  elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
}

function closeDragElement() {
  // stop moving when mouse button is released:
  document.onmouseup = null;
  document.onmousemove = null;
}

/**
 * Animates the word this function is assigned to
 * @param {*} now - current timestamp
 * @param {*} unit - unit to be animated
 */
const animateChar = function (now, unit) {
  // unit is at character level
  // select phrases 300ms in advance
  if (unit.contains(now + INTRO_DURATION)) {

    if (currPhrase === null || currPhrase !== unit.parent.parent) {

      // if new phrase, create the new line for it
      currPhrase = unit.parent.parent;

      prepareForNewPhrase();

      const textContainer = qs(".current-container");
      
      // clear for now
      textContainer.innerHTML = "";

      const wrapper = document.createElement("h1");
      const phraseContainer = document.createElement("span");
      wrapper.appendChild(phraseContainer);

      let encounteredParen = false;

      // loop through each word in the new phrase
      unit.parent.parent.children.forEach(word => {

        // loop through each character in the word
        word.children.forEach((child) => { // child = character
          if (child.text.includes("（")) {
            encounteredParen = true;
            parenStart = child.startTime;
            setTimeout(() => {
              id("speech-bubble").innerHTML = "";
            }, OUTRO_DURATION);
          }

          if (encounteredParen) {

            // add words to miku's speech bubble
            // on timeout to prevent bugs
            setTimeout(() => {
              let word = document.createElement("span");
              word.textContent = child.text.replace("（", "").replace("）", "");
              id("speech-bubble").append(word);
            }, OUTRO_DURATION);
          } else {

            // preadd lyrics to container
            // let word = document.createElement("span");
            // word.textContent = child.text;
            // //word.classList.add("hidden-visibility");
            // word.id = child.startTime;

            // word.style.animationDelay = "0." + index + "s";

            // textContainer.appendChild(word);

            // add whitespace
            // let whiteSpace = document.createTextNode("\u00A0");
            // textContainer.appendChild(whiteSpace);
      
            // phrase only
            phraseContainer.textContent = phraseContainer.textContent + child.text;

          }
        });
      });

      phraseContainer.classList.add("lyric-intro-animation");
      textContainer.appendChild(wrapper);
    } else {
      // same phrase as current one

      // outro animation if bottom text is ending
      // now + intro-animation-duration + outro-animation-duration
      if(qs("#bottom-text.current-container") &&
        (now + INTRO_DURATION + OUTRO_DURATION) > currPhrase.endTime) {
        qs("#top-text h1 span").classList.replace("lyric-intro-animation", "lyric-outro-animation");
        qs("#bottom-text h1 span").classList.replace("lyric-intro-animation", "lyric-outro-animation");
        id("speech-bubble").classList.replace("bounce-in", "lyric-outro-animation");
      }
    }

    // if char is new
    if (currWord === null || currWord !== unit) {
      currWord = unit;

      // if the time for miku's speech happens, show it (300ms before)
      let bubbleClass = id("speech-bubble").classList;
      (parenStart && now >= parenStart - (INTRO_DURATION + OUTRO_DURATION)) 
        ? bubbleClass.replace("lyric-outro-animation", "bounce-in") : null;

      // for each child with id in currentContainer, show if time is past
      // qs(".current-container").childNodes.forEach((word) => {
      //   (word.id && now >= parseInt(word.id)) && (word.classList.remove("hidden-visibility"));
      // });
    }
  }
}

/**
 * DOM manipulation to prepare main text animation container for new phrase
 */
function prepareForNewPhrase() {
  // reassign the current container
  id("top-text").classList.toggle("current-container");
  id("bottom-text").classList.toggle("current-container");

  // hide miku's speech bubble
  id("speech-bubble").classList.replace("bounce-in", "lyric-outro-animation");
  parenStart = null;
}

/**
 * Translates lyrics upwards
 */
function movePreviousLyricsUp() {
  let prevLyrics = qsa(".lyric");

  for (let i = 0; i < prevLyrics.length; i++) {
    let lyric = prevLyrics[i];

    // if out of viewport, delete
    if(!isInViewport(lyric)) {
      lyric.remove();
    } else {

      // else, move up
      lyric.style.transform = `translateY(-${(30 * (prevLyrics.length - i))}px)`;
    }
  }
}

/**
 * Creates a container for a new line of lyrics. Does not add any lyrics to the container.
 * @returns {DOM Element} - text container
 */
function createNewPhraseContainer() {
  let parent = document.createElement("h1");
  let textContainer = documen.createElement("span");

  parent.appendChild(textContainer);

  return textContainer;
}

/**
 * Adds blinking box to end of given text container. Looks like terminal blinking box
 * @param {DOM Element} textContainer - text Container to append blinking box to.
 */
function addBlinkingBox(textContainer) {
  // add blinking typebox to textContainer
  let blinkingTxtBox = document.createElement("span");
  blinkingTxtBox.textContent = "▌";
  blinkingTxtBox.classList.add("blinking");
  textContainer.append(blinkingTxtBox);
}

player.addListener({
  onAppReady,
  onVideoReady,
  onThrottledTimeUpdate,
  onTimerReady,
});

/**
 * Play the music
 * If player is not null, then requestPlay
 */
function playMusic(event) {
  // hide loading overlay
  id("loading-overlay").classList.add("hidden");
  player.video && player.requestPlay();

  // hide play btn + show pause btn
  event.currentTarget.classList.add("hidden");
  id("pause-btn").classList.remove("hidden");
}

function pauseMusic(event) {
  player.video && player.requestPause();

  // show play btn + hide pause btn
  event.currentTarget.classList.add("hidden");
  id("play-btn").classList.remove("hidden");
  
}

function changeVolume() {
  let volumeLvl = id("volume-level").value;
  player.volume = volumeLvl;
}

function jumpMusic() {
  player.video &&
  player.requestMediaSeek(player.video.firstChar.startTime);
}

function jumpChorus() {
  player.video &&
  player.requestMediaSeek(FIRST_CHORUS_START);
}

function jumpSecondChorus() {
  player.video &&
  player.requestMediaSeek(SECOND_CHORUS_START);
}

function resetMusic() {
  id("text-animation-main").innerHTML = "";
  id("speech-bubble").innerHTML = "";
  currPhrase = null;
  currWord = null;
  currBeat = null;
  currChord = null;
  player.video && player.requestMediaSeek(0);
}

/**
 * Moves the gradient background according to mouse
 * from: https://codepen.io/toomuchome/pen/VVpOOB
 * @param {*} event - mouse move event
 */
function moveGradient(event) {
  const x = event.clientX;
  const y = event.clientY;
  const width = document.documentElement.clientWidth;
  const height = document.documentElement.clientHeight;
  const percentageX = x / width * 100;
  const percentageY = y / height * 100;
  id("bg-texture").style.backgroundPosition = percentageX + "%" + percentageY + "%";
}

/**
 * When app is ready, load the song and initialize some features
 * @param {*} app 
 */
function onAppReady(app) {

  beforeLoad();

  //ミュウテイション / Rin（Kuroneko Lounge） feat. 初音ミク
  if (!app.songUrl) {
    player.createFromSongUrl("https://piapro.jp/t/Wk83/20230203141007", {
      video: {
        // 音楽地図訂正履歴: https://songle.jp/songs/2427952/history
        beatId: 4267381,
        chordId: 2405285,
        repetitiveSegmentId: 2475676,
        // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FWk83%2F20230203141007
        lyricId: 56812,
        lyricDiffId: 10668
      },
    });
  }
}

/**
 * 動画の再生位置が変更されたときに呼ばれる（あまりに頻繁な発火を防ぐため一定間隔に間引かれる）
 *
 * @param {number} position - https://developer.textalive.jp/packages/textalive-app-api/interfaces/playereventlistener.html#onthrottledtimeupdate
 */
function onThrottledTimeUpdate(position) {

  // 再生位置を表示する
  // Update current position
  qs("#position strong").textContent = String(Math.floor(position));

  // さらに精確な情報が必要な場合は `player.timer.position` でいつでも取得できます
  // More precise timing information can be retrieved by `player.timer.position` at any time

  let beat = player.findBeat(position);

  // number from 0 to 1 representing percentage of completion of beat
  currBeatRatio = beat ? 1 - ((beat.endTime - position) / beat.duration) : null;

  // animate if new beat is encountered
  // if (beat && beat != currBeat) {
  //   currBeat = beat;
  // } 

  // animate if new chord encountered
  let chord = player.findChord(position);

  currChordRatio = chord ? 1 - ((chord.endTime - position) / chord.duration) : null;
  // if (chord && chord != currChord) {
  //   currChord = chord;
  //   id("beat-reactor").style.backgroundColor = random_rgba();
  // }

  if (player.findChorus(position)) {
    qs(".grid").classList.replace("non-chorus", "chorus");
  } else {
    qs(".grid").classList.replace("chorus", "non-chorus");
  }
}

/**
 * On video ready, assign all chars the animation function
 * @param {*} v - not sure
 */
function onVideoReady(v) {

  // add animation function to each unit
  // TODO: make names consistent
  let c = player.video.firstChar;
  while(c) {
    c.animate = animateChar;
    c = c.next;
  }
}

/**
 * Final step of loading
 * @param {*} t 
 */
function onTimerReady(t) {
  init();
}

function id(name) {
  return document.getElementById(name);
}

function qs(name) {
  return document.querySelector(name);
}

function qsa(name) {
  return document.querySelectorAll(name);
}

// https://www.javascripttutorial.net/dom/css/check-if-an-element-is-visible-in-the-viewport/
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Getter functino for the current beat ratio, a number from 0 to 1
 * representing the completion of the current beat
 * Can be null if no beat
 * @returns {number} - current beat ratio
 */
export function getBeatRatio() {
  return currBeatRatio;
}

/**
 * Getter function for the current chord ratio, a number from 0 to 1
 * representing the completion of the current chord duration
 * Can be null if no chord
 * @returns {number} - current chord ratio
 */
export function getChordRatio() {
  return currChordRatio;
}

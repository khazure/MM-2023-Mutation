import { Player } from "textalive-app-api";

/**
 * Animates the lyrics of the composition,
 * and any other HTML element
 */
(function() {  

  const player = new Player(
    { 
      app: {token: "8oZeCHYcDmC9Olyu"},
      mediaElement: document.querySelector("#media"),
      mediaBannerPosition: "bottom right"
    });

    const FIRST_CHORUS_START = 54754.3;
    const FIRST_CHORUS_END = 80359.1;

    const SECOND_CHORUS_START = 110764.6;
    const SECOND_CHORUS_END = 136369.4;

    // Keeps track of the current lyric unit at phrase level
    let currPhrase = null;

    // Keeps track of current lyric at word level
    let currWord = null;

    // keeps track of current beat
    let currBeat = null;

    // keeps track of current chord
    let currChord = null;

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

      // create 1st phrase container
      id("text-animation-main").append(createNewPhraseContainer());
    }

  /**
   * Called when all TextAlive processes are done loading
   */
  function init() {
    //storeChoruses();

    qsa(".play-btn").forEach(btn => {
      btn.addEventListener("click", playMusic);
    });

    id("pause-btn").addEventListener("click", pauseMusic);
    id("reset-btn").addEventListener("click", resetMusic);
    id("volume-level").addEventListener("input", changeVolume);

    id("show-controls").addEventListener("click", () => {
      id("control").classList.toggle("hidden");
    });

    // set volume initially
    changeVolume();

    //temp:
    id("chorus-btn").addEventListener("click", jumpChorus);
    id("jump-btn").addEventListener("click", jumpMusic);

    // show finished loading pop up
    id('finished-loading-pop-up').classList.remove("hidden");
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
    if (unit.contains(now)) {
      if (currPhrase === null || currPhrase !== unit.parent.parent) {

        // if new phrase, create the new line for it
        currPhrase = unit.parent.parent;

        prepareForNewPhrase();

        //move up container of lyrics
        movePreviousLyricsUp();

        const textContainer = createNewPhraseContainer();

        let encounteredParen = false;

        console.log(currPhrase.text);

        // loop through each word in the new phrase
        unit.parent.parent.children.forEach(word => {

          // loop through each character in the word
          word.children.forEach(child => { // child = character
            if (child.text.includes("（")) {
              encounteredParen = true;
              parenStart = child.startTime;
            }

            if (encounteredParen) {
              // add words to miku's speech bubble
              let word = document.createElement("span");
              word.textContent = child.text.replace("（", "").replace("）", "");
              id("speech-bubble").append(word);
            }
          });
        });
        id("text-animation-main").appendChild(textContainer);
      }

      // if char is new
      if (currWord === null || currWord !== unit) {
        currWord = unit;

        // if the time for miku's speech happens, show it
        if (parenStart && now >= parenStart) {
          id("speech-bubble").classList.replace("hidden", "shown");
        } else {
          id("speech-bubble").classList.replace("shown", "hidden");

          // append char to main lyrics container
          let word = document.createElement("span");
          word.textContent = currWord.text;

          id("current-container").insertBefore(word, qs(".blinking"));

          // glitch effect
          id("current-container").dataset.text = id("current-container").textContent;
        }
      }
    }
  };

  /**
   * DOM manipulation to prepare main text animation container for new phrase
   */
  function prepareForNewPhrase() {
    // reassign the id and blinking container
    let currContainer = id("current-container");
    currContainer && (currContainer.id = "");
    let blinking = qs(".blinking");
    blinking && (blinking.textContent = "");
    blinking && (blinking.classList.remove("blinking"));

    //update datatype of prev
    currContainer && (currContainer.dataset.text = currContainer.textContent);

    // clear miku's speech bubble
    id("speech-bubble").innerHTML = "";
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

  function createNewPhraseContainer() {
    let textContainer = document.createElement("h1");
    textContainer.id = "current-container";
    //textContainer.classList.add("lyric", "highlighted");
    textContainer.classList.add("lyric", "glitch");

    // add command prompt
    let cmdPrompt = document.createElement("span");
    cmdPrompt.textContent = "> ";
    textContainer.append(cmdPrompt);

    // add blinking typebox to textContainer
    let blinkingTxtBox = document.createElement("span");
    blinkingTxtBox.textContent = "▌";
    blinkingTxtBox.classList.add("blinking");
    textContainer.append(blinkingTxtBox);

    return textContainer;
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

  function resetMusic() {
    id("text-animation-main").innerHTML = "";

    currPhrase = null;
    currWord = null;
    currBeat = null;
    currChord = null;
    player.video && player.requestMediaSeek(0);
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
          lyricId: 56097,
          lyricDiffId: 9640
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

    // animate if new beat is encountered
    let beat = player.findBeat(position);
    if (beat && beat != currBeat) {
      currBeat = beat;
      id("beat-reactor").style.backgroundColor = random_rgba();
      //setRandomColor();
      // somehow access the 3d objects here to change with beat
      
    } else {
      //id("beat-reactor").style.scale = "1";
    }

    // animate if new chord encountered
    let chord = player.findChord(position);
    if (chord && chord != currChord) {
      currChord = chord;
      qs("nav").style.backgroundColor = random_rgba();

      //changeWireframeColor(random_rgba());
    }

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

// https://stackoverflow.com/questions/23095637/how-do-you-get-random-rgb-in-javascript
function random_rgba() {
  var o = Math.round, r = Math.random, s = 255;
  return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ', 1)';
  //return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
}

}());


(function() {  

  const player = new Player(
    { 
      app: {token: "8oZeCHYcDmC9Olyu"},
      mediaElement: document.getElementById("media")
    });

    // Keeps track of the current lyric unit at phrase level
    let currPhrase = null;

    // Keeps track of current lyric at word level
    let currWord = null;

  /**
   * Called when all TextAlive processes are done loading
   */
  function init() {
    qsa(".play-btn").forEach(btn => {
      btn.addEventListener("click", playMusic);
    });

    id("jump-btn").addEventListener("click", jumpMusic);
    id("pause-btn").addEventListener("click", pauseMusic);
    id("reset-btn").addEventListener("click", resetMusic);

    qs('#loading button').classList.remove("hidden");
    qs('#loading p').classList.add("hidden");
  }

  /**
   * Animates the word this function is assigned to
   * @param {*} now - current timestamp
   * @param {*} unit - unit to be animated
   */
  const animateChar = function (now, unit) {
    // unit is at word level
    if (unit.contains(now)) {
      if (currPhrase === null || currPhrase !== unit.parent) {

        // if new phrase, create the new line for it
        currPhrase = unit.parent;

        // reassign the id
        id("current-container").id = "";

        //move up container of lyrics
        movePreviousLyricsUp();

        console.log("after movePreviousLyricsUp")

        let textContainer = document.createElement("h1");
        textContainer.id = "current-container";
        textContainer.classList.add("lyric");

        unit.parent.children.forEach(child => {
          let word = document.createElement("span");
          word.textContent = child.text;
          word.id = child.text.replace(" ", "-");

          textContainer.append(word);
        });
        id("text-animation-main").appendChild(textContainer);
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
  };

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
      console.log( "blur (" + (1 - y) * 6 + "px)")

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
  function playMusic() {
    id("loading").classList.add("hidden");
    player.video && player.requestPlay();
  }

  function pauseMusic() {
    player.video && player.requestPause();
  }

  function jumpMusic() {
    player.video &&
    player.requestMediaSeek(player.video.firstChar.startTime);
  }

  function resetMusic() {
    player.video && player.requestMediaSeek(0);
  }

  /**
   * When app is ready, load the song
   * @param {*} app 
   */
  function onAppReady(app) {

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

    // more animate
    morphAnimate(position);
  }

  /**
   * On video ready, assign all chars the animation function
   * @param {*} v - not sure
   */
  function onVideoReady(v) {
    let c = player.video.firstWord;
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

  // https://codepen.io/alvarotrigo/pen/eYEqPZa 
  // new plan:
  // - doMorph when phrasechange detected within a time frame
  // --> ex. 0.25s to nextphrase's start time, initiate morph (morph out)
  // --> ex. 0.25s after currentPhrase's start time, be morphing (morph in)
  // - else doCooldown 
  //    
  function morphAnimate(time) {
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
}());


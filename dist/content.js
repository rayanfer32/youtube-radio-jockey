var k=Object.create;var{getPrototypeOf:B,defineProperty:y,getOwnPropertyNames:E,getOwnPropertyDescriptor:L}=Object,P=Object.prototype.hasOwnProperty;function v(e){return this[e]}var U,F,ee=(e,t,o)=>{var r=e!=null&&typeof e==="object";if(r){var i=t?U??=new WeakMap:F??=new WeakMap,s=i.get(e);if(s)return s}o=e!=null?k(B(e)):{};let a=t||!e||!e.__esModule?y(o,"default",{value:e,enumerable:!0}):o;if(e&&typeof e==="object"||typeof e==="function"){for(let n of E(e))if(!P.call(a,n))y(a,n,{get:v.bind(e,n),enumerable:!0})}if(r)i.set(e,a);return a},te=(e)=>{var t=(T??=new WeakMap).get(e),o;if(t)return t;if(t=y({},"__esModule",{value:!0}),e&&typeof e==="object"||typeof e==="function"){for(var r of E(e))if(!P.call(t,r))y(t,r,{get:v.bind(e,r),enumerable:!(o=L(e,r))||o.enumerable})}return T.set(e,t),t},T,oe=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var G=(e)=>e;function D(e,t){this[e]=G.bind(null,t)}var ie=(e,t)=>{for(var o in t)y(e,o,{get:t[o],enumerable:!0,configurable:!0,set:D.bind(t,o)})};var re=(e,t)=>()=>(e&&(t=e(e=0)),t);var N=async()=>await chrome.storage.sync.get(),I={energetic:"You are a high-energy radio DJ who's absolutely pumped about music!",chill:"You are a laid-back DJ with a smooth, relaxed vibe.",sarcastic:"You are a witty DJ who adds clever commentary with a touch of sarcasm.",professional:"You are a professional radio host with polished delivery."},C={short:"Keep it brief and punchy (20-30 seconds when spoken)",medium:"Moderate length with good flow (30-45 seconds when spoken)",long:"More detailed commentary (45-60 seconds when spoken)"};function H(e,t,o,r,i,s,a,n,l){let c=I[o]||I.energetic,d=C[r]||C.medium,p=`Radio station: ${l}
  Host name: ${n}`;return`${c} ${d} ${p}. 

${i&&`Here's some of your previous commentary: 
`+i}
${s&&`Here are some comments from viewers: 
`+s}

Current song: "${e}"

${a?`Current song Lyrics: ${a}`:""}

${t?`Next Song: "${t}"`:""}

Important guidelines:
AVOID using special characters that are not detected by TTS in the commentary, your output will be used to generate audio.
AVOID saying Alright and Okay okay or similar phrases at the begining. Cook up some new intros
CREATE engaging commentary that connects with listeners. Be natural, enthusiastic, and add personality. Don't read the song titles - make it conversational and fun!
ONLY respond with the commentary text, do not include any additional instructions or explanations.
`}async function K(e,t){if(!t)throw Error("Gemini API key not configured");let o={contents:[{parts:[{text:e}]}]};return new Promise((r,i)=>{chrome.runtime.sendMessage({action:"callGemini",payload:o,apiKey:t},(s)=>{if(chrome.runtime.lastError)return i(Error(chrome.runtime.lastError.message));if(!s||!s.success)return i(Error(s?.error||"Failed to call Gemini API"));let a=s.data;if(!a.candidates||!a.candidates[0]||!a.candidates[0].content)return i(Error("Invalid response from Gemini API"));r(a.candidates[0].content.parts[0].text)})})}async function O(e){let t={messages:[{role:"system",content:"Generate commentary without expressions in the brackets"}],chatOptions:{selectedModel:"llama3.1-8B",systemPrompt:e,topK:2},attachment:null};return new Promise((o,r)=>{chrome.runtime.sendMessage({action:"callChatJimmy",payload:t},(i)=>{if(chrome.runtime.lastError)return r(Error(chrome.runtime.lastError.message));if(!i||!i.success)return r(Error(i?.error||"Failed to call ChatJimmy API"));let s=i.data,a=s.indexOf("<|stats|>"),n=s;if(a!==-1)n=s.substring(0,a);o(n.trim().replace(/^"|"$/g,"").replace(/\\n/g,`
`).trim())})})}async function z(e,t,o="en-US-natalie",r="Promo"){if(!t)throw Error("Murf.ai API key not configured");let i={text:e,voiceId:o,style:r};return new Promise((s,a)=>{chrome.runtime.sendMessage({action:"callMurf",payload:i,apiKey:t},(n)=>{if(chrome.runtime.lastError)return a(Error(chrome.runtime.lastError.message));if(!n||!n.success)return a(Error(n?.error||"Failed to call Murf API"));let{data:l,audioBase64:c}=n,d=atob(c),p=new Uint8Array(d.length);for(let f=0;f<d.length;f++)p[f]=d.charCodeAt(f);let J=new Blob([p],{type:"audio/mpeg"});s({audioBlob:J,duration:l.audioLengthInSeconds,remainingChars:l.remainingCharacterCount})})})}async function j(e,t,o="ba1a38946dea44609fc4a8fe6113ed88"){if(!t)throw Error("Fish Audio API key not configured");return new Promise((r,i)=>{chrome.runtime.sendMessage({action:"callFishAudio",text:e,referenceId:o,apiKey:t},(s)=>{if(chrome.runtime.lastError)return i(Error(chrome.runtime.lastError.message));if(!s||!s.success)return i(Error(s?.error||"Failed to call Fish Audio API"));let a=s.audioBase64,n=atob(a),l=new Uint8Array(n.length);for(let d=0;d<n.length;d++)l[d]=n.charCodeAt(d);let c=new Blob([l],{type:"audio/mp3"});r({audioBlob:c})})})}function q(e,t,o){chrome.runtime.sendMessage({action:"logCommentary",currentSong:e,nextSong:t,script:o}).catch(console.error)}async function Y(e){return new Promise((t,o)=>{chrome.runtime.sendMessage({action:"callLyrics",query:e},(r)=>{if(chrome.runtime.lastError)return o(Error(chrome.runtime.lastError.message));if(!r||!r.success)return o(Error(r?.error||"Failed to call Lyrics API"));let i=r.data;console.log("Lyrics API response:",i),t(i?.[0]?.plainLyrics)})})}var R={callMurfAPI:z,callFishAudioAPI:j,callGeminiAPI:K,callChatJimmyAPI:O,callLyricsAPI:Y,logCommentary:q,getAPISettings:N,generateRJPrompt:H};window.APIUtils=R;var m=R;var V={createAudioContext(){try{return new(window.AudioContext||window.webkitAudioContext)}catch(e){return console.error("Audio context creation failed:",e),null}},async smoothVolumeTransition(e,t,o=200){if(!e)return;let r=e.volume,i=20,s=(t-r)/i,a=o/i;for(let n=0;n<i;n++)setTimeout(()=>{let l=Math.max(0,Math.min(1,r+s*(n+1)));e.volume=l},a*n)},async duckVolume(e,t=0.3){if(!e)return 1;let o=e.volume;return await this.smoothVolumeTransition(e,t),o},async restoreVolume(e,t){if(!e||t===void 0)return;await this.smoothVolumeTransition(e,t,300)},createAudio(e){let t=URL.createObjectURL(e),o=new Audio(t);return o.addEventListener("error",(r)=>{console.error("Audio playback error:",r),URL.revokeObjectURL(t)}),{audio:o,audioUrl:t}},playAudio(e){return new Promise((t,o)=>{e.addEventListener("ended",t),e.addEventListener("error",o),e.play().catch(o)})}};window.AudioUtils=V;var h=V;var X=()=>{if(document.getElementById("rj-loading"))return;let e=document.createElement("div");if(e.id="rj-loading",e.innerHTML=`
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="spinner"></div>
        <span>\uD83C\uDF99️ Preparing RJ commentary...</span>
      </div>
    `,e.style.cssText=`
      position: fixed;
      top: 140px;
      right: 20px;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `,!document.getElementById("spinner-styles")){let t=document.createElement("style");t.id="spinner-styles",t.textContent=`
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #333;
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `,document.head.appendChild(t)}document.body.appendChild(e)},W=()=>{let e=document.getElementById("rj-loading");if(e)e.remove()},Q=(e)=>{let t=document.createElement("div");t.style.cssText=`
      position: fixed;
      top: 140px;
      right: 20px;
      z-index: 9999;
      background: #ff4757;
      color: white;
      padding: 10px 15px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 350px;
    `,t.textContent=`❌ ${e}`,document.body.appendChild(t),setTimeout(()=>{t.remove()},5000)},Z=(e)=>{let t=document.createElement("button");t.id="rj-mode-button",t.innerHTML="\uD83C\uDF99️ Start RJ Mode",t.style.cssText=`
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      transition: transform 0.2s ease;
    `,t.addEventListener("click",()=>e()),t.addEventListener("mouseover",()=>{t.style.transform="scale(1.05)"}),t.addEventListener("mouseout",()=>{t.style.transform="scale(1)"}),document.body.appendChild(t)},b=()=>{let e=document.getElementById("rj-mode-notification");if(e)e.style.animation="slideOutRight 0.3s ease-in",setTimeout(()=>{e.remove()},300)},_=(e)=>{let t=document.createElement("div");if(t.id="rj-mode-notification",t.innerHTML=`
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>\uD83C\uDF99️</span>
        <div>
          <strong>Playlist Detected!</strong>
          <br>
          <small>Ready to add some RJ magic?</small>
        </div>
        <button id="enable-rj-mode" style="
          background: linear-gradient(45deg, #4CAF50, #45a049);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: bold;
          margin-left: auto;
        ">Enable RJ Mode</button>
        <button id="dismiss-rj-prompt" style="
          background: transparent;
          color: #666;
          border: none;
          cursor: pointer;
          font-size: 18px;
          padding: 5px;
        ">×</button>
      </div>
    `,t.style.cssText=`
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 10000;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      color: #333;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      max-width: 350px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideInRight 0.3s ease-out;
    `,!document.getElementById("rj-mode-styles")){let o=document.createElement("style");o.id="rj-mode-styles",o.textContent=`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `,document.head.appendChild(o)}document.body.appendChild(t),document.getElementById("enable-rj-mode")?.addEventListener("click",()=>{b(),e()}),document.getElementById("dismiss-rj-prompt")?.addEventListener("click",()=>{b()}),setTimeout(()=>{b()},1e4)},M={showErrorMessage:Q,showRJModePrompt:_,createRJModeButton:Z,dismissNotification:b,showLoadingIndicator:X,hideLoadingIndicator:W};window.DomUtils=M;var g=M;var S={extractVideoId(){return new URLSearchParams(window.location.search).get("v")||null},getCurrentVideoTitle(){return document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer")?.textContent?.trim()||""},getDescription(){return document?.querySelector("#description-inner")?.textContent?.trim()||""},getComments(){let e=[];return document.querySelectorAll("#comment-container").forEach((t)=>{let o=t.querySelector("#expander")?.textContent?.trim()||"";e.push(o)}),e},getNextVideoTitle(){return document.querySelector("#playlist-items[selected]")?.nextSibling?.querySelector("#video-title")?.textContent?.trim()||""},isPlaylistPage(){return new URLSearchParams(window.location.search).has("list")},getPlaylistId(){return new URLSearchParams(window.location.search).get("list")},getVideoElement(){return document.querySelector("video")},cleanVideoTitle(e){return e.replace(/\(Official.*?\)/gi,"").replace(/\(Music Video\)/gi,"").replace(/\[Official.*?\]/gi,"").replace(/- Topic$/,"").trim()},getVideoDuration(){let e=this.getVideoElement();return e?e.duration:0},isVideoPlaying(){let e=this.getVideoElement();return e?!e.paused&&!e.ended:!1}};window.YouTubeUtils=S;var u=S;class w{audioBlob=null;async synthesize(e,t="en"){return new Promise((o,r)=>{chrome.runtime.sendMessage({action:"getTTSAudio",payload:{text:e,lang:t}},(i)=>{if(chrome.runtime.lastError)return console.error("TTS Runtime Error:",chrome.runtime.lastError),r(Error(chrome.runtime.lastError.message));if(!i||!i.success)return console.error("TTS API Error:",i?.error),r(Error(i?.error||"Failed to get TTS audio"));try{let a=i.data.map((n)=>{let l=atob(n),c=new Uint8Array(l.length);for(let d=0;d<l.length;d++)c[d]=l.charCodeAt(d);return c.buffer});this.audioBlob=new Blob(a,{type:"audio/mpeg"}),o()}catch(s){console.error("Error processing TTS audio data:",s),r(s)}})})}toBlob(){if(!this.audioBlob)throw Error("No audio data available. Did you run synthesize() first?");return this.audioBlob}}class A{audioBlob=null;async synthesize(e,t,o="ba1a38946dea44609fc4a8fe6113ed88"){if(!t)throw Error("Fish Audio API key not configured");return new Promise((r,i)=>{chrome.runtime.sendMessage({action:"callFishAudio",text:e,referenceId:o,apiKey:t},(s)=>{if(chrome.runtime.lastError)return console.error("Fish Audio Runtime Error:",chrome.runtime.lastError),i(Error(chrome.runtime.lastError.message));if(!s||!s.success)return console.error("Fish Audio API Error:",s?.error),i(Error(s?.error||"Failed to get Fish Audio TTS"));try{let a=s.audioBase64,n=atob(a),l=new Uint8Array(n.length);for(let c=0;c<n.length;c++)l[c]=n.charCodeAt(c);this.audioBlob=new Blob([l],{type:"audio/mp3"}),r()}catch(a){console.error("Error processing Fish Audio data:",a),i(a)}})})}toBlob(){if(!this.audioBlob)throw Error("No audio data available. Did you run synthesize() first?");return this.audioBlob}}class x{isRJModeActive;currentVideoTitle;nextVideoTitle;originalVolume;isRJPlaying;audioContext;gainNode;lastProcessedVideo;isGeneratingCommentary;videoChangeTimeout;progressInterval;scriptHistory;googleTTS;fishAudioTTS;ttsVoice;generatedAudioData;constructor(){this.isRJModeActive=!1,this.currentVideoTitle="",this.nextVideoTitle="",this.originalVolume=1,this.isRJPlaying=!1,this.audioContext=null,this.gainNode=null,this.lastProcessedVideo="",this.isGeneratingCommentary=!1,this.videoChangeTimeout=null,this.progressInterval=null,this.scriptHistory=[],this.googleTTS=new w,this.fishAudioTTS=new A,this.ttsVoice="en",this.generatedAudioData=null,this.init()}async init(){await this.promptUserForAPIKeys(),this.setupAudioContext(),this.detectPlaylist(),g.createRJModeButton(this.toggleRJMode.bind(this))}async promptUserForAPIKeys(){let e=await m.getAPISettings();if(!e.geminiApiKey){let o=prompt("Enter your Gemini API Key:");if(o)chrome.storage.sync.set({geminiApiKey:o});else alert("Get free API key from https://aistudio.google.com/apikey")}if((e.ttsProvider||(e.fishApiKey?"fish-audio":e.murfApiKey?"murf":"fish-audio"))==="fish-audio"&&!e.fishApiKey){let o=prompt("Enter your Fish Audio API Key:");if(o)chrome.storage.sync.set({fishApiKey:o})}}setupAudioContext(){if(this.audioContext=h.createAudioContext(),this.audioContext)this.gainNode=this.audioContext.createGain()}detectPlaylist(){if(u.isPlaylistPage()&&!document.getElementById("rj-mode-button"))g.showRJModePrompt(this.toggleRJMode.bind(this))}getCurrentAndNextTitles(){this.currentVideoTitle=u.cleanVideoTitle(u.getCurrentVideoTitle()),this.nextVideoTitle=u.cleanVideoTitle(u.getNextVideoTitle())}async generateRJCommentary(){if(this.isGeneratingCommentary||this.isRJPlaying){console.log("Commentary already in progress, skipping...");return}let e=u.extractVideoId()||this.currentVideoTitle;if(e===this.lastProcessedVideo){console.log("Already processed this video, skipping...");return}if(!this.currentVideoTitle||this.currentVideoTitle.trim()===""){console.log("No current video title found, skipping...");return}this.isGeneratingCommentary=!0,this.lastProcessedVideo=e;try{g.showLoadingIndicator();let t=null;try{t=await m.callLyricsAPI(this.currentVideoTitle)}catch(n){console.warn("Lyrics API failed or no lyrics found, proceeding with commentary & TTS generation:",n)}let o=await m.getAPISettings(),r=m.generateRJPrompt(this.currentVideoTitle,this.nextVideoTitle,o.rjStyle,o.commentaryLength,o.includeHistory?this.scriptHistory.join(`
`):"",o.includeComments?u.getComments().join(`
`):"",t,o.hostName,o.radioStation);console.log("Generated prompt:",r);let i=await m.callChatJimmyAPI(r);console.log("Generated script:",i),this.scriptHistory.push(i);let s={},a=o.ttsProvider||(o.fishApiKey?"fish-audio":o.murfApiKey?"murf":"fish-audio");if(a==="fish-audio"){if(!o.fishApiKey)throw Error("Fish Audio API key not configured. Please add it in extension settings.");let n=o.voiceId||"ba1a38946dea44609fc4a8fe6113ed88";await this.fishAudioTTS.synthesize(i,o.fishApiKey,n),s={audioBlob:this.fishAudioTTS.toBlob()}}else if(a==="murf"){if(!o.murfApiKey)throw Error("Murf.ai API key not configured. Please add it in extension settings.");s=await m.callMurfAPI(i,o.murfApiKey,o.voiceId,o.voiceStyle)}else{let n=o.voiceId||this.ttsVoice;if(n.includes("-")&&n.split("-").length>2)n=n.split("-").slice(0,2).join("-");await this.googleTTS.synthesize(i,n),s={audioBlob:this.googleTTS.toBlob()}}m.logCommentary(this.currentVideoTitle,this.nextVideoTitle,i),this.generatedAudioData=s,g.hideLoadingIndicator()}catch(t){console.error("RJ Commentary generation failed:",t),g.hideLoadingIndicator(),g.showErrorMessage(t.message)}finally{this.isGeneratingCommentary=!1}}async playRJCommentary(){let e=this.generatedAudioData?.audioBlob;if(!e){console.error("No audio data available to play.");return}if(this.isRJPlaying){console.log("RJ already playing, skipping...");return}this.isRJPlaying=!0;let t=u.getVideoElement();try{if(!t){console.error("No video element found on the page."),this.isRJPlaying=!1;return}this.originalVolume=await h.duckVolume(t,0.1);let{audio:o,audioUrl:r}=h.createAudio(e);o.addEventListener("ended",()=>{this.restoreVolumeAndCleanup(t,r)}),o.addEventListener("error",(i)=>{console.error("Audio error:",i),this.restoreVolumeAndCleanup(t,r)}),await h.playAudio(o).catch((i)=>{console.error("Audio playback failed:",i),this.restoreVolumeAndCleanup(t,r)})}catch(o){if(console.error("Error playing RJ commentary:",o),this.isRJPlaying=!1,t)await h.restoreVolume(t,this.originalVolume)}finally{this.generatedAudioData=null}}async restoreVolumeAndCleanup(e,t){if(await h.restoreVolume(e,this.originalVolume),t)URL.revokeObjectURL(t);this.isRJPlaying=!1,console.log("RJ commentary cleanup completed")}async toggleRJMode(){this.isRJModeActive=!this.isRJModeActive;let e=document.getElementById("rj-mode-button");if(!e){console.error("RJ Mode button not found.");return}if(this.isRJModeActive)e.innerHTML="\uD83C\uDF99️ Stop RJ Mode",e.style.background="linear-gradient(45deg, #ff4757, #ff6b6b)",await this.startRJMode();else e.innerHTML="\uD83C\uDF99️ Start RJ Mode",e.style.background="linear-gradient(45deg, #ff6b6b, #4ecdc4)",this.stopRJMode()}async startRJMode(){this.getCurrentAndNextTitles(),this.setupVideoEventListeners()}stopRJMode(){if(this.isRJModeActive=!1,this.isRJPlaying=!1,this.isGeneratingCommentary=!1,this.lastProcessedVideo="",this.videoChangeTimeout)clearTimeout(this.videoChangeTimeout),this.videoChangeTimeout=null;clearInterval(this.progressInterval),g.hideLoadingIndicator(),console.log("RJ Mode stopped and cleaned up")}setupVideoEventListeners(){let e=()=>{console.log("checkVideoProgress called");let o=document.querySelector("video");if(!o||!this.isRJModeActive)return;let r=o.duration-o.currentTime;if(o.currentTime>10&&!this.isGeneratingCommentary&&!this.generatedAudioData)this.getCurrentAndNextTitles(),this.generateRJCommentary();if(r<=30&&!this.isRJPlaying&&!this.isGeneratingCommentary)this.playRJCommentary()},t=()=>{if(this.progressInterval)clearInterval(this.progressInterval);this.progressInterval=setInterval(e,1000)};if(this.isRJModeActive)t()}}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{let e=new x;window.youtubeRJ=e,console.log(e)});else{let e=new x;window.youtubeRJ=e,console.log(e)}

//# debugId=B9FDEF1FBED1683364756E2164756E21

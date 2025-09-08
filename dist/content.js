var f=Object.create;var{getPrototypeOf:A,defineProperty:j,getOwnPropertyNames:M}=Object;var R=Object.prototype.hasOwnProperty;var n=(F,Q,X)=>{X=F!=null?f(A(F)):{};let Z=Q||!F||!F.__esModule?j(X,"default",{value:F,enumerable:!0}):X;for(let $ of M(F))if(!R.call(Z,$))j(Z,$,{get:()=>F[$],enumerable:!0});return Z};var a=(F,Q)=>()=>(Q||F((Q={exports:{}}).exports,Q),Q.exports);var r=(F,Q)=>()=>(F&&(Q=F(F=0)),Q);var S=async()=>{return await chrome.storage.sync.get()},_={energetic:"You are a high-energy radio DJ who's absolutely pumped about music!",chill:"You are a laid-back DJ with a smooth, relaxed vibe.",sarcastic:"You are a witty DJ who adds clever commentary with a touch of sarcasm.",professional:"You are a professional radio host with polished delivery."},w={short:"Keep it brief and punchy (20-30 seconds when spoken)",medium:"Moderate length with good flow (30-45 seconds when spoken)",long:"More detailed commentary (45-60 seconds when spoken)"};function h(F,Q,X,Z,$,z,O,W,N){let L=_[X]||_.energetic,D=w[Z]||w.medium,T=`Radio station: ${N}
  Host name: ${W}`;return`${L} ${D} ${T}. 

${$&&`Here's some of your previous commentary: 
`+$}
${z&&`Here are some comments from viewers: 
`+z}

Current song: "${F}"

${O?`Current song Lyrics: ${O}`:""}

${Q?`Next Song: "${Q}"`:""}

Important guidelines:
AVOID using special characters that are not detected by TTS in the commentary, your output will be used to generate audio.
AVOID saying Alright and Okay okay or similar phrases at the begining. Cook up some new intros
CREATE engaging commentary that connects with listeners. Be natural, enthusiastic, and add personality. Don't read the song titles - make it conversational and fun!
ONLY respond with the commentary text, do not include any additional instructions or explanations.
`}async function U(F,Q){if(!Q)throw new Error("Gemini API key not configured");let X=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",{method:"POST",headers:{"Content-Type":"application/json","X-goog-api-key":Q},body:JSON.stringify({contents:[{parts:[{text:F}]}]})});if(!X.ok)throw new Error(`Gemini API error: ${X.status} ${X.statusText}`);let Z=await X.json();if(!Z.candidates||!Z.candidates[0]||!Z.candidates[0].content)throw new Error("Invalid response from Gemini API");return Z.candidates[0].content.parts[0].text}async function y(F,Q,X="en-US-natalie",Z="Promo"){if(!Q)throw new Error("Murf.ai API key not configured");let $=await fetch("https://api.murf.ai/v1/speech/generate",{method:"POST",headers:{"api-key":Q,"Content-Type":"application/json"},body:JSON.stringify({text:F,voiceId:X,style:Z})});if(!$.ok){let W=await $.json().catch(()=>({}));throw new Error(`Murf.ai API error: ${$.status} ${$.statusText} - ${W.message||"Unknown error"}`)}let z=await $.json();if(!z.audioFile)throw new Error("No audio file returned from Murf.ai API");let O=await fetch(z.audioFile);if(!O.ok)throw new Error("Failed to fetch audio file from Murf.ai");return{audioBlob:await O.blob(),duration:z.audioLengthInSeconds,remainingChars:z.remainingCharacterCount}}function b(F,Q,X){chrome.runtime.sendMessage({action:"logCommentary",currentSong:F,nextSong:Q,script:X}).catch(console.error)}async function v(F){let Q=await fetch(`https://lrclib.net/api/search?q=${F}`,{headers:{"Content-Type":"application/json"},referrer:"https://lrclib.net/docs",method:"GET"});if(!Q.ok)throw new Error(`Lyrics API error: ${Q.status} ${Q.statusText}`);let X=await Q.json();return console.log("Lyrics API response:",X),X?.[0]?.plainLyrics}var I={callMurfAPI:y,callGeminiAPI:U,callLyricsAPI:v,logCommentary:b,getAPISettings:S,generateRJPrompt:h};window.APIUtils=I;var q=I;var P={createAudioContext(){try{return new(window.AudioContext||window.webkitAudioContext)}catch(F){return console.error("Audio context creation failed:",F),null}},async smoothVolumeTransition(F,Q,X=200){if(!F)return;let Z=F.volume,$=20,z=(Q-Z)/$,O=X/$;for(let W=0;W<$;W++)setTimeout(()=>{let N=Math.max(0,Math.min(1,Z+z*(W+1)));F.volume=N},O*W)},async duckVolume(F,Q=0.3){if(!F)return 1;let X=F.volume;return await this.smoothVolumeTransition(F,Q),X},async restoreVolume(F,Q){if(!F||Q===void 0)return;await this.smoothVolumeTransition(F,Q,300)},createAudio(F){let Q=URL.createObjectURL(F),X=new Audio(Q);return X.addEventListener("error",(Z)=>{console.error("Audio playback error:",Z),URL.revokeObjectURL(Q)}),{audio:X,audioUrl:Q}},playAudio(F){return new Promise((Q,X)=>{F.addEventListener("ended",Q),F.addEventListener("error",X),F.play().catch(X)})}};window.AudioUtils=P;var K=P;var g=()=>{if(document.getElementById("rj-loading"))return;let F=document.createElement("div");if(F.id="rj-loading",F.innerHTML=`
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="spinner"></div>
        <span>\uD83C\uDF99️ Preparing RJ commentary...</span>
      </div>
    `,F.style.cssText=`
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
    `,!document.getElementById("spinner-styles")){let Q=document.createElement("style");Q.id="spinner-styles",Q.textContent=`
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
      `,document.head.appendChild(Q)}document.body.appendChild(F)},p=()=>{let F=document.getElementById("rj-loading");if(F)F.remove()},m=(F)=>{let Q=document.createElement("div");Q.style.cssText=`
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
    `,Q.textContent=`❌ ${F}`,document.body.appendChild(Q),setTimeout(()=>{Q.remove()},5000)},c=(F)=>{let Q=document.createElement("button");Q.id="rj-mode-button",Q.innerHTML="\uD83C\uDF99️ Start RJ Mode",Q.style.cssText=`
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
    `,Q.addEventListener("click",()=>F()),Q.addEventListener("mouseover",()=>{Q.style.transform="scale(1.05)"}),Q.addEventListener("mouseout",()=>{Q.style.transform="scale(1)"}),document.body.appendChild(Q)},E=()=>{let F=document.getElementById("rj-mode-notification");if(F)F.style.animation="slideOutRight 0.3s ease-in",setTimeout(()=>{F.remove()},300)},u=(F)=>{let Q=document.createElement("div");if(Q.id="rj-mode-notification",Q.innerHTML=`
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
    `,Q.style.cssText=`
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
    `,!document.getElementById("rj-mode-styles")){let X=document.createElement("style");X.id="rj-mode-styles",X.textContent=`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `,document.head.appendChild(X)}document.body.appendChild(Q),document.getElementById("enable-rj-mode")?.addEventListener("click",()=>{E(),F()}),document.getElementById("dismiss-rj-prompt")?.addEventListener("click",()=>{E()}),setTimeout(()=>{E()},1e4)},V={showErrorMessage:m,showRJModePrompt:u,createRJModeButton:c,dismissNotification:E,showLoadingIndicator:g,hideLoadingIndicator:p};window.DomUtils=V;var H=V;var k={extractVideoId(){return new URLSearchParams(window.location.search).get("v")||null},getCurrentVideoTitle(){return document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer")?.textContent?.trim()||""},getDescription(){return document?.querySelector("#description-inner")?.textContent?.trim()||""},getComments(){let F=[];return document.querySelectorAll("#comment-container").forEach((Q)=>{let X=Q.querySelector("#expander")?.textContent?.trim()||"";F.push(X)}),F},getNextVideoTitle(){return document.querySelector("#playlist-items[selected]")?.nextSibling?.querySelector("#video-title")?.textContent?.trim()||""},isPlaylistPage(){return new URLSearchParams(window.location.search).has("list")},getPlaylistId(){return new URLSearchParams(window.location.search).get("list")},getVideoElement(){return document.querySelector("video")},cleanVideoTitle(F){return F.replace(/\(Official.*?\)/gi,"").replace(/\(Music Video\)/gi,"").replace(/\[Official.*?\]/gi,"").replace(/- Topic$/,"").trim()},getVideoDuration(){let F=this.getVideoElement();return F?F.duration:0},isVideoPlaying(){let F=this.getVideoElement();return F?!F.paused&&!F.ended:!1}};window.YouTubeUtils=k;var G=k;var FF="130.0.2849.68".split(".",1)[0];var C={TRUSTED_CLIENT_TOKEN:"6A5AA1D4EAFF4E9FB37E23D68491D6F4",WSS_URL:"wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1",VOICES_URL:"https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list"};class J extends Error{constructor(F,Q={}){super(F);if(this.name="SkewAdjustmentError",Q?.cause)this.cause=Q.cause}}var d=11644473600,l=1e9;class B{static clock_skew_seconds=0;static adj_clock_skew_seconds(F){B.clock_skew_seconds+=F}static get_unix_timestamp(){return Date.now()/1000+B.clock_skew_seconds}static parse_rfc2616_date(F){try{let Q=new Date(F);if(isNaN(Q.getTime()))return null;return Q.getTime()/1000}catch(Q){return null}}static handle_client_response_error(F){if(!F.headers)throw new J("No server date in headers.",{cause:F});let Q=F.headers.date;if(!Q||typeof Q!=="string")throw new J("No server date in headers.",{cause:F});let X=B.parse_rfc2616_date(Q);if(X===null)throw new J(`Failed to parse server date: ${Q}`,{cause:F});let Z=B.get_unix_timestamp();B.adj_clock_skew_seconds(X-Z)}static async generate_sec_ms_gec(){let F=B.get_unix_timestamp();F+=d,F-=F%300,F*=l/100;let Q=`${Math.floor(F)}${C.TRUSTED_CLIENT_TOKEN}`,Z=new TextEncoder().encode(Q),$=await crypto.subtle.digest("SHA-256",Z);return Array.from(new Uint8Array($)).map((W)=>W.toString(16).padStart(2,"0")).join("").toUpperCase()}}class Y{audio_stream=[];audio_format="mp3";ws=null;async getVoices(){return(await(await fetch(`${C.VOICES_URL}?trustedclienttoken=${C.TRUSTED_CLIENT_TOKEN}`)).json()).map((X)=>{let{Name:Z,ShortName:$,Gender:z,Locale:O,VoiceType:W}=X;return{Name:Z,ShortName:$,Gender:z,Locale:O,VoiceType:W}})}async getVoicesByLanguage(F){return(await this.getVoices()).filter((X)=>X.Locale.startsWith(F))}async getVoicesByGender(F){return(await this.getVoices()).filter((X)=>X.Gender===F)}generateUUID(){return"xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(F)=>{let Q=Math.random()*16|0;return(F==="x"?Q:Q&3|8).toString(16)})}validatePitch(F){if(typeof F==="number")return F>=0?`+${F}Hz`:`${F}Hz`;if(!/^[+-]?\d{1,3}(?:\.\d+)?Hz$/.test(F))throw new Error("Invalid pitch format. Expected '-100Hz to +100Hz' or a number.");return F}validateRate(F){let Q;if(typeof F==="string"){if(Q=parseFloat(F.replace("%","")),isNaN(Q))throw new Error("Invalid rate format.")}else Q=F;return Q>=0?`+${Q}%`:`${Q}%`}validateVolume(F){let Q;if(typeof F==="string"){if(Q=parseInt(F.replace("%",""),10),isNaN(Q))throw new Error("Invalid volume format.")}else Q=F;if(Q<-100||Q>100)throw new Error("Volume out of range (-100% to 100%).");return`${Q}%`}async synthesize(F,Q="en-US-AnaNeural",X={}){let Z=await B.generate_sec_ms_gec();return new Promise(($,z)=>{this.audio_stream=[];let O=this.generateUUID();this.ws=new WebSocket(`${C.WSS_URL}?trustedclienttoken=${C.TRUSTED_CLIENT_TOKEN}&ConnectionId=${O}&Sec-MS-GEC=${Z}&Sec-MS-GEC-Version=1-130.0.2849.68`),this.ws.binaryType="arraybuffer";let W=this.getSSML(F,Q,X),N=setTimeout(()=>{if(this.ws&&this.ws.readyState===WebSocket.OPEN)this.ws.close();z(new Error("Synthesis timeout"))},30000);this.ws.addEventListener("open",()=>{this.ws?.send(this.buildTTSConfigMessage());let L=`X-RequestId:${O}\r
Content-Type:application/ssml+xml\r
X-Timestamp:${new Date().toISOString()}Z\r
Path:ssml\r
\r
${W}`;this.ws?.send(L)}),this.ws.addEventListener("message",(L)=>{this.processAudioData(L.data)}),this.ws.addEventListener("error",(L)=>{if(clearTimeout(N),this.ws&&this.ws.readyState===WebSocket.OPEN)this.ws.close();z(L)}),this.ws.addEventListener("close",()=>{clearTimeout(N),$()})})}getSSML(F,Q,X={}){if(typeof X.pitch==="string")X.pitch=X.pitch.replace("hz","Hz");let Z=this.validatePitch(X.pitch??0),$=this.validateRate(X.rate??0),z=this.validateVolume(X.volume??0);return`<speak version='1.0' xml:lang='en-US'><voice name='${Q}'><prosody pitch='${Z}' rate='${$}' volume='${z}'>${F}</prosody></voice></speak>`}buildTTSConfigMessage(){return`X-Timestamp:${new Date().toISOString()}Z\r
Content-Type:application/json; charset=utf-8\r
Path:speech.config\r
\r
{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":true},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`}processAudioData(F){if(typeof F==="string"){if(F.includes("Path:turn.end"))this.ws?.close();return}let Q=new Uint8Array(F),X=new TextEncoder().encode(`Path:audio\r
`),Z=this.indexOfSubarray(Q,X);if(Z!==-1){let $=Q.subarray(Z+X.length);this.audio_stream.push($)}if(new TextDecoder().decode(Q).includes("Path:turn.end"))this.ws?.close()}indexOfSubarray(F,Q){for(let X=0;X<=F.length-Q.length;X++){let Z=!0;for(let $=0;$<Q.length;$++)if(F[X+$]!==Q[$]){Z=!1;break}if(Z)return X}return-1}toBlob(F=this.audio_format){if(this.audio_stream.length===0)throw new Error("No audio data available. Did you run synthesize() first?");return new Blob(this.audio_stream,{type:`audio/${F}`})}async toBase64(){let F=this.toBlob();return new Promise((Q)=>{let X=new FileReader;X.onloadend=()=>Q(X.result.split(",")[1]),X.readAsDataURL(F)})}download(F="output.mp3"){let Q=this.toBlob(),X=URL.createObjectURL(Q),Z=document.createElement("a");Z.href=X,Z.download=F,Z.click(),URL.revokeObjectURL(X)}}class x{isRJModeActive;currentVideoTitle;nextVideoTitle;originalVolume;isRJPlaying;audioContext;gainNode;lastProcessedVideo;isGeneratingCommentary;videoChangeTimeout;progressInterval;scriptHistory;edgeTTS;ttsVoice;generatedAudioData;constructor(){this.isRJModeActive=!1,this.currentVideoTitle="",this.nextVideoTitle="",this.originalVolume=1,this.isRJPlaying=!1,this.audioContext=null,this.gainNode=null,this.lastProcessedVideo="",this.isGeneratingCommentary=!1,this.videoChangeTimeout=null,this.progressInterval=null,this.scriptHistory=[],this.edgeTTS=new Y,this.ttsVoice="en-US-AvaMultilingualNeural",this.generatedAudioData=null,this.init()}async init(){await this.promptUserForAPIKeys(),this.setupAudioContext(),this.detectPlaylist(),H.createRJModeButton(this.toggleRJMode.bind(this))}async promptUserForAPIKeys(){if(!(await q.getAPISettings()).geminiApiKey){let Q=prompt("Enter your Gemini API Key:");if(Q)chrome.storage.sync.set({geminiApiKey:Q});else alert("Get free API key from https://aistudio.google.com/apikey")}}setupAudioContext(){if(this.audioContext=K.createAudioContext(),this.audioContext)this.gainNode=this.audioContext.createGain()}detectPlaylist(){if(G.isPlaylistPage()&&!document.getElementById("rj-mode-button"))H.showRJModePrompt(this.toggleRJMode.bind(this))}getCurrentAndNextTitles(){this.currentVideoTitle=G.cleanVideoTitle(G.getCurrentVideoTitle()),this.nextVideoTitle=G.cleanVideoTitle(G.getNextVideoTitle())}async generateRJCommentary(){if(this.isGeneratingCommentary||this.isRJPlaying){console.log("Commentary already in progress, skipping...");return}let F=G.extractVideoId()||this.currentVideoTitle;if(F===this.lastProcessedVideo){console.log("Already processed this video, skipping...");return}if(!this.currentVideoTitle||this.currentVideoTitle.trim()===""){console.log("No current video title found, skipping...");return}this.isGeneratingCommentary=!0,this.lastProcessedVideo=F;try{H.showLoadingIndicator();let Q=await q.callLyricsAPI(this.currentVideoTitle),X=await q.getAPISettings(),Z=q.generateRJPrompt(this.currentVideoTitle,this.nextVideoTitle,X.rjStyle,X.commentaryLength,X.includeHistory?this.scriptHistory.join(`
`):"",X.includeComments?G.getComments().join(`
`):"",Q,X.hostName,X.radioStation);console.log("Generated prompt:",Z);let $=await q.callGeminiAPI(Z,X.geminiApiKey);console.log("Generated script:",$),this.scriptHistory.push($);let z={};if(X.murfApiKey)z=await q.callMurfAPI($,X.murfApiKey,X.voiceId,X.voiceStyle);else await this.edgeTTS.synthesize($,X.voiceId||this.ttsVoice),z={audioBlob:this.edgeTTS.toBlob()};q.logCommentary(this.currentVideoTitle,this.nextVideoTitle,$),this.generatedAudioData=z,H.hideLoadingIndicator()}catch(Q){console.error("RJ Commentary generation failed:",Q),H.hideLoadingIndicator(),H.showErrorMessage(Q.message)}finally{this.isGeneratingCommentary=!1}}async playRJCommentary(){let F=this.generatedAudioData?.audioBlob;if(!F){console.error("No audio data available to play.");return}if(this.isRJPlaying){console.log("RJ already playing, skipping...");return}this.isRJPlaying=!0;let Q=G.getVideoElement();try{if(!Q){console.error("No video element found on the page."),this.isRJPlaying=!1;return}this.originalVolume=await K.duckVolume(Q,0.1);let{audio:X,audioUrl:Z}=K.createAudio(F);X.addEventListener("ended",()=>{this.restoreVolumeAndCleanup(Q,Z)}),X.addEventListener("error",($)=>{console.error("Audio error:",$),this.restoreVolumeAndCleanup(Q,Z)}),await K.playAudio(X).catch(($)=>{console.error("Audio playback failed:",$),this.restoreVolumeAndCleanup(Q,Z)})}catch(X){if(console.error("Error playing RJ commentary:",X),this.isRJPlaying=!1,Q)await K.restoreVolume(Q,this.originalVolume)}finally{this.generatedAudioData=null}}async restoreVolumeAndCleanup(F,Q){if(await K.restoreVolume(F,this.originalVolume),Q)URL.revokeObjectURL(Q);this.isRJPlaying=!1,console.log("RJ commentary cleanup completed")}async toggleRJMode(){this.isRJModeActive=!this.isRJModeActive;let F=document.getElementById("rj-mode-button");if(!F){console.error("RJ Mode button not found.");return}if(this.isRJModeActive)F.innerHTML="\uD83C\uDF99️ Stop RJ Mode",F.style.background="linear-gradient(45deg, #ff4757, #ff6b6b)",await this.startRJMode();else F.innerHTML="\uD83C\uDF99️ Start RJ Mode",F.style.background="linear-gradient(45deg, #ff6b6b, #4ecdc4)",this.stopRJMode()}async startRJMode(){this.getCurrentAndNextTitles(),this.setupVideoEventListeners()}stopRJMode(){if(this.isRJModeActive=!1,this.isRJPlaying=!1,this.isGeneratingCommentary=!1,this.lastProcessedVideo="",this.videoChangeTimeout)clearTimeout(this.videoChangeTimeout),this.videoChangeTimeout=null;clearInterval(this.progressInterval),H.hideLoadingIndicator(),console.log("RJ Mode stopped and cleaned up")}setupVideoEventListeners(){let F=()=>{console.log("checkVideoProgress called");let X=document.querySelector("video");if(!X||!this.isRJModeActive)return;let Z=X.duration-X.currentTime;if(X.currentTime>10&&!this.isGeneratingCommentary&&!this.generatedAudioData)this.getCurrentAndNextTitles(),this.generateRJCommentary();if(Z<=30&&!this.isRJPlaying&&!this.isGeneratingCommentary)this.playRJCommentary()},Q=()=>{if(this.progressInterval)clearInterval(this.progressInterval);this.progressInterval=setInterval(F,1000)};if(this.isRJModeActive)Q()}}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{let F=new x;window.youtubeRJ=F,console.log(F)});else{let F=new x;window.youtubeRJ=F,console.log(F)}

//# debugId=0622A85C29B33C1F64756E2164756E21

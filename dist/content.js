var z=Object.create;var{getPrototypeOf:G,defineProperty:f,getOwnPropertyNames:I,getOwnPropertyDescriptor:K}=Object,R=Object.prototype.hasOwnProperty;function S(e){return this[e]}var O,H,ae=(e,t,o)=>{var i=e!=null&&typeof e==="object";if(i){var r=t?O??=new WeakMap:H??=new WeakMap,n=r.get(e);if(n)return n}o=e!=null?z(G(e)):{};let a=t||!e||!e.__esModule?f(o,"default",{value:e,enumerable:!0}):o;if(e&&typeof e==="object"||typeof e==="function"){for(let s of I(e))if(!R.call(a,s))f(a,s,{get:S.bind(e,s),enumerable:!0})}if(i)r.set(e,a);return a},le=(e)=>{var t=(P??=new WeakMap).get(e),o;if(t)return t;if(t=f({},"__esModule",{value:!0}),e&&typeof e==="object"||typeof e==="function"){for(var i of I(e))if(!R.call(t,i))f(t,i,{get:S.bind(e,i),enumerable:!(o=K(e,i))||o.enumerable})}return P.set(e,t),t},P,de=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var q=(e)=>e;function Y(e,t){this[e]=q.bind(null,t)}var ce=(e,t)=>{for(var o in t)f(e,o,{get:t[o],enumerable:!0,configurable:!0,set:Y.bind(t,o)})};var ue=(e,t)=>()=>(e&&(t=e(e=0)),t);var A={geminiApiKey:"",murfApiKey:"",fishApiKey:"",openRouterApiKey:"",openRouterModel:"recursive/flint-v1.0:free",llmProvider:"openrouter",ttsProvider:"fish-audio",rjStyle:"sarcastic",commentaryLength:"short",voiceId:"ba1a38946dea44609fc4a8fe6113ed88",voiceStyle:"Promo",includeHistory:!1,includeComments:!1,autoStart:!1,volumeDucking:50,hostName:"Alexis",radioStation:"97.7 Youtube FM"},M=async()=>{let e=await chrome.storage.sync.get();return{...A,...e}},B={energetic:"You are a high-energy radio DJ who's absolutely pumped about music!",chill:"You are a laid-back DJ with a smooth, relaxed vibe.",sarcastic:"You are a witty DJ who adds clever commentary with a touch of sarcasm.",professional:"You are a professional radio host with polished delivery."},k={short:"Keep it brief and punchy (20-30 seconds when spoken)",medium:"Moderate length with good flow (30-45 seconds when spoken)",long:"More detailed commentary (45-60 seconds when spoken)"};function X(e,t,o,i,r,n,a,s,l){let c=B[o]||B.energetic,d=k[i]||k.medium,b=s||A.hostName,p=`Radio station: ${l||A.radioStation}
Host name: ${b}`,N=`${c} ${d}. ${p}.

Important guidelines:
- AVOID using special characters that are not detected by TTS in the commentary, your output will be used to generate audio.
- AVOID expressions in brackets or parentheses.
- AVOID saying Alright and Okay okay or similar phrases at the beginning. Cook up new intros.
- CREATE engaging commentary that connects with listeners. Be natural, enthusiastic, and add personality. Don't read the song titles - make it conversational and fun!
- ONLY respond with the commentary text, do not include any additional instructions or explanations.`.trim(),y=`Current song: "${e}"`;if(a)y+=`
Current song Lyrics: ${a}`;if(t)y+=`
Upcoming Song: "${t}"`;if(n)y+=`
Viewer comments: ${n}`;if(r)y+=`
Previous commentary history:
${r}`;return{systemPrompt:N,currentTask:y}}async function V(e,t){if(!t)throw Error("Gemini API key not configured");let o={contents:[{parts:[{text:e}]}]};return new Promise((i,r)=>{chrome.runtime.sendMessage({action:"callGemini",payload:o,apiKey:t},(n)=>{if(chrome.runtime.lastError)return r(Error(chrome.runtime.lastError.message));if(!n||!n.success)return r(Error(n?.error||"Failed to call Gemini API"));let a=n.data;if(!a.candidates||!a.candidates[0]||!a.candidates[0].content)return r(Error("Invalid response from Gemini API"));i(a.candidates[0].content.parts[0].text)})})}async function J(e,t){let o,i;if(typeof e==="object")o=e.systemPrompt,i=e.currentTask;else if(t!==void 0)o=e,i=t;else o=e,i=e;let r={messages:[{role:"system",content:o},{role:"user",content:i}],chatOptions:{selectedModel:"llama3.1-8B",systemPrompt:o,topK:2},attachment:null};return new Promise((n,a)=>{chrome.runtime.sendMessage({action:"callChatJimmy",payload:r},(s)=>{if(chrome.runtime.lastError)return a(Error(chrome.runtime.lastError.message));if(!s||!s.success)return a(Error(s?.error||"Failed to call ChatJimmy API"));let l=s.data,c=l.indexOf("<|stats|>"),d=l;if(c!==-1)d=l.substring(0,c);n(d.trim().replace(/^"|"$/g,"").replace(/\\n/g,`
`).trim())})})}async function _(e,t,o="en-US-natalie",i="Promo"){if(!t)throw Error("Murf.ai API key not configured");let r={text:e,voiceId:o,style:i};return new Promise((n,a)=>{chrome.runtime.sendMessage({action:"callMurf",payload:r,apiKey:t},(s)=>{if(chrome.runtime.lastError)return a(Error(chrome.runtime.lastError.message));if(!s||!s.success)return a(Error(s?.error||"Failed to call Murf API"));let{data:l,audioBase64:c}=s,d=atob(c),b=new Uint8Array(d.length);for(let p=0;p<d.length;p++)b[p]=d.charCodeAt(p);let C=new Blob([b],{type:"audio/mpeg"});n({audioBlob:C,duration:l.audioLengthInSeconds,remainingChars:l.remainingCharacterCount})})})}async function Q(e,t,o="ba1a38946dea44609fc4a8fe6113ed88"){if(!t)throw Error("Fish Audio API key not configured");return new Promise((i,r)=>{chrome.runtime.sendMessage({action:"callFishAudio",text:e,referenceId:o,apiKey:t},(n)=>{if(chrome.runtime.lastError)return r(Error(chrome.runtime.lastError.message));if(!n||!n.success)return r(Error(n?.error||"Failed to call Fish Audio API"));let a=n.audioBase64,s=atob(a),l=new Uint8Array(s.length);for(let d=0;d<s.length;d++)l[d]=s.charCodeAt(d);let c=new Blob([l],{type:"audio/mp3"});i({audioBlob:c})})})}function W(e,t,o){chrome.runtime.sendMessage({action:"logCommentary",currentSong:e,nextSong:t,script:o}).catch(console.error)}async function Z(e){return new Promise((t,o)=>{chrome.runtime.sendMessage({action:"callLyrics",query:e},(i)=>{if(chrome.runtime.lastError)return o(Error(chrome.runtime.lastError.message));if(!i||!i.success)return o(Error(i?.error||"Failed to call Lyrics API"));let r=i.data;console.log("Lyrics API response:",r),t(r?.[0]?.plainLyrics)})})}async function L(e,t,o,i){if(!o)throw Error("OpenRouter API key not configured. Please add it in extension settings.");let r=[{role:"system",content:e},{role:"user",content:t}];return new Promise((n,a)=>{chrome.runtime.sendMessage({action:"callOpenRouter",apiKey:o,model:i||"recursive/flint-v1.0:free",messages:r},(s)=>{if(chrome.runtime.lastError)return a(Error(chrome.runtime.lastError.message));if(!s||!s.success)return a(Error(s?.error||"Failed to call OpenRouter API"));n(s.data.trim().replace(/^"|"$/g,"").replace(/\\n/g,`
`).trim())})})}async function ee(e,t,o){let i=o||await M(),r=i.llmProvider||"openrouter";if(r==="openrouter")return L(e,t,i.openRouterApiKey,i.openRouterModel);else if(r==="gemini")return V(`${e}

${t}`,i.geminiApiKey);else return J(e,t)}var j={callMurfAPI:_,callFishAudioAPI:Q,callGeminiAPI:V,callChatJimmyAPI:J,callOpenRouterAPI:L,callLLM:ee,callLyricsAPI:Z,logCommentary:W,getAPISettings:M,generateRJPrompt:X};window.APIUtils=j;var g=j;var F={createAudioContext(){try{return new(window.AudioContext||window.webkitAudioContext)}catch(e){return console.error("Audio context creation failed:",e),null}},async smoothVolumeTransition(e,t,o=200){if(!e)return;let i=e.volume,r=20,n=(t-i)/r,a=o/r;for(let s=0;s<r;s++)setTimeout(()=>{let l=Math.max(0,Math.min(1,i+n*(s+1)));e.volume=l},a*s)},async duckVolume(e,t=0.3){if(!e)return 1;let o=e.volume;return await this.smoothVolumeTransition(e,t),o},async restoreVolume(e,t){if(!e||t===void 0)return;await this.smoothVolumeTransition(e,t,300)},createAudio(e){let t=URL.createObjectURL(e),o=new Audio(t);return o.addEventListener("error",(i)=>{console.error("Audio playback error:",i),URL.revokeObjectURL(t)}),{audio:o,audioUrl:t}},playAudio(e){return new Promise((t,o)=>{e.addEventListener("ended",t),e.addEventListener("error",o),e.play().catch(o)})}};window.AudioUtils=F;var h=F;var w=()=>{if(document.getElementById("rj-hardware-styles"))return;let e=document.createElement("style");e.id="rj-hardware-styles",e.textContent=`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Space+Grotesk:wght@500;700&display=swap');

    .rj-hw-root {
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      box-sizing: border-box;
    }

    .rj-hw-mono {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
    }

    .rj-hw-bevel {
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.85);
    }

    .rj-hw-recessed {
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.05);
    }

    .rj-glow-cyan {
      box-shadow: 0 0 12px rgba(0, 210, 196, 0.5), inset 0 0 6px rgba(0, 210, 196, 0.3);
    }

    .rj-glow-amber {
      box-shadow: 0 0 12px rgba(255, 158, 27, 0.5), inset 0 0 6px rgba(255, 158, 27, 0.3);
    }

    @keyframes rjPing {
      0% { transform: scale(1); opacity: 0.8; }
      75%, 100% { transform: scale(2.2); opacity: 0; }
    }

    @keyframes rjSlideInRight {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes rjSlideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(120%); opacity: 0; }
    }

    @keyframes rjEqualizer {
      0%, 100% { height: 4px; }
      50% { height: 14px; }
    }

    .rj-eq-bar-1 { animation: rjEqualizer 0.8s ease-in-out infinite; }
    .rj-eq-bar-2 { animation: rjEqualizer 0.8s ease-in-out 0.25s infinite; }
    .rj-eq-bar-3 { animation: rjEqualizer 0.8s ease-in-out 0.5s infinite; }
  `,document.head.appendChild(e)},te=(e)=>{if(w(),document.getElementById("rj-mode-button"))return;let t=document.createElement("button");t.id="rj-mode-button",t.className="rj-hw-root rj-hw-bevel",t.style.cssText=`
    position: fixed;
    top: 76px;
    right: 24px;
    z-index: 99999;
    background: linear-gradient(180deg, #181A1E 0%, #111215 100%);
    border: 1px solid #272B33;
    border-radius: 8px;
    padding: 8px 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #f1f5f9;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
  `,t.innerHTML=`
    <div style="display: flex; align-items: center; gap: 8px;">
      <div style="width: 22px; height: 22px; border-radius: 4px; background: #08090A; border: 1px solid #272B33; display: flex; align-items: center; justify-content: center; position: relative;">
        <span style="font-size: 11px;">\uD83C\uDF99️</span>
      </div>
      <div style="display: flex; flex-direction: column; text-align: left; line-height: 1.15;">
        <span class="rj-hw-mono" style="font-size: 7.5px; color: #94a3b8; letter-spacing: 0.14em; text-transform: uppercase;">YOUTUBE RJ // KONTROL</span>
        <span id="rj-btn-label" style="font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: #f8fafc;">START RJ MODE</span>
      </div>
    </div>
    <div style="position: relative; width: 10px; height: 10px; margin-left: 4px; display: flex; align-items: center; justify-content: center;">
      <div id="rj-btn-ping" style="display: none; position: absolute; inset: 0; border-radius: 50%; background: #00D2C4; animation: rjPing 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div id="rj-btn-led" style="width: 7px; height: 7px; border-radius: 50%; background: #475569; border: 1px solid #334155;"></div>
    </div>
  `,t.addEventListener("click",()=>e()),t.addEventListener("mouseenter",()=>{t.style.transform="translateY(-1px)",t.style.borderColor="#363C47"}),t.addEventListener("mouseleave",()=>{if(t.style.transform="translateY(0)",!t.dataset.active)t.style.borderColor="#272B33"}),document.body.appendChild(t)},oe=(e)=>{let t=document.getElementById("rj-mode-button");if(!t)return;let o=document.getElementById("rj-btn-label"),i=document.getElementById("rj-btn-led"),r=document.getElementById("rj-btn-ping");if(e){if(t.dataset.active="true",t.style.background="linear-gradient(180deg, #101c20 0%, #0a1316 100%)",t.style.borderColor="#00D2C4",t.style.boxShadow="0 0 16px rgba(0,210,196,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",o)o.textContent="ON AIR // ACTIVE",o.style.color="#00D2C4";if(i)i.style.background="#00D2C4",i.style.borderColor="#fff",i.style.boxShadow="0 0 8px #00D2C4";if(r)r.style.display="block"}else{if(delete t.dataset.active,t.style.background="linear-gradient(180deg, #181A1E 0%, #111215 100%)",t.style.borderColor="#272B33",t.style.boxShadow="inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.85)",o)o.textContent="START RJ MODE",o.style.color="#f8fafc";if(i)i.style.background="#475569",i.style.borderColor="#334155",i.style.boxShadow="none";if(r)r.style.display="none"}},ie=()=>{if(w(),document.getElementById("rj-loading"))return;let e=document.createElement("div");e.id="rj-loading",e.className="rj-hw-root rj-hw-bevel",e.style.cssText=`
    position: fixed;
    top: 136px;
    right: 24px;
    z-index: 99999;
    background: #08090A;
    border: 1px solid #272B33;
    border-radius: 6px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #f1f5f9;
    animation: rjSlideInRight 0.25s ease-out;
  `,e.innerHTML=`
    <div style="display: flex; align-items: flex-end; gap: 2.5px; height: 16px; padding-bottom: 1px;">
      <div class="rj-eq-bar-1" style="width: 3px; background: #00D2C4; border-radius: 1px; box-shadow: 0 0 4px #00D2C4;"></div>
      <div class="rj-eq-bar-2" style="width: 3px; background: #00D2C4; border-radius: 1px; box-shadow: 0 0 4px #00D2C4;"></div>
      <div class="rj-eq-bar-3" style="width: 3px; background: #FF9E1B; border-radius: 1px; box-shadow: 0 0 4px #FF9E1B;"></div>
    </div>
    <div style="display: flex; flex-direction: column; line-height: 1.2;">
      <span class="rj-hw-mono" style="font-size: 7.5px; color: #00D2C4; letter-spacing: 0.12em; text-transform: uppercase;">SYNTHESIZING COMMENTARY</span>
      <span class="rj-hw-mono" style="font-size: 9.5px; font-weight: 700; color: #f1f5f9; letter-spacing: 0.04em;">BUFFERING NEXT TRACK...</span>
    </div>
  `,document.body.appendChild(e)},re=()=>{let e=document.getElementById("rj-loading");if(e)e.remove()},ne=(e)=>{w();let t=document.getElementById("rj-error-message");if(t)t.remove();let o=document.createElement("div");o.id="rj-error-message",o.className="rj-hw-root rj-hw-bevel",o.style.cssText=`
    position: fixed;
    top: 136px;
    right: 24px;
    z-index: 100000;
    background: #14080a;
    border: 1px solid #ef4444;
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
    color: #fecaca;
    padding: 10px 16px;
    border-radius: 8px;
    max-width: 360px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    animation: rjSlideInRight 0.25s ease-out;
  `,o.innerHTML=`
    <span style="font-size: 14px; line-height: 1; margin-top: 2px;">⚠️</span>
    <div style="display: flex; flex-direction: column; line-height: 1.25; flex: 1;">
      <span class="rj-hw-mono" style="font-size: 8px; color: #f87171; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700;">BROADCAST ENGINE FAULT</span>
      <span style="font-size: 10.5px; color: #f8fafc; margin-top: 3px; word-break: break-word;">${e}</span>
    </div>
  `,document.body.appendChild(o),setTimeout(()=>{o.style.animation="rjSlideOutRight 0.25s ease-in forwards",setTimeout(()=>o.remove(),250)},5000)},x=()=>{let e=document.getElementById("rj-mode-notification");if(e)e.style.animation="rjSlideOutRight 0.25s ease-in forwards",setTimeout(()=>{e.remove()},250)},se=(e)=>{if(w(),document.getElementById("rj-mode-notification"))return;let t=document.createElement("div");t.id="rj-mode-notification",t.className="rj-hw-root rj-hw-bevel",t.style.cssText=`
    position: fixed;
    top: 76px;
    right: 24px;
    z-index: 100000;
    width: 350px;
    background: linear-gradient(180deg, #181A1E 0%, #111215 100%);
    border: 1px solid #272B33;
    border-radius: 8px;
    overflow: hidden;
    color: #f1f5f9;
    animation: rjSlideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `,t.innerHTML=`
    <!-- Top Hardware Accent Bar -->
    <div style="background: #08090A; border-bottom: 1px solid #272B33; padding: 4px 10px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="width: 5px; height: 5px; border-radius: 50%; background: #FF9E1B; box-shadow: 0 0 4px #FF9E1B;"></span>
        <span class="rj-hw-mono" style="font-size: 7.5px; color: #FF9E1B; font-weight: 700; letter-spacing: 0.12em;">PLAYLIST DETECTED // FREQ LOCK</span>
      </div>
      <button id="dismiss-rj-prompt" style="background: transparent; border: none; color: #64748b; font-size: 13px; cursor: pointer; padding: 0 2px; line-height: 1;">✕</button>
    </div>

    <!-- Main Content Area -->
    <div style="padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 32px; height: 32px; border-radius: 6px; background: #08090A; border: 1px solid #272B33; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 16px;">\uD83C\uDF99️</span>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 700; color: #f8fafc; letter-spacing: 0.02em;">YOUTUBE RJ READY</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 1px;">Auto-transition commentary engine</div>
        </div>
      </div>

      <button id="enable-rj-mode" style="
        background: #00D2C4;
        color: #060709;
        border: none;
        padding: 6px 12px;
        border-radius: 5px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 9.5px;
        font-weight: 700;
        letter-spacing: 0.05em;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(0,210,196,0.35);
        transition: all 0.15s ease;
        white-space: nowrap;
      ">ENABLE RJ</button>
    </div>
  `,document.body.appendChild(t);let o=document.getElementById("enable-rj-mode");o?.addEventListener("mouseenter",()=>{o.style.background="#12e6d8",o.style.boxShadow="0 0 14px rgba(0,210,196,0.55)"}),o?.addEventListener("mouseleave",()=>{o.style.background="#00D2C4",o.style.boxShadow="0 0 10px rgba(0,210,196,0.35)"}),o?.addEventListener("click",()=>{x(),e()}),document.getElementById("dismiss-rj-prompt")?.addEventListener("click",()=>{x()}),setTimeout(()=>{x()},12000)},D={showErrorMessage:ne,showRJModePrompt:se,createRJModeButton:te,updateRJModeButton:oe,dismissNotification:x,showLoadingIndicator:ie,hideLoadingIndicator:re};window.DomUtils=D;var u=D;var U={extractVideoId(){return new URLSearchParams(window.location.search).get("v")||null},getCurrentVideoTitle(){return document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer")?.textContent?.trim()||""},getDescription(){return document?.querySelector("#description-inner")?.textContent?.trim()||""},getComments(){let e=[];return document.querySelectorAll("#comment-container").forEach((t)=>{let o=t.querySelector("#expander")?.textContent?.trim()||"";e.push(o)}),e},getNextVideoTitle(){return document.querySelector("#playlist-items[selected]")?.nextSibling?.querySelector("#video-title")?.textContent?.trim()||""},isPlaylistPage(){return new URLSearchParams(window.location.search).has("list")},getPlaylistId(){return new URLSearchParams(window.location.search).get("list")},getVideoElement(){return document.querySelector("video")},cleanVideoTitle(e){return e.replace(/\(Official.*?\)/gi,"").replace(/\(Music Video\)/gi,"").replace(/\[Official.*?\]/gi,"").replace(/- Topic$/,"").trim()},getVideoDuration(){let e=this.getVideoElement();return e?e.duration:0},isVideoPlaying(){let e=this.getVideoElement();return e?!e.paused&&!e.ended:!1}};window.YouTubeUtils=U;var m=U;class v{audioBlob=null;async synthesize(e,t="en"){return new Promise((o,i)=>{chrome.runtime.sendMessage({action:"getTTSAudio",payload:{text:e,lang:t}},(r)=>{if(chrome.runtime.lastError)return console.error("TTS Runtime Error:",chrome.runtime.lastError),i(Error(chrome.runtime.lastError.message));if(!r||!r.success)return console.error("TTS API Error:",r?.error),i(Error(r?.error||"Failed to get TTS audio"));try{let a=r.data.map((s)=>{let l=atob(s),c=new Uint8Array(l.length);for(let d=0;d<l.length;d++)c[d]=l.charCodeAt(d);return c.buffer});this.audioBlob=new Blob(a,{type:"audio/mpeg"}),o()}catch(n){console.error("Error processing TTS audio data:",n),i(n)}})})}toBlob(){if(!this.audioBlob)throw Error("No audio data available. Did you run synthesize() first?");return this.audioBlob}}class E{audioBlob=null;async synthesize(e,t,o="ba1a38946dea44609fc4a8fe6113ed88"){if(!t)throw Error("Fish Audio API key not configured");return new Promise((i,r)=>{chrome.runtime.sendMessage({action:"callFishAudio",text:e,referenceId:o,apiKey:t},(n)=>{if(chrome.runtime.lastError)return console.error("Fish Audio Runtime Error:",chrome.runtime.lastError),r(Error(chrome.runtime.lastError.message));if(!n||!n.success)return console.error("Fish Audio API Error:",n?.error),r(Error(n?.error||"Failed to get Fish Audio TTS"));try{let a=n.audioBase64,s=atob(a),l=new Uint8Array(s.length);for(let c=0;c<s.length;c++)l[c]=s.charCodeAt(c);this.audioBlob=new Blob([l],{type:"audio/mp3"}),i()}catch(a){console.error("Error processing Fish Audio data:",a),r(a)}})})}toBlob(){if(!this.audioBlob)throw Error("No audio data available. Did you run synthesize() first?");return this.audioBlob}}class T{isRJModeActive;currentVideoTitle;nextVideoTitle;originalVolume;isRJPlaying;audioContext;gainNode;lastProcessedVideo;isGeneratingCommentary;videoChangeTimeout;progressInterval;scriptHistory;googleTTS;fishAudioTTS;ttsVoice;generatedAudioData;constructor(){this.isRJModeActive=!1,this.currentVideoTitle="",this.nextVideoTitle="",this.originalVolume=1,this.isRJPlaying=!1,this.audioContext=null,this.gainNode=null,this.lastProcessedVideo="",this.isGeneratingCommentary=!1,this.videoChangeTimeout=null,this.progressInterval=null,this.scriptHistory=[],this.googleTTS=new v,this.fishAudioTTS=new E,this.ttsVoice="en",this.generatedAudioData=null,this.init()}async init(){await this.promptUserForAPIKeys(),this.setupAudioContext(),this.detectPlaylist(),u.createRJModeButton(this.toggleRJMode.bind(this))}async promptUserForAPIKeys(){let e=await g.getAPISettings();if(!e.geminiApiKey){let o=prompt("Enter your Gemini API Key:");if(o)chrome.storage.sync.set({geminiApiKey:o});else alert("Get free API key from https://aistudio.google.com/apikey")}if((e.ttsProvider||(e.fishApiKey?"fish-audio":e.murfApiKey?"murf":"fish-audio"))==="fish-audio"&&!e.fishApiKey){let o=prompt("Enter your Fish Audio API Key:");if(o)chrome.storage.sync.set({fishApiKey:o})}}setupAudioContext(){if(this.audioContext=h.createAudioContext(),this.audioContext)this.gainNode=this.audioContext.createGain()}detectPlaylist(){if(m.isPlaylistPage()&&!document.getElementById("rj-mode-button"))u.showRJModePrompt(this.toggleRJMode.bind(this))}getCurrentAndNextTitles(){this.currentVideoTitle=m.cleanVideoTitle(m.getCurrentVideoTitle()),this.nextVideoTitle=m.cleanVideoTitle(m.getNextVideoTitle())}async generateRJCommentary(){if(this.isGeneratingCommentary||this.isRJPlaying){console.log("Commentary already in progress, skipping...");return}let e=m.extractVideoId()||this.currentVideoTitle;if(e===this.lastProcessedVideo){console.log("Already processed this video, skipping...");return}if(!this.currentVideoTitle||this.currentVideoTitle.trim()===""){console.log("No current video title found, skipping...");return}this.isGeneratingCommentary=!0,this.lastProcessedVideo=e;try{u.showLoadingIndicator();let t=null;try{t=await g.callLyricsAPI(this.currentVideoTitle)}catch(l){console.warn("Lyrics API failed or no lyrics found, proceeding with commentary & TTS generation:",l)}let o=await g.getAPISettings(),{systemPrompt:i,currentTask:r}=g.generateRJPrompt(this.currentVideoTitle,this.nextVideoTitle,o.rjStyle,o.commentaryLength,o.includeHistory?this.scriptHistory.join(`
`):"",o.includeComments?m.getComments().join(`
`):"",t,o.hostName,o.radioStation);console.log("Generated systemPrompt:",i),console.log("Generated currentTask:",r);let n=await g.callLLM(i,r,o);console.log("Generated script:",n),this.scriptHistory.push(n);let a={},s=o.ttsProvider||(o.fishApiKey?"fish-audio":o.murfApiKey?"murf":"fish-audio");if(s==="fish-audio"){if(!o.fishApiKey)throw Error("Fish Audio API key not configured. Please add it in extension settings.");let l=o.voiceId||"ba1a38946dea44609fc4a8fe6113ed88";await this.fishAudioTTS.synthesize(n,o.fishApiKey,l),a={audioBlob:this.fishAudioTTS.toBlob()}}else if(s==="murf"){if(!o.murfApiKey)throw Error("Murf.ai API key not configured. Please add it in extension settings.");a=await g.callMurfAPI(n,o.murfApiKey,o.voiceId,o.voiceStyle)}else{let l=o.voiceId||this.ttsVoice;if(l.includes("-")&&l.split("-").length>2)l=l.split("-").slice(0,2).join("-");await this.googleTTS.synthesize(n,l),a={audioBlob:this.googleTTS.toBlob()}}g.logCommentary(this.currentVideoTitle,this.nextVideoTitle,n),this.generatedAudioData=a,u.hideLoadingIndicator()}catch(t){console.error("RJ Commentary generation failed:",t),u.hideLoadingIndicator(),u.showErrorMessage(t.message)}finally{this.isGeneratingCommentary=!1}}async playRJCommentary(){let e=this.generatedAudioData?.audioBlob;if(!e){console.error("No audio data available to play.");return}if(this.isRJPlaying){console.log("RJ already playing, skipping...");return}this.isRJPlaying=!0;let t=m.getVideoElement();try{if(!t){console.error("No video element found on the page."),this.isRJPlaying=!1;return}this.originalVolume=await h.duckVolume(t,0.1);let{audio:o,audioUrl:i}=h.createAudio(e);o.addEventListener("ended",()=>{this.restoreVolumeAndCleanup(t,i)}),o.addEventListener("error",(r)=>{console.error("Audio error:",r),this.restoreVolumeAndCleanup(t,i)}),await h.playAudio(o).catch((r)=>{console.error("Audio playback failed:",r),this.restoreVolumeAndCleanup(t,i)})}catch(o){if(console.error("Error playing RJ commentary:",o),this.isRJPlaying=!1,t)await h.restoreVolume(t,this.originalVolume)}finally{this.generatedAudioData=null}}async restoreVolumeAndCleanup(e,t){if(await h.restoreVolume(e,this.originalVolume),t)URL.revokeObjectURL(t);this.isRJPlaying=!1,console.log("RJ commentary cleanup completed")}async toggleRJMode(){if(this.isRJModeActive=!this.isRJModeActive,u.updateRJModeButton(this.isRJModeActive),this.isRJModeActive)await this.startRJMode();else this.stopRJMode()}async startRJMode(){this.getCurrentAndNextTitles(),this.setupVideoEventListeners()}stopRJMode(){if(this.isRJModeActive=!1,this.isRJPlaying=!1,this.isGeneratingCommentary=!1,this.lastProcessedVideo="",u.updateRJModeButton(!1),this.videoChangeTimeout)clearTimeout(this.videoChangeTimeout),this.videoChangeTimeout=null;clearInterval(this.progressInterval),u.hideLoadingIndicator(),console.log("RJ Mode stopped and cleaned up")}setupVideoEventListeners(){let e=()=>{console.log("checkVideoProgress called");let o=document.querySelector("video");if(!o||!this.isRJModeActive)return;let i=o.duration-o.currentTime;if(o.currentTime>10&&!this.isGeneratingCommentary&&!this.generatedAudioData)this.getCurrentAndNextTitles(),this.generateRJCommentary();if(i<=30&&!this.isRJPlaying&&!this.isGeneratingCommentary)this.playRJCommentary()},t=()=>{if(this.progressInterval)clearInterval(this.progressInterval);this.progressInterval=setInterval(e,1000)};if(this.isRJModeActive)t()}}chrome.runtime.onMessage.addListener((e,t,o)=>{if(e?.action==="generateRJCommentary"||e?.action==="playRJCommentary"){let i=window.youtubeRJ;if(!i)return o({success:!1,error:"RJ instance not available on this page"}),!1;return(e.action==="generateRJCommentary"?i.generateRJCommentary.bind(i):i.playRJCommentary.bind(i))().then(()=>o({success:!0})).catch((n)=>o({success:!1,error:n?.message||String(n)})),!0}return!1});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{let e=new T;window.youtubeRJ=e,console.log(e)});else{let e=new T;window.youtubeRJ=e,console.log(e)}

//# debugId=E8D473A389A5006764756E2164756E21

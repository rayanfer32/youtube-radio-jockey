var G=Object.create;var{getPrototypeOf:q,defineProperty:f,getOwnPropertyNames:R,getOwnPropertyDescriptor:K}=Object,S=Object.prototype.hasOwnProperty;function B(e){return this[e]}var H,O,le=(e,t,i)=>{var o=e!=null&&typeof e==="object";if(o){var r=t?H??=new WeakMap:O??=new WeakMap,s=r.get(e);if(s)return s}i=e!=null?G(q(e)):{};let a=t||!e||!e.__esModule?f(i,"default",{value:e,enumerable:!0}):i;if(e&&typeof e==="object"||typeof e==="function"){for(let n of R(e))if(!S.call(a,n))f(a,n,{get:B.bind(e,n),enumerable:!0})}if(o)r.set(e,a);return a},de=(e)=>{var t=(I??=new WeakMap).get(e),i;if(t)return t;if(t=f({},"__esModule",{value:!0}),e&&typeof e==="object"||typeof e==="function"){for(var o of R(e))if(!S.call(t,o))f(t,o,{get:B.bind(e,o),enumerable:!(i=K(e,o))||i.enumerable})}return I.set(e,t),t},I,ce=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var Y=(e)=>e;function X(e,t){this[e]=Y.bind(null,t)}var ue=(e,t)=>{for(var i in t)f(e,i,{get:t[i],enumerable:!0,configurable:!0,set:X.bind(t,i)})};var me=(e,t)=>()=>(e&&(t=e(e=0)),t);var v={geminiApiKey:"",murfApiKey:"",fishApiKey:"",openRouterApiKey:"",openRouterModel:"recursive/flint-v1.0:free",llmProvider:"openrouter",ttsProvider:"fish-audio",rjStyle:"sarcastic",commentaryLength:"short",voiceId:"ba1a38946dea44609fc4a8fe6113ed88",voiceStyle:"Promo",includeHistory:!1,includeComments:!1,autoStart:!1,volumeDucking:50,hostName:"Alexis",radioStation:"97.7 Youtube FM"},M=async()=>{let e=await chrome.storage.sync.get();return{...v,...e}},k={energetic:"You are a high-energy radio DJ who's absolutely pumped about music!",chill:"You are a laid-back DJ with a smooth, relaxed vibe.",sarcastic:"You are a witty DJ who adds clever commentary with a touch of sarcasm.",professional:"You are a professional radio host with polished delivery."},V={short:"Keep it brief and punchy (20-30 seconds when spoken)",medium:"Moderate length with good flow (30-45 seconds when spoken)",long:"More detailed commentary (45-60 seconds when spoken)"};function _(e,t,i,o,r,s,a,n,l){let d=k[i]||k.energetic,c=V[o]||V.medium,x=n||v.hostName,h=`Radio station: ${l||v.radioStation}
Host name: ${x}`,z=`${d} ${c}. ${h}.

Important guidelines:
- AVOID using special characters that are not detected by TTS in the commentary, your output will be used to generate audio.
- AVOID expressions in brackets or parentheses.
- AVOID saying Alright and Okay okay or similar phrases at the beginning. Cook up new intros.
- CREATE engaging commentary that connects with listeners. Be natural, enthusiastic, and add personality. Don't read the song titles - make it conversational and fun!
- ONLY respond with the commentary text, do not include any additional instructions or explanations.`.trim(),y=`Current song: "${e}"`;if(a)y+=`
Current song Lyrics: ${a}`;if(t)y+=`
Upcoming Song: "${t}"`;if(s)y+=`
Viewer comments: ${s}`;if(r)y+=`
Previous commentary history:
${r}`;return{systemPrompt:z,currentTask:y}}async function J(e,t){if(!t)throw Error("Gemini API key not configured");let i={contents:[{parts:[{text:e}]}]};return new Promise((o,r)=>{chrome.runtime.sendMessage({action:"callGemini",payload:i,apiKey:t},(s)=>{if(chrome.runtime.lastError)return r(Error(chrome.runtime.lastError.message));if(!s||!s.success)return r(Error(s?.error||"Failed to call Gemini API"));let a=s.data;if(!a.candidates||!a.candidates[0]||!a.candidates[0].content)return r(Error("Invalid response from Gemini API"));o(a.candidates[0].content.parts[0].text)})})}async function L(e,t){let i,o;if(typeof e==="object")i=e.systemPrompt,o=e.currentTask;else if(t!==void 0)i=e,o=t;else i=e,o=e;let r={messages:[{role:"system",content:i},{role:"user",content:o}],chatOptions:{selectedModel:"llama3.1-8B",systemPrompt:i,topK:2},attachment:null};return new Promise((s,a)=>{chrome.runtime.sendMessage({action:"callChatJimmy",payload:r},(n)=>{if(chrome.runtime.lastError)return a(Error(chrome.runtime.lastError.message));if(!n||!n.success)return a(Error(n?.error||"Failed to call ChatJimmy API"));let l=n.data,d=l.indexOf("<|stats|>"),c=l;if(d!==-1)c=l.substring(0,d);s(c.trim().replace(/^"|"$/g,"").replace(/\\n/g,`
`).trim())})})}async function Q(e,t,i="en-US-natalie",o="Promo"){if(!t)throw Error("Murf.ai API key not configured");let r={text:e,voiceId:i,style:o};return new Promise((s,a)=>{chrome.runtime.sendMessage({action:"callMurf",payload:r,apiKey:t},(n)=>{if(chrome.runtime.lastError)return a(Error(chrome.runtime.lastError.message));if(!n||!n.success)return a(Error(n?.error||"Failed to call Murf API"));let{data:l,audioBase64:d}=n,c=atob(d),x=new Uint8Array(c.length);for(let h=0;h<c.length;h++)x[h]=c.charCodeAt(h);let P=new Blob([x],{type:"audio/mpeg"});s({audioBlob:P,duration:l.audioLengthInSeconds,remainingChars:l.remainingCharacterCount})})})}async function W(e,t,i="ba1a38946dea44609fc4a8fe6113ed88"){if(!t)throw Error("Fish Audio API key not configured");return new Promise((o,r)=>{chrome.runtime.sendMessage({action:"callFishAudio",text:e,referenceId:i,apiKey:t},(s)=>{if(chrome.runtime.lastError)return r(Error(chrome.runtime.lastError.message));if(!s||!s.success)return r(Error(s?.error||"Failed to call Fish Audio API"));let a=s.audioBase64,n=atob(a),l=new Uint8Array(n.length);for(let c=0;c<n.length;c++)l[c]=n.charCodeAt(c);let d=new Blob([l],{type:"audio/mp3"});o({audioBlob:d})})})}function Z(e,t,i){chrome.runtime.sendMessage({action:"logCommentary",currentSong:e,nextSong:t,script:i}).catch(console.error)}async function ee(e){return new Promise((t,i)=>{chrome.runtime.sendMessage({action:"callLyrics",query:e},(o)=>{if(chrome.runtime.lastError)return i(Error(chrome.runtime.lastError.message));if(!o||!o.success)return i(Error(o?.error||"Failed to call Lyrics API"));let r=o.data;console.log("Lyrics API response:",r),t(r?.[0]?.plainLyrics)})})}async function j(e,t,i,o){if(!i)throw Error("OpenRouter API key not configured. Please add it in extension settings.");let r=[{role:"system",content:e},{role:"user",content:t}];return new Promise((s,a)=>{chrome.runtime.sendMessage({action:"callOpenRouter",apiKey:i,model:o||"recursive/flint-v1.0:free",messages:r},(n)=>{if(chrome.runtime.lastError)return a(Error(chrome.runtime.lastError.message));if(!n||!n.success)return a(Error(n?.error||"Failed to call OpenRouter API"));s(n.data.trim().replace(/^"|"$/g,"").replace(/\\n/g,`
`).trim())})})}async function te(e,t,i){let o=i||await M(),r=o.llmProvider||"openrouter";if(r==="openrouter")return j(e,t,o.openRouterApiKey,o.openRouterModel);else if(r==="gemini")return J(`${e}

${t}`,o.geminiApiKey);else return L(e,t)}var F={callMurfAPI:Q,callFishAudioAPI:W,callGeminiAPI:J,callChatJimmyAPI:L,callOpenRouterAPI:j,callLLM:te,callLyricsAPI:ee,logCommentary:Z,getAPISettings:M,generateRJPrompt:_};window.APIUtils=F;var g=F;var D={createAudioContext(){try{return new(window.AudioContext||window.webkitAudioContext)}catch(e){return console.error("Audio context creation failed:",e),null}},async smoothVolumeTransition(e,t,i=200){if(!e)return;let o=e.volume,r=20,s=(t-o)/r,a=i/r;for(let n=0;n<r;n++)setTimeout(()=>{let l=Math.max(0,Math.min(1,o+s*(n+1)));e.volume=l},a*n)},async duckVolume(e,t=0.3){if(!e)return 1;let i=e.volume;return await this.smoothVolumeTransition(e,t),i},async restoreVolume(e,t){if(!e||t===void 0)return;await this.smoothVolumeTransition(e,t,300)},createAudio(e){let t=URL.createObjectURL(e),i=new Audio(t);return i.addEventListener("error",(o)=>{console.error("Audio playback error:",o),URL.revokeObjectURL(t)}),{audio:i,audioUrl:t}},playAudio(e){return new Promise((t,i)=>{e.addEventListener("ended",t),e.addEventListener("error",i),e.play().catch(i)})}};window.AudioUtils=D;var p=D;var A=()=>{if(document.getElementById("rj-hardware-styles"))return;let e=document.createElement("style");e.id="rj-hardware-styles",e.textContent=`
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
  `,document.head.appendChild(e)},ie=(e)=>{if(A(),document.getElementById("rj-mode-button"))return;let t=document.createElement("button");t.id="rj-mode-button",t.className="rj-hw-root rj-hw-bevel",t.style.cssText=`
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
  `,t.addEventListener("click",()=>e()),t.addEventListener("mouseenter",()=>{t.style.transform="translateY(-1px)",t.style.borderColor="#363C47"}),t.addEventListener("mouseleave",()=>{if(t.style.transform="translateY(0)",!t.dataset.active)t.style.borderColor="#272B33"}),document.body.appendChild(t)},oe=(e)=>{let t=document.getElementById("rj-mode-button");if(!t)return;let i=document.getElementById("rj-btn-label"),o=document.getElementById("rj-btn-led"),r=document.getElementById("rj-btn-ping");if(e){if(t.dataset.active="true",t.style.background="linear-gradient(180deg, #101c20 0%, #0a1316 100%)",t.style.borderColor="#00D2C4",t.style.boxShadow="0 0 16px rgba(0,210,196,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",i)i.textContent="ON AIR // ACTIVE",i.style.color="#00D2C4";if(o)o.style.background="#00D2C4",o.style.borderColor="#fff",o.style.boxShadow="0 0 8px #00D2C4";if(r)r.style.display="block"}else{if(delete t.dataset.active,t.style.background="linear-gradient(180deg, #181A1E 0%, #111215 100%)",t.style.borderColor="#272B33",t.style.boxShadow="inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.85)",i)i.textContent="START RJ MODE",i.style.color="#f8fafc";if(o)o.style.background="#475569",o.style.borderColor="#334155",o.style.boxShadow="none";if(r)r.style.display="none"}},re=()=>{if(A(),document.getElementById("rj-loading"))return;let e=document.createElement("div");e.id="rj-loading",e.className="rj-hw-root rj-hw-bevel",e.style.cssText=`
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
  `,document.body.appendChild(e)},ne=()=>{let e=document.getElementById("rj-loading");if(e)e.remove()},se=(e)=>{A();let t=document.getElementById("rj-error-message");if(t)t.remove();let i=document.createElement("div");i.id="rj-error-message",i.className="rj-hw-root rj-hw-bevel",i.style.cssText=`
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
  `,i.innerHTML=`
    <span style="font-size: 14px; line-height: 1; margin-top: 2px;">⚠️</span>
    <div style="display: flex; flex-direction: column; line-height: 1.25; flex: 1;">
      <span class="rj-hw-mono" style="font-size: 8px; color: #f87171; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700;">BROADCAST ENGINE FAULT</span>
      <span style="font-size: 10.5px; color: #f8fafc; margin-top: 3px; word-break: break-word;">${e}</span>
    </div>
  `,document.body.appendChild(i),setTimeout(()=>{i.style.animation="rjSlideOutRight 0.25s ease-in forwards",setTimeout(()=>i.remove(),250)},5000)},w=()=>{let e=document.getElementById("rj-mode-notification");if(e)e.style.animation="rjSlideOutRight 0.25s ease-in forwards",setTimeout(()=>{e.remove()},250)},ae=(e)=>{if(A(),document.getElementById("rj-mode-notification"))return;let t=document.createElement("div");t.id="rj-mode-notification",t.className="rj-hw-root rj-hw-bevel",t.style.cssText=`
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
  `,document.body.appendChild(t);let i=document.getElementById("enable-rj-mode");i?.addEventListener("mouseenter",()=>{i.style.background="#12e6d8",i.style.boxShadow="0 0 14px rgba(0,210,196,0.55)"}),i?.addEventListener("mouseleave",()=>{i.style.background="#00D2C4",i.style.boxShadow="0 0 10px rgba(0,210,196,0.35)"}),i?.addEventListener("click",()=>{w(),e()}),document.getElementById("dismiss-rj-prompt")?.addEventListener("click",()=>{w()}),setTimeout(()=>{w()},12000)},U={showErrorMessage:se,showRJModePrompt:ae,createRJModeButton:ie,updateRJModeButton:oe,dismissNotification:w,showLoadingIndicator:re,hideLoadingIndicator:ne};window.DomUtils=U;var u=U;var b=()=>window.location.hostname.includes("music.youtube.com"),N={extractVideoId(){return new URLSearchParams(window.location.search).get("v")||null},isYouTubeMusic:b,getCurrentVideoTitle(){if(b()){let t=document.querySelector(".title.style-scope.ytmusic-player-bar")?.textContent?.trim();if(t)return t;let i=Array.from(document.querySelectorAll("ytmusic-responsive-list-item-renderer")),r=i.find((n)=>{let l=n.getAttribute("play-button-state");return l==="playing"||l==="paused"})?.querySelector("yt-formatted-string.title")?.textContent?.trim();if(r)return r;let s=this.extractVideoId();if(s){let l=i.find((d)=>(d.innerHTML||"").includes(s))?.querySelector("yt-formatted-string.title")?.textContent?.trim();if(l)return l}let a=document.querySelector("ytmusic-player-queue-item .song-title")?.textContent?.trim();if(a)return a;return document.querySelector(".ytp-title-link")?.textContent?.trim()||""}return document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer")?.textContent?.trim()||""},getDescription(){if(b())return"";return document?.querySelector("#description-inner")?.textContent?.trim()||""},getComments(){if(b())return[];let e=[];return document.querySelectorAll("#comment-container").forEach((t)=>{let i=t.querySelector("#expander")?.textContent?.trim()||"";e.push(i)}),e},getNextVideoTitle(){if(b()){let i=Array.from(document.querySelectorAll("ytmusic-responsive-list-item-renderer"));if(i.length===0)return"";let o=document.querySelector(".title.style-scope.ytmusic-player-bar")?.textContent?.trim(),r=-1;if(o)r=i.findIndex((a)=>a.querySelector("yt-formatted-string.title")?.textContent?.trim()===o);if(r===-1)r=i.findIndex((a)=>{let n=a.getAttribute("play-button-state");return n==="playing"||n==="paused"});if(r===-1){let a=this.extractVideoId();if(a)r=i.findIndex((n)=>(n.innerHTML||"").includes(a))}if(r===-1)r=0;return i[r+1]?.querySelector("yt-formatted-string.title")?.textContent?.trim()||""}return document.querySelector("#playlist-items[selected]")?.nextSibling?.querySelector("#video-title")?.textContent?.trim()||""},isPlaylistPage(){return new URLSearchParams(window.location.search).has("list")},getPlaylistId(){return new URLSearchParams(window.location.search).get("list")},getVideoElement(){return document.querySelector("video")},cleanVideoTitle(e){return e.replace(/\(Official.*?\)/gi,"").replace(/\(Music Video\)/gi,"").replace(/\[Official.*?\]/gi,"").replace(/- Topic$/,"").trim()},getVideoDuration(){let e=this.getVideoElement();return e?e.duration:0},isVideoPlaying(){let e=this.getVideoElement();return e?!e.paused&&!e.ended:!1}};window.YouTubeUtils=N;var m=N;class E{audioBlob=null;async synthesize(e,t="en"){return new Promise((i,o)=>{chrome.runtime.sendMessage({action:"getTTSAudio",payload:{text:e,lang:t}},(r)=>{if(chrome.runtime.lastError)return console.error("TTS Runtime Error:",chrome.runtime.lastError),o(Error(chrome.runtime.lastError.message));if(!r||!r.success)return console.error("TTS API Error:",r?.error),o(Error(r?.error||"Failed to get TTS audio"));try{let a=r.data.map((n)=>{let l=atob(n),d=new Uint8Array(l.length);for(let c=0;c<l.length;c++)d[c]=l.charCodeAt(c);return d.buffer});this.audioBlob=new Blob(a,{type:"audio/mpeg"}),i()}catch(s){console.error("Error processing TTS audio data:",s),o(s)}})})}toBlob(){if(!this.audioBlob)throw Error("No audio data available. Did you run synthesize() first?");return this.audioBlob}}class T{audioBlob=null;async synthesize(e,t,i="ba1a38946dea44609fc4a8fe6113ed88"){if(!t)throw Error("Fish Audio API key not configured");return new Promise((o,r)=>{chrome.runtime.sendMessage({action:"callFishAudio",text:e,referenceId:i,apiKey:t},(s)=>{if(chrome.runtime.lastError)return console.error("Fish Audio Runtime Error:",chrome.runtime.lastError),r(Error(chrome.runtime.lastError.message));if(!s||!s.success)return console.error("Fish Audio API Error:",s?.error),r(Error(s?.error||"Failed to get Fish Audio TTS"));try{let a=s.audioBase64,n=atob(a),l=new Uint8Array(n.length);for(let d=0;d<n.length;d++)l[d]=n.charCodeAt(d);this.audioBlob=new Blob([l],{type:"audio/mp3"}),o()}catch(a){console.error("Error processing Fish Audio data:",a),r(a)}})})}toBlob(){if(!this.audioBlob)throw Error("No audio data available. Did you run synthesize() first?");return this.audioBlob}}class C{isRJModeActive;currentVideoTitle;nextVideoTitle;originalVolume;isRJPlaying;audioContext;gainNode;lastProcessedVideo;isGeneratingCommentary;videoChangeTimeout;progressInterval;scriptHistory;googleTTS;fishAudioTTS;ttsVoice;generatedAudioData;constructor(){this.isRJModeActive=!1,this.currentVideoTitle="",this.nextVideoTitle="",this.originalVolume=1,this.isRJPlaying=!1,this.audioContext=null,this.gainNode=null,this.lastProcessedVideo="",this.isGeneratingCommentary=!1,this.videoChangeTimeout=null,this.progressInterval=null,this.scriptHistory=[],this.googleTTS=new E,this.fishAudioTTS=new T,this.ttsVoice="en",this.generatedAudioData=null,this.init()}async init(){await this.promptUserForAPIKeys(),this.setupAudioContext(),this.detectPlaylist(),u.createRJModeButton(this.toggleRJMode.bind(this))}async promptUserForAPIKeys(){let e=await g.getAPISettings();if(!e.geminiApiKey){let i=prompt("Enter your Gemini API Key:");if(i)chrome.storage.sync.set({geminiApiKey:i});else alert("Get free API key from https://aistudio.google.com/apikey")}if((e.ttsProvider||(e.fishApiKey?"fish-audio":e.murfApiKey?"murf":"fish-audio"))==="fish-audio"&&!e.fishApiKey){let i=prompt("Enter your Fish Audio API Key:");if(i)chrome.storage.sync.set({fishApiKey:i})}}setupAudioContext(){if(this.audioContext=p.createAudioContext(),this.audioContext)this.gainNode=this.audioContext.createGain()}detectPlaylist(){if(m.isPlaylistPage()&&!document.getElementById("rj-mode-button"))u.showRJModePrompt(this.toggleRJMode.bind(this))}getCurrentAndNextTitles(){this.currentVideoTitle=m.cleanVideoTitle(m.getCurrentVideoTitle()),this.nextVideoTitle=m.cleanVideoTitle(m.getNextVideoTitle())}async generateRJCommentary(){if(this.isGeneratingCommentary||this.isRJPlaying){console.log("Commentary already in progress, skipping...");return}let e=m.extractVideoId()||this.currentVideoTitle;if(e===this.lastProcessedVideo){console.log("Already processed this video, skipping...");return}if(!this.currentVideoTitle||this.currentVideoTitle.trim()===""){console.log("No current video title found, skipping...");return}this.isGeneratingCommentary=!0,this.lastProcessedVideo=e;try{u.showLoadingIndicator();let t=null;try{t=await g.callLyricsAPI(this.currentVideoTitle)}catch(l){console.warn("Lyrics API failed or no lyrics found, proceeding with commentary & TTS generation:",l)}let i=await g.getAPISettings(),{systemPrompt:o,currentTask:r}=g.generateRJPrompt(this.currentVideoTitle,this.nextVideoTitle,i.rjStyle,i.commentaryLength,i.includeHistory?this.scriptHistory.join(`
`):"",i.includeComments?m.getComments().join(`
`):"",t,i.hostName,i.radioStation);console.log("Generated systemPrompt:",o),console.log("Generated currentTask:",r);let s=await g.callLLM(o,r,i);console.log("Generated script:",s),this.scriptHistory.push(s);let a={},n=i.ttsProvider||(i.fishApiKey?"fish-audio":i.murfApiKey?"murf":"fish-audio");if(n==="fish-audio"){if(!i.fishApiKey)throw Error("Fish Audio API key not configured. Please add it in extension settings.");let l=i.voiceId||"ba1a38946dea44609fc4a8fe6113ed88";await this.fishAudioTTS.synthesize(s,i.fishApiKey,l),a={audioBlob:this.fishAudioTTS.toBlob()}}else if(n==="murf"){if(!i.murfApiKey)throw Error("Murf.ai API key not configured. Please add it in extension settings.");a=await g.callMurfAPI(s,i.murfApiKey,i.voiceId,i.voiceStyle)}else{let l=i.voiceId||this.ttsVoice;if(l.includes("-")&&l.split("-").length>2)l=l.split("-").slice(0,2).join("-");await this.googleTTS.synthesize(s,l),a={audioBlob:this.googleTTS.toBlob()}}g.logCommentary(this.currentVideoTitle,this.nextVideoTitle,s),this.generatedAudioData=a,u.hideLoadingIndicator()}catch(t){console.error("RJ Commentary generation failed:",t),u.hideLoadingIndicator(),u.showErrorMessage(t.message)}finally{this.isGeneratingCommentary=!1}}async playRJCommentary(){let e=this.generatedAudioData?.audioBlob;if(!e){console.error("No audio data available to play.");return}if(this.isRJPlaying){console.log("RJ already playing, skipping...");return}this.isRJPlaying=!0;let t=m.getVideoElement();try{if(!t){console.error("No video element found on the page."),this.isRJPlaying=!1;return}this.originalVolume=await p.duckVolume(t,0.1);let{audio:i,audioUrl:o}=p.createAudio(e);i.addEventListener("ended",()=>{this.restoreVolumeAndCleanup(t,o)}),i.addEventListener("error",(r)=>{console.error("Audio error:",r),this.restoreVolumeAndCleanup(t,o)}),await p.playAudio(i).catch((r)=>{console.error("Audio playback failed:",r),this.restoreVolumeAndCleanup(t,o)})}catch(i){if(console.error("Error playing RJ commentary:",i),this.isRJPlaying=!1,t)await p.restoreVolume(t,this.originalVolume)}finally{this.generatedAudioData=null}}async restoreVolumeAndCleanup(e,t){if(await p.restoreVolume(e,this.originalVolume),t)URL.revokeObjectURL(t);this.isRJPlaying=!1,console.log("RJ commentary cleanup completed")}async toggleRJMode(){if(this.isRJModeActive=!this.isRJModeActive,u.updateRJModeButton(this.isRJModeActive),this.isRJModeActive)await this.startRJMode();else this.stopRJMode()}async startRJMode(){this.getCurrentAndNextTitles(),this.setupVideoEventListeners()}stopRJMode(){if(this.isRJModeActive=!1,this.isRJPlaying=!1,this.isGeneratingCommentary=!1,this.lastProcessedVideo="",u.updateRJModeButton(!1),this.videoChangeTimeout)clearTimeout(this.videoChangeTimeout),this.videoChangeTimeout=null;clearInterval(this.progressInterval),u.hideLoadingIndicator(),console.log("RJ Mode stopped and cleaned up")}setupVideoEventListeners(){let e=()=>{console.log("checkVideoProgress called");let i=document.querySelector("video");if(!i||!this.isRJModeActive)return;let o=i.duration-i.currentTime;if(i.currentTime>10&&!this.isGeneratingCommentary&&!this.generatedAudioData)this.getCurrentAndNextTitles(),this.generateRJCommentary();if(o<=30&&!this.isRJPlaying&&!this.isGeneratingCommentary)this.playRJCommentary()},t=()=>{if(this.progressInterval)clearInterval(this.progressInterval);this.progressInterval=setInterval(e,1000)};if(this.isRJModeActive)t()}}chrome.runtime.onMessage.addListener((e,t,i)=>{if(e?.action==="generateRJCommentary"||e?.action==="playRJCommentary"){let o=window.youtubeRJ;if(!o)return i({success:!1,error:"RJ instance not available on this page"}),!1;return(e.action==="generateRJCommentary"?o.generateRJCommentary.bind(o):o.playRJCommentary.bind(o))().then(()=>i({success:!0})).catch((s)=>i({success:!1,error:s?.message||String(s)})),!0}return!1});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{let e=new C;window.youtubeRJ=e,console.log(e)});else{let e=new C;window.youtubeRJ=e,console.log(e)}

//# debugId=0D0C652819FE50B964756E2164756E21

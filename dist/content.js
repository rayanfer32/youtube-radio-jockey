var W=Object.create;var{getPrototypeOf:X,defineProperty:w,getOwnPropertyNames:J,getOwnPropertyDescriptor:_}=Object,I=Object.prototype.hasOwnProperty;function B(e){return this[e]}var Q,Z,fe=(e,t,i)=>{var n=e!=null&&typeof e==="object";if(n){var o=t?Q??=new WeakMap:Z??=new WeakMap,s=o.get(e);if(s)return s}i=e!=null?W(X(e)):{};let a=t||!e||!e.__esModule?w(i,"default",{value:e,enumerable:!0}):i;if(e&&typeof e==="object"||typeof e==="function"){for(let r of J(e))if(!I.call(a,r))w(a,r,{get:B.bind(e,r),enumerable:!0})}if(n)o.set(e,a);return a},ye=(e)=>{var t=(L??=new WeakMap).get(e),i;if(t)return t;if(t=w({},"__esModule",{value:!0}),e&&typeof e==="object"||typeof e==="function"){for(var n of J(e))if(!I.call(t,n))w(t,n,{get:B.bind(e,n),enumerable:!(i=_(e,n))||i.enumerable})}return L.set(e,t),t},L,pe=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var ee=(e)=>e;function te(e,t){this[e]=ee.bind(null,t)}var be=(e,t)=>{for(var i in t)w(e,i,{get:t[i],enumerable:!0,configurable:!0,set:te.bind(t,i)})};var we=(e,t)=>()=>(e&&(t=e(e=0)),t);var R={debug:10,info:20,warn:30,error:40},x={enabled:!0,level:"warn"},j=(e)=>{let t=e.logLevel;x={enabled:typeof e.loggingEnabled==="boolean"?e.loggingEnabled:!0,level:typeof t==="string"&&t in R?t:"warn"}};chrome.storage.sync.get(["loggingEnabled","logLevel"],j);chrome.storage.onChanged.addListener((e,t)=>{if(t!=="sync")return;if(e.loggingEnabled||e.logLevel)j({loggingEnabled:e.loggingEnabled?.newValue??x.enabled,logLevel:e.logLevel?.newValue??x.level})});var E=(e,t,...i)=>{if(!x.enabled||R[e]<R[x.level])return;if(e==="debug")console.debug(`[YouTube RJ][DEBUG] ${t}`,...i);else if(e==="info")console.info(`[YouTube RJ][INFO] ${t}`,...i);else if(e==="warn")console.warn(`[YouTube RJ][WARN] ${t}`,...i);else console.error(`[YouTube RJ][ERROR] ${t}`,...i)},ie={debug:(e,...t)=>E("debug",e,...t),info:(e,...t)=>E("info",e,...t),warn:(e,...t)=>E("warn",e,...t),error:(e,...t)=>E("error",e,...t)},c=ie;var V={geminiApiKey:"",murfApiKey:"",fishApiKey:"",openRouterApiKey:"",openRouterModel:"recursive/flint-v1.0:free",llmProvider:"openrouter",ttsProvider:"fish-audio",rjStyle:"sarcastic",commentaryLength:"short",voiceId:"ba1a38946dea44609fc4a8fe6113ed88",voiceStyle:"Promo",includeHistory:!1,includeComments:!1,autoStart:!1,volumeDucking:50,generateAfterSeconds:10,playBeforeEndSeconds:30,setupComplete:!1,loggingEnabled:!0,logLevel:"warn",hostName:"Alexis",radioStation:"97.7 Youtube FM"},F=async()=>{let e=await chrome.storage.sync.get();return{...V,...e}},D={energetic:"You are a high-energy radio DJ who's absolutely pumped about music!",chill:"You are a laid-back DJ with a smooth, relaxed vibe.",sarcastic:"You are a witty DJ who adds clever commentary with a touch of sarcasm.",professional:"You are a professional radio host with polished delivery."},U={short:"Keep it brief and punchy (20-30 seconds when spoken)",medium:"Moderate length with good flow (30-45 seconds when spoken)",long:"More detailed commentary (45-60 seconds when spoken)"};function ne(e,t,i,n,o,s,a,r,d){let u=D[i]||D.energetic,l=U[n]||U.medium,f=r||V.hostName,p=`Radio station: ${d||V.radioStation}
Host name: ${f}`,K=`${u} ${l}. ${p}.

Important guidelines:
- AVOID using special characters that are not detected by TTS in the commentary, your output will be used to generate audio.
- AVOID expressions in brackets or parentheses.
- AVOID saying Alright and Okay okay or similar phrases at the beginning. Cook up new intros.
- CREATE engaging commentary that connects with listeners. Be natural, enthusiastic, and add personality. Don't read the song titles - make it conversational and fun!
- ONLY respond with the commentary text, do not include any additional instructions or explanations.`.trim(),b=`Current song: "${e}"`;if(a)b+=`
Current song Lyrics: ${a}`;if(t)b+=`
Upcoming Song: "${t}"`;if(s)b+=`
Viewer comments: ${s}`;if(o)b+=`
Previous commentary history:
${o}`;return{systemPrompt:K,currentTask:b}}async function N(e,t){if(!t)throw Error("Gemini API key not configured");let i={contents:[{parts:[{text:e}]}]};return new Promise((n,o)=>{chrome.runtime.sendMessage({action:"callGemini",payload:i,apiKey:t},(s)=>{if(chrome.runtime.lastError)return o(Error(chrome.runtime.lastError.message));if(!s||!s.success)return o(Error(s?.error||"Failed to call Gemini API"));let a=s.data;if(!a.candidates||!a.candidates[0]||!a.candidates[0].content)return o(Error("Invalid response from Gemini API"));n(a.candidates[0].content.parts[0].text)})})}async function H(e,t){let i,n;if(typeof e==="object")i=e.systemPrompt,n=e.currentTask;else if(t!==void 0)i=e,n=t;else i=e,n=e;let o={messages:[{role:"system",content:i},{role:"user",content:n}],chatOptions:{selectedModel:"llama3.1-8B",systemPrompt:i,topK:2},attachment:null};return new Promise((s,a)=>{chrome.runtime.sendMessage({action:"callChatJimmy",payload:o},(r)=>{if(chrome.runtime.lastError)return a(Error(chrome.runtime.lastError.message));if(!r||!r.success)return a(Error(r?.error||"Failed to call ChatJimmy API"));let d=r.data,u=d.indexOf("<|stats|>"),l=d;if(u!==-1)l=d.substring(0,u);s(l.trim().replace(/^"|"$/g,"").replace(/\\n/g,`
`).trim())})})}async function oe(e,t,i="en-US-natalie",n="Promo"){if(!t)throw Error("Murf.ai API key not configured");let o={text:e,voiceId:i,style:n};return new Promise((s,a)=>{chrome.runtime.sendMessage({action:"callMurf",payload:o,apiKey:t},(r)=>{if(chrome.runtime.lastError)return a(Error(chrome.runtime.lastError.message));if(!r||!r.success)return a(Error(r?.error||"Failed to call Murf API"));let{data:d,audioBase64:u}=r,l=atob(u),f=new Uint8Array(l.length);for(let p=0;p<l.length;p++)f[p]=l.charCodeAt(p);let A=new Blob([f],{type:"audio/mpeg"});s({audioBlob:A,duration:d.audioLengthInSeconds,remainingChars:d.remainingCharacterCount})})})}async function re(e,t,i="ba1a38946dea44609fc4a8fe6113ed88"){if(!t)throw Error("Fish Audio API key not configured");return new Promise((n,o)=>{chrome.runtime.sendMessage({action:"callFishAudio",text:e,referenceId:i,apiKey:t},(s)=>{if(chrome.runtime.lastError)return o(Error(chrome.runtime.lastError.message));if(!s||!s.success)return o(Error(s?.error||"Failed to call Fish Audio API"));let a=s.audioBase64,r=atob(a),d=new Uint8Array(r.length);for(let l=0;l<r.length;l++)d[l]=r.charCodeAt(l);let u=new Blob([d],{type:"audio/mp3"});n({audioBlob:u})})})}function se(e,t,i){chrome.runtime.sendMessage({action:"logCommentary",currentSong:e,nextSong:t,script:i}).catch((n)=>c.error("Failed to save commentary log",n))}async function ae(e){return new Promise((t,i)=>{chrome.runtime.sendMessage({action:"callLyrics",query:e},(n)=>{if(chrome.runtime.lastError)return i(Error(chrome.runtime.lastError.message));if(!n||!n.success)return i(Error(n?.error||"Failed to call Lyrics API"));let o=n.data;t(o?.[0]?.plainLyrics)})})}async function z(e,t,i,n){if(!i)throw Error("OpenRouter API key not configured. Please add it in extension settings.");let o=[{role:"system",content:e},{role:"user",content:t}];return new Promise((s,a)=>{chrome.runtime.sendMessage({action:"callOpenRouter",apiKey:i,model:n||"recursive/flint-v1.0:free",messages:o},(r)=>{if(chrome.runtime.lastError)return a(Error(chrome.runtime.lastError.message));if(!r||!r.success)return a(Error(r?.error||"Failed to call OpenRouter API"));s(r.data.trim().replace(/^"|"$/g,"").replace(/\\n/g,`
`).trim())})})}async function le(e,t,i){let n=i||await F(),o=n.llmProvider||"openrouter";if(o==="openrouter")return z(e,t,n.openRouterApiKey,n.openRouterModel);else if(o==="gemini")return N(`${e}

${t}`,n.geminiApiKey);else return H(e,t)}var G={callMurfAPI:oe,callFishAudioAPI:re,callGeminiAPI:N,callChatJimmyAPI:H,callOpenRouterAPI:z,callLLM:le,callLyricsAPI:ae,logCommentary:se,getAPISettings:F,generateRJPrompt:ne};window.APIUtils=G;var h=G;var T=new WeakMap,q={createAudioContext(){try{return new(window.AudioContext||window.webkitAudioContext)}catch(e){return c.error("Audio context creation failed",e),null}},async smoothVolumeTransition(e,t,i=200){if(!e)return;let n=e.volume,o=20,s=(t-n)/o,a=i/o,r=T.get(e);if(r)r.timers.forEach(clearTimeout),r.finish();await new Promise((d)=>{let u={timers:[],finish:()=>{if(T.get(e)===u)T.delete(e);d()}};T.set(e,u);for(let l=0;l<o;l++){let f=setTimeout(()=>{let A=Math.max(0,Math.min(1,n+s*(l+1)));if(e.volume=A,l===o-1)u.finish()},a*(l+1));u.timers.push(f)}})},async duckVolume(e,t=0.3){if(!e)return 1;let i=e.volume,n=i*Math.max(0,Math.min(1,t));return await this.smoothVolumeTransition(e,n),i},async restoreVolume(e,t){if(!e||t===void 0)return;await this.smoothVolumeTransition(e,t,300)},createAudio(e){let t=URL.createObjectURL(e),i=new Audio(t);return i.addEventListener("error",(n)=>{c.error("Commentary audio element reported an error",n),URL.revokeObjectURL(t)}),{audio:i,audioUrl:t}},playAudio(e){return new Promise((t,i)=>{e.addEventListener("ended",t),e.addEventListener("error",i),e.play().catch(i)})}};window.AudioUtils=q;var y=q;var S=()=>{if(document.getElementById("rj-hardware-styles"))return;let e=document.createElement("style");e.id="rj-hardware-styles",e.textContent=`
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
  `,document.head.appendChild(e)},de=(e)=>{if(S(),document.getElementById("rj-mode-button"))return;let t=document.createElement("button");t.id="rj-mode-button",t.className="rj-hw-root rj-hw-bevel",t.style.cssText=`
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
  `,t.addEventListener("click",()=>e()),t.addEventListener("mouseenter",()=>{t.style.transform="translateY(-1px)",t.style.borderColor="#363C47"}),t.addEventListener("mouseleave",()=>{if(t.style.transform="translateY(0)",!t.dataset.active)t.style.borderColor="#272B33"}),document.body.appendChild(t)},ue=(e)=>{let t=document.getElementById("rj-mode-button");if(!t)return;let i=document.getElementById("rj-btn-label"),n=document.getElementById("rj-btn-led"),o=document.getElementById("rj-btn-ping");if(e){if(t.dataset.active="true",t.style.background="linear-gradient(180deg, #101c20 0%, #0a1316 100%)",t.style.borderColor="#00D2C4",t.style.boxShadow="0 0 16px rgba(0,210,196,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",i)i.textContent="ON AIR // ACTIVE",i.style.color="#00D2C4";if(n)n.style.background="#00D2C4",n.style.borderColor="#fff",n.style.boxShadow="0 0 8px #00D2C4";if(o)o.style.display="block"}else{if(delete t.dataset.active,t.style.background="linear-gradient(180deg, #181A1E 0%, #111215 100%)",t.style.borderColor="#272B33",t.style.boxShadow="inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.85)",i)i.textContent="START RJ MODE",i.style.color="#f8fafc";if(n)n.style.background="#475569",n.style.borderColor="#334155",n.style.boxShadow="none";if(o)o.style.display="none"}},ce=()=>{if(S(),document.getElementById("rj-loading"))return;let e=document.createElement("div");e.id="rj-loading",e.className="rj-hw-root rj-hw-bevel",e.style.cssText=`
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
  `,document.body.appendChild(e)},me=()=>{let e=document.getElementById("rj-loading");if(e)e.remove()},ge=(e)=>{S();let t=document.getElementById("rj-error-message");if(t)t.remove();let i=document.createElement("div");i.id="rj-error-message",i.className="rj-hw-root rj-hw-bevel",i.style.cssText=`
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
  `,document.body.appendChild(i),setTimeout(()=>{i.style.animation="rjSlideOutRight 0.25s ease-in forwards",setTimeout(()=>i.remove(),250)},5000)},C=()=>{let e=document.getElementById("rj-mode-notification");if(e)e.style.animation="rjSlideOutRight 0.25s ease-in forwards",setTimeout(()=>{e.remove()},250)},he=(e)=>{if(S(),document.getElementById("rj-mode-notification"))return;let t=document.createElement("div");t.id="rj-mode-notification",t.className="rj-hw-root rj-hw-bevel",t.style.cssText=`
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
  `,document.body.appendChild(t);let i=document.getElementById("enable-rj-mode");i?.addEventListener("mouseenter",()=>{i.style.background="#12e6d8",i.style.boxShadow="0 0 14px rgba(0,210,196,0.55)"}),i?.addEventListener("mouseleave",()=>{i.style.background="#00D2C4",i.style.boxShadow="0 0 10px rgba(0,210,196,0.35)"}),i?.addEventListener("click",()=>{C(),e()}),document.getElementById("dismiss-rj-prompt")?.addEventListener("click",()=>{C()}),setTimeout(()=>{C()},12000)},Y={showErrorMessage:ge,showRJModePrompt:he,createRJModeButton:de,updateRJModeButton:ue,dismissNotification:C,showLoadingIndicator:ce,hideLoadingIndicator:me};window.DomUtils=Y;var g=Y;var v=()=>window.location.hostname.includes("music.youtube.com"),O={extractVideoId(){return new URLSearchParams(window.location.search).get("v")||null},isYouTubeMusic:v,getCurrentVideoTitle(){if(v()){let t=document.querySelector(".title.style-scope.ytmusic-player-bar"),i=t?.nextElementSibling?.textContent?.trim().split(/\n/).map((u)=>u.trim()).join(" "),n=t?.textContent?.trim();if(n)return`${n} - ${i}`;let o=Array.from(document.querySelectorAll("ytmusic-responsive-list-item-renderer")),a=o.find((u)=>{let l=u.getAttribute("play-button-state");return l==="playing"||l==="paused"})?.querySelector("yt-formatted-string.title")?.textContent?.trim();if(a)return a;let r=this.extractVideoId();if(r){let l=o.find((f)=>(f.innerHTML||"").includes(r))?.querySelector("yt-formatted-string.title")?.textContent?.trim();if(l)return l}let d=document.querySelector("ytmusic-player-queue-item .song-title")?.textContent?.trim();if(d)return d;return document.querySelector(".ytp-title-link")?.textContent?.trim()||""}return document.querySelector("h1.title.style-scope.ytd-video-primary-info-renderer")?.textContent?.trim()||""},getDescription(){if(v())return"";return document?.querySelector("#description-inner")?.textContent?.trim()||""},getComments(){if(v())return[];let e=[];return document.querySelectorAll("#comment-container").forEach((t)=>{let i=t.querySelector("#expander")?.textContent?.trim()||"";e.push(i)}),e},getNextVideoTitle(){if(v())return(document.querySelectorAll('[play-button-state="playing"]')[1]?.nextSibling?.textContent||"").trim().split(/\n/).map((o)=>o.trim()).filter(Boolean).join(" | ");return document.querySelector("#playlist-items[selected]")?.nextSibling?.querySelector("#video-title")?.textContent?.trim()||""},isPlaylistPage(){return new URLSearchParams(window.location.search).has("list")},getPlaylistId(){return new URLSearchParams(window.location.search).get("list")},getVideoElement(){return document.querySelector("video")},cleanVideoTitle(e){return e.replace(/\(Official.*?\)/gi,"").replace(/\(Music Video\)/gi,"").replace(/\[Official.*?\]/gi,"").replace(/- Topic$/,"").trim()},getVideoDuration(){let e=this.getVideoElement();return e?e.duration:0},isVideoPlaying(){let e=this.getVideoElement();return e?!e.paused&&!e.ended:!1}};window.YouTubeUtils=O;var m=O;class k{audioBlob=null;async synthesize(e,t="en"){return new Promise((i,n)=>{chrome.runtime.sendMessage({action:"getTTSAudio",payload:{text:e,lang:t}},(o)=>{if(chrome.runtime.lastError)return c.error("Google TTS runtime messaging failed",chrome.runtime.lastError),n(Error(chrome.runtime.lastError.message));if(!o||!o.success)return c.error("Google TTS request failed",o?.error),n(Error(o?.error||"Failed to get TTS audio"));try{let a=o.data.map((r)=>{let d=atob(r),u=new Uint8Array(d.length);for(let l=0;l<d.length;l++)u[l]=d.charCodeAt(l);return u.buffer});this.audioBlob=new Blob(a,{type:"audio/mpeg"}),i()}catch(s){c.error("Could not decode Google TTS audio",s),n(s)}})})}toBlob(){if(!this.audioBlob)throw Error("No audio data available. Did you run synthesize() first?");return this.audioBlob}}class M{audioBlob=null;async synthesize(e,t,i="ba1a38946dea44609fc4a8fe6113ed88"){if(!t)throw Error("Fish Audio API key not configured");return new Promise((n,o)=>{chrome.runtime.sendMessage({action:"callFishAudio",text:e,referenceId:i,apiKey:t},(s)=>{if(chrome.runtime.lastError)return c.error("Fish Audio runtime messaging failed",chrome.runtime.lastError),o(Error(chrome.runtime.lastError.message));if(!s||!s.success)return c.error("Fish Audio request failed",s?.error),o(Error(s?.error||"Failed to get Fish Audio TTS"));try{let a=s.audioBase64,r=atob(a),d=new Uint8Array(r.length);for(let u=0;u<r.length;u++)d[u]=r.charCodeAt(u);this.audioBlob=new Blob([d],{type:"audio/mp3"}),n()}catch(a){c.error("Could not decode Fish Audio data",a),o(a)}})})}toBlob(){if(!this.audioBlob)throw Error("No audio data available. Did you run synthesize() first?");return this.audioBlob}}class P{isRJModeActive;currentVideoTitle;nextVideoTitle;originalVolume;isRJPlaying;audioContext;gainNode;lastProcessedVideo;isGeneratingCommentary;videoChangeTimeout;progressInterval;scriptHistory;googleTTS;fishAudioTTS;ttsVoice;generatedAudioData;status;statusMessage;generateAfterSeconds;playBeforeEndSeconds;activeAudio;activeAudioUrl;duckedVideo;duckLevel;lastAppliedVolume;volumeChangeHandler;constructor(){this.isRJModeActive=!1,this.currentVideoTitle="",this.nextVideoTitle="",this.originalVolume=1,this.isRJPlaying=!1,this.audioContext=null,this.gainNode=null,this.lastProcessedVideo="",this.isGeneratingCommentary=!1,this.videoChangeTimeout=null,this.progressInterval=null,this.scriptHistory=[],this.googleTTS=new k,this.fishAudioTTS=new M,this.ttsVoice="en",this.generatedAudioData=null,this.status="standby",this.statusMessage="RJ mode is off",this.generateAfterSeconds=10,this.playBeforeEndSeconds=30,this.activeAudio=null,this.activeAudioUrl="",this.duckedVideo=null,this.duckLevel=1,this.lastAppliedVolume=null,this.volumeChangeHandler=null,this.init()}async init(){this.setupAudioContext(),this.detectPlaylist(),g.createRJModeButton(this.toggleRJMode.bind(this));let e=await h.getAPISettings();if(this.generateAfterSeconds=e.generateAfterSeconds??10,this.playBeforeEndSeconds=e.playBeforeEndSeconds??30,chrome.storage.onChanged.addListener((t,i)=>{if(i!=="sync")return;if(t.generateAfterSeconds)this.generateAfterSeconds=t.generateAfterSeconds.newValue??10;if(t.playBeforeEndSeconds)this.playBeforeEndSeconds=t.playBeforeEndSeconds.newValue??30}),e.autoStart&&m.isPlaylistPage())await this.startRJMode(),g.updateRJModeButton(!0),c.info("RJ mode started automatically for playlist")}setupAudioContext(){if(this.audioContext=y.createAudioContext(),this.audioContext)this.gainNode=this.audioContext.createGain()}detectPlaylist(){if(m.isPlaylistPage()&&!document.getElementById("rj-mode-button"))g.showRJModePrompt(this.toggleRJMode.bind(this))}getCurrentAndNextTitles(){this.currentVideoTitle=m.cleanVideoTitle(m.getCurrentVideoTitle()),this.nextVideoTitle=m.cleanVideoTitle(m.getNextVideoTitle())}setStatus(e,t){let n=t||{standby:"RJ mode is off",waiting:"Waiting for the next track",generating:"Preparing commentary",ready:"Commentary is ready to play",playing:"RJ commentary is on air",error:"Something went wrong"}[e];if(this.status===e&&this.statusMessage===n)return;this.status=e,this.statusMessage=n,chrome.runtime.sendMessage({action:"rjStatusChanged",status:e,message:n,active:this.isRJModeActive}).catch(()=>{})}async generateRJCommentary(e=!1,t=0){if(this.isGeneratingCommentary&&t===0||this.isRJPlaying)return c.debug("Skipped commentary generation because audio work is active"),!1;let i=m.extractVideoId()||this.currentVideoTitle;if(!e&&t===0&&i===this.lastProcessedVideo)return c.debug("Skipped commentary generation for an already processed track"),!1;if(!this.currentVideoTitle||this.currentVideoTitle.trim()==="")return c.debug("Skipped commentary generation because the current track title is unavailable"),!1;this.isGeneratingCommentary=!0,this.lastProcessedVideo=i,this.setStatus("generating","Writing and preparing commentary");try{g.showLoadingIndicator();let n=null;try{n=await h.callLyricsAPI(this.currentVideoTitle)}catch(l){c.warn("Lyrics API failed or no lyrics found, proceeding with commentary & TTS generation:",l)}let o=await h.getAPISettings(),{systemPrompt:s,currentTask:a}=h.generateRJPrompt(this.currentVideoTitle,this.nextVideoTitle,o.rjStyle,o.commentaryLength,o.includeHistory?this.scriptHistory.join(`
`):"",o.includeComments?m.getComments().join(`
`):"",n,o.hostName,o.radioStation),r=await h.callLLM(s,a,o);this.scriptHistory.push(r);let d={},u=o.ttsProvider||(o.fishApiKey?"fish-audio":o.murfApiKey?"murf":"fish-audio");if(u==="fish-audio"){if(!o.fishApiKey)throw Error("Fish Audio API key not configured. Please add it in extension settings.");let l=o.voiceId||"ba1a38946dea44609fc4a8fe6113ed88";await this.fishAudioTTS.synthesize(r,o.fishApiKey,l),d={audioBlob:this.fishAudioTTS.toBlob()}}else if(u==="murf"){if(!o.murfApiKey)throw Error("Murf.ai API key not configured. Please add it in extension settings.");d=await h.callMurfAPI(r,o.murfApiKey,o.voiceId,o.voiceStyle)}else{let l=o.voiceId||this.ttsVoice;if(l.includes("-")&&l.split("-").length>2)l=l.split("-").slice(0,2).join("-");await this.googleTTS.synthesize(r,l),d={audioBlob:this.googleTTS.toBlob()}}return h.logCommentary(this.currentVideoTitle,this.nextVideoTitle,r),this.generatedAudioData=d,this.setStatus("ready","Commentary is ready to play"),c.info("Commentary audio is ready"),g.hideLoadingIndicator(),!0}catch(n){g.hideLoadingIndicator();let o=String(n?.message||n||""),s=/\b429\b|\b5\d\d\b|failed to fetch|networkerror|network request|timed? ?out|timeout|temporarily unavailable|err_(?:connection|network)/i.test(o),a=3;if(s&&t<a-1){let r=1000*Math.pow(2,t),d=t+2;return c.warn(`Commentary request failed; retrying attempt ${d}/${a} in ${r}ms`,n),this.setStatus("generating",`Temporary service issue. Retrying ${d}/${a} in ${r/1000}s`),await new Promise((u)=>setTimeout(u,r)),await this.generateRJCommentary(!0,t+1)}return c.error("Commentary generation failed",n),g.showErrorMessage(o||"Commentary generation failed"),this.setStatus("error",o||"Commentary generation failed"),this.lastProcessedVideo="",!1}finally{this.isGeneratingCommentary=!1}}async playRJCommentary(){let e=this.generatedAudioData?.audioBlob;if(!e){c.warn("Playback requested before commentary audio was ready");return}if(this.isRJPlaying)return;this.isRJPlaying=!0,this.setStatus("playing","RJ commentary is on air");let t=m.getVideoElement();try{if(!t){c.error("Could not play commentary because the YouTube video element was unavailable"),this.isRJPlaying=!1,this.setStatus("error","YouTube video player was not found");return}let i=await h.getAPISettings(),n=-(Math.max(0,Math.min(100,i.volumeDucking))/100)*24,o=Math.pow(10,n/20);this.originalVolume=await y.duckVolume(t,o),this.duckedVideo=t,this.duckLevel=o,this.lastAppliedVolume=t.volume,this.volumeChangeHandler=()=>{if(!this.isRJPlaying||this.duckedVideo!==t)return;let r=t.volume;if(this.lastAppliedVolume!==null&&Math.abs(r-this.lastAppliedVolume)<0.005){this.lastAppliedVolume=null;return}this.originalVolume=r;let d=r*this.duckLevel;if(Math.abs(r-d)>=0.005)this.lastAppliedVolume=d,t.volume=d},t.addEventListener("volumechange",this.volumeChangeHandler);let{audio:s,audioUrl:a}=y.createAudio(e);this.activeAudio=s,this.activeAudioUrl=a,s.addEventListener("ended",()=>{this.restoreVolumeAndCleanup(t,a)}),s.addEventListener("error",(r)=>{c.error("Commentary audio playback error",r),this.restoreVolumeAndCleanup(t,a)}),await y.playAudio(s).catch((r)=>{c.error("Commentary audio playback failed",r),this.restoreVolumeAndCleanup(t,a)})}catch(i){if(c.error("Could not play commentary",i),this.isRJPlaying=!1,this.releaseVolumeHold(),t)await y.restoreVolume(t,this.originalVolume)}finally{this.generatedAudioData=null}}async restoreVolumeAndCleanup(e,t){if(!this.isRJPlaying)return;if(this.isRJPlaying=!1,this.releaseVolumeHold(),await y.restoreVolume(e,this.originalVolume),t)URL.revokeObjectURL(t);this.activeAudio=null,this.activeAudioUrl="",this.setStatus(this.isRJModeActive?"waiting":"standby"),c.info("Commentary playback finished")}releaseVolumeHold(){if(this.duckedVideo&&this.volumeChangeHandler)this.duckedVideo.removeEventListener("volumechange",this.volumeChangeHandler);this.duckedVideo=null,this.volumeChangeHandler=null,this.lastAppliedVolume=null}async toggleRJMode(){if(this.isRJModeActive=!this.isRJModeActive,g.updateRJModeButton(this.isRJModeActive),this.isRJModeActive)await this.startRJMode();else this.stopRJMode()}async startRJMode(){this.isRJModeActive=!0,this.getCurrentAndNextTitles(),this.setupVideoEventListeners(),c.info("RJ mode started"),this.setStatus("waiting","Waiting for the next track")}stopRJMode(){if(this.isRJModeActive=!1,this.activeAudio){if(this.activeAudio.pause(),this.activeAudio.currentTime=0,this.activeAudioUrl)URL.revokeObjectURL(this.activeAudioUrl);this.activeAudio=null,this.activeAudioUrl="";let e=this.duckedVideo||m.getVideoElement();if(this.releaseVolumeHold(),e)y.restoreVolume(e,this.originalVolume)}if(this.isRJPlaying=!1,this.isGeneratingCommentary=!1,this.lastProcessedVideo="",g.updateRJModeButton(!1),this.videoChangeTimeout)clearTimeout(this.videoChangeTimeout),this.videoChangeTimeout=null;clearInterval(this.progressInterval),g.hideLoadingIndicator(),c.info("RJ mode stopped"),this.setStatus("standby","RJ mode is off")}setupVideoEventListeners(){let e=()=>{let i=document.querySelector("video");if(!i||!this.isRJModeActive)return;let n=i.duration-i.currentTime;if(i.currentTime>this.generateAfterSeconds&&!this.isGeneratingCommentary&&!this.generatedAudioData)this.getCurrentAndNextTitles(),this.generateRJCommentary();if(n<=this.playBeforeEndSeconds&&!this.isRJPlaying&&!this.isGeneratingCommentary)this.playRJCommentary();else if(!this.generatedAudioData&&!this.isGeneratingCommentary&&this.isRJModeActive)this.setStatus("waiting","Waiting for commentary timing window")},t=()=>{if(this.progressInterval)clearInterval(this.progressInterval);this.progressInterval=setInterval(e,1000)};if(this.isRJModeActive)t()}}chrome.runtime.onMessage.addListener((e,t,i)=>{if(["toggleRJMode","getRJStatus","testCommentary"].includes(e?.action)){let n=window.youtubeRJ;if(!n)return i({success:!1,error:"RJ instance not available on this page"}),!1;if(e.action==="getRJStatus")return i({success:!0,active:n.isRJModeActive,status:n.status,message:n.statusMessage}),!1;return(e.action==="toggleRJMode"?n.toggleRJMode().then(()=>({active:n.isRJModeActive,status:n.status,message:n.statusMessage})):(async()=>{if(n.getCurrentAndNextTitles(),!n.currentVideoTitle)n.currentVideoTitle=m.cleanVideoTitle(document.title.replace(/ - YouTube$/,""));if(await n.generateRJCommentary(!0))await n.playRJCommentary();return{active:n.isRJModeActive,status:n.status,message:n.statusMessage}})()).then((s)=>i({success:!0,...s})).catch((s)=>i({success:!1,error:s?.message||String(s)})),!0}if(e?.action==="generateRJCommentary"||e?.action==="playRJCommentary"){let n=window.youtubeRJ;if(!n)return i({success:!1,error:"RJ instance not available on this page"}),!1;return(e.action==="generateRJCommentary"?n.generateRJCommentary.bind(n):n.playRJCommentary.bind(n))().then(()=>i({success:!0})).catch((s)=>i({success:!1,error:s?.message||String(s)})),!0}return!1});if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{let e=new P;window.youtubeRJ=e});else{let e=new P;window.youtubeRJ=e}

//# debugId=956E90A5584B87AE64756E2164756E21

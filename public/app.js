const LANGUAGES=[["python","Python"],["javascript","JavaScript"],["java","Java"],["sql","SQL"],["cpp","C++"],["go","Go"],["rust","Rust"]];
const SPEECH=[["en-IN","English (India)"],["hi-IN","Hindi (India)"],["en-US","English (US)"],["en-GB","English (UK)"]];
const PRESETS=[
  {id:"humm-lite",protocol:"humm-lite",label:"HUMM Lite (offline demo)",model:"humm-lite",endpoint:"",help:"Works without a key. Matches the product-brief examples.",needsKey:false},
  {id:"anthropic",protocol:"anthropic",label:"Anthropic Claude",model:"claude-sonnet-4-6",endpoint:"https://api.anthropic.com/v1/messages",help:"Anthropic Messages API. Key stays in this tab.",needsKey:true},
  {id:"openai",protocol:"openai-compatible",label:"OpenAI",model:"gpt-4o-mini",endpoint:"https://api.openai.com/v1/chat/completions",help:"OpenAI chat completions.",needsKey:true},
  {id:"gemini",protocol:"gemini",label:"Google Gemini",model:"gemini-2.0-flash",endpoint:"",help:"Gemini generateContent.",needsKey:true},
  {id:"groq",protocol:"openai-compatible",label:"Groq",model:"llama-3.1-70b-versatile",endpoint:"https://api.groq.com/openai/v1/chat/completions",help:"Fast OpenAI-compatible host.",needsKey:true},
  {id:"openrouter",protocol:"openai-compatible",label:"OpenRouter",model:"openai/gpt-4o-mini",endpoint:"https://openrouter.ai/api/v1/chat/completions",help:"Many hosted models, one key.",needsKey:true},
  {id:"ollama",protocol:"custom",label:"Ollama (local)",model:"llama3.1",endpoint:"http://127.0.0.1:11434/v1/chat/completions",help:"Local Ollama. Key optional.",needsKey:false},
  {id:"custom",protocol:"custom",label:"Custom endpoint",model:"local-model",endpoint:"",help:"Any OpenAI chat-completions URL.",needsKey:false}
];
const EXAMPLES=[
  ["Simple function","function calculate total, takes price and quantity, return price times quantity"],
  ["Conditionals & loops","loop through the list of students, if marks greater than 90 print grade A, if marks greater than 75 print grade B, otherwise print grade C"],
  ["Database query","get all customers from Mumbai who placed orders worth more than 5000 rupees in the last 30 days, sort by highest amount first"],
  ["API endpoint","create a POST endpoint for user registration, accept name email and password, check if email already exists, if yes return error, if no hash the password and save to database and return success"],
  ["Hinglish","ek function banao jo list mein se even numbers filter kare, aur unka sum return kare"]
];
const HIST_KEY="humm.history.v1";
const EXT={python:"py",javascript:"js",java:"java",sql:"sql",cpp:"cpp",go:"go",rust:"rs"};
let rec=null,lastCode="",apiKeyMemory="",wantListen=false;
const $=id=>document.getElementById(id);
function loadHistory(){try{return JSON.parse(localStorage.getItem(HIST_KEY)||"[]")}catch{return[]}}
function saveHistory(items){localStorage.setItem(HIST_KEY,JSON.stringify(items.slice(0,40)))}
function escapeHtml(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function speechCtor(){return window.SpeechRecognition||window.webkitSpeechRecognition||null}
function setError(msg){$("error").textContent=msg||""}
function renderHistory(){
  const items=loadHistory();
  $("histCount").textContent=items.length+" local";
  $("history").innerHTML=items.length?items.map(item=>`<div class="hist"><div class="t">${escapeHtml(item.transcript)}</div><div class="meta-row"><span>${escapeHtml(item.language)} · ${escapeHtml(item.provider)}</span><span><button class="chip" data-load="${item.id}">Load</button> <button class="chip" data-del="${item.id}">Delete</button></span></div></div>`).join(""):`<div class="note">No runs yet. Generate once to save locally.</div>`;
}
function applyPreset(){
  const p=PRESETS.find(x=>x.id===$("preset").value)||PRESETS[0];
  $("model").value=p.model;$("endpoint").value=p.endpoint;
  $("help").textContent=p.help+" Keys are never written to history or localStorage.";
  $("apiKey").placeholder=p.needsKey?"API key (this tab only)":"API key optional";
}
function startSpeech(){
  const Ctor=speechCtor();
  if(!Ctor){setError("Speech recognition is not available in this browser. Type the logic instead.");return}
  setError("");rec=new Ctor();rec.lang=$("speechLang").value;rec.continuous=true;rec.interimResults=true;
  rec.onresult=ev=>{let chunk="";for(let i=ev.resultIndex;i<ev.results.length;i++){if(ev.results[i].isFinal)chunk+=ev.results[i][0].transcript}if(chunk){const cur=$("transcript").value.trim();$("transcript").value=cur?cur+" "+chunk.trim():chunk.trim()}};
  rec.onerror=ev=>{if(ev.error==="not-allowed")setError("Microphone permission denied. Allow the mic or type instead.");else if(ev.error&&ev.error!=="no-speech"&&ev.error!=="aborted")setError("Speech error: "+ev.error)};
  rec.onend=()=>{if(wantListen){try{rec.start()}catch(e){wantListen=false}}if(!wantListen){$("speakBtn").classList.remove("hidden");$("stopBtn").classList.add("hidden");$("status").textContent="Mic ready. Type is always available. · "+$("transcript").value.length+" chars"}};
  wantListen=true;rec.start();$("speakBtn").classList.add("hidden");$("stopBtn").classList.remove("hidden");
  $("status").innerHTML='<span class="live"><span class="pulse"></span> listening ('+$("speechLang").value+")</span>";
}
function stopSpeech(){wantListen=false;try{rec&&rec.stop()}catch(e){}}
function showCode(code,model,provider){
  lastCode=code||"";$("code").textContent=lastCode;$("langPill").textContent=$("language").value;
  $("modelPill").textContent=model||"humm-lite";$("modelPill").classList.remove("hidden");
  $("timePill").textContent=new Date().toLocaleTimeString();$("timePill").classList.remove("hidden");
  const items=loadHistory();
  items.unshift({id:Date.now()+"-"+Math.random().toString(16).slice(2),transcript:$("transcript").value.trim(),language:$("language").value,code:lastCode,provider:provider||"HUMM Lite",createdAt:new Date().toISOString()});
  saveHistory(items);renderHistory();
}
async function generate(){
  const transcript=$("transcript").value.trim();
  if(!transcript){setError("Speak or type the logic first.");return}
  setError("");$("genBtn").disabled=true;$("genBtn").textContent="Generating…";
  const preset=PRESETS.find(p=>p.id===$("preset").value)||PRESETS[0];
  apiKeyMemory=$("apiKey").value;const language=$("language").value;
  try{
    if(preset.protocol==="humm-lite"){
      const code=(window.HUMM_LITE&&HUMM_LITE.generateLite(transcript,language))||"";
      if(!code)throw new Error("Lite generator missing");
      showCode(code,"humm-lite",preset.label);
    }else{
      const res=await fetch("/api/speech-to-code",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({transcript,language,provider:preset.protocol,model:$("model").value,endpoint:$("endpoint").value||null,apiKey:apiKeyMemory||null})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Generation failed");
      showCode(data.code,data.model||$("model").value,preset.label);
    }
  }catch(err){
    if(window.HUMM_LITE){showCode(HUMM_LITE.generateLite(transcript,language),"humm-lite","HUMM Lite fallback");setError((err.message||"API unavailable")+" — used HUMM Lite instead.");}
    else setError(err.message||"Generation failed");
  }
  finally{$("genBtn").disabled=false;$("genBtn").textContent="Generate code"}
}
function init(){
  $("language").innerHTML=LANGUAGES.map(([id,label])=>`<option value="${id}">Output: ${label}</option>`).join("");
  $("speechLang").innerHTML=SPEECH.map(([id,label])=>`<option value="${id}">Speech: ${label}</option>`).join("");
  $("preset").innerHTML=PRESETS.map(p=>`<option value="${p.id}">${p.label}</option>`).join("");
  $("examples").innerHTML=EXAMPLES.map(([title,text])=>`<button class="chip" data-ex="${encodeURIComponent(text)}">${title}</button>`).join("");
  applyPreset();renderHistory();
  fetch("/api/health").then(r=>r.json()).then(d=>{$("health").textContent=d.ok?"API live":"ready";$("health").classList.add("ok")}).catch(()=>{$("health").textContent="on-device ready";$("health").classList.add("ok")});
  if(!speechCtor())$("status").textContent="Speech not supported here. Type the logic. Ctrl+Enter generates.";
  $("preset").onchange=applyPreset;$("speakBtn").onclick=startSpeech;$("stopBtn").onclick=stopSpeech;$("genBtn").onclick=generate;$("regenBtn").onclick=generate;
  $("clearBtn").onclick=()=>{$("transcript").value="";$("code").textContent="Generated code appears here. Review it, then paste into any editor.";lastCode="";setError("")};
  $("copyBtn").onclick=async()=>{if(!lastCode)return;await navigator.clipboard.writeText(lastCode);$("copyBtn").textContent="Copied";setTimeout(()=>$("copyBtn").textContent="Copy",1400)};
  $("dlBtn").onclick=()=>{if(!lastCode)return;const ext=EXT[$("language").value]||"txt";const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([lastCode],{type:"text/plain"}));a.download="humm."+ext;a.click()};
  $("transcript").addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="Enter"){e.preventDefault();generate()}});
  $("clearHist").onclick=()=>{saveHistory([]);renderHistory()};
  $("examples").onclick=e=>{const btn=e.target.closest("[data-ex]");if(btn)$("transcript").value=decodeURIComponent(btn.dataset.ex)};
  $("history").onclick=e=>{const load=e.target.closest("[data-load]");const del=e.target.closest("[data-del]");const items=loadHistory();if(load){const item=items.find(i=>i.id===load.dataset.load);if(item){$("transcript").value=item.transcript;$("language").value=item.language;lastCode=item.code;$("code").textContent=item.code;$("langPill").textContent=item.language}}if(del){saveHistory(items.filter(i=>i.id!==del.dataset.del));renderHistory()}};
}
init();

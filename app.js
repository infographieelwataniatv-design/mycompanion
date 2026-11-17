// Remplace cette URL après avoir déployé le Worker Cloudflare.
const API_URL = "https://mycompanion.infographie-elwataniatv.workers.dev/chat";
const $ = s => document.querySelector(s);
const defaultChars = [
 {id:"maya",name:"Maya",desc:"Créative, chaleureuse et curieuse",bio:"Tu es Maya, une amie virtuelle créative, chaleureuse et curieuse. Tu réponds naturellement en français.",color:"#7656e8"},
 {id:"adam",name:"Adam",desc:"Calme, drôle et passionné de voyages",bio:"Tu es Adam, un compagnon virtuel calme, drôle et passionné de voyages. Tu réponds naturellement en français.",color:"#247e87"}
];
let chars = JSON.parse(localStorage.getItem("mc_chars")||"null") || defaultChars;
let current = null;
let histories = JSON.parse(localStorage.getItem("mc_history")||"{}");
function save(){localStorage.setItem("mc_chars",JSON.stringify(chars));localStorage.setItem("mc_history",JSON.stringify(histories))}
function render(){
 $("#count").textContent=chars.length;
 $("#characters").innerHTML="";
 if(!chars.length){$("#characters").innerHTML='<div class="empty">Aucun personnage pour le moment.<br>Appuie sur ＋ pour en créer un.</div>';return}
 chars.forEach(c=>{let b=document.createElement("button");b.className="character";b.innerHTML=`<div class="avatar" style="background:${c.color}">✦</div><b></b><small></small>`;b.querySelector("b").textContent=c.name;b.querySelector("small").textContent=c.desc||"Personnage personnalisé";b.onclick=()=>openChat(c.id);$("#characters").append(b)})
}
function openChat(id){current=chars.find(c=>c.id===id);$("#home").hidden=true;$("#chat").hidden=false;$("#chatName").textContent=current.name;$("#chatDesc").textContent=current.desc||"Personnage IA";$("#chatAvatar").style.background=current.color;drawMessages();$("#prompt").focus()}
function drawMessages(){let box=$("#messages");box.innerHTML="";(histories[current.id]||[]).forEach(m=>addBubble(m.role,m.content));box.scrollTop=box.scrollHeight}
function addBubble(role,content){let d=document.createElement("div");d.className="bubble "+(role==="user"?"me":"ai");d.textContent=content;$("#messages").append(d);$("#messages").scrollTop=$("#messages").scrollHeight}
$("#back").onclick=()=>{$("#chat").hidden=true;$("#home").hidden=false;current=null};
$("#newChar").onclick=()=>$("#creator").showModal();
$("#creatorForm").onsubmit=e=>{e.preventDefault();let c={id:crypto.randomUUID(),name:$("#cName").value.trim(),desc:$("#cDesc").value.trim(),bio:$("#cBio").value.trim()||"Tu es un personnage sympathique. Réponds en français.",color:$("#cColor").value};chars.unshift(c);histories[c.id]=[];save();$("#creator").close();e.target.reset();render()};
$("#clearChat").onclick=()=>{if(confirm("Effacer cette conversation ?")){histories[current.id]=[];save();drawMessages()}};
$("#chatForm").onsubmit=async e=>{e.preventDefault();let text=$("#prompt").value.trim();if(!text||!current)return;$("#prompt").value="";let history=histories[current.id]||(histories[current.id]=[]);history.push({role:"user",content:text});addBubble("user",text);save();let send=$("#chatForm button");send.disabled=true;let wait=document.createElement("div");wait.className="bubble ai";wait.textContent="…";$("#messages").append(wait);
 try{
  if(API_URL.includes("TON-WORKER")) throw new Error("Configure d'abord l'adresse de ton Worker dans app.js.");
  let response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system:current.bio,messages:history.slice(-16)})});
  let data=await response.json();if(!response.ok)throw new Error(data.error||"Erreur du service IA.");
  let answer=data.reply||"Je n'ai pas reçu de réponse.";wait.remove();history.push({role:"assistant",content:answer});addBubble("assistant",answer);save();
 }catch(err){wait.textContent="Erreur : "+err.message+" — vérifie la configuration du service IA."; }finally{send.disabled=false}
};
if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js").catch(()=>{});
render();
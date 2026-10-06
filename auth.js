// DALZON BUILD — Authentification Supabase
const SUPABASE_URL = "https://gwrfnkfyelzdxdzfzexk.supabase.co";
const SUPABASE_KEY = "sb_publishable_aSwwdf7DQpX84Or466Fdhw_TP16AIiN";
const SITE_URL = "https://dalzonmbal.github.io/dalzonbuild";

const form=document.getElementById("authForm"),title=document.getElementById("title"),subtitle=document.getElementById("subtitle"),nameWrap=document.getElementById("nameWrap"),submit=document.getElementById("submit"),error=document.getElementById("error");
let mode=new URLSearchParams(location.search).get("mode")==="register"?"register":"login";

function setMode(next){
 mode=next;
 document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.mode===mode));
 const register=mode==="register";
 nameWrap.classList.toggle("hidden",!register);
 document.getElementById("name").required=register;
 title.textContent=register?"Créez votre compte.":"Bienvenue.";
 subtitle.textContent=register?"Commencez à créer vos sites professionnels.":"Connectez-vous pour gérer vos sites.";
 submit.innerHTML=register?"Créer mon compte <span>→</span>":"Se connecter <span>→</span>";
 if(!error.dataset.keep) error.textContent="";
 error.dataset.keep="";
}
document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>setMode(tab.dataset.mode)));
setMode(mode);

function showError(message){ error.textContent=message; error.dataset.keep="1"; }

async function authRequest(path,body){
 const response=await fetch(SUPABASE_URL+"/auth/v1/"+path,{
  method:"POST",
  headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY},
  body:JSON.stringify(body)
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok) throw new Error(data.msg||data.message||data.error_description||"Impossible de contacter le service de compte.");
 return data;
}

(function handleEmailConfirmation(){
 const hash=new URLSearchParams(location.hash.replace(/^#/,""));
 const accessToken=hash.get("access_token");
 const refreshToken=hash.get("refresh_token");
 const errorCode=hash.get("error_code");
 const errorDescription=hash.get("error_description");

 if(accessToken){
  localStorage.setItem("dalzon_access_token",accessToken);
  localStorage.setItem("dalzon_refresh_token",refreshToken||"");
  history.replaceState(null,"",location.pathname+location.search);
  location.href="dashboard.html";
  return;
 }

 if(errorCode||errorDescription){
  history.replaceState(null,"",location.pathname+location.search);
  setMode("login");
  showError(decodeURIComponent((errorDescription||"La confirmation de l'adresse e-mail a échoué.").replace(/\+/g," ")));
 }
})();

form.addEventListener("submit",async e=>{
 e.preventDefault();
 error.textContent="";
 error.dataset.keep="";
 submit.disabled=true;
 submit.textContent=mode==="register"?"Création...":"Connexion...";
 try{
  const email=document.getElementById("email").value.trim();
  const password=document.getElementById("password").value;
  const name=document.getElementById("name").value.trim();

  if(mode==="register"){
   const data=await authRequest("signup",{
    email,
    password,
    data:{full_name:name},
    options:{emailRedirectTo:SITE_URL+"/auth.html"}
   });

   if(data.access_token){
    localStorage.setItem("dalzon_access_token",data.access_token);
    localStorage.setItem("dalzon_refresh_token",data.refresh_token||"");
    location.href="dashboard.html";
   }else{
    setMode("login");
    showError("Compte créé. Vérifie ton adresse e-mail, puis reviens ici pour te connecter.");
   }
  }else{
   const data=await authRequest("token?grant_type=password",{email,password});
   localStorage.setItem("dalzon_access_token",data.access_token);
   localStorage.setItem("dalzon_refresh_token",data.refresh_token||"");
   location.href="dashboard.html";
  }
 }catch(err){
  let message=err.message||"Une erreur est survenue.";
  if(message.toLowerCase().includes("email not confirmed")) message="Ton adresse e-mail n'est pas encore confirmée. Clique d'abord sur le lien reçu par e-mail.";
  showError(message);
 }finally{
  submit.disabled=false;
  setMode(mode);
 }
});
const form=document.getElementById("authForm"),title=document.getElementById("title"),subtitle=document.getElementById("subtitle"),nameWrap=document.getElementById("nameWrap"),submit=document.getElementById("submit"),error=document.getElementById("error");
let mode="login";
const configured=window.DALZON_SUPABASE_URL&&!window.DALZON_SUPABASE_URL.includes("TON-PROJET")&&window.DALZON_SUPABASE_ANON_KEY&&!window.DALZON_SUPABASE_ANON_KEY.includes("TA_CLE");

document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{
  mode=tab.dataset.mode;
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===tab));
  const register=mode==="register";
  nameWrap.classList.toggle("hidden",!register);
  document.getElementById("name").required=register;
  title.textContent=register?"Créez votre compte.":"Bienvenue.";
  subtitle.textContent=register?"Commencez à créer vos sites professionnels.":"Connectez-vous pour gérer vos sites.";
  submit.innerHTML=register?"Créer mon compte <span>→</span>":"Se connecter <span>→</span>";
  error.textContent="";
}));

async function authRequest(path,body){
  const response=await fetch(window.DALZON_SUPABASE_URL+"/auth/v1/"+path,{
    method:"POST",
    headers:{"Content-Type":"application/json","apikey":window.DALZON_SUPABASE_ANON_KEY},
    body:JSON.stringify(body)
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.msg||data.message||data.error_description||"Impossible de contacter le service de compte.");
  return data;
}

form.addEventListener("submit",async e=>{
  e.preventDefault();
  error.textContent="";
  if(!configured){error.textContent="La base de données n'est pas encore configurée.";return;}
  submit.disabled=true;
  submit.textContent=mode==="register"?"Création...":"Connexion...";
  try{
    const email=document.getElementById("email").value.trim();
    const password=document.getElementById("password").value;
    const name=document.getElementById("name").value.trim();
    if(mode==="register"){
      const data=await authRequest("signup",{email,password,data:{full_name:name}});
      if(data.access_token){
        localStorage.setItem("dalzon_access_token",data.access_token);
        localStorage.setItem("dalzon_refresh_token",data.refresh_token||"");
        window.location.href="dashboard.html";
      }else{
        error.textContent="Compte créé. Vérifie ton adresse e-mail puis connecte-toi.";
        document.querySelector('[data-mode="login"]').click();
      }
    }else{
      const data=await authRequest("token?grant_type=password",{email,password});
      localStorage.setItem("dalzon_access_token",data.access_token);
      localStorage.setItem("dalzon_refresh_token",data.refresh_token||"");
      window.location.href="dashboard.html";
    }
  }catch(err){error.textContent=err.message||"Une erreur est survenue.";}
  finally{submit.disabled=false;submit.innerHTML=mode==="register"?"Créer mon compte <span>→</span>":"Se connecter <span>→</span>";}
});
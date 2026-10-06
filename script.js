const toggle=document.getElementById("themeToggle");
const saved=localStorage.getItem("dalzonbuild-theme");
if(saved==="light"){document.body.classList.add("light");toggle.textContent="☾";}
toggle.addEventListener("click",()=>{document.body.classList.toggle("light");const light=document.body.classList.contains("light");toggle.textContent=light?"☾":"☼";localStorage.setItem("dalzonbuild-theme",light?"light":"dark");});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{const id=a.getAttribute("href");if(id==="#"||!document.querySelector(id))return;e.preventDefault();document.querySelector(id).scrollIntoView({behavior:"smooth"});}));

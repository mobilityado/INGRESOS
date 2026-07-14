(() => {
const PRODUCT_VERSION="2030";
const PRODUCT_BUILD="3000.0713";
const BRANDS=["TRT","TRTVB","AAO","AAOVB"],$=id=>document.getElementById(id);
const money=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
const state={sources:{},brands:[],summary:null,charts:[],platformCharts:[],intelligenceCharts:[],directorCharts:[],commandCharts:[],forecastCharts:[],commandAlerts:[],publisher:null,oneCharts:[],presentationCharts:[],notifications:[]};
const notificationKey="recaudacion365-notifications-v15";
const loadNotifications=()=>{try{return JSON.parse(localStorage.getItem(notificationKey)||"[]")}catch{return[]}};
const saveNotifications=v=>localStorage.setItem(notificationKey,JSON.stringify(v));
function addNotification(title,detail,icon="ℹ"){
  const items=loadNotifications();
  items.unshift({id:Date.now(),title,detail,icon,time:new Date().toLocaleString("es-MX")});
  saveNotifications(items.slice(0,25));
  
const themeKey="nexus2030-theme";
function applyTheme(value){
  const mode=value==="auto"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):value;
  document.body.classList.toggle("dark",mode==="dark");
  localStorage.setItem(themeKey,value);
  if($("themeSelector"))$("themeSelector").value=value;
}
if($("themeSelector"))$("themeSelector").onchange=e=>applyTheme(e.target.value);
applyTheme(localStorage.getItem(themeKey)||"light");

renderNotifications();document.querySelectorAll(".today-card,.metric,.executive-kpis article,.director-kpis article").forEach(el=>el.classList.add("smart-hover"));
}
function renderNotifications(){
  const items=loadNotifications(),list=$("notificationList");
  if(!list)return;
  $("notificationCount").textContent=items.length;
  $("notificationCount").style.display=items.length?"grid":"none";
  list.innerHTML=items.length?items.map(n=>`<div class="notification-item"><i>${escapeHtml(n.icon)}</i><div><b>${escapeHtml(n.title)}</b><small>${escapeHtml(n.detail)} · ${escapeHtml(n.time)}</small></div></div>`).join(""):'<div class="notification-empty">No hay notificaciones.</div>';
}
function setLoadProgress(percent,text){
  const wrap=$("loadProgressWrap"); if(!wrap)return;
  wrap.classList.remove("hidden");
  $("loadProgressPct").textContent=`${percent}%`;
  $("loadProgressText").textContent=text;
  $("loadProgressBar").style.width=`${percent}%`;
  if(percent>=100)setTimeout(()=>wrap.classList.add("hidden"),700);
}

const normalizeRole=value=>{
  const role=normalize(value||"USUARIO");
  if(["ADMIN","ADMINISTRADOR","ADMINISTRATOR"].includes(role))return"ADMINISTRADOR";
  if(["GERENCIA","GERENTE","MANAGER"].includes(role))return"GERENCIA";
  if(["SUPERVISOR","SUPERVISION"].includes(role))return"SUPERVISOR";
  if(["CONSULTA","USUARIO","USER"].includes(role))return"USUARIO";
  return"USUARIO";
};
const roleLevel=role=>({USUARIO:1,SUPERVISOR:2,GERENCIA:3,ADMINISTRADOR:4}[normalizeRole(role)]||1);
const canAccess=(minimum)=>roleLevel(authSession?.user?.role)>=roleLevel(minimum);

const normalize=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/gi,"").toUpperCase();
const num=v=>{if(typeof v==="number")return Number.isFinite(v)?v:0;let s=String(v??"").trim().replace(/\$/g,"").replace(/\s/g,"").replace(/[^0-9,.-]/g,"");if(!s||s==="-")return 0;const c=s.lastIndexOf(","),d=s.lastIndexOf(".");if(c>=0&&d>=0){s=c>d?s.replace(/\./g,"").replace(",","."):s.replace(/,/g,"")}else if(c>=0){const dec=s.length-c-1;s=(dec===1||dec===2)?s.replace(/\./g,"").replace(",","."):s.replace(/,/g,"")}else if((s.match(/\./g)||[]).length>1){const p=s.split("."),last=p.pop();s=(last.length<=2?p.join("")+"."+last:p.join("")+last)}const n=Number(s);return Number.isFinite(n)?n:0};
const pct=(v,t)=>`${(v/(t||1)*100).toFixed(2)}%`;
const toast=m=>{$("toast").textContent=m;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),3000)};
const apiUrl=()=>String(window.APP_CONFIG?.API_URL||"").trim();
const sessionKey="recaudacion365-session";
let authSession=null;
async function apiRequest(action,payload={}){
  if(!apiUrl()||apiUrl().includes("PEGA_AQUI"))throw new Error("Configura la URL /exec de Google Apps Script en config.js.");
  const response=await fetch(apiUrl(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,token:authSession?.token||"",...payload})});
  if(!response.ok)throw new Error(`Error de conexión HTTP ${response.status}`);
  const json=await response.json();
  if(json.authExpired){logout(false);throw new Error("La sesión expiró. Inicia sesión nuevamente.");}
  if(json.error)throw new Error(json.message||"Ocurrió un error.");
  return json;
}
const historyKey="ingresos360-history-v9";
const getHistory=()=>{try{return JSON.parse(localStorage.getItem(historyKey)||"[]")}catch{return[]}};
const setHistory=v=>localStorage.setItem(historyKey,JSON.stringify(v));

if(localStorage.getItem("ingresos-theme")==="dark")document.body.classList.add("dark");
$("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("ingresos-theme",document.body.classList.contains("dark")?"dark":"light")};
$("printBtn").onclick=()=>window.print();
$("month").onchange=()=>state.summary&&render();
$("year").oninput=()=>state.summary&&render();

function identifyBrand(t){const n=normalize(t);if(n.includes("TRTVB"))return"TRTVB";if(n.includes("AAOVB"))return"AAOVB";if(n==="TRT"||/\bTRT\b/i.test(t))return"TRT";if(n==="AAO"||/\bAAO\b/i.test(t))return"AAO";return null}
function setMessage(msg,type=""){$("messageBox").className=`message ${type}`;$("messageBox").textContent=msg}
function setError(msg){$("statusBadge").className="status error";$("statusBadge").textContent="Revisar datos";setMessage(msg,"danger");toast(msg)}
function updateSources(){
  const count=Object.keys(state.sources).length;
  BRANDS.forEach(b=>{const c=document.querySelector(`[data-brand="${b}"]`),s=state.sources[b];c.classList.toggle("ready",!!s);c.querySelector("small").textContent=s?`${s.fileName} · ${s.sheetName}`:"Pendiente";c.querySelector("span").textContent=s?"✓":"—"});
  $("statusBadge").className=`status ${count===4?"ok":count?"warn":"neutral"}`;$("statusBadge").textContent=count===4?"4 marcas listas":`${count} de 4`;
  if(count===4){setMessage("Fuentes completas. El reporte se generó automáticamente.","success")}else setMessage(`Faltan: ${BRANDS.filter(b=>!state.sources[b]).join(", ")||"ninguna"}.`);
}
function matrixToRows(matrix){
  const wanted=[$("canjeCol").value,$("abordoCol").value,$("prepagoCol").value].map(normalize);
  const hi=matrix.findIndex(r=>wanted.every(w=>(r||[]).map(normalize).includes(w)));if(hi<0)throw new Error("No se localizaron las columnas Vta Man, Vta Abor y Vta Prepago.");
  const headers=matrix[hi].map((v,i)=>String(v??"").trim()||`Columna ${i+1}`);
  return matrix.slice(hi+1).filter(r=>(r||[]).some(v=>String(v??"").trim()!=="")).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??""])));
}
function parseRows(brand,rows,source){
  const map={};Object.keys(rows[0]||{}).forEach(h=>map[normalize(h)]=h);
  const ch=map[normalize($("canjeCol").value)],ah=map[normalize($("abordoCol").value)],ph=map[normalize($("prepagoCol").value)];
  if(!ch||!ah||!ph)throw new Error(`${brand}: columnas de ingreso no encontradas.`);
  const out={name:brand,rows,source,canje:0,abordo:0,prepago:0,count:rows.length};rows.forEach(r=>{out.canje+=num(r[ch]);out.abordo+=num(r[ah]);out.prepago+=num(r[ph])});out.total=out.canje+out.abordo+out.prepago;return out
}
function processAll(){
  try{if(BRANDS.some(b=>!state.sources[b]))return;
    state.brands=BRANDS.map(b=>parseRows(b,state.sources[b].rows,state.sources[b]));
    state.summary=state.brands.reduce((a,b)=>({canje:a.canje+b.canje,abordo:a.abordo+b.abordo,prepago:a.prepago+b.prepago,total:a.total+b.total,count:a.count+b.count}),{canje:0,abordo:0,prepago:0,total:0,count:0});
    $("saveSnapshotBtn").disabled=false;render();$("dashboard").classList.remove("hidden");toast(`Reporte generado: ${money.format(state.summary.total)}`);
  }catch(e){setError(e.message)}
}
$("loadSheetsBtn").onclick=async()=>{
  if($("oneDataSource"))$("oneDataSource").textContent="Google Sheets";
  const btn=$("loadSheetsBtn"),old=btn.innerHTML;
  try{
    btn.disabled=true;
    btn.innerHTML="<span>⏳</span><div><b>Leyendo información...</b><small>Sesión segura activa</small></div>";
    setLoadProgress(12,"Conectando con Google Sheets...");
    const result=await apiRequest("getData");
    setLoadProgress(55,"Validando las cuatro marcas...");
    const loaded={};
    BRANDS.forEach(b=>{
      const rows=result.data?.[b];
      if(!Array.isArray(rows)||!rows.length)throw new Error(`${b}: no contiene registros.`);
      loaded[b]={brand:b,fileName:"Google Sheets",sheetName:b,rows};
    });
    state.sources=loaded;setLoadProgress(78,"Calculando indicadores...");
    if($("oneDataSource"))$("oneDataSource").textContent="Google Sheets";
    updateSources();processAll();setLoadProgress(100,"Reporte actualizado");
    addNotification("Información actualizada",`Se procesaron ${Object.values(loaded).reduce((a,x)=>a+x.rows.length,0).toLocaleString("es-MX")} registros.`,"↻");
  }catch(e){setError(e.message)}
  finally{btn.disabled=false;btn.innerHTML=old}
};
$("fileInput").onchange=async e=>{try{if($("oneDataSource"))$("oneDataSource").textContent="Archivo local";state.sources={};for(const f of [...e.target.files]){const wb=XLSX.read(await f.arrayBuffer(),{type:"array",cellDates:true});wb.SheetNames.forEach(sn=>{const b=identifyBrand(sn)||identifyBrand(f.name);if(b){const m=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:"",raw:true});try{state.sources[b]={brand:b,fileName:f.name,sheetName:sn,rows:matrixToRows(m)}}catch{}}})}updateSources();processAll()}catch(err){setError(err.message)}finally{e.target.value=""}};

function render(){
  const s=state.summary,m=$("month").value,y=$("year").value,sorted=[...state.brands].sort((a,b)=>b.total-a.total),leader=sorted[0],concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]),hist=getHistory(),currentKey=`${y}-${String(["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"].indexOf(m)+1).padStart(2,"0")}`,previous=[...hist].filter(h=>h.key<currentKey).sort((a,b)=>b.key.localeCompare(a.key))[0];
  $("reportTitle").textContent=`INGRESOS GENERALES ${m} ${y}`;$("generatedAt").textContent=`Actualizado ${new Date().toLocaleString("es-MX")}`;
  $("totalKpi").textContent=money.format(s.total);$("totalRows").textContent=`${s.count.toLocaleString("es-MX")} registros`;
  const brandList=$("brandParticipationList");
  if(brandList){
    brandList.innerHTML=[...state.brands]
      .sort((a,b)=>b.total-a.total)
      .map(b=>`<div class="brand-participation-row">
        <b>${b.name}</b>
        <div class="brand-mini-track"><i style="width:${Math.max(2,b.total/(s.total||1)*100).toFixed(2)}%"></i></div>
        <small>${pct(b.total,s.total)}</small>
      </div>`).join("");
  }

  const conceptList=$("conceptCompositionList");
  if(conceptList){
    const conceptRows=[
      {name:"Prepago",value:s.prepago},
      {name:"Abordo",value:s.abordo},
      {name:"Canje",value:s.canje}
    ].sort((a,b)=>b.value-a.value);
    conceptList.innerHTML=conceptRows.map(c=>`<div class="concept-composition-row">
      <b>${c.name}</b>
      <div class="concept-mini-track"><i style="width:${Math.max(2,c.value/(s.total||1)*100).toFixed(2)}%"></i></div>
      <small>${pct(c.value,s.total)}</small>
    </div>`).join("");
  }

      if(previous){const v=(s.total-previous.total)/(previous.total||1)*100;$("variationKpi").textContent=`${v>=0?"+":""}${v.toFixed(2)}%`;$("variationDetail").textContent=`vs. ${previous.label}`}else{$("variationKpi").textContent="Sin histórico";$("variationDetail").textContent="Guarda otro mes para comparar"}
  if(previous){
    const d=(s.total-previous.total)/(previous.total||1)*100;
    $("totalDelta").className=`kpi-delta ${d>=0?"positive-delta":"negative-delta"}`;
    $("totalDelta").textContent=`${d>=0?"▲":"▼"} ${Math.abs(d).toFixed(2)}% vs. ${previous.label}`;
    $("variationTrend").className=`kpi-delta ${d>=0?"positive-delta":"negative-delta"}`;
    $("variationTrend").textContent=d>=0?"Tendencia positiva":"Tendencia negativa";
  }else{
    $("totalDelta").className="kpi-delta neutral-delta";$("totalDelta").textContent="Sin comparativo";
    $("variationTrend").className="kpi-delta neutral-delta";$("variationTrend").textContent="Sin tendencia";
  }
      
  let healthScore=65;
  if(previous){
    const growth=(s.total-previous.total)/(previous.total||1)*100;
    healthScore+=Math.max(-25,Math.min(25,growth*2));
  }
  const leaderShareValue=leader.total/(s.total||1)*100;
  const conceptShareValue=concepts[0][1]/(s.total||1)*100;
  healthScore+=leaderShareValue<45?8:leaderShareValue<60?2:-7;
  healthScore+=conceptShareValue<70?7:conceptShareValue<82?1:-6;
  healthScore=Math.max(0,Math.min(100,Math.round(healthScore)));

  if($("healthScoreKpi"))$("healthScoreKpi").textContent=`${healthScore}/100`;
  if($("healthTrafficLight")){
    $("healthTrafficLight").className=`mini-traffic ${healthScore>=80?"green":healthScore>=60?"yellow":"red"}`;
  }
  if($("healthScoreDetail"))$("healthScoreDetail").textContent=healthScore>=80?"Desempeño sólido":healthScore>=60?"Requiere seguimiento":"Atención prioritaria";
  if($("healthScoreLabel")){
    $("healthScoreLabel").className=`kpi-delta ${healthScore>=80?"positive-delta":healthScore>=60?"neutral-delta":"negative-delta"}`;
    $("healthScoreLabel").textContent=healthScore>=80?"Excelente":healthScore>=60?"Atención":"Riesgo";
  }

  [["canjeKpi",s.canje],["abordoKpi",s.abordo],["prepagoKpi",s.prepago]].forEach(([i,v])=>$(i).textContent=money.format(v));$("canjePct").textContent=pct(s.canje,s.total);$("abordoPct").textContent=pct(s.abordo,s.total);$("prepagoPct").textContent=pct(s.prepago,s.total);$("avgTicketKpi").textContent=money.format(s.total/(s.count||1));
  $("summaryBody").innerHTML=state.brands.map(b=>`<tr><td><b>${b.name}</b></td><td>${money.format(b.canje)}</td><td>${money.format(b.abordo)}</td><td>${money.format(b.prepago)}</td><td><b>${money.format(b.total)}</b></td><td>${b.count.toLocaleString("es-MX")}</td><td>${pct(b.total,s.total)}</td></tr>`).join("");
  $("summaryFoot").innerHTML=`<tr><td>GENERAL</td><td>${money.format(s.canje)}</td><td>${money.format(s.abordo)}</td><td>${money.format(s.prepago)}</td><td>${money.format(s.total)}</td><td>${s.count.toLocaleString("es-MX")}</td><td>100%</td></tr>`;
  $("ranking").innerHTML=sorted.map((b,i)=>`<div class="rank-row"><span class="rank-no">${i+1}</span><div><b>${b.name}</b><small>${pct(b.total,s.total)} de participación</small></div><strong>${money.format(b.total)}</strong></div>`).join("");
  const weakest=sorted.at(-1),ins=[`<b>${leader.name}</b> encabeza la recaudación con ${money.format(leader.total)}.`,`<b>${concepts[0][0]}</b> es el concepto dominante y representa ${pct(concepts[0][1],s.total)} del ingreso general.`,`La diferencia entre la marca líder y ${weakest.name} es de ${money.format(leader.total-weakest.total)}.`,previous?`El total ${s.total>=previous.total?"aumentó":"disminuyó"} ${Math.abs((s.total-previous.total)/(previous.total||1)*100).toFixed(2)}% frente a ${previous.label}.`:"Guarda este periodo y el siguiente para activar la comparación mensual."];
  $("insights").innerHTML=ins.map((t,i)=>`<div class="insight"><i>${["↗","◉","⇄","▥"][i]}</i><div>${t}</div></div>`).join("");
  renderBrandPanels();renderHistory();renderPlatform();requestAnimationFrame(renderCharts);
}
function renderBrandPanels(){
  $("brandPanels").innerHTML=state.brands.map(b=>`<section class="brand-panel" data-panel="${b.name}"><div class="brand-hero"><div class="brand-name"><small>REPORTE INDIVIDUAL</small><h3>${b.name}</h3><small>${pct(b.total,state.summary.total)} del consolidado</small></div><div class="brand-stat"><span>Canje</span><strong>${money.format(b.canje)}</strong><small>${pct(b.canje,b.total)}</small></div><div class="brand-stat"><span>Abordo</span><strong>${money.format(b.abordo)}</strong><small>${pct(b.abordo,b.total)}</small></div><div class="brand-stat"><span>Prepago</span><strong>${money.format(b.prepago)}</strong><small>${pct(b.prepago,b.total)}</small></div><div class="brand-stat"><span>Total</span><strong>${money.format(b.total)}</strong><small>${b.count.toLocaleString("es-MX")} registros</small></div></div><div class="brand-charts"><article class="card chart-card"><div class="card-title"><small>COMPOSICIÓN</small><h3>Ingresos por concepto</h3></div><canvas id="bar-${b.name}"></canvas></article><article class="card chart-card"><div class="card-title"><small>DISTRIBUCIÓN</small><h3>Participación interna</h3></div><canvas id="pie-${b.name}"></canvas></article></div></section>`).join("")
}
function renderHistory(){
  const h=getHistory().sort((a,b)=>a.key.localeCompare(b.key));$("historyList").innerHTML=h.length?h.slice().reverse().map(x=>`<div class="history-row"><div><b>${x.label}</b><small>${x.count.toLocaleString("es-MX")} registros</small></div><strong>${money.format(x.total)}</strong></div>`).join(""):"<p class='message'>Aún no hay periodos guardados.</p>";
  if($("activityHistory"))$("activityHistory").textContent=`${h.length} periodos guardados`;
  $("historyAdmin").innerHTML=h.length?h.slice().reverse().map(x=>`<div class="history-row"><div><b>${x.label}</b><small>${money.format(x.total)}</small></div><button data-delete="${x.key}">Eliminar</button></div>`).join(""):"<p class='message'>No hay histórico guardado.</p>";
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{setHistory(getHistory().filter(x=>x.key!==b.dataset.delete));renderHistory();renderCharts();toast("Periodo eliminado")})
}
function chartOptions(){return{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{usePointStyle:true,padding:16}},tooltip:{callbacks:{label:c=>`${c.dataset.label||c.label}: ${money.format(c.raw)}`}}},scales:{y:{beginAtZero:true,ticks:{callback:v=>money.format(v)},grid:{color:"rgba(148,163,184,.15)"}},x:{grid:{display:false}}}}}
function renderCharts(){
  state.charts.forEach(c=>c.destroy());state.charts=[];
  if($("brandChart"))state.charts.push(new Chart($("brandChart"),{type:"bar",data:{labels:BRANDS,datasets:[{label:"Canje",data:state.brands.map(b=>b.canje)},{label:"Abordo",data:state.brands.map(b=>b.abordo)},{label:"Prepago",data:state.brands.map(b=>b.prepago)}]},options:chartOptions()}));
  if($("shareChart"))state.charts.push(new Chart($("shareChart"),{type:"doughnut",data:{labels:BRANDS,datasets:[{data:state.brands.map(b=>b.total),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"67%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true}},tooltip:{callbacks:{label:c=>`${c.label}: ${money.format(c.raw)}`}}}}}));
  state.brands.forEach(b=>{const vals=[b.canje,b.abordo,b.prepago],labs=["Canje","Abordo","Prepago"];state.charts.push(new Chart($(`bar-${b.name}`),{type:"bar",data:{labels:labs,datasets:[{label:"Importe",data:vals,borderRadius:8}]},options:{...chartOptions(),plugins:{...chartOptions().plugins,legend:{display:false}}}}));state.charts.push(new Chart($(`pie-${b.name}`),{type:"doughnut",data:{labels:labs,datasets:[{data:vals,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"65%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true}},tooltip:{callbacks:{label:c=>`${c.label}: ${money.format(c.raw)}`}}}}}))});
  const hist=getHistory().sort((a,b)=>a.key.localeCompare(b.key));const hc=$("historyChart");if(hc)state.charts.push(new Chart(hc,{type:"line",data:{labels:hist.map(x=>x.label),datasets:[{label:"Total general",data:hist.map(x=>x.total),tension:.3,fill:false}]},options:chartOptions()}))
}
$("tabs").onclick=e=>{const b=e.target.closest("button");if(!b)return;document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".tab-panel,.brand-panel").forEach(p=>p.classList.toggle("active",p.dataset.panel===b.dataset.tab));setTimeout(renderCharts,40)};
$("saveSnapshotBtn").onclick=()=>{if(!state.summary)return;const months=["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"],m=$("month").value,y=Number($("year").value),key=`${y}-${String(months.indexOf(m)+1).padStart(2,"0")}`,item={key,label:`${m} ${y}`,...state.summary,brands:state.brands.map(b=>({name:b.name,total:b.total,canje:b.canje,abordo:b.abordo,prepago:b.prepago}))},h=getHistory().filter(x=>x.key!==key);h.push(item);setHistory(h);render();toast("Periodo guardado en el histórico local");addNotification("Periodo guardado",`${m} ${y} fue agregado al histórico.`,"▥")};
$("clearHistoryBtn").onclick=()=>{$("historyModal").classList.remove("hidden");renderHistory()};$("closeModalBtn").onclick=()=>$("historyModal").classList.add("hidden");$("historyModal").onclick=e=>{if(e.target===$("historyModal"))$("historyModal").classList.add("hidden")};
$("exportBtn").onclick=()=>{const wb=XLSX.utils.book_new(),s=state.summary,m=$("month").value,y=$("year").value,aoa=[[`INGRESOS GENERALES ${m} ${y}`],[],["MARCA","CANJE","ABORDO","PREPAGO","TOTAL","REGISTROS","PARTICIPACIÓN"],...state.brands.map(b=>[b.name,b.canje,b.abordo,b.prepago,b.total,b.count,b.total/(s.total||1)]),["GENERAL",s.canje,s.abordo,s.prepago,s.total,s.count,1]];XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(aoa),"GENERAL");state.brands.forEach(b=>{const sh=XLSX.utils.json_to_sheet(b.rows);XLSX.utils.book_append_sheet(wb,sh,b.name)});const hist=getHistory();if(hist.length)XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(hist.map(x=>({Periodo:x.label,Canje:x.canje,Abordo:x.abordo,Prepago:x.prepago,Total:x.total,Registros:x.count}))),"HISTORICO");XLSX.writeFile(wb,`INGRESOS_360_${m}_${y}.xlsx`)};

function animateValue(el,value,formatter=money.format.bind(money)){
  if(!el)return;const start=performance.now(),duration=650;
  const tick=now=>{const p=Math.min((now-start)/duration,1),e=1-Math.pow(1-p,3);el.textContent=formatter(value*e);if(p<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
}
function renderPlatform(){
  if(!state.summary)return;
  const s=state.summary,sorted=[...state.brands].sort((a,b)=>b.total-a.total),leader=sorted[0],hist=getHistory(),m=$("month").value,y=$("year").value;
  animateValue($("homeTotal"),s.total);$("homeTotalDetail").textContent=`${m} ${y} · ${s.count.toLocaleString("es-MX")} registros`;
  $("homeLeader").textContent=leader.name;$("homeLeaderDetail").textContent=`${pct(leader.total,s.total)} del total`;
  $("homeRows").textContent=s.count.toLocaleString("es-MX");
  if($("heroTotal"))$("heroTotal").textContent=money.format(s.total);
  if($("heroLeader"))$("heroLeader").textContent=leader.name;
  if($("heroRows"))$("heroRows").textContent=s.count.toLocaleString("es-MX");
  if($("heroUpdated"))$("heroUpdated").textContent="Ahora";
  const months=["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"],key=`${y}-${String(months.indexOf(m)+1).padStart(2,"0")}`,prev=[...hist].filter(h=>h.key<key).sort((a,b)=>b.key.localeCompare(a.key))[0];
  if(prev){const v=(s.total-prev.total)/(prev.total||1)*100;$("homeVariation").textContent=`${v>=0?"+":""}${v.toFixed(2)}%`;$("homeVariationDetail").textContent=`vs. ${prev.label}`;if($("heroVariation"))$("heroVariation").textContent=`${v>=0?"Aumento":"Disminución"} de ${Math.abs(v).toFixed(2)}% vs. ${prev.label}`}else{$("homeVariation").textContent="—";$("homeVariationDetail").textContent="Sin periodo anterior";if($("heroVariation"))$("heroVariation").textContent="Sin comparativo disponible"}
  const concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]);
  const homeInsightsEl=$("homeInsights");
  if(homeInsightsEl){
    homeInsightsEl.innerHTML=`<div class="insight"><i>↗</i><div><b>${leader.name}</b> es la marca líder con ${money.format(leader.total)}.</div></div><div class="insight"><i>◉</i><div><b>${concepts[0][0]}</b> concentra ${pct(concepts[0][1],s.total)} del ingreso.</div></div><div class="insight"><i>▥</i><div>El ticket promedio es de <b>${money.format(s.total/(s.count||1))}</b>.</div></div>`;
  }
  if($("reportCoverTitle"))$("reportCoverTitle").textContent=`Ingresos generales ${m} ${y}`;
  if($("reportCoverPeriod"))$("reportCoverPeriod").textContent=`${m} ${y}`;
  if($("reportCoverUser"))$("reportCoverUser").textContent=authSession?.user?.name||authSession?.user?.username||"Usuario";
  if($("reportCoverDate"))$("reportCoverDate").textContent=new Date().toLocaleString("es-MX");
  $("managementPreview").innerHTML=`<h3>Resumen ejecutivo · ${m} ${y}</h3><p>El ingreso general fue de <b>${money.format(s.total)}</b>, integrado por ${s.count.toLocaleString("es-MX")} registros. ${leader.name} encabezó la recaudación con ${pct(leader.total,s.total)} de participación. ${concepts[0][0]} fue el concepto principal, con ${money.format(concepts[0][1])}.</p>${prev?`<p>En comparación con ${prev.label}, el resultado ${s.total>=prev.total?"aumentó":"disminuyó"} ${Math.abs((s.total-prev.total)/(prev.total||1)*100).toFixed(2)}%.</p>`:"<p>No existe todavía un periodo previo guardado para calcular variación.</p>"}`;
  renderHomeChart();renderTotalSparkline();renderProactiveBriefing();renderIntelligence();renderDirectorPanel();renderCommandCenter();renderWorkspace();renderAIExecutive();renderForecast();renderNexusOne();populateCompareSelectors();$("historyCount").textContent=`${hist.length} periodo${hist.length===1?"":"s"} almacenado${hist.length===1?"":"s"}`;if($("historyStatusDot"))$("historyStatusDot").className=hist.length?"ok":"";
}

function getCurrentPreviousPeriod(){
  if(!state.summary)return null;
  const months=["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
  const key=`${$("year").value}-${String(months.indexOf($("month").value)+1).padStart(2,"0")}`;
  return [...getHistory()].filter(h=>h.key<key).sort((a,b)=>b.key.localeCompare(a.key))[0]||null;
}

function renderProactiveBriefing(){
  const body=$("briefingBody");
  if(!body)return;
  if(!state.summary){
    body.innerHTML='<div class="briefing-placeholder">Carga la información para recibir un análisis automático del periodo.</div>';
    return;
  }
  const s=state.summary;
  const sorted=[...state.brands].sort((a,b)=>b.total-a.total);
  const leader=sorted[0],lowest=sorted.at(-1);
  const concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]);
  const previous=getCurrentPreviousPeriod();
  const change=previous?((s.total-previous.total)/(previous.total||1)*100):null;
  const insights=[
    {icon:"🏆",title:`${leader.name} lidera`,detail:`Aporta ${pct(leader.total,s.total)} del total.`},
    {icon:"◉",title:`${concepts[0][0]} domina`,detail:`Representa ${pct(concepts[0][1],s.total)} de los ingresos.`},
    {icon:change==null?"▥":change>=0?"↗":"↘",title:change==null?"Sin comparativo":`${change>=0?"Crecimiento":"Disminución"} ${Math.abs(change).toFixed(2)}%`,detail:previous?`Frente a ${previous.label}.`:"Guarda otro periodo para comparar."},
    {icon:"◎",title:`${lowest.name} requiere seguimiento`,detail:`Tiene la menor participación: ${pct(lowest.total,s.total)}.`}
  ];
  body.innerHTML=insights.map(x=>`<div class="briefing-insight"><i>${x.icon}</i><div><b>${x.title}</b><small>${x.detail}</small></div></div>`).join("");
}

function renderIntelligence(){
  const empty=$("intelligenceEmpty"),content=$("intelligenceContent");
  if(!empty||!content)return;
  if(!state.summary){
    empty.classList.remove("hidden");content.classList.add("hidden");return;
  }
  empty.classList.add("hidden");content.classList.remove("hidden");

  const s=state.summary,brands=[...state.brands].sort((a,b)=>b.total-a.total);
  const leader=brands[0],lowest=brands.at(-1);
  const concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]);
  const previous=getCurrentPreviousPeriod();
  const brandChanges=brands.map(b=>{
    const old=(previous?.brands||[]).find(x=>x.name===b.name)?.total||0;
    return {name:b.name,current:b.total,previous:old,change:old?((b.total-old)/old*100):null};
  });
  const generalChange=previous?((s.total-previous.total)/(previous.total||1)*100):null;
  const leaderShare=leader.total/(s.total||1)*100;
  const conceptShare=concepts[0][1]/(s.total||1)*100;

  let score=65;
  if(generalChange!=null)score+=Math.max(-25,Math.min(25,generalChange*2));
  score+=leaderShare<45?8:leaderShare<60?2:-7;
  score+=conceptShare<70?7:conceptShare<82?1:-6;
  const positiveBrands=brandChanges.filter(x=>x.change!=null&&x.change>0).length;
  const negativeBrands=brandChanges.filter(x=>x.change!=null&&x.change<0).length;
  score+=positiveBrands*3-negativeBrands*4;
  score=Math.max(0,Math.min(100,Math.round(score)));

  const light=$("generalLight");
  light.className="traffic-light "+(generalChange==null?"neutral-light":generalChange>=3?"green-light":generalChange>-3?"yellow-light":"red-light");
  $("generalStatus").textContent=generalChange==null?"Sin histórico":generalChange>=3?"Excelente":generalChange>-3?"Atención":"Riesgo";
  $("generalStatusDetail").textContent=generalChange==null?"Guarda un periodo anterior para comparar.":`${generalChange>=0?"+":""}${generalChange.toFixed(2)}% frente a ${previous.label}.`;

  $("mainStrength").textContent=leader.name;
  $("mainStrengthDetail").textContent=`Lidera con ${money.format(leader.total)} (${pct(leader.total,s.total)}).`;

  const worstChange=[...brandChanges].filter(x=>x.change!=null).sort((a,b)=>a.change-b.change)[0];
  $("attentionPoint").textContent=worstChange&&worstChange.change<0?worstChange.name:lowest.name;
  $("attentionDetail").textContent=worstChange&&worstChange.change<0?`Disminuyó ${Math.abs(worstChange.change).toFixed(2)}%.`:`Menor participación: ${pct(lowest.total,s.total)}.`;

  $("concentrationStatus").textContent=concepts[0][0];
  $("concentrationDetail").textContent=`Concentra ${pct(concepts[0][1],s.total)} del ingreso.`;

  const ring=$("scoreRing"),scoreEl=$("executiveScore");
  scoreEl.textContent=score;
  scoreEl.className=score>=80?"score-excellent":score>=60?"score-attention":"score-risk";
  ring.style.background=`conic-gradient(#2f74ff 0deg,#45ddff ${score*3.6}deg,rgba(148,163,184,.16) ${score*3.6}deg)`;
  $("scoreDescription").textContent=score>=80?"Periodo sólido con señales favorables.":score>=60?"Resultado estable con áreas que conviene vigilar.":"Periodo con indicadores que requieren seguimiento.";

  const narrative=[];
  narrative.push(`<div class="narrative-block"><i>◎</i><div>El ingreso general del periodo asciende a <b>${money.format(s.total)}</b>, integrado por ${s.count.toLocaleString("es-MX")} registros.</div></div>`);
  narrative.push(`<div class="narrative-block"><i>🏆</i><div><b>${leader.name}</b> ocupa la primera posición y aporta ${pct(leader.total,s.total)} del consolidado.</div></div>`);
  narrative.push(`<div class="narrative-block"><i>◉</i><div><b>${concepts[0][0]}</b> es el concepto dominante, con ${money.format(concepts[0][1])}.</div></div>`);
  if(previous)narrative.push(`<div class="narrative-block"><i>${generalChange>=0?"↗":"↘"}</i><div>Frente a ${previous.label}, el total ${generalChange>=0?"aumentó":"disminuyó"} <b>${Math.abs(generalChange).toFixed(2)}%</b>.</div></div>`);
  else narrative.push(`<div class="narrative-block"><i>▥</i><div>No existe un periodo anterior guardado; el análisis de crecimiento se activará al guardar otro mes.</div></div>`);
  $("executiveNarrative").innerHTML=narrative.join("");

  const opportunities=[
    `${leader.name} representa la principal fuente de ingreso del periodo.`,
    `${concepts[0][0]} mantiene la mayor aportación dentro del concentrado.`,
    positiveBrands?`${positiveBrands} marca${positiveBrands===1?"":"s"} presenta${positiveBrands===1?"":"n"} crecimiento frente al periodo anterior.`:"El periodo actual sirve como nueva línea base para comparaciones."
  ];
  $("opportunityList").innerHTML=opportunities.map(x=>`<div class="intelligence-list-item"><i>✓</i><div>${x}</div></div>`).join("");

  const alerts=[];
  if(generalChange!=null&&generalChange<0)alerts.push(`El ingreso general disminuyó ${Math.abs(generalChange).toFixed(2)}%.`);
  brandChanges.filter(x=>x.change!=null&&x.change<0).forEach(x=>alerts.push(`${x.name} cayó ${Math.abs(x.change).toFixed(2)}%.`));
  if(leaderShare>60)alerts.push(`${leader.name} concentra más del 60% del ingreso general.`);
  if(conceptShare>80)alerts.push(`${concepts[0][0]} concentra más del 80% del ingreso, lo que incrementa la dependencia de un solo concepto.`);
  if(!alerts.length)alerts.push("No se detectaron alertas críticas con la información disponible.");
  $("alertList").innerHTML=alerts.map(x=>`<div class="intelligence-list-item"><i>!</i><div>${x}</div></div>`).join("");

  const brief=`NEXUS — Brief ejecutivo ${$("month").value} ${$("year").value}. El ingreso general fue de ${money.format(s.total)} con ${s.count.toLocaleString("es-MX")} registros. ${leader.name} fue la marca líder con ${pct(leader.total,s.total)} de participación. ${concepts[0][0]} representó ${pct(concepts[0][1],s.total)} del total.${previous?` En comparación con ${previous.label}, el resultado ${generalChange>=0?"aumentó":"disminuyó"} ${Math.abs(generalChange).toFixed(2)}%.`:""} Índice ejecutivo: ${score}/100.`;
  $("intelligenceBrief").textContent=brief;

  state.intelligenceCharts.forEach(c=>c.destroy());state.intelligenceCharts=[];
  const growthCanvas=$("intelligenceGrowthChart");
  if(growthCanvas){
    state.intelligenceCharts.push(new Chart(growthCanvas,{type:"bar",data:{labels:brandChanges.map(x=>x.name),datasets:[{label:"Variación %",data:brandChanges.map(x=>x.change??0),borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.raw>=0?"+":""}${Number(c.raw).toFixed(2)}%`}}},scales:{y:{ticks:{callback:v=>`${v}%`},grid:{color:"rgba(148,163,184,.15)"}},x:{grid:{display:false}}}}}));
  }
  const conceptCanvas=$("intelligenceConceptChart");
  if(conceptCanvas){
    state.intelligenceCharts.push(new Chart(conceptCanvas,{type:"doughnut",data:{labels:["Canje","Abordo","Prepago"],datasets:[{data:[s.canje,s.abordo,s.prepago],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"66%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true}},tooltip:{callbacks:{label:c=>`${c.label}: ${money.format(c.raw)} (${pct(c.raw,s.total)})`}}}}}));
  }
}


function renderTotalSparkline(){
  const el=$("totalSparkline");if(!el)return;
  const history=getHistory().sort((a,b)=>a.key.localeCompare(b.key)).slice(-8);
  const values=history.length?history.map(h=>h.total):state.summary?[state.summary.total]:[];
  if(!values.length){el.innerHTML="";return}
  const max=Math.max(...values,1),min=Math.min(...values,0),range=max-min||1;
  el.innerHTML=values.map(v=>`<i style="height:${8+((v-min)/range)*20}px"></i>`).join("");
}
function calculateDirectorScore(){
  if(!state.summary)return 0;
  const s=state.summary,previous=getCurrentPreviousPeriod(),leader=[...state.brands].sort((a,b)=>b.total-a.total)[0];
  const concepts=[s.canje,s.abordo,s.prepago].sort((a,b)=>b-a);
  let score=68;
  if(previous){const g=(s.total-previous.total)/(previous.total||1)*100;score+=Math.max(-25,Math.min(25,g*2))}
  const leaderShare=leader.total/(s.total||1)*100;
  const conceptShare=concepts[0]/(s.total||1)*100;
  score+=leaderShare<50?7:leaderShare<65?1:-6;
  score+=conceptShare<75?7:conceptShare<85?0:-7;
  return Math.max(0,Math.min(100,Math.round(score)));
}


function renderWorkspace(){
  if($("workspaceGreeting"))$("workspaceGreeting").textContent=`${getDayGreeting()}, ${authSession?.user?.name||authSession?.user?.username||"Usuario"}`;
  if($("workspaceRole"))$("workspaceRole").textContent=normalizeRole(authSession?.user?.role);
  if($("workspacePeriod"))$("workspacePeriod").textContent=`${$("month").value} ${$("year").value}`;

  document.querySelectorAll("[data-workspace-go]").forEach(btn=>{
    const min=btn.dataset.minRole;
    btn.classList.toggle("restricted-role",!!min&&!canAccess(min));
  });

  const recent=loadNotifications().slice(0,4);
  if($("workspaceRecent"))$("workspaceRecent").innerHTML=recent.length?recent.map(n=>`<div class="workspace-recent-row"><i>${n.icon}</i><div><b>${escapeHtml(n.title)}</b><small>${escapeHtml(n.detail)} · ${escapeHtml(n.time)}</small></div></div>`).join(""):'<div class="command-empty">No hay actividad reciente.</div>';

  if(!state.summary){
    if($("workspaceTotal"))$("workspaceTotal").textContent="$0.00";
    if($("workspaceLeader"))$("workspaceLeader").textContent="—";
    if($("workspaceHealth"))$("workspaceHealth").textContent="—";
    if($("workspaceAlerts"))$("workspaceAlerts").textContent="0";
    return;
  }
  const s=state.summary,leader=[...state.brands].sort((a,b)=>b.total-a.total)[0],score=calculateDirectorScore(),alerts=getCommandAlerts().filter(a=>a.icon!=="✓").length;
  $("workspaceTotal").textContent=money.format(s.total);
  $("workspaceLeader").textContent=leader.name;
  $("workspaceHealth").textContent=`${score}/100`;
  $("workspaceAlerts").textContent=alerts;
}

function getCommandAlerts(){
  if(!state.summary)return[];
  const s=state.summary,alerts=[],previous=getCurrentPreviousPeriod(),sorted=[...state.brands].sort((a,b)=>b.total-a.total);
  const leader=sorted[0],lowest=sorted.at(-1);
  const concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]);
  if(previous){
    const change=(s.total-previous.total)/(previous.total||1)*100;
    if(change<0)alerts.push({icon:"↘",text:`El ingreso general disminuyó ${Math.abs(change).toFixed(2)}% frente a ${previous.label}.`});
    state.brands.forEach(b=>{
      const old=(previous.brands||[]).find(x=>x.name===b.name)?.total||0;
      if(old){
        const c=(b.total-old)/old*100;
        if(c<-3)alerts.push({icon:"!",text:`${b.name} presenta una caída de ${Math.abs(c).toFixed(2)}%.`});
      }
    });
  }
  if(leader.total/(s.total||1)>.6)alerts.push({icon:"◎",text:`${leader.name} concentra más del 60% del ingreso general.`});
  if(concepts[0][1]/(s.total||1)>.8)alerts.push({icon:"◉",text:`${concepts[0][0]} concentra más del 80% de los ingresos.`});
  if(!alerts.length)alerts.push({icon:"✓",text:"No se detectaron alertas críticas en el periodo actual."});
  return alerts;
}
function renderCommandCenter(){
  const s=state.summary;
  const dataState=$("commandDataState"),dataDot=$("commandDataDot");
  const hist=getHistory().sort((a,b)=>a.key.localeCompare(b.key));
  if($("commandHistoryState"))$("commandHistoryState").textContent=hist.length?`${hist.length} periodos`:"Sin histórico";
  if($("commandHistoryDot"))$("commandHistoryDot").className=hist.length?"ok":"";
  if(!s){
    if(dataState)dataState.textContent="Sin actualizar";
    if(dataDot)dataDot.className="";
    return;
  }

  const sorted=[...state.brands].sort((a,b)=>b.total-a.total),leader=sorted[0];
  const previous=getCurrentPreviousPeriod(),change=previous?((s.total-previous.total)/(previous.total||1)*100):null;
  const score=calculateDirectorScore();
  const alerts=getCommandAlerts();
  state.commandAlerts=alerts;

  $("commandTotal").textContent=money.format(s.total);
  $("commandTotalDetail").textContent=`${s.count.toLocaleString("es-MX")} registros`;
  $("commandTrend").textContent=change==null?"—":`${change>=0?"+":""}${change.toFixed(2)}%`;
  $("commandTrendDetail").textContent=previous?`vs. ${previous.label}`:"Sin periodo anterior";
  $("commandLeader").textContent=leader.name;
  $("commandLeaderDetail").textContent=`${pct(leader.total,s.total)} del total`;
  $("commandHealth").textContent=`${score}/100`;
  $("commandHealthDetail").textContent=score>=80?"Excelente":score>=60?"Atención":"Riesgo";
  $("commandHealthLight").className=`command-health-light ${score>=80?"green":score>=60?"yellow":"red"}`;
  $("commandAlerts").textContent=alerts.filter(a=>a.icon!=="✓").length;
  $("commandAlertsDetail").textContent=alerts[0]?.text||"Sin alertas";
  $("commandUpdated").textContent="Ahora";
  $("commandUpdatedDetail").textContent=new Date().toLocaleString("es-MX");
  $("commandPeriodLabel").textContent=`${$("month").value} ${$("year").value}`;
  if(dataState)dataState.textContent="Actualizados";
  if(dataDot)dataDot.className="ok";

  const values=hist.slice(-8).map(h=>h.total);
  if(!values.length)values.push(s.total);
  const max=Math.max(...values,1),min=Math.min(...values,0),range=max-min||1;
  $("commandSparkline").innerHTML=values.map(v=>`<i style="height:${8+((v-min)/range)*22}px"></i>`).join("");

  $("commandAlertList").innerHTML=alerts.map(a=>`<div class="command-alert-item"><i>${a.icon}</i><div>${a.text}</div></div>`).join("");

  const conceptRows=[{name:"Prepago",value:s.prepago},{name:"Abordo",value:s.abordo},{name:"Canje",value:s.canje}].sort((a,b)=>b.value-a.value);
  $("commandConceptBars").innerHTML=conceptRows.map(c=>`<div class="command-concept-row"><b>${c.name}</b><div class="command-concept-track"><i style="width:${(c.value/(s.total||1)*100).toFixed(2)}%"></i></div><small>${pct(c.value,s.total)}</small></div>`).join("");

  const notifications=loadNotifications().slice(0,5);
  $("commandActivityList").innerHTML=notifications.length?notifications.map(n=>`<div class="command-activity-row"><i>${n.icon}</i><div><b>${escapeHtml(n.title)}</b><small>${escapeHtml(n.detail)} · ${escapeHtml(n.time)}</small></div></div>`).join(""):'<div class="command-empty">No hay actividad reciente.</div>';

  let recommendation="";
  if(change!=null&&change<0)recommendation=`Prioriza el análisis de las marcas con caída y revisa las causas de la disminución general de ${Math.abs(change).toFixed(2)}%.`;
  else if(leader.total/(s.total||1)>.6)recommendation=`Conviene reducir la dependencia de ${leader.name}, que concentra ${pct(leader.total,s.total)} del total.`;
  else if(score>=80)recommendation="El periodo presenta un desempeño sólido. Mantén las acciones actuales y documenta las mejores prácticas.";
  else recommendation="El desempeño es estable, pero conviene monitorear las marcas con menor participación y el concepto dominante.";
  $("commandRecommendation").textContent=recommendation;

  state.commandCharts.forEach(c=>c.destroy());state.commandCharts=[];
  const canvas=$("commandBrandChart");
  if(canvas){
    state.commandCharts.push(new Chart(canvas,{type:"bar",data:{labels:sorted.map(b=>b.name),datasets:[{label:"Ingreso total",data:sorted.map(b=>b.total),borderRadius:9}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>money.format(c.raw)}}},scales:{y:{ticks:{callback:v=>money.format(v)},grid:{color:"rgba(148,163,184,.14)"}},x:{grid:{display:false}}}}}));
  }
}

function renderDirectorPanel(){
  const empty=$("directorEmpty"),content=$("directorContent");
  if(!empty||!content)return;
  if(!state.summary){empty.classList.remove("hidden");content.classList.add("hidden");return}
  empty.classList.add("hidden");content.classList.remove("hidden");

  const s=state.summary,sorted=[...state.brands].sort((a,b)=>b.total-a.total),leader=sorted[0];
  const previous=getCurrentPreviousPeriod(),variation=previous?((s.total-previous.total)/(previous.total||1)*100):null;
  const score=calculateDirectorScore();
  const period=`${$("month").value} ${$("year").value}`;

  $("directorPeriod").textContent=period;
  $("directorGenerated").textContent=`Actualizado ${new Date().toLocaleString("es-MX")}`;
  $("directorTotal").textContent=money.format(s.total);
  $("directorTotalDetail").textContent=`${s.count.toLocaleString("es-MX")} registros procesados`;
  $("directorVariation").textContent=variation==null?"—":`${variation>=0?"+":""}${variation.toFixed(2)}%`;
  $("directorVariationDetail").textContent=previous?`Frente a ${previous.label}`:"Sin periodo anterior";
  $("directorLeader").textContent=leader.name;
  $("directorLeaderDetail").textContent=`${pct(leader.total,s.total)} del total`;
  $("directorScore").textContent=`${score}/100`;
  $("directorScoreDetail").textContent=score>=80?"Excelente":score>=60?"Atención":"Riesgo";

  $("directorRanking").innerHTML=sorted.map((b,i)=>`<div class="director-rank-row"><span>${i+1}</span><div><b>${b.name}</b><small>${pct(b.total,s.total)} de participación</small></div><strong>${money.format(b.total)}</strong></div>`).join("");

  const concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]);
  const recs=[];
  if(variation==null)recs.push("Guardar el periodo actual para habilitar la comparación mensual.");
  else if(variation<0)recs.push(`Revisar las causas de la disminución general de ${Math.abs(variation).toFixed(2)}%.`);
  else recs.push(`Mantener las acciones que impulsaron el crecimiento de ${variation.toFixed(2)}%.`);
  if(leader.total/(s.total||1)>.6)recs.push(`Reducir la dependencia de ${leader.name}, que concentra más del 60% del ingreso.`);
  recs.push(`Dar seguimiento a ${sorted.at(-1).name}, la marca con menor participación.`);
  if(concepts[0][1]/(s.total||1)>.8)recs.push(`Diversificar la composición: ${concepts[0][0]} representa más del 80% del total.`);
  else recs.push(`La composición por concepto se mantiene dentro de un rango controlado.`);
  $("directorRecommendations").innerHTML=recs.map((r,i)=>`<div class="director-rec"><i>${["◎","⚠","↗","◉"][i%4]}</i><div>${r}</div></div>`).join("");

  const summary=`NEXUS — Resumen de Dirección ${period}. El ingreso general fue de ${money.format(s.total)} con ${s.count.toLocaleString("es-MX")} registros. ${leader.name} lideró con ${pct(leader.total,s.total)} de participación. ${concepts[0][0]} fue el concepto principal con ${pct(concepts[0][1],s.total)} del total.${variation==null?" No existe un periodo previo guardado para comparar.":` Frente a ${previous.label}, el resultado ${variation>=0?"aumentó":"disminuyó"} ${Math.abs(variation).toFixed(2)}%.`} El índice NEXUS fue ${score}/100.`;
  $("directorSummary").textContent=summary;

  state.directorCharts.forEach(c=>c.destroy());state.directorCharts=[];
  const history=getHistory().sort((a,b)=>a.key.localeCompare(b.key)).filter(h=>String(h.key).startsWith(String($("year").value)));
  const annualCanvas=$("directorAnnualChart");
  if(annualCanvas){
    state.directorCharts.push(new Chart(annualCanvas,{type:"line",data:{labels:history.map(h=>h.label),datasets:[{label:"Ingreso general",data:history.map(h=>h.total),tension:.35,fill:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>money.format(c.raw)}}},scales:{y:{ticks:{callback:v=>money.format(v)},grid:{color:"rgba(148,163,184,.14)"}},x:{grid:{display:false}}}}}));
  }
  const portfolioCanvas=$("directorPortfolioChart");
  if(portfolioCanvas){
    state.directorCharts.push(new Chart(portfolioCanvas,{type:"doughnut",data:{labels:sorted.map(b=>b.name),datasets:[{data:sorted.map(b=>b.total),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"66%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true}},tooltip:{callbacks:{label:c=>`${c.label}: ${money.format(c.raw)}`}}}}}));
  }
}

function renderHomeChart(){
  state.platformCharts.forEach(c=>c.destroy());state.platformCharts=[];
  if(!state.summary)return;
  const canvas=$("homeChart");if(canvas)state.platformCharts.push(new Chart(canvas,{type:"bar",data:{labels:state.brands.map(b=>b.name),datasets:[{label:"Ingreso total",data:state.brands.map(b=>b.total),borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>money.format(c.raw)}}},scales:{y:{ticks:{callback:v=>money.format(v)},grid:{color:"rgba(148,163,184,.15)"}},x:{grid:{display:false}}}}}))
}
const pageTitles={one:"NEXUS ONE",workspace:"Workspace · NEXUS 2030",forecast:"Pronóstico y Metas",ai:"NEXUS AI Executive",command:"Command Center · NEXUS 2030",inicio:"Centro ejecutivo",ingresos:"Ingresos 360",direccion:"Dirección General",inteligencia:"Centro de Inteligencia",comparativos:"Comparativos",reportes:"Reportes ejecutivos",usuarios:"Usuarios y accesos",publisher:"Data Publisher",configuracion:"Configuración"};
function openView(name){
  if(name==="usuarios"&&!canAccess("ADMINISTRADOR")){toast("Tu rol no permite administrar usuarios.");return}
  if(name==="forecast"&&!canAccess("SUPERVISOR")){toast("Tu rol no permite acceder a Pronóstico y Metas.");return}
  if(name==="publisher"&&!canAccess("GERENCIA")){toast("Data Publisher está reservado para Gerencia y Administración.");return}
  if(name==="configuracion"&&!canAccess("GERENCIA")){toast("Tu rol no permite acceder a configuración.");return}
  if(name==="direccion"&&!canAccess("GERENCIA")){toast("Este panel está reservado para Gerencia y Administración.");return}
  if(["inteligencia","comparativos"].includes(name)&&!canAccess("SUPERVISOR")){toast("Tu rol no permite acceder a este módulo.");return}
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.dataset.viewPanel===name));
  document.querySelectorAll(".side-nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  $("pageTitle").textContent=pageTitles[name]||"NEXUS";$("sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});
  if(name==="forecast")renderForecast();if(name==="ai")renderAIExecutive();if(name==="publisher")loadPublisherAudit();if(name==="workspace")renderWorkspace();if(name==="command")renderCommandCenter();if(name==="direccion")renderDirectorPanel();if(name==="inteligencia")renderIntelligence();if(name==="comparativos")populateCompareSelectors();if(name==="usuarios")loadAdminUsers();if(name==="configuracion")$('oneRefreshBtn').onclick=()=>$('loadSheetsBtn').click();$('oneReportBtn').onclick=()=>openView('reportes');$('oneOpenAI').onclick=()=>openView('ai');document.querySelectorAll('[data-one-go]').forEach(b=>b.onclick=()=>openView(b.dataset.oneGo));$('oneSearchInput').oninput=e=>{const q=e.target.value.trim();if(!q){$('oneSearchResults').classList.add('hidden');return}fillOneResults('oneSearchResults',q);$('oneSearchResults').classList.remove('hidden')};document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('onePalette').classList.remove('hidden');$('onePaletteInput').value='';fillOneResults('onePaletteResults','');setTimeout(()=>$('onePaletteInput').focus(),20)}if(e.key==='Escape')$('onePalette')?.classList.add('hidden')});$('onePalette').onclick=e=>{if(e.target===$('onePalette'))$('onePalette').classList.add('hidden')};$('onePaletteInput').oninput=e=>fillOneResults('onePaletteResults',e.target.value);
renderSettings();
}
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>openView(b.dataset.view));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>openView(b.dataset.go));
$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");
$("homeLoadBtn").onclick=()=>$("loadSheetsBtn").click();
if($("settingsThemeBtn"))$("settingsThemeBtn").onclick=()=>$("themeBtn").click();
$("openHistoryAdminBtn").onclick=()=>$("clearHistoryBtn").click();
$("headerPeriod").textContent=`${$("month").value} ${$("year").value}`;
$("month").addEventListener("change",()=>$("headerPeriod").textContent=`${$("month").value} ${$("year").value}`);
$("year").addEventListener("input",()=>$("headerPeriod").textContent=`${$("month").value} ${$("year").value}`);

function populateCompareSelectors(){
  const h=getHistory().sort((a,b)=>a.key.localeCompare(b.key)),html=h.map(x=>`<option value="${x.key}">${x.label}</option>`).join("");
  $("compareA").innerHTML=html;$("compareB").innerHTML=html;
  if(h.length>=2){$("compareA").value=h[h.length-2].key;$("compareB").value=h[h.length-1].key;$("compareEmpty").classList.add("hidden")}else{$("compareEmpty").classList.remove("hidden");$("compareResults").classList.add("hidden")}
}
$("runCompareBtn").onclick=()=>{
  const h=getHistory(),a=h.find(x=>x.key===$("compareA").value),b=h.find(x=>x.key===$("compareB").value);if(!a||!b||a.key===b.key){toast("Selecciona dos periodos diferentes");return}
  const variation=(b.total-a.total)/(a.total||1)*100,brands=BRANDS.map(n=>({name:n,a:(a.brands||[]).find(x=>x.name===n)?.total||0,b:(b.brands||[]).find(x=>x.name===n)?.total||0}));
  $("compareKpis").innerHTML=`<article><span>Periodo base</span><strong>${money.format(a.total)}</strong><small>${a.label}</small></article><article><span>Periodo comparado</span><strong>${money.format(b.total)}</strong><small>${b.label}</small></article><article><span>Diferencia</span><strong class="${variation>=0?"positive":"negative"}">${money.format(b.total-a.total)}</strong><small>Importe absoluto</small></article><article><span>Variación</span><strong class="${variation>=0?"positive":"negative"}">${variation>=0?"+":""}${variation.toFixed(2)}%</strong><small>Contra periodo base</small></article>`;
  $("compareInsights").innerHTML=`<div class="insight"><i>${variation>=0?"↗":"↘"}</i><div>El ingreso general ${variation>=0?"aumentó":"disminuyó"} <b>${Math.abs(variation).toFixed(2)}%</b> de ${a.label} a ${b.label}.</div></div>`+brands.map(x=>{const v=(x.b-x.a)/(x.a||1)*100;return`<div class="insight"><i>•</i><div><b>${x.name}</b>: ${x.b>=x.a?"creció":"disminuyó"} ${Math.abs(v).toFixed(2)}% (${money.format(x.b-x.a)}).</div></div>`}).join("");
  state.platformCharts.filter(c=>c.canvas?.id?.startsWith("compare")).forEach(c=>c.destroy());
  state.platformCharts.push(new Chart($("compareBrandChart"),{type:"bar",data:{labels:BRANDS,datasets:[{label:a.label,data:brands.map(x=>x.a)},{label:b.label,data:brands.map(x=>x.b)}]},options:chartOptions()}));
  state.platformCharts.push(new Chart($("compareConceptChart"),{type:"bar",data:{labels:["Canje","Abordo","Prepago"],datasets:[{label:a.label,data:[a.canje,a.abordo,a.prepago]},{label:b.label,data:[b.canje,b.abordo,b.prepago]}]},options:chartOptions()}));
  $("compareResults").classList.remove("hidden");
};
function renderApps(){
  const apps=window.APP_CONFIG?.APPS||[];
  const grid=document.getElementById("appsGrid");
  if(grid) grid.innerHTML="";
}
function renderSettings(){$("sheetIdPreview").textContent=apiUrl()&&!apiUrl().includes("PEGA_AQUI")?"API segura configurada":"API pendiente de configurar";$("historyCount").textContent=`${getHistory().length} periodos almacenados`}
$("reportPrintBtn").onclick=()=>{if(!state.summary){toast("Primero carga la información");return}openView("ingresos");setTimeout(()=>window.print(),250)};
$("reportExcelBtn").onclick=()=>{if(!state.summary){toast("Primero carga la información");return}$("exportBtn").click()};
$("copySummaryBtn").onclick=async()=>{if(!state.summary){toast("Primero carga la información");return}const text=$("managementPreview").innerText;try{await navigator.clipboard.writeText(text);toast("Resumen copiado")}catch{toast("No fue posible copiar automáticamente")}};
$("refreshBriefingBtn").onclick=()=>{
  if(state.summary){renderProactiveBriefing();toast("Briefing actualizado")}else $("loadSheetsBtn").click();
};
document.querySelectorAll("[data-workspace-go]").forEach(btn=>btn.onclick=()=>openView(btn.dataset.workspaceGo));
$("workspaceRefreshBtn").onclick=()=>$("loadSheetsBtn").click();
$("commandRefreshBtn").onclick=()=>$("loadSheetsBtn").click();
$("commandReportBtn").onclick=()=>{openView("reportes");setTimeout(()=>$("reportPrintBtn")?.focus(),150)};
$("commandOpenIntelligenceBtn").onclick=()=>openView("inteligencia");
$("clearCommandAlertsBtn").onclick=()=>{$("commandAlertList").innerHTML='<div class="command-empty">Alertas ocultadas temporalmente.</div>';toast("Alertas ocultadas")};
$("copyDirectorSummaryBtn").onclick=async()=>{
  const text=$("directorSummary")?.innerText||"";
  if(!text){toast("Primero actualiza la información");return}
  try{await navigator.clipboard.writeText(text);toast("Resumen de Dirección copiado")}catch{toast("No fue posible copiar automáticamente")}
};
$("copyIntelligenceBriefBtn").onclick=async()=>{
  const text=$("intelligenceBrief")?.innerText||"";
  if(!text){toast("Primero actualiza la información");return}
  try{await navigator.clipboard.writeText(text);toast("Brief ejecutivo copiado")}catch{toast("No fue posible copiar automáticamente")}
};
$("exportHistoryBtn").onclick=()=>{const blob=new Blob([JSON.stringify(getHistory(),null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Ingresos360_Historico.json";a.click();URL.revokeObjectURL(url)};

function setUserInterface(user){
  const role=normalizeRole(user.role);
  user.role=role;
  $("userName").textContent=user.name||user.username;
  $("userRole").textContent=role;
  $("userInitial").textContent=String(user.name||user.username||"U").trim().charAt(0).toUpperCase();
  $("dropUserName").textContent=user.name||user.username;
  $("dropUserId").textContent=`Usuario: ${user.username}`;
  if($("welcomeUserName"))$("welcomeUserName").textContent=user.name||user.username;
  if($("profileName"))$("profileName").textContent=user.name||user.username;
  if($("profileUsername"))$("profileUsername").textContent=`Usuario: ${user.username}`;
  if($("profileRole")){$("profileRole").textContent=role;$("profileRole").className=`state-pill active role-${role.toLowerCase()}`;}
  if($("profileInitial"))$("profileInitial").textContent=String(user.name||user.username||"U").trim().charAt(0).toUpperCase();
  if($("headerRoleBadge")){$("headerRoleBadge").textContent=role;$("headerRoleBadge").className=`header-role-badge role-${role.toLowerCase()}`;}
  if($("briefingGreeting"))$("briefingGreeting").textContent=`Hola, ${user.name||user.username}`;
  if($("profilePermissions")){
    const permissions={
      ADMINISTRADOR:"Acceso total: usuarios, configuración, históricos, reportes y análisis.",
      GERENCIA:"Acceso ejecutivo: reportes, históricos, comparativos y Centro de Inteligencia.",
      SUPERVISOR:"Acceso operativo: ingresos, históricos y análisis del periodo.",
      USUARIO:"Acceso de consulta: indicadores, gráficas y reportes autorizados."
    };
    $("profilePermissions").innerHTML=`<b>Permisos del rol ${role}</b><br>${permissions[role]}`;
  }

  const isAdmin=role==="ADMINISTRADOR";
  document.querySelectorAll(".admin-only,.admin-nav").forEach(el=>el.classList.toggle("hidden-role",!isAdmin));

  // Role-based navigation.
  document.querySelectorAll('[data-view="forecast"]').forEach(el=>el.classList.toggle("restricted-role",roleLevel(role)<2));
  document.querySelectorAll('[data-view="publisher"]').forEach(el=>el.classList.toggle("restricted-role",roleLevel(role)<3));
  document.querySelectorAll('[data-view="configuracion"]').forEach(el=>el.classList.toggle("restricted-role",roleLevel(role)<3));
  document.querySelectorAll('[data-view="direccion"]').forEach(el=>el.classList.toggle("restricted-role",roleLevel(role)<3));
  document.querySelectorAll("[data-min-role]").forEach(el=>el.classList.toggle("restricted-role",!canAccess(el.dataset.minRole)));
  document.querySelectorAll('[data-view="comparativos"]').forEach(el=>el.classList.toggle("restricted-role",roleLevel(role)<2));
  document.querySelectorAll('[data-view="inteligencia"]').forEach(el=>el.classList.toggle("restricted-role",roleLevel(role)<2));

  updateEnterpriseHeader();
  if(!isAdmin && document.querySelector('[data-view-panel="usuarios"]')?.classList.contains("active"))openView("inicio");
  if(roleLevel(role)<2 && ["inteligencia","comparativos"].some(v=>document.querySelector(`[data-view-panel="${v}"]`)?.classList.contains("active")))openView("inicio");
}
function showApp(){
  $("loginScreen").classList.add("hidden");
  $("appLayout").classList.remove("hidden");
  setUserInterface(authSession.user);
  setTimeout(()=>autoLoadGoogleSheets(),350);
  const overlay=$("startupOverlay");
  if(overlay){
    $("startupUserName").textContent=authSession.user.name||authSession.user.username;
    overlay.classList.remove("hidden","fade-out");
    setTimeout(()=>overlay.classList.add("fade-out"),1700);
    setTimeout(()=>overlay.classList.add("hidden"),2250);
  }
}
function showLogin(){
  $("loginScreen").classList.remove("hidden");
  $("appLayout").classList.add("hidden");
  $("loginPassword").value="";
}

async function loadLoginUsers(){
  const select=$("loginUser"),refresh=$("refreshUsersBtn");
  try{
    select.disabled=true;
    refresh.disabled=true;
    select.innerHTML='<option value="">Cargando usuarios...</option>';
    const result=await apiRequest("listUsers");
    const users=Array.isArray(result.users)?result.users:[];
    if(!users.length){
      select.innerHTML='<option value="">No hay usuarios disponibles</option>';
      return;
    }
    select.innerHTML='<option value="">Selecciona tu usuario</option>'+
      users.map(u=>`<option value="${escapeAttr(u.username)}">${escapeHtml(u.name||u.username)}</option>`).join("");
  }catch(err){
    select.innerHTML='<option value="">No se pudo cargar la lista</option>';
    const error=$("loginError");
    error.textContent=err.message;
    error.classList.remove("hidden");
  }finally{
    select.disabled=false;
    refresh.disabled=false;
  }
}
function escapeHtml(value){
  return String(value??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function escapeAttr(value){
  return escapeHtml(value).replace(/`/g,"&#096;");
}
$("refreshUsersBtn").onclick=()=>loadLoginUsers();


async function loadAdminUsers(){
  const body=$("usersAdminBody"),msg=$("usersAdminMessage");
  if(!body)return;
  try{
    msg.className="message";msg.textContent="Cargando usuarios...";
    const result=await apiRequest("getUsers");
    const users=Array.isArray(result.users)?result.users:[];
    body.innerHTML=users.map(u=>`
      <tr>
        <td><b>${escapeHtml(u.name)}</b></td>
        <td>${escapeHtml(u.username)}</td>
        <td>
          <select class="role-select" data-role-user="${escapeAttr(u.username)}">
            ${["USUARIO","SUPERVISOR","GERENCIA","ADMINISTRADOR"].map(r=>`<option value="${r}" ${r===u.role?"selected":""}>${r}</option>`).join("")}
          </select>
        </td>
        <td><span class="state-pill ${u.active?"active":"inactive"}">${u.active?"ACTIVO":"INACTIVO"}</span></td>
        <td>${u.lastAccess?escapeHtml(u.lastAccess):"Sin registro"}</td>
        <td>
          <button class="user-action edit" data-save-role="${escapeAttr(u.username)}">Guardar rol</button>
          <button class="user-action reset" data-reset-user="${escapeAttr(u.username)}" data-reset-name="${escapeAttr(u.name)}">Contraseña</button>
          <button class="user-action ${u.active?"disable":"toggle"}" data-toggle-user="${escapeAttr(u.username)}" data-next-active="${u.active?"false":"true"}">${u.active?"Desactivar":"Activar"}</button>
        </td>
      </tr>`).join("");
    msg.className="message success";msg.textContent=`${users.length} usuarios registrados.`;
    bindUserAdminActions();
  }catch(err){
    msg.className="message danger";msg.textContent=err.message;
  }
}
function bindUserAdminActions(){
  document.querySelectorAll("[data-save-role]").forEach(btn=>btn.onclick=async()=>{
    const username=btn.dataset.saveRole;
    const role=document.querySelector(`[data-role-user="${CSS.escape(username)}"]`).value;
    try{await apiRequest("updateUser",{username,role});toast("Rol actualizado");loadAdminUsers()}catch(e){toast(e.message)}
  });
  document.querySelectorAll("[data-toggle-user]").forEach(btn=>btn.onclick=async()=>{
    try{await apiRequest("updateUser",{username:btn.dataset.toggleUser,active:btn.dataset.nextActive==="true"});toast("Estado actualizado");loadAdminUsers();loadLoginUsers()}catch(e){toast(e.message)}
  });
  document.querySelectorAll("[data-reset-user]").forEach(btn=>btn.onclick=()=>{
    $("resetUsername").value=btn.dataset.resetUser;
    $("resetUserLabel").textContent=`Usuario: ${btn.dataset.resetName} (${btn.dataset.resetUser})`;
    $("resetNewPassword").value="";
    $("resetPasswordModal").classList.remove("hidden");
  });
}
$("createUserForm").onsubmit=async e=>{
  e.preventDefault();
  try{
    await apiRequest("createUser",{
      name:$("newUserName").value.trim(),
      username:$("newUsername").value.trim(),
      password:$("newUserPassword").value,
      role:$("newUserRole").value
    });
    e.target.reset();toast("Usuario creado correctamente");loadAdminUsers();loadLoginUsers();
  }catch(err){toast(err.message)}
};
$("reloadUsersBtn").onclick=()=>loadAdminUsers();
$("resetPasswordForm").onsubmit=async e=>{
  e.preventDefault();
  try{
    await apiRequest("resetPassword",{username:$("resetUsername").value,password:$("resetNewPassword").value});
    $("resetPasswordModal").classList.add("hidden");toast("Contraseña actualizada");
  }catch(err){toast(err.message)}
};
$("closeResetModalBtn").onclick=()=>$("resetPasswordModal").classList.add("hidden");
$("resetPasswordModal").onclick=e=>{if(e.target===$("resetPasswordModal"))$("resetPasswordModal").classList.add("hidden")};


function getDayGreeting(){
  const h=new Date().getHours();
  return h<12?"Buenos días":h<19?"Buenas tardes":"Buenas noches";
}
function updateEnterpriseHeader(){
  const now=new Date();
  if($("enterpriseClock"))$("enterpriseClock").textContent=now.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});
  if($("enterpriseDate"))$("enterpriseDate").textContent=now.toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  if($("enterpriseGreeting"))$("enterpriseGreeting").textContent=`${getDayGreeting()}, ${authSession?.user?.name||authSession?.user?.username||"Usuario"}`;
  if($("enterpriseRoleSummary")){
    const role=normalizeRole(authSession?.user?.role);
    const summaries={
      ADMINISTRADOR:"Acceso total habilitado. Todos los módulos están disponibles.",
      GERENCIA:"Panel ejecutivo y Dirección General disponibles.",
      SUPERVISOR:"Monitoreo operativo e inteligencia habilitados.",
      USUARIO:"Consulta de indicadores y reportes habilitada."
    };
    $("enterpriseRoleSummary").textContent=summaries[role]||summaries.USUARIO;
  }
}
setInterval(updateEnterpriseHeader,30000);


let nexusAutoLoadStarted=false;
async function autoLoadGoogleSheets(){
  if(nexusAutoLoadStarted||state.summary)return;
  nexusAutoLoadStarted=true;
  const status=$("autoLoadStatus"),text=$("autoLoadStatusText"),button=$("loadSheetsBtn");
  if(status){status.classList.remove("hidden","success","error");}
  if(text)text.textContent="Sincronizando Google Sheets...";
  if($("oneDataSource"))$("oneDataSource").textContent="Google Sheets";
  try{
    if(!button)throw new Error("No se encontró el control de actualización.");
    button.click();

    // Wait for the existing loader to finish or for a timeout.
    const started=Date.now();
    await new Promise((resolve,reject)=>{
      const timer=setInterval(()=>{
        if(state.summary){
          clearInterval(timer);
          resolve();
        }else if(Date.now()-started>30000){
          clearInterval(timer);
          reject(new Error("La consulta tardó demasiado."));
        }
      },250);
    });

    if(status)status.classList.add("success");
    if(text)text.textContent="Información actualizada desde Google Sheets";
    setTimeout(()=>status?.classList.add("hidden"),2400);
  }catch(error){
    nexusAutoLoadStarted=false;
    if(status)status.classList.add("error");
    if(text)text.textContent="No se pudo cargar automáticamente. Puedes intentarlo manualmente.";
    console.error("NEXUS autoload:",error);
  }
}

async function restoreSession(){
  try{
    const saved=JSON.parse(sessionStorage.getItem(sessionKey)||"null");
    if(!saved?.token){showLogin();return}
    authSession=saved;
    const check=await apiRequest("validate");
    authSession.user=check.user;
    sessionStorage.setItem(sessionKey,JSON.stringify(authSession));
    showApp();openView("one");
  }catch(e){
    sessionStorage.removeItem(sessionKey);authSession=null;showLogin();
  }
}
$("loginForm").onsubmit=async e=>{
  e.preventDefault();
  const btn=$("loginBtn"),error=$("loginError");
  error.classList.add("hidden");
  try{
    btn.disabled=true;btn.querySelector("span").textContent="Validando credenciales...";
    const result=await apiRequest("login",{username:$("loginUser").value.trim(),password:$("loginPassword").value});
    authSession={token:result.token,user:result.user};
    sessionStorage.setItem(sessionKey,JSON.stringify(authSession));
    showApp();openView("one");toast(`Bienvenido, ${result.user.name}`);addNotification("Inicio de sesión",`Bienvenido, ${result.user.name}.`,"✓");
  }catch(err){
    error.textContent=err.message;error.classList.remove("hidden");
  }finally{
    btn.disabled=false;btn.querySelector("span").textContent="Ingresar a la plataforma";
  }
};
function logout(notify=true){
  const token=authSession?.token||"";
  authSession=null;sessionStorage.removeItem(sessionKey);
  if(token&&apiUrl()&&!apiUrl().includes("PEGA_AQUI"))fetch(apiUrl(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action:"logout",token})}).catch(()=>{});
  showLogin();if(notify)toast("Sesión cerrada");
}
$("logoutBtn").onclick=()=>logout();
$("userMenuBtn").onclick=()=>$("userDropdown").classList.toggle("hidden");
document.addEventListener("click",e=>{if(!e.target.closest(".user-menu"))$("userDropdown").classList.add("hidden")});
$("togglePassword").onclick=()=>{const p=$("loginPassword"),show=p.type==="password";p.type=show?"text":"password";$("togglePassword").textContent=show?"Ocultar":"Ver"};


function answerCopilot(question){
  const q=String(question||"").trim();
  if(!q)return;
  const box=$("copilotMessages");
  box.insertAdjacentHTML("beforeend",`<div class="copilot-message user">${escapeHtml(q)}</div>`);
  let answer="";
  if(!state.summary){
    answer="Primero actualiza la información para que pueda analizar los ingresos.";
  }else{
    const s=state.summary,sorted=[...state.brands].sort((a,b)=>b.total-a.total),leader=sorted[0],lowest=sorted.at(-1);
    const concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]);
    const nq=normalize(q);
    if(nq.includes("MARCA")&&nq.includes("LIDER")) answer=`${leader.name} es la marca líder con ${money.format(leader.total)}, equivalente a ${pct(leader.total,s.total)} del ingreso general.`;
    else if(nq.includes("CONCEPTO")||nq.includes("GENERA MAS")) answer=`${concepts[0][0]} es el concepto principal con ${money.format(concepts[0][1])}, que representa ${pct(concepts[0][1],s.total)} del total.`;
    else if(nq.includes("TRT")||nq.includes("AAO")){
      const b=state.brands.find(x=>nq.includes(x.name));
      answer=b?`${b.name} registró ${money.format(b.total)}: Canje ${money.format(b.canje)}, Abordo ${money.format(b.abordo)} y Prepago ${money.format(b.prepago)}.`:"No pude identificar la marca solicitada.";
    }else if(nq.includes("COMPAR")&&nq.includes("MARCA")){
      answer=sorted.map((b,i)=>`${i+1}. ${b.name}: ${money.format(b.total)} (${pct(b.total,s.total)})`).join(" · ");
    }else if(nq.includes("PORCENTAJE")&&nq.includes("PREPAGO")){
      answer=`Prepago representa ${pct(s.prepago,s.total)} del ingreso general, equivalente a ${money.format(s.prepago)}.`;
    }else if(nq.includes("RESUMEN")||nq.includes("PASO")||nq.includes("PERIODO")){
      answer=`El ingreso general es ${money.format(s.total)} con ${s.count.toLocaleString("es-MX")} registros. ${leader.name} lidera la recaudación y ${concepts[0][0]} es el concepto dominante. La marca con menor participación es ${lowest.name}.`;
    }else if(nq.includes("TOTAL")||nq.includes("INGRESO")){
      answer=`El ingreso general del periodo es ${money.format(s.total)}.`;
    }else{
      answer=`Puedo responder sobre el total general, la marca líder, cada marca, el concepto principal y el resumen ejecutivo.`;
    }
  }
  box.insertAdjacentHTML("beforeend",`<div class="copilot-message answer">${escapeHtml(answer)}</div>`);
  box.scrollTop=box.scrollHeight;
}
$("copilotForm").onsubmit=e=>{e.preventDefault();answerCopilot($("copilotInput").value);$("copilotInput").value=""};
document.querySelectorAll("[data-question]").forEach(btn=>btn.onclick=()=>answerCopilot(btn.dataset.question));

$("profileBtn").onclick=()=>{
  $("userDropdown").classList.add("hidden");
  $("profileModal").classList.remove("hidden");
};
$("closeProfileModalBtn").onclick=()=>$("profileModal").classList.add("hidden");
$("profileModal").onclick=e=>{if(e.target===$("profileModal"))$("profileModal").classList.add("hidden")};
$("selfPasswordForm").onsubmit=async e=>{
  e.preventDefault();
  try{
    await apiRequest("changeOwnPassword",{currentPassword:$("selfCurrentPassword").value,newPassword:$("selfNewPassword").value});
    e.target.reset();$("profileModal").classList.add("hidden");toast("Tu contraseña fue actualizada");
  }catch(err){toast(err.message)}
};






const goalsKey="nexus2030-goals";
const getGoals=()=>{try{return JSON.parse(localStorage.getItem(goalsKey)||"{}")}catch{return{}}};

const oneCommands=[{label:"Inicio",desc:"Resumen ejecutivo",view:"one",keys:"inicio resumen"},{label:"Analytics",desc:"Ingresos y marcas",view:"ingresos",keys:"trt trtvb aao aaovb ingresos"},{label:"NEXUS AI",desc:"Preguntas y recomendaciones",view:"ai",keys:"ia resumen alertas"},{label:"Reportes",desc:"PDF y Excel",view:"reportes",keys:"reporte pdf excel"},{label:"Publisher",desc:"Publicar periodo",view:"publisher",role:"GERENCIA",keys:"publicar cargar excel"},{label:"Configuración",desc:"Tema y respaldos",view:"configuracion",role:"GERENCIA",keys:"configuracion respaldo"},{label:"Usuarios",desc:"Roles y accesos",view:"usuarios",role:"ADMINISTRADOR",keys:"usuarios roles"}];
function oneMatches(q){q=normalize(q);return oneCommands.filter(c=>(!c.role||canAccess(c.role))&&(!q||normalize(c.label+' '+c.desc+' '+c.keys).includes(q)))}
function fillOneResults(id,q){const t=$(id),rows=oneMatches(q);t.innerHTML=rows.length?rows.map(c=>`<div class="${id==='onePaletteResults'?'one-palette-item':'one-search-item'}" data-one-result="${c.view}"><div><b>${c.label}</b><small>${c.desc}</small></div><span>→</span></div>`).join(''):'<div class="one-empty">Sin resultados.</div>';t.querySelectorAll('[data-one-result]').forEach(e=>e.onclick=()=>{openView(e.dataset.oneResult);$('onePalette')?.classList.add('hidden');$('oneSearchResults')?.classList.add('hidden')})}

function renderOneBriefing(){
  if(!$("oneBriefingBody"))return;
  $("oneBriefingTitle").textContent=`${getDayGreeting()}, ${authSession?.user?.name||authSession?.user?.username||"Usuario"}`;
  const hist=getHistory();
  if($("oneHistoryState"))$("oneHistoryState").textContent=hist.length?`${hist.length} periodos`:"Sin histórico";
  if($("oneHistoryDot"))$("oneHistoryDot").className=hist.length?"ok":"";
  if($("onePublisherState"))$("onePublisherState").textContent=canAccess("GERENCIA")?"Disponible":"Solo consulta";
  if($("onePublisherDot"))$("onePublisherDot").className=canAccess("GERENCIA")?"ok":"";
  if(!state.summary){
    $("oneBriefingBody").innerHTML='<div class="one-empty">Actualiza los datos para generar el briefing.</div>';
    return;
  }
  const s=state.summary,brands=[...state.brands].sort((a,b)=>b.total-a.total),leader=brands[0],lowest=brands.at(-1);
  const concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]);
  const previous=getCurrentPreviousPeriod();
  const change=previous?((s.total-previous.total)/(previous.total||1)*100):null;
  const cards=[
    {icon:"🏆",title:`${leader.name} lidera`,detail:`${pct(leader.total,s.total)} del total general.`},
    {icon:"◉",title:`${concepts[0][0]} domina`,detail:`${pct(concepts[0][1],s.total)} de participación.`},
    {icon:change==null?"▥":change>=0?"↗":"↘",title:change==null?"Sin comparativo":`${change>=0?"Aumento":"Disminución"} ${Math.abs(change).toFixed(2)}%`,detail:previous?`Frente a ${previous.label}.`:"Guarda otro periodo."},
    {icon:"◎",title:`${lowest.name} en seguimiento`,detail:`Menor participación: ${pct(lowest.total,s.total)}.`}
  ];
  $("oneBriefingBody").innerHTML=cards.map(c=>`<div class="one-briefing-card"><i>${c.icon}</i><b>${c.title}</b><small>${c.detail}</small></div>`).join("");
}


function renderSignatureOverview(){
  if(!$("signaturePeriod"))return;
  $("signaturePeriod").textContent=`${$("month").value} ${$("year").value}`;
  if(!state.summary){
    $("signaturePerformance").textContent="—";
    $("signatureGrowth").textContent="—";
    $("signatureFocus").textContent="—";
    return;
  }
  const s=state.summary,brands=[...state.brands].sort((a,b)=>b.total-a.total),leader=brands[0];
  const previous=getCurrentPreviousPeriod(),change=previous?((s.total-previous.total)/(previous.total||1)*100):null;
  const score=calculateDirectorScore();
  $("signaturePerformance").textContent=`${score}/100`;
  $("signaturePerformanceDetail").textContent=score>=80?"Excelente":score>=60?"Atención":"Riesgo";
  $("signatureGrowth").textContent=change==null?"—":`${change>=0?"+":""}${change.toFixed(2)}%`;
  $("signatureGrowthDetail").textContent=previous?`Frente a ${previous.label}`:"Sin periodo anterior";
  $("signatureFocus").textContent=leader.name;
  $("signatureFocusDetail").textContent=`${pct(leader.total,s.total)} de participación`;
}
function renderPresentation(){
  if(!state.summary)return;
  const s=state.summary,brands=[...state.brands].sort((a,b)=>b.total-a.total),leader=brands[0];
  const previous=getCurrentPreviousPeriod(),change=previous?((s.total-previous.total)/(previous.total||1)*100):null;
  const score=calculateDirectorScore(),alerts=getCommandAlerts().filter(a=>a.icon!=="✓");
  $("presentationPeriod").textContent=`${$("month").value} ${$("year").value}`;
  $("presentationTotal").textContent=money.format(s.total);
  $("presentationTrend").textContent=change==null?"Sin comparativo":`${change>=0?"▲":"▼"} ${Math.abs(change).toFixed(2)}% vs. ${previous.label}`;
  $("presentationLeader").textContent=leader.name;
  $("presentationLeaderShare").textContent=`${pct(leader.total,s.total)} del total`;
  $("presentationHealth").textContent=`${score}/100`;
  $("presentationHealthDetail").textContent=score>=80?"Excelente":score>=60?"Atención":"Riesgo";
  $("presentationAlerts").textContent=alerts.length;
  $("presentationAlertsDetail").textContent=alerts[0]?.text||"Sin alertas críticas";
  const concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]);
  $("presentationInsights").innerHTML=[
    `${leader.name} lidera con ${pct(leader.total,s.total)}.`,
    `${concepts[0][0]} representa ${pct(concepts[0][1],s.total)}.`,
    change==null?"Guarda otro periodo para comparar.":`El total ${change>=0?"aumentó":"disminuyó"} ${Math.abs(change).toFixed(2)}%.`
  ].map((x,i)=>`<div class="one-insight"><i>${["🏆","◉",change>=0?"↗":"↘"][i]}</i><div>${x}</div></div>`).join("");
  state.presentationCharts?.forEach(c=>c.destroy());state.presentationCharts=[];
  const canvas=$("presentationChart");
  if(canvas){
    state.presentationCharts.push(new Chart(canvas,{type:"bar",data:{labels:brands.map(b=>b.name),datasets:[{label:"Ingreso",data:brands.map(b=>b.total),borderRadius:11}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>money.format(c.raw)}}},scales:{y:{ticks:{color:"#b9d3ea",callback:v=>money.format(v)},grid:{color:"rgba(255,255,255,.08)"}},x:{ticks:{color:"#b9d3ea"},grid:{display:false}}}}}));
  }
}

function renderNexusOne(){renderSignatureOverview();renderOneBriefing();if(!$('oneGreetingName'))return;$('oneGreetingLabel').textContent=getDayGreeting();$('oneGreetingName').textContent=authSession?.user?.name||authSession?.user?.username||'Usuario';$('onePeriodBadge').textContent=`${$('month').value} ${$('year').value}`;const n=loadNotifications().slice(0,5);$('oneActivity').innerHTML=n.length?n.map(x=>`<div class="one-activity-row"><i>${x.icon}</i><div><b>${escapeHtml(x.title)}</b><small>${escapeHtml(x.detail)} · ${escapeHtml(x.time)}</small></div></div>`).join(''):'<div class="one-empty">Sin actividad reciente.</div>';document.querySelectorAll('[data-one-go]').forEach(b=>b.classList.toggle('restricted-role',!!b.dataset.minRole&&!canAccess(b.dataset.minRole)));if(!state.summary)return;const s=state.summary,bs=[...state.brands].sort((a,b)=>b.total-a.total),lead=bs[0],cs=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]),prev=getCurrentPreviousPeriod(),chg=prev?((s.total-prev.total)/(prev.total||1)*100):null,alerts=getCommandAlerts().filter(a=>a.icon!=="✓"),score=calculateDirectorScore();$('oneTotal').textContent=money.format(s.total);$('oneTotalTrend').textContent=chg==null?'Sin comparativo':`${chg>=0?'▲':'▼'} ${Math.abs(chg).toFixed(2)}% vs. ${prev.label}`;$('oneLeader').textContent=lead.name;$('oneLeaderShare').textContent=`${pct(lead.total,s.total)} del total`;$('oneConcept').textContent=cs[0][0];$('oneConceptShare').textContent=`${pct(cs[0][1],s.total)} del total`;$('oneAlerts').textContent=alerts.length;$('oneAlertsDetail').textContent=alerts.length?alerts[0].text:'Sin alertas críticas';$('oneHealthScore').textContent=`${score}/100`;$('oneHealthMessage').textContent=score>=80?'Excelente':score>=60?'Atención':'Riesgo';$('oneHealthRing').style.background=`conic-gradient(#79f5e9 0deg,#46dbff ${score*3.6}deg,rgba(255,255,255,.12) ${score*3.6}deg)`;$('oneInsights').innerHTML=[`🏆|${lead.name} lidera con ${pct(lead.total,s.total)}.`,`◉|${cs[0][0]} representa ${pct(cs[0][1],s.total)}.`,`${chg==null?'▥':chg>=0?'↗':'↘'}|${chg==null?'Guarda otro periodo para comparar.':`El total ${chg>=0?'aumentó':'disminuyó'} ${Math.abs(chg).toFixed(2)}%.`}`].map(x=>{const [i,t]=x.split('|');return `<div class="one-insight"><i>${i}</i><div>${t}</div></div>`}).join('');state.oneCharts?.forEach(c=>c.destroy());state.oneCharts=[];if($('oneBrandChart'))state.oneCharts.push(new Chart($('oneBrandChart'),{type:'bar',data:{labels:bs.map(b=>b.name),datasets:[{data:bs.map(b=>b.total),borderRadius:10}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>money.format(c.raw)}}},scales:{y:{ticks:{callback:v=>money.format(v)},grid:{color:'rgba(148,163,184,.14)'}},x:{grid:{display:false}}}}}))}

function forecastData(){
  const h=getHistory().sort((a,b)=>a.key.localeCompare(b.key));
  if(h.length<2)return null;
  const values=h.map(x=>Number(x.total)||0);
  const changes=[];
  for(let i=1;i<values.length;i++)if(values[i-1])changes.push((values[i]-values[i-1])/values[i-1]);
  const avg=changes.reduce((a,b)=>a+b,0)/(changes.length||1);
  const recent=changes.slice(-3);
  const weighted=recent.length?recent.reduce((a,b,i)=>a+b*(i+1),0)/recent.reduce((a,b,i)=>a+i+1,0):avg;
  const rate=(avg+weighted)/2;
  const next=values.at(-1)*(1+rate);
  const volatility=Math.sqrt(changes.reduce((a,c)=>a+Math.pow(c-avg,2),0)/(changes.length||1));
  const confidence=Math.max(45,Math.min(95,Math.round(90-volatility*180)));
  return {history:h,values,changes,avg,rate,next,low:next*(1-Math.max(.03,volatility)),high:next*(1+Math.max(.03,volatility)),confidence};
}
function renderForecast(){
  const empty=$("forecastEmpty"),content=$("forecastContent"),f=forecastData();
  if(!empty||!content)return;
  if(!f){empty.classList.remove("hidden");content.classList.add("hidden");$("forecastConfidence").textContent="—";return}
  empty.classList.add("hidden");content.classList.remove("hidden");
  $("forecastConfidence").textContent=`${f.confidence}%`;
  $("forecastConfidenceDetail").textContent=`Basado en ${f.history.length} periodos`;
  $("forecastNext").textContent=money.format(f.next);
  $("forecastNextDetail").textContent="Estimación del siguiente periodo";
  $("forecastTrend").textContent=`${f.rate>=0?"+":""}${(f.rate*100).toFixed(2)}%`;
  $("forecastBest").textContent=money.format(f.high);
  $("forecastLow").textContent=money.format(f.low);
  $("forecastExplanation").innerHTML=[
    `La tendencia promedio histórica es de ${(f.avg*100).toFixed(2)}%.`,
    `La proyección pondera con mayor importancia los tres periodos más recientes.`,
    `El rango estimado está entre ${money.format(f.low)} y ${money.format(f.high)}.`,
    `La confianza calculada es ${f.confidence}% y aumenta al guardar más periodos.`
  ].map(x=>`<div class="insight"><i>⌁</i><div>${x}</div></div>`).join("");

  state.forecastCharts.forEach(c=>c.destroy());state.forecastCharts=[];
  const canvas=$("forecastChart");
  if(canvas){
    state.forecastCharts.push(new Chart(canvas,{type:"line",data:{labels:[...f.history.map(h=>h.label),"PRONÓSTICO"],datasets:[{label:"Ingreso",data:[...f.values,f.next],tension:.35,fill:true}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>money.format(c.raw)}}},scales:{y:{ticks:{callback:v=>money.format(v)},grid:{color:"rgba(148,163,184,.14)"}},x:{grid:{display:false}}}}}));
  }
  renderGoals();
}
function renderGoals(){
  if(!$("goalRows"))return;
  const goals=getGoals();
  $("goalRows").innerHTML=BRANDS.map(name=>{
    const brand=state.brands.find(b=>b.name===name),current=brand?.total||0,target=Number(goals[name]||0),pctGoal=target?Math.min(150,current/target*100):0;
    return `<div class="goal-row"><b>${name}</b><input type="number" min="0" step="0.01" data-goal-brand="${name}" value="${target||""}" placeholder="Meta"><div class="goal-progress"><i style="width:${Math.min(100,pctGoal)}%"></i></div><span>${target?pctGoal.toFixed(1)+"%":"Sin meta"}</span></div>`;
  }).join("");
}
$("saveGoalsBtn").onclick=()=>{
  const goals={};document.querySelectorAll("[data-goal-brand]").forEach(i=>goals[i.dataset.goalBrand]=Number(i.value)||0);
  localStorage.setItem(goalsKey,JSON.stringify(goals));renderGoals();toast("Metas guardadas");
};

function getAIContext(){
  if(!state.summary)return null;
  const s=state.summary,brands=[...state.brands].sort((a,b)=>b.total-a.total),leader=brands[0],lowest=brands.at(-1);
  const concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]);
  const previous=getCurrentPreviousPeriod();
  const change=previous?((s.total-previous.total)/(previous.total||1)*100):null;
  const brandChanges=brands.map(b=>{
    const old=(previous?.brands||[]).find(x=>x.name===b.name)?.total||0;
    return {name:b.name,current:b.total,previous:old,change:old?((b.total-old)/old*100):null};
  });
  return {s,brands,leader,lowest,concepts,previous,change,brandChanges,score:calculateDirectorScore(),alerts:getCommandAlerts()};
}
function buildAIRecommendations(ctx){
  const recs=[];
  if(ctx.change!=null&&ctx.change<0)recs.push(`Revisar las causas de la disminución general de ${Math.abs(ctx.change).toFixed(2)}%.`);
  const falling=ctx.brandChanges.filter(x=>x.change!=null&&x.change<0).sort((a,b)=>a.change-b.change);
  if(falling.length)recs.push(`Priorizar ${falling[0].name}, que presenta la mayor caída (${Math.abs(falling[0].change).toFixed(2)}%).`);
  if(ctx.leader.total/(ctx.s.total||1)>.6)recs.push(`Reducir la dependencia de ${ctx.leader.name}, que concentra ${pct(ctx.leader.total,ctx.s.total)} del total.`);
  if(ctx.concepts[0][1]/(ctx.s.total||1)>.8)recs.push(`Diversificar la composición: ${ctx.concepts[0][0]} representa ${pct(ctx.concepts[0][1],ctx.s.total)}.`);
  if(!recs.length)recs.push("Mantener las acciones actuales y documentar las prácticas que impulsaron el resultado.");
  return recs;
}
function renderAIExecutive(){
  const ctx=getAIContext();
  if($("aiBriefingTitle"))$("aiBriefingTitle").textContent=`${getDayGreeting()}, ${authSession?.user?.name||"Usuario"}`;
  if(!ctx){
    if($("aiBriefingCards"))$("aiBriefingCards").innerHTML='<div class="ai-placeholder">Actualiza la información para generar el briefing ejecutivo.</div>';
    if($("aiPriority"))$("aiPriority").textContent="Sin información disponible.";
    return;
  }
  const cards=[
    {icon:"🏆",title:`${ctx.leader.name} lidera`,detail:`${pct(ctx.leader.total,ctx.s.total)} del ingreso general.`},
    {icon:"◉",title:`${ctx.concepts[0][0]} domina`,detail:`${pct(ctx.concepts[0][1],ctx.s.total)} de participación.`},
    {icon:ctx.change==null?"▥":ctx.change>=0?"↗":"↘",title:ctx.change==null?"Sin histórico":`${ctx.change>=0?"Aumento":"Disminución"} ${Math.abs(ctx.change).toFixed(2)}%`,detail:ctx.previous?`Contra ${ctx.previous.label}.`:"Guarda un periodo anterior."},
    {icon:"◎",title:`Índice ${ctx.score}/100`,detail:ctx.score>=80?"Desempeño sólido.":ctx.score>=60?"Resultado estable.":"Requiere atención."}
  ];
  $("aiBriefingCards").innerHTML=cards.map(c=>`<div class="ai-brief-card"><i>${c.icon}</i><b>${c.title}</b><small>${c.detail}</small></div>`).join("");
  $("aiPriority").textContent=buildAIRecommendations(ctx)[0];
  renderPremiumReportAnalysis(ctx);
}
function answerAIQuestion(question){
  const q=String(question||"").trim();if(!q)return;
  const box=$("aiChatMessages");
  box.insertAdjacentHTML("beforeend",`<div class="ai-chat-message user">${escapeHtml(q)}</div>`);
  const ctx=getAIContext();
  let answer="";
  if(!ctx)answer="Actualiza la información para que pueda analizar el periodo.";
  else{
    const nq=normalize(q),recs=buildAIRecommendations(ctx);
    if(nq.includes("OCURRIO")||nq.includes("MES"))answer=`El ingreso general fue ${money.format(ctx.s.total)} con ${ctx.s.count.toLocaleString("es-MX")} registros. ${ctx.leader.name} lideró con ${pct(ctx.leader.total,ctx.s.total)} y ${ctx.concepts[0][0]} fue el concepto principal.${ctx.change==null?" No hay un periodo previo guardado.":` Frente a ${ctx.previous.label}, el total ${ctx.change>=0?"aumentó":"disminuyó"} ${Math.abs(ctx.change).toFixed(2)}%.`}`;
    else if(nq.includes("MEJOR")||nq.includes("LIDER"))answer=`${ctx.leader.name} fue la mejor marca con ${money.format(ctx.leader.total)}, equivalente a ${pct(ctx.leader.total,ctx.s.total)} del total.`;
    else if(nq.includes("ATENCION")||nq.includes("BAJO")||nq.includes("CAYO")){const f=ctx.brandChanges.filter(x=>x.change!=null).sort((a,b)=>a.change-b.change)[0];answer=f&&f.change<0?`${f.name} requiere atención: disminuyó ${Math.abs(f.change).toFixed(2)}% frente al periodo anterior.`:`${ctx.lowest.name} tiene la menor participación actual (${pct(ctx.lowest.total,ctx.s.total)}).`;}
    else if(nq.includes("POR QUE")||nq.includes("VARIACION"))answer=ctx.change==null?"No existe un periodo anterior guardado para explicar la variación.":`El total ${ctx.change>=0?"creció":"disminuyó"} ${Math.abs(ctx.change).toFixed(2)}%. Por marca: ${ctx.brandChanges.filter(x=>x.change!=null).map(x=>`${x.name} ${x.change>=0?"+":""}${x.change.toFixed(2)}%`).join(", ")}.`;
    else if(nq.includes("RECOMEND"))answer=recs.join(" ");
    else if(nq.includes("CORREO"))answer=buildDirectionEmail(ctx);
    else if(nq.includes("TOTAL"))answer=`El ingreso general es ${money.format(ctx.s.total)}.`;
    else answer=`Puedo analizar el total, las marcas, conceptos, variaciones, alertas y recomendaciones. ${recs[0]}`;
  }
  box.insertAdjacentHTML("beforeend",`<div class="ai-chat-message answer">${escapeHtml(answer)}</div>`);
  box.scrollTop=box.scrollHeight;
}
function buildExecutiveSummary(ctx=getAIContext()){
  if(!ctx)return"Actualiza la información para generar el resumen.";
  return`NEXUS Enterprise — Resumen Ejecutivo ${$("month").value} ${$("year").value}\n\nEl ingreso general fue de ${money.format(ctx.s.total)}, integrado por ${ctx.s.count.toLocaleString("es-MX")} registros. ${ctx.leader.name} ocupó la primera posición con ${pct(ctx.leader.total,ctx.s.total)} de participación. ${ctx.concepts[0][0]} fue el concepto dominante con ${money.format(ctx.concepts[0][1])}.${ctx.change==null?" No existe un periodo previo guardado para comparación.":` Frente a ${ctx.previous.label}, el resultado ${ctx.change>=0?"aumentó":"disminuyó"} ${Math.abs(ctx.change).toFixed(2)}%.`} El índice NEXUS fue ${ctx.score}/100.\n\nRecomendaciones:\n- ${buildAIRecommendations(ctx).join("\n- ")}`;
}
function buildDirectionEmail(ctx=getAIContext()){
  if(!ctx)return"Actualiza la información para preparar el correo.";
  return`ASUNTO: Informe ejecutivo de ingresos — ${$("month").value} ${$("year").value}\n\nBuen día,\n\nComparto el resumen ejecutivo del periodo ${$("month").value} ${$("year").value}.\n\n${buildExecutiveSummary(ctx)}\n\nQuedo atento a comentarios.\n\nSaludos.`;
}
function setAIOutput(text){
  $("aiGeneratedOutput").textContent=text;
  $("aiCopyOutputBtn").disabled=!text;
}
function renderPremiumReportAnalysis(ctx=getAIContext()){
  if(!ctx)return;
  const conclusions=[
    `${ctx.leader.name} lidera con ${pct(ctx.leader.total,ctx.s.total)} del total.`,
    `${ctx.concepts[0][0]} es el concepto dominante con ${pct(ctx.concepts[0][1],ctx.s.total)}.`,
    ctx.change==null?"No hay histórico suficiente para medir crecimiento.":`El total ${ctx.change>=0?"aumentó":"disminuyó"} ${Math.abs(ctx.change).toFixed(2)}% frente a ${ctx.previous.label}.`,
    `El índice NEXUS del periodo es ${ctx.score}/100.`
  ];
  $("premiumReportConclusions").innerHTML=conclusions.map(x=>`<div class="insight"><i>•</i><div>${x}</div></div>`).join("");
  $("premiumReportRecommendations").innerHTML=buildAIRecommendations(ctx).map(x=>`<div class="insight"><i>→</i><div>${x}</div></div>`).join("");
  const reportId=`NX-${$("year").value}${String(new Date().getMonth()+1).padStart(2,"0")}-${String(Date.now()).slice(-6)}`;
  $("reportNumber").textContent=reportId;
  $("reportVerificationCode").textContent=reportId;
}
$("aiChatForm").onsubmit=e=>{e.preventDefault();answerAIQuestion($("aiChatInput").value);$("aiChatInput").value=""};
document.querySelectorAll("[data-ai-question]").forEach(btn=>btn.onclick=()=>answerAIQuestion(btn.dataset.aiQuestion));
$("aiClearChatBtn").onclick=()=>$("aiChatMessages").innerHTML='<div class="ai-chat-message system">Conversación reiniciada.</div>';
$("aiRefreshBtn").onclick=()=>{if(state.summary){renderAIExecutive();toast("Análisis actualizado")}else $("loadSheetsBtn").click()};
$("aiPrepareReportBtn").onclick=()=>openView("reportes");
$("aiExplainPriorityBtn").onclick=()=>answerAIQuestion("Explícame la recomendación principal");
$("aiGenerateSummaryBtn").onclick=()=>setAIOutput(buildExecutiveSummary());
$("aiGenerateEmailBtn").onclick=()=>setAIOutput(buildDirectionEmail());
$("aiGenerateReportBtn").onclick=()=>openView("reportes");
$("aiOpenDirectionBtn").onclick=()=>canAccess("GERENCIA")?openView("direccion"):toast("Tu rol no permite abrir Dirección General.");
$("aiCopyOutputBtn").onclick=async()=>{try{await navigator.clipboard.writeText($("aiGeneratedOutput").innerText);toast("Contenido copiado")}catch{toast("No fue posible copiar automáticamente")}};

function publisherSetProgress(percent,text){
  const wrap=$("publisherProgressWrap");if(!wrap)return;
  wrap.classList.remove("hidden");
  $("publisherProgressPct").textContent=`${percent}%`;
  $("publisherProgressText").textContent=text;
  $("publisherProgressBar").style.width=`${percent}%`;
  if(percent>=100)setTimeout(()=>wrap.classList.add("hidden"),900);
}
function detectPeriodFromFilename(name){
  const clean=String(name||"").replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").replace(/\s+/g," ").trim();
  return clean.toUpperCase();
}
function resetPublisher(){
  state.publisher=null;
  $("publisherFileInput").value="";
  $("publisherFileInfo").classList.add("hidden");
  $("publisherPeriodName").value="";
  $("publisherNotes").value="";
  $("publisherValidationBadge").className="status neutral";
  $("publisherValidationBadge").textContent="Sin archivo";
  $("publisherValidationMessage").className="message";
  $("publisherValidationMessage").textContent="Carga un archivo para iniciar la validación.";
  $("publisherPublishBtn").disabled=true;
  $("publisherPreviewBody").innerHTML='<tr><td colspan="6" class="publisher-empty-cell">Sin información cargada.</td></tr>';
  ["publisherTotalRows","publisherTotalAmount","publisherCanje","publisherAbordo","publisherPrepago"].forEach(id=>$(id).textContent=id==="publisherTotalRows"?"0":money.format(0));
  BRANDS.forEach(b=>{const c=document.querySelector(`[data-pub-brand="${b}"]`);c.className="";c.querySelector("small").textContent="Pendiente";c.querySelector("span").textContent="—"});
}
async function parsePublisherFile(file){
  try{
    publisherSetProgress(8,"Leyendo archivo Excel...");
    const wb=XLSX.read(await file.arrayBuffer(),{type:"array",cellDates:true});
    const loaded={},errors=[];
    wb.SheetNames.forEach(sn=>{
      const b=identifyBrand(sn)||identifyBrand(file.name);
      if(!b||loaded[b])return;
      try{
        const matrix=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:"",raw:true});
        const rows=matrixToRows(matrix);
        loaded[b]={brand:b,fileName:file.name,sheetName:sn,rows};
      }catch(e){errors.push(`${b||sn}: ${e.message}`)}
    });
    publisherSetProgress(45,"Validando las cuatro marcas...");
    BRANDS.forEach(b=>{if(!loaded[b])errors.push(`${b}: pestaña no encontrada`)});
    if(errors.length)throw new Error(errors.join(" | "));

    const brands=BRANDS.map(b=>parseRows(b,loaded[b].rows,loaded[b]));
    const summary=brands.reduce((a,b)=>({canje:a.canje+b.canje,abordo:a.abordo+b.abordo,prepago:a.prepago+b.prepago,total:a.total+b.total,count:a.count+b.count}),{canje:0,abordo:0,prepago:0,total:0,count:0});
    state.publisher={file,loaded,brands,summary,period:detectPeriodFromFilename(file.name)};
    renderPublisherPreview();
    publisherSetProgress(100,"Archivo validado");
  }catch(e){
    resetPublisher();
    $("publisherValidationBadge").className="status error";
    $("publisherValidationBadge").textContent="Archivo inválido";
    $("publisherValidationMessage").className="message danger";
    $("publisherValidationMessage").textContent=e.message;
    toast(e.message);
  }
}
function renderPublisherPreview(){
  const p=state.publisher;if(!p)return;
  $("publisherFileInfo").classList.remove("hidden");
  $("publisherFileName").textContent=p.file.name;
  $("publisherFileSize").textContent=`${(p.file.size/1024/1024).toFixed(2)} MB`;
  $("publisherDetectedPeriod").textContent=p.period||"No detectado";
  $("publisherPeriodName").value=p.period;
  $("publisherValidationBadge").className="status ok";
  $("publisherValidationBadge").textContent="Archivo válido";
  $("publisherValidationMessage").className="message success";
  $("publisherValidationMessage").textContent="Las cuatro marcas y las columnas obligatorias fueron validadas.";
  $("publisherTotalRows").textContent=p.summary.count.toLocaleString("es-MX");
  $("publisherTotalAmount").textContent=money.format(p.summary.total);
  $("publisherCanje").textContent=money.format(p.summary.canje);
  $("publisherAbordo").textContent=money.format(p.summary.abordo);
  $("publisherPrepago").textContent=money.format(p.summary.prepago);
  $("publisherPreviewBody").innerHTML=p.brands.map(b=>`<tr><td><b>${b.name}</b></td><td>${b.count.toLocaleString("es-MX")}</td><td>${money.format(b.canje)}</td><td>${money.format(b.abordo)}</td><td>${money.format(b.prepago)}</td><td><b>${money.format(b.total)}</b></td></tr>`).join("");
  p.brands.forEach(b=>{const c=document.querySelector(`[data-pub-brand="${b.name}"]`);c.className="ready";c.querySelector("small").textContent=`${b.count.toLocaleString("es-MX")} registros`;c.querySelector("span").textContent="✓"});
  $("publisherPublishBtn").disabled=false;
}
function serializePublisherData(){
  const p=state.publisher;
  if(!p)throw new Error("No hay archivo validado.");
  const data={};
  BRANDS.forEach(b=>{
    const rows=p.loaded[b].rows;
    const headers=Object.keys(rows[0]||{});
    data[b]={headers,rows:rows.map(r=>headers.map(h=>r[h]??""))};
  });
  return data;
}
$("publisherFileInput").onchange=e=>{const f=e.target.files?.[0];if(f)parsePublisherFile(f)};
const dropzone=$("publisherDropzone");
["dragenter","dragover"].forEach(evt=>dropzone.addEventListener(evt,e=>{e.preventDefault();dropzone.classList.add("dragover")}));
["dragleave","drop"].forEach(evt=>dropzone.addEventListener(evt,e=>{e.preventDefault();dropzone.classList.remove("dragover")}));
dropzone.addEventListener("drop",e=>{const f=e.dataTransfer.files?.[0];if(f)parsePublisherFile(f)});
$("publisherClearBtn").onclick=resetPublisher;
$("publisherPublishBtn").onclick=()=>{
  if(!state.publisher)return;
  $("confirmPublisherFile").textContent=state.publisher.file.name;
  $("confirmPublisherPeriod").textContent=$("publisherPeriodName").value.trim()||state.publisher.period;
  $("confirmPublisherRows").textContent=state.publisher.summary.count.toLocaleString("es-MX");
  $("confirmPublisherTotal").textContent=money.format(state.publisher.summary.total);
  $("publisherConfirmCheck").checked=false;
  $("publisherConfirmPublishBtn").disabled=true;
  $("publisherConfirmModal").classList.remove("hidden");
};
$("publisherConfirmCheck").onchange=e=>$("publisherConfirmPublishBtn").disabled=!e.target.checked;
$("publisherCloseConfirmBtn").onclick=()=>$("publisherConfirmModal").classList.add("hidden");
$("publisherConfirmModal").onclick=e=>{if(e.target===$("publisherConfirmModal"))$("publisherConfirmModal").classList.add("hidden")};
$("publisherConfirmPublishBtn").onclick=async()=>{
  try{
    const p=state.publisher;
    if(!p)throw new Error("No hay archivo validado.");
    const period=$("publisherPeriodName").value.trim()||p.period;
    if(!period)throw new Error("Escribe el nombre del periodo.");
    $("publisherConfirmModal").classList.add("hidden");
    publisherSetProgress(10,"Creando respaldo automático...");
    const payload={
      fileName:p.file.name,
      period,
      notes:$("publisherNotes").value.trim(),
      summary:p.summary,
      data:serializePublisherData()
    };
    const result=await apiRequest("publishData",payload);
    publisherSetProgress(75,"Actualizando información oficial...");
    addNotification("Periodo publicado",`${period} fue publicado por ${authSession.user.name}.`,"⇧");
    publisherSetProgress(100,"Publicación completada");
    toast(result.message||"Periodo publicado correctamente");
    await loadPublisherAudit();
    $("loadSheetsBtn").click();
  }catch(e){publisherSetProgress(100,"La publicación no se completó");toast(e.message)}
};
$("publisherRestoreBtn").onclick=async()=>{
  if(!confirm("¿Deseas restaurar el último respaldo disponible?"))return;
  try{
    publisherSetProgress(15,"Buscando último respaldo...");
    const result=await apiRequest("restoreLastBackup");
    publisherSetProgress(100,"Respaldo restaurado");
    addNotification("Respaldo restaurado",result.message||"Se restauró la información anterior.","↶");
    toast(result.message||"Respaldo restaurado");
    await loadPublisherAudit();
    $("loadSheetsBtn").click();
  }catch(e){publisherSetProgress(100,"No fue posible restaurar");toast(e.message)}
};
async function loadPublisherAudit(){
  if(!$("publisherAuditBody")||!canAccess("GERENCIA"))return;
  try{
    const result=await apiRequest("getPublishAudit");
    const rows=Array.isArray(result.records)?result.records:[];
    $("publisherAuditBody").innerHTML=rows.length?rows.map(r=>`<tr><td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.user)}</td><td>${escapeHtml(r.file)}</td><td>${escapeHtml(r.period)}</td><td>${Number(r.rows||0).toLocaleString("es-MX")}</td><td><span class="state-pill ${r.status==="OK"?"active":"inactive"}">${escapeHtml(r.status)}</span></td></tr>`).join(""):'<tr><td colspan="6" class="publisher-empty-cell">Sin publicaciones registradas.</td></tr>';
  }catch(e){$("publisherAuditBody").innerHTML=`<tr><td colspan="6" class="publisher-empty-cell">${escapeHtml(e.message)}</td></tr>`}
}
$("publisherReloadAuditBtn").onclick=loadPublisherAudit;

function appendAssistantMessage(text,type="answer"){
  const box=$("assistantConversation");
  if(!box)return;
  box.insertAdjacentHTML("beforeend",`<div class="assistant-message assistant-${type}">${escapeHtml(text)}</div>`);
  box.scrollTop=box.scrollHeight;
}
function assistantSummary(){
  if(!state.summary)return"Primero actualiza la información.";
  const s=state.summary,leader=[...state.brands].sort((a,b)=>b.total-a.total)[0],concept=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1])[0];
  return`El ingreso general es ${money.format(s.total)}. ${leader.name} lidera con ${pct(leader.total,s.total)} y ${concept[0]} es el concepto principal con ${pct(concept[1],s.total)}.`;
}
function handleAssistantQuestion(question){
  const q=String(question||"").trim();if(!q)return;
  appendAssistantMessage(q,"user");
  const nq=normalize(q);
  let answer="";
  if(!state.summary)answer="Actualiza Google Sheets para que pueda analizar el periodo.";
  else if(nq.includes("ALERTA"))answer=getCommandAlerts().map(a=>a.text).join(" ");
  else if(nq.includes("RESUMEN"))answer=assistantSummary();
  else if(nq.includes("REPORTE")){answer="Abrí el módulo de Reportes para que puedas generar PDF o Excel.";openView("reportes")}
  else if(nq.includes("DIRECCION")){if(canAccess("GERENCIA")){answer="Abrí el Panel de Dirección General.";openView("direccion")}else answer="Tu rol no permite abrir Dirección General."}
  else if(nq.includes("TOTAL"))answer=`El ingreso general es ${money.format(state.summary.total)}.`;
  else if(nq.includes("MARCA")&&nq.includes("LIDER")){const l=[...state.brands].sort((a,b)=>b.total-a.total)[0];answer=`${l.name} es la marca líder con ${money.format(l.total)} (${pct(l.total,state.summary.total)}).`}
  else answer=assistantSummary();
  appendAssistantMessage(answer,"answer");
}
$("assistantToggle").onclick=()=>{$("assistantPanel").classList.toggle("hidden");$("assistantBadge").style.display="none"};
$("assistantClose").onclick=()=>$("assistantPanel").classList.add("hidden");
$("assistantForm").onsubmit=e=>{e.preventDefault();handleAssistantQuestion($("assistantInput").value);$("assistantInput").value=""};
document.querySelectorAll("[data-assistant-action]").forEach(btn=>btn.onclick=()=>{
  const a=btn.dataset.assistantAction;
  if(a==="summary")handleAssistantQuestion("Dame un resumen");
  if(a==="alerts")handleAssistantQuestion("Muéstrame las alertas");
  if(a==="report")handleAssistantQuestion("Preparar reporte");
  if(a==="direction")handleAssistantQuestion("Abrir Dirección");
});

$("notificationBtn").onclick=()=>$("notificationPanel").classList.toggle("hidden");
$("clearNotificationsBtn").onclick=()=>{saveNotifications([]);renderNotifications()};
document.addEventListener("click",e=>{if(!e.target.closest(".notification-menu"))$("notificationPanel").classList.add("hidden")});
renderNotifications();

renderSettings();
populateCompareSelectors();
Promise.resolve()
  .then(()=>loadLoginUsers())
  .catch(err=>{
    const error=$("loginError");
    if(error){error.textContent=err.message||"No fue posible cargar los usuarios.";error.classList.remove("hidden");}
  });
restoreSession();

updateSources();
})();
if($("oneBriefingRefresh")){
  $("oneBriefingRefresh").onclick=()=>{
    if(state.summary){renderOneBriefing();toast("Briefing actualizado")}
    else $("loadSheetsBtn").click();
  };
}

if($("presentationModeBtn")){
  $("presentationModeBtn").onclick=()=>{
    if(!state.summary){toast("Actualiza los datos antes de iniciar la presentación");return}
    renderPresentation();
    $("presentationOverlay").classList.remove("hidden");
    document.body.classList.add("presentation-active");
  };
}
if($("presentationCloseBtn")){
  $("presentationCloseBtn").onclick=()=>{
    $("presentationOverlay").classList.add("hidden");
    document.body.classList.remove("presentation-active");
  };
}
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&$("presentationOverlay")&&!$("presentationOverlay").classList.contains("hidden")){
    $("presentationOverlay").classList.add("hidden");
    document.body.classList.remove("presentation-active");
  }
});

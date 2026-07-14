(() => {
const BRANDS=["TRT","TRTVB","AAO","AAOVB"],$=id=>document.getElementById(id);
const money=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
const state={sources:{},brands:[],summary:null,charts:[],platformCharts:[],intelligenceCharts:[],notifications:[]};
const notificationKey="recaudacion365-notifications-v15";
const loadNotifications=()=>{try{return JSON.parse(localStorage.getItem(notificationKey)||"[]")}catch{return[]}};
const saveNotifications=v=>localStorage.setItem(notificationKey,JSON.stringify(v));
function addNotification(title,detail,icon="ℹ"){
  const items=loadNotifications();
  items.unshift({id:Date.now(),title,detail,icon,time:new Date().toLocaleString("es-MX")});
  saveNotifications(items.slice(0,25));
  renderNotifications();
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
    updateSources();processAll();setLoadProgress(100,"Reporte actualizado");
    addNotification("Información actualizada",`Se procesaron ${Object.values(loaded).reduce((a,x)=>a+x.rows.length,0).toLocaleString("es-MX")} registros.`,"↻");
  }catch(e){setError(e.message)}
  finally{btn.disabled=false;btn.innerHTML=old}
};
$("fileInput").onchange=async e=>{try{state.sources={};for(const f of [...e.target.files]){const wb=XLSX.read(await f.arrayBuffer(),{type:"array",cellDates:true});wb.SheetNames.forEach(sn=>{const b=identifyBrand(sn)||identifyBrand(f.name);if(b){const m=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:"",raw:true});try{state.sources[b]={brand:b,fileName:f.name,sheetName:sn,rows:matrixToRows(m)}}catch{}}})}updateSources();processAll()}catch(err){setError(err.message)}finally{e.target.value=""}};

function render(){
  const s=state.summary,m=$("month").value,y=$("year").value,sorted=[...state.brands].sort((a,b)=>b.total-a.total),leader=sorted[0],concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]),hist=getHistory(),currentKey=`${y}-${String(["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"].indexOf(m)+1).padStart(2,"0")}`,previous=[...hist].filter(h=>h.key<currentKey).sort((a,b)=>b.key.localeCompare(a.key))[0];
  $("reportTitle").textContent=`INGRESOS GENERALES ${m} ${y}`;$("generatedAt").textContent=`Actualizado ${new Date().toLocaleString("es-MX")}`;
  $("totalKpi").textContent=money.format(s.total);$("totalRows").textContent=`${s.count.toLocaleString("es-MX")} registros`;
  $("leaderKpi").textContent=leader.name;$("leaderShare").textContent=`${pct(leader.total,s.total)} del total`;
  $("conceptKpi").textContent=concepts[0][0];$("conceptShare").textContent=`${pct(concepts[0][1],s.total)} del total`;
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
  $("leaderDelta").textContent=`${pct(leader.total,s.total)} del total`;
  $("conceptDelta").textContent=`${pct(concepts[0][1],s.total)} del total`;
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
  renderHomeChart();renderIntelligence();populateCompareSelectors();$("historyCount").textContent=`${hist.length} periodo${hist.length===1?"":"s"} almacenado${hist.length===1?"":"s"}`;
}

function getCurrentPreviousPeriod(){
  if(!state.summary)return null;
  const months=["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
  const key=`${$("year").value}-${String(months.indexOf($("month").value)+1).padStart(2,"0")}`;
  return [...getHistory()].filter(h=>h.key<key).sort((a,b)=>b.key.localeCompare(a.key))[0]||null;
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

function renderHomeChart(){
  state.platformCharts.forEach(c=>c.destroy());state.platformCharts=[];
  if(!state.summary)return;
  const canvas=$("homeChart");if(canvas)state.platformCharts.push(new Chart(canvas,{type:"bar",data:{labels:state.brands.map(b=>b.name),datasets:[{label:"Ingreso total",data:state.brands.map(b=>b.total),borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>money.format(c.raw)}}},scales:{y:{ticks:{callback:v=>money.format(v)},grid:{color:"rgba(148,163,184,.15)"}},x:{grid:{display:false}}}}}))
}
const pageTitles={inicio:"Centro ejecutivo",ingresos:"Ingresos 360",inteligencia:"Centro de Inteligencia",comparativos:"Comparativos",reportes:"Reportes ejecutivos",usuarios:"Usuarios y accesos",configuracion:"Configuración"};
function openView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.dataset.viewPanel===name));
  document.querySelectorAll(".side-nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  $("pageTitle").textContent=pageTitles[name]||"NEXUS";$("sidebar").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"});
  if(name==="inteligencia")renderIntelligence();if(name==="comparativos")populateCompareSelectors();if(name==="usuarios")loadAdminUsers();if(name==="configuracion")renderSettings();
}
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>openView(b.dataset.view));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>openView(b.dataset.go));
$("menuBtn").onclick=()=>$("sidebar").classList.toggle("open");
$("homeLoadBtn").onclick=()=>$("loadSheetsBtn").click();
$("settingsThemeBtn").onclick=()=>$("themeBtn").click();
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
$("copyIntelligenceBriefBtn").onclick=async()=>{
  const text=$("intelligenceBrief")?.innerText||"";
  if(!text){toast("Primero actualiza la información");return}
  try{await navigator.clipboard.writeText(text);toast("Brief ejecutivo copiado")}catch{toast("No fue posible copiar automáticamente")}
};
$("exportHistoryBtn").onclick=()=>{const blob=new Blob([JSON.stringify(getHistory(),null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Ingresos360_Historico.json";a.click();URL.revokeObjectURL(url)};

function setUserInterface(user){
  $("userName").textContent=user.name||user.username;
  $("userRole").textContent=user.role||"CONSULTA";
  $("userInitial").textContent=String(user.name||user.username||"U").trim().charAt(0).toUpperCase();
  $("dropUserName").textContent=user.name||user.username;
  $("dropUserId").textContent=`Usuario: ${user.username}`;
  if($("welcomeUserName"))$("welcomeUserName").textContent=user.name||user.username;
  if($("profileName"))$("profileName").textContent=user.name||user.username;
  if($("profileUsername"))$("profileUsername").textContent=`Usuario: ${user.username}`;
  if($("profileRole"))$("profileRole").textContent=user.role||"CONSULTA";
  if($("profileInitial"))$("profileInitial").textContent=String(user.name||user.username||"U").trim().charAt(0).toUpperCase();
  const isAdmin=String(user.role||"").toUpperCase()==="ADMIN";
  document.querySelectorAll(".admin-only,.admin-nav").forEach(el=>el.classList.toggle("hidden-role",!isAdmin));
  if(!isAdmin && document.querySelector('[data-view-panel="usuarios"]')?.classList.contains("active")) openView("inicio");
}
function showApp(){
  $("loginScreen").classList.add("hidden");
  $("appLayout").classList.remove("hidden");
  setUserInterface(authSession.user);
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
            ${["CONSULTA","SUPERVISOR","GERENCIA","ADMIN"].map(r=>`<option value="${r}" ${r===u.role?"selected":""}>${r}</option>`).join("")}
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

async function restoreSession(){
  try{
    const saved=JSON.parse(sessionStorage.getItem(sessionKey)||"null");
    if(!saved?.token){showLogin();return}
    authSession=saved;
    const check=await apiRequest("validate");
    authSession.user=check.user;
    sessionStorage.setItem(sessionKey,JSON.stringify(authSession));
    showApp();
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
    showApp();toast(`Bienvenido, ${result.user.name}`);addNotification("Inicio de sesión",`Bienvenido, ${result.user.name}.`,"✓");
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


$("notificationBtn").onclick=()=>$("notificationPanel").classList.toggle("hidden");
$("clearNotificationsBtn").onclick=()=>{saveNotifications([]);renderNotifications()};
document.addEventListener("click",e=>{if(!e.target.closest(".notification-menu"))$("notificationPanel").classList.add("hidden")});
renderNotifications();

renderSettings();populateCompareSelectors();loadLoginUsers();restoreSession();

updateSources();
})();
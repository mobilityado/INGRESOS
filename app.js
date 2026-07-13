(() => {
const BRANDS=["TRT","TRTVB","AAO","AAOVB"],$=id=>document.getElementById(id);
const money=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
const state={sources:{},brands:[],summary:null,charts:[]};
const normalize=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/gi,"").toUpperCase();
const num=v=>{if(typeof v==="number")return Number.isFinite(v)?v:0;let s=String(v??"").trim().replace(/\$/g,"").replace(/\s/g,"").replace(/[^0-9,.-]/g,"");if(!s||s==="-")return 0;const c=s.lastIndexOf(","),d=s.lastIndexOf(".");if(c>=0&&d>=0){s=c>d?s.replace(/\./g,"").replace(",","."):s.replace(/,/g,"")}else if(c>=0){const dec=s.length-c-1;s=(dec===1||dec===2)?s.replace(/\./g,"").replace(",","."):s.replace(/,/g,"")}else if((s.match(/\./g)||[]).length>1){const p=s.split("."),last=p.pop();s=(last.length<=2?p.join("")+"."+last:p.join("")+last)}const n=Number(s);return Number.isFinite(n)?n:0};
const pct=(v,t)=>`${(v/(t||1)*100).toFixed(2)}%`;
const toast=m=>{$("toast").textContent=m;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),3000)};
const sheetId=()=>String(window.APP_CONFIG?.SHEET_ID||"").trim();
const csvUrl=n=>`https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId())}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(n)}&cache=${Date.now()}`;
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
  const btn=$("loadSheetsBtn"),old=btn.innerHTML;try{btn.disabled=true;btn.innerHTML="<span>⏳</span><div><b>Leyendo información...</b><small>TRT, TRTVB, AAO y AAOVB</small></div>";const loaded={},errors=[];
    for(const b of BRANDS){try{const sn=window.APP_CONFIG.SHEETS[b],r=await fetch(csvUrl(sn),{cache:"no-store"});if(!r.ok)throw new Error(`HTTP ${r.status}`);const csv=await r.text();if(/<html/i.test(csv))throw new Error("La hoja requiere acceso");const p=Papa.parse(csv,{header:false,skipEmptyLines:false});loaded[b]={brand:b,fileName:"Google Sheets",sheetName:sn,rows:matrixToRows(p.data)}}catch(e){errors.push(`${b}: ${e.message}`)}}
    if(errors.length)throw new Error(errors.join(" | "));state.sources=loaded;updateSources();processAll();
  }catch(e){setError(e.message)}finally{btn.disabled=false;btn.innerHTML=old}
};
$("fileInput").onchange=async e=>{try{state.sources={};for(const f of [...e.target.files]){const wb=XLSX.read(await f.arrayBuffer(),{type:"array",cellDates:true});wb.SheetNames.forEach(sn=>{const b=identifyBrand(sn)||identifyBrand(f.name);if(b){const m=XLSX.utils.sheet_to_json(wb.Sheets[sn],{header:1,defval:"",raw:true});try{state.sources[b]={brand:b,fileName:f.name,sheetName:sn,rows:matrixToRows(m)}}catch{}}})}updateSources();processAll()}catch(err){setError(err.message)}finally{e.target.value=""}};

function render(){
  const s=state.summary,m=$("month").value,y=$("year").value,sorted=[...state.brands].sort((a,b)=>b.total-a.total),leader=sorted[0],concepts=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].sort((a,b)=>b[1]-a[1]),hist=getHistory(),currentKey=`${y}-${String(["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"].indexOf(m)+1).padStart(2,"0")}`,previous=[...hist].filter(h=>h.key<currentKey).sort((a,b)=>b.key.localeCompare(a.key))[0];
  $("reportTitle").textContent=`INGRESOS GENERALES ${m} ${y}`;$("generatedAt").textContent=`Actualizado ${new Date().toLocaleString("es-MX")}`;
  $("totalKpi").textContent=money.format(s.total);$("totalRows").textContent=`${s.count.toLocaleString("es-MX")} registros`;
  $("leaderKpi").textContent=leader.name;$("leaderShare").textContent=`${pct(leader.total,s.total)} del total`;
  $("conceptKpi").textContent=concepts[0][0];$("conceptShare").textContent=`${pct(concepts[0][1],s.total)} del total`;
  if(previous){const v=(s.total-previous.total)/(previous.total||1)*100;$("variationKpi").textContent=`${v>=0?"+":""}${v.toFixed(2)}%`;$("variationDetail").textContent=`vs. ${previous.label}`}else{$("variationKpi").textContent="Sin histórico";$("variationDetail").textContent="Guarda otro mes para comparar"}
  [["canjeKpi",s.canje],["abordoKpi",s.abordo],["prepagoKpi",s.prepago]].forEach(([i,v])=>$(i).textContent=money.format(v));$("canjePct").textContent=pct(s.canje,s.total);$("abordoPct").textContent=pct(s.abordo,s.total);$("prepagoPct").textContent=pct(s.prepago,s.total);
  $("summaryBody").innerHTML=state.brands.map(b=>`<tr><td><b>${b.name}</b></td><td>${money.format(b.canje)}</td><td>${money.format(b.abordo)}</td><td>${money.format(b.prepago)}</td><td><b>${money.format(b.total)}</b></td><td>${b.count.toLocaleString("es-MX")}</td><td>${pct(b.total,s.total)}</td></tr>`).join("");
  $("summaryFoot").innerHTML=`<tr><td>GENERAL</td><td>${money.format(s.canje)}</td><td>${money.format(s.abordo)}</td><td>${money.format(s.prepago)}</td><td>${money.format(s.total)}</td><td>${s.count.toLocaleString("es-MX")}</td><td>100%</td></tr>`;
  $("ranking").innerHTML=sorted.map((b,i)=>`<div class="rank-row"><span class="rank-no">${i+1}</span><div><b>${b.name}</b><small>${pct(b.total,s.total)} de participación</small></div><strong>${money.format(b.total)}</strong></div>`).join("");
  const weakest=sorted.at(-1),ins=[`<b>${leader.name}</b> encabeza la recaudación con ${money.format(leader.total)}.`,`<b>${concepts[0][0]}</b> es el concepto dominante y representa ${pct(concepts[0][1],s.total)} del ingreso general.`,`La diferencia entre la marca líder y ${weakest.name} es de ${money.format(leader.total-weakest.total)}.`,previous?`El total ${s.total>=previous.total?"aumentó":"disminuyó"} ${Math.abs((s.total-previous.total)/(previous.total||1)*100).toFixed(2)}% frente a ${previous.label}.`:"Guarda este periodo y el siguiente para activar la comparación mensual."];
  $("insights").innerHTML=ins.map((t,i)=>`<div class="insight"><i>${["↗","◉","⇄","▥"][i]}</i><div>${t}</div></div>`).join("");
  renderBrandPanels();renderHistory();requestAnimationFrame(renderCharts);
}
function renderBrandPanels(){
  $("brandPanels").innerHTML=state.brands.map(b=>`<section class="brand-panel" data-panel="${b.name}"><div class="brand-hero"><div class="brand-name"><small>REPORTE INDIVIDUAL</small><h3>${b.name}</h3><small>${pct(b.total,state.summary.total)} del consolidado</small></div><div class="brand-stat"><span>Canje</span><strong>${money.format(b.canje)}</strong><small>${pct(b.canje,b.total)}</small></div><div class="brand-stat"><span>Abordo</span><strong>${money.format(b.abordo)}</strong><small>${pct(b.abordo,b.total)}</small></div><div class="brand-stat"><span>Prepago</span><strong>${money.format(b.prepago)}</strong><small>${pct(b.prepago,b.total)}</small></div><div class="brand-stat"><span>Total</span><strong>${money.format(b.total)}</strong><small>${b.count.toLocaleString("es-MX")} registros</small></div></div><div class="brand-charts"><article class="card chart-card"><div class="card-title"><small>COMPOSICIÓN</small><h3>Ingresos por concepto</h3></div><canvas id="bar-${b.name}"></canvas></article><article class="card chart-card"><div class="card-title"><small>DISTRIBUCIÓN</small><h3>Participación interna</h3></div><canvas id="pie-${b.name}"></canvas></article></div></section>`).join("")
}
function renderHistory(){
  const h=getHistory().sort((a,b)=>a.key.localeCompare(b.key));$("historyList").innerHTML=h.length?h.slice().reverse().map(x=>`<div class="history-row"><div><b>${x.label}</b><small>${x.count.toLocaleString("es-MX")} registros</small></div><strong>${money.format(x.total)}</strong></div>`).join(""):"<p class='message'>Aún no hay periodos guardados.</p>";
  $("historyAdmin").innerHTML=h.length?h.slice().reverse().map(x=>`<div class="history-row"><div><b>${x.label}</b><small>${money.format(x.total)}</small></div><button data-delete="${x.key}">Eliminar</button></div>`).join(""):"<p class='message'>No hay histórico guardado.</p>";
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>{setHistory(getHistory().filter(x=>x.key!==b.dataset.delete));renderHistory();renderCharts();toast("Periodo eliminado")})
}
function chartOptions(){return{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{usePointStyle:true,padding:16}},tooltip:{callbacks:{label:c=>`${c.dataset.label||c.label}: ${money.format(c.raw)}`}}},scales:{y:{beginAtZero:true,ticks:{callback:v=>money.format(v)},grid:{color:"rgba(148,163,184,.15)"}},x:{grid:{display:false}}}}}
function renderCharts(){
  state.charts.forEach(c=>c.destroy());state.charts=[];
  state.charts.push(new Chart($("brandChart"),{type:"bar",data:{labels:BRANDS,datasets:[{label:"Canje",data:state.brands.map(b=>b.canje)},{label:"Abordo",data:state.brands.map(b=>b.abordo)},{label:"Prepago",data:state.brands.map(b=>b.prepago)}]},options:chartOptions()}));
  state.charts.push(new Chart($("shareChart"),{type:"doughnut",data:{labels:BRANDS,datasets:[{data:state.brands.map(b=>b.total),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"67%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true}},tooltip:{callbacks:{label:c=>`${c.label}: ${money.format(c.raw)}`}}}}}));
  state.brands.forEach(b=>{const vals=[b.canje,b.abordo,b.prepago],labs=["Canje","Abordo","Prepago"];state.charts.push(new Chart($(`bar-${b.name}`),{type:"bar",data:{labels:labs,datasets:[{label:"Importe",data:vals,borderRadius:8}]},options:{...chartOptions(),plugins:{...chartOptions().plugins,legend:{display:false}}}}));state.charts.push(new Chart($(`pie-${b.name}`),{type:"doughnut",data:{labels:labs,datasets:[{data:vals,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"65%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true}},tooltip:{callbacks:{label:c=>`${c.label}: ${money.format(c.raw)}`}}}}}))});
  const hist=getHistory().sort((a,b)=>a.key.localeCompare(b.key));const hc=$("historyChart");if(hc)state.charts.push(new Chart(hc,{type:"line",data:{labels:hist.map(x=>x.label),datasets:[{label:"Total general",data:hist.map(x=>x.total),tension:.3,fill:false}]},options:chartOptions()}))
}
$("tabs").onclick=e=>{const b=e.target.closest("button");if(!b)return;document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".tab-panel,.brand-panel").forEach(p=>p.classList.toggle("active",p.dataset.panel===b.dataset.tab));setTimeout(renderCharts,40)};
$("saveSnapshotBtn").onclick=()=>{if(!state.summary)return;const months=["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"],m=$("month").value,y=Number($("year").value),key=`${y}-${String(months.indexOf(m)+1).padStart(2,"0")}`,item={key,label:`${m} ${y}`,...state.summary,brands:state.brands.map(b=>({name:b.name,total:b.total,canje:b.canje,abordo:b.abordo,prepago:b.prepago}))},h=getHistory().filter(x=>x.key!==key);h.push(item);setHistory(h);render();toast("Periodo guardado en el histórico local")};
$("clearHistoryBtn").onclick=()=>{$("historyModal").classList.remove("hidden");renderHistory()};$("closeModalBtn").onclick=()=>$("historyModal").classList.add("hidden");$("historyModal").onclick=e=>{if(e.target===$("historyModal"))$("historyModal").classList.add("hidden")};
$("exportBtn").onclick=()=>{const wb=XLSX.utils.book_new(),s=state.summary,m=$("month").value,y=$("year").value,aoa=[[`INGRESOS GENERALES ${m} ${y}`],[],["MARCA","CANJE","ABORDO","PREPAGO","TOTAL","REGISTROS","PARTICIPACIÓN"],...state.brands.map(b=>[b.name,b.canje,b.abordo,b.prepago,b.total,b.count,b.total/(s.total||1)]),["GENERAL",s.canje,s.abordo,s.prepago,s.total,s.count,1]];XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(aoa),"GENERAL");state.brands.forEach(b=>{const sh=XLSX.utils.json_to_sheet(b.rows);XLSX.utils.book_append_sheet(wb,sh,b.name)});const hist=getHistory();if(hist.length)XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(hist.map(x=>({Periodo:x.label,Canje:x.canje,Abordo:x.abordo,Prepago:x.prepago,Total:x.total,Registros:x.count}))),"HISTORICO");XLSX.writeFile(wb,`INGRESOS_360_${m}_${y}.xlsx`)};
updateSources();
})();
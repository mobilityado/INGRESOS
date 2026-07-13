(() => {
  const BRANDS=["TRT","TRTVB","AAO","AAOVB"],$=id=>document.getElementById(id);
  const money=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
  const state={sources:{},brands:[],summary:null,charts:[]};
  const normalize=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/gi,"").toUpperCase();
  // Convierte importes en formato mexicano ($1.446,52) y americano ($1,446.52).
  // La versión anterior eliminaba todas las comas; por eso $27,00 se interpretaba como $2,700.
  const number=v=>{
    if(typeof v==="number")return Number.isFinite(v)?v:0;
    let s=String(v??"").trim().replace(/\$/g,"").replace(/\s/g,"").replace(/[^0-9,.-]/g,"");
    if(!s||s==="-")return 0;
    const comma=s.lastIndexOf(","),dot=s.lastIndexOf(".");
    if(comma>=0&&dot>=0){
      if(comma>dot)s=s.replace(/\./g,"").replace(",",".");
      else s=s.replace(/,/g,"");
    }else if(comma>=0){
      const decimals=s.length-comma-1;
      s=decimals===1||decimals===2?s.replace(/\./g,"").replace(",","."):s.replace(/,/g,"");
    }else if(dot>=0){
      const pieces=s.split(".");
      if(pieces.length>2){
        const last=pieces.pop();
        s=(last.length===1||last.length===2)?pieces.join("")+"."+last:pieces.join("")+last;
      }
    }
    const n=Number(s);return Number.isFinite(n)?n:0;
  };
  const toast=msg=>{$("toast").textContent=msg;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),3200)};
  const apiUrl=()=>String(window.APP_CONFIG?.API_URL||"").trim();

  if(localStorage.getItem("ingresos-theme")==="dark")document.body.classList.add("dark");
  $("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("ingresos-theme",document.body.classList.contains("dark")?"dark":"light")};
  $("month").onchange=()=>state.brands.length&&render();$("year").oninput=()=>state.brands.length&&render();
  $("clearBtn").onclick=clearSources;

  $("fileInput").addEventListener("change",async e=>{
    const files=[...e.target.files]; if(!files.length)return;
    try{
      clearSources(false);
      for(const file of files){
        const wb=XLSX.read(await file.arrayBuffer(),{type:"array",cellDates:true});
        registerWorkbook(wb,file.name);
      }
      updateSourceUI();
      if(Object.keys(state.sources).length===4){toast("Las cuatro marcas fueron identificadas correctamente");processAll(true)}
      else toast("Archivos revisados. Consulta las marcas pendientes.");
    }catch(err){setError(err.message)} finally {e.target.value=""}
  });

  function identifyBrand(text){
    const n=normalize(text);
    // El orden evita confundir TRTVB con TRT y AAOVB con AAO.
    if(n.includes("TRTVB"))return "TRTVB";
    if(n.includes("AAOVB"))return "AAOVB";
    if(/(^|[^A-Z])TRT([^A-Z]|$)/.test(String(text).toUpperCase())||n==="TRT")return "TRT";
    if(/(^|[^A-Z])AAO([^A-Z]|$)/.test(String(text).toUpperCase())||n==="AAO")return "AAO";
    return null;
  }
  function registerWorkbook(wb,fileName){
    let found=0;
    wb.SheetNames.forEach(sheetName=>{
      const brand=identifyBrand(sheetName);
      if(brand){state.sources[brand]={brand,workbook:wb,sheetName,fileName};found++}
    });
    if(!found){
      const brand=identifyBrand(fileName);
      if(brand){
        const probable=wb.SheetNames.find(n=>sheetLooksValid(wb.Sheets[n]))||wb.SheetNames[0];
        state.sources[brand]={brand,workbook:wb,sheetName:probable,fileName};found++;
      }
    }
    // Si es un único archivo sin nombre reconocible, una única pestaña puede identificarse por Marca de cabecera.
    if(!found&&wb.SheetNames.length===1){
      const sheetName=wb.SheetNames[0],brand=identifyBrand(sheetName)||identifyBrand(fileName);
      if(brand)state.sources[brand]={brand,workbook:wb,sheetName,fileName};
    }
  }
  function sheetLooksValid(ws){
    const matrix=XLSX.utils.sheet_to_json(ws,{header:1,defval:"",raw:true,range:0});
    const wanted=[$("canjeCol").value,$("abordoCol").value,$("prepagoCol").value].map(normalize);
    return matrix.slice(0,20).some(r=>wanted.every(w=>r.map(normalize).includes(w)));
  }
  function updateSourceUI(){
    BRANDS.forEach(brand=>{
      const card=document.querySelector(`[data-brand="${brand}"]`),src=state.sources[brand],small=card.querySelector("small"),check=card.querySelector(".check");
      card.className=`brand-chip ${src?"found":"missing"}`;
      small.textContent=src?`${src.fileName} · ${src.sheetName}`:"Pendiente de cargar";
      check.textContent=src?"✓":"!";
    });
    const count=Object.keys(state.sources).length,missing=BRANDS.filter(b=>!state.sources[b]);
    $("fileStatus").className=`status ${count===4?"ok":count?"warning":"neutral"}`;
    $("fileStatus").textContent=count===4?"4 de 4 listas":`${count} de 4 detectadas`;
    $("processBtn").disabled=count!==4;
    $("validationMessage").className=`validation-message ${count===4?"valid":count?"warn":""}`;
    $("validationMessage").textContent=count===4?"Todo listo. Puedes generar el reporte completo.":count?`Faltan: ${missing.join(", ")}. Puedes agregar los archivos restantes en una nueva selección.`:"Selecciona un libro con cuatro pestañas o varios archivos separados.";
  }
  function clearSources(show=true){state.sources={};state.brands=[];state.summary=null;state.charts.forEach(c=>c.destroy());state.charts=[];$("dashboard").classList.add("hidden");updateSourceUI();if(show)toast("Archivos eliminados")}
  $("processBtn").onclick=()=>processAll(true);

  function parseSource(src){
    const matrix=XLSX.utils.sheet_to_json(src.workbook.Sheets[src.sheetName],{header:1,defval:"",raw:true});
    const wanted=[$("canjeCol").value,$("abordoCol").value,$("prepagoCol").value].map(normalize);
    const hi=matrix.findIndex(r=>wanted.every(w=>r.map(normalize).includes(w)));
    if(hi<0)throw new Error(`${src.brand}: no se encontraron las columnas Vta Man, Vta Abor y Vta Prepago.`);
    const headers=matrix[hi].map((v,i)=>String(v??"").trim()||`Columna ${i+1}`),map={};headers.forEach(h=>map[normalize(h)]=h);
    const rows=matrix.slice(hi+1).filter(r=>r.some(v=>String(v??"").trim()!=="")).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??""])));
    const ch=map[normalize($("canjeCol").value)],ah=map[normalize($("abordoCol").value)],ph=map[normalize($("prepagoCol").value)];
    const s={name:src.brand,source:src,headers,rows,canje:0,abordo:0,prepago:0,count:rows.length};
    rows.forEach(r=>{s.canje+=number(r[ch]);s.abordo+=number(r[ah]);s.prepago+=number(r[ph])});s.total=s.canje+s.abordo+s.prepago;return s;
  }
  function processAll(scroll){
    try{
      const missing=BRANDS.filter(b=>!state.sources[b]);if(missing.length)throw new Error(`Faltan las marcas: ${missing.join(", ")}.`);
      state.brands=BRANDS.map(b=>parseSource(state.sources[b]));
      state.summary=state.brands.reduce((a,b)=>({canje:a.canje+b.canje,abordo:a.abordo+b.abordo,prepago:a.prepago+b.prepago,total:a.total+b.total,count:a.count+b.count}),{canje:0,abordo:0,prepago:0,total:0,count:0});
      render();toast(`Reporte corregido: ${money.format(state.summary.total)}`);if(scroll)$("dashboard").scrollIntoView({behavior:"smooth"});
    }catch(err){setError(err.message)}
  }
  const pct=(v,t)=>`${(v/(t||1)*100).toFixed(2)}%`;
  function render(){
    const s=state.summary,m=$("month").value,y=$("year").value;$("reportTitle").textContent=`INGRESOS GENERALES ${m} ${y}`;
    [["kpiCanje",s.canje],["kpiAbordo",s.abordo],["kpiPrepago",s.prepago],["kpiTotal",s.total]].forEach(([id,v])=>$(id).textContent=money.format(v));
    $("pctCanje").textContent=`${pct(s.canje,s.total)} del total`;$("pctAbordo").textContent=`${pct(s.abordo,s.total)} del total`;$("pctPrepago").textContent=`${pct(s.prepago,s.total)} del total`;$("rowCount").textContent=`${s.count.toLocaleString("es-MX")} registros procesados`;
    $("processedAt").textContent=`Generado ${new Date().toLocaleString("es-MX")}`;
    $("brandBody").innerHTML=state.brands.map(b=>`<tr><td><span class="brand-label">${b.name}</span></td><td>${money.format(b.canje)}</td><td>${money.format(b.abordo)}</td><td>${money.format(b.prepago)}</td><td><strong>${money.format(b.total)}</strong></td><td>${b.count.toLocaleString("es-MX")}</td><td><span class="share-pill">${pct(b.total,s.total)}</span></td></tr>`).join("");
    [["footCanje",s.canje],["footAbordo",s.abordo],["footPrepago",s.prepago],["footTotal",s.total]].forEach(([id,v])=>$(id).textContent=money.format(v));$("footRows").textContent=s.count.toLocaleString("es-MX");
    renderIndividuals(m,y);$("dashboard").classList.remove("hidden");requestAnimationFrame(renderCharts);
  }
  function renderIndividuals(m,y){
    $("individualReports").innerHTML=state.brands.map((b,i)=>`<article class="brand-report panel"><div class="brand-report-head"><div class="report-id"><span>0${i+1}</span></div><div class="report-title"><p class="eyebrow blue">REPORTE INDIVIDUAL</p><h2>${b.name}</h2><p>Ingresos ${m} ${y}</p></div><div class="brand-total"><small>Total de la marca</small><strong>${money.format(b.total)}</strong><span>${pct(b.total,state.summary.total)} del general</span></div></div><div class="mini-kpi-grid"><div><span>Canje</span><strong>${money.format(b.canje)}</strong><small>${pct(b.canje,b.total)}</small></div><div><span>Abordo</span><strong>${money.format(b.abordo)}</strong><small>${pct(b.abordo,b.total)}</small></div><div><span>Prepago</span><strong>${money.format(b.prepago)}</strong><small>${pct(b.prepago,b.total)}</small></div><div class="mini-total"><span>Registros</span><strong>${b.count.toLocaleString("es-MX")}</strong><small>operaciones</small></div></div><div class="brand-chart-grid"><div class="chart-box"><div class="mini-chart-title">Importe por concepto</div><canvas id="bar-${b.name}"></canvas></div><div class="chart-box"><div class="mini-chart-title">Distribución interna</div><canvas id="pie-${b.name}"></canvas></div></div></article>`).join("");
  }
  function baseOptions(){return{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{position:"bottom",labels:{usePointStyle:true,padding:18}},tooltip:{callbacks:{label:c=>`${c.dataset.label||c.label}: ${money.format(c.raw)}`}}},scales:{y:{beginAtZero:true,ticks:{callback:v=>money.format(v)},grid:{color:"rgba(148,163,184,.15)"}},x:{grid:{display:false}}}}}
  function renderCharts(){
    state.charts.forEach(c=>c.destroy());state.charts=[];
    state.charts.push(new Chart($("brandCompareChart"),{type:"bar",data:{labels:BRANDS,datasets:[{label:"Canje",data:state.brands.map(b=>b.canje),backgroundColor:"#2563eb",borderRadius:7},{label:"Abordo",data:state.brands.map(b=>b.abordo),backgroundColor:"#06b6d4",borderRadius:7},{label:"Prepago",data:state.brands.map(b=>b.prepago),backgroundColor:"#8b5cf6",borderRadius:7}]},options:baseOptions()}));
    state.charts.push(new Chart($("brandShareChart"),{type:"doughnut",data:{labels:BRANDS,datasets:[{data:state.brands.map(b=>b.total),backgroundColor:["#2563eb","#06b6d4","#8b5cf6","#f59e0b"],borderWidth:0,hoverOffset:8}]},options:{responsive:true,maintainAspectRatio:false,cutout:"68%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true,padding:18}},tooltip:{callbacks:{label:c=>`${c.label}: ${money.format(c.raw)} (${pct(c.raw,state.summary.total)})`}}}}}));
    state.brands.forEach((b,i)=>{const vals=[b.canje,b.abordo,b.prepago],labels=["Canje","Abordo","Prepago"],colors=["#2563eb","#06b6d4","#8b5cf6"];
      state.charts.push(new Chart($(`bar-${b.name}`),{type:"bar",data:{labels,datasets:[{label:"Importe",data:vals,backgroundColor:colors,borderRadius:9}]},options:{...baseOptions(),plugins:{...baseOptions().plugins,legend:{display:false}}}}));
      state.charts.push(new Chart($(`pie-${b.name}`),{type:"doughnut",data:{labels,datasets:[{data:vals,backgroundColor:colors,borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"66%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true}},tooltip:{callbacks:{label:c=>`${c.label}: ${money.format(c.raw)}`}}}}}));
    });
  }
  $("exportExcelBtn").onclick=()=>{
    const wb=XLSX.utils.book_new(),m=$("month").value,y=$("year").value,s=state.summary;
    const general=[[`INGRESOS GENERALES ${m} ${y}`],[],["MARCA","CANJE","ABORDO","PREPAGO","TOTAL","REGISTROS","PARTICIPACIÓN"],...state.brands.map(b=>[b.name,b.canje,b.abordo,b.prepago,b.total,b.count,b.total/(s.total||1)]),["GENERAL",s.canje,s.abordo,s.prepago,s.total,s.count,1]];
    const ws=XLSX.utils.aoa_to_sheet(general);ws["!cols"]=[{wch:18},{wch:18},{wch:18},{wch:18},{wch:18},{wch:14},{wch:16}];XLSX.utils.book_append_sheet(wb,ws,"GENERAL");
    state.brands.forEach(b=>{const rows=[[`INGRESOS ${b.name} ${m} ${y}`],[],["CONCEPTO","IMPORTE","PARTICIPACIÓN"],["Canje",b.canje,b.canje/(b.total||1)],["Abordo",b.abordo,b.abordo/(b.total||1)],["Prepago",b.prepago,b.prepago/(b.total||1)],["TOTAL",b.total,1],[],["DETALLE DE REGISTROS"]];const sh=XLSX.utils.aoa_to_sheet(rows);XLSX.utils.sheet_add_json(sh,b.rows,{origin:"A10"});XLSX.utils.book_append_sheet(wb,sh,b.name)});
    XLSX.writeFile(wb,`INGRESOS_4_MARCAS_${m}_${y}.xlsx`);
  };
  $("printBtn").onclick=()=>window.print();
  $("loadApiBtn").onclick=async()=>{try{if(!apiUrl()||apiUrl().includes("PEGA_AQUI"))throw new Error("Configura la URL del Apps Script en config.js.");const u=new URL(apiUrl());u.searchParams.set("accion","todasLasHojas");const j=await(await fetch(u)).json();if(j.error)throw new Error(j.mensaje);clearSources(false);(j.hojas||[]).forEach(h=>{const brand=identifyBrand(h.nombre);if(brand){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(h.datos),h.nombre);state.sources[brand]={brand,workbook:wb,sheetName:h.nombre,fileName:"Google Sheets"}}});updateSourceUI();if(Object.keys(state.sources).length===4)processAll(true)}catch(e){setError(e.message)}};
  function setError(msg){$("fileStatus").className="status error";$("fileStatus").textContent="Revisar archivos";$("validationMessage").className="validation-message error-box";$("validationMessage").textContent=msg;toast(msg);console.error(msg)}
  updateSourceUI();
})();

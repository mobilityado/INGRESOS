(() => {
  const $ = id => document.getElementById(id);
  const money = new Intl.NumberFormat("es-MX", {style:"currency", currency:"MXN"});
  const state = {workbook:null, rows:[], headers:[], summary:null, brands:[], charts:[]};
  const normalize = v => String(v ?? "").replace(/\s+/g," ").trim().toLowerCase();
  const number = v => {
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    const n = Number(String(v ?? "").replace(/[$,\s]/g,""));
    return Number.isFinite(n) ? n : 0;
  };
  const toast = msg => { $("toast").textContent=msg; $("toast").classList.add("show"); setTimeout(()=>$("toast").classList.remove("show"),2800); };
  const apiUrl = () => (window.APP_CONFIG?.API_URL || "").trim();

  $("themeBtn").onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("ingresos-theme", document.body.classList.contains("dark") ? "dark" : "light");
  };
  if (localStorage.getItem("ingresos-theme") === "dark") document.body.classList.add("dark");

  $("fileInput").addEventListener("change", async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      state.workbook = XLSX.read(buffer,{type:"array",cellDates:true});
      $("processBtn").disabled = false;
      $("fileStatus").className="status ok";
      $("fileStatus").textContent=file.name;
      processWorkbook(true);
      toast("Reporte general e individuales generados automáticamente");
    } catch (err) { setStatusError(err.message); }
  });

  $("processBtn").onclick = () => processWorkbook(true);

  function rowsFromSheet(ws) {
    const matrix = XLSX.utils.sheet_to_json(ws,{header:1,defval:"",raw:true});
    const headerIndex = matrix.findIndex(row => {
      const n = row.map(normalize);
      return n.includes(normalize($("canjeCol").value)) && n.includes(normalize($("abordoCol").value)) && n.includes(normalize($("prepagoCol").value));
    });
    if (headerIndex < 0) return null;
    const headers = matrix[headerIndex].map((v,i)=>String(v??"").trim() || `Columna ${i+1}`);
    const rows = matrix.slice(headerIndex+1)
      .filter(row=>row.some(v=>String(v??"").trim()!==""))
      .map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]??""])));
    return {headers, rows};
  }

  function summarize(name, rows, headers) {
    const map={}; headers.forEach(h=>map[normalize(h)]=h);
    const find = requested => map[normalize(requested)] || headers.find(h=>normalize(h).includes(normalize(requested)));
    const canjeH=find($("canjeCol").value), abordoH=find($("abordoCol").value), prepagoH=find($("prepagoCol").value);
    if (!canjeH || !abordoH || !prepagoH) throw new Error(`En ${name} faltan columnas de ingresos.`);
    const s={name,rows,headers,canje:0,abordo:0,prepago:0,total:0,count:rows.length};
    rows.forEach(r=>{s.canje+=number(r[canjeH]);s.abordo+=number(r[abordoH]);s.prepago+=number(r[prepagoH]);});
    s.total=s.canje+s.abordo+s.prepago;
    return s;
  }

  function processWorkbook(scroll) {
    try {
      if (!state.workbook) throw new Error("Selecciona primero el archivo Excel.");
      let brands=[];
      for (const sheetName of state.workbook.SheetNames) {
        const parsed=rowsFromSheet(state.workbook.Sheets[sheetName]);
        if (parsed && parsed.rows.length) brands.push(summarize(sheetName,parsed.rows,parsed.headers));
      }
      if (!brands.length) throw new Error("No se encontró ninguna hoja con Vta Man, Vta Abor y Vta Prepago.");

      // Cuando solo existe una hoja, intenta separar automáticamente por la columna Marca.
      if (brands.length===1) {
        const base=brands[0];
        const marcaH=base.headers.find(h=>normalize(h)==="marca");
        if (marcaH) {
          const groups=new Map();
          base.rows.forEach(r=>{
            const key=String(r[marcaH]??"").trim() || "SIN MARCA";
            if(!groups.has(key)) groups.set(key,[]);
            groups.get(key).push(r);
          });
          const meaningful=[...groups.entries()].filter(([k,v])=>k!=="SIN MARCA" && v.length>0);
          if (meaningful.length>=2 && meaningful.length<=20) {
            brands=meaningful.map(([name,rows])=>summarize(name,rows,base.headers));
            const without=groups.get("SIN MARCA");
            if (without?.length) brands.push(summarize("SIN MARCA",without,base.headers));
          }
        }
      }

      brands.sort((a,b)=>b.total-a.total);
      const allRows=brands.flatMap(b=>b.rows.map(r=>({...r,"Marca / Hoja":b.name})));
      const general={canje:0,abordo:0,prepago:0,total:0,count:0};
      brands.forEach(b=>{general.canje+=b.canje;general.abordo+=b.abordo;general.prepago+=b.prepago;general.count+=b.count;});
      general.total=general.canje+general.abordo+general.prepago;
      state.brands=brands; state.rows=allRows; state.headers=Object.keys(allRows[0]||{}); state.summary=general;
      render();
      if(scroll) $("dashboard").scrollIntoView({behavior:"smooth"});
    } catch(err) { setStatusError(err.message); }
  }

  function render() {
    const s=state.summary,total=s.total||1;
    const title=`INGRESOS GENERALES ${$("month").value} ${$("year").value}`;
    $("reportTitle").textContent=title;
    $("kpiCanje").textContent=money.format(s.canje); $("kpiAbordo").textContent=money.format(s.abordo);
    $("kpiPrepago").textContent=money.format(s.prepago); $("kpiTotal").textContent=money.format(s.total);
    $("pctCanje").textContent=(s.canje/total*100).toFixed(2)+"%";
    $("pctAbordo").textContent=(s.abordo/total*100).toFixed(2)+"%";
    $("pctPrepago").textContent=(s.prepago/total*100).toFixed(2)+"%";
    $("rowCount").textContent=`${s.count.toLocaleString("es-MX")} registros · ${state.brands.length} marcas`;
    $("tableTotal").textContent=money.format(s.total);
    $("processedAt").textContent="Procesado: "+new Date().toLocaleString("es-MX");
    $("summaryBody").innerHTML=[["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]].map(([n,v])=>`<tr><td>${n}</td><td>${money.format(v)}</td><td>${(v/total*100).toFixed(2)}%</td></tr>`).join("");
    renderBrands(); renderPreview(); renderCharts();
    $("dashboard").classList.remove("hidden");
  }

  function renderBrands() {
    $("brandCount").textContent=`${state.brands.length} marcas generadas automáticamente`;
    $("brandBody").innerHTML=state.brands.map(b=>`<tr><td><strong>${escapeHtml(b.name)}</strong></td><td>${money.format(b.canje)}</td><td>${money.format(b.abordo)}</td><td>${money.format(b.prepago)}</td><td><strong>${money.format(b.total)}</strong></td><td>${b.count.toLocaleString("es-MX")}</td><td>${(b.total/(state.summary.total||1)*100).toFixed(2)}%</td></tr>`).join("");
    $("individualReports").innerHTML=state.brands.map((b,i)=>{
      const t=b.total||1;
      return `<article class="panel individual-report">
        <div class="panel-head"><div><p class="eyebrow">REPORTE INDIVIDUAL ${i+1}</p><h3>INGRESOS ${escapeHtml(b.name)} ${$("month").value} ${$("year").value}</h3></div><span class="badge">${b.count.toLocaleString("es-MX")} registros</span></div>
        <div class="mini-kpi-grid">
          <div><span>Canje</span><strong>${money.format(b.canje)}</strong><small>${(b.canje/t*100).toFixed(2)}%</small></div>
          <div><span>Abordo</span><strong>${money.format(b.abordo)}</strong><small>${(b.abordo/t*100).toFixed(2)}%</small></div>
          <div><span>Prepago</span><strong>${money.format(b.prepago)}</strong><small>${(b.prepago/t*100).toFixed(2)}%</small></div>
          <div class="mini-total"><span>Total</span><strong>${money.format(b.total)}</strong><small>${(b.total/(state.summary.total||1)*100).toFixed(2)}% del general</small></div>
        </div>
      </article>`;
    }).join("");
  }

  function renderPreview(){
    const headers=state.headers.slice(0,20);
    $("previewHead").innerHTML="<tr>"+headers.map(h=>`<th>${escapeHtml(h)}</th>`).join("")+"</tr>";
    $("previewBody").innerHTML=state.rows.slice(0,100).map(r=>"<tr>"+headers.map(h=>`<td>${escapeHtml(formatCell(r[h]))}</td>`).join("")+"</tr>").join("");
    $("previewCount").textContent=`Mostrando ${Math.min(100,state.rows.length)} de ${state.rows.length}`;
  }

  function renderCharts(){
    state.charts.forEach(c=>c.destroy()); state.charts=[];
    const labels=["Canje","Abordo","Prepago"], values=[state.summary.canje,state.summary.abordo,state.summary.prepago];
    state.charts.push(new Chart($("barChart"),{type:"bar",data:{labels,datasets:[{label:"Importe",data:values,backgroundColor:["#2563eb","#06b6d4","#0f9f6e"],borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},title:{display:true,text:"Ingresos generales por concepto"}},scales:{y:{ticks:{callback:v=>money.format(v)}}}}}));
    state.charts.push(new Chart($("pieChart"),{type:"doughnut",data:{labels:state.brands.map(b=>b.name),datasets:[{data:state.brands.map(b=>b.total),backgroundColor:["#2563eb","#06b6d4","#0f9f6e","#f59e0b","#8b5cf6","#ef4444"],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{title:{display:true,text:"Participación por marca"},legend:{position:"bottom"}}}}));
  }

  $("exportExcelBtn").onclick=()=>{
    const wb=XLSX.utils.book_new();
    const month=$("month").value, year=$("year").value, s=state.summary, total=s.total||1;
    const general=[[`INGRESOS GENERALES ${month} ${year}`],[],["Concepto","Importe","Participación"],["Canje",s.canje,s.canje/total],["Abordo",s.abordo,s.abordo/total],["Prepago",s.prepago,s.prepago/total],["TOTAL",s.total,1],[],["Marca","Canje","Abordo","Prepago","Total","Registros","Participación"]];
    state.brands.forEach(b=>general.push([b.name,b.canje,b.abordo,b.prepago,b.total,b.count,b.total/total]));
    const ws=XLSX.utils.aoa_to_sheet(general); ws["!cols"]=[{wch:25},{wch:18},{wch:18},{wch:18},{wch:18},{wch:13},{wch:16}];
    XLSX.utils.book_append_sheet(wb,ws,"GENERAL");
    state.brands.forEach(b=>{
      const t=b.total||1;
      const rows=[[`INGRESOS ${b.name} ${month} ${year}`],[],["Concepto","Importe","Participación"],["Canje",b.canje,b.canje/t],["Abordo",b.abordo,b.abordo/t],["Prepago",b.prepago,b.prepago/t],["TOTAL",b.total,1],[],["REGISTROS"]];
      const detail=XLSX.utils.json_to_sheet(b.rows,{origin:"A10"});
      const sheet=XLSX.utils.aoa_to_sheet(rows); Object.assign(sheet,detail); sheet["!ref"]=XLSX.utils.encode_range({s:{r:0,c:0},e:XLSX.utils.decode_range(detail["!ref"]).e});
      XLSX.utils.book_append_sheet(wb,sheet,safeSheetName(b.name));
    });
    XLSX.writeFile(wb,`INGRESOS_GENERAL_Y_MARCAS_${month}_${year}.xlsx`);
  };

  $("printBtn").onclick=()=>window.print();
  $("loadApiBtn").onclick=async()=>{
    try{
      ensureApi(); const url=new URL(apiUrl()); url.searchParams.set("accion","todasLasHojas");
      const res=await fetch(url), json=await res.json(); if(json.error) throw new Error(json.mensaje);
      const wb=XLSX.utils.book_new();
      (json.hojas||[]).forEach(h=>XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(h.datos),safeSheetName(h.nombre)));
      state.workbook=wb; $("processBtn").disabled=false; processWorkbook(true);
      $("fileStatus").className="status ok"; $("fileStatus").textContent="Google Sheets"; toast("Todas las marcas cargadas");
    }catch(err){setStatusError(err.message);}
  };
  $("saveApiBtn").onclick=()=>toast("El Excel ya contiene el reporte general y los individuales.");

  function ensureApi(){if(!apiUrl()||apiUrl().includes("PEGA_AQUI")) throw new Error("Configura la URL del Apps Script en config.js.");}
  function safeSheetName(v){return String(v||"MARCA").replace(/[\\/?*\[\]:]/g," ").slice(0,31)||"MARCA";}
  function setStatusError(msg){$("fileStatus").className="status error";$("fileStatus").textContent="Error";toast(msg);console.error(msg);}
  function formatCell(v){if(v instanceof Date)return v.toLocaleDateString("es-MX");return String(v??"");}
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
})();

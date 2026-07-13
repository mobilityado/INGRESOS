(() => {
  const $ = id => document.getElementById(id);
  const money = new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
  const state = { workbook:null, rows:[], headers:[], summary:null, brandSummary:[], charts:[] };

  const normalize = v => String(v ?? "").replace(/\s+/g," ").trim().toLowerCase();
  const number = v => {
    if(typeof v === "number") return Number.isFinite(v) ? v : 0;
    const n = Number(String(v ?? "").replace(/[$,\s]/g,""));
    return Number.isFinite(n) ? n : 0;
  };
  const toast = msg => { $("toast").textContent=msg; $("toast").classList.add("show"); setTimeout(()=>$("toast").classList.remove("show"),2600); };
  const apiUrl = () => (window.APP_CONFIG?.API_URL || "").trim();

  $("themeBtn").onclick = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("ingresos-theme",document.body.classList.contains("dark")?"dark":"light");
  };
  if(localStorage.getItem("ingresos-theme")==="dark") document.body.classList.add("dark");

  $("fileInput").addEventListener("change", async e => {
    const file=e.target.files[0]; if(!file) return;
    try{
      const buffer=await file.arrayBuffer();
      state.workbook=XLSX.read(buffer,{type:"array",cellDates:true});
      $("sheetSelect").innerHTML=state.workbook.SheetNames.map(n=>`<option>${n}</option>`).join("");
      $("sheetSelect").disabled=false;
      const preferred=state.workbook.SheetNames.find(n=>normalize(n)===normalize(window.APP_CONFIG?.DEFAULT_SHEET));
      if(preferred) $("sheetSelect").value=preferred;
      $("processBtn").disabled=false;
      $("fileStatus").className="status ok"; $("fileStatus").textContent=file.name;
      toast("Archivo cargado correctamente");
    }catch(err){ setStatusError(err.message); }
  });

  $("sheetSelect").addEventListener("change",()=>{ if(state.workbook) processWorkbook(false); });
  $("processBtn").onclick=()=>processWorkbook(true);

  function processWorkbook(scroll){
    try{
      const ws=state.workbook.Sheets[$("sheetSelect").value];
      const matrix=XLSX.utils.sheet_to_json(ws,{header:1,defval:"",raw:true});
      const headerIndex=matrix.findIndex(row=>{
        const normalized=row.map(normalize);
        return normalized.includes("vta man") && normalized.includes("vta abor") && normalized.includes("vta prepago");
      });
      if(headerIndex<0) throw new Error("No se encontró la fila de encabezados Vta Man, Vta Abor y Vta Prepago.");
      const headers=matrix[headerIndex].map(v=>String(v??"").trim());
      const rows=matrix.slice(headerIndex+1)
        .filter(row=>row.some(v=>String(v??"").trim()!==""))
        .map(row=>Object.fromEntries(headers.map((h,i)=>[h||`Columna ${i+1}`,row[i]??""])));
      if(!rows.length) throw new Error("La hoja seleccionada no contiene registros.");
      processRows(rows,scroll);
    }catch(err){ setStatusError(err.message); }
  }

  function processRows(rows,scroll=true){
    const headerMap={};
    Object.keys(rows[0]).forEach(h=>headerMap[normalize(h)]=h);
    const findHeader = requested => headerMap[normalize(requested)] || Object.keys(rows[0]).find(h=>normalize(h).includes(normalize(requested)));
    const canjeH=findHeader($("canjeCol").value);
    const abordoH=findHeader($("abordoCol").value);
    const prepagoH=findHeader($("prepagoCol").value);
    const marcaH=findHeader("Marca");
    if(!canjeH||!abordoH||!prepagoH) throw new Error("No se encontraron las columnas de Canje, Abordo o Prepago.");

    const mode=$("brandMode").value;
    const filtered=rows.filter(r=>{
      if(mode==="all"||!marcaH) return true;
      const has=String(r[marcaH]??"").trim()!=="";
      return mode==="nonempty"?has:!has;
    });
    const summary={
      canje:filtered.reduce((a,r)=>a+number(r[canjeH]),0),
      abordo:filtered.reduce((a,r)=>a+number(r[abordoH]),0),
      prepago:filtered.reduce((a,r)=>a+number(r[prepagoH]),0),
      count:filtered.length
    };
    summary.total=summary.canje+summary.abordo+summary.prepago;

    const groups=new Map();
    rows.forEach(r=>{
      const brand=marcaH ? (String(r[marcaH]??"").trim() || "SIN MARCA") : "SIN MARCA";
      if(!groups.has(brand)) groups.set(brand,{marca:brand,canje:0,abordo:0,prepago:0,count:0,total:0});
      const g=groups.get(brand);
      g.canje+=number(r[canjeH]); g.abordo+=number(r[abordoH]); g.prepago+=number(r[prepagoH]); g.count++;
      g.total=g.canje+g.abordo+g.prepago;
    });
    state.brandSummary=[...groups.values()].sort((a,b)=>b.total-a.total);
    state.rows=filtered; state.headers=Object.keys(rows[0]); state.summary=summary;
    render();
    if(scroll) $("dashboard").scrollIntoView({behavior:"smooth"});
  }

  function render(){
    const s=state.summary, total=s.total||1;
    const title=`INGRESOS ${$("unit").value} ${$("month").value} ${$("year").value}`;
    $("reportTitle").textContent=title;
    $("kpiCanje").textContent=money.format(s.canje);
    $("kpiAbordo").textContent=money.format(s.abordo);
    $("kpiPrepago").textContent=money.format(s.prepago);
    $("kpiTotal").textContent=money.format(s.total);
    $("pctCanje").textContent=(s.canje/total*100).toFixed(2)+"%";
    $("pctAbordo").textContent=(s.abordo/total*100).toFixed(2)+"%";
    $("pctPrepago").textContent=(s.prepago/total*100).toFixed(2)+"%";
    $("rowCount").textContent=s.count.toLocaleString("es-MX")+" registros";
    $("tableTotal").textContent=money.format(s.total);
    $("processedAt").textContent="Procesado: "+new Date().toLocaleString("es-MX");
    $("summaryBody").innerHTML=[
      ["Canje",s.canje],["Abordo",s.abordo],["Prepago",s.prepago]
    ].map(([n,v])=>`<tr><td>${n}</td><td>${money.format(v)}</td><td>${(v/total*100).toFixed(2)}%</td></tr>`).join("");
    renderPreview(); renderBrandSummary(); renderCharts();
    $("dashboard").classList.remove("hidden");
  }


  function renderBrandSummary(){
    const body=$("brandBody");
    if(!body) return;
    const grand=state.brandSummary.reduce((a,b)=>a+b.total,0)||1;
    body.innerHTML=state.brandSummary.map(g=>`<tr><td>${escapeHtml(g.marca)}</td><td>${money.format(g.canje)}</td><td>${money.format(g.abordo)}</td><td>${money.format(g.prepago)}</td><td><strong>${money.format(g.total)}</strong></td><td>${g.count.toLocaleString("es-MX")}</td><td>${(g.total/grand*100).toFixed(2)}%</td></tr>`).join("");
    $("brandCount").textContent=`${state.brandSummary.length} marcas detectadas`;
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
    state.charts.push(new Chart($("barChart"),{type:"bar",data:{labels,datasets:[{label:"Importe",data:values,backgroundColor:["#2563eb","#06b6d4","#0f9f6e"],borderRadius:8}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},title:{display:true,text:"Ingresos por concepto"}},scales:{y:{ticks:{callback:v=>money.format(v)}}}}}));
    state.charts.push(new Chart($("pieChart"),{type:"doughnut",data:{labels,datasets:[{data:values,backgroundColor:["#2563eb","#06b6d4","#0f9f6e"],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{title:{display:true,text:"Participación porcentual"},legend:{position:"bottom"}}}}));
  }

  $("exportExcelBtn").onclick=()=>{
    const s=state.summary, total=s.total||1;
    const title=`INGRESOS ${$("unit").value} ${$("month").value} ${$("year").value}`;
    const summaryRows=[
      [title],[],
      ["Concepto","Importe","Participación"],
      ["Canje",s.canje,s.canje/total],
      ["Abordo",s.abordo,s.abordo/total],
      ["Prepago",s.prepago,s.prepago/total],
      ["TOTAL",s.total,1]
    ];
    const wb=XLSX.utils.book_new();
    const ws=XLSX.utils.aoa_to_sheet(summaryRows);
    ws["!cols"]=[{wch:22},{wch:18},{wch:16}];
    ["B4","B5","B6","B7"].forEach(c=>ws[c]&&(ws[c].z='"$"#,##0.00'));
    ["C4","C5","C6","C7"].forEach(c=>ws[c]&&(ws[c].z="0.00%"));
    XLSX.utils.book_append_sheet(wb,ws,"Resumen");
    const marcas=state.brandSummary.map(g=>({Marca:g.marca,Canje:g.canje,Abordo:g.abordo,Prepago:g.prepago,Total:g.total,Registros:g.count}));
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(marcas),"Resumen por marca");
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(state.rows),"Registros procesados");
    XLSX.writeFile(wb,`${title.replace(/\s+/g,"_")}.xlsx`);
  };

  $("printBtn").onclick=()=>window.print();

  $("loadApiBtn").onclick=async()=>{
    try{
      ensureApi();
      const url=new URL(apiUrl());
      url.searchParams.set("accion","datos");
      url.searchParams.set("hoja",window.APP_CONFIG?.DEFAULT_SHEET||"TRTVB");
      const res=await fetch(url); const json=await res.json();
      if(json.error) throw new Error(json.mensaje||"No se pudieron cargar los datos.");
      if(!Array.isArray(json.datos)||!json.datos.length) throw new Error("La hoja no contiene datos.");
      processRows(json.datos,true);
      $("fileStatus").className="status ok"; $("fileStatus").textContent="Google Sheets";
      toast("Datos cargados desde Google Sheets");
    }catch(err){ setStatusError(err.message); }
  };

  $("saveApiBtn").onclick=async()=>{
    try{
      ensureApi();
      const payload={
        accion:"guardarResumen",
        mes:$("month").value, anio:Number($("year").value), unidad:$("unit").value,
        canje:state.summary.canje, abordo:state.summary.abordo,
        prepago:state.summary.prepago, total:state.summary.total,
        registros:state.summary.count
      };
      const res=await fetch(apiUrl(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
      const json=await res.json(); if(json.error) throw new Error(json.mensaje);
      toast("Concentrado guardado en Google Sheets");
    }catch(err){ setStatusError(err.message); }
  };

  function ensureApi(){
    if(!apiUrl()||apiUrl().includes("PEGA_AQUI")) throw new Error("Configura la URL del Apps Script en config.js.");
  }
  function setStatusError(msg){ $("fileStatus").className="status error"; $("fileStatus").textContent="Error"; toast(msg); console.error(msg); }
  function formatCell(v){ if(v instanceof Date) return v.toLocaleDateString("es-MX"); return String(v??""); }
  function escapeHtml(v){ return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
})();

(() => {
  const BRANDS = ["TRT","TRTVB","AAO","AAOVB"];
  const $ = id => document.getElementById(id);
  const money = new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
  const state={workbook:null,brands:[],summary:null,charts:[]};
  const normalize=v=>String(v??"").replace(/[^a-z0-9]/gi,"").toUpperCase();
  const number=v=>{if(typeof v==="number")return Number.isFinite(v)?v:0;const n=Number(String(v??"").replace(/[$,\s]/g,""));return Number.isFinite(n)?n:0};
  const toast=msg=>{$("toast").textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),3000)};
  const apiUrl=()=>String(window.APP_CONFIG?.API_URL||"").trim();

  if(localStorage.getItem("ingresos-theme")==="dark")document.body.classList.add("dark");
  $("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("ingresos-theme",document.body.classList.contains("dark")?"dark":"light")};
  $("month").onchange=()=>state.brands.length&&render();
  $("year").oninput=()=>state.brands.length&&render();

  $("fileInput").addEventListener("change",async e=>{
    const file=e.target.files[0]; if(!file)return;
    try{
      state.workbook=XLSX.read(await file.arrayBuffer(),{type:"array",cellDates:true});
      updateBrandChecks();
      $("fileStatus").className="status ok";$("fileStatus").textContent=file.name;
      $("processBtn").disabled=false;
      processWorkbook(true);
    }catch(err){setError(err.message)}
  });
  $("processBtn").onclick=()=>processWorkbook(true);

  function findSheetName(brand){return state.workbook.SheetNames.find(n=>normalize(n)===normalize(brand));}
  function updateBrandChecks(){
    BRANDS.forEach(brand=>{
      const chip=document.querySelector(`[data-brand="${brand}"]`);
      const found=!!findSheetName(brand); chip.className=`brand-chip ${found?'found':'missing'}`;chip.title=found?'Pestaña encontrada':'Pestaña no encontrada';
    });
  }
  function parseSheet(sheetName){
    const matrix=XLSX.utils.sheet_to_json(state.workbook.Sheets[sheetName],{header:1,defval:"",raw:true});
    const wanted=[$("canjeCol").value,$("abordoCol").value,$("prepagoCol").value].map(normalize);
    const hi=matrix.findIndex(r=>wanted.every(w=>r.map(normalize).includes(w)));
    if(hi<0)throw new Error(`La pestaña ${sheetName} no contiene las columnas esperadas.`);
    const headers=matrix[hi].map((v,i)=>String(v??"").trim()||`Columna ${i+1}`);
    const rows=matrix.slice(hi+1).filter(r=>r.some(v=>String(v??"").trim()!=="")).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??""])));
    const map={};headers.forEach(h=>map[normalize(h)]=h);
    const ch=map[normalize($("canjeCol").value)],ah=map[normalize($("abordoCol").value)],ph=map[normalize($("prepagoCol").value)];
    const s={name:normalize(sheetName),sheetName,headers,rows,canje:0,abordo:0,prepago:0,count:rows.length};
    rows.forEach(r=>{s.canje+=number(r[ch]);s.abordo+=number(r[ah]);s.prepago+=number(r[ph])});s.total=s.canje+s.abordo+s.prepago;return s;
  }
  function processWorkbook(scroll){
    try{
      if(!state.workbook)throw new Error("Selecciona primero el libro Excel.");
      const missing=BRANDS.filter(b=>!findSheetName(b));
      if(missing.length)throw new Error(`Faltan estas pestañas: ${missing.join(', ')}. El libro debe contener las cuatro.`);
      state.brands=BRANDS.map(b=>parseSheet(findSheetName(b)));
      state.summary=state.brands.reduce((a,b)=>({canje:a.canje+b.canje,abordo:a.abordo+b.abordo,prepago:a.prepago+b.prepago,total:a.total+b.total,count:a.count+b.count}),{canje:0,abordo:0,prepago:0,total:0,count:0});
      render();toast("Reporte general y cuatro reportes individuales generados");if(scroll)$("dashboard").scrollIntoView({behavior:"smooth"});
    }catch(err){setError(err.message)}
  }
  function pct(v,t){return `${(v/(t||1)*100).toFixed(2)}%`}
  function render(){
    const s=state.summary,month=$("month").value,year=$("year").value;
    $("reportTitle").textContent=`INGRESOS GENERALES ${month} ${year}`;
    $("kpiCanje").textContent=money.format(s.canje);$("kpiAbordo").textContent=money.format(s.abordo);$("kpiPrepago").textContent=money.format(s.prepago);$("kpiTotal").textContent=money.format(s.total);
    $("pctCanje").textContent=pct(s.canje,s.total);$("pctAbordo").textContent=pct(s.abordo,s.total);$("pctPrepago").textContent=pct(s.prepago,s.total);$("rowCount").textContent=`${s.count.toLocaleString('es-MX')} registros`;
    $("processedAt").textContent=new Date().toLocaleString("es-MX");
    $("brandBody").innerHTML=state.brands.map(b=>`<tr><td><span class="brand-label">${b.name}</span></td><td>${money.format(b.canje)}</td><td>${money.format(b.abordo)}</td><td>${money.format(b.prepago)}</td><td><strong>${money.format(b.total)}</strong></td><td>${b.count.toLocaleString('es-MX')}</td><td>${pct(b.total,s.total)}</td></tr>`).join("");
    $("footCanje").textContent=money.format(s.canje);$("footAbordo").textContent=money.format(s.abordo);$("footPrepago").textContent=money.format(s.prepago);$("footTotal").textContent=money.format(s.total);$("footRows").textContent=s.count.toLocaleString('es-MX');
    renderIndividualReports(month,year);renderCharts();$("dashboard").classList.remove("hidden");
  }
  function renderIndividualReports(month,year){
    $("individualReports").innerHTML=state.brands.map((b,i)=>`<article class="brand-report panel">
      <div class="brand-report-head"><div><span class="report-number">0${i+1}</span><p class="eyebrow blue">ANÁLISIS INDIVIDUAL</p><h2>INGRESOS ${b.name} ${month} ${year}</h2></div><span class="brand-total">${money.format(b.total)}</span></div>
      <div class="mini-kpi-grid">
        <div><span>Canje</span><strong>${money.format(b.canje)}</strong><small>${pct(b.canje,b.total)}</small></div>
        <div><span>Abordo</span><strong>${money.format(b.abordo)}</strong><small>${pct(b.abordo,b.total)}</small></div>
        <div><span>Prepago</span><strong>${money.format(b.prepago)}</strong><small>${pct(b.prepago,b.total)}</small></div>
        <div class="mini-total"><span>Registros</span><strong>${b.count.toLocaleString('es-MX')}</strong><small>${pct(b.total,state.summary.total)} del general</small></div>
      </div>
      <div class="brand-chart-grid"><div class="chart-box"><canvas id="bar-${b.name}"></canvas></div><div class="chart-box"><canvas id="pie-${b.name}"></canvas></div></div>
    </article>`).join("");
  }
  function chartOptions(title){return{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom'},title:{display:false,text:title}},scales:{y:{beginAtZero:true,ticks:{callback:v=>money.format(v)}}}}}
  function renderCharts(){
    state.charts.forEach(c=>c.destroy());state.charts=[];
    state.charts.push(new Chart($("brandCompareChart"),{type:'bar',data:{labels:BRANDS,datasets:[{label:'Canje',data:state.brands.map(b=>b.canje)},{label:'Abordo',data:state.brands.map(b=>b.abordo)},{label:'Prepago',data:state.brands.map(b=>b.prepago)}]},options:chartOptions()}));
    state.charts.push(new Chart($("brandShareChart"),{type:'doughnut',data:{labels:BRANDS,datasets:[{data:state.brands.map(b=>b.total)}]},options:{responsive:true,maintainAspectRatio:false,cutout:'64%',plugins:{legend:{position:'bottom'}}}}));
    state.brands.forEach(b=>{
      const vals=[b.canje,b.abordo,b.prepago],labels=['Canje','Abordo','Prepago'];
      state.charts.push(new Chart($(`bar-${b.name}`),{type:'bar',data:{labels,datasets:[{label:'Importe',data:vals}]},options:{...chartOptions(),plugins:{legend:{display:false}}}}));
      state.charts.push(new Chart($(`pie-${b.name}`),{type:'doughnut',data:{labels,datasets:[{data:vals}]},options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'bottom'}}}}));
    });
  }
  $("exportExcelBtn").onclick=()=>{
    const wb=XLSX.utils.book_new(),m=$("month").value,y=$("year").value,s=state.summary;
    const general=[[`INGRESOS GENERALES ${m} ${y}`],[],['MARCA','CANJE','ABORDO','PREPAGO','TOTAL','REGISTROS','PARTICIPACIÓN'],...state.brands.map(b=>[b.name,b.canje,b.abordo,b.prepago,b.total,b.count,b.total/(s.total||1)]),['GENERAL',s.canje,s.abordo,s.prepago,s.total,s.count,1]];
    const ws=XLSX.utils.aoa_to_sheet(general);ws['!cols']=[{wch:18},{wch:18},{wch:18},{wch:18},{wch:18},{wch:14},{wch:16}];XLSX.utils.book_append_sheet(wb,ws,'GENERAL');
    state.brands.forEach(b=>{const rows=[[`INGRESOS ${b.name} ${m} ${y}`],[],['CONCEPTO','IMPORTE','PARTICIPACIÓN'],['Canje',b.canje,b.canje/(b.total||1)],['Abordo',b.abordo,b.abordo/(b.total||1)],['Prepago',b.prepago,b.prepago/(b.total||1)],['TOTAL',b.total,1],[],['DETALLE DE REGISTROS']];const sh=XLSX.utils.aoa_to_sheet(rows);XLSX.utils.sheet_add_json(sh,b.rows,{origin:'A10'});XLSX.utils.book_append_sheet(wb,sh,b.name)});
    XLSX.writeFile(wb,`INGRESOS_4_MARCAS_${m}_${y}.xlsx`);
  };
  $("printBtn").onclick=()=>window.print();
  $("loadApiBtn").onclick=async()=>{try{if(!apiUrl()||apiUrl().includes('PEGA_AQUI'))throw new Error('Configura la URL del Apps Script en config.js.');const u=new URL(apiUrl());u.searchParams.set('accion','todasLasHojas');const j=await(await fetch(u)).json();if(j.error)throw new Error(j.mensaje);const wb=XLSX.utils.book_new();(j.hojas||[]).forEach(h=>XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(h.datos),h.nombre));state.workbook=wb;updateBrandChecks();$("processBtn").disabled=false;processWorkbook(true)}catch(e){setError(e.message)}};
  function setError(msg){$("fileStatus").className='status error';$("fileStatus").textContent='Revisar archivo';toast(msg);console.error(msg)}
})();

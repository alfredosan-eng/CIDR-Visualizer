const $=id=>document.getElementById(id);
const state={family:'ipv4',prefix:24};
const views={learn:$('learnView'),explore:$('exploreView'),convert:$('convertView'),subnet:$('subnetView')};

document.querySelectorAll('.navBtn').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.navBtn').forEach(b=>b.classList.toggle('active',b===btn));
  Object.values(views).forEach(v=>v.classList.remove('activeView'));
  views[btn.dataset.view].classList.add('activeView');
});

function ipv4ToBits(ip){
  const a=ip.trim().split('.').map(Number);
  if(a.length!==4||a.some(x=>!Number.isInteger(x)||x<0||x>255))throw Error('IPv4 inválida');
  return a.map(n=>n.toString(2).padStart(8,'0')).join('');
}
function prefixToMask(p){
  const bits='1'.repeat(p)+'0'.repeat(32-p),a=[];
  for(let i=0;i<32;i+=8)a.push(parseInt(bits.slice(i,i+8),2));
  return a.join('.');
}
function bitsToMaskBinary(p){const bits='1'.repeat(p)+'0'.repeat(32-p);return [0,8,16,24].map(i=>bits.slice(i,i+8)).join('.');}
function normalizeIPv4Network(ip,p){const n=ipv4ToBits(ip).slice(0,p)+'0'.repeat(32-p);return [0,8,16,24].map(i=>parseInt(n.slice(i,i+8),2)).join('.');}
function broadcastIPv4(ip,p){const n=ipv4ToBits(ip).slice(0,p)+'1'.repeat(32-p);return [0,8,16,24].map(i=>parseInt(n.slice(i,i+8),2)).join('.');}
function ipInt(ip){return ip.split('.').map(Number).reduce((a,x)=>a*256+x,0)}
function intIp(n){return [24,16,8,0].map(s=>Math.floor(n/2**s)%256).join('.')}
function bigintToIp(n){return [24n,16n,8n,0n].map(s=>Number((n>>s)&255n)).join('.')}

function ipv6Groups(ip){
  let raw=ip.trim().toLowerCase();
  if(!raw)throw Error('IPv6 inválida');
  if(raw.includes('.'))throw Error('IPv4 embebida no soportada en esta vista');
  if(raw.includes('::')){
    const parts=raw.split('::');
    if(parts.length!==2)throw Error('IPv6 inválida');
    const left=parts[0]?parts[0].split(':'):[], right=parts[1]?parts[1].split(':'):[];
    const missing=8-left.length-right.length;
    if(missing<1)throw Error('IPv6 inválida');
    raw=[...left,...Array(missing).fill('0'),...right].join(':');
  }
  const g=raw.split(':');
  if(g.length!==8||g.some(x=>!/^[0-9a-f]{1,4}$/.test(x)))throw Error('IPv6 inválida');
  return g.map(x=>x.padStart(4,'0'));
}
function ipv6Bits(ip){return ipv6Groups(ip).map(x=>parseInt(x,16).toString(2).padStart(16,'0')).join('')}
function ipv6Expanded(ip){return ipv6Groups(ip).join(':')}
function ipv6Compressed(ip){
  const g=ipv6Groups(ip);
  let bestStart=-1,bestLen=0;
  for(let i=0;i<8;){
    if(g[i]!=='0000'){i++;continue}
    let j=i;while(j<8&&g[j]==='0000')j++;
    if(j-i>bestLen){bestStart=i;bestLen=j-i}
    i=j;
  }
  if(bestLen<2)return g.map(x=>x.replace(/^0+/,'')||'0').join(':');
  const left=g.slice(0,bestStart).map(x=>x.replace(/^0+/,'')||'0').join(':');
  const right=g.slice(bestStart+bestLen).map(x=>x.replace(/^0+/,'')||'0').join(':');
  return `${left}::${right}`.replace(/^:::$/,'::').replace(/^:([^:])/, '$1').replace(/([^:]):$/,'$1');
}
function ipv6Network(ip,p){
  const bits=ipv6Bits(ip).slice(0,p)+'0'.repeat(128-p);
  const groups=[];for(let i=0;i<128;i+=16)groups.push(parseInt(bits.slice(i,i+16),2).toString(16).padStart(4,'0'));
  return ipv6Compressed(groups.join(':'));
}
function ipv6NetworkLast(ip,p){
  const bits=ipv6Bits(ip).slice(0,p)+'1'.repeat(128-p);
  const groups=[];for(let i=0;i<128;i+=16)groups.push(parseInt(bits.slice(i,i+16),2).toString(16).padStart(4,'0'));
  return ipv6Compressed(groups.join(':'));
}
function ipv6PrefixBinary(p){const b='1'.repeat(p)+'0'.repeat(128-p);return b.match(/.{1,16}/g).join(':')}
function ipv6MaskHex(p){const b='1'.repeat(p)+'0'.repeat(128-p);return b.match(/.{1,16}/g).map(x=>parseInt(x,2).toString(16).padStart(4,'0')).join(':')}
function rangePower(bits){if(bits<=53)return (2**bits).toLocaleString();return `2^${bits}`}

function updateLearnBits(){
  const ip='192.168.1.77',bits=ipv4ToBits(ip),p=27;
  $('learnBits').innerHTML=bits.split('').map((b,i)=>`<div class="learnBit ${i<p?'net':'host'}">${b}</div>`).join('');
  $('learnPrefixLabel').textContent=`${p} BITS — PREFIJO / RED`;
}

function updateExplore(){
  $('prefixText').textContent='/'+state.prefix;
  $('prefixSlider').value=state.prefix;
  $('sliderCenter').textContent='/'+state.prefix;
  try{
    const totalBits=state.family==='ipv4'?32:128;
    const bits=state.family==='ipv4'?ipv4ToBits($('address').value):ipv6Bits($('address').value);
    const rest=totalBits-state.prefix;
    const total=state.family==='ipv4'?2**rest:rangePower(rest);
    $('metrics').innerHTML=[
      ['Prefijo','/'+state.prefix],
      ['Bits de prefijo',state.prefix],
      [state.family==='ipv4'?'Bits de host':'Bits restantes',rest],
      ['Direcciones posibles',typeof total==='number'?total.toLocaleString():total]
    ].map(x=>`<div class="metric"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
    let map='';
    const group=state.family==='ipv4'?8:16;
    for(let i=0;i<totalBits;i++){
      if(i&&i%group===0)map+='<div class="octetGap"></div>';
      map+=`<div class="bit ${i<state.prefix?'net':'host'}">${bits[i]}</div>`;
    }
    $('bitMap').innerHTML=`<div class="bitGroups">${map}</div>`;
    $('frontierCaption').textContent=`${state.prefix} bloqueados · ${rest} restantes`;
    $('boundaryArrow').style.background=`linear-gradient(90deg,#4285f4 0 ${state.prefix/totalBits*100}%,#fbbc04 ${state.prefix/totalBits*100}% 100%)`;
    $('maskInfo').innerHTML=state.family==='ipv4'
      ?`<div class="infoBlock"><p><b>/${state.prefix}</b> fija los primeros ${state.prefix} bits.</p><p>Máscara decimal: <b>${prefixToMask(state.prefix)}</b></p><p>Máscara binaria: <b class="binaryLine">${bitsToMaskBinary(state.prefix)}</b></p></div>`
      :`<div class="infoBlock"><p><b>/${state.prefix}</b> fija los primeros ${state.prefix} de 128 bits.</p><p>Máscara en hexadecimal: <b class="binaryLine">${ipv6MaskHex(state.prefix)}</b></p><p>Máscara binaria agrupada: <b class="binaryLine">${ipv6PrefixBinary(state.prefix)}</b></p></div>`;
    $('whyInfo').innerHTML=state.family==='ipv4'
      ?`<div class="infoBlock"><p><b>Sube /${state.prefix-1} → /${state.prefix}</b>: un bit cambia de la parte host a la parte de prefijo.</p><p>Con <b>${rest}</b> bits restantes hay <b>2^${rest}</b> direcciones por bloque.</p><p>Por eso cada salto de +1 en el prefijo divide el bloque IPv4 por 2.</p></div>`
      :`<div class="infoBlock"><p><b>Sube /${state.prefix-1} → /${state.prefix}</b>: un bit pasa de la parte restante a la parte de prefijo.</p><p>Con ${rest} bits restantes el espacio es <b>2^${rest}</b>; no aplicamos “−2” ni Broadcast como en el cálculo tradicional de IPv4.</p></div>`;
    if(state.family==='ipv6'){
      $('ipv6Extra').classList.add('show');
      const exp=ipv6Expanded($('address').value),net=ipv6Network($('address').value,state.prefix),last=ipv6NetworkLast($('address').value,state.prefix);
      $('ipv6Extra').innerHTML=`<h2>IPv6 · lectura de grupos</h2><p><b>Expandida:</b> <span class="binaryLine">${exp}</span></p><div class="ipv6Groups">${ipv6Groups($('address').value).map((g,i)=>`<div class="ipv6Group"><b>${g}</b><span>grupo ${i+1} · ${parseInt(g,16)} decimal</span></div>`).join('')}</div><div class="twoCol" style="margin-top:12px"><div><b>Prefijo de red</b><p class="binaryLine">${net}/${state.prefix}</p></div><div><b>Última dirección del prefijo</b><p class="binaryLine">${last}</p></div></div><div class="alert neutral">IPv6 no usa broadcast; el cálculo muestra el comienzo y el final del prefijo como límites del espacio de direcciones.</div>`;
    }else $('ipv6Extra').classList.remove('show');
  }catch(e){
    $('metrics').innerHTML='<div class="metric error">Dirección inválida</div>';
    $('bitMap').innerHTML='';$('maskInfo').innerHTML='';$('whyInfo').innerHTML='';$('ipv6Extra').classList.remove('show');
  }
}

$('ipv4Btn').onclick=()=>{state.family='ipv4';state.prefix=24;$('address').value='192.168.1.0';$('prefixSlider').max=32;$('prefixSlider').value=24;$('sliderMax').textContent='/32';$('ipv4Btn').classList.add('active');$('ipv6Btn').classList.remove('active');updateExplore()};
$('ipv6Btn').onclick=()=>{state.family='ipv6';state.prefix=64;$('address').value='2001:db8:1234:5678::1';$('prefixSlider').max=128;$('prefixSlider').value=64;$('sliderMax').textContent='/128';$('ipv6Btn').classList.add('active');$('ipv4Btn').classList.remove('active');updateExplore()};
$('minus').onclick=()=>{state.prefix=Math.max(0,state.prefix-1);updateExplore()};
$('plus').onclick=()=>{state.prefix=Math.min(state.family==='ipv4'?32:128,state.prefix+1);updateExplore()};
$('prefixSlider').oninput=e=>{state.prefix=+e.target.value;updateExplore()};
$('address').oninput=updateExplore;

function renderDecimal(){let n=Number($('decInput').value);if(!Number.isInteger(n)||n<0||n>255)n=0;const b=n.toString(2).padStart(8,'0');$('decBits').innerHTML='<div class="octetBits">'+[128,64,32,16,8,4,2,1].map((w,i)=>`<div class="octetBit ${b[i]==='1'?'on':''}"><b>${b[i]}</b><small>${w}</small></div>`).join('')+'</div><div class="binaryLine">'+b+'</div>';const used=[128,64,32,16,8,4,2,1].filter((_,i)=>b[i]==='1');$('decExplain').innerHTML=`<p>${used.length?used.join(' + ')+' = '+n:'0 = 0'}</p>`}
function renderBinary(){let b=$('binInput').value.replace(/[^01]/g,'').slice(0,8);$('binInput').value=b;if(!b){$('binExplain').innerHTML='';return}b=b.padStart(8,'0');const terms=[128,64,32,16,8,4,2,1].map((w,i)=>b[i]==='1'?w:0).filter(Boolean);$('binExplain').innerHTML=`<div class="binaryLine">${b}</div><p>${terms.join(' + ')||'0'} = <b>${parseInt(b,2)}</b></p>`}
function renderHex(){let h=$('hexInput').value.replace(/[^0-9a-fA-F]/g,'').slice(0,4).toUpperCase();$('hexInput').value=h;if(!h){$('hexBits').innerHTML='';$('hexExplain').innerHTML='';return}const n=parseInt(h,16),b=n.toString(2).padStart(16,'0');$('hexBits').innerHTML=`<div class="binaryLine">${b}</div>`;$('hexExplain').innerHTML=`<p><b>0x${h}</b> = ${n} decimal · cada dígito hexadecimal representa 4 bits.</p>`}
$('decInput').oninput=renderDecimal;$('binInput').oninput=renderBinary;$('hexInput').oninput=renderHex;

function renderIPv6Convert(){try{const raw=$('ipv6Convert').value,exp=ipv6Expanded(raw),comp=ipv6Compressed(raw);$('ipv6ConvertResult').innerHTML=`<div><b>Expandida</b><span>${exp}</span></div><div><b>Comprimida</b><span>${comp}</span></div>`}catch(e){$('ipv6ConvertResult').innerHTML='<div class="alert red">IPv6 inválida</div>'}}
$('ipv6Convert').oninput=renderIPv6Convert;
$('maskCalc').onclick=()=>{const p=Math.max(0,Math.min(32,Number($('maskPrefix').value)));$('maskCalcResult').innerHTML=`<div class="maskResult"><div><b>Prefijo</b><span>/${p}</span></div><div><b>Binario</b><span>${bitsToMaskBinary(p)}</span></div><div><b>Decimal</b><span>${prefixToMask(p)}</span></div></div>`};
$('ipv6MaskCalc').onclick=()=>{const p=Math.max(0,Math.min(128,Number($('ipv6MaskPrefix').value)));$('ipv6MaskResult').innerHTML=`<div class="ipv6MaskResult"><b>/${p}</b><span>Hex: ${ipv6MaskHex(p)}</span><span>Binary: ${ipv6PrefixBinary(p)}</span></div>`};

function subnetIdBits(ip,p){const bits=ipv4ToBits(ip),interesting=Math.max(0,p-24);return {bits,subnetBits:p<=24?0:interesting,hostBits:32-p}}
function subnetWarnings(ip,p){
  const alerts=[];
  if(p===31){alerts.push('<div class="alert neutral"><b>No network or broadcast.</b> /31 deja solo dos direcciones. En enlaces punto-a-punto ambas se interpretan como direcciones de los extremos; no se aplica la reserva tradicional Network/Broadcast.</div>')}
  if(p>24 && p<32){const s=subnetIdBits(ip,p).subnetBits;const hostMask=2**(32-p)-1;const hostPart=ipInt(ip)&hostMask;const subnetPart=(ipInt(ip)>> (32-p)) & ((2**s)-1);if(subnetPart===0)alerts.push('<div class="alert yellow"><b>Warning! Subnet is all 0\'s.</b> Es la primera subred. Históricamente se excluía por recomendaciones antiguas; hoy puede ser válida según el entorno.</div>');if(subnetPart===2**s-1)alerts.push('<div class="alert red"><b>Warning! Subnet is all 1\'s.</b> Es la última subred. La exclusión fue una práctica histórica; hoy puede ser válida, aunque conviene entender la compatibilidad del entorno.</div>')}
  return alerts.join('');
}
function renderSubnet(){
 try{
  const ip=$('subIp').value.trim(),p=Math.max(0,Math.min(32,Number($('subPrefix').value)));ipv4ToBits(ip);const net=normalizeIPv4Network(ip,p),bc=broadcastIPv4(ip,p),total=2**(32-p);const usable=p===31?2:(p===32?1:Math.max(0,total-2));const ni=BigInt(ipInt(net)),bi=BigInt(ipInt(bc));const first=p===31?net:(p===32?net:intIp(Number(ni+1n)));const last=p===31?bc:(p===32?bc:intIp(Number(bi-1n)));$('subResults').innerHTML=[['Prefijo','/'+p],['Máscara',prefixToMask(p)],['Total de direcciones',total.toLocaleString()],['Hosts utilizables',usable.toLocaleString()],['Network',net],['Primer host',first],['Último host',last],['Broadcast',p===31?'N/A en el enlace /31':bc]].map(x=>`<div class="metric"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
  $('subWarnings').innerHTML=subnetWarnings(ip,p);
  const i=ipInt(ip),a=ipInt(net),b=ipInt(bc),pct=(i-a)/(b-a||1)*100;$('subVisual').innerHTML=`<h2>¿Dónde cae ${ip}?</h2><div class="rangeBar"><div class="rangeSegment" style="width:${Math.max(2, pct)}%"><div class="rangeDot" style="left:100%"></div></div><div class="rangeSegment rest" style="width:${Math.max(2,100-pct)}%"></div></div><div class="rangeLegend"><b>${net}</b> ← inicio · <b>${ip}</b> ← IP · <b>${bc}</b> → final del bloque</div>`;
  const h=32-p;$('subExplain').innerHTML=`<p><b>1.</b> /${p} reserva ${p} bits para el prefijo y deja ${h} bits fuera de él.</p><p><b>2.</b> El bloque contiene <b>2^${h} = ${total.toLocaleString()}</b> direcciones.</p><p><b>3.</b> La IP <b>${ip}</b> cae dentro del intervalo <b>${net} → ${bc}</b>.</p><p><b>4.</b> En el modelo tradicional, Network tiene los bits de host en 0 y Broadcast los bits de host en 1. /31 es la excepción práctica de enlace punto-a-punto.</p>`;
 }catch(e){$('subResults').innerHTML='<div class="metric error">IPv4 inválida</div>';$('subWarnings').innerHTML='';$('subExplain').innerHTML='';$('subVisual').innerHTML=''}
}
$('subCalc').onclick=renderSubnet;$('subIp').oninput=renderSubnet;$('subPrefix').oninput=renderSubnet;

function renderIPv6Subnet(){try{const ip=$('sub6Ip').value.trim(),p=Math.max(0,Math.min(128,Number($('sub6Prefix').value)));ipv6Bits(ip);const net=ipv6Network(ip,p),last=ipv6NetworkLast(ip,p),rest=128-p;$('sub6Results').innerHTML=`<div class="sub6Results"><div class="sub6Item"><b>Prefijo</b><span>/${p}</span></div><div class="sub6Item"><b>Bits restantes</b><span>${rest}</span></div><div class="sub6Item"><b>Direcciones teóricas</b><span>2^${rest}</span></div><div class="sub6Item"><b>Inicio del prefijo</b><span>${net}</span></div><div class="sub6Item"><b>Última dirección del prefijo</b><span>${last}</span></div><div class="sub6Item"><b>Entrada</b><span>${ipv6Compressed(ip)}</span></div><div class="sub6Item noBroadcast"><b>IPv6 no tiene Broadcast</b><span>Los valores de todos-cero y todos-uno dentro del espacio de direcciones no se invalidan por una regla de broadcast. Son valores que pueden ser legalmente utilizados salvo que una especificación concreta los excluya.</span></div></div>`}catch(e){$('sub6Results').innerHTML='<div class="alert red">IPv6 inválida</div>'}}
$('sub6Calc').onclick=renderIPv6Subnet;$('sub6Ip').oninput=renderIPv6Subnet;$('sub6Prefix').oninput=renderIPv6Subnet;

updateLearnBits();updateExplore();renderDecimal();renderBinary();renderHex();renderIPv6Convert();$('maskCalc').click();$('ipv6MaskCalc').click();renderSubnet();renderIPv6Subnet();

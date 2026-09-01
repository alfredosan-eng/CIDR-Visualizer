const state={family:'ipv4',prefix:24};
const $=id=>document.getElementById(id);
const views={learn:$('learnView'),explore:$('exploreView'),convert:$('convertView'),subnet:$('subnetView')};

document.querySelectorAll('.navBtn').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.navBtn').forEach(b=>b.classList.toggle('active',b===btn));
  Object.values(views).forEach(v=>v.classList.remove('activeView'));
  views[btn.dataset.view].classList.add('activeView');
});
function ipv4ToBits(ip){
  const a=ip.split('.').map(Number);
  if(a.length!==4||a.some(x=>!Number.isInteger(x)||x<0||x>255))throw Error('IPv4 inválida');
  return a.map(n=>n.toString(2).padStart(8,'0')).join('');
}
function prefixToMask(p){
  if(p===0)return '0.0.0.0';
  const bits='1'.repeat(p)+'0'.repeat(32-p),a=[];
  for(let i=0;i<32;i+=8)a.push(parseInt(bits.slice(i,i+8),2));
  return a.join('.');
}
function bitsToMaskBinary(p){
  const bits='1'.repeat(p)+'0'.repeat(32-p);
  return [0,8,16,24].map(i=>bits.slice(i,i+8)).join('.');
}
function normalizeIPv4Network(ip,p){
  const n=ipv4ToBits(ip).slice(0,p)+'0'.repeat(32-p);
  return [0,8,16,24].map(i=>parseInt(n.slice(i,i+8),2)).join('.');
}
function broadcastIPv4(ip,p){
  const n=ipv4ToBits(ip).slice(0,p)+'1'.repeat(32-p);
  return [0,8,16,24].map(i=>parseInt(n.slice(i,i+8),2)).join('.');
}
function ipInt(ip){return ip.split('.').map(Number).reduce((a,x)=>a*256+x,0)}
function intIp(n){return [24,16,8,0].map(s=>Math.floor(n/2**s)%256).join('.')}

function ipv6Groups(ip){
  const raw=ip.trim();
  if(raw.includes('::')){
    const parts=raw.split('::'); if(parts.length>2)throw Error('IPv6 inválida');
    const left=parts[0]?parts[0].split(':'):[],right=parts[1]?parts[1].split(':'):[];
    const missing=8-left.length-right.length;
    if(missing<1)throw Error('IPv6 inválida');
    return [...left,...Array(missing).fill('0'),...right];
  }
  return raw.split(':');
}
function ipv6Bits(ip){
  const g=ipv6Groups(ip);
  if(g.length!==8)throw Error('IPv6 inválida');
  return g.map(x=>/^[0-9a-fA-F]{1,4}$/.test(x)?parseInt(x,16).toString(2).padStart(16,'0'):(()=>{throw Error('IPv6 inválida')})()).join('');
}
function updateExplore(){
  $('prefixText').textContent='/'+state.prefix;
  $('prefixSlider').value=state.prefix;
  $('sliderCenter').textContent='/'+state.prefix;
  try{
    const totalBits=state.family==='ipv4'?32:128;
    const bits=state.family==='ipv4'?ipv4ToBits($('address').value):ipv6Bits($('address').value);
    const hostBits=totalBits-state.prefix;
    const total=state.family==='ipv4'?2**hostBits:`2^${hostBits}`;
    $('metrics').innerHTML=[
      ['Prefijo','/'+state.prefix],
      ['Bits de prefijo',state.prefix],
      [state.family==='ipv4'?'Bits de host':'Bits restantes',hostBits],
      ['Direcciones posibles',typeof total==='number'?total.toLocaleString():total]
    ].map(x=>`<div class="metric"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
    let map='';
    const group=state.family==='ipv4'?8:16;
    for(let i=0;i<totalBits;i++){
      if(i&&i%group===0)map+='<div class="octetGap"></div>';
      map+=`<div class="bit ${i<state.prefix?'net':'host'}">${bits[i]}</div>`;
    }
    $('bitMap').innerHTML=`<div class="bitGroups">${map}</div>`;
    $('maskInfo').innerHTML=state.family==='ipv4'
      ?`<div class="infoBlock"><p><b>/${state.prefix}</b> = ${state.prefix} bits de prefijo.</p><p>Máscara decimal: <b>${prefixToMask(state.prefix)}</b></p><p>Máscara binaria: <b class="binaryLine">${bitsToMaskBinary(state.prefix)}</b></p></div>`
      :`<div class="infoBlock"><p><b>/${state.prefix}</b> = ${state.prefix} bits de prefijo dentro de una dirección de 128 bits.</p><p>Representación: <b>Prefix Length /${state.prefix}</b></p></div>`;
    $('whyInfo').innerHTML=state.family==='ipv4'
      ?`<div class="infoBlock"><p>Al aumentar el prefijo en 1, se agrega un bit a la parte de red y se quita un bit de la parte de host.</p><p>Con <b>${hostBits}</b> bits de host: <b>2^${hostBits}</b> direcciones por bloque.</p><p>Hosts utilizables tradicionales: <b>2^${hostBits} − 2</b>, cuando aplica.</p></div>`
      :`<div class="infoBlock"><p>Al cambiar el prefijo, cambia cuántos de los 128 bits pertenecen al prefijo.</p><p>IPv6 no usa broadcast de la misma forma que IPv4, así que no aplicamos automáticamente la regla de “−2”.</p></div>`;
  }catch(e){
    $('metrics').innerHTML='<div class="metric error">Dirección inválida</div>';
    $('bitMap').innerHTML='';$('maskInfo').innerHTML='';$('whyInfo').innerHTML='';
  }
}
$('ipv4Btn').onclick=()=>{state.family='ipv4';state.prefix=24;$('address').value='192.168.1.0';$('prefixSlider').max=32;$('prefixSlider').value=24;$('sliderMax').textContent='/32';$('ipv4Btn').classList.add('active');$('ipv6Btn').classList.remove('active');updateExplore()};
$('ipv6Btn').onclick=()=>{state.family='ipv6';state.prefix=64;$('address').value='2001:db8:1234:5678::1';$('prefixSlider').max=128;$('prefixSlider').value=64;$('sliderMax').textContent='/128';$('ipv6Btn').classList.add('active');$('ipv4Btn').classList.remove('active');updateExplore()};
$('minus').onclick=()=>{state.prefix=Math.max(0,state.prefix-1);updateExplore()};
$('plus').onclick=()=>{state.prefix=Math.min(state.family==='ipv4'?32:128,state.prefix+1);updateExplore()};
$('prefixSlider').oninput=e=>{state.prefix=+e.target.value;updateExplore()};
$('address').oninput=updateExplore;

function renderDecimal(){
  let n=Number($('decInput').value);if(!Number.isInteger(n)||n<0||n>255)n=0;
  const b=n.toString(2).padStart(8,'0');
  $('decBits').innerHTML='<div class="octetBits">'+[128,64,32,16,8,4,2,1].map((w,i)=>`<div class="octetBit ${b[i]==='1'?'on':''}"><b>${b[i]}</b><small>${w}</small></div>`).join('')+'</div><div class="binaryLine">'+b+'</div>';
  const used=[128,64,32,16,8,4,2,1].filter((_,i)=>b[i]==='1');
  $('decExplain').innerHTML=`<p>${used.length?used.join(' + ')+' = '+n:'0 = 0'}</p>`;
}
function renderBinary(){
  let b=$('binInput').value.replace(/[^01]/g,'').slice(0,8);$('binInput').value=b;
  if(!b){$('binExplain').innerHTML='';return}
  b=b.padStart(8,'0');
  const terms=[128,64,32,16,8,4,2,1].map((w,i)=>b[i]==='1'?w:0).filter(Boolean);
  $('binExplain').innerHTML=`<div class="binaryLine">${b}</div><p>${terms.join(' + ')||'0'} = <b>${parseInt(b,2)}</b></p>`;
}
$('decInput').oninput=renderDecimal;$('binInput').oninput=renderBinary;
$('maskCalc').onclick=()=>{const p=Math.max(0,Math.min(32,Number($('maskPrefix').value)));$('maskCalcResult').innerHTML=`<div class="maskResult"><div><b>Prefijo</b><span>/${p}</span></div><div><b>Binario</b><span>${bitsToMaskBinary(p)}</span></div><div><b>Decimal</b><span>${prefixToMask(p)}</span></div></div>`};
$('subCalc').onclick=()=>{
 try{
  const ip=$('subIp').value.trim(),p=Math.max(0,Math.min(32,Number($('subPrefix').value)));
  ipv4ToBits(ip);
  const net=normalizeIPv4Network(ip,p),bc=broadcastIPv4(ip,p),total=2**(32-p),usable=p>=31?0:Math.max(0,total-2),ni=ipInt(net),bi=ipInt(bc);
  const first=p>=31?net:intIp(ni+1),last=p>=31?bc:intIp(bi-1);
  $('subResults').innerHTML=[['Prefijo','/'+p],['Máscara',prefixToMask(p)],['Total de direcciones',total.toLocaleString()],['Hosts utilizables',usable.toLocaleString()],['Network',net],['Primer host',first],['Último host',last],['Broadcast',bc]].map(x=>`<div class="metric"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
  const h=32-p;
  $('subExplain').innerHTML=`<p><b>1.</b> /${p} reserva ${p} bits para el prefijo y deja ${h} bits para hosts.</p><p><b>2.</b> El bloque contiene <b>2^${h} = ${total.toLocaleString()}</b> direcciones.</p><p><b>3.</b> La máscara es <b>${prefixToMask(p)}</b>. Si hay un octeto intermedio entre 0 y 255, allí podemos calcular el salto como <b>256 − máscara</b>.</p><p><b>4.</b> La IP <b>${ip}</b> cae dentro del bloque <b>${net} → ${bc}</b>.</p>`;
 }catch(e){$('subResults').innerHTML='<div class="metric error">IPv4 inválida</div>';$('subExplain').innerHTML=''}
};
updateExplore();renderDecimal();renderBinary();$('maskCalc').click();$('subCalc').click();
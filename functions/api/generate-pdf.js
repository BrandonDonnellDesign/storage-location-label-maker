const CODE128 = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213','221312','231212',
  '112232','122132','122231','113222','123122','123221','223211','221132','221231','213212','223112','312131',
  '311222','321122','321221','312212','322112','322211','212123','212321','232121','111323','131123','131321',
  '112313','132113','132311','211313','231113','231311','112133','112331','132131','113123','113321','133121',
  '313121','211331','231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214','112412','122114',
  '122411','142112','142211','241211','221114','413111','241112','134111','111242','121142','121241','114212',
  '124112','124211','411212','421112','421211','212141','214121','412121','111143','111341','131141','114113',
  '114311','411113','411311','113141','114131','311141','411131','211412','211214','211232','2331112'
];

function values(text) {
  const out=[104];
  for (const ch of text) {
    const n=ch.charCodeAt(0);
    if(n<32||n>126) return null;
    out.push(n-32);
  }
  let sum=104;
  for(let i=1;i<out.length;i++) sum+=out[i]*i;
  out.push(sum%103,106);
  return out;
}

function pdfEscape(s) {
  return s.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
}

function wrapText(text, maxChars=24) {
  const words=text.split(/\s+/);
  const lines=[];
  let line='';
  for(const word of words) {
    if(!line) line=word;
    else if((line+' '+word).length<=maxChars) line+=' '+word;
    else { lines.push(line); line=word; }
  }
  if(line) lines.push(line);
  if(!lines.length) lines.push('');
  return lines.slice(0,4);
}

function barcodeCommands(text,x,y,width,height) {
  const v=values(text);
  if(!v) return null;
  let units=0;
  for(const n of v) for(const d of CODE128[n]) units+=Number(d);
  const scale=width/units;
  let cur=x;
  const cmds=['0 0 0 rg'];
  for(const n of v) {
    let black=true;
    for(const d of CODE128[n]) {
      const w=Number(d)*scale;
      if(black) cmds.push(cur.toFixed(3)+' '+y.toFixed(3)+' '+w.toFixed(3)+' '+height.toFixed(3)+' re f');
      cur+=w;
      black=!black;
    }
  }
  return cmds.join('\n');
}

function buildPdf(locations) {
  const objects=[];
  const add=s=>{objects.push(s);return objects.length;};
  const catalog=add('');
  const pages=add('');
  const font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pageIds=[];
  const contentIds=[];
  for(const location of locations) {
    const lines=wrapText(location);
    const textParts=['BT','/F1 25 Tf','0 0 0 rg'];
    const startY=390-(lines.length-1)*30;
    lines.forEach((line,i)=>{
      const size=line.length*13.9;
      const x=Math.max(18,(288-size)/2);
      textParts.push('1 0 0 1 '+x.toFixed(2)+' '+(startY-i*30).toFixed(2)+' Tm');
      textParts.push('('+pdfEscape(line)+') Tj');
    });
    textParts.push('ET');
    const bar=barcodeCommands(location,18,145,252,95);
    if(!bar) throw new Error('Unsupported characters');
    const stream=textParts.join('\n')+'\n'+bar+'\n';
    const cid=add('<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream');
    contentIds.push(cid);
    const pid=add('<< /Type /Page /Parent '+pages+' 0 R /MediaBox [0 0 288 432] /Resources << /Font << /F1 '+font+' 0 R >> >> /Contents '+cid+' 0 R >>');
    pageIds.push(pid);
  }
  objects[catalog-1]='<< /Type /Catalog /Pages '+pages+' 0 R >>';
  objects[pages-1]='<< /Type /Pages /Kids ['+pageIds.map(id=>id+' 0 R').join(' ')+'] /Count '+pageIds.length+' >>';
  let pdf='%PDF-1.4\n%\xFF\xFF\xFF\xFF\n';
  const offsets=[0];
  objects.forEach((obj,i)=>{offsets[i+1]=pdf.length;pdf+=(i+1)+' 0 obj\n'+obj+'\nendobj\n';});
  const xref=pdf.length;
  pdf+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
  for(let i=1;i<offsets.length;i++) pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
  pdf+='trailer\n<< /Size '+(objects.length+1)+' /Root '+catalog+' 0 R >>\nstartxref\n'+xref+'\n%%EOF';
  return pdf;
}

export async function onRequestGet({ request }) {
  try {
    const url=new URL(request.url);
    const raw=url.searchParams.get('locations')||'';
    const locations=raw.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
    if(!locations.length) return new Response('No storage locations supplied.',{status:400});
    if(locations.length>100) return new Response('Maximum 100 labels per PDF.',{status:400});
    if(locations.some(v=>!values(v))) return new Response('Locations must contain printable ASCII characters.',{status:400});
    const pdf=buildPdf(locations);
    return new Response(pdf,{
      headers:{
        'Content-Type':'application/pdf',
        'Content-Disposition':'inline; filename="storage-location-labels-4x6.pdf"',
        'Cache-Control':'no-store'
      }
    });
  } catch(e) {
    return new Response('Unable to generate PDF.',{status:500});
  }
}

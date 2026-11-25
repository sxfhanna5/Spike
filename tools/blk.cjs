const fs=require("fs");
module.exports=function(file){
const T=fs.readFileSync(file,"utf8");const L=T.split("\n");
const imgs={};for(const m of T.matchAll(/const (img\w+) = `\$\{assetPathPrefix\}\/([^`]+)`/g))imgs[m[1]]=m[2];
let s=L.findIndex(l=>/^    <div className="[^"]*relative size-full/.test(l));
let blocks=[],cur=null;
for(let i=s+1;i<L.length;i++){const l=L[i];
 if(/^    <\/div>/.test(l)) break;
 if(/^      <(div|p)/.test(l)){cur={start:i,end:i,lines:[l]};blocks.push(cur);} else if(cur){cur.lines.push(l);cur.end=i;}
}
return {T,L,imgs,s,blocks};}

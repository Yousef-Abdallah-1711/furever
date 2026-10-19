import React from 'react';
const CDN='https://unpkg.com/lucide-static@0.469.0/icons/';
const cache={};const subs={};
function load(name){
  if(cache[name]!==undefined)return;
  cache[name]=null;
  fetch(CDN+name+'.svg').then(r=>r.text()).then(s=>{
    cache[name]=s.replace(/<!--[\s\S]*?-->/g,'').replace('width="24"','width="100%"').replace('height="24"','height="100%"').replace('stroke-width="2"','stroke-width="1.75"');
    (subs[name]||[]).forEach(f=>f());
  }).catch(()=>{cache[name]='';});
}
export function Icon({name,size=24,flip=false,label,style}){
  const [,tick]=React.useReducer(x=>x+1,0);
  React.useEffect(()=>{load(name);(subs[name]=subs[name]||[]).push(tick);return()=>{subs[name]=(subs[name]||[]).filter(f=>f!==tick)}},[name]);
  load(name);
  return <span role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true} className={'fe-icon'+(flip?' flip':'')} style={{'--s':size+'px',...style}} dangerouslySetInnerHTML={{__html:cache[name]||''}}/>;
}

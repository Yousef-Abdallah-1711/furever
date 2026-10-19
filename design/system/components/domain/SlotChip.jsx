import React from 'react';
export function SlotChip({time,on=false,disabled=false,onClick}){
  return <button type="button" className={'fe-slot'+(on?' on':'')} disabled={disabled} onClick={onClick}><span dir="ltr">{time}</span></button>;
}
import React from 'react';
import {Icon} from './Icon.jsx';
export function Chip({on=false,icon,children,onClick}){
  return <button type="button" className={'fe-chip'+(on?' on':'')} aria-pressed={on} onClick={onClick}>{icon&&<Icon name={icon} size={16}/>}{children}</button>;
}
import React from 'react';
import {Card} from '../core/Card.jsx';
import {Icon} from '../core/Icon.jsx';
export function ClinicCard({name,distance,rating,next,nextLabel,badge,onClick}){
  return <Card onClick={onClick} pad={12} style={{display:'flex',gap:12}}>
    <div className="fe-ph" style={{width:64,height:64,borderRadius:14,flex:'none'}}>logo</div>
    <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:4}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:8}}><div className="t-h3" style={{fontSize:'var(--fs-body-lg)'}}>{name}</div>{badge}</div>
      <div className="t-cap" style={{display:'flex',gap:12}}><span style={{display:'flex',gap:4,alignItems:'center'}}><Icon name="map-pin" size={14}/><span dir="ltr">{distance}</span></span><span style={{display:'flex',gap:4,alignItems:'center'}}><Icon name="star" size={14} style={{color:'var(--warning)'}}/><span dir="ltr">{rating}</span></span></div>
      <div style={{fontSize:'var(--fs-caption)',color:'var(--success)',fontWeight:500}}>{nextLabel} <span dir="ltr">{next}</span></div>
    </div></Card>;
}
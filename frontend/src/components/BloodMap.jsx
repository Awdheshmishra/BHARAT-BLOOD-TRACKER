import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const CENTER  = { lat: 26.8467, lng: 80.9462 };
const MAPSTYLE = { width:'100%', height:'380px', borderRadius:'var(--radius)', overflow:'hidden' };
const ICONS = {
  available: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  low:       'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  critical:  'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  out:       'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
};

function hospStatus(h, blood) {
  if (!blood || blood==='all') {
    const total = h.inventory?.reduce((s,i)=>s+i.units,0)||0;
    return total===0?'out':total<20?'critical':total<50?'low':'available';
  }
  const u = h.inventory?.find(i=>i.bloodGroup===blood)?.units||0;
  return u===0?'out':u<5?'critical':u<15?'low':'available';
}

export default function BloodMap({ hospitals=[], selectedBlood='all', userLocation=null }) {
  const [selected, setSelected] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
    libraries: ['places'],
  });

  if (loadError || !import.meta.env.VITE_GOOGLE_MAPS_KEY || import.meta.env.VITE_GOOGLE_MAPS_KEY==='placeholder') {
    return (
      <div style={{ ...MAPSTYLE, background:'var(--blue-light)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, border:'2px dashed #A0BDE8' }}>
        <div style={{ fontSize:48 }}>🗺️</div>
        <p style={{ color:'var(--blue)', fontWeight:700 }}>Map — Lucknow Blood Banks</p>
        <small style={{ color:'var(--text2)', textAlign:'center', maxWidth:280 }}>
          Google Maps API key add karo <code>frontend/.env</code> mein<br/>
          <code>VITE_GOOGLE_MAPS_KEY=AIza...</code>
        </small>
      </div>
    );
  }

  if (!isLoaded) return <div style={{ ...MAPSTYLE, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}><div className="spinner" /></div>;

  return (
    <GoogleMap mapContainerStyle={MAPSTYLE} center={userLocation || CENTER} zoom={12}
      options={{ streetViewControl:false, mapTypeControl:false, styles:[{featureType:'poi',stylers:[{visibility:'off'}]}] }}>
      {userLocation && <Marker position={userLocation} icon={{ url:'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} title="Tumhari location" />}
      {hospitals.map(h => {
        const [lng, lat] = h.location?.coordinates || [80.9462, 26.8467];
        const status     = hospStatus(h, selectedBlood);
        return (
          <Marker key={h._id} position={{ lat, lng }} icon={{ url: ICONS[status] }} title={h.name} onClick={() => setSelected(h)} />
        );
      })}
      {selected && (() => {
        const [lng, lat] = selected.location?.coordinates || [80.9462, 26.8467];
        const item       = selected.inventory?.find(i => i.bloodGroup===selectedBlood);
        return (
          <InfoWindow position={{ lat, lng }} onCloseClick={() => setSelected(null)}>
            <div style={{ fontFamily:'Nunito,sans-serif', maxWidth:230 }}>
              <h4 style={{ fontFamily:"'Baloo 2',cursive", fontSize:15, color:'#C0392B', marginBottom:4 }}>🏥 {selected.name}</h4>
              <p style={{ fontSize:13, color:'#555', marginBottom:6 }}>📍 {selected.area}</p>
              {selectedBlood!=='all' && item && (
                <p style={{ fontSize:14, fontWeight:700, color: item.units>0 ? '#1A7A4A' : '#C0392B' }}>
                  {selectedBlood}: {item.units>0 ? `${item.units} units` : 'Stock nahi hai'}
                </p>
              )}
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:8 }}>
                {selected.inventory?.slice(0,6).map(i => (
                  <span key={i.bloodGroup} style={{
                    fontSize:11, fontFamily:"'Baloo 2',cursive", fontWeight:800,
                    padding:'2px 8px', borderRadius:50,
                    background: i.units===0?'#eee':i.units<5?'#FDECEA':'#E8F5EE',
                    color: i.units===0?'#bbb':i.units<5?'#C0392B':'#1A7A4A',
                  }}>{i.bloodGroup}:{i.units}</span>
                ))}
              </div>
              <a href={`tel:${selected.phone}`} style={{ display:'block', marginTop:8, color:'#1A4D8F', fontWeight:700, fontSize:13 }}>
                📞 {selected.phone}
              </a>
            </div>
          </InfoWindow>
        );
      })()}
    </GoogleMap>
  );
}

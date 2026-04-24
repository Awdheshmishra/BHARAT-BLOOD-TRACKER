import React, { useState, useEffect } from 'react';
import api      from '../utils/api';
import Navbar   from '../components/Navbar';
import BloodMap from '../components/BloodMap';
import toast    from 'react-hot-toast';

const BT = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

export default function Hospitals() {
  const [hospitals,    setHospitals]   = useState([]);
  const [nearest,      setNearest]     = useState([]);
  const [filter,       setFilter]      = useState('all');
  const [nearBlood,    setNearBlood]   = useState('all');
  const [loading,      setLoading]     = useState(true);
  const [nearLoading,  setNearLoading] = useState(false);
  const [userLoc,      setUserLoc]     = useState(null);

  useEffect(() => {
    api.get('/hospitals?city=Lucknow')
      .then(r => setHospitals(r.data.data || []))
      .finally(() => setLoading(false));
    navigator.geolocation?.getCurrentPosition(
      p => setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude })
    );
  }, []);

  const findNearest = async () => {
    if (!userLoc) { toast.error('Browser mein location allow karo.'); return; }
    setNearLoading(true);
    try {
      const res = await api.get(`/hospitals/nearest?lat=${userLoc.lat}&lng=${userLoc.lng}&blood=${nearBlood}`);
      setNearest(res.data.data || []);
      if (!res.data.count) toast.error(`${nearBlood === 'all' ? 'Koi hospital' : nearBlood+' blood'} paas mein nahi mila.`);
      else toast.success(`${res.data.count} hospital mile paas mein!`);
    } catch { toast.error('Location search fail ho gaya.'); }
    setNearLoading(false);
  };

  const shown = filter === 'all' ? hospitals
    : hospitals.filter(h => h.inventory?.some(i => i.bloodGroup === filter && i.units > 0));

  return (
    <>
      <Navbar />
      <div className="content">
        <h1 style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>🏥 Lucknow ke Hospitals</h1>
        <p style={{ color:'var(--text2)', fontSize:15, marginBottom:24 }}>Live blood inventory ke saath registered hospitals</p>

        {/* Nearest finder */}
        <div className="card" style={{ marginBottom:24 }}>
          <h3 style={{ fontSize:18, fontWeight:700, marginBottom:16 }}>📍 Sabse Paas Wala Hospital Dhundo</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Blood Type Chahiye</label>
              <select value={nearBlood} onChange={e => setNearBlood(e.target.value)}>
                <option value="all">Koi bhi Type</option>
                {BT.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end' }}>
              <button className="btn-red" onClick={findNearest} disabled={nearLoading} style={{ width:'100%', justifyContent:'center' }}>
                {nearLoading ? '⏳ Dhoondh raha hai...' : '📍 Nearest Dhundo'}
              </button>
            </div>
          </div>
          {!userLoc && (
            <p style={{ fontSize:13, color:'var(--text3)', marginTop:8 }}>
              ⚠️ Ye feature ke liye browser mein location allow karo
            </p>
          )}
        </div>

        {/* Nearest results */}
        {nearest.length > 0 && (
          <div style={{ marginBottom:28 }}>
            <div className="alert alert-green" style={{ marginBottom:16 }}>
              <span style={{ fontSize:22 }}>🏆</span>
              <div>
                <strong>Sabse Paas: {nearest[0].name}</strong><br />
                {(nearest[0].distance / 1000).toFixed(1)} km door · 📞 {nearest[0].phone}
              </div>
            </div>
            <BloodMap hospitals={nearest} selectedBlood={nearBlood} userLocation={userLoc} />
            <div style={{ marginTop:16 }}>
              {nearest.map((h, i) => (
                <div key={h._id} style={{ background:'white', borderRadius:'var(--radius-sm)', boxShadow:'var(--shadow)', padding:18, marginBottom:10, display:'flex', gap:14, alignItems:'center', borderLeft:`4px solid ${i===0?'var(--green)':'var(--red)'}` }}>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:14, fontWeight:800, color:i===0?'var(--green)':'var(--red)', textAlign:'center', minWidth:48, flexShrink:0 }}>
                    {(h.distance/1000).toFixed(1)}<br/><span style={{ fontSize:10 }}>km</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{h.name}</div>
                    <div style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>📍 {h.area}</div>
                  </div>
                  <a href={`tel:${h.phone}`}>
                    <button style={{ background:'var(--blue)', color:'white', border:'none', padding:'8px 16px', borderRadius:50, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>📞 Call</button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter + Map + List */}
        <h2 style={{ fontSize:20, fontWeight:700, marginBottom:12 }}>Sabhi Hospitals</h2>
        <div className="filter-row">
          <button className={`filter-chip ${filter==='all'?'active':''}`} onClick={() => setFilter('all')}>Sabhi</button>
          {BT.map(bt => (
            <button key={bt} className={`filter-chip ${filter===bt?'active':''}`} onClick={() => setFilter(bt)}>{bt}</button>
          ))}
        </div>

        <div style={{ marginBottom:20 }}>
          <BloodMap hospitals={shown} selectedBlood={filter} userLocation={userLoc} />
        </div>

        {loading ? <div className="spinner" /> : shown.map(h => {
          const total = h.inventory?.reduce((s,i)=>s+i.units,0)||0;
          const crits = h.inventory?.filter(i=>i.units<5).length||0;
          return (
            <div key={h._id} className="card" style={{ marginBottom:14 }}>
              <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ width:50, height:50, background:'var(--blue-light)', borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🏥</div>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontSize:17, fontWeight:700, marginBottom:3 }}>{h.name}</h3>
                  <p style={{ fontSize:13, color:'var(--text2)' }}>📍 {h.address || h.area}, Lucknow</p>
                  <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                    <span className="badge badge-blue">📞 {h.phone}</span>
                    <span className="badge badge-green">🩸 {total} units</span>
                    {crits > 0 && <span className="badge badge-red">⚠️ {crits} critical</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {h.inventory?.map(i => {
                  const s = i.units===0?'out':i.units<5?'critical':i.units<15?'low':'available';
                  return <span key={i.bloodGroup} className={`blood-chip ${s}`}>{i.bloodGroup}: {i.units===0?'Out':`${i.units}u`}</span>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

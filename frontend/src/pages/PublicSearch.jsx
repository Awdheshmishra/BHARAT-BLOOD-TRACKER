import React, { useState, useEffect } from 'react';
import api       from '../utils/api';
import Navbar    from '../components/Navbar';
import BloodMap  from '../components/BloodMap';
import { useSocket } from '../context/SocketContext';

const BT = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

export default function PublicSearch() {
  const [hospitals,    setHospitals]    = useState([]);
  const [availability, setAvailability] = useState([]);
  const [filter,       setFilter]       = useState('all');
  const [loading,      setLoading]      = useState(true);
  const [userLoc,      setUserLoc]      = useState(null);
  const { liveUpdates } = useSocket();

  const fetchData = async () => {
    try {
      const [h, a] = await Promise.all([
        api.get('/hospitals?city=Lucknow'),
        api.get('/blood/availability?city=Lucknow'),
      ]);
      setHospitals(h.data.data || []);
      setAvailability(a.data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    navigator.geolocation?.getCurrentPosition(p => setUserLoc({ lat:p.coords.latitude, lng:p.coords.longitude }));
  }, []);

  useEffect(() => { if (liveUpdates[0]?.type==='inventory') fetchData(); }, [liveUpdates]);

  const sc = (s) => s==='available'?'var(--green)':s==='low'?'var(--amber)':'var(--red)';
  const si = (s) => s==='available'?'✅':s==='low'?'⚠️':'❌';

  const shown = filter==='all' ? hospitals : hospitals.filter(h=>h.inventory?.some(i=>i.bloodGroup===filter&&i.units>0));

  return (
    <>
      <Navbar />
      <div className="content">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>🩸 Live Blood Availability — Lucknow</h1>
            <p style={{ color:'var(--text2)', fontSize:15 }}>Sabhi hospitals ki real-time inventory · auto-update hoti hai</p>
          </div>
          <span className="badge badge-green" style={{ fontSize:13, padding:'8px 16px' }}>● Live</span>
        </div>

        {loading ? <div className="spinner" /> : (
          <>
            <div className="grid-4" style={{ marginBottom:28 }}>
              {availability.map(a => (
                <div key={a.bloodGroup} className="card" style={{ cursor:'pointer', border: filter===a.bloodGroup ? '2px solid var(--red)' : undefined, transition:'all .2s' }}
                  onClick={() => setFilter(f => f===a.bloodGroup ? 'all' : a.bloodGroup)}>
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:28, fontWeight:800, color:'var(--red)' }}>{a.bloodGroup}</div>
                  <div style={{ fontSize:24, fontWeight:700, margin:'4px 0' }}>{a.units}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginBottom:8 }}>units citywide</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width:`${Math.min(100,(a.units/60)*100)}%`, background:sc(a.status) }} /></div>
                  <span style={{ fontSize:11, fontWeight:700, color:sc(a.status), marginTop:6, display:'block' }}>{si(a.status)} {a.status.toUpperCase()}</span>
                </div>
              ))}
            </div>

            <div className="filter-row">
              <button className={`filter-chip ${filter==='all'?'active':''}`} onClick={()=>setFilter('all')}>Sabhi Types</button>
              {BT.map(bt => <button key={bt} className={`filter-chip ${filter===bt?'active':''}`} onClick={()=>setFilter(bt)}>{bt}</button>)}
            </div>

            <div style={{ marginBottom:24 }}>
              <BloodMap hospitals={hospitals} selectedBlood={filter} userLocation={userLoc} />
              <p style={{ fontSize:12, color:'var(--text3)', marginTop:8, textAlign:'center' }}>🟢 Sufficient &nbsp;🟡 Low &nbsp;🔴 Critical &nbsp;🟣 Out &nbsp;🔵 Tumhari location</p>
            </div>

            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>Hospital-wise Inventory</h2>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:16 }}>{shown.length} hospital{shown.length!==1?'s':''} {filter!=='all'?`mein ${filter} available`:''}</p>

            {shown.length===0 ? (
              <div className="alert alert-red"><span>❌</span><span><strong>{filter}</strong> blood abhi kisi hospital mein nahi hai. Urgent request post karo.</span></div>
            ) : shown.map(h => {
              const total = h.inventory?.reduce((s,i)=>s+i.units,0)||0;
              const crits = h.inventory?.filter(i=>i.units<5).length||0;
              return (
                <div key={h._id} className="card" style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:14 }}>
                    <div style={{ width:50, height:50, background:'var(--blue-light)', borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🏥</div>
                    <div style={{ flex:1 }}>
                      <h3 style={{ fontSize:17, fontWeight:700, marginBottom:3 }}>{h.name}</h3>
                      <p style={{ fontSize:13, color:'var(--text2)' }}>📍 {h.area}, Lucknow</p>
                      <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                        <span className="badge badge-blue">📞 {h.phone}</span>
                        <span className="badge badge-green">🩸 {total} units</span>
                        {crits>0&&<span className="badge badge-red">⚠️ {crits} critical</span>}
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
          </>
        )}
      </div>
    </>
  );
}

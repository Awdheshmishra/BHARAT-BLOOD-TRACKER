import React, { useState, useEffect } from 'react';
import toast   from 'react-hot-toast';
import api     from '../utils/api';
import { useAuth }   from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';

const BT = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

export default function HospDashboard() {
  const { hospital } = useAuth();
  const { liveUpdates, joinHospitalRoom } = useSocket();
  const [tab,       setTab]       = useState('dashboard');
  const [inventory, setInventory] = useState({});
  const [requests,  setRequests]  = useState([]);
  const [donors,    setDonors]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [donorBlood, setDonorBlood] = useState('all');

  useEffect(() => {
    if (hospital?.id) joinHospitalRoom(hospital.id);
    fetchData();
  }, []);

  useEffect(() => {
    if (liveUpdates[0]?.type === 'inventory') fetchData();
  }, [liveUpdates]);

  const fetchData = async () => {
    try {
      const [hRes, rRes] = await Promise.all([
        api.get(`/hospitals/${hospital?.id}`),
        api.get('/requests?city=Lucknow'),
      ]);
      const inv = {};
      (hRes.data.data?.inventory || []).forEach(i => { inv[i.bloodGroup] = i.units; });
      setInventory(inv);
      setRequests(rRes.data.data || []);
    } catch {}
    setLoading(false);
  };

  const saveInventory = async () => {
    setSaving(true);
    try {
      const inventoryArr = BT.map(bg => ({ bloodGroup:bg, units:parseInt(inventory[bg])||0 }));
      const res = await api.put('/hospitals/inventory', { inventory:inventoryArr });
      if (res.data.success) toast.success('✅ Inventory live update ho gaya!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update fail hua.'); }
    setSaving(false);
  };

  const findDonors = async (blood) => {
    try {
      const res = await api.get(`/donors?blood=${blood}&city=Lucknow`);
      setDonors(res.data.data || []);
      setTab('donors');
      toast.success(`${res.data.count} donors mile ${blood} ke liye!`);
    } catch {}
  };

  const fulfillReq = async (id) => {
    try {
      await api.put(`/requests/${id}/fulfill`);
      toast.success('Request fulfilled mark kar diya!');
      setRequests(r => r.map(req => req._id===id ? { ...req, status:'fulfilled' } : req));
    } catch { toast.error('Update fail hua.'); }
  };

  const totUnits  = BT.reduce((s,b) => s + (parseInt(inventory[b])||0), 0);
  const critCount = BT.filter(b => (parseInt(inventory[b])||0) < 5).length;
  const sc  = (u) => u===0?'var(--red)':u<5?'var(--red)':u<15?'var(--amber)':'var(--green)';
  const slb = (u) => u===0?'Out':u<5?'Critical':u<15?'Low':'Good';

  return (
    <>
      <Navbar />
      <div className="content">
        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#0D3B7A,#1A5276)', borderRadius:'var(--radius)', padding:28, marginBottom:28, color:'white', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:24, bottom:-10, fontSize:90, opacity:0.1 }}>🏥</div>
          <h1 style={{ fontSize:24, fontWeight:800, marginBottom:4 }}>{hospital?.name} 🏥</h1>
          <p style={{ opacity:0.85, marginBottom:20 }}>Blood inventory manage karo aur donors se connect karo</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button onClick={()=>setTab('inventory')} style={{ background:'rgba(255,255,255,0.2)', color:'white', border:'2px solid rgba(255,255,255,0.4)', padding:'10px 22px', borderRadius:50, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>📋 Inventory Update Karo</button>
            <button onClick={()=>setTab('requests')}  style={{ background:'rgba(255,255,255,0.1)', color:'white', border:'2px solid rgba(255,255,255,0.3)', padding:'10px 22px', borderRadius:50, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>🆘 Requests Dekho</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom:28 }}>
          {[
            { icon:'🩸', n:totUnits,                                      l:'Total units in stock' },
            { icon:'⚠️', n:critCount,                                     l:'Critical blood types' },
            { icon:'🆘', n:requests.filter(r=>r.status==='open').length,  l:'Open requests' },
            { icon:'📅', n:new Date().toLocaleDateString('hi-IN'),        l:'Aaj ki date', sm:true },
          ].map((s,i) => (
            <div key={i} className="card">
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:s.sm?16:28, fontWeight:800, fontFamily:"'Baloo 2',cursive", color:'var(--red)' }}>{s.n}</div>
              <div style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[['dashboard','📊 Dashboard'],['inventory','📋 Inventory'],['requests','🆘 Requests'],['donors','👥 Donors']].map(([t,l]) => (
            <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>

        {loading && <div className="spinner" />}

        {/* DASHBOARD */}
        {!loading && tab==='dashboard' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:16 }}>Current Blood Stock</h2>
            <div className="card">
              {BT.map(bg => {
                const u   = parseInt(inventory[bg])||0;
                const pct = Math.min(100, (u/50)*100);
                return (
                  <div key={bg} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 0', borderBottom:'1px solid var(--bg)' }}>
                    <div style={{ width:50, height:50, borderRadius:'50%', background:'var(--red-light)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Baloo 2',cursive", fontSize:16, fontWeight:800, color:'var(--red)', flexShrink:0 }}>{bg}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontWeight:700 }}>{u} units</span>
                        <span style={{ fontSize:12, color:sc(u), fontWeight:700 }}>{slb(u)}</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width:`${pct}%`, background:sc(u) }} /></div>
                    </div>
                    {u < 10 && (
                      <button className="btn-outline" style={{ padding:'6px 14px', fontSize:12 }} onClick={()=>findDonors(bg)}>
                        {bg} Donors Dhundo
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INVENTORY */}
        {!loading && tab==='inventory' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>📋 Inventory Update Karo</h2>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:16 }}>Changes sabhi users ko live dikhenge instantly</p>
            <div className="alert alert-amber" style={{ marginBottom:20 }}>
              <span>⚠️</span><span>5 se kam units wale blood types automatically nearby donors ko alert karenge.</span>
            </div>
            <div className="card">
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
                {BT.map(bg => {
                  const u = parseInt(inventory[bg])||0;
                  return (
                    <div key={bg} style={{ background:'var(--bg)', borderRadius:'var(--radius-sm)', padding:16, textAlign:'center', border:u<5?'2px solid var(--red)':'2px solid transparent', transition:'all .2s' }}>
                      <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:22, fontWeight:800, color:'var(--red)', marginBottom:8 }}>{bg}</div>
                      <input
                        type="number" min={0} max={500} value={u}
                        onChange={e => setInventory(iv => ({ ...iv, [bg]:e.target.value }))}
                        style={{ width:'100%', textAlign:'center', fontFamily:"'Baloo 2',cursive", fontSize:22, fontWeight:800, border:'2px solid #ddd', borderRadius:10, padding:'8px 4px', background:'white', outline:'none' }}
                      />
                      <div style={{ fontSize:11, color:sc(u), fontWeight:700, marginTop:6 }}>{slb(u)}</div>
                    </div>
                  );
                })}
              </div>
              <button className="btn-red" onClick={saveInventory} disabled={saving} style={{ width:'100%', justifyContent:'center' }}>
                {saving ? '⏳ Publish ho raha hai...' : '💾 Save aur Publish Karo'}
              </button>
            </div>
          </div>
        )}

        {/* REQUESTS */}
        {!loading && tab==='requests' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>🆘 Blood Requests</h2>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:20 }}>Lucknow ke patients ki incoming requests</p>
            {requests.filter(r=>r.status==='open').length===0 ? (
              <div className="alert alert-green"><span>✅</span><span>Abhi koi open request nahi hai.</span></div>
            ) : requests.filter(r=>r.status==='open').map(r => (
              <div key={r._id} style={{ background:'white', borderRadius:'var(--radius-sm)', boxShadow:'var(--shadow)', padding:20, marginBottom:14, display:'flex', alignItems:'center', gap:16, borderLeft:`4px solid ${r.urgency==='critical'?'var(--red)':r.urgency==='urgent'?'var(--amber)':'var(--green)'}` }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--red-light)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Baloo 2',cursive", fontSize:18, fontWeight:800, color:'var(--red)', flexShrink:0 }}>{r.bloodGroup}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{r.patientName} — {r.units} unit{r.units>1?'s':''}</div>
                  <div style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>🏥 {r.hospital} · 📞 {r.contactPhone}</div>
                  <span className={`badge badge-${r.urgency==='critical'?'red':r.urgency==='urgent'?'amber':'green'}`} style={{ marginTop:6 }}>{r.urgency.toUpperCase()}</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <button className="btn-green" style={{ padding:'8px 16px', fontSize:14 }} onClick={()=>fulfillReq(r._id)}>✅ Fulfill</button>
                  <a href={`tel:${r.contactPhone}`}><button style={{ background:'var(--blue)', color:'white', border:'none', padding:'8px 16px', borderRadius:50, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif', width:'100%' }}>📞 Call</button></a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DONORS */}
        {!loading && tab==='donors' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>👥 Donors Dhundo</h2>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:20 }}>Blood type ke hisaab se donors search karo</p>
            <div className="card" style={{ marginBottom:20 }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Blood Type</label>
                  <select value={donorBlood} onChange={e=>setDonorBlood(e.target.value)}>
                    <option value="all">Sabhi Types</option>
                    {BT.map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
                <div style={{ display:'flex', alignItems:'flex-end' }}>
                  <button className="btn-red" onClick={()=>findDonors(donorBlood)} style={{ width:'100%', justifyContent:'center' }}>🔍 Donors Search Karo</button>
                </div>
              </div>
            </div>
            {donors.length===0 ? (
              <div className="alert alert-amber"><span>ℹ️</span><span>Koi blood type select karo ya search karo.</span></div>
            ) : donors.map(d => (
              <div key={d._id} style={{ background:'white', borderRadius:'var(--radius-sm)', boxShadow:'var(--shadow)', padding:18, marginBottom:12, display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--blue-light)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'var(--blue)', fontSize:14, flexShrink:0 }}>
                  {d.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700 }}>{d.name} <span style={{ fontFamily:"'Baloo 2',cursive", color:'var(--red)', fontWeight:800 }}>{d.bloodGroup}</span></div>
                  <div style={{ fontSize:13, color:'var(--text2)' }}>📍 {d.area} · {d.donorProfile?.totalDonations||0} donations</div>
                </div>
                <button onClick={()=>toast.success(`${d.name} ko alert bheja gaya!`)}
                  style={{ background:'var(--green)', color:'white', border:'none', padding:'8px 18px', borderRadius:50, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
                  Alert
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

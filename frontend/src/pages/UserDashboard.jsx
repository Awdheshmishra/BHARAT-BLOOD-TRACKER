import React, { useState, useEffect } from 'react';
import toast   from 'react-hot-toast';
import api     from '../utils/api';
import { useAuth }   from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar   from '../components/Navbar';
import BloodMap from '../components/BloodMap';

const BT    = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const AREAS = ['Gomti Nagar','Hazratganj','Aliganj','Indira Nagar','Rajajipuram','Alambagh','Charbagh','Aminabad'];

const RARITY = {
  'O-':  { tier:'Ultra Rare', color:'#2D1B69', pct:'6.6%',  perks:['Universal donor — sabko de sakte ho','Highest honour certificate','Emergency blood guarantee','24/7 helpline','Hero Wall recognition'] },
  'AB-': { tier:'Ultra Rare', color:'#2D1B69', pct:'0.6%',  perks:['Sabse rare blood type','Universal plasma donor','National rare donor registry','Emergency family access'] },
  'B-':  { tier:'Rare',       color:'#8B0000', pct:'1.5%',  perks:['Rare Donor Certificate','Health insurance discount','Priority blood bank','Quarterly checkup'] },
  'A-':  { tier:'Rare',       color:'#8B0000', pct:'6.3%',  perks:['A+ aur AB+ ko bhi de sakte ho','Rare Donor Badge','Health checkup discount','Priority status'] },
  'B+':  { tier:'Uncommon',   color:'#B05E0D', pct:'8.5%',  perks:['Uncommon Donor Badge','Health app subscription','Priority slots','Milestone rewards'] },
  'AB+': { tier:'Uncommon',   color:'#B05E0D', pct:'2.9%',  perks:['Universal plasma donor','Plasma Hero Certificate','Discounted health tests'] },
  'A+':  { tier:'Common',     color:'#1A4D8F', pct:'27.4%', perks:['Regular Donor Certificate','Digital donor badge','Blood bank priority','Community Hero'] },
  'O+':  { tier:'Common',     color:'#1A4D8F', pct:'37.4%', perks:['Sabse zyada demand','Har donation pe certificate','Annual appreciation','Priority access'] },
};

export default function UserDashboard() {
  const { user } = useAuth();
  const { liveUpdates } = useSocket();
  const [tab,       setTab]       = useState('home');
  const [hospitals, setHospitals] = useState([]);
  const [requests,  setRequests]  = useState([]);
  const [avail,     setAvail]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [userLoc,   setUserLoc]   = useState(null);
  const [nearHosps, setNearHosps] = useState([]);
  const [nearBlood, setNearBlood] = useState('all');
  const [nearLoad,  setNearLoad]  = useState(false);
  const [posting,   setPosting]   = useState(false);
  const [regDonor,  setRegDonor]  = useState(false);

  const [reqForm, setReqForm] = useState({
    patientName:'', bloodGroup:'', units:1, hospital:'',
    area:'Gomti Nagar', contactPhone:'', urgency:'urgent', notes:'',
  });
  const [donorForm, setDonorForm] = useState({ weight:'', lastDonated:'' });

  const fetchAll = async () => {
    try {
      const [h, a] = await Promise.all([
        api.get('/hospitals?city=Lucknow'),
        api.get('/blood/availability?city=Lucknow'),
      ]);
      setHospitals(h.data.data || []);
      setAvail(a.data.data || []);
    } catch {}
    fetchRequests();
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const r = await api.get('/requests?city=Lucknow');
      setRequests(r.data.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchAll();
    navigator.geolocation?.getCurrentPosition(p => setUserLoc({ lat:p.coords.latitude, lng:p.coords.longitude }));
  }, []);

  useEffect(() => {
    if (liveUpdates[0]?.type === 'inventory') fetchAll();
    if (liveUpdates[0]?.type === 'request')   fetchRequests();
  }, [liveUpdates]);

  const findNearest = async () => {
    if (!userLoc) { toast.error('Location access allow karo.'); return; }
    setNearLoad(true);
    try {
      const r = await api.get(`/hospitals/nearest?lat=${userLoc.lat}&lng=${userLoc.lng}&blood=${nearBlood}`);
      setNearHosps(r.data.data || []);
      if (!r.data.count) toast.error('Paas mein koi hospital nahi mila.');
      else toast.success(`${r.data.count} hospital mile!`);
    } catch { toast.error('Search fail ho gaya.'); }
    setNearLoad(false);
  };

  const postRequest = async () => {
    if (!reqForm.patientName || !reqForm.bloodGroup || !reqForm.hospital || !reqForm.contactPhone) {
      toast.error('Sabhi required fields bharo aur blood group select karo.'); return;
    }
    setPosting(true);
    try {
      const res = await api.post('/requests', { ...reqForm, ...(userLoc ? { lat:userLoc.lat, lng:userLoc.lng } : {}) });
      if (res.data.success) {
        toast.success('🆘 Request post ho gayi! Donors ko alert bheja ja raha hai.');
        setReqForm({ patientName:'', bloodGroup:'', units:1, hospital:'', area:'Gomti Nagar', contactPhone:'', urgency:'urgent', notes:'' });
        fetchRequests();
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Request post nahi hui.'); }
    setPosting(false);
  };

  const respondReq = async (id) => {
    try {
      await api.put(`/requests/${id}/respond`);
      toast.success('✅ Response de diya! Patient tumse contact karega.');
    } catch (err) { toast.error(err.response?.data?.message || 'Respond nahi hua.'); }
  };

  const registerAsDonor = async () => {
    setRegDonor(true);
    try {
      const res = await api.post('/donors/register', donorForm);
      if (res.data.success) toast.success(res.data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Registration fail.'); }
    setRegDonor(false);
  };

  const sc = (u) => u===0?'var(--red)':u<10?'var(--amber)':'var(--green)';
  const ub = (u) => u==='critical'?'badge-red':u==='urgent'?'badge-amber':'badge-green';
  const r  = RARITY[user?.bloodGroup];

  return (
    <>
      <Navbar />
      <div className="content">
        {/* Hero */}
        <div style={{ background:'linear-gradient(135deg,#922B21,#C0392B)', borderRadius:'var(--radius)', padding:28, marginBottom:28, color:'white', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:24, bottom:-10, fontSize:90, opacity:0.12 }}>🩸</div>
          <h1 style={{ fontSize:24, fontWeight:800, marginBottom:4 }}>Namaste, {user?.name}! 👋</h1>
          <p style={{ opacity:0.85, marginBottom:20 }}>
            Tumhara blood type: <strong style={{ fontFamily:"'Baloo 2',cursive", fontSize:22 }}>{user?.bloodGroup}</strong>
            &nbsp;·&nbsp; 📍 {user?.area}, Lucknow
          </p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button onClick={()=>setTab('search')} style={{ background:'white', color:'var(--red)', border:'none', padding:'10px 22px', borderRadius:50, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>🔍 Blood Dhundo</button>
            <button onClick={()=>setTab('request')} style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'2px solid rgba(255,255,255,0.4)', padding:'10px 22px', borderRadius:50, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>🆘 Request Karo</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom:28 }}>
          {[
            { icon:'🏥', n:hospitals.length,                            l:'Hospitals tracked' },
            { icon:'🩸', n:avail.reduce((s,a)=>s+a.units,0),           l:'Units citywide' },
            { icon:'🆘', n:requests.filter(r=>r.status==='open').length,l:'Open requests' },
            { icon:'⚠️', n:avail.filter(a=>a.units<10).length,          l:'Blood types low' },
          ].map((s,i) => (
            <div key={i} className="card">
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:28, fontWeight:800, fontFamily:"'Baloo 2',cursive", color:'var(--red)' }}>{s.n}</div>
              <div style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[['home','🏠 Home'],['search','🔍 Blood'],['nearest','📍 Nearest'],['request','🆘 Request'],['donor','❤️ Donor'],['profile','👤 Profile']].map(([t,l]) => (
            <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>

        {loading && <div className="spinner" />}

        {/* HOME */}
        {!loading && tab==='home' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>🆘 Urgent Requests Paas Mein</h2>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:16 }}>Lucknow mein open blood requests — agar tumhara blood match kare to respond karo</p>
            {requests.filter(r=>r.status==='open').slice(0,5).map(r => (
              <div key={r._id} style={{ background:'white', borderRadius:'var(--radius-sm)', boxShadow:'var(--shadow)', padding:18, marginBottom:12, display:'flex', alignItems:'center', gap:16, borderLeft:`4px solid ${r.urgency==='critical'?'var(--red)':r.urgency==='urgent'?'var(--amber)':'var(--green)'}` }}>
                <div style={{ width:54, height:54, borderRadius:'50%', background:'var(--red-light)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Baloo 2',cursive", fontSize:17, fontWeight:800, color:'var(--red)', flexShrink:0 }}>{r.bloodGroup}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>{r.patientName} — {r.units} unit{r.units>1?'s':''}</div>
                  <div style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>🏥 {r.hospital} · 📍 {r.area}</div>
                  <span className={`badge ${ub(r.urgency)}`} style={{ marginTop:6 }}>{r.urgency.toUpperCase()}</span>
                </div>
                {user?.bloodGroup === r.bloodGroup && (
                  <button className="btn-green" style={{ padding:'8px 18px', fontSize:14 }} onClick={()=>respondReq(r._id)}>Respond</button>
                )}
              </div>
            ))}
            {requests.filter(r=>r.status==='open').length === 0 && (
              <div className="alert alert-green"><span>✅</span><span>Abhi koi open request nahi hai.</span></div>
            )}

            <h2 style={{ fontSize:20, fontWeight:700, margin:'28px 0 6px' }}>⚠️ Blood Shortage Alert</h2>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:16 }}>Lucknow mein critically low blood types</p>
            <div className="grid-4">
              {avail.filter(a=>a.units<20).sort((a,b)=>a.units-b.units).map(a => (
                <div key={a.bloodGroup} className="card">
                  <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:26, fontWeight:800, color:'var(--red)' }}>{a.bloodGroup}</div>
                  <div style={{ fontSize:22, fontWeight:700 }}>{a.units}</div>
                  <div style={{ fontSize:12, color:'var(--text3)', marginBottom:8 }}>units citywide</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width:`${Math.min(100,(a.units/60)*100)}%`, background:sc(a.units) }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH */}
        {!loading && tab==='search' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>🔍 Lucknow mein Blood Dhundo</h2>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:20 }}>Sabhi hospitals ki live inventory</p>
            <div style={{ marginBottom:24 }}>
              <BloodMap hospitals={hospitals} userLocation={userLoc} />
            </div>
            {hospitals.map(h => {
              const total = h.inventory?.reduce((s,i)=>s+i.units,0)||0;
              return (
                <div key={h._id} className="card" style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', gap:14, marginBottom:14 }}>
                    <div style={{ width:50, height:50, background:'var(--blue-light)', borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🏥</div>
                    <div style={{ flex:1 }}>
                      <h3 style={{ fontSize:17, fontWeight:700, marginBottom:3 }}>{h.name}</h3>
                      <p style={{ fontSize:13, color:'var(--text2)' }}>📍 {h.area} · 📞 <a href={`tel:${h.phone}`} style={{ color:'var(--blue)' }}>{h.phone}</a></p>
                      <span className="badge badge-green" style={{ marginTop:6 }}>🩸 {total} total units</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {h.inventory?.map(i => {
                      const s=i.units===0?'out':i.units<5?'critical':i.units<15?'low':'available';
                      return <span key={i.bloodGroup} className={`blood-chip ${s}`}>{i.bloodGroup}: {i.units===0?'Out':`${i.units}u`}</span>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* NEAREST */}
        {!loading && tab==='nearest' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>📍 Sabse Paas Hospital</h2>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:20 }}>GPS se nearest hospital dhundha jayega</p>
            <div className="card" style={{ marginBottom:24 }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Blood Type Chahiye</label>
                  <select value={nearBlood} onChange={e=>setNearBlood(e.target.value)}>
                    <option value="all">Koi bhi Type</option>
                    {BT.map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
                <div style={{ display:'flex', alignItems:'flex-end' }}>
                  <button className="btn-red" onClick={findNearest} disabled={nearLoad} style={{ width:'100%', justifyContent:'center' }}>
                    {nearLoad ? '⏳ Dhoondh raha hai...' : '📍 Nearest Dhundo'}
                  </button>
                </div>
              </div>
              {!userLoc && <p style={{ fontSize:13, color:'var(--text3)', marginTop:8 }}>⚠️ Location allow karo browser mein</p>}
            </div>
            {nearHosps.length > 0 && (
              <>
                <div className="alert alert-green" style={{ marginBottom:16 }}>
                  <span style={{ fontSize:22 }}>🏆</span>
                  <div><strong>Sabse paas: {nearHosps[0].name}</strong><br/>{(nearHosps[0].distance/1000).toFixed(1)} km · {nearHosps[0].phone}</div>
                </div>
                <BloodMap hospitals={nearHosps} selectedBlood={nearBlood} userLocation={userLoc} />
                <div style={{ marginTop:16 }}>
                  {nearHosps.map((h,i) => (
                    <div key={h._id} style={{ background:'white', borderRadius:'var(--radius-sm)', boxShadow:'var(--shadow)', padding:18, marginBottom:10, display:'flex', gap:14, alignItems:'center', borderLeft:`4px solid ${i===0?'var(--green)':'var(--red)'}` }}>
                      <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:14, fontWeight:800, color:i===0?'var(--green)':'var(--red)', minWidth:48, textAlign:'center', flexShrink:0 }}>
                        {(h.distance/1000).toFixed(1)}<br/><span style={{ fontSize:10 }}>km</span>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700 }}>{h.name}</div>
                        <div style={{ fontSize:13, color:'var(--text2)' }}>📍 {h.area}</div>
                        {nearBlood!=='all' && (() => { const item=h.inventory?.find(i=>i.bloodGroup===nearBlood); return item ? <span style={{ fontSize:14, fontWeight:700, color:item.units>0?'var(--green)':'var(--red)' }}>{nearBlood}: {item.units>0?`${item.units} units`:'Nahi hai'}</span> : null; })()}
                      </div>
                      <a href={`tel:${h.phone}`}><button style={{ background:'var(--blue)', color:'white', border:'none', padding:'8px 16px', borderRadius:50, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>📞 Call</button></a>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* REQUEST */}
        {!loading && tab==='request' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>🆘 Blood Request Post Karo</h2>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:20 }}>Nearby donors aur hospitals ko turant alert milega</p>
            <div className="card">
              <div className="form-row">
                <div className="form-group"><label>Patient ka Naam *</label><input type="text" placeholder="Poora naam" value={reqForm.patientName} onChange={e=>setReqForm(f=>({...f,patientName:e.target.value}))} /></div>
                <div className="form-group"><label>Units Required *</label><input type="number" min={1} max={20} value={reqForm.units} onChange={e=>setReqForm(f=>({...f,units:e.target.value}))} /></div>
              </div>
              <div className="form-group"><label>Hospital ka Naam *</label><input type="text" placeholder="Kahan admit hai?" value={reqForm.hospital} onChange={e=>setReqForm(f=>({...f,hospital:e.target.value}))} /></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Area</label>
                  <select value={reqForm.area} onChange={e=>setReqForm(f=>({...f,area:e.target.value}))}>
                    {AREAS.map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Contact Phone *</label><input type="tel" placeholder="+91 XXXXX XXXXX" value={reqForm.contactPhone} onChange={e=>setReqForm(f=>({...f,contactPhone:e.target.value}))} /></div>
              </div>
              <div className="form-group">
                <label>Blood Group Required *</label>
                <div className="blood-grid">
                  {BT.map(bt => <div key={bt} className={`blood-opt ${reqForm.bloodGroup===bt?'active':''}`} onClick={()=>setReqForm(f=>({...f,bloodGroup:bt}))}>{bt}</div>)}
                </div>
              </div>
              <div className="form-group">
                <label>Urgency</label>
                <select value={reqForm.urgency} onChange={e=>setReqForm(f=>({...f,urgency:e.target.value}))}>
                  <option value="critical">🔴 Critical — Kuch ghanton mein chahiye</option>
                  <option value="urgent">🟡 Urgent — 24 ghante mein</option>
                  <option value="stable">🟢 Stable — 3 din mein</option>
                </select>
              </div>
              <div className="form-group"><label>Extra Notes</label><textarea rows={2} placeholder="Koi special requirement..." value={reqForm.notes} onChange={e=>setReqForm(f=>({...f,notes:e.target.value}))} /></div>
              <button className="btn-red" onClick={postRequest} disabled={posting} style={{ width:'100%', justifyContent:'center' }}>
                {posting ? '⏳ Post ho raha hai...' : '🆘 Blood Request Post Karo'}
              </button>
            </div>
          </div>
        )}

        {/* DONOR */}
        {!loading && tab==='donor' && (
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:6 }}>❤️ Donor Benefits</h2>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:24 }}>Tumhare blood type ki rarity aur fayde</p>
            <div className="grid-2" style={{ marginBottom:28 }}>
              {['O-','AB-','B-','A-','B+','AB+','A+','O+'].map(bt => {
                const rar = RARITY[bt];
                const isMe = user?.bloodGroup === bt;
                return (
                  <div key={bt} style={{ borderRadius:'var(--radius)', padding:22, background:rar.color, color:'white', position:'relative', overflow:'hidden', border:isMe?'3px solid #FFD700':undefined }}>
                    <div style={{ position:'absolute', right:-8, top:-18, fontFamily:"'Baloo 2',cursive", fontSize:80, fontWeight:800, opacity:0.08 }}>{bt}</div>
                    {isMe && <div style={{ position:'absolute', top:10, right:10, background:'#FFD700', color:'#333', borderRadius:50, padding:'2px 10px', fontSize:10, fontWeight:800 }}>TUMHARA TYPE</div>}
                    <div style={{ fontSize:10, fontWeight:800, letterSpacing:1.5, opacity:0.7, marginBottom:4, textTransform:'uppercase' }}>{rar.tier} · {rar.pct}</div>
                    <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:40, fontWeight:800, lineHeight:1, marginBottom:10 }}>{bt}</div>
                    <ul style={{ listStyle:'none', marginBottom:0 }}>
                      {rar.perks.map((p,i) => <li key={i} style={{ fontSize:12, opacity:0.9, padding:'2px 0', display:'flex', alignItems:'center', gap:6 }}><span>✓</span>{p}</li>)}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="card">
              <h3 style={{ fontSize:20, fontWeight:800, marginBottom:6 }}>Donor Bano</h3>
              <p style={{ color:'var(--text2)', fontSize:14, marginBottom:20 }}>Lucknow ke hazaron heroes mein shamil ho</p>
              {user?.isDonor ? (
                <div className="alert alert-green"><span>✅</span><span>Tum pehle se <strong>{user?.bloodGroup}</strong> donor ho!</span></div>
              ) : (
                <>
                  <div className="form-row">
                    <div className="form-group"><label>Wajan (kg)</label><input type="number" min={50} placeholder="Min 50 kg" value={donorForm.weight} onChange={e=>setDonorForm(f=>({...f,weight:e.target.value}))} /></div>
                    <div className="form-group"><label>Aakhri Donation Date</label><input type="date" value={donorForm.lastDonated} onChange={e=>setDonorForm(f=>({...f,lastDonated:e.target.value}))} /></div>
                  </div>
                  <button className="btn-green" onClick={registerAsDonor} disabled={regDonor} style={{ width:'100%', justifyContent:'center' }}>
                    {regDonor ? 'Register ho raha hai...' : '❤️ Donor Register Karo'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* PROFILE */}
        {!loading && tab==='profile' && (
          <div className="card" style={{ maxWidth:460 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--red-light)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Baloo 2',cursive", fontSize:26, fontWeight:800, color:'var(--red)' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize:22, fontWeight:800 }}>{user?.name}</h2>
                <p style={{ color:'var(--text2)', fontSize:14 }}>📍 {user?.area}, Lucknow</p>
              </div>
            </div>
            <div className="grid-2" style={{ marginBottom:20 }}>
              <div style={{ background:'var(--bg)', borderRadius:'var(--radius-sm)', padding:16 }}>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:28, fontWeight:800, color:'var(--red)' }}>{user?.bloodGroup}</div>
                <div style={{ fontSize:13, color:'var(--text2)' }}>Blood Type</div>
              </div>
              <div style={{ background:'var(--bg)', borderRadius:'var(--radius-sm)', padding:16 }}>
                <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:22, fontWeight:800, color:'var(--green)' }}>{user?.isDonor?'Haan':'Nahi'}</div>
                <div style={{ fontSize:13, color:'var(--text2)' }}>Donor Registered</div>
              </div>
            </div>
            {[['📞 Mobile', user?.phone], ['📧 Email', user?.email || '—'], ['🌆 City', 'Lucknow, UP']].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--bg)' }}>
                <span style={{ color:'var(--text2)', fontSize:14 }}>{l}</span>
                <span style={{ fontWeight:600, fontSize:14 }}>{v}</span>
              </div>
            ))}
            {r && (
              <div style={{ marginTop:20, background:r.color, borderRadius:'var(--radius-sm)', padding:16, color:'white' }}>
                <div style={{ fontSize:10, fontWeight:800, opacity:0.7, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>{user?.bloodGroup} — {r.tier}</div>
                <div style={{ fontSize:13, opacity:0.9 }}>Sirf {r.pct} logon ka blood type tumhare jaisa hai.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

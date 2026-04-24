import React, { useState, useEffect } from 'react';
import api   from '../utils/api';
import Navbar from '../components/Navbar';
import toast  from 'react-hot-toast';

const BT    = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const AREAS = ['All Areas','Gomti Nagar','Hazratganj','Aliganj','Indira Nagar','Rajajipuram','Alambagh','Charbagh','Aminabad'];

export default function Donors() {
  const [donors,  setDonors]  = useState([]);
  const [blood,   setBlood]   = useState('all');
  const [area,    setArea]    = useState('All Areas');
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ city:'Lucknow' });
      if (blood !== 'all')        params.append('blood', blood);
      if (area !== 'All Areas')   params.append('area',  area);
      const res = await api.get(`/donors?${params}`);
      setDonors(res.data.data || []);
      if (!res.data.count) toast('Koi donor nahi mila. Filters change karo.');
    } catch { toast.error('Donors load nahi hue.'); }
    setLoading(false);
  };

  useEffect(() => { search(); }, []);

  const avatarColors = ['#C0392B','#1A5276','#1E8449','#7D3C98','#B7770D','#117A65'];

  return (
    <>
      <Navbar />
      <div className="content">
        <h1 style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>👥 Registered Donors — Lucknow</h1>
        <p style={{ color:'var(--text2)', fontSize:15, marginBottom:24 }}>Verified blood donors dhundo blood type aur area se</p>

        <div className="card" style={{ marginBottom:24 }}>
          <div className="form-row">
            <div className="form-group">
              <label>Blood Type</label>
              <select value={blood} onChange={e => setBlood(e.target.value)}>
                <option value="all">Sabhi Types</option>
                {BT.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Area</label>
              <select value={area} onChange={e => setArea(e.target.value)}>
                {AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <button className="btn-red" onClick={search} disabled={loading}>
            {loading ? 'Dhoondh raha hai...' : '🔍 Donors Dhundo'}
          </button>
        </div>

        {loading ? <div className="spinner" /> : donors.length === 0 ? (
          <div className="alert alert-amber">
            <span>ℹ️</span>
            <span>Is combination mein koi donor nahi mila. Filters change karo.</span>
          </div>
        ) : (
          <>
            <p style={{ color:'var(--text2)', fontSize:14, marginBottom:16 }}>
              {donors.length} donor{donors.length!==1?'s':''} mile
            </p>
            {donors.map((d, idx) => (
              <div key={d._id} style={{ background:'white', borderRadius:'var(--radius-sm)', boxShadow:'var(--shadow)', padding:18, marginBottom:12, display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:46, height:46, borderRadius:'50%', background:avatarColors[idx%avatarColors.length], display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, color:'white', fontSize:15, flexShrink:0 }}>
                  {d.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15 }}>
                    {d.name}{' '}
                    <span style={{ fontFamily:"'Baloo 2',cursive", fontSize:18, color:'var(--red)', fontWeight:800 }}>{d.bloodGroup}</span>
                  </div>
                  <div style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>
                    📍 {d.area} &nbsp;·&nbsp; {d.donorProfile?.totalDonations || 0} donations
                  </div>
                </div>
                <button
                  onClick={() => toast.success(`${d.name} ko alert bheja gaya!`)}
                  style={{ background:'var(--green)', color:'white', border:'none', padding:'8px 18px', borderRadius:50, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
                  Contact
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

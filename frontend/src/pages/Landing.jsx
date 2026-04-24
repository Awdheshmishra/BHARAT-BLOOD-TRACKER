import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isLoggedIn, userType } = useAuth();
  const navigate = useNavigate();

  const go = (type) => {
    if (isLoggedIn) { navigate(userType==='hospital' ? '/hospital/dashboard' : '/dashboard'); return; }
    navigate(`/register?type=${type}`);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#8B0000,#C0392B 45%,#E74C3C)', overflow:'hidden', position:'relative' }}>
      {/* BG circles */}
      {[[500,500,-200,-150,null,null],[300,300,null,null,-100,-80],[200,200,'40%',null,null,'30%']].map(([w,h,top,right,bottom,left],i) => (
        <div key={i} style={{ position:'absolute', borderRadius:'50%', background:'rgba(255,255,255,0.04)', width:w, height:h, top, right, bottom, left }} />
      ))}

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px 40px', position:'relative', zIndex:2 }}>
        <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:26, fontWeight:800, color:'white', display:'flex', alignItems:'center', gap:10 }}>
          🩸 Bharat Blood Tracker
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <Link to="/login"    style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'1.5px solid rgba(255,255,255,0.4)', padding:'9px 22px', borderRadius:50, fontSize:14, fontWeight:600, textDecoration:'none' }}>Sign In</Link>
          <Link to="/register" style={{ background:'white', color:'#C0392B', padding:'9px 22px', borderRadius:50, fontSize:14, fontWeight:700, textDecoration:'none' }}>Register Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'60px 24px 40px', position:'relative', zIndex:2 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:50, padding:'6px 16px', fontSize:13, fontWeight:600, color:'white', marginBottom:24 }}>
          📍 Abhi Lucknow mein available · Jald hi poore India mein
        </div>
        <h1 style={{ fontFamily:"'Baloo 2',cursive", fontSize:'clamp(36px,6vw,72px)', fontWeight:800, color:'white', lineHeight:1.1, marginBottom:20 }}>
          Khoon Hai Zindagi.<br/><span style={{ color:'#FFD6D0' }}>Jaldi Dhundo.</span>
        </h1>
        <p style={{ fontSize:18, color:'rgba(255,255,255,0.85)', maxWidth:560, margin:'0 auto 48px', lineHeight:1.6 }}>
          Lucknow ke sabhi hospitals mein real-time blood availability. Donors, hospitals aur patients ko instantly connect karo.
        </p>

        {/* Cards */}
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center', marginBottom:60 }}>
          {[
            { icon:'👤', title:'Patient / Donor Hoon', sub:'Blood dhundo, request karo, donor bano', type:'user' },
            { icon:'🏥', title:'Hospital Hoon',        sub:'Inventory manage karo, donors dhundo', type:'hospital' },
            { icon:'🔍', title:'Guest Browse Karo',    sub:'Bina login ke availability dekho', type:'guest' },
          ].map(c => (
            <div key={c.type}
              onClick={() => c.type==='guest' ? navigate('/search') : go(c.type)}
              style={{ background:'rgba(255,255,255,0.12)', backdropFilter:'blur(10px)', border:'1.5px solid rgba(255,255,255,0.25)', borderRadius:18, padding:'28px 32px', cursor:'pointer', minWidth:200, color:'white', transition:'all .25s', textAlign:'center' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
            >
              <div style={{ fontSize:40, marginBottom:12 }}>{c.icon}</div>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:20, fontWeight:700, marginBottom:6 }}>{c.title}</div>
              <div style={{ fontSize:13, opacity:0.8 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:'flex', gap:40, flexWrap:'wrap', justifyContent:'center', borderTop:'1px solid rgba(255,255,255,0.2)', paddingTop:32, marginBottom:32 }}>
          {[['2,841','Registered Donors'],['5','Partner Hospitals'],['5,200+','Lives Saved'],['8','Blood Types Tracked']].map(([n,l]) => (
            <div key={l} style={{ textAlign:'center', color:'white' }}>
              <div style={{ fontFamily:"'Baloo 2',cursive", fontSize:32, fontWeight:800 }}>{n}</div>
              <div style={{ fontSize:13, opacity:0.75, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}>
          Emergency: <strong style={{ color:'white' }}>112</strong> &nbsp;·&nbsp; Blood Bank Helpline: <strong style={{ color:'white' }}>1800-180-1104</strong>
        </div>
      </div>
    </div>
  );
}

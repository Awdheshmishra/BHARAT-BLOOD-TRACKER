import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth }   from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { isLoggedIn, userType, user, hospital, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const name = userType === 'hospital' ? hospital?.name?.substring(0,16) : user?.name;

  return (
    <header style={{ background:'#C0392B', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 16px rgba(192,57,43,0.3)' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>

        <Link to="/" style={{ fontFamily:"'Baloo 2',cursive", fontSize:22, fontWeight:800, color:'white', textDecoration:'none', whiteSpace:'nowrap' }}>
          🩸 Bharat Blood
        </Link>

        <nav style={{ display:'flex', gap:4, alignItems:'center' }}>
          {[['/', 'Home'], ['/search','Find Blood'], ['/hospitals','Hospitals'], ['/donors','Donors']].map(([to,label]) => (
            <Link key={to} to={to} style={{ color:'rgba(255,255,255,0.85)', textDecoration:'none', padding:'8px 12px', borderRadius:50, fontSize:14, fontWeight:500 }}>
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, color:'rgba(255,255,255,0.8)', fontSize:12, fontWeight:600 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background: connected ? '#4CAF50' : '#f44', display:'inline-block' }} />
            {connected ? 'Live' : 'Off'}
          </div>

          {isLoggedIn ? (
            <>
              <Link to={userType==='hospital' ? '/hospital/dashboard' : '/dashboard'}
                style={{ background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.3)', borderRadius:50, padding:'6px 14px', color:'white', fontSize:13, fontWeight:600, textDecoration:'none', whiteSpace:'nowrap' }}>
                {userType==='hospital' ? '🏥' : '👤'} {name}
              </Link>
              <button onClick={() => { logout(); navigate('/'); }}
                style={{ background:'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.3)', padding:'7px 14px', borderRadius:50, fontSize:13, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    style={{ background:'rgba(255,255,255,0.15)', color:'white', border:'1.5px solid rgba(255,255,255,0.4)', padding:'8px 18px', borderRadius:50, fontSize:13, fontWeight:600, textDecoration:'none' }}>Sign In</Link>
              <Link to="/register" style={{ background:'white', color:'#C0392B', border:'none', padding:'8px 18px', borderRadius:50, fontSize:13, fontWeight:700, textDecoration:'none' }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

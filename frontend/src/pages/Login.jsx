import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api  from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Login() {
  const [type,     setType]     = useState('user');
  const [phone,    setPhone]    = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const { loginUser, loginHospital } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'user') {
        const res = await api.post('/auth/user/login', { phone, password });
        if (res.data.success) {
          loginUser(res.data.token, res.data.user);
          toast.success(`Welcome back, ${res.data.user.name}! 👋`);
          navigate('/dashboard');
        }
      } else {
        const res = await api.post('/auth/hospital/login', { email, password });
        if (res.data.success) {
          loginHospital(res.data.token, res.data.hospital);
          toast.success(`Welcome back, ${res.data.hospital.name}! 🏥`);
          navigate('/hospital/dashboard');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login nahi hua. Check karo.');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div className="card fade-up" style={{ width:'100%', maxWidth:440 }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:48, marginBottom:8 }}>🩸</div>
            <h2 style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>Sign In</h2>
            <p style={{ color:'var(--text2)', fontSize:14 }}>Apne Bharat Blood Tracker account mein login karo</p>
          </div>

          <div className="tabs" style={{ marginBottom:24 }}>
            <button className={`tab-btn ${type==='user'?'active':''}`}     onClick={() => setType('user')}>👤 Patient / Donor</button>
            <button className={`tab-btn ${type==='hospital'?'active':''}`} onClick={() => setType('hospital')}>🏥 Hospital</button>
          </div>

          <form onSubmit={handleSubmit}>
            {type==='user' ? (
              <div className="form-group">
                <label>Mobile Number</label>
                <input type="tel" placeholder="10-digit mobile number" value={phone} onChange={e=>setPhone(e.target.value)} required />
              </div>
            ) : (
              <div className="form-group">
                <label>Hospital Email</label>
                <input type="email" placeholder="hospital@email.com" value={email} onChange={e=>setEmail(e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Password daalo" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <button className="btn-red" type="submit" disabled={loading} style={{ width:'100%', justifyContent:'center', marginBottom:16 }}>
              {loading ? 'Login ho raha hai...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:14, color:'var(--text2)' }}>
            Account nahi hai?{' '}
            <Link to="/register" style={{ color:'var(--red)', fontWeight:700, textDecoration:'none' }}>Register Karo</Link>
          </p>

          <div style={{ marginTop:20, padding:'14px 16px', background:'var(--bg)', borderRadius:'var(--radius-sm)', fontSize:13, color:'var(--text3)' }}>
            <strong style={{ color:'var(--text2)' }}>Seeded hospital login:</strong><br/>
            Email: bloodbank@sgpgi.ac.in<br/>
            Password: Hospital@123
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api  from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar      from '../components/Navbar';
import OtpVerifier from '../components/OtpVerifier';

const BLOOD = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
const AREAS = ['Gomti Nagar','Hazratganj','Aliganj','Indira Nagar','Rajajipuram','Alambagh','Charbagh','Aminabad','Mahanagar','Vikas Nagar'];

export default function Register() {
  const [type,        setType]        = useState('user');
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [bloodGroup,  setBloodGroup]  = useState('');
  const [loading,     setLoading]     = useState(false);

  const [name,  setName]  = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [area,  setArea]  = useState('Gomti Nagar');

  const [hospName,  setHospName]  = useState('');
  const [regNo,     setRegNo]     = useState('');
  const [hospEmail, setHospEmail] = useState('');
  const [hospPhone, setHospPhone] = useState('');
  const [hospPass,  setHospPass]  = useState('');
  const [address,   setAddress]   = useState('');
  const [hospArea,  setHospArea]  = useState('Gomti Nagar');

  const { loginUser, loginHospital } = useAuth();
  const navigate = useNavigate();

  const activePhone = type==='user' ? phone : hospPhone;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) { toast.error('Pehle OTP se mobile verify karo.'); return; }
    if (type==='user' && !bloodGroup) { toast.error('Blood group select karo.'); return; }
    setLoading(true);
    try {
      if (type === 'user') {
        const res = await api.post('/auth/user/register', { name, phone, email, password:pass, bloodGroup, area, otp:verifiedOtp });
        if (res.data.success) {
          loginUser(res.data.token, res.data.user);
          toast.success('🎉 Account ban gaya! Welcome!');
          navigate('/dashboard');
        }
      } else {
        const res = await api.post('/auth/hospital/register', { name:hospName, registrationNo:regNo, email:hospEmail, phone:hospPhone, password:hospPass, address, area:hospArea, otp:verifiedOtp });
        if (res.data.success) {
          loginHospital(res.data.token, res.data.hospital);
          toast.success('🎉 Hospital account ban gaya!');
          navigate('/hospital/dashboard');
        }
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Registration nahi hui.'); }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div className="card fade-up" style={{ width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ fontSize:44, marginBottom:8 }}>🩸</div>
            <h2 style={{ fontSize:26, fontWeight:800, marginBottom:4 }}>Account Banao</h2>
            <p style={{ color:'var(--text2)', fontSize:14 }}>Bharat Blood Tracker join karo — bilkul free</p>
          </div>

          <div className="tabs" style={{ marginBottom:24 }}>
            <button className={`tab-btn ${type==='user'?'active':''}`}     onClick={() => { setType('user');     setOtpVerified(false); }}>👤 Patient / Donor</button>
            <button className={`tab-btn ${type==='hospital'?'active':''}`} onClick={() => { setType('hospital'); setOtpVerified(false); }}>🏥 Hospital</button>
          </div>

          <form onSubmit={handleSubmit}>
            {type==='user' ? (
              <>
                <div className="form-row">
                  <div className="form-group"><label>Poora Naam</label><input type="text" placeholder="Tumhara naam" value={name} onChange={e=>setName(e.target.value)} required /></div>
                  <div className="form-group"><label>Mobile Number</label><input type="tel" placeholder="10-digit number" value={phone} onChange={e=>{ setPhone(e.target.value); setOtpVerified(false); }} required /></div>
                </div>
                <div className="form-group"><label>Email (optional)</label><input type="email" placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)} /></div>
                <div className="form-group">
                  <label>Area / Mohalla</label>
                  <select value={area} onChange={e=>setArea(e.target.value)}>{AREAS.map(a=><option key={a}>{a}</option>)}</select>
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <div className="blood-grid">
                    {BLOOD.map(bt => <div key={bt} className={`blood-opt ${bloodGroup===bt?'active':''}`} onClick={()=>setBloodGroup(bt)}>{bt}</div>)}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group"><label>Hospital ka Naam</label><input type="text" placeholder="Official naam" value={hospName} onChange={e=>setHospName(e.target.value)} required /></div>
                <div className="form-row">
                  <div className="form-group"><label>Registration No.</label><input type="text" placeholder="UP-MCI-XXXXX" value={regNo} onChange={e=>setRegNo(e.target.value)} required /></div>
                  <div className="form-group"><label>Mobile Number</label><input type="tel" placeholder="10-digit" value={hospPhone} onChange={e=>{ setHospPhone(e.target.value); setOtpVerified(false); }} required /></div>
                </div>
                <div className="form-group"><label>Hospital Email</label><input type="email" placeholder="blood@hospital.com" value={hospEmail} onChange={e=>setHospEmail(e.target.value)} required /></div>
                <div className="form-group"><label>Poora Address</label><input type="text" placeholder="Street, Area, Lucknow" value={address} onChange={e=>setAddress(e.target.value)} required /></div>
                <div className="form-group">
                  <label>Area</label>
                  <select value={hospArea} onChange={e=>setHospArea(e.target.value)}>{AREAS.map(a=><option key={a}>{a}</option>)}</select>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Password (min 6 characters)</label>
              <input type="password" placeholder="Strong password daalo" value={type==='user'?pass:hospPass} onChange={e=>type==='user'?setPass(e.target.value):setHospPass(e.target.value)} required minLength={6} />
            </div>

            {!otpVerified ? (
              <OtpVerifier phone={activePhone} purpose="register" userType={type} onVerified={(otp) => { setOtpVerified(true); setVerifiedOtp(otp); }} />
            ) : (
              <div className="alert alert-green" style={{ marginBottom:16 }}>
                <span>✅</span><span>Mobile number verify ho gaya!</span>
              </div>
            )}

            <button className="btn-red" type="submit" disabled={loading || !otpVerified} style={{ width:'100%', justifyContent:'center' }}>
              {loading ? 'Ban raha hai...' : '🎉 Account Banao'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:14, color:'var(--text2)', marginTop:16 }}>
            Pehle se account hai?{' '}
            <Link to="/login" style={{ color:'var(--red)', fontWeight:700, textDecoration:'none' }}>Sign In Karo</Link>
          </p>
        </div>
      </div>
    </>
  );
}

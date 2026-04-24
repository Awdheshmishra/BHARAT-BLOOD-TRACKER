import React, { useRef, useState } from 'react';
import api  from '../utils/api';
import toast from 'react-hot-toast';

export function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const vals = (value + '      ').split('').slice(0, 6);

  const handleChange = (e, i) => {
    const ch = e.target.value.replace(/\D/g,'').slice(-1);
    const n  = [...vals]; n[i] = ch || ' ';
    onChange(n.join('').trimEnd());
    if (ch && i < 5) inputs.current[i+1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key==='Backspace' && !vals[i]?.trim() && i > 0)
      inputs.current[i-1]?.focus();
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    onChange(paste);
    inputs.current[Math.min(paste.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="otp-inputs">
      {Array(6).fill(0).map((_, i) => (
        <input key={i} ref={el => inputs.current[i]=el}
          type="text" inputMode="numeric" maxLength={1}
          value={vals[i]?.trim() || ''}
          onChange={e => handleChange(e,i)}
          onKeyDown={e => handleKeyDown(e,i)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}

export default function OtpVerifier({ phone, purpose='register', userType='user', onVerified }) {
  const [sent,    setSent]    = useState(false);
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [timer,   setTimer]   = useState(0);

  const startTimer = () => {
    setTimer(60);
    const iv = setInterval(() => setTimer(t => { if(t<=1){clearInterval(iv);return 0;} return t-1; }), 1000);
  };

  const sendOtp = async () => {
    const cleaned = phone?.replace(/\D/g,'').slice(-10);
    if (!cleaned || cleaned.length !== 10) { toast.error('Pehle valid 10-digit mobile number daalo.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/otp/send', { phone, purpose, userType });
      if (res.data.success) {
        setSent(true); startTimer();
        toast.success('OTP bheja gaya! Terminal mein dekho (dev mode).');
      }
    } catch (err) { toast.error(err.response?.data?.message || 'OTP nahi aaya. Try again.'); }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (otp.length < 6) { toast.error('6-digit OTP daalo.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/otp/verify', { phone, otp, purpose });
      if (res.data.success) { toast.success('✅ Mobile verify ho gaya!'); onVerified(otp); }
      else toast.error(res.data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Verify nahi hua.'); }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom:16 }}>
      {!sent ? (
        <button type="button" className="btn-outline" onClick={sendOtp} disabled={loading} style={{ width:'100%' }}>
          {loading ? 'Bhej raha hai...' : '📱 OTP se mobile verify karo'}
        </button>
      ) : (
        <div>
          <p style={{ fontSize:14, color:'var(--text2)', textAlign:'center', marginBottom:4 }}>
            <strong>{phone}</strong> par OTP bheja gaya
          </p>
          <p style={{ fontSize:12, color:'var(--text3)', textAlign:'center', marginBottom:8 }}>
            (Dev mode: backend terminal mein dekho)
          </p>
          <OtpInput value={otp} onChange={setOtp} />
          <button type="button" className="btn-red" onClick={verifyOtp} disabled={loading || otp.length < 6}
            style={{ width:'100%', justifyContent:'center', marginBottom:10 }}>
            {loading ? 'Check kar raha hai...' : '✅ OTP Verify Karo'}
          </button>
          <p style={{ fontSize:13, color:'var(--text3)', textAlign:'center' }}>
            {timer > 0 ? `Resend ${timer}s mein` : (
              <button onClick={sendOtp} style={{ background:'none', border:'none', color:'var(--red)', fontWeight:700, cursor:'pointer', fontSize:13 }}>
                Resend OTP
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

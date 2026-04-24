import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef  = useRef(null);
  const [connected,   setConnected]   = useState(false);
  const [liveUpdates, setLiveUpdates] = useState([]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      transports: ['websocket'], reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect',    () => { setConnected(true);  socket.emit('join:city', 'Lucknow'); });
    socket.on('disconnect', () => setConnected(false));

    socket.on('inventory:updated', (data) => {
      setLiveUpdates(p => [{ type:'inventory', ...data, id:Date.now() }, ...p.slice(0,19)]);
    });

    socket.on('inventory:critical', (data) => {
      const groups = data.criticalGroups.map(g => `${g.bloodGroup}(${g.units})`).join(', ');
      toast.error(`⚠️ ${data.hospitalName}: Critical — ${groups}`, { duration:6000 });
      setLiveUpdates(p => [{ type:'critical', ...data, id:Date.now() }, ...p.slice(0,19)]);
    });

    socket.on('request:new', (data) => {
      toast.error(
        `🆘 ${data.patientName} ko ${data.units} unit ${data.bloodGroup} chahiye — ${data.hospital}`,
        { duration:8000, style:{ background:'#C0392B', color:'white', fontWeight:'700' } }
      );
      setLiveUpdates(p => [{ type:'request', ...data, id:Date.now() }, ...p.slice(0,19)]);
    });

    socket.on('request:fulfilled', (data) => {
      toast.success(`✅ Blood request fulfill ho gayi! (${data.bloodGroup})`, { duration:4000 });
      setLiveUpdates(p => [{ type:'fulfilled', ...data, id:Date.now() }, ...p.slice(0,19)]);
    });

    return () => socket.disconnect();
  }, []);

  const joinHospitalRoom = (id) => socketRef.current?.emit('join:hospital', id);

  return (
    <SocketContext.Provider value={{ socket:socketRef.current, connected, liveUpdates, joinHospitalRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

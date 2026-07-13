import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMemberProfile } from '../api/memberAuth';

const MemberAuthContext = createContext(null);

export const useMemberAuth = () => {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error('useMemberAuth must be used within MemberAuthProvider');
  return ctx;
};

export const MemberAuthProvider = ({ children }) => {
  const [member, setMember] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('memberToken');
    if (!token) {
      setMember(null);
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getMemberProfile();
      setUser(data.user);
      setMember(data.member);
    } catch {
      localStorage.removeItem('memberToken');
      localStorage.removeItem('memberUser');
      setMember(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = (token, userData) => {
    localStorage.setItem('memberToken', token);
    localStorage.setItem('memberUser', JSON.stringify(userData));
    setUser(userData);
    setMember(null); // Will be populated by checkAuth on next render
    // Immediately fetch profile to get member data
    getMemberProfile().then(data => {
      setUser(data.user);
      setMember(data.member);
    }).catch(() => {});
  };

  const logout = () => {
    localStorage.removeItem('memberToken');
    localStorage.removeItem('memberUser');
    setMember(null);
    setUser(null);
  };

  return (
    <MemberAuthContext.Provider value={{ user, member, loading, login, logout, checkAuth }}>
      {children}
    </MemberAuthContext.Provider>
  );
};

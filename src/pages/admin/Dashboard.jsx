import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DollarSign, Users, Activity, CreditCard, ArrowUpRight, ArrowDownRight,
  AlertTriangle, CalendarCheck, Bell, History
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../../api/axios';
import { getMembers } from '../../api/members';
import { getPayments } from '../../api/payments';
import { getAttendance } from '../../api/attendance';
import './Dashboard.css';

const StatCard = ({ title, value, subtext, icon: Icon, trend, trendValue, delay }) => (
  <motion.div 
    className="saas-card"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    style={{ padding: '20px' }}
  >
    <div className="flex justify-between items-start" style={{ marginBottom: '12px' }}>
      <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }}>
        <Icon size={20} color="var(--primary)" />
      </div>
      {trend && (
        <div className={`saas-badge ${trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'neutral'}`} style={{ gap: '2px' }}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : trend === 'down' ? <ArrowDownRight size={14} /> : null}
          {trendValue}
        </div>
      )}
    </div>
    <div className="text-secondary font-medium" style={{ fontSize: '13px', marginBottom: '4px' }}>{title}</div>
    <div className="font-bold text-primary" style={{ fontSize: '28px', letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '4px' }}>{value}</div>
    {subtext && <div className="text-tertiary" style={{ fontSize: '12px' }}>{subtext}</div>}
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '12px', borderRadius: '8px', boxShadow: 'var(--shadow-lg)' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }}>{label}</p>
        <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
          {payload[0].name === 'Revenue' ? '$' : ''}{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  
  const [revenueData, setRevenueData] = useState([]);
  const [growthData, setGrowthData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          { data: statsData }, 
          membersData,
          paymentsData
        ] = await Promise.all([
          api.get('/admin/stats'),
          getMembers({ limit: 50 }),
          getPayments({ limit: 50 })
        ]);
        
        setStats(statsData.stats);
        
        const allMembers = membersData.members || [];
        const allPayments = paymentsData.payments || [];
        
        setRecentMembers(allMembers.slice(0, 5));
        setRecentPayments(allPayments.slice(0, 5));

        // Process Revenue Data (Group payments by month)
        const revMap = {};
        allPayments.forEach(p => {
          const d = new Date(p.paymentDate || p.createdAt);
          const key = d.toLocaleString('default', { month: 'short' });
          revMap[key] = (revMap[key] || 0) + p.amount;
        });
        
        // Ensure at least 6 months are shown
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const processedRevData = [];
        for (let i = 5; i >= 0; i--) {
          const m = (currentMonth - i + 12) % 12;
          const monthName = months[m];
          processedRevData.push({ name: monthName, Revenue: revMap[monthName] || 0 });
        }
        setRevenueData(processedRevData);

        // Process Membership Growth Data (Group members by join date)
        const growthMap = {};
        allMembers.forEach(m => {
          const d = new Date(m.joinDate || m.createdAt);
          const key = d.toLocaleString('default', { month: 'short' });
          growthMap[key] = (growthMap[key] || 0) + 1;
        });
        const processedGrowthData = [];
        for (let i = 5; i >= 0; i--) {
          const m = (currentMonth - i + 12) % 12;
          const monthName = months[m];
          processedGrowthData.push({ name: monthName, Members: growthMap[monthName] || 0 });
        }
        setGrowthData(processedGrowthData);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="saas-skeleton" style={{ height: '140px' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          <div className="saas-skeleton" style={{ height: '360px' }} />
          <div className="saas-skeleton" style={{ height: '360px' }} />
        </div>
      </div>
    );
  }

  const subscriptionData = [
    { name: 'Active', value: stats?.activeSubscriptions || 0 },
    { name: 'Expired', value: stats?.expiredSubscriptions || 0 },
    { name: 'Pending', value: stats?.pendingRenewals || 0 }
  ];
  const PIE_COLORS = ['var(--success)', 'var(--danger)', 'var(--warning)'];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>Overview</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Monitor your gym's performance, revenue, and active members.</p>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <StatCard 
          title="Total Revenue" 
          value={`$${stats?.totalRevenue?.toLocaleString() || '0'}`} 
          subtext="Lifetime collections"
          icon={DollarSign} 
          trend="up" trendValue="12%" delay={0} 
        />
        <StatCard 
          title="Today's Collections" 
          value={`$${stats?.todayCollections?.toLocaleString() || '0'}`} 
          subtext="Revenue collected today"
          icon={CreditCard} 
          trend={stats?.todayCollections > 0 ? "up" : "neutral"} trendValue={stats?.todayCollections > 0 ? "Active" : "-"} delay={0.1} 
        />
        <StatCard 
          title="Total Members" 
          value={stats?.totalMembers || '0'} 
          subtext={`${stats?.activeMembers || 0} active memberships`}
          icon={Users} 
          trend="up" trendValue="5%" delay={0.2} 
        />
        <StatCard 
          title="Today's Attendance" 
          value={stats?.todayAttendance || '0'} 
          subtext="Check-ins today"
          icon={CalendarCheck} 
          trend={stats?.todayAttendance > 0 ? "up" : "neutral"} trendValue={stats?.todayAttendance > 0 ? "Active" : "-"} delay={0.3} 
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Revenue Trend */}
        <motion.div className="saas-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }} style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>Revenue Trend (Last 6 Months)</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Revenue" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Member Growth */}
        <motion.div className="saas-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.5 }} style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>Membership Growth</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Members" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Subscriptions Pie & Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Subscriptions */}
        <motion.div className="saas-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.6 }} style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>Subscription Distribution</h3>
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subscriptionData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', gap: '12px', right: '10%' }}>
              {subscriptionData.map((entry, index) => (
                <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: PIE_COLORS[index] }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', width: '60px' }}>{entry.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Members */}
        <motion.div className="saas-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.7 }} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Members</h3>
            <button onClick={() => navigate('/admin/members')} className="text-primary text-xs font-medium hover:underline">View All</button>
          </div>
          <div style={{ padding: '0 8px' }}>
            {recentMembers.length > 0 ? recentMembers.map(member => (
              <div key={member._id} className="flex items-center justify-between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-focus)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                    {member.fullName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{member.fullName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{member.email}</div>
                  </div>
                </div>
                <div className={`saas-badge ${member.status === 'active' ? 'success' : 'danger'}`}>
                  {member.status}
                </div>
              </div>
            )) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>No recent members</div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;

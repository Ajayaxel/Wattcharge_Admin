import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import StatsGrid from '../components/StatsGrid';
import GridLoadChart from '../components/GridLoadChart';
import ControlDeck from '../components/ControlDeck';
import api from '../../../core/api/axios';

export default function DashboardPage() {
  const { isDemoMode } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    categories: 0,
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      setStats(prev => ({ ...prev, isLoading: true }));
      if (isDemoMode) {
        if (isMounted) setStats({ users: 15, products: 24, categories: 8, isLoading: false });
        return;
      }
      try {
        const [usersRes, productsRes, categoriesRes] = await Promise.all([
          api.get('/auth/users'),
          api.get('/products?isAdmin=true'),
          api.get('/categories')
        ]);
        
        if (isMounted) {
          setStats({
            users: usersRes.data?.data?.length || 0,
            products: productsRes.data?.data?.length || 0,
            categories: categoriesRes.data?.data?.length || 0,
            isLoading: false
          });
        }
      } catch (error) {
        console.error("Error fetching stats", error);
        if (isMounted) setStats(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    fetchStats();
    return () => { isMounted = false; };
  }, [isDemoMode]);

  return (
    <div className="space-y-6">
      {/* Stats widgets Row */}
      <StatsGrid stats={stats} />

      {/* Graphical Analytics and Active Charger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GridLoadChart />
        <ControlDeck />
      </div>
    </div>
  );
}

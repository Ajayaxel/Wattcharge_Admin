import React from 'react';
import { useSelector } from 'react-redux';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import UsersPage from '../features/users/pages/UsersPage';
import VehiclesPage from '../features/vehicles/pages/VehiclesPage';
import BrandsPage from '../features/brands/pages/BrandsPage';
import CategoriesPage from '../features/categories/pages/CategoriesPage';
import ServicesPage from '../features/services/pages/ServicesPage';
import ProductsPage from '../features/store/pages/ProductsPage';
import BookingsPage from '../features/bookings/pages/BookingsPage';
import SettingsPage from '../features/settings/pages/SettingsPage';
import CompaniesPage from '../features/company/pages/CompaniesPage';
import CompanyCodesPage from '../features/company/pages/CompanyCodesPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import PostsPage from '../features/posts/pages/PostsPage';
import ChatPage from '../features/chat/pages/ChatPage';
import NotificationPage from '../features/notification/pages/NotificationPage';
import TripsPage from '../features/trips/pages/TripsPage';
import PaymentPage from '../features/payment/pages/PaymentPage';

/**
 * Custom light state-based router.
 * Evaluates session authentication and switches primary panel views.
 */
export default function AppRoutes({ activeTab }) {
  const { isAuthenticated, isDemoMode } = useSelector((state) => state.auth);

  if (!isAuthenticated && !isDemoMode) {
    return <LoginPage />;
  }

  switch (activeTab) {
    case 'dashboard':
      return <DashboardPage />;
    case 'users':
      return <UsersPage />;
    case 'vehicles':
      return <VehiclesPage />;
    case 'brands':
      return <BrandsPage />;
    case 'categories':
      return <CategoriesPage />;
    case 'services':
      return <ServicesPage />;
    case 'products':
      return <ProductsPage />;
    case 'bookings':
      return <BookingsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'companies':
      return <CompaniesPage />;
    case 'companyCodes':
      return <CompanyCodesPage />;
    case 'profile':
      return <ProfilePage />;
    case 'posts':
      return <PostsPage />;
    case 'chat':
      return <ChatPage />;
    case 'notification':
      return <NotificationPage />;
    case 'trips':
      return <TripsPage />;
    case 'payment':
      return <PaymentPage />;
    default:
      return <DashboardPage />;
  }
}

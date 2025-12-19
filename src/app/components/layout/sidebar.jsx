'use client';

import { 
  LayoutDashboard, 
  Users, 
  CheckCircle, 
  Briefcase, 
  FileText, 
  Calendar,
  X,
  Image,
  
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [pendingCounts, setPendingCounts] = useState({
    members: 0,
    jobs: 0,
    blogs: 0,
    events: 0,
    total: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch pending counts
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        // Fetch all pending counts in parallel
        const [membersRes, jobsRes, blogsRes, eventsRes] = await Promise.all([
          axios.get(`${API_URL}/admin/members/pending`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/admin/jobs/pending`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/admin/blogs/pending`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/admin/events/pending`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const counts = {
          members: membersRes.data.length,
          jobs: jobsRes.data.length,
          blogs: blogsRes.data.length,
          events: eventsRes.data.length,
        };

        counts.total = counts.members + counts.jobs + counts.blogs + counts.events;

        setPendingCounts(counts);
      } catch (err) {
        console.error('Error fetching pending counts:', err);
      }
    };

    fetchPendingCounts();

    // Refresh counts every 30 seconds
    const interval = setInterval(fetchPendingCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Disable body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Cleanup function
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', badge: null, href: '/admin/dashboard' },
    { icon: Users, label: 'Members', badge: pendingCounts.members, href: '/admin/members' },
    { icon: CheckCircle, label: 'Approvals', badge: pendingCounts.total, href: '/admin/approvals' },
    { icon: Briefcase, label: 'Jobs', badge: pendingCounts.jobs, href: '/admin/jobs' },
    { icon: FileText, label: 'Blogs', badge: pendingCounts.blogs, href: '/admin/blogs' },
    { icon: Calendar, label: 'Events', badge: pendingCounts.events, href: '/admin/events' },
     { icon: Image, label: 'Gallery / Good Wishes', href: '/admin/gallery' },
     { icon: FileText, label: 'FeedBacks', href: '/admin/feedbacks' },
  ];

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile Overlay - Prevents touch scroll */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/70 z-[90] backdrop-blur-sm"
          onClick={onClose}
          onTouchMove={(e) => e.preventDefault()}
          style={{ touchAction: 'none' }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-[100]
          w-64 h-screen
          bg-linear-to-b from-[#0D2847] to-[#1a3a5c]
          flex flex-col
          transition-transform duration-300 ease-in-out
          shadow-2xl
          overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo Section */}
        <div className="p-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="/logo1.png" 
              alt="KEA Logo" 
              className="h-20 object-contain"
            />
          </div>
        </div>

        {/* Navigation - Only this section scrolls */}
        <nav className="flex-1 p-4 overflow-y-auto overscroll-contain">
          <p className="text-xs font-semibold text-blue-300 mb-3 px-3">Main</p>
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={index}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                      active
                        ? 'bg-white/10 text-white font-medium backdrop-blur border border-white/20'
                        : 'text-blue-100 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 min-w-[20px] text-center">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Help Section */}
        {/* <div className="p-4 border-t border-white/10 shrink-0">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
            <p className="text-sm font-semibold text-white mb-1">Need help?</p>
            <p className="text-xs text-blue-200 mb-3">View admin docs and support resources.</p>
            <button className="text-xs text-white font-medium hover:underline">
              Learn more →
            </button>
          </div>
        </div> */}
      </aside>
    </>
  );
}
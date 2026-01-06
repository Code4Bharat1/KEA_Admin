'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

import {
  LayoutDashboard,
  Users,
  CheckCircle,
  Briefcase,
  FileText,
  Calendar,
  Image,
  MessageSquare,
  UsersRound,
  MessagesSquare,
  Presentation,
  Wrench,
  X
} from 'lucide-react';

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

        counts.total =
          counts.members + counts.jobs + counts.blogs + counts.events;

        setPendingCounts(counts);
      } catch (error) {
        console.error('Error fetching pending counts:', error);
      }
    };

    fetchPendingCounts();
    const interval = setInterval(fetchPendingCounts, 30000);
    return () => clearInterval(interval);
  }, [API_URL]);

  // Disable body scroll when sidebar is open (mobile)
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      const scrollY = window.scrollY;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', badge: null, href: '/admin/dashboard' },
    { icon: Users, label: 'Members',  href: '/admin/members' },
    { icon: CheckCircle, label: 'Approvals', href: '/admin/approvals' },
    { icon: Briefcase, label: 'Jobs', href: '/admin/jobs' },
    { icon: FileText, label: 'Blogs',  href: '/admin/blogs' },
    { icon: Calendar, label: 'Events',  href: '/admin/events' },
    { icon: Image, label: 'Gallery / Good Wishes', badge: null, href: '/admin/gallery' },
    { icon: MessageSquare, label: 'Feedbacks', badge: null, href: '/admin/feedbacks' },
    { icon: UsersRound, label: 'Groups', badge: null, href: '/admin/group' },
    { icon: MessagesSquare, label: 'Forums', badge: null, href: '/admin/forums' },
    { icon: Presentation, label: 'Seminars', badge: null, href: '/admin/seminars' },
    { icon: Wrench, label: 'Tools', badge: null, href: '/admin/tools' },
  ];

  const isActive = (href) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-[90]"
          onClick={onClose}
        />
      )}

     <aside
  className={`fixed top-0 left-0 z-[100] w-64 h-screen
  bg-linear-to-b from-[#0D2847] to-[#1a3a5c]
  transition-transform duration-300
  flex flex-col
  ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
>
  {/* Close button */}
  <button
    onClick={onClose}
    className="lg:hidden absolute top-4 right-4 text-white"
  >
    <X />
  </button>

  {/* ✅ LOGO – FIXED */}
  <div className="p-6 border-b border-white/10 shrink-0">
    <div className="flex items-center justify-center">
      <img
        src="/logo1.png"
        alt="KEA Logo"
        className="h-20 object-contain"
      />
    </div>
  </div>

  {/* ✅ NAV – SCROLLABLE */}
  <nav className="flex-1 p-4 overflow-y-auto overscroll-contain">
    <ul className="space-y-1">
      {menuItems.map((item, i) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <li key={i}>
            <Link
              href={item.href}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition
              ${active ? 'bg-white/10 text-white' : 'text-blue-100 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge > 0 && (
                <span className="bg-red-500 text-xs px-2 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  </nav>
</aside>

    </>
  );
}

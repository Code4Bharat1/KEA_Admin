'use client';

import React from 'react';
import MemberDetails from '@/app/components/member/memberdetails/MemberDetails';


export default function MemberDetailPage({ params }) {
  const { memberId } = params;
  return <MemberDetails memberId={memberId} />;
}
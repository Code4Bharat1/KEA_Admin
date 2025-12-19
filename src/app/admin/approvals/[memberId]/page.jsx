'use client';

import React from 'react';

import MemberDetails from '../../../components/member/memberdetails/Memberdetails';

export default function MemberDetailPage({ params }) {
  const { memberId } = params;
  return <MemberDetails memberId={memberId} />;
}
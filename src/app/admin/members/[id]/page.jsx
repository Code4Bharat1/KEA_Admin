import React from 'react';
import MemberDetails from "@/app/components/member/memberdetails/MemberDetails";


const page = async ({ params }) => {
  const { id } = await params;
  console.log("Member ID from params:", id);
  return (
    <div>
      <MemberDetails id={id} />;
    </div>
  )
}

export default page;

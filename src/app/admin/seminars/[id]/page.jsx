import React from 'react';
import SeminarDetailsPage from '@/app/components/Seminars/SeminarDetailsPage';


const page = async ({ params }) => {
  const { id } = await params;
//   console.log("Member ID from params:", id);
  return (
    <div>
      <SeminarDetailsPage id={id} />;
    </div>
  )
}

export default page;

import React from 'react';
import JobDetails from '@/app/components/Jobs/JobDetails';


const page = async ({ params }) => {
  const { id } = await params;
  console.log("Member ID from params:", id);
  return (
    <div>
      <JobDetails id={id} />;
    </div>
  )
}

export default page;

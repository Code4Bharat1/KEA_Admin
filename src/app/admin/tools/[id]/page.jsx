import React from 'react';
import ToolDetailsPage from '@/app/components/Tools/ToolDetailsPage';


const page = async ({ params }) => {
  const { id } = await params;
//   console.log("Member ID from params:", id);
  return (
    <div>
      <ToolDetailsPage id={id} />;
    </div>
  )
}

export default page;

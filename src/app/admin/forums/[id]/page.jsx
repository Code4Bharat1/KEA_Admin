import React from 'react';
import ForumThreadDetails from '@/app/components/Forums/ForumThreadDetails';


const page = async ({ params }) => {
  const { id } = await params;
//   console.log("Member ID from params:", id);
  return (
    <div>
      <ForumThreadDetails id={id} />;
    </div>
  )
}

export default page;

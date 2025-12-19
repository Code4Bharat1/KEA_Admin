import React from 'react';
import EventDetails from '@/app/components/events/EventDetails';


const page = async ({ params }) => {
  const { id } = await params;
  console.log("Member ID from params:", id);
  return (
    <div>
      <EventDetails id={id} />;
    </div>
  )
}

export default page;

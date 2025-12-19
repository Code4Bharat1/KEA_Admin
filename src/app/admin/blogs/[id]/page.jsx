import React from 'react';
import BlogDetails from '@/app/components/Blogs/BlogDetails';


const page = async ({ params }) => {
  const { id } = await params;
  console.log("Member ID from params:", id);
  return (
    <div>
      <BlogDetails id={id} />;
    </div>
  )
}

export default page;

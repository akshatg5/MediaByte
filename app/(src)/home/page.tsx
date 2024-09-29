import Link from 'next/link';
import React from 'react';

const ServiceCard = ({ title, description, icon,link } : any) => (
    <Link href={link}>
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="text-3xl mb-4">{icon}</div>
    <h3 className="text-xl text-slate-900 font-semibold mb-2">{title}</h3>
    <p className="text-neutral-600">{description}</p>
  </div>
    </Link>
);

const Dashboard = () => {
  const services = [
    {
      title: "Videos",
      description: "All Videos",
      icon: "🎥",
      link: "/videos"
    },
    {
      title: "Cropper",
      description: "Customize your photos!",
      icon: "✂️",
      link : "/cropper"
    },
    {
      title: "Video Upload",
      description: "Upload videos, compress them!",
      icon: "⬆️",
      link : "/video"
    },
    {
      title: "UI Generator (Beta)",
      description: "Enter prompt, generate UI!",
      icon: "🎨",
      link : "/generate-ui"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl text-slate-900 font-bold mb-8 text-center">MediaByte Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <ServiceCard key={index} {...service} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
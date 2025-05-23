
import React from "react";
import { Zap, Shield, BarChart, Clock, Users, Code } from "lucide-react";

const features = [
  {
    title: "Lightning Fast",
    description: "Our optimized infrastructure ensures your application loads in milliseconds, not seconds.",
    icon: <Zap className="h-10 w-10 text-blue-600" />,
  },
  {
    title: "Bank-Grade Security",
    description: "Enterprise-level security with end-to-end encryption and regular security audits.",
    icon: <Shield className="h-10 w-10 text-blue-600" />,
  },
  {
    title: "Advanced Analytics",
    description: "Gain deep insights into your users' behavior with our powerful analytics tools.",
    icon: <BarChart className="h-10 w-10 text-blue-600" />,
  },
  {
    title: "Time-Saving Automations",
    description: "Automate repetitive tasks and focus on what matters most for your business.",
    icon: <Clock className="h-10 w-10 text-blue-600" />,
  },
  {
    title: "Team Collaboration",
    description: "Work seamlessly with your team with real-time collaboration features.",
    icon: <Users className="h-10 w-10 text-blue-600" />,
  },
  {
    title: "Developer Friendly",
    description: "Extensive API documentation and developer tools for custom integrations.",
    icon: <Code className="h-10 w-10 text-blue-600" />,
  },
];

const Features = () => {
  return (
    <div id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Everything you need to succeed</p>
          <p className="mt-5 max-w-prose mx-auto text-xl text-slate-500">
            Our platform provides all the tools you need to build, launch, and scale your digital products.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="relative p-6 bg-white border border-slate-100 rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <div className="mb-5">{feature.icon}</div>
              <h3 className="text-xl font-medium text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;


import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    content:
      "This platform has completely transformed how we approach our projects. The interface is intuitive and the features are exactly what we needed.",
    author: "Sarah Johnson",
    role: "Product Manager at TechCorp",
  },
  {
    content:
      "We've tried many solutions before, but nothing compares to this. The speed and reliability have saved us countless hours of development time.",
    author: "Michael Chen",
    role: "CTO at GrowthWave",
  },
  {
    content:
      "The customer support is outstanding. Any time we've had questions, the team has been quick to respond and incredibly helpful.",
    author: "Emma Rodriguez",
    role: "Founder of DesignMasters",
  },
];

const Testimonials = () => {
  return (
    <div id="testimonials" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Testimonials</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Trusted by businesses worldwide</p>
          <p className="mt-5 max-w-prose mx-auto text-xl text-slate-500">
            Don't just take our word for it. Here's what our clients have to say about us.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-slate-100"
            >
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6">{testimonial.content}</p>
              <div>
                <p className="font-medium text-slate-900">{testimonial.author}</p>
                <p className="text-sm text-slate-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;

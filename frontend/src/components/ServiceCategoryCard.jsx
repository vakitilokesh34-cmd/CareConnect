import React from 'react';
import { ArrowRight, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCategoryCard = ({ category }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            {category.icon || <Wrench className="w-6 h-6" />}
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
            From ₹{category.basePrice || 350}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors mb-1">
          {category.name}
        </h3>
        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-4">
          {category.description}
        </p>

        {category.requiredSkills && category.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {category.requiredSkills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="text-[10px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <Link
        to={`/providers?category=${category._id}`}
        className="inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700"
      >
        <span>Browse Professionals</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};

export default ServiceCategoryCard;

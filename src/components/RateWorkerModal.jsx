import React, { useState } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';

export default function RateWorkerModal({ worker, onSubmitRating, onClose }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitRating({ stars, comment });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl border border-slate-100 animate-slide-up">
        {/* Worker Avatar */}
        <div className="mx-auto w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-600 shadow-md mb-3">
          <img
            src={worker?.photoUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200'}
            alt="Worker"
            className="w-full h-full object-cover"
          />
        </div>

        <h3 className="text-lg font-bold text-slate-900">How was your service?</h3>
        <p className="text-xs text-slate-500 font-medium mb-4">
          Rate {worker?.name || 'Arjun K.'} for their completed service
        </p>

        {/* 5-Star Selector */}
        <div className="flex justify-center space-x-2 mb-5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setStars(star)}
              className="p-1 transform hover:scale-125 transition-transform"
            >
              <Star
                className={`w-7 h-7 ${
                  star <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Optional Comment Textarea */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a brief review for the cooperative (optional)..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-5 resize-none h-20"
        />

        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-3 rounded-xl text-xs"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className="flex-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/20"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}

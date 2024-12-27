// components/admin/ApplicationReview.jsx

import React, { useState } from 'react';

const ApplicationReview = ({ application, onSubmitReview }) => {
    const [review, setReview] = useState({
        score: 0,
        comments: '',
        status: 'under_review'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmitReview(review);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Application Review</h2>
            
            {/* Display application details */}
            <div className="mb-4">
                <h3 className="font-semibold">Applicant Details</h3>
                <p>Name: {application.applicant.profile.firstName} {application.applicant.profile.lastName}</p>
                <p>GPA: {application.academicInfo.gpa}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Score (0-100)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={review.score}
                        onChange={(e) => setReview({...review, score: Number(e.target.value)})}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Comments
                    </label>
                    <textarea
                        value={review.comments}
                        onChange={(e) => setReview({...review, comments: e.target.value})}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        rows="4"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Status
                    </label>
                    <select
                        value={review.status}
                        onChange={(e) => setReview({...review, status: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                        <option value="under_review">Under Review</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                    Submit Review
                </button>
            </form>
        </div>
    );
};

export default ApplicationReview;
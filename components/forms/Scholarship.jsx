// components/forms/ScholarshipForm.jsx

import React, { useState } from 'react';

const ScholarshipForm = ({ initialData, onSubmit }) => {
    const [formData, setFormData] = useState(initialData || {
        title: '',
        description: '',
        amount: 0,
        deadline: '',
        requirements: {
            gpa: 0,
            academicLevel: 'undergraduate',
            fieldOfStudy: [],
            documents: []
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
            </div>

            {/* Add other fields similarly */}
            
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Amount
                </label>
                <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
            </div>

            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
                Save Scholarship
            </button>
        </form>
    );
};

export default ScholarshipForm;
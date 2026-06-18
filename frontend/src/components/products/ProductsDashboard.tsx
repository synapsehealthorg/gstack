import React from 'react';
import { TemplateGallery } from './TemplateGallery';

export default function ProductsDashboard() {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-sm text-gray-500 mt-1">Your library of finished, order-ready items.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Import Techpack
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-900 transition-colors">
                + New Product
              </button>
            </div>
          </div>

          <div className="mb-12 bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No configured products yet</h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Choose a blank template below to start building your product in the configurator, or import an existing techpack.
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">Start from a Template</h2>
            <p className="text-sm text-gray-500">Pick a blank garment to configure</p>
            <TemplateGallery />
          </div>
        </div>
      </div>
    </div>
  );
}

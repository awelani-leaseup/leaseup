'use client';

import { useState, useEffect } from 'react';

const DashboardPreview = () => {
  return (
    <div className="bg-[#ECF0F1] p-8 rounded-2xl *:text-left">
      <div className="max-w-[1392px] w-[1392px] mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2D3436]">Dashboard</h1>
              <p className="text-[#7F8C8D] mt-2">Welcome back, John! Here's your property overview.</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button className="bg-white border border-gray-200 text-[#2D3436] px-4 py-2 rounded-lg flex items-center">
                <i className="fa-solid fa-download mr-2"></i>
                Export
              </button>
              <button className="bg-[#3498DB] text-white px-4 py-2 rounded-lg flex items-center">
                <i className="fa-solid fa-plus mr-2"></i>
                Add Property
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-building text-[#3498DB] text-xl"></i>
              </div>
              <span className="text-[#7F8C8D]">Properties</span>
            </div>
            <h3 className="text-3xl font-bold text-[#2D3436]">12</h3>
            <p className="text-[#7F8C8D] text-sm mt-2">2 added this month</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-users text-[#2ECC71] text-xl"></i>
              </div>
              <span className="text-[#7F8C8D]">Tenants</span>
            </div>
            <h3 className="text-3xl font-bold text-[#2D3436]">48</h3>
            <p className="text-[#7F8C8D] text-sm mt-2">95% occupancy rate</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-money-bill-wave text-[#F39C12] text-xl"></i>
              </div>
              <span className="text-[#7F8C8D]">Revenue</span>
            </div>
            <h3 className="text-3xl font-bold text-[#2D3436]">$52.5k</h3>
            <p className="text-sm text-[#2ECC71] mt-2 flex items-center">
              <i className="fa-solid fa-arrow-up mr-1"></i>
              8.2% from last month
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-triangle-exclamation text-[#E74C3C] text-xl"></i>
              </div>
              <span className="text-[#7F8C8D]">Pending Issues</span>
            </div>
            <h3 className="text-3xl font-bold text-[#2D3436]">5</h3>
            <p className="text-[#7F8C8D] text-sm mt-2">3 maintenance requests</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3436]">Recent Activity</h2>
                <button className="text-[#3498DB] text-sm">View All</button>
              </div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <i className="fa-solid fa-key text-[#3498DB]"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2D3436]">New lease signed for <span className="font-medium">Apt #304</span></p>
                    <p className="text-sm text-[#7F8C8D] mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <i className="fa-solid fa-dollar-sign text-[#2ECC71]"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2D3436]">Rent payment received from <span className="font-medium">Sarah Johnson</span></p>
                    <p className="text-sm text-[#7F8C8D] mt-1">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-4">
                    <i className="fa-solid fa-wrench text-[#E74C3C]"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#2D3436]">Maintenance request submitted for <span className="font-medium">Apt #201</span></p>
                    <p className="text-sm text-[#7F8C8D] mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3436]">Properties Overview</h2>
                <button className="text-[#3498DB] text-sm">Manage Properties</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <img className="w-16 h-16 rounded-lg object-cover mr-4" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d13f0792a2-ef656867d059193c23ad.png" alt="Property" />
                    <div>
                      <h3 className="font-medium text-[#2D3436]">Parkview Apartments</h3>
                      <p className="text-sm text-[#7F8C8D]">12 units • 95% occupied</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7F8C8D]">Monthly Revenue</span>
                    <span className="text-[#2D3436] font-medium">$24,500</span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <img className="w-16 h-16 rounded-lg object-cover mr-4" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d13f0792a2-ef656867d059193c23ad.png" alt="Property" />
                    <div>
                      <h3 className="font-medium text-[#2D3436]">Riverside Complex</h3>
                      <p className="text-sm text-[#7F8C8D]">8 units • 100% occupied</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7F8C8D]">Monthly Revenue</span>
                    <span className="text-[#2D3436] font-medium">$18,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Upcoming Payments */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#2D3436] mb-6">Upcoming Payments</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#ECF0F1] rounded-lg">
                  <div className="flex items-center">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg" alt="Tenant" className="w-8 h-8 rounded-full mr-3" />
                    <div>
                      <p className="text-[#2D3436] font-medium">Sarah Johnson</p>
                      <p className="text-sm text-[#7F8C8D]">Due Apr 25, 2025</p>
                    </div>
                  </div>
                  <span className="font-medium text-[#2D3436]">$1,200</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#ECF0F1] rounded-lg">
                  <div className="flex items-center">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" alt="Tenant" className="w-8 h-8 rounded-full mr-3" />
                    <div>
                      <p className="text-[#2D3436] font-medium">Michael Smith</p>
                      <p className="text-sm text-[#7F8C8D]">Due Apr 28, 2025</p>
                    </div>
                  </div>
                  <span className="font-medium text-[#2D3436]">$1,450</span>
                </div>
              </div>
            </div>

            {/* Maintenance Requests */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#2D3436] mb-6">Maintenance Requests</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-[#E74C3C] pl-4">
                  <p className="text-[#2D3436] font-medium">Broken Heater</p>
                  <p className="text-sm text-[#7F8C8D]">Apt #201 • Urgent</p>
                  <p className="text-sm text-[#7F8C8D] mt-1">Reported 2 days ago</p>
                </div>
                <div className="border-l-4 border-[#F39C12] pl-4">
                  <p className="text-[#2D3436] font-medium">Leaking Faucet</p>
                  <p className="text-sm text-[#7F8C8D]">Apt #304 • Normal</p>
                  <p className="text-sm text-[#7F8C8D] mt-1">Reported 1 day ago</p>
                </div>
              </div>
            </div>

            {/* Lease Renewals */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-[#2D3436] mb-6">Upcoming Lease Renewals</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#2D3436] font-medium">Apt #102</p>
                    <p className="text-sm text-[#7F8C8D]">Expires in 15 days</p>
                  </div>
                  <button className="text-[#3498DB] text-sm">Review</button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#2D3436] font-medium">Apt #305</p>
                    <p className="text-sm text-[#7F8C8D]">Expires in 30 days</p>
                  </div>
                  <button className="text-[#3498DB] text-sm">Review</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertiesPreview = () => {
  return (
    <div className="bg-[#ECF0F1] p-8 rounded-2xl *:text-left">
      <div className="max-w-[1392px] w-[1392px] mx-auto">
        {/* Properties Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#2D3436]">Properties</h1>
            <p className="text-[#7F8C8D]">Manage your rental properties</p>
          </div>
          <button className="bg-[#3498DB] text-white px-4 py-2 rounded-lg flex items-center mt-4 md:mt-0">
            <i className="fa-solid fa-plus mr-2"></i>
            Add Property
          </button>
        </div>

        {/* Properties Filter */}
        <div className="bg-white rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input type="text" placeholder="Search properties..." className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3498DB]" />
            </div>
            <div>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3498DB]">
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
              </select>
            </div>
            <div>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3498DB]">
                <option value="">All Status</option>
                <option value="occupied">Occupied</option>
                <option value="vacant">Vacant</option>
                <option value="maintenance">Under Maintenance</option>
              </select>
            </div>
            <div>
              <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3498DB]">
                <option value="">Sort By</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-high">Highest Rent</option>
                <option value="price-low">Lowest Rent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="space-y-6">
          {/* Property Item 1 */}
          <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-64 h-48 relative">
                <img className="w-full h-full object-contain bg-gray-50" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/0df9eb9634-639e150add565c0ac2fa.png" alt="satellite map view of 123 Park Avenue New York NY showing street layout and building locations" />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className="bg-[#2ECC71]/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    Occupied
                  </span>
                  <span className="bg-[#3498DB]/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    4 Units
                  </span>
                </div>
              </div>
              <div className="flex-1 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-[#2D3436] mb-1.5">Parkview Apartments</h3>
                    <div className="flex items-center text-[#7F8C8D] text-sm mb-4">
                      <i className="fa-solid fa-location-dot mr-2"></i>
                      <p>123 Park Avenue, New York, NY</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#2D3436]">$4,800<span className="text-xs font-normal text-[#7F8C8D] ml-1">/mo total</span></p>
                    <p className="text-sm text-[#7F8C8D]">$1,200 per unit</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-[#2D3436]">Units Overview</h4>
                    <button className="text-sm text-[#3498DB] hover:underline">Manage Units</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <div className="text-sm text-[#7F8C8D] mb-1">Unit #201</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2ECC71]"></span>
                        <span className="text-sm">Occupied</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <div className="text-sm text-[#7F8C8D] mb-1">Unit #202</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#F39C12]"></span>
                        <span className="text-sm">Vacant</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <div className="text-sm text-[#7F8C8D] mb-1">Unit #203</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2ECC71]"></span>
                        <span className="text-sm">Occupied</span>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-100">
                      <div className="text-sm text-[#7F8C8D] mb-1">Unit #204</div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2ECC71]"></span>
                        <span className="text-sm">Occupied</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm text-[#3498DB] bg-[#3498DB]/5 rounded-lg hover:bg-[#3498DB] hover:text-white transition-colors">
                      <i className="fa-solid fa-edit mr-1.5"></i>Edit
                    </button>
                    <button className="px-3 py-1.5 text-sm text-[#3498DB] bg-[#3498DB]/5 rounded-lg hover:bg-[#3498DB] hover:text-white transition-colors">
                      <i className="fa-solid fa-eye mr-1.5"></i>View
                    </button>
                  </div>
                  <div className="flex items-center text-[#7F8C8D] text-sm">
                    <i className="fa-solid fa-clock mr-2 text-xs"></i>
                    <span>Last updated: Apr 15, 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Item 2 */}
          <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-64 h-48 relative">
                <img className="w-full h-full object-contain bg-gray-50" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d0202d2baf-c80f43c234e1a2bbe223.png" alt="satellite map view of 456 Main Street Brooklyn NY showing street intersection and neighborhood layout" />
                <span className="absolute top-3 right-3 bg-[#F39C12]/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                  Vacant
                </span>
              </div>
              <div className="flex-1 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-[#2D3436] mb-1.5">Downtown Townhouse</h3>
                    <div className="flex items-center text-[#7F8C8D] text-sm mb-4">
                      <i className="fa-solid fa-location-dot mr-2"></i>
                      <p>456 Main St, Brooklyn, NY</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-[#2D3436]">$2,500<span className="text-xs font-normal text-[#7F8C8D] ml-1">/mo</span></p>
                </div>
                <div className="flex flex-wrap items-center gap-5 mb-5">
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    <i className="fa-solid fa-bed text-[#3498DB] mr-2 text-sm"></i>
                    <span className="text-[#2D3436] text-sm">3 Beds</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    <i className="fa-solid fa-bath text-[#3498DB] mr-2 text-sm"></i>
                    <span className="text-[#2D3436] text-sm">2.5 Baths</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    <i className="fa-solid fa-vector-square text-[#3498DB] mr-2 text-sm"></i>
                    <span className="text-[#2D3436] text-sm">1,800 sq ft</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    <i className="fa-solid fa-users text-[#3498DB] mr-2 text-sm"></i>
                    <span className="text-[#2D3436] text-sm">0 Occupants</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm text-[#3498DB] bg-[#3498DB]/5 rounded-lg hover:bg-[#3498DB] hover:text-white transition-colors">
                      <i className="fa-solid fa-edit mr-1.5"></i>Edit
                    </button>
                    <button className="px-3 py-1.5 text-sm text-[#3498DB] bg-[#3498DB]/5 rounded-lg hover:bg-[#3498DB] hover:text-white transition-colors">
                      <i className="fa-solid fa-eye mr-1.5"></i>View
                    </button>
                  </div>
                  <div className="flex items-center text-[#7F8C8D] text-sm">
                    <i className="fa-solid fa-clock mr-2 text-xs"></i>
                    <span>Last updated: Apr 10, 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Item 3 */}
          <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-64 h-48 relative">
                <img className="w-full h-full object-contain bg-gray-50" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/a6e9786ee1-9060bf411953a0583fd0.png" alt="satellite map view of 789 Sky Lane Queens NY showing urban area and surrounding streets" />
                <span className="absolute top-3 right-3 bg-[#E74C3C]/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                  Maintenance
                </span>
              </div>
              <div className="flex-1 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-[#2D3436] mb-1.5">Skyline Condos #501</h3>
                    <div className="flex items-center text-[#7F8C8D] text-sm mb-4">
                      <i className="fa-solid fa-location-dot mr-2"></i>
                      <p>789 Sky Lane, Queens, NY</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-[#2D3436]">$1,800<span className="text-xs font-normal text-[#7F8C8D] ml-1">/mo</span></p>
                </div>
                <div className="flex flex-wrap items-center gap-5 mb-5">
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    <i className="fa-solid fa-bed text-[#3498DB] mr-2 text-sm"></i>
                    <span className="text-[#2D3436] text-sm">1 Bed</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    <i className="fa-solid fa-bath text-[#3498DB] mr-2 text-sm"></i>
                    <span className="text-[#2D3436] text-sm">1 Bath</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    <i className="fa-solid fa-vector-square text-[#3498DB] mr-2 text-sm"></i>
                    <span className="text-[#2D3436] text-sm">800 sq ft</span>
                  </div>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    <i className="fa-solid fa-users text-[#3498DB] mr-2 text-sm"></i>
                    <span className="text-[#2D3436] text-sm">0 Occupants</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm text-[#3498DB] bg-[#3498DB]/5 rounded-lg hover:bg-[#3498DB] hover:text-white transition-colors">
                      <i className="fa-solid fa-edit mr-1.5"></i>Edit
                    </button>
                    <button className="px-3 py-1.5 text-sm text-[#3498DB] bg-[#3498DB]/5 rounded-lg hover:bg-[#3498DB] hover:text-white transition-colors">
                      <i className="fa-solid fa-eye mr-1.5"></i>View
                    </button>
                  </div>
                  <div className="flex items-center text-[#7F8C8D] text-sm">
                    <i className="fa-solid fa-clock mr-2 text-xs"></i>
                    <span>Last updated: Apr 5, 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-lg border border-gray-200 text-[#7F8C8D] hover:border-[#3498DB] hover:text-[#3498DB]">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="px-4 py-2 rounded-lg bg-[#3498DB] text-white">1</button>
            <button className="px-4 py-2 rounded-lg border border-gray-200 text-[#7F8C8D] hover:border-[#3498DB] hover:text-[#3498DB]">2</button>
            <button className="px-4 py-2 rounded-lg border border-gray-200 text-[#7F8C8D] hover:border-[#3498DB] hover:text-[#3498DB]">3</button>
            <button className="px-3 py-2 rounded-lg border border-gray-200 text-[#7F8C8D] hover:border-[#3498DB] hover:text-[#3498DB]">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const AccountingPreview = () => {
  return (
    <div className="bg-[#ECF0F1] p-8 rounded-2xl *:text-left">
      <div className="max-w-[1392px] w-[1392px] mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3436]">Accounting & Payments</h1>
              <p className="text-[#7F8C8D]">Manage income, expenses, invoices and deposits</p>
            </div>
            <div className="flex gap-3">
              <button className="border border-[#3498DB] text-[#3498DB] px-4 py-2 rounded-lg flex items-center">
                <i className="fa-solid fa-download mr-2"></i>
                Export Report
              </button>
              <button className="bg-[#3498DB] text-white px-4 py-2 rounded-lg flex items-center">
                <i className="fa-solid fa-plus mr-2"></i>
                Add Transaction
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#2ECC71] text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Income</p>
                  <p className="text-2xl font-bold">$8,400</p>
                </div>
                <i className="fa-solid fa-arrow-trend-up text-2xl text-green-100"></i>
              </div>
            </div>
            <div className="bg-[#E74C3C] text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold">$2,150</p>
                </div>
                <i className="fa-solid fa-arrow-trend-down text-2xl text-red-100"></i>
              </div>
            </div>
            <div className="bg-[#3498DB] text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Net Profit</p>
                  <p className="text-2xl font-bold">$6,250</p>
                </div>
                <i className="fa-solid fa-chart-line text-2xl text-blue-100"></i>
              </div>
            </div>
            <div className="bg-[#F39C12] text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Pending Invoices</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <i className="fa-solid fa-clock text-2xl text-orange-100"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Income/Expense Management */}
            <section className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3436]">Recent Transactions</h2>
                <div className="flex gap-2">
                  <button className="text-sm border border-gray-300 px-3 py-1 rounded-lg">All</button>
                  <button className="text-sm bg-[#2ECC71] text-white px-3 py-1 rounded-lg">Income</button>
                  <button className="text-sm border border-gray-300 px-3 py-1 rounded-lg">Expenses</button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#2ECC71] rounded-full flex items-center justify-center mr-3">
                      <i className="fa-solid fa-plus text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="text-[#2D3436] font-medium">Rent Payment - Unit 203</p>
                      <p className="text-sm text-[#7F8C8D]">Sarah Johnson • Jan 15, 2024</p>
                    </div>
                  </div>
                  <span className="text-[#2ECC71] font-semibold">+$1,200</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#E74C3C] rounded-full flex items-center justify-center mr-3">
                      <i className="fa-solid fa-minus text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="text-[#2D3436] font-medium">Maintenance - Plumbing Repair</p>
                      <p className="text-sm text-[#7F8C8D]">Mike's Plumbing • Jan 12, 2024</p>
                    </div>
                  </div>
                  <span className="text-[#E74C3C] font-semibold">-$350</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#2ECC71] rounded-full flex items-center justify-center mr-3">
                      <i className="fa-solid fa-plus text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="text-[#2D3436] font-medium">Rent Payment - Unit 101</p>
                      <p className="text-sm text-[#7F8C8D]">John Davis • Jan 10, 2024</p>
                    </div>
                  </div>
                  <span className="text-[#2ECC71] font-semibold">+$1,100</span>
                </div>
              </div>
            </section>

            {/* Rental Invoices */}
            <section className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#2D3436]">Rental Invoices</h2>
                <button className="bg-[#3498DB] text-white px-4 py-2 rounded-lg text-sm flex items-center">
                  <i className="fa-solid fa-plus mr-2"></i>
                  Create Invoice
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg" alt="Sarah Johnson" className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <p className="text-[#2D3436] font-medium">Invoice #INV-2024-001</p>
                      <p className="text-sm text-[#7F8C8D]">Sarah Johnson • Unit 203 • Feb 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#2D3436] font-semibold">$1,200</p>
                    <span className="bg-[#2ECC71] text-white text-xs px-2 py-1 rounded-full">Paid</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" alt="John Davis" className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <p className="text-[#2D3436] font-medium">Invoice #INV-2024-002</p>
                      <p className="text-sm text-[#7F8C8D]">John Davis • Unit 101 • Feb 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#2D3436] font-semibold">$1,100</p>
                    <span className="bg-[#F39C12] text-white text-xs px-2 py-1 rounded-full">Pending</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg" alt="Mike Wilson" className="w-10 h-10 rounded-full mr-3" />
                    <div>
                      <p className="text-[#2D3436] font-medium">Invoice #INV-2024-003</p>
                      <p className="text-sm text-[#7F8C8D]">Mike Wilson • Unit 105 • Feb 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#2D3436] font-semibold">$950</p>
                    <span className="bg-[#E74C3C] text-white text-xs px-2 py-1 rounded-full">Overdue</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Notice Management */}
            <section className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#2D3436]">Notices</h2>
                <button className="text-[#3498DB] text-sm">
                  <i className="fa-solid fa-plus mr-1"></i>
                  Add Notice
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-[#FFF3CD] border border-[#F39C12] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-[#F39C12] text-white px-2 py-1 rounded-full">Late Payment</span>
                    <span className="text-xs text-[#7F8C8D]">2 days ago</span>
                  </div>
                  <p className="text-sm text-[#2D3436] font-medium">Unit 101 - Rent Overdue</p>
                  <p className="text-xs text-[#7F8C8D]">Notice sent to John Davis</p>
                </div>

                <div className="p-3 bg-[#D1ECF1] border border-[#3498DB] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-[#3498DB] text-white px-2 py-1 rounded-full">Maintenance</span>
                    <span className="text-xs text-[#7F8C8D]">1 week ago</span>
                  </div>
                  <p className="text-sm text-[#2D3436] font-medium">Building Inspection Notice</p>
                  <p className="text-xs text-[#7F8C8D]">Sent to all tenants</p>
                </div>

                <div className="p-3 bg-[#D4EDDA] border border-[#2ECC71] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs bg-[#2ECC71] text-white px-2 py-1 rounded-full">Lease Renewal</span>
                    <span className="text-xs text-[#7F8C8D]">2 weeks ago</span>
                  </div>
                  <p className="text-sm text-[#2D3436] font-medium">Unit 203 - Lease Renewal</p>
                  <p className="text-xs text-[#7F8C8D]">Notice sent to Sarah Johnson</p>
                </div>
              </div>
            </section>

            {/* Tenant Deposits */}
            <section className="bg-white rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#2D3436] mb-4">Security Deposits</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#ECF0F1] rounded-lg">
                  <div className="flex items-center">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg" alt="Sarah Johnson" className="w-8 h-8 rounded-full mr-3" />
                    <div>
                      <p className="text-[#2D3436] font-medium text-sm">Sarah Johnson</p>
                      <p className="text-xs text-[#7F8C8D]">Unit 203</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#2D3436] font-semibold">$1,800</p>
                    <span className="text-xs bg-[#2ECC71] text-white px-2 py-1 rounded-full">Held</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#ECF0F1] rounded-lg">
                  <div className="flex items-center">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" alt="John Davis" className="w-8 h-8 rounded-full mr-3" />
                    <div>
                      <p className="text-[#2D3436] font-medium text-sm">John Davis</p>
                      <p className="text-xs text-[#7F8C8D]">Unit 101</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#2D3436] font-semibold">$1,650</p>
                    <span className="text-xs bg-[#2ECC71] text-white px-2 py-1 rounded-full">Held</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#ECF0F1] rounded-lg">
                  <div className="flex items-center">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg" alt="Mike Wilson" className="w-8 h-8 rounded-full mr-3" />
                    <div>
                      <p className="text-[#2D3436] font-medium text-sm">Mike Wilson</p>
                      <p className="text-xs text-[#7F8C8D]">Unit 105</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#2D3436] font-semibold">$1,425</p>
                    <span className="text-xs bg-[#2ECC71] text-white px-2 py-1 rounded-full">Held</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-[#7F8C8D] text-sm">Total Deposits Held:</span>
                  <span className="text-[#2D3436] font-semibold">$4,875</span>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="bg-white rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#2D3436] mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fa-solid fa-file-invoice text-[#3498DB] mr-3"></i>
                  <span className="text-[#2D3436]">Generate Monthly Report</span>
                </button>
                
                <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fa-solid fa-bell text-[#F39C12] mr-3"></i>
                  <span className="text-[#2D3436]">Send Payment Reminder</span>
                </button>
                
                <button className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="fa-solid fa-chart-bar text-[#2ECC71] mr-3"></i>
                  <span className="text-[#2D3436]">View Analytics</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showAccounting, setShowAccounting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        isScrolled ? 'bg-[#3498DB]' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="leaseup-logo.svg" alt="Leaseup" className="w-10 h-10 rounded-lg" />
              <span className="text-xl font-bold text-white">Leaseup</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <span className="text-white hover:text-white transition-colors cursor-pointer">Features</span>
              <span className="text-white hover:text-white transition-colors cursor-pointer">Pricing</span>
              <span className="text-white hover:text-white transition-colors cursor-pointer">Reviews</span>
              <span className="text-white hover:text-white transition-colors cursor-pointer">Contact</span>
            </nav>
            <div className="flex items-center gap-4">
              <button className="text-white hover:text-white transition-colors">Sign In</button>
              <button className="bg-[#1ABC9C] text-white px-6 py-2 rounded-lg hover:bg-[#2980B9] transition-colors">Get Started</button>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-[#3498DB] to-[#2C3E50] text-white pt-52 pb-16 min-h-[700px] flex items-center">
        <div className="max-w-[1392px] mx-auto px-4 md:px-8">
          <div className="flex flex-col items-center text-center gap-12">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Simplify Your 
                <span className="text-[#1ABC9C]"> Rental</span> 
                 Management
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                The all-in-one platform for landlords to manage properties, tenants, rent collection, and maintenance requests effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-[#1ABC9C] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#16A085] transition-colors flex items-center justify-center gap-2">
                  <i className="fa-solid fa-rocket"></i>
                  Start Free Trial
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-[#2C3E50] transition-colors flex items-center justify-center gap-2">
                  <i className="fa-solid fa-play"></i>
                  Watch Demo
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-20">
                <button 
                  onClick={() => {
                    setShowDashboard(!showDashboard);
                    setShowProperties(false);
                    setShowAccounting(false);
                  }}
                  className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-chart-line"></i>
                  Dashboard
                </button>
                <button 
                  onClick={() => {
                    setShowProperties(!showProperties);
                    setShowDashboard(false);
                    setShowAccounting(false);
                  }}
                  className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-building"></i>
                  Properties
                </button>
                <button 
                  onClick={() => {
                    setShowAccounting(!showAccounting);
                    setShowDashboard(false);
                    setShowProperties(false);
                  }}
                  className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-tools"></i>
                  Accounting & Payments
                </button>
                <button className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                  <i className="fa-solid fa-file-contract"></i>
                  Leases
                </button>
                <button className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                  <i className="fa-solid fa-users"></i>
                  Tenants
                </button>
              </div>
            </div>
            {showDashboard && <DashboardPreview />}
            {showProperties && <PropertiesPreview />}
            {showAccounting && <AccountingPreview />}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#ECF0F1]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Everything You Need to Manage Properties</h2>
            <p className="text-xl text-[#7F8C8D] max-w-2xl mx-auto">Streamline your rental business with powerful tools designed for modern landlords</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature cards */}
            {[
              {
                icon: "building",
                color: "#3498DB",
                title: "Property Management",
                description: "Organize all your properties in one place. Track units, amenities, and property details with ease."
              },
              {
                icon: "users",
                color: "#2ECC71",
                title: "Tenant Management",
                description: "Store tenant information, lease agreements, and communication history in one secure location."
              },
              {
                icon: "credit-card",
                color: "#1ABC9C",
                title: "Rent Collection",
                description: "Automate rent collection with online payments, late fee tracking, and payment reminders."
              },
              {
                icon: "tools",
                color: "#F39C12",
                title: "Maintenance Requests",
                description: "Handle maintenance requests efficiently with photo uploads, priority levels, and contractor management."
              },
              {
                icon: "chart-line",
                color: "#9B59B6",
                title: "Financial Reports",
                description: "Generate detailed financial reports for tax season and track your rental income performance."
              },
              {
                icon: "mobile-alt",
                color: "#E74C3C",
                title: "Mobile App",
                description: "Manage your properties on-the-go with our mobile app for iOS and Android devices."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className={`bg-[${feature.color}] text-white h-16 w-16 rounded-xl flex items-center justify-center mb-6`}>
                  <i className={`fa-solid fa-${feature.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-4">{feature.title}</h3>
                <p className="text-[#7F8C8D] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-[#7F8C8D]">Choose the plan that fits your portfolio size</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$29",
                features: [
                  "Up to 5 properties",
                  "Basic tenant management",
                  "Online rent collection",
                  "Email support"
                ]
              },
              {
                name: "Professional",
                price: "$79",
                features: [
                  "Up to 25 properties",
                  "Advanced tenant screening",
                  "Maintenance management",
                  "Financial reporting",
                  "Priority support"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "$199",
                features: [
                  "Unlimited properties",
                  "Custom integrations",
                  "Advanced analytics",
                  "24/7 phone support"
                ]
              }
            ].map((plan, index) => (
              <div 
                key={index} 
                className={`${plan.popular ? 'bg-[#3498DB] text-white' : 'bg-[#F8FAFC]'} rounded-2xl p-8 ${!plan.popular ? 'border border-gray-200' : ''} relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#1ABC9C] text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold ${plan.popular ? '' : 'text-[#2C3E50]'} mb-2`}>{plan.name}</h3>
                  <div className={`text-4xl font-bold ${plan.popular ? '' : 'text-[#3498DB]'} mb-2`}>{plan.price}</div>
                  <div className={plan.popular ? 'text-blue-200' : 'text-[#7F8C8D]'}>per month</div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <i className={`fa-solid fa-check ${plan.popular ? 'text-[#1ABC9C]' : 'text-[#2ECC71]'}`}></i>
                      <span className={plan.popular ? '' : 'text-[#2C3E50]'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full ${plan.popular ? 'bg-white text-[#3498DB] hover:bg-gray-100' : 'bg-[#3498DB] text-white hover:bg-[#2980B9]'} py-3 rounded-lg font-medium transition-colors`}>
                  {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#ECF0F1]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">What Our Customers Say</h2>
            <p className="text-xl text-[#7F8C8D]">Join thousands of satisfied landlords</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Property Owner",
                image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg",
                text: "Rentwise has completely transformed how I manage my 12 rental properties. The automated rent collection alone saves me hours every month."
              },
              {
                name: "Mike Chen",
                role: "Real Estate Investor",
                image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg",
                text: "The maintenance request system is a game-changer. Tenants love how easy it is to submit requests, and I can track everything efficiently."
              },
              {
                name: "Emily Rodriguez",
                role: "New Landlord",
                image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg",
                text: "As a first-time landlord, Rentwise made everything so much easier. The financial reports help me stay organized for tax season."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fa-solid fa-star text-[#F39C12]"></i>
                  ))}
                </div>
                <p className="text-[#7F8C8D] mb-6">{testimonial.text}</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                    width={48}
                    height={48}
                  />
                  <div>
                    <div className="font-medium text-[#2C3E50]">{testimonial.name}</div>
                    <div className="text-sm text-[#7F8C8D]">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-[#3498DB] to-[#2C3E50] text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Streamline Your Rental Business?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of landlords who trust Rentwise to manage their properties efficiently.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#1ABC9C] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#16A085] transition-colors flex items-center justify-center gap-2">
              <i className="fa-solid fa-rocket"></i>
              Start Your Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-[#2C3E50] transition-colors flex items-center justify-center gap-2">
              <i className="fa-solid fa-calendar"></i>
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}



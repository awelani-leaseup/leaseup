'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

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
        <div className="max-w-7xl mx-auto px-4 md:px-8">
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
                <button className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                  <i className="fa-solid fa-chart-line"></i>
                  Dashboard
                </button>
                <button className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                  <i className="fa-solid fa-building"></i>
                  Properties
                </button>
                <button className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                  <i className="fa-solid fa-file-contract"></i>
                  Leases
                </button>
                <button className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                  <i className="fa-solid fa-tools"></i>
                  Maintenance
                </button>
                <button className="border border-white/30 text-white px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors flex items-center gap-2">
                  <i className="fa-solid fa-users"></i>
                  Tenants
                </button>
              </div>
            </div>
            <div className="w-full max-w-6xl">
                <img 
                  className="w-full h-96 object-cover rounded-xl"
                  src="hero.avif"
                  alt="modern property management dashboard interface with charts and tenant cards"
                  width={800}
                  height={500}
                />
            </div>
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

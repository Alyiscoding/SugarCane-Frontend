import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MdTouchApp, MdMonitorHeart, MdAutoAwesome, MdPerson, MdRocketLaunch } from "react-icons/md";
import { SocialIcon } from 'react-social-icons/component';
import 'react-social-icons/facebook';
import 'react-social-icons/twitter';
import 'react-social-icons/instagram';
import 'react-social-icons/linkedin';

// Feature icons
const MonitoringIcon = () => (
    <MdMonitorHeart className="w-20 h-20 text-green-600 mb-4" />
);
const AIIcon = () => (
    <MdAutoAwesome className="w-20 h-20 text-green-600 mb-4" />
);
const EasyIcon = () => (
    <MdTouchApp className="w-20 h-20 text-green-600 mb-4" />
);

// User icon for testimonials
const UserIcon = () => (
    <MdPerson className="w-12 h-12 text-green-600 mb-4" />
);

export default function LandingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGetStarted = () => {
        if (user) {
            navigate("/dashboard");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-100 to-white flex flex-col">
            {/* Hero Section */}
            <section className="relative flex flex-col md:flex-row items-center justify-between flex-1 text-center md:text-left px-2 md:px-4 py-12 md:py-20 w-full gap-6 md:gap-8 bg-gradient-to-br from-green-100 via-green-50 to-emerald-100 rounded-3xl shadow-inner overflow-hidden">
                <div className="flex-1 z-10">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#16a34a] mb-3 md:mb-4 leading-tight drop-shadow-sm">
                        Smart Farming, <span className="text-[#15803d]">Made Simple</span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-[#15803d] mb-6 md:mb-8 max-w-2xl font-medium">
                        Monitor and optimize your sugarcane fields with real-time data, AI insights, and easy-to-use tools. Empower your farm with technology for a greener future.
                    </p>
                    <Button
                        className="bg-[#16a34a] hover:bg-[#15803d] text-white px-6 py-3 md:px-10 md:py-5 text-base md:text-xl rounded-full shadow-xl border-2 border-[#16a34a] font-bold transition-transform hover:scale-105"
                        onClick={handleGetStarted}
                    >
                        Get Started
                    </Button>
                </div>
                <div className="flex-1 flex justify-center items-center z-10 mt-6 md:mt-0">
                    <img
                        src="./images/Farms2.jpg"
                        alt="Smart Farming Hero"
                        className="w-full max-w-xs sm:max-w-sm md:max-w-md aspect-[4/3] object-cover rounded-3xl shadow-2xl border-4 border-green-200 ring-4 ring-green-100"
                    />
                </div>
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 opacity-10 blur-2xl pointer-events-none">
                    <svg width="300" height="300" viewBox="0 0 400 400" fill="none"><circle cx="200" cy="200" r="200" fill="#16a34a" /></svg>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-green-50 py-16 px-4 w-full">
                <h2 className="text-3xl font-bold text-green-700 text-center mb-12">How It Works</h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-10">
                    <div className="flex flex-col items-center">
                        <span className="bg-green-100 rounded-full p-4 mb-4"><MdPerson className="w-10 h-10 text-green-600" /></span>
                        <h4 className="text-lg font-semibold text-green-700 mb-2">Register</h4>
                        <p className="text-green-900 text-center">Sign up and create your free account in seconds.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="bg-green-100 rounded-full p-4 mb-4"><MdTouchApp className="w-10 h-10 text-green-600" /></span>
                        <h4 className="text-lg font-semibold text-green-700 mb-2">Add Your Field</h4>
                        <p className="text-green-900 text-center">Draw or select your field boundary on the map.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="bg-green-100 rounded-full p-4 mb-4"><MdMonitorHeart className="w-10 h-10 text-green-600" /></span>
                        <h4 className="text-lg font-semibold text-green-700 mb-2">Monitor</h4>
                        <p className="text-green-900 text-center">Track real-time data and get instant alerts.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="bg-green-100 rounded-full p-4 mb-4"><MdAutoAwesome className="w-10 h-10 text-green-600" /></span>
                        <h4 className="text-lg font-semibold text-green-700 mb-2">Optimize</h4>
                        <p className="text-green-900 text-center">Use AI insights to boost yield and save resources.</p>
                    </div>
                </div>
            </section>

            {/* Impact/Stats Section */}
            <section className="bg-white py-16 px-4 w-full">
                <h2 className="text-3xl font-bold text-green-700 text-center mb-12">Our Impact</h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                    <div className="flex flex-col items-center">
                        <span className="bg-green-100 rounded-full p-4 mb-4"><MdMonitorHeart className="w-10 h-10 text-green-600" /></span>
                        <div className="text-4xl font-extrabold text-green-700 mb-2">1000+</div>
                        <div className="text-green-900">Fields Monitored</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="bg-green-100 rounded-full p-4 mb-4"><MdAutoAwesome className="w-10 h-10 text-green-600" /></span>
                        <div className="text-4xl font-extrabold text-green-700 mb-2">20%</div>
                        <div className="text-green-900">Average Water Savings</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="bg-green-100 rounded-full p-4 mb-4"><MdPerson className="w-10 h-10 text-green-600" /></span>
                        <div className="text-4xl font-extrabold text-green-700 mb-2">500+</div>
                        <div className="text-green-900">Happy Farmers</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-white py-16 px-4">
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-10">
                    <Card className="shadow-md border-green-100">
                        <CardContent className="flex flex-col items-center py-8">
                            <MonitoringIcon />
                            <h3 className="text-xl font-semibold text-green-700 mb-2">Real-Time Monitoring</h3>
                            <p className="text-green-900 text-center">Track soil moisture, weather, and crop health instantly from anywhere. Stay ahead with live updates and alerts.</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-green-100">
                        <CardContent className="flex flex-col items-center py-8">
                            <AIIcon />
                            <h3 className="text-xl font-semibold text-green-700 mb-2">AI-Powered Insights</h3>
                            <p className="text-green-900 text-center">Get actionable recommendations to boost yield and reduce costs. Our AI analyzes your field data for smarter decisions.</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-md border-green-100">
                        <CardContent className="flex flex-col items-center py-8">
                            <EasyIcon />
                            <h3 className="text-xl font-semibold text-green-700 mb-2">Easy to Use</h3>
                            <p className="text-green-900 text-center">Intuitive dashboard designed for farmers, no tech skills required. Start monitoring your fields in minutes.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Testimonials Section - What Our Farmers Say */}
            <section className="bg-green-50 py-16 px-4">
                <div className="w-full text-center mb-12">
                    <h2 className="text-3xl font-bold text-green-700 mb-4">What Our Farmers Say</h2>
                    <p className="text-green-900 text-lg mb-4">Trusted by progressive farmers across the region. See how our platform is transforming lives and agriculture.</p>
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="shadow border-green-100">
                        <CardContent className="flex flex-col items-center py-8">
                            <UserIcon />
                            <p className="text-green-900 text-center mb-2">“This platform helped me increase my yield and reduce water usage. The real-time alerts are a game changer!”</p>
                            <span className="text-green-700 font-semibold">Ali, Punjab</span>
                            <span className="text-green-500 text-xs mt-1">Sugarcane Farmer, 10+ years experience</span>
                        </CardContent>
                    </Card>
                    <Card className="shadow border-green-100">
                        <CardContent className="flex flex-col items-center py-8">
                            <UserIcon />
                            <p className="text-green-900 text-center mb-2">“Easy to use and very effective. I can monitor my fields from anywhere and get instant insights.”</p>
                            <span className="text-green-700 font-semibold">Sara, Sindh</span>
                            <span className="text-green-500 text-xs mt-1">Young Agri-entrepreneur</span>
                        </CardContent>
                    </Card>
                    <Card className="shadow border-green-100">
                        <CardContent className="flex flex-col items-center py-8">
                            <UserIcon />
                            <p className="text-green-900 text-center mb-2">“The AI recommendations helped me plan irrigation and fertilizer better. My crops have never looked healthier!”</p>
                            <span className="text-green-700 font-semibold">Ahmed, Multan</span>
                            <span className="text-green-500 text-xs mt-1">Progressive Grower</span>
                        </CardContent>
                    </Card>
                </div>
                <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="shadow border-green-100">
                        <CardContent className="flex flex-col items-center py-8">
                            <UserIcon />
                            <p className="text-green-900 text-center mb-2">“I love the mobile-friendly dashboard. I can check my field status even when I’m on the go!”</p>
                            <span className="text-green-700 font-semibold">Fatima, Rahim Yar Khan</span>
                            <span className="text-green-500 text-xs mt-1">Family Farm Owner</span>
                        </CardContent>
                    </Card>
                    <Card className="shadow border-green-100">
                        <CardContent className="flex flex-col items-center py-8">
                            <UserIcon />
                            <p className="text-green-900 text-center mb-2">“Support is always available and the team really listens to feedback. Highly recommended!”</p>
                            <span className="text-green-700 font-semibold">Imran, Faisalabad</span>
                            <span className="text-green-500 text-xs mt-1">Community Leader</span>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="relative bg-gradient-to-br from-green-100 via-green-50 to-emerald-100 py-12 md:py-20 flex justify-center items-center shadow-inner overflow-hidden rounded-3xl mt-8 md:mt-12">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 opacity-10 blur-2xl">
                        <MdRocketLaunch className="w-60 h-60 md:w-[28rem] md:h-[28rem] text-[#16a34a] animate-spin-slow" />
                    </div>
                </div>
                <div className="relative z-10 max-w-2xl w-full mx-auto flex flex-col items-center text-center px-2 md:px-4">
                    <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-2 sm:gap-4">
                        <span className="inline-flex items-center justify-center bg-gradient-to-tr from-[#16a34a] to-[#15803d] rounded-full shadow-lg p-3 md:p-4 animate-bounce-slow mb-2 sm:mb-0">
                            <MdRocketLaunch className="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg" />
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#16a34a] leading-tight drop-shadow-sm">
                            Ready to transform your farm?
                        </h2>
                    </div>
                    <p className="text-base sm:text-lg md:text-2xl text-[#15803d] mb-6 md:mb-8 font-medium max-w-xl mx-auto">
                        Join the smart farming revolution today and take your fields to the next level with real-time data, AI, and intuitive tools.
                    </p>
                    <Button
                        className="bg-[#16a34a] hover:bg-[#15803d] text-white px-6 py-3 md:px-10 md:py-5 text-base md:text-xl rounded-full shadow-xl border-2 border-[#16a34a] font-bold transition-transform hover:scale-105"
                        onClick={handleGetStarted}
                    >
                        Get Started
                    </Button>
                </div>
            </section>

            {/* Footer with Social Media Links */}
            <footer className="text-center py-8 text-green-800 bg-green-50 mt-auto">
                <div className="flex justify-center gap-6 mb-4">
                    <SocialIcon url="https://facebook.com" bgColor="#16a34a" fgColor="#fff" style={{ height: 32, width: 32 }} />
                    <SocialIcon url="https://twitter.com" bgColor="#16a34a" fgColor="#fff" style={{ height: 32, width: 32 }} />
                    <SocialIcon url="https://instagram.com" bgColor="#16a34a" fgColor="#fff" style={{ height: 32, width: 32 }} />
                    <SocialIcon url="https://linkedin.com" bgColor="#16a34a" fgColor="#fff" style={{ height: 32, width: 32 }} />
                </div>
                <div className="text-sm">&copy; {new Date().getFullYear()} Sugarcane Monitoring. All rights reserved.</div>
            </footer>
        </div>
    );
}

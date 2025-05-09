import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, Calendar, User, Check, X } from "lucide-react";
import { useAuth } from "../AuthContext";

function CaregiverDashboard() {
  const { token, userId } = useAuth();
  console.log("CaregiverDashboard mounted with token:", token ? "available" : "not available");
  console.log("User ID:", userId);

  const [caregiver, setCaregiver] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    services: [],
    experience: "",
    hourlyRate: 0,
    status: ""
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Function to generate a random color based on name
  const getRandomColor = (name) => {
    if (!name) return 'bg-gray-400';
    
    const colors = [
      'bg-red-400', 'bg-blue-400', 'bg-green-400', 
      'bg-yellow-400', 'bg-purple-400', 'bg-pink-400',
      'bg-indigo-400',  'bg-orange-400'
    ];
    
    // Use the first character's char code to pick a consistent color
    const charCode = name.charCodeAt(0);
    const colorIndex = charCode % colors.length;
    return colors[colorIndex];
  };

  useEffect(() => {
    const fetchCaregiverData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!token) {
          setError("Authentication token not found. Please log in again.");
          setLoading(false);
          return;
        }
        
        // Fetch caregiver data
        const response = await axios.get("http://localhost:8080/api/caregiver/application", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.data) {
          throw new Error("No caregiver data received");
        }

        setCaregiver(response.data);

        // Only fetch bookings if we have a valid caregiver ID
        if (response.data.id) {
          const bookingsResponse = await axios.get(`http://localhost:8080/api/bookings/caregiver/${response.data.id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          setBookings(bookingsResponse.data || []);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching caregiver data:", err);
        
        if (err.response) {
          if (err.response.status === 401) {
            setError("Your session has expired. Please log in again.");
          } else if (err.response.status === 404) {
            setError("No caregiver application found. Please submit an application first.");
          } else {
            setError(`Failed to load data: ${err.response.data?.message || err.message}`);
          }
        } else {
          setError("Network error. Please check your connection.");
        }
        
        setLoading(false);
      }
    };

    fetchCaregiverData();
  }, [token]);

 


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading caregiver data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => window.location.href = "/caregiver-form"}
        >
          Apply as Caregiver
        </button>
      </div>
    );
  }

  // Format services into an array if it's a string
  const servicesList = Array.isArray(caregiver.services) 
    ? caregiver.services 
    : (caregiver.services ? caregiver.services.split(',').map(s => s.trim()) : []);

  // Format full address
  const fullAddress = [
    caregiver.address,
    caregiver.city,
    caregiver.pincode
  ].filter(Boolean).join(', ');

  // Get initials for profile picture
  const initials = `${caregiver.firstName.charAt(0)}${caregiver.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto mt-8 mb-8 bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col md:flex-row items-center mb-8 pb-5 border-b border-gray-200">
          <div className="mb-4 md:mb-0 md:mr-8">
            <div className={`w-36 h-36 rounded-full ${getRandomColor(caregiver.firstName)} flex items-center justify-center text-white text-6xl font-bold`}>
              {initials}
            </div>
            <div className="mt-2 text-sm text-blue-700 cursor-pointer text-center">
              Change Photo
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {caregiver.firstName} {caregiver.lastName}
            </h1>
            <p className="text-gray-600">Professional Caregiver</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b-2 border-gray-100">
              Personal Information
            </h2>
            <div className="mb-4">
              <label className="block font-semibold text-gray-600 mb-1">
                Full Name
              </label>
              <div className="p-2 bg-gray-50 rounded text-gray-800">
                {caregiver.firstName} {caregiver.lastName}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-semibold text-gray-600 mb-1">
                Phone Number
              </label>
              <div className="p-2 bg-gray-50 rounded text-gray-800">
                {caregiver.phone}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-semibold text-gray-600 mb-1">
                Email Address
              </label>
              <div className="p-2 bg-gray-50 rounded text-gray-800">
                {caregiver.email}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-semibold text-gray-600 mb-1">
                Address
              </label>
              <div className="p-2 bg-gray-50 rounded text-gray-800">
                {fullAddress}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-blue-700 mb-4 pb-2 border-b-2 border-gray-100">
              Professional Details
            </h2>
            <div className="mb-4">
              <label className="block font-semibold text-gray-600 mb-1">
                Services Offered
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {servicesList.map((service, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-semibold text-gray-600 mb-1">
                Years of Experience
              </label>
              <div className="p-2 bg-gray-50 rounded text-gray-800">
                {caregiver.experience}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-semibold text-gray-600 mb-1">
                Hourly Rate
              </label>
              <div className="p-2 bg-gray-50 rounded text-gray-800">
                ₹{caregiver.hourlyRate}/hour
              </div>
            </div>
          </div>  
        </div>

        {/* Bookings Section */}
       

        {/* Reject Modal */}
        
      </div>
    </div>
  );
}

export default CaregiverDashboard;
"use client";
import React, { useState, useEffect } from "react";
import { fetchAvailableRooms } from "./FetchRoom";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../(pages)/api";
import Link from "next/link";

const BookingForm = ({ onBookRoom }) => {
  const [formData, setFormData] = useState({
    guestName: "",
    roomNumber: "", // Should be a number
    daysToStay: "", // Should be a number
    totalAmountPaid: "", // Should be a number (ETH)
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [maxDays, setMaxDays] = useState(10);
  const PRICE_PER_DAY = 0.0005; // Hardcoded from contract

  useEffect(() => {
    async function getRooms() {
      const rooms = await fetchAvailableRooms();
      setAvailableRooms(rooms);
    }
    getRooms();
  }, []);

  // Fetch maxDays from contract
  useEffect(() => {
    async function fetchMaxDays() {
      if (!window.ethereum) {
        console.warn("MetaMask not detected.");
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );
        const maxDaysFromContract = await contract.MAX_DAYS();
        setMaxDays(parseInt(maxDaysFromContract.toString()));
      } catch (error) {
        console.error("Error fetching max days:", error);
      }
    }
    fetchMaxDays();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert daysToStay and roomNumber to numbers
    const updatedValue =
      name === "daysToStay" || name === "roomNumber"
        ? Number(value) || 0
        : value;

    let updatedFormData = { ...formData, [name]: updatedValue };

    if (name === "daysToStay") {
      updatedFormData.totalAmountPaid = (updatedValue * PRICE_PER_DAY).toFixed(4);
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalData = {
      guestName: formData.guestName,
      roomNumber: Number(formData.roomNumber),
      daysToStay: Number(formData.daysToStay),
      totalAmountPaid: formData.totalAmountPaid.toString()
    };
    console.log("✅ Final Data Before Booking:", finalData);
    if (typeof onBookRoom === "function") {
      onBookRoom(finalData);
    } else {
      console.error("❌ onBookRoom is not a function");
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-sm shadow-xl p-6 rounded-lg max-w-lg mx-auto border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Book a Room
        </h2>

        <input
          type="text"
          name="guestName"
          placeholder="Enter Fullname"
          className="w-full p-3 text-black uppercase font-medium bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
          value={formData.guestName}
          onChange={handleChange}
          required
        />

        <div className="flex flex-col lg:flex-row lg:space-x-4 max-lg:space-y-4 mt-4 -mx-4">
          <select
            name="roomNumber"
            className="lg:w-1/2 p-3 bg-gray-100 border border-gray-300 text-black uppercase font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            value={formData.roomNumber}
            onChange={handleChange}
            required
          >
            <option value="">Select Available Room</option>
            {availableRooms.length > 0 ? (
              availableRooms.map((room) => (
                <option key={room} value={room}>
                  Room {room}
                </option>
              ))
            ) : (
              <option disabled>No available rooms</option>
            )}
          </select>

          <select
            name="daysToStay"
            className="lg:w-1/2 p-3 bg-gray-100 border border-gray-300 text-black uppercase font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
            value={formData.daysToStay}
            onChange={handleChange}
            required
          >
            <option value="">Number of Days to Stay</option>
            {Array.from({ length: maxDays }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1} {index + 1 === 1 ? "day" : "days"}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          name="totalAmountPaid"
          placeholder="Amount to Pay (XFI)"
          className="w-full p-3 bg-gray-100 border border-gray-300 text-black font-medium rounded-lg mt-4 focus:outline-none"
          value={formData.totalAmountPaid}
          readOnly
        />

        <button
          type="submit"
          className="mt-6 w-full bg-yellow-500 text-black font-bold py-3 rounded-lg border-2 border-yellow-500 hover:bg-transparent hover:text-yellow-500 transition-all"
        >
          Book Room
        </button>

        {/* <Link href="/transactions" className="block text-center mt-4 text-gray-600 hover:underline">
          View Transactions
        </Link> */}
      </form>

      <div className="flex justify-center mt-2">
        <span className="w-2 h-2 bg-white rounded-full"></span>
      </div>
    </div>
  );
};

export default BookingForm;

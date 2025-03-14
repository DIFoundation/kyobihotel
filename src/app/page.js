"use client";
import React from "react";
import Header from "./components/Header";
import BookingForm from "./components/BookingForm";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./(pages)/api";
import { checkoutRoom } from "./components/checkoutRoom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewsUpdates from "./components/NewsUpdates";

const HomePage = () => {
  async function bookRoom(formData) {
    const { guestName, roomNumber, daysToStay, totalAmountPaid } = formData;

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      
      toast.info("Booking in progress. Please confirm the transaction in MetaMask.");

      if (isNaN(totalAmountPaid) || totalAmountPaid <= 0) {
        throw new Error(
          "Invalid totalAmountPaid value. Please check the form."
        );
      }

      const totalAmountPaidWei = ethers.parseEther(totalAmountPaid.toString());

      // Call contract
      const transaction = await contract.checkIn(
        Number(roomNumber),
        String(guestName),
        Number(daysToStay),
        { value: totalAmountPaidWei }
      );

      await transaction.wait();
      toast.success(`You have successfully book room number ${roomNumber} for ${daysToStay} days`);

    } catch (error) {     
      if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction rejected by user.");
      } else {
        toast.error("Booking failed. Please try again.");
      }
    }
  }

  return (
    <div className="relative w-full h-screen bg-cover overflow-auto">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/hotel.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>

      <Header />

      <div className="absolute top-1/4 left-8 right-8 md:top-24 lg:top-1/4 flex flex-col-reverse md:flex-row justify-between items-center ">
        <div className="flex flex-row md:flex-col max-md:items-center max-md:space-x-10">
          <div className="text-white text-xl md:text-4xl lg:text-5xl font-bold leading-snug">
            Find comfort <br /> like your <br />
            <span className="italic text-yellow-500 motion">home</span>
          </div>

          <button
            onClick={checkoutRoom}
            className="mt-1 md:mt-6 bg-yellow-500 text-black text-sm font-semibold md:font-bold px-4 md:px-6 py-2 md:py-3 w-1/2 rounded-lg border-2 border-yellow-500 hover:bg-transparent hover:text-yellow-500"
          >
            Check Out
          </button>
          <ToastContainer />
        </div>

        <div className="">
          <BookingForm onBookRoom={bookRoom} />
          <ToastContainer />
        </div>
      </div>
      
      {/* <marquee className="absolute bottom-5 left-5 right-5 text-white text-center">
        <h3><NewsUpdates /></h3>
      </marquee> */}
    </div>
  );
};

export default HomePage;

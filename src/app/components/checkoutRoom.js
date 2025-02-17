import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../(pages)/api";
import { ToastContainer, toast } from "react-toastify";

export async function checkoutRoom() {
  if (!window.ethereum) {
    alert("MetaMask is not installed. Please install MetaMask to proceed.");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    toast.info("Checking out from the room. Please confirm the transaction in MetaMask.");

    const tx = await contract.checkOut();
    await tx.wait(); // Wait for the transaction to be confirmed

    toast.success("Checked out successfully. Thank you for staying with us! 🎉🎉");
    
  } catch (error) {
    console.error("Error checking out:", error);
    if (error.code === "ACTION_REJECTED") {
        toast.error("Checkout rejected by user.");
      } else {
        toast.error("Checkout failed. Please try again.");
      }
  }
}

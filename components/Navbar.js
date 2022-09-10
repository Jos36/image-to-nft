import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

function Navbar() {
  return (
    <nav className="bg-p text-s text-lg font-semibold flex items-center p-5 justify-between shadow-md shadow-[#00000071]">
      <div className="ml-10">
        <button>Home</button>
      </div>
      <div className="flex gap-x-10">
        <label
          htmlFor="create-post"
          className="modal-button flex items-center cursor-pointer transition-all hover:scale-105 hover:bg-white hover:text-black p-2 rounded-lg"
        >
          Create New Post
        </label>

        <ConnectButton />
      </div>
    </nav>
  );
}

export default Navbar;

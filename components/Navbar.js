import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState } from "react";

function Navbar() {
  const [openDrawer, setOpenDrawer] = useState(false);
  return (
    <div>
      <nav className="bg-p text-s text-lg font-semibold flex items-center p-5 justify-between shadow-md shadow-[#00000071]">
        <div className="ml-10">
          <button>Home</button>
        </div>
        <div className=" gap-x-10 hidden lg:flex">
          <label
            htmlFor="create-post"
            className="modal-button flex items-center cursor-pointer transition-all hover:scale-105 hover:bg-white hover:text-black p-2 rounded-lg"
          >
            Create New Post
          </label>

          <ConnectButton />
        </div>
        <div className="lg:hidden">
          <label
            onClick={() => {
              setOpenDrawer(!openDrawer);
            }}
            className="drawer-button btn btn-primary"
          >
            <div className="flex-none lg:hidden">
              <label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline-block w-6 h-6 stroke-current"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  ></path>
                </svg>
              </label>
            </div>
          </label>
        </div>
      </nav>
      {openDrawer && (
        <div className=" gap-x-10 flex justify-center flex-col bg-black items-center gap-y-10 p-10 lg:hidden">
          <ConnectButton />
          <label
            htmlFor="create-post"
            className=" modal-button flex items-center cursor-pointer transition-all hover:scale-105 hover:bg-white hover:text-black p-2 rounded-lg"
          >
            Create New Post
          </label>
        </div>
      )}
    </div>
  );
}

export default Navbar;

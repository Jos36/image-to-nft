import React, { useContext } from "react";
import { Context } from "../context/context";

const imgs = [
  "/test/1.jpg",
  "/test/2.jpg",
  "/test/3.jpg",
  "/test/4.jpg",
  "/test/5.jpg",
  "/test/1.jpg",
  "/test/2.jpg",
  "/test/3.jpg",
  "/test/4.jpg",
  "/test/5.jpg",
  "/test/1.jpg",
  "/test/2.jpg",
  "/test/3.jpg",
  "/test/4.jpg",
  "/test/5.jpg",
  "/test/1.jpg",
  "/test/2.jpg",
  "/test/3.jpg",
  "/test/4.jpg",
  "/test/5.jpg",
];

function HomeComponent() {
  const store = useContext(Context);

  const handleClick = (t) => {
    console.log(t);
  };

  return (
    <div className="flex justify-center mt-28">
      <form
        className="w-[70vw]"
        onSubmit={async (e) => {
          e.preventDefault();

          let formData = new FormData(e.currentTarget);
          formData.append("address", store.user.address);

          for (var pair of formData.entries()) {
            console.log(pair[0] + ", " + pair[1]);
          }

          let response = await fetch("http://localhost:3000/api/user/create", {
            method: "POST",
            body: formData,
          }).catch((e) => {
            console.log(e);
          });

          let data = await response.text();
          console.log(data);
        }}
      >
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Your Name
          </label>
          <input
            name="name"
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
            placeholder="name@flowbite.com"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Your bio
          </label>
          <input
            name="bio"
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Profile image
          </label>
          <input
            name="image"
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
            required
          />
        </div>
        <div className="flex items-start mb-6">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              value=""
              className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
              required
            />
          </div>
          <label
            for="terms"
            className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            I agree with the
            <a
              href="#"
              className="text-blue-600 hover:underline dark:text-blue-500"
            >
              terms and conditions
            </a>
          </label>
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Compelete my account
        </button>
      </form>
    </div>
  );
}

export default HomeComponent;
// <div className="flex justify-center">
//   <div className="w-[80vw] flex flex-wrap  gap-x-4 gap-y-4 ">
//     {imgs.map((t) => (
//       <div
//         className="h-96 flex-grow-[1] "
//         onClick={() => {
//           handleClick(t);
//         }}
//       >
//         <img
//           key={t}
//           src={t}
//           alt=""
//           className="w-full h-full object-cover   "
//         />
//       </div>
//     ))}
//   </div>
// </div>

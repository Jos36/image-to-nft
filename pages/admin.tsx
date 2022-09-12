import { ConnectButton } from "@rainbow-me/rainbowkit";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import HomeComponent from "../components/Home";
import axios from "axios";
import { Context } from "../context/context";
import { formatDate } from "../utils/formatDate";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const token = await getToken({ req: context.req });

  const address = token?.sub ?? null;
  // If you have a value for "address" here, your
  // server knows the user is authenticated.

  // You can then pass any data you want
  // to the page component here.

  if (!address) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  if (session?.user.role === "USER") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      address,
      session,
    },
  };
};

type AuthenticatedPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const Home: NextPage = ({ address, session }: AuthenticatedPageProps) => {
  const [posts, setPosts] = useState([]);
  const [rankPosts, setRankPosts] = useState([]);
  const [rankPage, setRankPage] = useState(1);
  const [count, setCount] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();
  const [topValue, setTopValue] = useState("0");
  const [modalStep, setModalStep] = useState("TABLE");
  const [details, setDetails] = useState({} as Details);
  const store = useContext(Context);
  const [openDrawer, setOpenDrawer] = useState(false);

  type Details = {
    image: string;
    top: number;
    user: string;
    title: string;
    description: string;
    _id: string;
    createdAt: string;
    chain: string;
  };
  const handleDetailsClick = (p: any) => {
    setDetails(p);
    setModalStep("DETAILS");
  };

  useEffect(() => {
    if (!address) {
      router.push("/login");
    }

    store.setUser(session);
  }, []);

  useEffect(() => {
    getRankPosts();
  }, [rankPage]);

  const getPosts = async () => {
    let reqOptions = {
      url: `/api/post/all`,
      method: "GET",
    };

    let response = await axios.request(reqOptions);
    console.log(response.data);
    setPosts(response.data.posts);
  };

  const getRankPosts = async () => {
    let reqOptions = {
      url: `/api/post/all?page=${rankPage}`,
      method: "GET",
    };

    let response = await axios.request(reqOptions);
    console.log(response.data);
    setRankPosts(response.data.posts);
    setCount(response.data.count);
  };

  useEffect(() => {
    getPosts();
  }, []);

  const handleApply = async () => {
    let formData = new FormData();

    formData.append("address", address);
    formData.append("_id", details._id);
    formData.append("top", topValue);

    let reqOptions = {
      url: `/api/admin/post/update`,
      method: "POST",
      data: formData,
    };

    let response = await axios.request(reqOptions);

    console.log(response);
    getPosts();
    setModalStep("TABLE");
    setDetails({} as Details);
  };

  const handleDelete = async () => {
    let formData = new FormData();

    formData.append("address", address);
    formData.append("_id", details._id);

    let reqOptions = {
      url: `/api/admin/post/delete`,
      method: "POST",
      data: formData,
    };

    let response = await axios.request(reqOptions);

    console.log(response);
    getPosts();
    setModalStep("TABLE");
    setDetails({} as Details);
  };

  return (
    <div className="h-fit pb-16 bg-white">
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
                <label
                  htmlFor="my-drawer-3"
                  className="btn btn-square btn-ghost"
                >
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
            <label
              onClick={() => {
                getRankPosts();
              }}
              htmlFor="rank-post"
              className="modal-button flex items-center cursor-pointer transition-all hover:scale-105 hover:bg-white hover:text-black p-2 rounded-lg"
            >
              Rank Posts
            </label>
          </div>
        )}
      </div>

      {/* rank posts modal */}

      <input
        type="checkbox"
        id="rank-post"
        className="modal-toggle"
        ref={inputRef}
      />
      <div className="modal" id="rank-post">
        <div className="modal-box max-w-fit bg-black overflow-hidden">
          <p className="text-white font-semibold text-lg">
            Rank Posts (Total Posts {count})
          </p>
          <div className="divider"></div>
          <div className="overflow-x-auto">
            <label
              htmlFor="rank-post"
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </label>
            <div className="overflow-y-scroll h-[70vh] w-[60vw] flex justify-center scrollbar scrollbar-thumb-black scrollbar-track-gray-100">
              <div className="overflow-x-auto w-[95%]">
                {modalStep === "TABLE" && (
                  <div className="flex flex-col justify-between">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>title</th>
                          <th>user address</th>
                          <th>top</th>
                          <th>date</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankPosts.map(
                          (p: {
                            image: string;
                            top: number;
                            user: string;
                            title: string;
                            description: string;
                            createdAt: string;
                          }) => (
                            <tr key={p.image}>
                              <td>
                                <div className="flex items-center space-x-3">
                                  <div className="avatar">
                                    <div className="mask mask-squircle w-12 h-12">
                                      <img
                                        src={p.image}
                                        alt="Avatar Tailwind CSS Component"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-bold">{p.title}</div>
                                  </div>
                                </div>
                              </td>
                              <td>{p.user}</td>
                              <td>{p.top}</td>
                              <td>{formatDate(p.createdAt)}</td>
                              <th>
                                <button
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => {
                                    handleDetailsClick(p);
                                  }}
                                >
                                  details
                                </button>
                              </th>
                            </tr>
                          )
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th>title</th>
                          <th>user address</th>
                          <th>top</th>
                          <th>date</th>

                          <th></th>
                        </tr>
                      </tfoot>
                    </table>
                    <div className="btn-group flex justify-center mt-6">
                      <button
                        className="btn"
                        onClick={() => {
                          rankPage === 1 ? "" : setRankPage(rankPage - 1);
                        }}
                      >
                        «
                      </button>
                      <button className="btn">Page {rankPage}</button>
                      <button
                        className="btn"
                        onClick={() => {
                          setRankPage(rankPage + 1);
                        }}
                      >
                        »
                      </button>
                    </div>
                    <div className="w-full mt-10">
                      <label
                        htmlFor="rank-post"
                        className="p-2.5 border border-white hover:bg-white hover:text-black rounded-lg w-44 float-right text-center font-bold"
                      >
                        Done
                      </label>
                    </div>
                  </div>
                )}

                {modalStep === "DETAILS" && (
                  <div className="text-white ">
                    <div
                      className="cursor-pointer"
                      onClick={() => {
                        setModalStep("TABLE");
                      }}
                    >{`< Go back`}</div>
                    <div className="lg:flex justify-between mt-10">
                      <div className="flex flex-col ">
                        <div className="space-y-2 mt-10">
                          <span className="flex gap-x-2">
                            <p>Title: </p> <p>{details.title}</p>
                          </span>
                          <span className="flex gap-x-2">
                            <p>Description: </p> <p>{details.description}</p>
                          </span>
                          <span className="flex gap-x-2">
                            <p>User address: </p> <p>{details.user}</p>
                          </span>
                          <span className="flex gap-x-2">
                            <p>Chain: </p>
                            <p>{details.chain}</p>
                          </span>
                          <span className="flex gap-x-2">
                            <p>Date created: </p>
                            <p>{formatDate(details.createdAt)}</p>
                          </span>
                        </div>
                        <div className="mt-10">
                          <label className="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">
                            Mark as top Image
                          </label>
                          <div className="flex gap-x-5">
                            <input
                              name="top"
                              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light w-[50%]"
                              required
                              placeholder="1"
                              value={topValue}
                              onChange={(e) => setTopValue(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-12 lg:mt-0  flex flex-col justify-between h-[61vh]">
                        <div>
                          <span className="flex gap-x-2 w-full justify-center mb-3">
                            <p>Top </p> <p>{details.top}</p>
                          </span>
                          <img
                            className="w-72 border-2 border-white"
                            src={details.image}
                            alt=""
                          />
                        </div>
                        <div className="flex gap-x-4">
                          <button
                            onClick={() => {
                              handleDelete();
                            }}
                            className="p-2.5 border border-white hover:bg-red-600 hover:text-white rounded-lg  w-24 "
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => {
                              handleApply();
                            }}
                            className="p-2.5 border border-white hover:bg-white hover:text-black rounded-lg w-44 "
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* body */}
      {address ? (
        <div className="mt-20">
          <HomeComponent />
        </div>
      ) : (
        <h1>Unauthenticated</h1>
      )}
    </div>
  );
};

export default Home;

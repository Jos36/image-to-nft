import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Context } from "../context/context";
import { formatDate, isCurrentWeek } from "../utils/formatDate";
import { NFTStorage, File, Blob } from "nft.storage";
import { abi } from "../web3/abi";
import { useContract, useSigner } from "wagmi";

function HomeComponent() {
  const store = useContext(Context);
  const [selectedImage, setSelectedImage] = useState();
  const [posts, setPosts] = useState();
  const [selectedPost, setSelectedPost] = useState();
  const [topPosts, setTopPosts] = useState();
  const [chain, setChain] = useState("ethereum");
  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [mintNowLoading, setMintNowLoading] = useState(false);
  const { data: signer } = useSigner();
  const inputRef = React.useRef(null);
  const viewRef = React.useRef(null);
  const newUserRef = React.useRef(null);
  const createFormRef = React.useRef(null);

  const contract = useContract({
    addressOrName: "0x2d84Db76a6E3c17C47AA7d0f2c0237dbdF6d4f52",
    contractInterface: abi,
    signerOrProvider: signer,
  });

  const handleClick = (p) => {
    setSelectedPost(p);
    viewRef.current.click();
  };

  const getTopPosts = async () => {
    let reqOptions = {
      url: `/api/post/top`,
      method: "GET",
    };

    let response = await axios.request(reqOptions);
    console.log(response.data);
    setTopPosts(response.data.posts);
  };

  const getPosts = async () => {
    let reqOptions = {
      url: `/api/post/all`,
      method: "GET",
    };

    let response = await axios.request(reqOptions);
    console.log(response.data);
    setPosts(response.data.posts);
  };

  const checkUser = async () => {
    let reqOptions = {
      url: `/api/user/get?address=${store.user.address}`,
      method: "GET",
    };

    let response = await axios.request(reqOptions);
    if (response.data.user.length === 0) {
      newUserRef.current.click();
    }
  };

  useEffect(() => {
    if (store.user.address) {
      checkUser();
      getTopPosts();
      getPosts();
    }
  }, [store.user.address]);

  const mintNft = async (formData, storedPost) => {
    const client = new NFTStorage({
      token: process.env.NEXT_PUBLIC_NFT_STORAGE_KEY,
    });
    let minted = false;
    let url;
    const imageFile = new File([selectedImage], "nft.png", {
      type: "image/png",
    });

    const res = await client
      .store({
        name: formData.get("title"),
        description: formData.get("description"),
        image: imageFile,
      })
      .then(async (metadata) => {
        console.log(metadata);
        console.log(chain);
        console.log(store.user.address);
        console.log(selectedImage);

        await contract
          .mint(store.user.address, storedPost.nft_id, metadata.url)
          .then((res) => {
            console.log("RESSS", res);
          });

        // after mint logic
        minted = true;
        url = metadata.url; //replace this
        return { minted, url };
      });
    return res;
  };

  const mintNftNow = async () => {
    let minted = false;
    let url;
    const { user, image, chain, title, description } = selectedPost;
    const client = new NFTStorage({
      token: process.env.NEXT_PUBLIC_NFT_STORAGE_KEY,
    });

    try {
      const res = fetch(image)
        .then((response) => response.blob())
        .then(async (imageBlob) => {
          const res = await client
            .store({
              name: title,
              description: description,
              image: new Blob([imageBlob]),
            })
            .then(async (metadata) => {
              console.log(metadata);
              console.log(chain);
              console.log(store.user.address);
              console.log(selectedImage);

              await contract
                .mint(user, selectedPost.nft_id, metadata.url)
                .then((res) => {
                  console.log("RESPONSE: ", res);
                });

              // after mint logic
              minted = true;
              url = metadata.url; //replace this
              return { minted, url };
            });
          return res;
        });
      return res;
      // after mint logic
    } catch (e) {
      console.log(e);
    }
  };

  const handleMintNow = async () => {
    setMintNowLoading(true);
    mintNftNow().then(async ({ minted, url }) => {
      if (!minted) return;

      let response = await fetch(
        `/api/post/mint?postId=${selectedPost._id}&nftLink=${url}&address=${store.user.address}`,
        {
          method: "get",
        }
      ).catch((e) => {
        console.log(e);
      });

      let data = await response.text();
      console.log(data);
      getPosts();
      viewRef.current.click();
      setMintNowLoading(false);
    });
  };

  const handleMint = async (e) => {
    setCreatePostLoading(true);

    let formData = new FormData(createFormRef.current);
    formData.append("user", store.user.address);
    formData.append("image", selectedImage);
    formData.append("chain", chain);

    for (var pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }
    // store the post
    await fetch("/api/post/create", {
      method: "POST",
      body: formData,
    })
      .then(async (storedPostRes) => {
        const res = await storedPostRes.json();
        const storedPost = res.post;
        // mint the nft
        mintNft(formData, storedPost).then(async ({ minted, url }) => {
          // update the post with the nft metadata (if minted)

          if (minted) {
            let updateResponse = await fetch(
              `/api/post/mint?postId=${storedPost._id}&nftLink=${url}&address=${store.user.address}`,
              {
                method: "get",
              }
            ).catch((e) => {
              console.log(e);
            });

            let updateData = await updateResponse.text();
            console.log("Stored and minted", updateData);
          } else {
            console.log("Only stored", storedPost);
          }

          getPosts();
          inputRef.current.click();
          setCreatePostLoading(false);
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  return (
    <div className="flex flex-col justify-center mt-12">
      {/* new user modal */}
      <input
        type="checkbox"
        id="my-modal-2"
        className="modal-toggle"
        ref={newUserRef}
      />
      <div className="modal " id="my-modal-2">
        <div className="modal-box max-w-fit bg-black">
          <p className="text-white font-semibold text-lg">
            Compelete Your Profile
          </p>
          <div className="divider"></div>
          <form
            className="w-[80vw] lg:w-[40vw] p-5"
            onSubmit={async (e) => {
              e.preventDefault();

              let formData = new FormData(e.currentTarget);
              formData.append("address", store.user.address);

              for (var pair of formData.entries()) {
                console.log(pair[0] + ", " + pair[1]);
              }

              let response = await fetch("/api/user/create", {
                method: "POST",
                body: formData,
              }).catch((e) => {
                console.log(e);
              });

              let data = await response.text();
              console.log(data);
              newUserRef.current.click();
            }}
          >
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">
                Your Name
              </label>
              <input
                name="name"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">
                Your bio
              </label>
              <input
                name="bio"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">
                Profile image
              </label>
              <input
                name="image"
                className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                required
              />
            </div>
            <div className="modal-action mt-10">
              <button
                type="submit"
                className="text-black bg-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Done
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* view posts modal */}

      <input
        type="checkbox"
        id="view-post"
        className="modal-toggle"
        ref={viewRef}
      />
      <div className="modal" id="view-post">
        <div className="modal-box max-w-fit bg-black overflow-hidden">
          <div className="text-white font-semibold text-lg gap-x-2 flex">
            <p>Post:</p> {selectedPost?._id}
          </div>
          <div className="divider"></div>
          <div className="overflow-x-auto">
            <label
              htmlFor="view-post"
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </label>
            <div className="overflow-y-scroll h-[70vh] w-[60vw] flex justify-center scrollbar scrollbar-thumb-black scrollbar-track-gray-100">
              <div className="overflow-x-auto w-[95%]">
                <div className="text-white ">
                  {mintNowLoading ? (
                    <div className="flex justify-center w-full h-96 items-center">
                      <div role="status ">
                        <svg
                          aria-hidden="true"
                          className="mr-2 w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                          />
                        </svg>
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="lg:flex justify-between  mt-10">
                      <div className="flex flex-col ">
                        <div className="space-y-2 mt-10">
                          <span className="flex gap-x-2">
                            <p>Title: </p> <p>{selectedPost?.title}</p>
                          </span>
                          <span className="flex gap-x-2">
                            <p>Description: </p>
                            <p>{selectedPost?.description}</p>
                          </span>
                          <span className="flex gap-x-2">
                            <p>User address: </p> <p>{selectedPost?.user}</p>
                          </span>
                          <span className="flex gap-x-2">
                            <p>Chain: </p> <p>{selectedPost?.chain}</p>
                          </span>
                          {selectedPost?.isMinted ? (
                            <span className="flex gap-x-2">
                              <p>Minted: </p>
                              <p>
                                {selectedPost?.isMinted &&
                                  selectedPost?.nftLink}
                              </p>
                            </span>
                          ) : selectedPost &&
                            store.user.address === selectedPost.user ? (
                            <span className="flex gap-x-2 items-center">
                              <p>Minted: </p>
                              <p>
                                <button
                                  className="modal-button flex items-center cursor-pointer transition-all hover:scale-105 hover:bg-white hover:text-black p-2 rounded-lg"
                                  onClick={() => {
                                    handleMintNow();
                                  }}
                                >
                                  Mint Now
                                </button>
                              </p>
                            </span>
                          ) : (
                            ""
                          )}

                          <span className="flex gap-x-2">
                            <p>Date created: </p>
                            <p>{formatDate(selectedPost?.createdAt)}</p>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between h-[61vh] mt-10 lg:mt-0">
                        <div>
                          <span className="flex gap-x-2 w-full justify-center mb-3">
                            <p>Top </p> <p>{selectedPost?.top}</p>
                          </span>
                          <div className="flex w-full justify-center ">
                            <img
                              className="w-72 border-2 border-white "
                              src={selectedPost?.image}
                              alt=""
                            />
                          </div>
                        </div>
                        <div className="flex gap-x-4">
                          <button
                            onClick={() => {
                              viewRef.current.click();
                            }}
                            className="p-2.5 border border-white hover:bg-white hover:text-black rounded-lg w-full"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* create post modal */}
      <input
        type="checkbox"
        id="create-post"
        className="modal-toggle"
        ref={inputRef}
      />
      <div className="modal " id="create-post">
        <div className="modal-box max-w-fit bg-black">
          <p className="text-white font-semibold text-lg">Create New Post</p>
          <div className="divider"></div>
          <form
            className="w-[80vw] lg:w-[40vw] p-5"
            ref={createFormRef}
            onSubmit={async (e) => {
              e.preventDefault();

              setCreatePostLoading(true);

              let formData = new FormData(e.currentTarget);
              formData.append("user", store.user.address);
              formData.append("image", selectedImage);
              formData.append("chain", chain);

              for (var pair of formData.entries()) {
                console.log(pair[0] + ", " + pair[1]);
              }

              let response = await fetch("/api/post/create", {
                method: "POST",
                body: formData,
              }).catch((e) => {
                console.log(e);
              });

              let data = await response.text();
              console.log(data);
              getPosts();
              inputRef.current.click();
              setCreatePostLoading(false);
            }}
          >
            {!createPostLoading ? (
              <div>
                <div className="mb-6">
                  <label
                    htmlFor="create-post"
                    className="btn btn-sm btn-circle absolute right-2 top-2"
                  >
                    ✕
                  </label>
                  <label className="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    name="title"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                    required
                    placeholder="nature"
                  />
                </div>
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">
                    description
                  </label>
                  <input
                    name="description"
                    className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                    required
                    placeholder="A very nice image"
                  />
                </div>
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">
                    Chain
                  </label>

                  <select
                    id="chain"
                    className=" p-2.5 rounded-lg w-full text-black"
                    placeholder="Select a blockchain"
                    value={chain}
                    onChange={(e) => {
                      setChain(e.target.value);
                    }}
                  >
                    <option value="polygon">Polygon</option>
                    <option value="ethereum">Ethereum</option>
                  </select>
                </div>
                <div className="mb-6 flex flex-col justify-center items-center">
                  <label className="block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300">
                    Click to upload an image
                  </label>
                  <label htmlFor="image-upload">
                    <div className="w-40 h-40 ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="white"
                        className="w-full h-full"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                        />
                      </svg>
                    </div>
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={(e) => {
                      setSelectedImage(e.target.files[0]);
                      console.log(selectedImage);
                    }}
                    accept="image/*"
                    id="image-upload"
                    style={{ display: "none" }}
                  />
                </div>
                <div className="modal-action mt-10">
                  <button
                    type="submit"
                    className="text-black bg-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      handleMint();
                    }}
                    className="text-black bg-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Mint
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center w-full h-96 items-center">
                <div role="status ">
                  <svg
                    aria-hidden="true"
                    className="mr-2 w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* TOP images section */}
      {topPosts && topPosts.length != 0 && (
        <div>
          <div className="flex justify-center mb-12">
            <div className="w-[90vw] flex flex-wrap  gap-x-4 gap-y-4 text-black font-semibold text-4xl ">
              <div className="w-full">Top images</div>
            </div>
          </div>
          <div className="flex justify-center mb-12 shadow-md shadow-gray-700 w-screen">
            <div className=" bg-gray-900 h-[57vh] overflow-x-scroll overflow-y-hidden flex items-center scrollbar w-screen scrollbar-thumb-black scrollbar-track-gray-100">
              <div className="w-fit flex gap-x-4 p-10 ">
                {topPosts.map((t) => (
                  <div
                    key={t.image}
                    className="h-[50vh] w-80 rounded-xl overflow-hidden transition-all hover:scale-105"
                    onClick={() => {
                      handleClick(t);
                    }}
                  >
                    <img
                      key={t.image}
                      src={t.image}
                      alt=""
                      className="w-full h-[55%] object-cover cursor-pointer"
                    />

                    <div className="h-[45%] ">
                      <div className="bg-black w-full h-full  ">
                        <div className="card-body  h-full ">
                          <h2 className=" flex justify-between">
                            <div className="card-title">
                              {t.title}
                              <div className="badge badge-warning">
                                TOP {t.top}
                              </div>
                            </div>
                          </h2>
                          <div className="break-normal w-64">
                            {t.description}
                          </div>
                          <div className="card-actions justify-end h-full items-end">
                            <div className="badge badge-outline">{t.chain}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* images section */}

      <div className="flex justify-center mb-12">
        <div className="w-[90vw] flex flex-wrap  gap-x-4 gap-y-4 text-black font-semibold text-4xl ">
          <div className="w-full">Images</div>
        </div>
      </div>

      {posts && posts.length != 0 ? (
        <div className="flex justify-center ">
          <div className="w-[90vw] flex flex-wrap  gap-x-4 gap-y-4 ">
            {posts.map((p) => (
              <div
                key={p.image}
                className="h-[55vh] flex-grow-[1] rounded-xl overflow-hidden transition-all hover:scale-105"
                onClick={() => {
                  handleClick(p);
                }}
              >
                <img
                  key={p.image}
                  src={p.image}
                  alt=""
                  className="w-full h-[55%] object-cover cursor-pointer"
                />

                <div className="h-[45%] ">
                  <div className="bg-black w-full h-full  ">
                    <div className="card-body  h-full ">
                      <h2 className=" flex justify-between">
                        <div className="card-title">
                          {p.title}
                          {isCurrentWeek(p.createdAt) && (
                            <div className="badge badge-secondary">NEW</div>
                          )}
                        </div>
                        <div className="avatar placeholder flex items-center">
                          <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                            <span>0x</span>
                          </div>
                          <span className="ml-2">
                            {p.user.slice(0, 4)}..
                            {p.user.slice(p.user.length - 3)}
                          </span>
                        </div>
                      </h2>
                      <div className="break-normal w-64">{p.description}</div>
                      <div className="card-actions justify-end h-full items-end">
                        <div className="badge badge-outline">{p.chain}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div role="status" className="w-screen h-screen flex justify-center ">
          <svg
            aria-hidden="true"
            className="mr-2 w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-black"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}
    </div>
  );
}

export default HomeComponent;

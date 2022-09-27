import React, { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getSession, useSession } from "next-auth/react";
import { getToken } from "next-auth/jwt";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const token = await getToken({ req: context.req });

  const address = token?.sub ?? null;
  // If you have a value for "address" here, your
  // server knows the user is authenticated.

  // You can then pass any data you want
  // to the page component here.

  if (address) {
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

function Login({ address }: AuthenticatedPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user.address) {
      router.push("/");
    }
  }, [session]);

  return (
    <div className="h-screen bg-white flex justify-center items-center">
      <div className="bg-black w-96 h-[32rem] flex justify-center items-center  shadow-xl rounded-xl">
        <div className=" flex flex-col gap-y-20  justify-center items-center">
          <p className="text-xl font-semibold text-white flex flex-col items-center">
            <img src="/icon.png" alt="" />
            Please login to countinue
          </p>
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}

export default Login;

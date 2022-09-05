import { ConnectButton } from "@rainbow-me/rainbowkit";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import HomeComponent from "../components/Home";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const token = await getToken({ req: context.req });

  const address = token?.sub ?? null;
  // If you have a value for "address" here, your
  // server knows the user is authenticated.

  // You can then pass any data you want
  // to the page component here.
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

const Home: NextPage = ({ address }: AuthenticatedPageProps) => {
  const router = useRouter();

  useEffect(() => {
    if (!address) {
      router.push("/login");
    }
  }, []);

  console.log(address);
  return (
    <div>
      <nav className="bg-p text-s text-lg font-semibold flex items-center p-5 justify-between shadow-lg ">
        <div className="ml-10">
          <button>Home</button>
        </div>
        <div>
          <ConnectButton />
        </div>
      </nav>
      {address ? (
        <div>
          <h1>Authenticated as {address}</h1>
          <HomeComponent />
        </div>
      ) : (
        <h1>Unauthenticated</h1>
      )}
    </div>
  );
};

export default Home;

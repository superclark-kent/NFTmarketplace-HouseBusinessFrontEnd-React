import { Navigate, useRoutes } from "react-router-dom";

// layouts
import { MainLayout } from "./layouts";

// pages
import Admin from "pages/Admin";
import AirdropWallet from "pages/AirdropWallet";
import Contract from "pages/Contract";
import CreateContract from "pages/CreateContract";
import HouseDetails from "pages/HouseDetails";
import Mint from "pages/Mint";
import Nfts from "pages/NFTs";
import Staking from "pages/Staking";
import ThirdParty from "pages/ThirdParty";
import NotFound from "pages/notFound";
import Dashboard from "./pages/Dashboard";

export default function Router() {
  return useRoutes([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        { path: "/", element: <Navigate to="/house/app" /> },
        { path: "/house/app", element: <Dashboard /> },
        { path: "/house/mint", element: <Mint /> },
        { path: "/house/myNfts", element: <Nfts /> },
        { path: "/house/staking", element: <Staking /> },
        { path: "/contract/main", element: <Contract /> },
        { path: "/contract/create", element: <CreateContract /> },
        { path: "/admin/main", element: <Admin /> },
        { path: "/account/:walletID", element: <AirdropWallet /> },
        { path: "/third-party/main", element: <ThirdParty /> },
        { path: "/item/:houseNftID", element: <HouseDetails /> },
        { path: "404", element: <NotFound /> },
        { path: "*", element: <Navigate to="/404" /> },
      ],
    },
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}

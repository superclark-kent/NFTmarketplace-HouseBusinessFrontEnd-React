import React from 'react'
import { Navigate, useRoutes } from 'react-router-dom';

// layouts
import {
    MainLayout,
    FullLayout,
} from './layouts'

// pages
import NotFound from 'pages/notFound';
import AirdropWallet from 'pages/AirdropWallet';
import Dashboard from './pages/Dashboard';
import Mint from 'pages/Mint';
import Nfts from 'pages/NFTs';
import HouseDetails from 'pages/HouseDetails';
import Staking from 'pages/Staking';
import Contract from 'pages/Contract';
import CreateContract from 'pages/CreateContract';
import Admin from 'pages/Admin';
import ThirdParty from 'pages/ThirdParty';

export default function Router() {

    return useRoutes([
        {
            path: '/admin',
            element: <MainLayout />,
            children: [
                { path: 'main', element: <Admin /> },
            ]
        },
        {
            path: '/account',
            element: <MainLayout />,
            children: [
                { path: ':walletID', element: <AirdropWallet /> },
            ]
        },
        {
            path: '/third-party',
            element: <MainLayout />,
            children: [
                { path: 'main', element: <ThirdParty /> },
            ]
        },
        {
            path: '/house',
            element: <MainLayout />,
            children: [
                { path: 'app', element: <Dashboard /> },
                { path: 'mint', element: <Mint /> },
                { path: 'nfts', element: <Nfts /> },
                { path: 'staking', element: <Staking /> },
            ]
        },
        {
            path: '/item',
            element: <MainLayout />,
            children: [
                { path: ':houseNftID', element: <HouseDetails /> },
            ]
        },
        {
            path: '/contract',
            element: <MainLayout />,
            children: [
                { path: 'main', element: <Contract /> },
                { path: 'create', element: <CreateContract /> },
            ]
        },
        {
            path: '/',
            element: <FullLayout />,
            children: [
                { path: '/', element: <Navigate to='/house/app' /> },
                { path: '/', element: <Navigate to='/house/mint' /> },
                { path: '/', element: <Navigate to='/house/nfts' /> },
                { path: '/', element: <Navigate to='/house/staking' /> },
                { path: '/', element: <Navigate to='/contract/main' /> },
                { path: '404', element: <NotFound /> },
                { path: '*', element: <Navigate to='/404' /> }
            ]
        },
        { path: '*', element: <Navigate to='/404' replace /> }
    ])
}

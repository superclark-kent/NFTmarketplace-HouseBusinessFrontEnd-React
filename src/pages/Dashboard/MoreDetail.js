import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material';
import CachedIcon from '@mui/icons-material/Cached';

export default function MoreDetail({ 
    account, 
    item, 
    nftClasses, 
    handleClickMoreDetail, 
    houseBusinessContract
 }) {

    const [confirm, setConfirm] = useState(false)

    // if (item.contributor.currentOwner === account || confirm === true) {
        return (
            <Box component={'a'} className={nftClasses.nftHouseHistory} onClick={() => handleClickMoreDetail(item)} >
                <CachedIcon />
                {`View Datapoint`}
            </Box>
        )
    // }

    return (
        <></>
    )
}

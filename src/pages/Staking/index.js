import LockIcon from '@mui/icons-material/Lock';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Grid, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useWeb3React } from '@web3-react/core';
import { useEffect, useState } from 'react';

import useNftStyle from 'assets/styles/nftStyle';
import useStakingStyle from 'assets/styles/stakingStyle';
import { useHouseBusinessContract, useStakingContract } from 'hooks/useContractHelpers';

import { houseSuccess } from 'hooks/useToast';
import { useWeb3 } from 'hooks/useWeb3';
import { StakingAddress, zeroAddress } from 'mainConfig';

export default function Staking() {
  const { account } = useWeb3React();
  const nftClasses = useNftStyle();
  const web3 = useWeb3();
  const classes = useStakingStyle();

  const houseBusinessContract = useHouseBusinessContract();
  const stakingContract = useStakingContract();
  const [allMyNFTs, setAllMyNFTs] = useState([]);
  const [allStakingtypes, setAllStakeTypes] = useState([]);
  const [stakingAPYs, setStakingAPYs] = useState([]);
  const [stakingVals, setStakingVals] = useState([]);
  const [totalClaimAmount, setTotalClaimAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cItem, setCItem] = useState(null);

  const [open, setOpen] = useState(false);

  const handleConfirmOpen = () => {
    setOpen(true);
  };

  const handleConfirmClose = () => {
    setLoading(false);
    setOpen(false);
  };

  const initialConfig = async () => {
    var allStakingTypes = await stakingContract.methods.getAllAPYs().call();

    var stakingTps = [],
      stakingAs = [],
      stakingVals = [];

    for (let i = 0; i < allStakingTypes[0].length; i++) {
      stakingAs.push(`APY ${allStakingTypes[1][0]}%`);
      stakingVals.push(allStakingTypes[0][0]);

      stakingTps.push({
        value: allStakingTypes[0][i],
        label: `${allStakingTypes[0][i]} (month)`,
        apy: allStakingTypes[1][i],
        apylabel: `APY ${allStakingTypes[1][i]}%`,
      });
    }
    setStakingAPYs(stakingAs);
    setStakingVals(stakingVals);
    setAllStakeTypes(stakingTps);
  };

  const loadNFTs = async () => {
    var nfts = await houseBusinessContract.methods.getAllHouses().call({ from: account });
    var otherNFTs = [];
    for (var i = 0; i < nfts.length; i++) {
      if (nfts[i].contributor.currentOwner === zeroAddress) continue;

      otherNFTs.push({
        ...nfts[i],
        staked: false
      });
    }
    var allnfts = await houseBusinessContract.methods.getAllHouses().call();
    var stakednfts = await stakingContract.methods.getAllMyStakedNFTs().call({ from: account });

    for (let i = 0; i < stakednfts.length; i++) {
      if (stakednfts[i].stakingStatus === false) continue;
      var stakedNFT = allnfts.filter((item) => item.houseID === stakednfts[i].houseID)[0];

      var startedDate = Number(`${stakednfts[i].startedDate}000`);
      var endDate = Number(`${stakednfts[i].endDate}000`);

      otherNFTs.push({
        ...stakedNFT,
        startedDate: startedDate,
        endDate: endDate,
      });
    }

    setAllMyNFTs(otherNFTs);
  };

  const getTotalRewards = async () => {
    setInterval(async () => {
      var totalReward = await stakingContract.methods.totalRewards(account).call();
      setTotalClaimAmount(totalReward);
    }, 3000);
  };

  const handleStaking = async (item, index) => {
    try {
      await houseBusinessContract.methods.approve(StakingAddress, item.houseID).send({ from: account });
      await stakingContract.methods.stake(item.houseID, stakingVals[index]).send({ from: account });
      houseSuccess('You staked house NFT successfully.');
      loadNFTs();
    } catch (error) {
      console.log(error);
    }
  };

  const handleClaimRewards = async () => {
    try {
      await stakingContract.methods.claimRewards(account).send({ from: account });
      houseSuccess('You claimed rewards successfully.');
      loadNFTs();
    } catch (error) {
      console.log(error);
    }
  };

  const handleUnstaking = async (item) => {
    if (!item) {
      item = cItem;
    }
    console.log(cItem);
    try {
      setLoading(true);
      await stakingContract.methods.unstake(item.houseID).send({ from: account });
      houseSuccess('You unstaked house NFT successfully.');
      loadNFTs();
    } catch (error) {
      console.log(error);
    }
  };

  const handleStakingTypeChange = (index, value) => {
    var stakingTps = [...allStakingtypes],
      stakingAs = [...stakingAPYs],
      stakingVals = [...stakingVals];
    var cStakingDt = stakingTps[stakingTps.findIndex((item) => item.value === value)];

    stakingAs[index] = cStakingDt.apylabel;
    stakingVals[index] = cStakingDt.value;

    setStakingAPYs(stakingAs);
    setStakingVals(stakingVals);
  };

  const generateDate = (time) => {
    var dt = new Date(Number(time));
    var yr = dt.getFullYear();
    var mt = dt.getMonth() + 1 < 10 ? `0${dt.getMonth() + 1}` : dt.getMonth() + 1;
    var dy = dt.getDate() < 10 ? `0${dt.getDate()}` : dt.getDate();
    return `${dy}-${mt}-${yr}`;
  };

  useEffect(() => {
    if (account) {
      initialConfig();
      getTotalRewards();
    }
  }, [account]);

  useEffect(() => {
    if (allStakingtypes.length > 0) {
      loadNFTs();
    }
  }, [allStakingtypes]);

  return (
    <Grid>
      <Box component={'h2'}>Stake NFT</Box>
      <Box component={'h3'}>
        <Grid>{`Total Claim Amount: ${web3.utils.fromWei(`${totalClaimAmount}`)} HBT`}</Grid>
        <Grid>
          <Button
            variant="outlined"
            onClick={() => handleClaimRewards()}
            className={classes.nftHouseButton}
            startIcon={<LockIcon />}
            disabled={totalClaimAmount === 0}
          >
            <Box
              component={'span'}
              className={classes.nftHouseBuyButton}
              textTransform={'capitalize'}
            >{`Claim Rewards`}</Box>
          </Button>
        </Grid>
      </Box>
      <Grid container spacing={3}>
        {allMyNFTs.length > 0
          ? allMyNFTs.map((item, index) => {
              return (
                <Grid item xl={3} lg={4} md={6} sm={6} key={index} className={nftClasses.nftHouseItem}>
                  <Grid className={nftClasses.nftHouseCard}>
                    <Grid className={nftClasses.nftHouseStakingMedia}>
                      <img className={nftClasses.nftStakingImg} src={item.tokenURI} />
                    </Grid>
                    <Grid>
                      <Box component={'h3'} className={nftClasses.nftHouseTitle}>{item.tokenName}</Box>
                    </Grid>
                    <Grid className={nftClasses.nftHouseMetaInfo}>
                      <Grid className={nftClasses.nftHouseInfo}>
                        <Box component={'span'}>Owned By</Box>
                        <Box component={'h4'} className={nftClasses.nftHouseOwner}>
                          {item.contributor.currentOwner}
                        </Box>
                      </Grid>
                      <Grid className={nftClasses.nftHousePrice}>
                        <Box component={'span'}>Current Price</Box>
                        <Box component={'h4'}>{`${web3.utils.fromWei(item.price)} MATIC`}</Box>
                      </Grid>
                    </Grid>
                    {item.staked === false ? (
                      <Grid className={classes.stakingBottom}>
                        <TextField
                          id="outlined-select-stakingtype-native"
                          select
                          value={stakingVals[index]}
                          onChange={(e) => handleStakingTypeChange(index, e.target.value)}
                          SelectProps={{
                            native: true,
                          }}
                        >
                          {allStakingtypes.map((option) => (
                            <option key={option.value} value={option.value} className={classes.stakingType}>
                              {option.label}
                            </option>
                          ))}
                        </TextField>
                        <Grid>{stakingAPYs[index]}</Grid>
                        <Button
                          variant="outlined"
                          onClick={() => handleStaking(item, index)}
                          className={classes.nftHouseButton}
                          startIcon={<LockIcon />}
                        >
                          <Box
                            component={'span'}
                            className={classes.nftHouseBuyButton}
                            textTransform={'capitalize'}
                          >{`Stake`}</Box>
                        </Button>
                      </Grid>
                    ) : (
                      <>
                        <Grid className={classes.stakingDates}>
                          <Grid>From : {generateDate(item.startedDate)}</Grid>
                          <Grid>To : {generateDate(item.endDate)}</Grid>
                        </Grid>
                        <Grid className={classes.stakingBottom}>
                          <Button
                            variant="outlined"
                            onClick={async () => {
                              var flag = await stakingContract.methods.stakingFinished(item.houseID).call();
                              if (flag === false) {
                                setCItem(item);
                                handleConfirmOpen();
                              } else {
                                setCItem(null);
                                handleUnstaking(item);
                              }
                            }}
                            className={classes.nftHouseButton}
                            startIcon={<LockIcon />}
                          >
                            <Box
                              component={'span'}
                              className={classes.nftHouseBuyButton}
                              textTransform={'capitalize'}
                            >{`Unstake`}</Box>
                          </Button>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
              );
            })
          : ''}
      </Grid>
      <Dialog
        open={open}
        onClose={handleConfirmClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Are you sure?'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You unstake before end date, this will result in a lower yield.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={handleConfirmClose} loading={loading} variant="contained">
            Disagree
          </LoadingButton>
          <LoadingButton onClick={() => handleUnstaking(null)} loading={loading} variant="contained">
            Agree
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

import React, { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import {
  useHouseBusinessContract,
  useCleanContract,
  useThirdPartyContract,
  useStakingContract,
} from 'hooks/useContractHelpers';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  TextField,
  Button,
  InputBase,
  Paper,
  Divider,
  IconButton,
  FormControlLabel,
  Stack,
  styled,
  ButtonGroup,
} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import { BigNumber } from 'ethers';
import useAdminStyle from 'assets/styles/adminStyle';
import NftHistory from './NftHistory';
import Input from '@mui/material/Input';
import { houseError, houseInfo, houseSuccess } from 'hooks/useToast';
import LoadingButton from '@mui/lab/LoadingButton';
import { useWeb3 } from 'hooks/useWeb3';
import Edit from '@mui/icons-material/Edit';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { property } from 'lodash';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  'Oliver Hansen',
  'Van Henry',
  'April Tucker',
  'Ralph Hubbard',
  'Omar Alexander',
  'Carlos Abbott',
  'Miriam Wagner',
  'Bradley Wilkerson',
  'Virginia Andrews',
  'Kelly Snyder',
];

const ariaLabel = { 'aria-label': 'description' };
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function Admin() {
  const [personName, setPersonName] = useState([]);
  const [person, setPerson] = useState([]);

  const [DeleteCategory, SetDeleteCategory] = useState('');
  const [DeleteProperty, SetDeleteProperty] = useState('');

  const handleChangeDeleteProperty = (event) => {
    SetDeleteProperty(event.target.value);
  };

  const handleChangeDeleteItem = (event) => {
    SetDeleteCategory(event.target.value);
  };

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const filterProperty = (e) => {
    const {
      target: { value },
    } = e;
    setPerson(typeof value === 'string' ? value.split(',') : value);
  };

  const classes = useAdminStyle();
  const web3 = useWeb3();
  const { account } = useWeb3React();
  const navigate = useNavigate();
  const houseBusinessContract = useHouseBusinessContract();
  const CleanContract = useCleanContract();
  const StakingContract = useStakingContract();
  const thirdPartyContract = useThirdPartyContract();

  const [historyTypes, setHistoryTypes] = useState([]);

  const [MPrice, setMprice] = useState(0.2);
  const [Hprice, setHprice] = useState(2);
  const [penalty, setPenalty] = useState(0);
  const [royaltyCreator, setRoyaltyCreator] = useState(0);
  const [royaltyMarket, setRoyaltyMarket] = useState(0);
  const [apyTypes, setApyTypes] = useState([]);
  const [apyValues, setApyValues] = useState([]);
  const [apySelect, setApySelect] = useState(1); // 1, 2, 3, 4
  const [apyValue, setApyValue] = useState(0);

  const [loading, setLoading] = useState(false);

  const [countArray, setCountArray] = useState([]);
  const [uploadedCount, setUploadedCount] = useState(0);

  const [validateFlag, setValidateFlag] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const [NPropertyList, setNPropertyList] = useState([]);
  const [NProperty, setNProperty] = useState('');

  const [CategoryList, setCategoryList] = useState([]);
  const [NCategory, setNCategory] = useState('');

  const [newCategoryId, setNewCategory] = useState('');

  const [visibleProperty, setVisibleProperty] = useState([]);

  const [Pname, setPname] = useState('');

  const [Pprice, setPprice] = useState('');

  const [Pperiod, setPperiod] = useState(0);

  const [DataLimit, setDataLimit] = useState('');

  const PeriodList = [
    {
      name: 'Annually',
      value: 0,
    },
    {
      name: 'Monthly',
      value: 1,
    },
    {
      name: 'Daily',
      value: 2,
    },
  ];

  const initialConfig = async () => {
    var MH_Price = await houseBusinessContract.methods.getMinMaxNFT().call({ from: account });
    setMprice(web3.utils.fromWei(MH_Price[0]));
    setHprice(web3.utils.fromWei(MH_Price[1]));

    var penalty = await StakingContract.methods.getPenalty().call({ from: account });
    setPenalty(penalty);

    var royaltyCreator = await houseBusinessContract.methods.getRoyaltyCreator().call({ from: account });
    setRoyaltyCreator(royaltyCreator);

    var royaltyMarket = await houseBusinessContract.methods.getRoyaltyMarket().call({ from: account });
    setRoyaltyMarket(royaltyMarket);

    var allApys = await houseBusinessContract.methods.getAllAPYs().call({ from: account });
    console.log('allApys', allApys, allApys[0]);
    setApyTypes(allApys[0]);
    setApyValues(allApys[1]);
    setApySelect(allApys[0][0]);
    setApyValue(allApys[1][0]);
    var isMember = await houseBusinessContract.methods.isMember().call({ from: account });
    if (isMember === false) {
      houseError("You aren't admin");
      navigate('../../house/app');
    }

    var propertyList = await thirdPartyContract.methods.getAllProperties().call();
    var tempList = [];
    for (var i = 0; i < propertyList.length; i++) {
      tempList.push(propertyList[i][1]);
    }
    setVisibleProperty(tempList);

    setCountArray(await houseBusinessContract.methods.getTotalInfo().call({ from: account }));

    setUploadedCount(await CleanContract.methods.getUploadedCounter().call({ from: account }));

    var hTypes = await houseBusinessContract.methods.getHistoryType().call();
    var allHTypes = [];
    for (let i = 0; i < hTypes.length; i++) {
      if (hTypes[i].hLabel === '') continue;
      allHTypes.push(hTypes[i]);
    }
    setHistoryTypes(allHTypes);
  };

  const AccessAdmin = () => {
    if (adminEmail != 'admin@mail.co' || adminPass != 'admin123!@#') {
      houseError('Please Input your Correct Info!');
    } else {
      setValidateFlag(true);
    }
  };

  const handleSetMintPrice = async () => {
    setLoading(true);
    var Min_Price = BigNumber.from(`${Number(MPrice) * 10 ** 18}`);
    var High_Price = BigNumber.from(`${Number(Hprice) * 10 ** 18}`);
    await houseBusinessContract.methods.setMinMaxHousePrice(Min_Price, High_Price).send({ from: account });
    houseSuccess('Changed Success');
    setLoading(false);
  };

  const handleSetPenalty = async () => {
    setLoading(true);
    var penaltyBigNum = BigNumber.from(`${Number(penalty) * 10 ** 18}`);
    await houseBusinessContract.methods.setPenalty(penaltyBigNum).send({ from: account });
    houseSuccess('Changed Success');
    setLoading(false);
  };

  const handleSetRoyaltyCreator = async () => {
    setLoading(true);
    await houseBusinessContract.methods.setRoyaltyCreator(royaltyCreator).send({ from: account });
    houseSuccess('Creator Royalty Changed successfully!');
    setLoading(false);
  };

  const handleSetRoyaltyMarket = async () => {
    setLoading(true);
    await houseBusinessContract.methods.setRoyaltyMarket(royaltyMarket).send({ from: account });
    houseSuccess('Market Royalty Changed successfully!');
    setLoading(false);
  };

  const handleApySelectChange = async (e) => {
    setApySelect(e.target.value);
    var index = apyTypes.indexOf(e.target.value);
    console.log('index', index);
    setApyValue(apyValues[index]);
  };

  const handleUpdateRoyalty = async () => {
    setLoading(true);
    await houseBusinessContract.methods.updateAPYConfig(apySelect, apyValue).send({ from: account });
    houseSuccess('Updating APY works!');
    setLoading(false);
  };
  const AddNewCategory = async () => {
    if (NCategory !== '') {
      if (CategoryList.findIndex((item) => item.cartegoryName.toUpperCase() === NCategory.toUpperCase()) === -1) {
        console.log('NPropertyList', NPropertyList);
        if (NPropertyList.length > 0) {
          var proIDList = [];
          for (let i = 0; i < NPropertyList.length; i++) {
            proIDList.push(Number(NPropertyList[i].propertyID));
          }
          await thirdPartyContract.methods.addCategory(NCategory, proIDList).send({ from: account });
          const Category = await thirdPartyContract.methods.getAllCategories().call();
          setCategoryList(Category.filter((item) => item[1] != ''));
          houseSuccess('Added New Category');
          setNCategory('');
        } else {
          houseInfo('Please add property list first.');
        }
      } else {
        houseError('Already Created');
      }
    } else {
      houseError('Input the CategoryName!');
    }
  };

  const AddNewProperty = async () => {
    if (NProperty !== '') {
      if (NPropertyList.findIndex((item) => item.propertyName.toUpperCase() === NProperty.toUpperCase()) === -1) {
        await thirdPartyContract.methods.addProperty(NProperty).send({ from: account });
        setNPropertyList((preState) => [...preState, { propertyID: NPropertyList.length, propertyName: NProperty }]);
        setNProperty('');
        houseSuccess('Successfully added');
      } else {
        houseError('Already Added');
      }
    } else {
      houseError('Input the PropertyName!');
    }
  };

  const DeleteSelectedProperty = async () => {
    if (DeleteProperty !== '') {
      await thirdPartyContract.methods.deleteProperty(DeleteProperty).send({ from: account });
      setNPropertyList(NPropertyList.filter((item) => item.propertyID != DeleteProperty));
      SetDeleteProperty('');
      houseSuccess('You deleted property successfully!');
    } else {
      houseError('Select the Property!');
    }
  };

  const DeleteSelectedCategory = async () => {
    if (DeleteCategory !== '') {
      await thirdPartyContract.methods.deleteCategory(DeleteCategory).send({ from: account });
      const Category = await thirdPartyContract.methods.getAllCategories().call({ from: account });
      setCategoryList(Category.filter((item) => item[1] != ''));
      // setPersonName(personName.filter(item => item != DeleteCategory));
      SetDeleteCategory('');
      houseSuccess('Remove Category Success!');
    } else {
      houseError('Select the Category!');
    }
  };

  const SaveVisibleState = () => {
    console.log(personName, CategoryList, 'personName');
  };

  const ADDNEWPACKAGE = async () => {
    if (newCategoryId != '' && person.length != 0 && Pname != '' && Pprice != '' && Pprice > 0 && DataLimit > 0) {
      let arr = [];
      visibleProperty.map((property) => {
        if (person.findIndex((item) => item == property) != -1) {
          arr.push(true);
        } else {
          arr.push(false);
        }
      });
      await thirdPartyContract.methods
        .addPackage(newCategoryId, Pname, Pprice, Pperiod, DataLimit, arr)
        .send({ from: account });
      houseSuccess('Added New Package');
    } else {
      houseError('Input Correct Info');
    }
  };

  useEffect(async () => {
    initialConfig();
    var MH_Price = await houseBusinessContract.methods.getMinMaxNFT().call({ from: account });
    setMprice(web3.utils.fromWei(MH_Price[0]));
    setHprice(web3.utils.fromWei(MH_Price[1]));

    const Category = await thirdPartyContract.methods.getAllCategories().call({ from: account });
    console.log('Category', Category);
    setCategoryList(Category.filter((item) => item[1] != ''));
  }, []);

  return (
    <Grid>
      {validateFlag ? (
        <Grid>
          <Box component={'h2'}>Admin Page</Box>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item md={12}>
              <Box component={'h3'}>Set penalty</Box>
              <Grid item md={12} sx={{ display: 'flex', gap: '30px' }}>
                <Grid item md={4}>
                  <Paper
                    component="form"
                    sx={{
                      p: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      width: 400,
                    }}
                  >
                    <InputBase
                      value={penalty}
                      onChange={(e) => setPenalty(e.target.value)}
                      sx={{ ml: 1, flex: 1 }}
                      placeholder="Penalty"
                      inputProps={{ 'aria-label': 'package' }}
                      type="number"
                      disabled={loading}
                    />
                  </Paper>
                </Grid>
                <LoadingButton
                  size="small"
                  color="secondary"
                  onClick={handleSetPenalty}
                  loading={loading}
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  variant="contained"
                >
                  Save
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item md={12}>
              <Box component={'h3'}>Set Creator Royalty</Box>
              <Grid item md={12} sx={{ display: 'flex', gap: '30px' }}>
                <Grid item md={4}>
                  <Paper
                    component="form"
                    sx={{
                      p: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      width: 400,
                    }}
                  >
                    <InputBase
                      value={royaltyCreator}
                      onChange={(e) => setRoyaltyCreator(e.target.value)}
                      sx={{ ml: 1, flex: 1 }}
                      placeholder="Royalty Creator"
                      inputProps={{ 'aria-label': 'package' }}
                      type="number"
                      disabled={loading}
                    />
                  </Paper>
                </Grid>
                <LoadingButton
                  size="small"
                  color="secondary"
                  onClick={handleSetRoyaltyCreator}
                  loading={loading}
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  variant="contained"
                >
                  Save
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item md={12}>
              <Box component={'h3'}>Set Market Royalty</Box>
              <Grid item md={12} sx={{ display: 'flex', gap: '30px' }}>
                <Grid item md={4}>
                  <Paper
                    component="form"
                    sx={{
                      p: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      width: 400,
                    }}
                  >
                    <InputBase
                      value={royaltyMarket}
                      onChange={(e) => setRoyaltyMarket(e.target.value)}
                      sx={{ ml: 1, flex: 1 }}
                      placeholder="Royalty Creator"
                      inputProps={{ 'aria-label': 'package' }}
                      type="number"
                      disabled={loading}
                    />
                  </Paper>
                </Grid>
                <LoadingButton
                  size="small"
                  color="secondary"
                  onClick={handleSetRoyaltyMarket}
                  loading={loading}
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  variant="contained"
                >
                  Save
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item md={12}>
              <Box component={'h3'}>Set APY</Box>
              <Grid item md={12} sx={{ display: 'flex', gap: '30px' }}>
                <Grid item md={2}>
                  <Select
                    labelId="demo-simple-select-autowidth-label"
                    id="demo-simple-select-autowidth"
                    value={apySelect}
                    onChange={(e) => handleApySelectChange(e)}
                    autowidth
                  >
                    {apyTypes.map((item, index) => (
                      <MenuItem value={item} key={index}>
                        {item} Month
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid item md={4}>
                  <Paper
                    component="form"
                    sx={{
                      p: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      width: 400,
                    }}
                  >
                    <InputBase
                      value={apyValue}
                      onChange={(e) => setApyValue(e.target.value)}
                      sx={{ ml: 1, flex: 1 }}
                      placeholder="APY Value"
                      inputProps={{ 'aria-label': 'package' }}
                      type="number"
                      disabled={loading}
                    />
                  </Paper>
                </Grid>
                <LoadingButton
                  size="small"
                  color="secondary"
                  onClick={handleUpdateRoyalty}
                  loading={loading}
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  variant="contained"
                >
                  Save
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item md={12}>
              <Box component={'h3'}>Set Up NFT Mint Price</Box>
              <Grid item md={12} sx={{ display: 'flex', gap: '30px' }}>
                <Grid item md={4}>
                  <Paper
                    component="form"
                    sx={{
                      p: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      width: 400,
                    }}
                  >
                    <InputBase
                      value={MPrice}
                      onChange={(e) => setMprice(e.target.value)}
                      sx={{ ml: 1, flex: 1 }}
                      placeholder="Min Price"
                      inputProps={{ 'aria-label': 'package' }}
                      type="number"
                      disabled={loading}
                    />
                  </Paper>
                </Grid>
                <Grid item md={4}>
                  <Paper
                    component="form"
                    sx={{
                      p: '2px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      width: 400,
                    }}
                  >
                    <InputBase
                      disabled={loading}
                      value={Hprice}
                      onChange={(e) => setHprice(e.target.value)}
                      sx={{ ml: 1, flex: 1 }}
                      placeholder="High Price"
                      inputProps={{ 'aria-label': 'package' }}
                      type="number"
                    />
                  </Paper>
                </Grid>
                <LoadingButton
                  size="small"
                  color="secondary"
                  onClick={handleSetMintPrice}
                  loading={loading}
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  variant="contained"
                >
                  Save
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Box component={'h3'}>Overall total information</Box>
            </Grid>
            <Grid item xs={4}>
              <Item className={classes.overallGrid}>
                <label>Minted NFT</label>
                <div style={{ flex: '1' }}></div>
                <label>{countArray[0]}</label>
              </Item>
            </Grid>
            <Grid item xs={4}>
              <Item className={classes.overallGrid}>
                <label>Staked NFT</label>
                <div style={{ flex: '1' }}></div>
                <label>{countArray[1]}</label>
              </Item>
            </Grid>
            <Grid item xs={4}>
              <Item className={classes.overallGrid}>
                <label>Solded NFT</label>
                <div style={{ flex: '1' }}></div>
                <label>{countArray[2]}</label>
              </Item>
            </Grid>
            <Grid item xs={4}>
              <Item className={classes.overallGrid}>
                <label>Coming Royalty</label>
                <div style={{ flex: '1' }}></div>
                <label>0</label>
              </Item>
            </Grid>
            <Grid item xs={4}>
              <Item className={classes.overallGrid}>
                <label>Solded Package</label>
                <div style={{ flex: '1' }}></div>
                <label>0</label>
              </Item>
            </Grid>
            <Grid item xs={4}>
              <Item className={classes.overallGrid}>
                <label>Uploaded Contract</label>
                <div style={{ flex: '1' }}></div>
                <label>{uploadedCount}</label>
              </Item>
            </Grid>
            <Grid item md={12}>
              <Box component={'h3'}>Third Party Package</Box>
            </Grid>
            <Grid item md={12} sx={{ pt: '0px !important' }}>
              <Box component={'h4'} sx={{ m: '0px' }}>
                Create New Category
              </Box>
            </Grid>
            <Grid item md={12} sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Grid item md={4}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    value={NProperty}
                    onChange={(e) => setNProperty(e.target.value)}
                    id="outlined-basic"
                    label="New Property"
                    variant="outlined"
                    sx={{ m: '8px' }}
                    fullWidth
                  />
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                  <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions" onClick={AddNewProperty}>
                    <AddIcon />
                  </IconButton>
                </Paper>
              </Grid>
              <Grid item md={4}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FormControl sx={{ m: 1 }} fullWidth>
                    <InputLabel id="demo-simple-select-autowidth-label">Delete Property</InputLabel>
                    <Select
                      labelId="demo-simple-select-autowidth-label"
                      id="demo-simple-select-autowidth"
                      value={DeleteProperty}
                      onChange={handleChangeDeleteProperty}
                      autoWidth
                      label="Category"
                    >
                      {NPropertyList.map((item, index) => {
                        return (
                          <MenuItem key={index} value={item.propertyID}>
                            {item.propertyName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                  <IconButton
                    color="primary"
                    sx={{ p: '10px' }}
                    aria-label="directions"
                    onClick={DeleteSelectedProperty}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </Paper>
              </Grid>
              <Grid item md={4}>
                <></>
              </Grid>
            </Grid>
            <Grid item md={12}>
              {visibleProperty.map((item, index) => {
                return (
                  <Button variant="contained" size="medium" sx={{ minWidth: '10vw', m: '10px' }} key={index}>
                    {item}
                  </Button>
                );
              })}
            </Grid>
            <Grid item md={12} sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Grid item md={4}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    value={NCategory}
                    onChange={(e) => setNCategory(e.target.value)}
                    id="outlined-basic"
                    label="New Category"
                    variant="outlined"
                    sx={{ m: '8px' }}
                    fullWidth
                  />
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                  <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions" onClick={AddNewCategory}>
                    <AddIcon />
                  </IconButton>
                </Paper>
              </Grid>
              <Grid item md={4}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FormControl sx={{ m: 1 }} fullWidth>
                    <InputLabel id="demo-simple-select-autowidth-label">Delete Category</InputLabel>
                    <Select
                      labelId="demo-simple-select-autowidth-label"
                      id="demo-simple-select-autowidth"
                      value={DeleteCategory}
                      onChange={handleChangeDeleteItem}
                      autoWidth
                      label="Category"
                    >
                      {CategoryList.map((item, index) => {
                        return (
                          <MenuItem key={index} value={item[0]}>
                            {item[1]}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                  <IconButton
                    color="primary"
                    sx={{ p: '10px' }}
                    aria-label="directions"
                    onClick={DeleteSelectedCategory}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </Paper>
              </Grid>
              <Grid item md={4}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FormControl sx={{ m: 1 }} fullWidth>
                    <InputLabel id="demo-multiple-checkbox-label">Visible</InputLabel>
                    <Select
                      labelId="demo-multiple-checkbox-label"
                      id="demo-multiple-checkbox"
                      multiple
                      value={personName}
                      onChange={handleChange}
                      input={<OutlinedInput label="Tag" />}
                      renderValue={(selected) => selected.join(', ')}
                      MenuProps={MenuProps}
                    >
                      {CategoryList.map((item, index) => (
                        <MenuItem key={index} value={item[1]}>
                          <Checkbox checked={personName.indexOf(item[1]) > -1} />
                          <ListItemText primary={item[1]} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                  <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions" onClick={SaveVisibleState}>
                    <SaveIcon />
                  </IconButton>
                </Paper>
              </Grid>
            </Grid>
            <Grid item md={12}>
              {CategoryList.map((item, index) => {
                return (
                  <Button variant="contained" size="medium" sx={{ minWidth: '10vw', m: '10px' }} key={index}>
                    {item[1]}
                  </Button>
                );
              })}
            </Grid>
            <Grid item md={12}>
              <Divider sx={{ height: 28, m: 0.5 }} orientation="horizental" />
            </Grid>
            <Grid item md={12}>
              <Box component={'h4'} sx={{ m: '0px' }}>
                Add New Package
              </Box>
            </Grid>
            <Grid item md={12} sx={{ display: 'flex', gap: '20px' }}>
              <Grid item md={4}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FormControl sx={{ m: 1 }} fullWidth>
                    <InputLabel id="demo-simple-select-autowidth-label">Select Category</InputLabel>
                    <Select
                      labelId="demo-simple-select-autowidth-label"
                      id="demo-simple-select-autowidth"
                      value={newCategoryId}
                      onChange={(e) => {
                        setNewCategory(e.target.value);
                        // setVisibleProperty(
                        //   CategoryList.filter(
                        //     (item) => item[0] === e.target.value
                        //   )[0][2]
                        // );
                        // setVisibleProperty(NPropertyList);
                        setPersonName([]);
                        setPerson([]);
                      }}
                      autoWidth
                      label="Category"
                    >
                      {CategoryList.map((item, index) => {
                        return (
                          <MenuItem key={index} value={item[0]}>
                            {item[1]}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>
              <Grid item md={4}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FormControl sx={{ m: 1 }} fullWidth>
                    <InputLabel id="demo-multiple-checkbox-label">Property</InputLabel>
                    <Select
                      labelId="demo-multiple-checkbox-label"
                      id="demo-multiple-checkbox"
                      multiple
                      value={person}
                      onChange={filterProperty}
                      input={<OutlinedInput label="Tag" />}
                      renderValue={(selected) => selected.join(', ')}
                      MenuProps={MenuProps}
                    >
                      {visibleProperty.map((item, index) => (
                        <MenuItem key={index} value={item}>
                          <Checkbox checked={person.indexOf(item) > -1} />
                          <ListItemText primary={item} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>
              <Grid item md={4}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    value={DataLimit}
                    onChange={(e) => setDataLimit(e.target.value)}
                    id="outlined-basic"
                    label="Data Limit"
                    variant="outlined"
                    sx={{ m: '8px' }}
                    fullWidth
                    type="number"
                  />
                </Paper>
              </Grid>
            </Grid>
            <Grid item md={12} sx={{ display: 'flex', gap: '20px' }}>
              <Grid item md={4}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    value={Pname}
                    onChange={(e) => setPname(e.target.value)}
                    id="outlined-basic"
                    label="Package Name"
                    variant="outlined"
                    sx={{ m: '8px' }}
                    fullWidth
                  />
                </Paper>
              </Grid>
              <Grid item md={4}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    value={Pprice}
                    onChange={(e) => setPprice(e.target.value)}
                    id="outlined-basic"
                    label="Price"
                    variant="outlined"
                    sx={{ m: '8px' }}
                    fullWidth
                    type="number"
                  />
                  <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                  <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                    <AttachMoneyIcon />
                  </IconButton>
                </Paper>
              </Grid>
              <Grid item md={4}>
                <Paper
                  component="form"
                  sx={{
                    p: '2px 4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <FormControl sx={{ m: 1 }} fullWidth>
                    <InputLabel id="demo-simple-select-autowidth-label">Select Category</InputLabel>
                    <Select
                      labelId="demo-simple-select-autowidth-label"
                      id="demo-simple-select-autowidth"
                      value={Pperiod}
                      onChange={(e) => {
                        setPperiod(e.target.value);
                      }}
                      autoWidth
                      label="Category"
                    >
                      {PeriodList.map((item, index) => {
                        return (
                          <MenuItem key={index} value={item.value}>
                            {item.name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Paper>
              </Grid>
            </Grid>
            <Grid
              item
              md={12}
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
              }}
            >
              <Button
                onClick={ADDNEWPACKAGE}
                variant="contained"
                endIcon={<AddIcon />}
                size="large"
                sx={{ height: '100%' }}
              >
                Add New Package
              </Button>
            </Grid>
            <Grid item md={12}>
              <Divider sx={{ height: 28, m: 0.5 }} orientation="horizental" />
            </Grid>
            <NftHistory classes={classes} historyTypes={historyTypes} />
          </Grid>
        </Grid>
      ) : (
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
          }}
          noValidate
          autoComplete="off"
        >
          <Input
            type="email"
            placeholder="Email"
            inputProps={ariaLabel}
            sx={{ minWidth: '30vw' }}
            value={adminEmail}
            onChange={(e) => {
              setAdminEmail(e.target.value);
            }}
          />
          <Input
            type="password"
            placeholder="Password"
            inputProps={ariaLabel}
            sx={{ minWidth: '30vw' }}
            value={adminPass}
            onChange={(e) => {
              setAdminPass(e.target.value);
            }}
          />
          <Button variant="contained" onClick={AccessAdmin}>
            Access to Admin Page
          </Button>
        </Box>
      )}
    </Grid>
  );
}

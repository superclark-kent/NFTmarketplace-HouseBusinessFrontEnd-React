import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import StarIcon from '@mui/icons-material/StarBorder';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import GlobalStyles from '@mui/material/GlobalStyles';
import Container from '@mui/material/Container';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { useThirdPartyContract } from "hooks/useContractHelpers";
import { useWeb3React } from '@web3-react/core';
import { FormGroup } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CheckIcon from '@mui/icons-material/Check';

function TabPanel(props) {
  const { children, value, index, CId, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}


const tiers = [
  {
    title: 'Free',
    price: '0',
    description: [
      '10 users included',
      '2 GB of storage',
      'Help center access',
      'Email support',
    ],
    buttonText: 'Free!',
    buttonVariant: 'outlined',
  },
  {
    title: 'Pro',
    subheader: 'Most popular',
    price: '15',
    description: [
      '20 users included',
      '10 GB of storage',
      'Help center access',
      'Priority email support',
    ],
    buttonText: 'Buy Now',
    buttonVariant: 'contained',
  },
  {
    title: 'Enterprise',
    price: '30',
    description: [
      '50 users included',
      '30 GB of storage',
      'Help center access',
      'Phone & email support',
    ],
    buttonText: 'Buy now',
    buttonVariant: 'outlined',
  },
];

export default function FullWidthTabs() {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const { account } = useWeb3React();
  const thirdPartyContract = useThirdPartyContract();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  const [CagetoryList, setCategoryList] = useState([]);
  const [ActiveCategory, setActiveCategory] = useState([]);
  const [PropertyList, setPropertyList] = useState([]);

  const SelectCategory = async (category) => {
    setActiveCategory([]);
    setPackage([]);
    setActiveCategory(category);
    setPackage(await thirdPartyContract.methods.getPackagesByCategory(category[0]).call({ from: account }));
  }

  const [Package, setPackage] = useState([]);

  useEffect(async () => {
    let category = await thirdPartyContract.methods.getAllCategories().call({ from: account });
    category = category.filter(item => item[1] !== '');
    setCategoryList(category);
    setActiveCategory(category[0])
    setPackage(await thirdPartyContract.methods.getPackagesByCategory(category[0][0]).call({ from: account }));
    setPropertyList(await thirdPartyContract.methods.getAllProperties().call({ from: account}))
  }, [])

  return (
    <Box sx={{ bgcolor: 'background.paper' }}>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          {
            CagetoryList.map((item, key) => {
              return (
                <Tab key={key} label={item[1]} onClick={() => {
                  SelectCategory(item)
                }} {...a11yProps(key)} />
              )
            })
          }
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        {
          CagetoryList.map((item, key) => {
            return (
              <TabPanel value={value} index={key} dir={theme.direction} key={key} CId={item[0]}>
                <Grid container spacing={5} alignItems="flex-end" sx={{ mt: '0', justifyContent: 'center' }}>
                  {
                    Package.map((tier) => {
                      return (
                        <Grid
                          item
                          key={tier[0]}
                        >
                          <Card sx={{ borderRadius: '40px 40px 0px 0px' }}>
                            <CardHeader
                              title={tier[2]}
                              titleTypographyProps={{ align: 'center' }}
                              subheaderTypographyProps={{
                                align: 'center',
                              }}
                              sx={{
                                backgroundColor: (theme) =>
                                  theme.palette.mode === 'light'
                                    ? theme.palette.grey[200]
                                    : theme.palette.grey[700],
                              }}
                            />
                            <CardContent>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'baseline',
                                  mb: 2,
                                }}
                              >
                                <Typography component="h2" variant="h3" color="text.primary">
                                  ${tier[3]}
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                  {
                                    tier[4] == 0 ?
                                      '/Year'
                                      :
                                      tier[4] == 1 ?
                                        '/Month'
                                        :
                                        '/Day'
                                  }
                                </Typography>
                              </Box>
                              <FormGroup>
                                <FormControlLabel control={<CheckIcon />} label={`Access to ${tier[5]} datapoints`} sx={{ gap: '10px', marginLeft: '30px', my: '10px' }} />
                              </FormGroup>

                              {
                                  PropertyList.map((prop, index) =>{
                                    return( tier[6][index] && (
                                      <FormGroup key={index}>
                                        <FormControlLabel
                                        control = {<CheckIcon />} label={prop[1]} sx={{ gap: '10px', marginLeft: '30px', my: '10px' }}>
                                        </FormControlLabel>
                                      </FormGroup>
                                    )      )                            
                                  })
                              }
                            </CardContent>
                            <CardActions>
                              <Button fullWidth variant='contained'>
                                Buy Now
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      )
                    })
                  }
                </Grid>
              </TabPanel>
            )
          })
        }
      </SwipeableViews >
    </Box >
  );
}

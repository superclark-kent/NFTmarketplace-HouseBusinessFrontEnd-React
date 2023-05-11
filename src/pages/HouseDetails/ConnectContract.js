import ClearIcon from '@mui/icons-material/Clear';
import { Grid, IconButton, MenuItem, Select } from '@mui/material';
import { Box } from '@mui/system';
import { useEffect } from 'react';

export default function ConnectContract({ classes, contracts, cContract, setCContract }) {
  const handleClearClick = () => {
    setCContract(0);
  };

  useEffect(() => {
    console.log('===>', contracts)
  }, [])

  return (
    <Grid className={classes.connectContract}>
      {contracts.length > 0 && (
        <>
          <Box component={'h3'}>Connect Contract</Box>
          <Select
            className={classes.contract}
            id="filled-select-currency"
            label="Select contract"
            value={cContract}
            onChange={(e) => {
              setCContract(e.target.value);
            }}
            sx={{
              '& .MuiSelect-iconOutlined': { display: cContract ? 'none' : '' },
              '&.Mui-focused .MuiIconButton-root': { color: 'primary.main' },
            }}
            variant="filled"
            endAdornment={
              <IconButton sx={{ display: cContract ? 'block' : 'none' }} onClick={handleClearClick}>
                <ClearIcon />
              </IconButton>
            }
          >
            {contracts.map((option) => (
              <MenuItem key={option.contractId} value={option.contractId} type={option.contractType}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </>
      )}
      {/* <Button variant="outlined" className={classes.nftHouseButton} onClick={() => handleConnectContract()}>
        <Box
          component={'span'}
          className={classes.nftHouseBuyButton}
          textTransform={'capitalize'}
        >{`Connect Contract`}</Box>
      </Button> */}
    </Grid>
  );
}

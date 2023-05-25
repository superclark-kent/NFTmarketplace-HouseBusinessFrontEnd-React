import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Grid,
  IconButton,
  TextField
} from "@mui/material";

import { BigNumber } from 'ethers';

import CancelIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import { useWeb3React } from "@web3-react/core";
import { useHouseBusinessContract } from "hooks/useContractHelpers";
import { houseSuccess } from "hooks/useToast";
import { isEmpty } from "lodash";

const hHeaders = [
  "History Label",
  "Connect Contract",
  "Image",
  "Brand",
  "Description",
  "Brand Type",
  "Year",
  "Other Info",
  "Percentage",
  "Value(MATIC)",
  "Actions",
];

export default function HistoryType({ classes, historyTypes, labelPercents }) {
  const houseBusinessContract = useHouseBusinessContract();
  const { account } = useWeb3React();

  const [allTypes, setAllTypes] = useState([]);
  const [editArr, setEditArr] = useState([]);
  const [newItem, setNewItem] = useState(null);
  const [editingItem, setEditingItem] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newHistory, setNewHistory] = useState("");
  const [Hdata, setHData] = useState([]);
  const [addFlag, setAddFlag] = useState(false);
  const [percents, setLabelPercents] = useState([])

  const label = { inputProps: { "aria-label": "History Checkbox" } };

  const addNewHistoryType = () => {
    var obj = {};
    obj["hLabel"] = newHistory;
    obj["connectContract"] = false;
    obj["imgNeed"] = false;
    obj["brandNeed"] = false;
    obj["descNeed"] = false;
    obj["brandTypeNeed"] = false;
    obj["otherInfo"] = false;
    obj["yearNeed"] = false;
    obj["percent"] = 0;
    obj["value"] = 0;
    setNewItem(obj);
    setNewHistory("");
    setAddFlag(true);
  };

  const handleSave = async (historyItem, typeID) => {
    const typeValue = BigNumber.from(`${Number(historyItem.value) * 10 ** 18}`);
    setLoading(true);
    try {
      await houseBusinessContract.methods
        .addOrEditHistoryType(
          typeID,
          historyItem.hLabel,
          historyItem.connectContract,
          historyItem.imgNeed,
          historyItem.brandNeed,
          historyItem.descNeed,
          historyItem.brandTypeNeed,
          historyItem.yearNeed,
          historyItem.otherInfo,
          typeValue,
          addFlag
        )
        .send({ from: account });

      let temp = [...Hdata];
      temp[typeID] = historyItem;
      setHData(temp);
      setAllTypes(temp);
      const eArr = new Array(temp.length).fill(false);
      setEditArr(eArr);
      setAddFlag(false);
      houseSuccess("Saved Success");
    } catch (err) {
      console.log('err', err)
    }
    setLoading(false);
  };

  const handleRemove = async (itemIndex) => {
    setLoading(true);
    try {
      const tx = await houseBusinessContract.methods.removeHistoryType(itemIndex).send({ from: account });
      let temp = [...Hdata];
      delete temp[itemIndex];
      temp = temp.filter((item) => !isEmpty(item));
      setHData(temp);
      setAllTypes(temp);
      houseSuccess("Success Deleted");
    } catch (err) {
      console.log('err', err)
    }
    setLoading(false);
  };

  const handleItemChange = (item, hIndex, changeType, checked) => {
    var obj = { ...item };
    obj["percent"] = item.percent;
    obj[changeType] = checked;
    var eArr = [];
    for (let i = 0; i < allTypes.length; i++) {
      if (i === hIndex) {
        eArr.push(true);
      } else {
        eArr.push(false);
      }
    }
    setEditingIndex(hIndex);
    setEditArr(eArr);
    setEditingItem(obj);
  };

  const handleEditCancel = (item) => {
    if (item.newItem === true) {
      setNewItem(null);
    } else {
      updateData();
    }
  };

  const updateData = () => {
    var hArr = [], eArr = [];
    for (let i = 0; i < Hdata.length; i++) {
      hArr.push({
        id: i,
        ...Hdata[i],
      });
      eArr.push(false);
      if (i === Hdata.length - 1 && newItem != null) {
        hArr.push({
          newItem: true,
          id: Hdata.length,
          ...newItem,
        });
        eArr.push(true);
      }
    }
    setEditingIndex(null);
    setEditArr(eArr);
    setAllTypes(hArr);
    setEditingItem({});
  };

  useEffect(() => {
    setHData(historyTypes);
    setAllTypes(historyTypes)
  }, [historyTypes]);

  useEffect(() => {
    if (newItem != null) updateData();
  }, [newItem]);

  useEffect(() => {
    setLabelPercents(labelPercents);
  }, [labelPercents])

  return (
    <Grid item md={12}>
      <Grid className={classes.addHeader}>
        <Box component={"h3"}>History Types</Box>
        <Grid sx={{ display: "flex" }}>
          <TextField
            id="outlined-textarea"
            placeholder="New History Type"
            value={newHistory}
            onChange={(e) => setNewHistory(e.target.value)}
          />
          <Button
            variant="contained"
            disabled={newHistory === ""}
            onClick={() => addNewHistoryType()}
          >
            Add New Type
          </Button>
        </Grid>
      </Grid>
      <Grid className={classes.historyTypSection} container disabled>
        <Grid container className={classes.historyHeader}>
          {hHeaders.map((item, index) => {
            return (
              <Grid
                item
                key={`history-header-${index}`}
                sx={{ fontWeight: "500" }}
                className={index === 0 ? classes.firstgrid : classes.grid}
              >
                {item}
              </Grid>
            );
          })}
        </Grid>
        {allTypes.map((item, itemIndex) => {
          if (itemIndex === editingIndex) {
            item = editingItem;
          }
          return (
            <Grid
              container
              key={`history-item-${itemIndex}`}
              className={classes.historyItems}
            >
              <Grid item className={classes.firstgrid}>
                <TextField
                  id="standard-basic"
                  variant="standard"
                  value={item.hLabel}
                  disabled={loading}
                  onChange={(e) =>
                    handleItemChange(item, itemIndex, "hLabel", e.target.value)
                  }
                />
              </Grid>
              <Grid item className={classes.grid}>
                <Checkbox
                  {...label}
                  checked={item.connectContract}
                  disabled={loading}
                  onChange={(e) =>
                    handleItemChange(
                      item,
                      itemIndex,
                      "connectContract",
                      e.target.checked
                    )
                  }
                />
              </Grid>
              <Grid item className={classes.grid}>
                <Checkbox
                  {...label}
                  checked={item.imgNeed}
                  disabled={loading}
                  onChange={(e) =>
                    handleItemChange(
                      item,
                      itemIndex,
                      "imgNeed",
                      e.target.checked
                    )
                  }
                />
              </Grid>
              <Grid item className={classes.grid}>
                <Checkbox
                  {...label}
                  checked={item.brandNeed}
                  disabled={loading}
                  onChange={(e) =>
                    handleItemChange(
                      item,
                      itemIndex,
                      "brandNeed",
                      e.target.checked
                    )
                  }
                />
              </Grid>
              <Grid item className={classes.grid}>
                <Checkbox
                  {...label}
                  checked={item.descNeed}
                  disabled={loading}
                  onChange={(e) =>
                    handleItemChange(
                      item,
                      itemIndex,
                      "descNeed",
                      e.target.checked
                    )
                  }
                />
              </Grid>
              <Grid item className={classes.grid}>
                <Checkbox
                  {...label}
                  checked={item.brandTypeNeed}
                  disabled={loading}
                  onChange={(e) =>
                    handleItemChange(
                      item,
                      itemIndex,
                      "brandTypeNeed",
                      e.target.checked
                    )
                  }
                />
              </Grid>
              <Grid item className={classes.grid}>
                <Checkbox
                  {...label}
                  checked={item.yearNeed}
                  disabled={loading}
                  onChange={(e) =>
                    handleItemChange(
                      item,
                      itemIndex,
                      "yearNeed",
                      e.target.checked
                    )
                  }
                />
              </Grid>
              <Grid item className={classes.grid}>
                <Checkbox
                  {...label}
                  checked={item.otherInfo}
                  disabled={loading}
                  onChange={(e) =>
                    handleItemChange(
                      item,
                      itemIndex,
                      "otherInfo",
                      e.target.checked
                    )
                  }
                />
              </Grid>
              <Grid item className={classes.perLabel}>
                <label>
                  {(() => {
                    var percent = 0;
                    if (item.connectContract) { percent += Number(percents[0]); }
                    if (item.imgNeed) { percent += Number(percents[1]); }
                    if (item.brandNeed) { percent += Number(percents[2]); }
                    if (item.descNeed) { percent += Number(percents[3]); }
                    if (item.brandTypeNeed) { percent += Number(percents[4]); }
                    if (item.yearNeed) { percent += Number(percents[5]); }
                    if (item.otherInfo) { percent += Number(percents[6]); }
                    return `${percent}%`;
                  })()}
                </label>
              </Grid>
              <Grid item className={classes.perLabel}>
                <TextField
                  value={item.value}
                  id="outlined-basic"
                  variant="outlined"
                  sx={{ m: '8px' }}
                  size="small"
                  className={classes.fullWidth}
                  type="number"
                  onChange={(e) => {
                    if (e.target.value < 0) return;
                    handleItemChange(item, itemIndex, 'value', e.target.value)
                  }}
                />
              </Grid>
              <Grid item className={classes.grid}>
                {editArr[itemIndex] === true ? (
                  <>
                    {
                      loading === true ?
                        <CircularProgress /> :
                        <>
                          <IconButton
                            aria-label="edit"
                            color="primary"
                            onClick={() => handleSave(item, itemIndex)}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            aria-label="cancel"
                            color="primary"
                            onClick={() => handleEditCancel(item)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                    }
                  </>
                ) : (
                  <IconButton
                    aria-label="delete"
                    color="primary"
                    onClick={() => handleRemove(itemIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
}

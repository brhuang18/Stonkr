import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';

import { Icon } from '@iconify/react';
import searchFill from '@iconify/icons-eva/search-fill';
import {
  Input,
  Slide,
  Button,
  InputAdornment,
  ClickAwayListener,
  IconButton
} from '@mui/material';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SearchComplete(props) {
  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState([]);
  const navigate = useNavigate()
  const { handleClose } = props

  function handleClick (ticker, name) {
    navigate(`/dashboard/search/${ticker}/overview`, { replace: true });
    handleClose();
  }

  const fetch = React.useMemo(
    () =>
      throttle((request, callback) => {
        axios.get(`http://127.0.0.1:8000/search/stocks?keywords=${request.input}`)
        .then(function (res) {
          callback(res.data.bestMatches)
        }).catch(function (err) {
          console.log(err.response)
        })
      }, 500),
    [],
  );

  React.useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...results];
        }

        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  return (
    <Autocomplete
      id="google-map-demo"
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.description
      }
      filterOptions={(x) => x}
      options={options}
      autoComplete
      fullWidth="true"
      includeInputInList
      filterSelectedOptions
      freeSolo
      value={value}
      onChange={(event, newValue) => {
        setOptions(newValue ? [newValue, ...options] : options);
        if (typeof newValue === 'object' &&
        !Array.isArray(newValue) &&
        newValue !== null) {
          setValue(newValue['1. symbol']);
        } else {
          setValue(newValue)
        }
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} 
          fullWidth
          autoFocus
          variant="standard"
          placeholder="Search…"
          InputProps={{
            ...params.InputProps,
            sx: {mr:1, fontWeight: 'fontWeightBold'},
            startAdornment: 
            <InputAdornment position="start">
              <Box
                component={Icon}
                icon={searchFill}
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>,
            disableUnderline: true,
          }}
        />
      )}
      renderOption={(props, option) => {
        return (
          <li {...props} onClick={() => handleClick(option['1. symbol'], option['2. name'])}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1">{option['1. symbol']}</Typography>
              <Typography variant="subtitle2">{option['2. name']}</Typography>
            </div>
          </li>
        );
      }}
    />
  );
}

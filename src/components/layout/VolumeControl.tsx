import { useState, useRef, MouseEventHandler } from "react";
import { VolumeOff, VolumeUp } from "@mui/icons-material";
import { IconButton, Popover, Slider, Box, SliderProps, Typography } from "@mui/material";
import { useSound } from "../../sound/hooks/useSound";

const marks = [{ value: 50 }];

export const VolumeControl = () => {
  const { mute, isMuted, setVolume, volume } = useSound();
  const [sliderValue, setSliderValue] = useState(() => volume * 100);
  const [anchorEl, setAnchorEl] = useState<(EventTarget & HTMLButtonElement) | null>(null);
  const iconButtonRef = useRef<HTMLButtonElement | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVolumeChange: SliderProps["onChange"] = (_event, newValue) => {
    if (typeof newValue !== "number") {
      return;
    }
    setSliderValue(newValue);
  };

  const handleVolumeChangeCommitted: SliderProps["onChangeCommitted"] = (_event, newValue) => {
    if (typeof newValue !== "number") {
      return;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      const scaledValue = newValue / 100;
      setVolume(scaledValue);
    }, 300);
  };

  const handleMuteToggle: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    mute();
    if (!isMuted) {
      setSliderValue(0);
      setVolume(0);
    } else {
      const restoredVolume = 50;
      setSliderValue(restoredVolume);
      setVolume(restoredVolume / 100);
    }
  };

  const handlePopoverToggle: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "volume-slider-popover" : undefined;

  return (
    <>
      <IconButton size="small" title="Volume" onClick={handlePopoverToggle} ref={iconButtonRef}>
        {isMuted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        disableRestoreFocus
        disableScrollLock
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        slotProps={{
          paper: {
            sx: { marginTop: 1, padding: 1 },
          },
        }}
      >
        <Box sx={{ width: 250, padding: 1, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton size="small" title={isMuted ? "Unmute" : "Mute"} onClick={handleMuteToggle}>
            {isMuted || sliderValue === 0 ? (
              <VolumeOff fontSize="small" />
            ) : (
              <VolumeUp fontSize="small" />
            )}
          </IconButton>
          <Slider
            color={sliderValue > 0 ? "success" : "error"}
            value={sliderValue}
            onChange={handleVolumeChange}
            onChangeCommitted={handleVolumeChangeCommitted}
            aria-labelledby="volume-slider"
            min={0}
            max={100}
            step={1}
            marks={marks}
            size="small"
          />
          <Typography variant="button" pl={0.5} minWidth="2.8em">
            {sliderValue}%
          </Typography>
        </Box>
      </Popover>
    </>
  );
};

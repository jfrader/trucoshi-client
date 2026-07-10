import {
  Button,
  ButtonGroup,
  TextField,
  useMediaQuery,
  useTheme,
  IconButton,
  Popover,
  Autocomplete,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import InsertEmoticon from "@mui/icons-material/InsertEmoticon";
import {
  type ChangeEventHandler,
  type FormEventHandler,
  type SyntheticEvent,
  useState,
  useRef,
} from "react";
import Picker, { EmojiStyle } from "emoji-picker-react";
import {
  type ChatFieldProps,
  type EmojiOption,
  PALETTE_EMOJI_THEME_MAP,
  buttonGroupProps,
  sendButtonProps,
  textFieldProps,
} from "./ChatFieldShared";
import { EMOJI_OPTIONS } from "./emojiAliases";

const ChatFieldWithEmojis = ({
  alwaysVisible,
  disableEmojis,
  active,
  chat,
  isLoading,
}: ChatFieldProps) => {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const [message, setMessage] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [suggestions, setSuggestions] = useState<EmojiOption[]>([]);
  const [autocompleteKey, setAutocompleteKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenPicker = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setShowPicker(true);
  };

  const handleClosePicker = () => {
    setAnchorEl(null);
    setShowPicker(false);
  };

  const onEmojiClick = (emojiObject: { emoji: string }) => {
    setMessage((prev) => prev + emojiObject.emoji + " ");
    handleClosePicker();
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    setMessage(value);

    const match = value.match(/:([a-zA-Z0-9_-]*):?$/);
    if (match) {
      const query = match[1].toLowerCase();
      const filteredEmojis = EMOJI_OPTIONS.filter((emoji) =>
        emoji.label.toLowerCase().startsWith(query),
      ).slice(0, 3);
      setSuggestions(filteredEmojis);
    } else {
      setSuggestions([]);
    }
  };

  const handleAutocompleteSelect = (_event: SyntheticEvent, value: string | EmojiOption | null) => {
    if (value && typeof value !== "string") {
      const match = message.match(/:([a-zA-Z0-9_-]*):?$/);
      if (match) {
        const fullMatch = match[0];
        setMessage((prev) => prev.replace(fullMatch, value.emoji + " "));
      }
      setSuggestions([]);
      setAutocompleteKey((prev) => prev + 1);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (message.trim()) {
      chat(message.trim());
      setMessage("");
      setSuggestions([]);
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
      }
    }
  };

  if (!(isLg || alwaysVisible || active)) {
    return null;
  }

  return (
    <form onSubmit={onSubmit}>
      <ButtonGroup {...buttonGroupProps}>
        <Autocomplete
          key={autocompleteKey}
          freeSolo
          options={suggestions}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : `${option.emoji} :${option.label}:`
          }
          onChange={handleAutocompleteSelect}
          open={suggestions.length > 0}
          disableClearable
          clearOnEscape
          autoHighlight
          value=""
          renderInput={(params) => (
            <TextField
              {...params}
              {...textFieldProps}
              value={message}
              autoFocus={isLg}
              onChange={onChange}
              inputRef={inputRef}
              inputProps={{
                ...params.inputProps,
                value: message,
              }}
            />
          )}
          PaperComponent={({ children }) => (
            <Paper
              elevation={10}
              sx={{
                bgcolor: theme.palette.background.paper,
                boxShadow: theme.shadows[2],
                borderRadius: 1,
                mt: 1,
              }}
            >
              {children}
            </Paper>
          )}
          sx={{ flexGrow: 1 }}
          ListboxProps={{
            sx: {
              maxHeight: 200,
              overflow: "auto",
              bgcolor: theme.palette.background.default,
            },
          }}
        />
        {disableEmojis ? null : (
          <IconButton
            onClick={handleOpenPicker}
            sx={(theme) => ({ width: theme.spacing(4) })}
            disabled={isLoading}
            aria-label="Emojis"
          >
            <InsertEmoticon />
          </IconButton>
        )}
        <Button {...sendButtonProps} disabled={isLoading || !message.trim()}>
          <SendIcon />
        </Button>
      </ButtonGroup>
      {disableEmojis ? null : (
        <Popover
          open={showPicker}
          anchorEl={anchorEl}
          onClose={handleClosePicker}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <Picker
            emojiStyle={EmojiStyle.NATIVE}
            onEmojiClick={onEmojiClick}
            theme={PALETTE_EMOJI_THEME_MAP[theme.palette.mode]}
          />
        </Popover>
      )}
    </form>
  );
};

export default ChatFieldWithEmojis;

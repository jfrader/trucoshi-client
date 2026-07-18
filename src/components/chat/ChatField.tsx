import { Button, ButtonGroup, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { ChangeEventHandler, FormEventHandler, useState, useRef } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import {
  ChatFieldProps,
  buttonGroupProps,
  sendButtonProps,
  textFieldProps,
} from "./ChatFieldShared";

const ChatField = ({ alwaysVisible, active, chat, isLoading }: ChatFieldProps) => {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const [message, setMessage] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setMessage(e.target.value);
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (message.trim()) {
      chat(message.trim());
      setMessage("");
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
        <TextField {...textFieldProps} value={message} onChange={onChange} inputRef={inputRef} />
        <Button {...sendButtonProps} disabled={isLoading || !message.trim()}>
          <SendIcon />
        </Button>
      </ButtonGroup>
    </form>
  );
};

export default ChatField;

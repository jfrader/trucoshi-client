import {
  Button,
  ButtonGroup,
  Paper,
  Slide,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { ChangeEventHandler, FormEventHandler, useState } from "react";
interface Props {
  alwaysVisible?: boolean;
  active?: boolean;
  chat: (message: string) => void;
  isLoading: boolean;
}
export const ChatField = ({ alwaysVisible, active, chat, isLoading }: Props) => {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));
  const [message, setMessage] = useState<string>("");

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    chat(message);
    setMessage("");
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setMessage(e.target.value);
  };

  return (
    <Slide in={isLg || alwaysVisible || active} direction="right">
      <form onSubmit={onSubmit}>
        <ButtonGroup
          size="small"
          fullWidth
          component={Paper}
          sx={(theme) => ({
            background: theme.palette.background.paper,
          })}
        >
          <TextField
            fullWidth
            value={message}
            onChange={onChange}
            color="warning"
            size="small"
            aria-autocomplete="none"
            autoComplete="off"
          />
          <Button
            sx={(theme) => ({ width: theme.spacing(4) })}
            disabled={isLoading || !message}
            color="warning"
            variant="text"
            size="small"
            type="submit"
          >
            <SendIcon />
          </Button>
        </ButtonGroup>
      </form>
    </Slide>
  );
};

import { HelpOutlined } from "@mui/icons-material";
import { Card, CardContent, Stack, Tab, Tabs, Typography } from "@mui/material";
import { SyntheticEvent, useState } from "react";
import { PageContainer } from "../shared/PageContainer";
import { BitcoinHelp } from "../components/help/BitcoinHelp";
import { TrucoHelp } from "../components/help/TrucoHelp";
import { Link } from "../shared/Link";
import { GITHUB_LINK_JFRADER } from "../assets/links/links";

export const Help = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <PageContainer title="Ayuda" icon={<HelpOutlined fontSize="large" />}>
      <Card>
        <CardContent>
          <Tabs variant="fullWidth" value={tabValue} onChange={handleChange} aria-label="Help Tabs">
            <Tab label="Truco" />
            <Tab label="Bitcoin" />
          </Tabs>
          <Stack>
            {tabValue === 0 && <TrucoHelp />}
            {tabValue === 1 && <BitcoinHelp />}

            <Typography pt={4} display="block" variant="caption">
              Trucoshi is an independent project maintained by{" "}
              <Link target="_blank" to={GITHUB_LINK_JFRADER.to}>
                jfrader
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

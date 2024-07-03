import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import PentagramLogo from '../assets/pentagram.png';
import { getRandomQueries } from '../services/QueryService';
import { useEffect, useState } from 'react';

interface Props {
  sendQuery: (query: string) => void;
}

const LandingText = ({ sendQuery }: Props) => {
  const [sampleQueries, setSampleQueries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const queries = getRandomQueries(4);
    setSampleQueries(queries);
    setIsLoading(false);
  }, []);

  if (isLoading) return <></>;

  return (
    <Stack
      spacing={2}
      display='flex'
      justifyContent='center'
      alignItems='center'
    >
      <img src={PentagramLogo} alt='logo' style={{ width: 64 }} />
      <Grid container spacing={2}>
        {sampleQueries.map((query, index) => (
          <Grid item sm={6} md={3} key={index} sx={{ width: '100%' }}>
            <Card
              variant='outlined'
              sx={{
                bgcolor: 'transparent',
                borderColor: 'secondary.main',
                borderRadius: 4,
                height: '100%',
              }}
            >
              <CardActionArea
                sx={{ height: '100%' }}
                onClick={() => sendQuery(query)}
              >
                <CardContent>
                  <Typography
                    fontFamily='Arial'
                    color='secondary.light'
                    variant='body2'
                  >
                    {query}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default LandingText;

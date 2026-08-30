import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Link,
  Pagination,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

const API_BASE_URL = 'http://localhost:4000/api';

type Repository = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
};

type SearchResponse = {
  total_count: number;
  items: Repository[];
  page: number;
  perPage: number;
  totalPages: number;
};

const defaultResponse: SearchResponse = {
  total_count: 0,
  items: [],
  page: 1,
  perPage: 10,
  totalPages: 0
};

function App() {
  const [query, setQuery] = useState('laravel');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SearchResponse>(defaultResponse);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('laravel');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    const fetchRepositories = async () => {
      if (!debouncedQuery) {
        setData(defaultResponse);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await axios.get(`${API_BASE_URL}/repositories`, {
          params: {
            q: debouncedQuery,
            page,
            perPage: 10
          }
        });

        if (!cancelled) {
          setData(response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message ?? 'Something went wrong while fetching repositories.');
          setData(defaultResponse);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRepositories();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, page]);

  const totalPages = useMemo(() => Math.max(data.totalPages, 1), [data.totalPages]);
  const normalizedPage = Math.min(Math.max(page, 1), totalPages);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setPage(1);
  };

  const handlePageChange = (_event: unknown, value: number) => {
    setPage(Math.min(Math.max(value, 1), totalPages));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
            GitHub Repository Search
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search public GitHub repositories by keyword and browse results with pagination.
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Search repositories"
          value={query}
          onChange={handleSearchChange}
          placeholder="Try: react, node, vue"
        />

        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : null}

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : !debouncedQuery ? (
          <Alert severity="info">Enter a repository name or topic to begin your search.</Alert>
        ) : data.items.length === 0 ? (
          <Alert severity="info">No repositories found for “{debouncedQuery}”.</Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              Showing {data.items.length} of {data.total_count.toLocaleString()} repositories
            </Typography>

            <Grid container spacing={2}>
              {data.items.map((repo) => (
                <Grid item xs={12} md={6} key={repo.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <img
                            src={repo.owner.avatar_url}
                            alt={repo.owner.login}
                            width={32}
                            height={32}
                            style={{ borderRadius: '50%' }}
                          />
                          <Link href={repo.html_url} target="_blank" rel="noreferrer" sx={{ fontWeight: 600 }}>
                            {repo.full_name}
                          </Link>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          {repo.description ?? 'No description provided.'}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Last updated: {new Date(repo.updated_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {repo.language ? <Chip size="small" label={repo.language} /> : null}
                          <Chip
                            size="small"
                            icon={<StarOutlineIcon fontSize="small" />}
                            label={repo.stargazers_count.toLocaleString()}
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {totalPages > 1 ? (
              <Box display="flex" justifyContent="center" pt={2}>
                <Pagination
                  count={totalPages}
                  page={normalizedPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            ) : null}
          </>
        )}
      </Stack>
    </Container>
  );
}

export default App;

import 'dotenv/config';
import cors from 'cors';
import express from 'express';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const GITHUB_API_URL = 'https://api.github.com/search/repositories';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60_000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/search', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const page = Number(req.query.page ?? 1);
  const perPage = Number(req.query.perPage ?? 10);

  if (!q) {
    return res.status(400).json({ message: 'Query parameter "q" is required.' });
  }

  if (!Number.isFinite(page) || page < 1) {
    return res.status(400).json({ message: 'Page must be a positive number.' });
  }

  if (!Number.isFinite(perPage) || perPage < 1 || perPage > 100) {
    return res.status(400).json({ message: 'perPage must be between 1 and 100.' });
  }

  const cacheKey = `${q}|${page}|${perPage}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return res.json(cached.data);
  }

  try {
    const response = await fetch(`${GITHUB_API_URL}?q=${encodeURIComponent(q)}&page=${page}&per_page=${perPage}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'github-repository-search-assessment'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const payload = {
      total_count: data.total_count ?? 0,
      items: (data.items ?? []).map((item: any) => ({
        id: item.id,
        name: item.name,
        full_name: item.full_name,
        description: item.description,
        html_url: item.html_url,
        stargazers_count: item.stargazers_count,
        language: item.language,
        updated_at: item.updated_at,
        owner: {
          login: item.owner?.login,
          avatar_url: item.owner?.avatar_url
        }
      })),
      page,
      perPage,
      totalPages: Math.ceil((data.total_count ?? 0) / perPage)
    };

    cache.set(cacheKey, { data: payload, timestamp: now });
    res.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    res.status(500).json({ message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

import app from './app';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () =>
  // eslint-disable-next-line no-console
  console.log(`milestones-server started running on port ${PORT}`),
);

export function respondNotModified(res) {
  res.cork(() => {
    res.writeStatus('304').end();
  });
}

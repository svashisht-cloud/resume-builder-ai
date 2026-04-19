export function isClientError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("Unsupported resume format") ||
      error.message.includes("Legacy .doc") ||
      error.message.includes("empty"))
  );
}

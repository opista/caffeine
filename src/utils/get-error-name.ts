export function getErrorName(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.name;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof (error as Record<string, unknown>).name === "string"
  ) {
    return (error as Record<string, unknown>).name;
  }

  return undefined;
}

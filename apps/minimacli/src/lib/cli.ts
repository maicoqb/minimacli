export type CliOptions = {
  newSession: boolean;
};

export function parseCliArgs(argv: string[]): CliOptions {
  return {
    newSession: argv.includes('--new-session'),
  };
}

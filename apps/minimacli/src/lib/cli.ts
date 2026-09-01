export type CliOptions = {
  newSession: boolean;
  install?: string;
};

export function parseCliArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    newSession: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--new-session') {
      options.newSession = true;
      continue;
    }

    if (arg === '--install') {
      const value = argv[i + 1];

      if (!value || value.startsWith('--')) {
        throw new Error('Missing plugin name for --install');
      }

      options.install = value;
      i += 1;
    }
  }

  return options;
}

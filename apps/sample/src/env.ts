const rawPort = import.meta.env.VITE_PORT;

export const env = {
  port: Number(rawPort ?? 43123),
};

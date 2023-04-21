import dotenv from "dotenv";
dotenv.config();

export function getEnv(target: string) {
  const env = process.env[target];
  if (!env) throw new Error(`${target} 환경변수가 존재하지 않습니다.`);

  return env;
}

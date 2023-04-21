import { Configuration, OpenAIApi } from "openai";
import { getEnv } from "./config";
import { ChatCompletionMessage } from "./type";

const openai = new OpenAIApi(
  new Configuration({ apiKey: getEnv("OPEN_AI_API_KEY") })
);

export async function askQuestion(messages: ChatCompletionMessage[]) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
  });

  let answer = response.data.choices[0].message?.content ?? "답변이 없습니다.";

  // discord error - content[BASE_TYPE_MAX_LENGTH]: Must be 2000 or fewer in length.
  return answer.length >= 2000 ? answer.slice(0, 1999) : answer;
}

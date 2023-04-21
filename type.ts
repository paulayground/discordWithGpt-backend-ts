type ChatCompletionMessageRole = "assistant" | "user";

export interface ChatCompletionMessage {
  role: ChatCompletionMessageRole;
  content: string;
}

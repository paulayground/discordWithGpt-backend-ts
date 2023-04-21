import { AnyThreadChannel, Client, GatewayIntentBits } from "discord.js";
import { askQuestion } from "./open-ai";
import { getEnv } from "./config";
import { ChatCompletionMessage } from "./type";
import { deleteAppId } from "./common";

// Discord 클라이언트 생성
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Discord 클라이언트 준비 이벤트 핸들러 등록
client.once("ready", () => {
  console.log(client.user);

  console.log("Ready!");
});

// Discord 메시지 이벤트 핸들러 등록

client.on("messageCreate", async (message) => {
  // 봇 메시지는 무시
  const isBot = message.author.bot;
  if (isBot) return;

  // 봇 멘션을 받은 메시지만 처리
  const isBotMention = message.mentions.users.reduce(
    (isBot, user) => (user.bot ? true : isBot),
    false
  );

  if (!isBotMention) return;

  try {
    const messageChannel = message.channel;

    const isFirstMessage = message.channel.type === 0;
    if (isFirstMessage) {
      // 새로운 스레드 생성
      const question: ChatCompletionMessage = {
        role: "user",
        content: deleteAppId(message.content),
      };

      const threadName =
        question.content.length >= 30
          ? question.content.slice(0, 30)
          : question.content;
      const createdThread = await message.startThread({
        name: threadName,
      });

      // OpenAI API 호출
      const answer = await askQuestion([question]);

      createdThread.send(answer);
    } else {
      // 이미 생성된 스레드에서 메시지 처리
      const thread = await (messageChannel as AnyThreadChannel).fetch();

      const threadMessage = await thread.messages.fetch();

      // 스레드에 있는 모든 메시지를 대화 데이터로 변환
      let questions: ChatCompletionMessage[] = [
        { role: "user", content: deleteAppId(thread.name) },
      ];

      threadMessage.reverse().map((message) => {
        const isBot = message.author.bot;

        questions.push({
          role: isBot ? "assistant" : "user",
          content: deleteAppId(message.content),
        });
      });

      // OpenAI API 호출
      const answer = await askQuestion(questions);

      // 스레드 내에서 답변 작성
      await thread.send(answer);
    }
  } catch (error) {
    console.error(error);

    await message.reply("Failed to generate answer.");
  }
});

// Discord 클라이언트 로그인
client.login(getEnv("DISCORD_BOT_TOKEN"));

export async function onRequestPost({request,env}) {
  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (!env.WEBHOOK_SECRET || secret !== env.WEBHOOK_SECRET) return new Response("Forbidden",{status:403});
  const update = await request.json();
  const msg = update.message;
  if (!msg || msg.chat.type !== "private" || msg.from?.is_bot) return new Response("OK");
  const input = (msg.text || "").trim();
  const reply = text => Response.json({method:"sendMessage",chat_id:msg.chat.id,text});
  if (input.startsWith("/start")) return reply("Write your rating (1–5) and review in one message. Example: 5 Loved the food. Sending it publishes the text anonymously on Rosa Nera. One review per account. Please leave out personal details.");
  const match = /^([1-5])\s+([\s\S]+)$/.exec(input);
  if (!match || !match[2].trim() || match[2].length > 1000)
    return reply("Send a number from 1 to 5, a space, then your review (up to 1,000 characters). Text only.");
  const result = await env.REVIEWS.prepare("INSERT OR IGNORE INTO reviews (id,rating,body) VALUES (?,?,?)")
    .bind(String(msg.from.id),Number(match[1]),match[2].trim()).run();
  return reply(result.meta.changes ? "Thank you! Your review is now published." : "Your account already has a published review.");
}

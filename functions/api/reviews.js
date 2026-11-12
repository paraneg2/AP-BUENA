export async function onRequestGet({env}) {
  const {results} = await env.REVIEWS.prepare(
    "SELECT rating, body, created FROM reviews ORDER BY created DESC, id DESC LIMIT 100"
  ).all();
  return Response.json(results, {headers:{"Cache-Control":"no-store"}});
}

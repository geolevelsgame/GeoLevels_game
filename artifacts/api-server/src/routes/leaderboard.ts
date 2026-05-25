import { Router, type IRouter } from "express";
import { db, leaderboardTable } from "@workspace/db";
import { insertLeaderboardSchema } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/leaderboard", async (req, res) => {
  try {
    const mode = (req.query.mode as string) || "classic";
    const region = (req.query.region as string) || "all";
    const daily_date = req.query.daily_date as string | undefined;

    const rows = await db
      .select()
      .from(leaderboardTable)
      .where(
        daily_date
          ? sql`${leaderboardTable.mode} = ${mode} AND ${leaderboardTable.dailyDate} = ${daily_date}`
          : sql`${leaderboardTable.mode} = ${mode} AND ${leaderboardTable.region} = ${region}`
      )
      .orderBy(desc(leaderboardTable.score))
      .limit(20);

    res.json({ entries: rows });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch leaderboard");
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.post("/leaderboard", async (req, res) => {
  try {
    const parsed = insertLeaderboardSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
      return;
    }

    const [inserted] = await db
      .insert(leaderboardTable)
      .values(parsed.data)
      .returning();

    res.status(201).json({ entry: inserted });
  } catch (err) {
    req.log.error({ err }, "Failed to submit leaderboard entry");
    res.status(500).json({ error: "Failed to submit score" });
  }
});

export default router;

import pool from "../db/connection.js";

const getUserByIdService = async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
};

const updateUserService = async (id, data) => {
    const allowList = ["name", "profile_picture_url", "preferred_workout_time"];
    const keys = Object.keys(data);

    const invalidKey = keys.find((key) => !allowList.includes(key));

    if (invalidKey) {
        console.log("Invalid update parameter: ${invalidKey}");
        throw new Error(`Invalid update parameter: ${invalidKey}`);
    }

    if (keys.length === 0) {
        console.log("No valid fields provided for update");
        throw new Error("No valid fields provided for update");
    }

    // building sql query
    const setClauses = [];
    const values = [];

    keys.forEach((key, index) => {
        setClauses.push(`${key} = $${index + 1}`);
        values.push(data[key]);
    });
    values.push(id);

    // Keys are valid, extract and query

    const query = `
        UPDATE users
        SET ${setClauses.join(", ")}
        WHERE id = $${values.length}
        RETURNING *;
    `;

    const result = await pool.query(query, values);

    return result.rows[0];
};

const getUserStatsService = async (userId) => {
    // Fetch all non-skipped session dates for the user, ordered descending
    const result = await pool.query(
        "SELECT date FROM sessions WHERE user_id = $1 AND is_skipped = false ORDER BY date DESC",
        [userId],
    );

    const dates = result.rows.map((row) => new Date(row.date));
    const now = new Date();

    // Normalize dates to midnight for accurate day comparison
    const normalizeDate = (d) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const msPerDay = 86400000;

    const todayStr = normalizeDate(now);

    // Total sessions
    const totalSessions = dates.length;

    // Monthly & Weekly
    let monthlySessions = 0;
    let weeklySessions = 0;

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // JS getDay(): 0 is Sunday. We want Monday=0, Sunday=6
    const currentDayOfWeek = (now.getDay() + 6) % 7;
    const startOfWeekTime = normalizeDate(
        new Date(now.getTime() - currentDayOfWeek * msPerDay),
    );

    dates.forEach((d) => {
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            monthlySessions++;
        }
        if (normalizeDate(d) >= startOfWeekTime) {
            weeklySessions++;
        }
    });

    // Streaks calculation (Schedule Streak)
    let currentStreak = 0;
    let bestStreak = 0;

    // 1. Get user's active split to determine rest days
    const activeSplitResult = await pool.query(
        `
        SELECT sd.day_of_week, sd.is_rest
        FROM splits s
        JOIN split_days sd ON sd.split_id = s.id
        WHERE s.user_id = $1 AND s.is_active = true
    `,
        [userId],
    );

    const restDaysOfWeek = new Set(
        activeSplitResult.rows
            .filter((r) => r.is_rest)
            .map((r) => r.day_of_week),
    );

    // Deduplicate dates in case there are multiple sessions on the same day
    const datesSet = new Set(dates.map((d) => normalizeDate(d)));
    const uniqueDates = Array.from(datesSet).sort((a, b) => a - b); // Ascending

    if (uniqueDates.length > 0) {
        const oldestDate = uniqueDates[0];
        let dTime = oldestDate;
        let tempStreak = 0;

        while (dTime <= todayStr) {
            const dateObj = new Date(dTime);
            const dbDayOfWeek = (dateObj.getDay() + 6) % 7;
            const isRest = restDaysOfWeek.has(dbDayOfWeek);
            const hasSession = datesSet.has(dTime);

            if (hasSession) {
                tempStreak++;
            } else if (isRest) {
                // Rest day: if a streak has started, we add it to the streak!
                // (or you could just freeze it without incrementing, but usually adherence = +1)
                if (tempStreak > 0) {
                    tempStreak++;
                }
            } else {
                // Missed training day
                if (dTime === todayStr) {
                    // Missing today doesn't break the streak until tomorrow
                } else {
                    if (tempStreak > bestStreak) bestStreak = tempStreak;
                    tempStreak = 0;
                }
            }

            // At the end of each day, update best
            if (tempStreak > bestStreak) bestStreak = tempStreak;

            dTime += msPerDay;
        }
        currentStreak = tempStreak;
    }

    return {
        totalSessions,
        monthlySessions,
        weeklySessions,
        currentStreak,
        bestStreak,
    };
};

export { getUserByIdService, updateUserService, getUserStatsService };

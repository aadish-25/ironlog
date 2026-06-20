import {
    updateUserService,
    getUserStatsService,
} from "../services/user.services.js";

async function getCurrentUser(req, res) {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    return res
        .status(200)
        .json({ message: "User retrieved successfully", data: user });
}

async function updateCurrentUser(req, res) {
    const user = req.user;
    const id = user?.id;
    const data = req.body;

    try {
        const result = await updateUserService(id, data);
        res.status(200).json({ message: "Updated successfully", data: result });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while updating information",
            error: error.message,
        });
    }
}

async function getUserStats(req, res) {
    const user = req.user;
    const id = user?.id;

    try {
        const stats = await getUserStatsService(id);
        res.status(200).json({
            message: "Stats retrieved successfully",
            data: stats,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while fetching stats",
            error: error.message,
        });
    }
}

export { getCurrentUser, updateCurrentUser, getUserStats };

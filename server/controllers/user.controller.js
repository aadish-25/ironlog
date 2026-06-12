import { updateUser } from "../services/user.services";

// / GET /users/me
async function getCurrentUser(req, res) {
    const user = req.user;
    return res.status(200).json({ current_user: user });
}

async function updateCurrentUser(req, res) {
    const user = req.user;
    const id = user?.id;
    const data = req.body;

    try {
        const result = await updateUser(id, data);
        res.status(200).json({ message: "Updated succesfully" });
    } catch (error) {
        res.status(400).json({
            message: "Error while updating information",
            error: error,
        });
    }

    return res.status(200).json({});
}

export { getCurrentUser, updateCurrentUser };

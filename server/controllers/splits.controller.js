import {
    createSplitWithDaysService,
    getSplitsByUserService,
    getSplitByIdService,
    updateSplitService,
    deleteSplitService,
    setActiveSplitService,
} from "../services/splits.services.js";

async function createSplit(req, res) {
    const user = req.user;
    const id = user?.id;
    const { name } = req.body;

    try {
        const result = await createSplitWithDaysService(id, name);
        res.status(200).json({
            message: "Split created succesfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while creating split",
            error: error,
        });
    }
}

async function getSplitsByUser(req, res) {
    const user = req.user;
    const id = user?.id;

    try {
        const result = await getSplitsByUserService(id);
        res.status(200).json({
            message: "Split fetched succesfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while fetching splits",
            error: error,
        });
    }
}

async function getSplitById(req, res) {
    const { id } = req.params;
    try {
        const result = await getSplitByIdService(id);
        if (!result) {
            return res.status(404).json({ message: "Split not found" });
        }
        res.status(200).json({
            message: "Split fetched successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while fetching split",
            error: error.message,
        });
    }
}

async function updateSplit(req, res) {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "name is required" });
    }

    try {
        const result = await updateSplitService(id, name);
        res.status(200).json({
            message: "Split updated successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while updating split",
            error: error.message,
        });
    }
}

async function deleteSplit(req, res) {
    const { id } = req.params;
    try {
        await deleteSplitService(id);
        res.status(200).json({ message: "Split deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while deleting split",
            error: error.message,
        });
    }
}

async function activateSplit(req, res) {
    const user = req.user;
    const { id } = req.params;
    try {
        const result = await setActiveSplitService(user.id, id);
        res.status(200).json({ message: "Split activated", data: result });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while activating split",
            error: error.message,
        });
    }
}

export {
    createSplit,
    getSplitsByUser,
    getSplitById,
    updateSplit,
    deleteSplit,
    activateSplit,
};

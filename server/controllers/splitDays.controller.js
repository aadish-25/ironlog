import { updateSplitDayService } from "../services/splitDays.services.js";

async function updateSplitDay(req, res) {
    const { id } = req.params;
    const { label, is_rest } = req.body;
    const userId = req.user.id;

    try {
        const result = await updateSplitDayService(id, label, is_rest, userId);
        res.status(200).json({
            message: "Split day renamed succesfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            message: "Error while renaming split day",
            error: error.message,
        });
    }
}

export { updateSplitDay };

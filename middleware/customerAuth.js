import { verifyCustomer } from "../utils/utils.js";

export const customerAuthMiddleWare = async (req, res, next) => {
    const user = await verifyCustomer(req, res);

    if (!user) {
        return res.status(401).json({
            loggedIn: false,
            message: "Unauthorized",
        });
    }

    req.customer = user;
    next();

};

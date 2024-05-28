import { verify, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

export default function (req, res, next) {
    if (!("authorization" in req.headers)) {
        res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
        return;
    }
    if (!req.headers.authorization.match(/^Bearer /)) {
        res.status(401).json({ error: true, message: "Authorization header is malformed" });
        return;
    }
    const token = req.headers.authorization.replace(/^Bearer /, "");
    try {
        req.user = verify(token, process.env.JWT_SECRET);
    } catch (e) {
        if (e instanceof TokenExpiredError) {
            res.status(401).json({ error: true, message: "JWT token has expired" });
        } else if (e instanceof JsonWebTokenError) {
            res.status(401).json({ error: true, message: "Invalid JWT token" });
        }
        return;
    }

    next();
};

// if (e.name === "TokenExpiredError") {
//     res.status(401).json({ error: true, message: "JWT token has expired" });
// } else {
//     res.status(401).json({ error: true, message: "Invalid JWT token" });
// }
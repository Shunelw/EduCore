import express from "express";
import cors from "cors";
// import helmet from "helmet";
import courseRoutes from "./routes/courseRoutes";
import sectionRoutes from "./routes/sectionRoutes";
import enrollmentRoutes from "./routes/enrollmentRoutes";
import authRoutes from "./routes/authRoutes";
import partnerRoutes from "./routes/partnerRoutes";
import semesterRoutes from "./routes/semesterRoutes";
import adminRoutes from "./routes/adminRoutes";
import { authenticate } from "./middleware/authMiddleware";

const app = express();

// app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "EduCore API is running",
    });
});

// app.get("/api/health", authenticate, (_req, res) => {
//     res.json({
//         success: true,
//         message: "EduCore API is running",
//     });
// });

export default app;
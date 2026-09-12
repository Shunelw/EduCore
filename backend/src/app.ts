import express from "express";
// import cors from "cors";
// import helmet from "helmet";
import courseRoutes from "./routes/courseRoutes";
import sectionRoutes from "./routes/sectionRoutes";
import enrollmentRoutes from "./routes/enrollmentRoutes";
import authRoutes from "./routes/authRoutes";

const app = express();

// app.use(helmet());
// app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/enrollments", enrollmentRoutes);

app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "EduCore API is running",
    });
});

export default app;
import multer from "multer";
import path from "path";
import fs from "fs";

const cvDir = path.join(__dirname, "../../uploads/cvs");
fs.mkdirSync(cvDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, cvDir);
  },
  filename: (_req, file, cb) => {
    const originalName = path.basename(file.originalname);
    const sanitized = originalName
      .normalize("NFC")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
      .trim();

    const fallbackName = `cv-${Date.now()}.pdf`;
    const safeName = sanitized || fallbackName;
    const extension = path.extname(safeName);
    const baseName = path.basename(safeName, extension);

    let candidateName = safeName;
    let suffix = 1;
    while (fs.existsSync(path.join(cvDir, candidateName))) {
      candidateName = `${baseName}-${suffix}${extension}`;
      suffix += 1;
    }

    cb(null, candidateName);
  },
});

export const uploadCv = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers PDF sont acceptes."));
    }
  },
});

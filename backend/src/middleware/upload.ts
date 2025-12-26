import multer from "multer"
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: (req: any, file: any, cb: any) => {
    const unique = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

export const upload = multer({ storage });

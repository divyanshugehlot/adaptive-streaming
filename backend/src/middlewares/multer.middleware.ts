import multer from "multer";

const upload = multer ({
    dest:"uploads/"
}); // mutler middleware

export default upload;
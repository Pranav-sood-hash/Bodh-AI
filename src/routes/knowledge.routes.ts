import { Router } from 'express';
import multer from 'multer';
import { uploadDocument, listDocuments, queryDocument, deleteDocument, getDocument, createArticle, updateArticle } from '../controllers/knowledge.controller';
import { authenticate } from '../middleware/auth.middleware';
import { ApiError } from '../utils/apiResponse';

const router = Router();

// Configure memory storage for documents
const storage = multer.memoryStorage();
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = /\.(pdf|txt|md|json|js|ts)$/i;
  const isAllowedExt = allowedExtensions.test(file.originalname);
  
  if (isAllowedExt) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Unsupported file format. Please upload PDF, TXT, MD, JSON, JS, or TS files.'));
  }
};

const uploadDoc = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for documents
});

router.use(authenticate);

router.post('/upload', uploadDoc.single('doc'), uploadDocument);
router.get('/list', listDocuments);
router.post('/article', createArticle);
router.put('/article/:docId', updateArticle);
router.get('/:docId', getDocument);
router.post('/:docId/query', queryDocument);
router.delete('/:docId', deleteDocument);

export default router;

import express from "express";
import {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
  receiveGoods,
  validateReceipt,
  cancelReceipt
} from "../controllers/receiptController.js";

const router = express.Router();

// CRUD
router.post("/create", createReceipt);
router.get("/", getAllReceipts);
router.get("/:id", getReceiptById);
router.put("/:id", updateReceipt);
router.delete("/:id", deleteReceipt);

// Domain actions
router.put("/:id/receive", receiveGoods);     // update receivedQty & optional locationId per item
router.post("/:id/validate", validateReceipt); // finalize & update stock
router.post("/:id/cancel", cancelReceipt);

export default router;
